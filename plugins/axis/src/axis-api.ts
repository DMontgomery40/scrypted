import { Logger } from '@scrypted/sdk';
import { authHttpFetch } from '@scrypted/common/src/http-auth-fetch';
import { checkStatus } from '../../../server/src/fetch';
import xml2js from 'xml2js';

interface AxisDeviceInfo {
    model: string;
    firmware: string;
    serial: string;
    mac: string;
}

export class AxisAPI {
    constructor(
        private address: string,
        private username: string,
        private password: string,
        private console: Logger
    ) { }

    private async request(options: {
        url: string;
        method?: string;
        responseType?: 'json' | 'text' | 'buffer';
        body?: any;
    }) {
        const response = await authHttpFetch({
            credential: {
                username: this.username,
                password: this.password,
            },
            url: options.url,
            method: options.method || 'GET',
            responseType: options.responseType || 'text',
            body: options.body,
            rejectUnauthorized: false,
        });

        checkStatus(response.statusCode);
        return response;
    }

    async getDeviceInfo(): Promise<AxisDeviceInfo> {
        // Query multiple VAPIX endpoints to gather device info
        const response = await this.request({
            url: `http://${this.address}/axis-cgi/param.cgi?action=list&group=root.Properties.System,root.Properties.API.HTTP.Version`,
            responseType: 'text',
        });

        const params = new Map();
        response.body.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                params.set(key.trim(), value.trim());
            }
        });

        // Verify VAPIX version support
        const vapixVersion = params.get('root.Properties.API.HTTP.Version');
        if (!vapixVersion || parseInt(vapixVersion) < 3) {
            throw new Error('Camera must support VAPIX API version 3 or higher');
        }

        return {
            model: params.get('root.Properties.System.ProductID'),
            firmware: params.get('root.Properties.System.Version'),
            serial: params.get('root.Properties.System.SerialNumber'),
            mac: params.get('root.Properties.System.SerialNumber')?.split('-').join('').toLowerCase(),
        };
    }

    async getSnapshot(): Promise<Buffer> {
        const response = await this.request({
            url: `http://${this.address}/axis-cgi/jpg/image.cgi`,
            responseType: 'buffer',
        });

        return response.body;
    }

    async sendPtzCommand(command: { pan?: number; tilt?: number; zoom?: number }): Promise<void> {
        // Convert -1 to 1 range to appropriate VAPIX commands
        const params = new URLSearchParams();

        if (command.pan !== undefined) {
            // Convert -1 to 1 range to -180 to 180 degrees
            const degrees = Math.round(command.pan * 180);
            params.set('pan', degrees.toString());
        }

        if (command.tilt !== undefined) {
            // Convert -1 to 1 range to -180 to 180 degrees
            const degrees = Math.round(command.tilt * 180);
            params.set('tilt', degrees.toString());
        }

        if (command.zoom !== undefined) {
            // Convert 0 to 1 range to 1 to 9999
            const zoomValue = Math.round(1 + (command.zoom * 9998));
            params.set('zoom', zoomValue.toString());
        }

        await this.request({
            url: `http://${this.address}/axis-cgi/com/ptz.cgi?${params.toString()}`,
        });
    }

    async listenEvents() {
        // TODO: Implement motion detection events using appropriate VAPIX endpoint
        // This will require implementing event subscription based on camera model/capabilities
        this.console.warn('Event listening not yet implemented');
    }
}