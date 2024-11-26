import sdk, { Camera, DeviceCreatorSettings, DeviceInformation, FFmpegInput, Intercom, MediaObject, MediaStreamOptions, ObjectsDetected, PanTiltZoom, RequestPictureOptions, ScryptedDeviceType, ScryptedInterface, Setting, Settings, MediaStreamDestination } from '@scrypted/sdk';
import { RtspProvider, RtspSmartCamera, UrlMediaStreamOptions } from '../../rtsp/src/rtsp';
import { AxisAPI } from './axis-api';
import { OnvifIntercom } from '../../onvif/src/onvif-intercom';
import { startRtpForwarderProcess } from '../../webrtc/src/rtp-forwarders';
import { PassThrough } from 'stream';

const { mediaManager } = sdk;

export class AxisCamera extends RtspSmartCamera implements Camera, Settings, PanTiltZoom, Intercom {
    api: AxisAPI;
    onvifIntercom = new OnvifIntercom(this);
    activeIntercom: Awaited<ReturnType<typeof startRtpForwarderProcess>>;
    detectedStreams: Promise<Map<string, MediaStreamOptions>>;

    constructor(nativeId: string, provider: RtspProvider) {
        super(nativeId, provider);
        this.api = new AxisAPI(this.getHttpAddress(), this.getUsername(), this.getPassword(), this.console);
        this.updateDevice();
        this.listenEvents();
    }

    async updateDeviceInfo() {
        const ip = this.storage.getItem('ip');
        if (!ip)
            return;

        const info: DeviceInformation = {
            ...this.info,
            ip,
            manufacturer: 'Axis',
            managementUrl: `http://${ip}`,
        };

        try {
            const deviceInfo = await this.api.getDeviceInfo();
            info.model = deviceInfo.model;
            info.firmware = deviceInfo.firmware;
            info.serialNumber = deviceInfo.serial;
            info.mac = deviceInfo.mac;

            // Check for capabilities
            const capabilities = await this.api.getCapabilities();
            if (capabilities.ptz) {
                this.storage.setItem('ptz', 'true');
            }
            if (capabilities.audio) {
                this.storage.setItem('twoWayAudio', 'true');
            }
        }
        catch (e) {
            this.console.error('Error updating device info:', e);
        }

        this.info = info;
    }

    async getOtherSettings(): Promise<Setting[]> {
        const settings = await super.getOtherSettings();

        const hasPtz = this.storage.getItem('ptz') === 'true';
        const hasAudio = this.storage.getItem('twoWayAudio') === 'true';

        return [
            ...settings,
            {
                title: 'Pan/Tilt/Zoom',
                key: 'ptz',
                type: 'boolean',
                value: hasPtz,
                description: 'Enable if this is a PTZ camera',
                readonly: true,
            },
            {
                title: 'Two Way Audio',
                key: 'twoWayAudio',
                type: 'string',
                choices: ['None', 'ONVIF', 'VAPIX'],
                value: hasAudio ? 'VAPIX' : 'None',
                description: 'Audio transmission method',
            },
            {
                title: 'Motion Detection Method',
                key: 'motionDetection',
                type: 'string',
                choices: ['VAPIX', 'ONVIF'],
                value: this.storage.getItem('motionDetection') || 'VAPIX',
                description: 'Method used for motion detection events',
            }
        ];
    }

    async putSetting(key: string, value: string) {
        super.putSetting(key, value);
        this.updateDevice();
        this.updateDeviceInfo();
    }

    updateDevice() {
        const interfaces = this.provider.getInterfaces();
        const isPtz = this.storage.getItem('ptz') === 'true';
        const twoWayAudio = this.storage.getItem('twoWayAudio');

        if (isPtz) {
            interfaces.push(ScryptedInterface.PanTiltZoom);
        }

        if (twoWayAudio !== 'None') {
            interfaces.push(ScryptedInterface.Intercom);
        }

        this.provider.updateDevice(this.nativeId, this.name, interfaces);
    }

    async takeSmartCameraPicture(options?: RequestPictureOptions): Promise<MediaObject> {
        return mediaManager.createMediaObject(await this.api.getSnapshot(), 'image/jpeg');
    }

    async getConstructedVideoStreamOptions(): Promise<UrlMediaStreamOptions[]> {
        if (!this.detectedStreams) {
            this.detectedStreams = this.api.getStreamProfiles();
        }

        const streams = await this.detectedStreams;
        const username = this.getUsername();
        const password = this.getPassword();

        const ret: UrlMediaStreamOptions[] = [];
        let index = 0;

        for (const [id, stream] of streams) {
            const params = new URLSearchParams({
                ...stream,
                resolution: `${stream.video.width}x${stream.video.height}`,
                fps: stream.video.fps?.toString() || '30',
            });

            const url = `rtsp://${username}:${password}@${this.getRtspAddress()}/axis-media/media.amp?${params}`;            
            const mso = this.createRtspMediaStreamOptions(url, index++);
            Object.assign(mso.video, stream.video);
            mso.id = id;
            ret.push(mso);
        }

        return ret;
    }

    async ptzCommand(command: { pan?: number; tilt?: number; zoom?: number }): Promise<void> {
        if (!this.storage.getItem('ptz'))
            throw new Error('PTZ not enabled for this camera');

        await this.api.sendPtzCommand(command);
    }

    // Two way audio implementation
    async startIntercom(media: MediaObject): Promise<void> {
        const twoWayAudio = this.storage.getItem('twoWayAudio');
        
        if (twoWayAudio === 'ONVIF') {
            this.activeIntercom?.kill();
            this.activeIntercom = undefined;
            const options = await this.getConstructedVideoStreamOptions();
            const stream = options[0];
            this.onvifIntercom.url = stream.url;
            return this.onvifIntercom.startIntercom(media);
        }
        
        if (twoWayAudio === 'VAPIX') {
            return this.api.startAudioStream(media);
        }

        throw new Error('Two way audio not enabled');
    }

    async stopIntercom(): Promise<void> {
        const twoWayAudio = this.storage.getItem('twoWayAudio');

        if (twoWayAudio === 'ONVIF') {
            return this.onvifIntercom.stopIntercom();
        }

        if (twoWayAudio === 'VAPIX') {
            return this.api.stopAudioStream();
        }
    }

    async listenEvents() {
        const motionMethod = this.storage.getItem('motionDetection') || 'VAPIX';
        
        if (motionMethod === 'VAPIX') {
            const events = await this.api.subscribeToEvents();
            events.on('motion', (active: boolean) => {
                this.motionDetected = active;
            });

            events.on('error', (error: Error) => {
                this.console.error('Event subscription error:', error);
                // Attempt to reconnect after delay
                setTimeout(() => this.listenEvents(), 30000);
            });
        } else {
            // TODO: Implement ONVIF events
            this.console.warn('ONVIF motion detection not yet implemented');
        }
    }

    // Don't show RTSP URL override since we use standard VAPIX URLs
    showRtspUrlOverride() {
        return false;
    }
}

export default class AxisProvider extends RtspProvider {
    getAdditionalInterfaces() {
        return [
            ScryptedInterface.Camera,
            ScryptedInterface.MotionSensor,
            ScryptedInterface.PanTiltZoom,
            ScryptedInterface.Intercom,
        ];
    }

    createCamera(nativeId: string) {
        return new AxisCamera(nativeId, this);
    }

    async getCreateDeviceSettings(): Promise<Setting[]> {
        return [
            {
                key: 'username',
                title: 'Username',
                type: 'string',
            },
            {
                key: 'password',
                title: 'Password',
                type: 'password',
            },
            {
                key: 'ip',
                title: 'IP Address',
                placeholder: '192.168.1.100',
            },
            {
                key: 'httpPort',
                title: 'HTTP Port',
                description: 'Optional: Override the HTTP Port (default: 80)',
                placeholder: '80',
            },
            {
                key: 'skipValidate',
                title: 'Skip Validation',
                description: 'Add the device without verifying credentials and network settings',
                type: 'boolean',
            },
        ];
    }

    async createDevice(settings: DeviceCreatorSettings, nativeId?: string): Promise<string> {
        const httpAddress = `${settings.ip}:${settings.httpPort || 80}`;
        let info: DeviceInformation = {};

        const username = settings.username?.toString();
        const password = settings.password?.toString();
        const skipValidate = settings.skipValidate?.toString() === 'true';

        if (!skipValidate) {
            try {
                const api = new AxisAPI(httpAddress, username, password, this.console);
                const deviceInfo = await api.getDeviceInfo();
                const capabilities = await api.getCapabilities();

                settings.newCamera = deviceInfo.model;
                info.model = deviceInfo.model;
                info.mac = deviceInfo.mac;
                info.firmware = deviceInfo.firmware;
                info.serialNumber = deviceInfo.serial;

                // Store capabilities
                if (capabilities.ptz) {
                    this.storage?.setItem('ptz', 'true');
                }
                if (capabilities.audio) {
                    this.storage?.setItem('twoWayAudio', 'VAPIX');
                }
            }
            catch (e) {
                this.console.error('Error adding Axis camera', e);
                throw e;
            }
        }

        settings.newCamera ||= 'Axis Camera';
        nativeId = await super.createDevice(settings, nativeId);

        const device = await this.getDevice(nativeId) as AxisCamera;
        device.info = info;
        device.putSetting('username', username);
        device.putSetting('password', password);
        device.setIPAddress(settings.ip?.toString());
        device.setHttpPortOverride(settings.httpPort?.toString());
        device.updateDeviceInfo();

        return nativeId;
    }
}