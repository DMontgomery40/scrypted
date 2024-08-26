import sdk, { Camera, DeviceCreator, DeviceCreatorSettings, DeviceProvider, MediaObject, ScryptedDeviceType, ScryptedInterface, Setting } from "@scrypted/sdk";
import { RtspProvider, RtspSmartCamera } from "../../rtsp/src/rtsp";
import { AxisAPI } from "./axis-api";

const { mediaManager } = sdk;

class AxisCamera extends RtspSmartCamera implements Camera {
    api: AxisAPI;

    constructor(nativeId: string, provider: AxisProvider) {
        super(nativeId, provider);
        this.api = new AxisAPI(this.getHttpAddress(), this.getUsername(), this.getPassword(), this.console);
        this.updateDevice();
        this.listenEvents();
    }

    getHttpAddress(): string {
        return this.storage.getItem('ip') || '';
    }

    getUsername(): string {
        return this.storage.getItem('username') || '';
    }

    getPassword(): string {
        return this.storage.getItem('password') || '';
    }

    async updateDevice() {
        const interfaces = [
            ScryptedInterface.VideoCamera,
            ScryptedInterface.Camera,
            ScryptedInterface.MotionSensor,
        ];
        
        this.provider.updateDevice(this.nativeId, this.name, interfaces, ScryptedDeviceType.Camera);
    }

    async getVideoStreamOptions() {
        try {
            const streamOptions = await this.api.getVideoStreamOptions();
            return streamOptions.map(option => ({
                ...option,
                url: `rtsp://${this.getUsername()}:${this.getPassword()}@${this.getHttpAddress()}${option.path}`,
                tool: 'ffmpeg',
            }));
        } catch (error) {
            this.console.error('Error getting video stream options:', error);
            return [];
        }
    }

    async listenEvents() {
        try {
            const events = await this.api.subscribeToEvents();
            events.on('MotionDetected', (active: boolean) => {
                this.motionDetected = active;
            });
        } catch (error) {
            this.console.error('Error subscribing to events:', error);
        }
    }

    async takePicture(): Promise<MediaObject> {
        try {
            const imageBuffer = await this.api.takeSnapshot();
            return mediaManager.createMediaObject(imageBuffer, 'image/jpeg');
        } catch (error) {
            this.console.error('Error taking picture:', error);
            throw error;
        }
    }

    getPictureOptions() {
        return null;
    }
}

class AxisProvider extends RtspProvider implements DeviceProvider, DeviceCreator {
    getAdditionalInterfaces() {
        return [
            ScryptedInterface.VideoCamera,
            ScryptedInterface.Camera,
            ScryptedInterface.MotionSensor,
        ];
    }

    createCamera(nativeId: string) {
        return new AxisCamera(nativeId, this);
    }

    async createDevice(settings: DeviceCreatorSettings): Promise<string> {
        const { ip, username, password } = settings;
        
        try {
            const api = new AxisAPI(ip as string, username as string, password as string, this.console);
            const deviceInfo = await api.getDeviceInfo();
            
            const nativeId = await super.createDevice(settings);
            const camera = await this.getDevice(nativeId) as AxisCamera;
            camera.putSetting('username', username);
            camera.putSetting('password', password);
            camera.putSetting('ip', ip as string);

            camera.info = {
                model: deviceInfo.model,
                manufacturer: 'Axis',
                firmware: deviceInfo.firmware,
                serialNumber: deviceInfo.serialNumber,
            };

            return nativeId;
        } catch (error) {
            this.console.error('Error creating Axis camera device:', error);
            throw error;
        }
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
                type: 'string',
            },
        ];
    }
}

export default AxisProvider;