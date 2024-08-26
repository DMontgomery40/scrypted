import { AxiosRequestConfig } from 'axios';
import { AuthFetchCredentialState, AuthFetchOptions, HttpFetchOptions, authHttpFetch } from '@scrypted/common/src/http-auth-fetch';
import { EventEmitter } from 'events';
import sdk, { MediaObject } from '@scrypted/sdk';
import { Readable } from 'node:stream';

const { mediaManager } = sdk;

export class AxisAPI {
    credential: AuthFetchCredentialState;

    constructor(public ip: string, username: string, password: string, public console: Console) {
        this.credential = {
            username,
            password,
        };
    }

    async request(config: AxiosRequestConfig) {
        const response = await authHttpFetch({
            ...config,
            rejectUnauthorized: false,
            credential: this.credential,
        } as HttpFetchOptions<Readable> & AuthFetchOptions); // add this cast
        return response;
    }

    async getDeviceInfo() {
        const response = await this.request({
            url: `http://${this.ip}/axis-cgi/param.cgi?action=list&group=root.Properties`,
            responseType: 'text',
        });

        const lines = response.body.split('\n');
        const info: any = {};
        lines.forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                info[key.trim()] = value.trim();
            }
        });

        return {
            model: info['root.Properties.System.HardwareID'],
            firmware: info['root.Properties.Firmware.Version'],
            serialNumber: info['root.Properties.System.SerialNumber'],
        };
    }

    async getVideoStreamOptions() {
        const response = await this.request({
            url: `http://${this.ip}/axis-cgi/param.cgi?action=list&group=root.StreamProfile`,
            responseType: 'text',
        });

        const lines = response.body.split('\n');
        const streamProfiles: any = {};
        lines.forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                const [group, profile, param] = key.split('.');
                if (!streamProfiles[profile]) {
                    streamProfiles[profile] = {};
                }
                streamProfiles[profile][param] = value.trim();
            }
        });

        return Object.entries(streamProfiles).map(([profile, params]: [string, any]) => ({
            id: profile,
            name: params.Name || profile,
            url: null, // Will be set in the AxisCamera class
            path: `/axis-media/media.amp?streamprofile=${profile}`,
            video: {
                codec: params.VideoEncoder || 'h264',
                width: parseInt(params.Resolution.split('x')[0]),
                height: parseInt(params.Resolution.split('x')[1]),
            },
            audio: params.AudioEncoder ? {
                codec: params.AudioEncoder,
            } : undefined,
        }));
    }

    async subscribeToEvents(): Promise<EventEmitter> {
        const eventEmitter = new EventEmitter();
        
        const response = await this.request({
            url: `http://${this.ip}/axis-cgi/event/oneevent.cgi`,
            responseType: 'stream',
        });

        const stream = response.body;
        stream.on('data', (chunk: Buffer) => {
            const data = chunk.toString();
            if (data.includes('MotionDetection')) {
                const active = data.includes('active=yes');
                eventEmitter.emit('MotionDetected', active);
            }
        });

        return eventEmitter;
    }

    async takeSnapshot(): Promise<Buffer> {
        const response = await this.request({
            url: `http://${this.ip}/axis-cgi/jpg/image.cgi`,
            responseType: 'arraybuffer',
        });
        return Buffer.from(response.body);
    }
}