import { ffmpegLogInitialOutput } from '@scrypted/common/src/media-helpers';
import sdk, { Camera, DeviceCreatorSettings, DeviceInformation, FFmpegInput, Intercom, Lock, MediaObject, MediaStreamOptions, ObjectDetectionTypes, ObjectDetector, ObjectsDetected, Reboot, RequestPictureOptions, RequestRecordingStreamOptions, ResponseMediaStreamOptions, ScryptedDeviceType, ScryptedInterface, ScryptedMimeTypes, Setting, VideoCameraConfiguration, VideoRecorder } from "@scrypted/sdk";
import { readLength } from "@scrypted/common/src/read-stream";
import child_process, { ChildProcess } from 'child_process';
import { PassThrough, Readable, Stream } from "stream";
import { OnvifIntercom } from "../../onvif/src/onvif-intercom";
import { RtspProvider, RtspSmartCamera, UrlMediaStreamOptions } from "../../rtsp/src/rtsp";
import { AxisAPI } from "./axis-api";

const { mediaManager } = sdk;

class AxisCamera extends RtspSmartCamera implements VideoCameraConfiguration, Camera, Intercom,  VideoRecorder, Reboot, ObjectDetector {
    api: AxisAPI;
    eventStream: Stream;
    cp: ChildProcess;
    videoStreamOptions: Promise<UrlMediaStreamOptions[]>;
    onvifIntercom = new OnvifIntercom(this);
    hasSmartDetection: boolean;

    constructor(nativeId: string, provider: AxisProvider) {
        super(nativeId, provider);
        this.api = new AxisAPI(this.getHttpAddress(), this.getUsername(), this.getPassword(), this.console);
        this.onvifIntercom = new OnvifIntercom(this);
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
            ScryptedInterface.Intercom,
        ];
        
        this.provider.updateDevice(this.nativeId, this.name, interfaces, ScryptedDeviceType.Camera);
    }

    async getRecordingsStreamOptions() {
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
        let motionTimeout: NodeJS.Timeout;
        const motionTimeoutDuration = 20000;
    
        const resetMotionTimeout = () => {
            clearTimeout(motionTimeout);
            motionTimeout = setTimeout(() => {
                this.motionDetected = false;
            }, motionTimeoutDuration);
        }
    
        try {
            const events = await this.api.subscribeToEvents();
    
            events.on('MotionDetection', (active: boolean) => {
                this.motionDetected = active;
                if (active) {
                    resetMotionTimeout();
                }
            });
    
            events.on('AudioDetection', (active: boolean) => {
                this.audioDetected = active;
            });
    
            events.on('PIR', (active: boolean) => {
                // Assuming PIR is used for motion detection as well
                this.motionDetected = active;
                if (active) {
                    resetMotionTimeout();
                }
            });
    
            events.on('DayNightVision', (isNight: boolean) => {
                // You might want to store this information or trigger some action
                this.storage.setItem('isNightVision', isNight.toString());
            });
    
            events.on('TamperingDetection', (active: boolean) => {
                // You might want to trigger an alert or store this information
                this.storage.setItem('isTampered', active.toString());
            });
    
            events.on('ObjectDetection', (data: any) => {
                if (!this.hasSmartDetection) {
                    this.hasSmartDetection = true;
                    this.storage.setItem('hasSmartDetection', 'true');
                    this.updateDevice();
                }
    
                const detected: ObjectsDetected = {
                    timestamp: Date.now(),
                    detections: [
                        {
                            score: data.probability || 1,
                            className: data.objectType || 'unknown',
                            boundingBox: data.boundingBox ? [
                                data.boundingBox.left,
                                data.boundingBox.top,
                                data.boundingBox.width,
                                data.boundingBox.height
                            ] : undefined
                        }
                    ],
                };
    
                this.onDeviceEvent(ScryptedInterface.ObjectDetector, detected);
            });
    
            // Add more event listeners as needed for other Axis-specific events
    
        } catch (error) {
            this.console.error('Error in listenEvents:', error);
        }
    }
    
    async getDetectionInput(detectionId: string, eventId?: any): Promise<MediaObject> {
        // Axis cameras might not provide a way to get the specific frame of detection
        // Instead, we can return the current snapshot
        try {
            const imageBuffer = await this.api.takeSnapshot();
            return mediaManager.createMediaObject(imageBuffer, 'image/jpeg');
        } catch (error) {
            this.console.error('Error getting detection input:', error);
            return undefined;
        }
    }
    
    async getObjectTypes(): Promise<ObjectDetectionTypes> {
        return {
            classes: [
                'person',
                'vehicle',
                'animal',
                'face',
                // Add more object types that Axis cameras can detect
            ],
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

    async startIntercom(media: MediaObject): Promise<void> {
        try {
            await this.api.startIntercom(media);
        } catch (error) {
            this.console.error('Error starting intercom with VAPIX, falling back to ONVIF:', error);
            return this.onvifIntercom.startIntercom(media);
        }
    }

    async stopIntercom(): Promise<void> {
        try {
            await this.api.stopIntercom();
        } catch (error) {
            this.console.error('Error stopping intercom with VAPIX, falling back to ONVIF:', error);
            return this.onvifIntercom.stopIntercom();
        }
    }
}

class AxisProvider extends RtspProvider {
    getAdditionalInterfaces() {
        return [
            ScryptedInterface.VideoCamera,
            ScryptedInterface.Camera,
            ScryptedInterface.MotionSensor,
            ScryptedInterface.Intercom,
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