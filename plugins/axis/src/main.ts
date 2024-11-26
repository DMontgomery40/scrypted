import sdk, { Camera, DeviceCreatorSettings, DeviceInformation, FFmpegInput, Intercom, MediaObject, MediaStreamOptions, ObjectsDetected, PanTiltZoom, RequestPictureOptions, ScryptedDeviceType, ScryptedInterface, Setting, Settings } from '@scrypted/sdk';
import { RtspProvider, RtspSmartCamera, UrlMediaStreamOptions } from '../../rtsp/src/rtsp';
import { AxisAPI } from './axis-api';

const { mediaManager } = sdk;

export class AxisCamera extends RtspSmartCamera implements Camera, Settings, PanTiltZoom {
    api: AxisAPI;

    constructor(nativeId: string, provider: RtspProvider) {
        super(nativeId, provider);
        this.api = new AxisAPI(this.getHttpAddress(), this.getUsername(), this.getPassword(), this.console);
        this.updateDevice();
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
        }
        catch (e) {
            this.console.error('Error updating device info:', e);
        }

        this.info = info;
    }

    async getOtherSettings(): Promise<Setting[]> {
        const settings = await super.getOtherSettings();
        return [
            ...settings,
            {
                title: 'Pan/Tilt/Zoom',
                key: 'ptz',
                type: 'boolean',
                value: this.storage.getItem('ptz') === 'true',
                description: 'Enable if this is a PTZ camera',
            },
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

        if (isPtz) {
            interfaces.push(ScryptedInterface.PanTiltZoom);
        }

        this.provider.updateDevice(this.nativeId, this.name, interfaces);
    }

    async takeSmartCameraPicture(options?: RequestPictureOptions): Promise<MediaObject> {
        return mediaManager.createMediaObject(await this.api.getSnapshot(), 'image/jpeg');
    }

    async getConstructedVideoStreamOptions(): Promise<UrlMediaStreamOptions[]> {
        const username = this.getUsername();
        const password = this.getPassword();

        const params = new URLSearchParams({
            resolution: '1920x1080',
            fps: '30',
            compression: '30',
        });

        // The standard VAPIX RTSP URL format for Axis cameras
        const baseUrl = `rtsp://${username}:${password}@${this.getRtspAddress()}/axis-media/media.amp`;

        return [
            this.createRtspMediaStreamOptions(`${baseUrl}?${params}`, 0),
        ];
    }

    async ptzCommand(command: { pan?: number; tilt?: number; zoom?: number }): Promise<void> {
        if (!this.storage.getItem('ptz'))
            throw new Error('PTZ not enabled for this camera');

        await this.api.sendPtzCommand(command);
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

                settings.newCamera = deviceInfo.model;
                info.model = deviceInfo.model;
                info.mac = deviceInfo.mac;
                info.firmware = deviceInfo.firmware;
                info.serialNumber = deviceInfo.serial;
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