/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "../../../node_modules/@scrypted/sdk/dist/src/index.js":
/*!*************************************************************!*\
  !*** ../../../node_modules/@scrypted/sdk/dist/src/index.js ***!
  \*************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.sdk = exports.MixinDeviceBase = exports.ScryptedDeviceBase = void 0;
__exportStar(__webpack_require__(/*! ../types/gen/index */ "../../../node_modules/@scrypted/sdk/dist/types/gen/index.js"), exports);
const index_1 = __webpack_require__(/*! ../types/gen/index */ "../../../node_modules/@scrypted/sdk/dist/types/gen/index.js");
/**
 * @category Core Reference
 */
class ScryptedDeviceBase extends index_1.DeviceBase {
    constructor(nativeId) {
        super();
        this.nativeId = nativeId;
    }
    get storage() {
        if (!this._storage) {
            this._storage = deviceManager.getDeviceStorage(this.nativeId);
        }
        return this._storage;
    }
    get log() {
        if (!this._log) {
            this._log = deviceManager.getDeviceLogger(this.nativeId);
        }
        return this._log;
    }
    get console() {
        if (!this._console) {
            this._console = deviceManager.getDeviceConsole(this.nativeId);
        }
        return this._console;
    }
    async createMediaObject(data, mimeType) {
        return mediaManager.createMediaObject(data, mimeType, {
            sourceId: this.id,
        });
    }
    getMediaObjectConsole(mediaObject) {
        if (typeof mediaObject.sourceId !== 'string')
            return this.console;
        return deviceManager.getMixinConsole(mediaObject.sourceId, this.nativeId);
    }
    _lazyLoadDeviceState() {
        if (!this._deviceState) {
            if (this.nativeId) {
                this._deviceState = deviceManager.getDeviceState(this.nativeId);
            }
            else {
                this._deviceState = deviceManager.getDeviceState();
            }
        }
    }
    /**
     * Fire an event for this device.
     */
    onDeviceEvent(eventInterface, eventData) {
        return deviceManager.onDeviceEvent(this.nativeId, eventInterface, eventData);
    }
}
exports.ScryptedDeviceBase = ScryptedDeviceBase;
/**
 * @category Mixin Reference
 */
class MixinDeviceBase extends index_1.DeviceBase {
    constructor(options) {
        super();
        this._listeners = new Set();
        this.nativeId = systemManager.getDeviceById(this.id)?.nativeId;
        this.mixinDevice = options.mixinDevice;
        this.mixinDeviceInterfaces = options.mixinDeviceInterfaces;
        this.mixinStorageSuffix = options.mixinStorageSuffix;
        this._deviceState = options.mixinDeviceState;
        // 8-11-2022
        // RpcProxy will trap all properties, and the following check/hack will determine
        // if the device state came from another node worker thread.
        // This should ultimately be removed at some point in the future.
        if (this._deviceState.__rpcproxy_traps_all_properties && deviceManager.createDeviceState && typeof this._deviceState.id === 'string') {
            this._deviceState = deviceManager.createDeviceState(this._deviceState.id, this._deviceState.setState);
        }
        this.mixinProviderNativeId = options.mixinProviderNativeId;
    }
    get storage() {
        if (!this._storage) {
            const mixinStorageSuffix = this.mixinStorageSuffix;
            const mixinStorageKey = this.id + (mixinStorageSuffix ? ':' + mixinStorageSuffix : '');
            this._storage = deviceManager.getMixinStorage(mixinStorageKey, this.mixinProviderNativeId);
        }
        return this._storage;
    }
    get console() {
        if (!this._console) {
            if (deviceManager.getMixinConsole)
                this._console = deviceManager.getMixinConsole(this.id, this.mixinProviderNativeId);
            else
                this._console = deviceManager.getDeviceConsole(this.mixinProviderNativeId);
        }
        return this._console;
    }
    async createMediaObject(data, mimeType) {
        return mediaManager.createMediaObject(data, mimeType, {
            sourceId: this.id,
        });
    }
    getMediaObjectConsole(mediaObject) {
        if (typeof mediaObject.sourceId !== 'string')
            return this.console;
        return deviceManager.getMixinConsole(mediaObject.sourceId, this.mixinProviderNativeId);
    }
    /**
     * Fire an event for this device.
     */
    onDeviceEvent(eventInterface, eventData) {
        return deviceManager.onMixinEvent(this.id, this, eventInterface, eventData);
    }
    _lazyLoadDeviceState() {
    }
    manageListener(listener) {
        this._listeners.add(listener);
    }
    release() {
        for (const l of this._listeners) {
            l.removeListener();
        }
    }
}
exports.MixinDeviceBase = MixinDeviceBase;
(function () {
    function _createGetState(state) {
        return function () {
            this._lazyLoadDeviceState();
            return this._deviceState?.[state];
        };
    }
    function _createSetState(state) {
        return function (value) {
            this._lazyLoadDeviceState();
            if (!this._deviceState)
                console.warn('device state is unavailable. the device must be discovered with deviceManager.onDeviceDiscovered or deviceManager.onDevicesChanged before the state can be set.');
            else
                this._deviceState[state] = value;
        };
    }
    for (const field of Object.values(index_1.ScryptedInterfaceProperty)) {
        if (field === index_1.ScryptedInterfaceProperty.nativeId)
            continue;
        Object.defineProperty(ScryptedDeviceBase.prototype, field, {
            set: _createSetState(field),
            get: _createGetState(field),
        });
        Object.defineProperty(MixinDeviceBase.prototype, field, {
            set: _createSetState(field),
            get: _createGetState(field),
        });
    }
})();
exports.sdk = {};
try {
    let runtimeAPI;
    try {
        runtimeAPI = pluginRuntimeAPI;
    }
    catch (e) {
    }
    Object.assign(exports.sdk, {
        log: deviceManager.getDeviceLogger(undefined),
        deviceManager,
        endpointManager,
        mediaManager,
        systemManager,
        pluginHostAPI,
        ...runtimeAPI,
    });
    try {
        systemManager.setScryptedInterfaceDescriptors?.(index_1.TYPES_VERSION, index_1.ScryptedInterfaceDescriptors)?.catch(() => { });
    }
    catch (e) {
    }
}
catch (e) {
    console.error('sdk initialization error, import @scrypted/types or use @scrypted/client instead', e);
}
exports["default"] = exports.sdk;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../../../node_modules/@scrypted/sdk/dist/types/gen/index.js":
/*!*******************************************************************!*\
  !*** ../../../node_modules/@scrypted/sdk/dist/types/gen/index.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ScryptedMimeTypes = exports.ScryptedInterface = exports.MediaPlayerState = exports.SecuritySystemObstruction = exports.SecuritySystemMode = exports.AirQuality = exports.AirPurifierMode = exports.AirPurifierStatus = exports.ChargeState = exports.LockState = exports.PanTiltZoomMovement = exports.ThermostatMode = exports.TemperatureUnit = exports.FanMode = exports.HumidityMode = exports.ScryptedDeviceType = exports.ScryptedInterfaceDescriptors = exports.ScryptedInterfaceMethod = exports.ScryptedInterfaceProperty = exports.DeviceBase = exports.TYPES_VERSION = void 0;
exports.TYPES_VERSION = "0.3.10";
class DeviceBase {
}
exports.DeviceBase = DeviceBase;
var ScryptedInterfaceProperty;
(function (ScryptedInterfaceProperty) {
    ScryptedInterfaceProperty["id"] = "id";
    ScryptedInterfaceProperty["info"] = "info";
    ScryptedInterfaceProperty["interfaces"] = "interfaces";
    ScryptedInterfaceProperty["mixins"] = "mixins";
    ScryptedInterfaceProperty["name"] = "name";
    ScryptedInterfaceProperty["nativeId"] = "nativeId";
    ScryptedInterfaceProperty["pluginId"] = "pluginId";
    ScryptedInterfaceProperty["providedInterfaces"] = "providedInterfaces";
    ScryptedInterfaceProperty["providedName"] = "providedName";
    ScryptedInterfaceProperty["providedRoom"] = "providedRoom";
    ScryptedInterfaceProperty["providedType"] = "providedType";
    ScryptedInterfaceProperty["providerId"] = "providerId";
    ScryptedInterfaceProperty["room"] = "room";
    ScryptedInterfaceProperty["type"] = "type";
    ScryptedInterfaceProperty["on"] = "on";
    ScryptedInterfaceProperty["brightness"] = "brightness";
    ScryptedInterfaceProperty["colorTemperature"] = "colorTemperature";
    ScryptedInterfaceProperty["rgb"] = "rgb";
    ScryptedInterfaceProperty["hsv"] = "hsv";
    ScryptedInterfaceProperty["running"] = "running";
    ScryptedInterfaceProperty["paused"] = "paused";
    ScryptedInterfaceProperty["docked"] = "docked";
    ScryptedInterfaceProperty["temperatureSetting"] = "temperatureSetting";
    ScryptedInterfaceProperty["thermostatActiveMode"] = "thermostatActiveMode";
    ScryptedInterfaceProperty["thermostatAvailableModes"] = "thermostatAvailableModes";
    ScryptedInterfaceProperty["thermostatMode"] = "thermostatMode";
    ScryptedInterfaceProperty["thermostatSetpoint"] = "thermostatSetpoint";
    ScryptedInterfaceProperty["thermostatSetpointHigh"] = "thermostatSetpointHigh";
    ScryptedInterfaceProperty["thermostatSetpointLow"] = "thermostatSetpointLow";
    ScryptedInterfaceProperty["temperature"] = "temperature";
    ScryptedInterfaceProperty["temperatureUnit"] = "temperatureUnit";
    ScryptedInterfaceProperty["humidity"] = "humidity";
    ScryptedInterfaceProperty["recordingActive"] = "recordingActive";
    ScryptedInterfaceProperty["ptzCapabilities"] = "ptzCapabilities";
    ScryptedInterfaceProperty["lockState"] = "lockState";
    ScryptedInterfaceProperty["entryOpen"] = "entryOpen";
    ScryptedInterfaceProperty["batteryLevel"] = "batteryLevel";
    ScryptedInterfaceProperty["chargeState"] = "chargeState";
    ScryptedInterfaceProperty["online"] = "online";
    ScryptedInterfaceProperty["fromMimeType"] = "fromMimeType";
    ScryptedInterfaceProperty["toMimeType"] = "toMimeType";
    ScryptedInterfaceProperty["binaryState"] = "binaryState";
    ScryptedInterfaceProperty["tampered"] = "tampered";
    ScryptedInterfaceProperty["powerDetected"] = "powerDetected";
    ScryptedInterfaceProperty["audioDetected"] = "audioDetected";
    ScryptedInterfaceProperty["motionDetected"] = "motionDetected";
    ScryptedInterfaceProperty["ambientLight"] = "ambientLight";
    ScryptedInterfaceProperty["occupied"] = "occupied";
    ScryptedInterfaceProperty["flooded"] = "flooded";
    ScryptedInterfaceProperty["ultraviolet"] = "ultraviolet";
    ScryptedInterfaceProperty["luminance"] = "luminance";
    ScryptedInterfaceProperty["position"] = "position";
    ScryptedInterfaceProperty["securitySystemState"] = "securitySystemState";
    ScryptedInterfaceProperty["pm10Density"] = "pm10Density";
    ScryptedInterfaceProperty["pm25Density"] = "pm25Density";
    ScryptedInterfaceProperty["vocDensity"] = "vocDensity";
    ScryptedInterfaceProperty["noxDensity"] = "noxDensity";
    ScryptedInterfaceProperty["co2ppm"] = "co2ppm";
    ScryptedInterfaceProperty["airQuality"] = "airQuality";
    ScryptedInterfaceProperty["airPurifierState"] = "airPurifierState";
    ScryptedInterfaceProperty["filterChangeIndication"] = "filterChangeIndication";
    ScryptedInterfaceProperty["filterLifeLevel"] = "filterLifeLevel";
    ScryptedInterfaceProperty["humiditySetting"] = "humiditySetting";
    ScryptedInterfaceProperty["fan"] = "fan";
    ScryptedInterfaceProperty["applicationInfo"] = "applicationInfo";
})(ScryptedInterfaceProperty = exports.ScryptedInterfaceProperty || (exports.ScryptedInterfaceProperty = {}));
var ScryptedInterfaceMethod;
(function (ScryptedInterfaceMethod) {
    ScryptedInterfaceMethod["listen"] = "listen";
    ScryptedInterfaceMethod["probe"] = "probe";
    ScryptedInterfaceMethod["setMixins"] = "setMixins";
    ScryptedInterfaceMethod["setName"] = "setName";
    ScryptedInterfaceMethod["setRoom"] = "setRoom";
    ScryptedInterfaceMethod["setType"] = "setType";
    ScryptedInterfaceMethod["getPluginJson"] = "getPluginJson";
    ScryptedInterfaceMethod["turnOff"] = "turnOff";
    ScryptedInterfaceMethod["turnOn"] = "turnOn";
    ScryptedInterfaceMethod["setBrightness"] = "setBrightness";
    ScryptedInterfaceMethod["getTemperatureMaxK"] = "getTemperatureMaxK";
    ScryptedInterfaceMethod["getTemperatureMinK"] = "getTemperatureMinK";
    ScryptedInterfaceMethod["setColorTemperature"] = "setColorTemperature";
    ScryptedInterfaceMethod["setRgb"] = "setRgb";
    ScryptedInterfaceMethod["setHsv"] = "setHsv";
    ScryptedInterfaceMethod["sendNotification"] = "sendNotification";
    ScryptedInterfaceMethod["start"] = "start";
    ScryptedInterfaceMethod["stop"] = "stop";
    ScryptedInterfaceMethod["pause"] = "pause";
    ScryptedInterfaceMethod["resume"] = "resume";
    ScryptedInterfaceMethod["dock"] = "dock";
    ScryptedInterfaceMethod["setTemperature"] = "setTemperature";
    ScryptedInterfaceMethod["setThermostatMode"] = "setThermostatMode";
    ScryptedInterfaceMethod["setThermostatSetpoint"] = "setThermostatSetpoint";
    ScryptedInterfaceMethod["setThermostatSetpointHigh"] = "setThermostatSetpointHigh";
    ScryptedInterfaceMethod["setThermostatSetpointLow"] = "setThermostatSetpointLow";
    ScryptedInterfaceMethod["setTemperatureUnit"] = "setTemperatureUnit";
    ScryptedInterfaceMethod["getPictureOptions"] = "getPictureOptions";
    ScryptedInterfaceMethod["takePicture"] = "takePicture";
    ScryptedInterfaceMethod["getAudioStream"] = "getAudioStream";
    ScryptedInterfaceMethod["startDisplay"] = "startDisplay";
    ScryptedInterfaceMethod["stopDisplay"] = "stopDisplay";
    ScryptedInterfaceMethod["getVideoStream"] = "getVideoStream";
    ScryptedInterfaceMethod["getVideoStreamOptions"] = "getVideoStreamOptions";
    ScryptedInterfaceMethod["getRecordingStream"] = "getRecordingStream";
    ScryptedInterfaceMethod["getRecordingStreamCurrentTime"] = "getRecordingStreamCurrentTime";
    ScryptedInterfaceMethod["getRecordingStreamOptions"] = "getRecordingStreamOptions";
    ScryptedInterfaceMethod["getRecordingStreamThumbnail"] = "getRecordingStreamThumbnail";
    ScryptedInterfaceMethod["deleteRecordingStream"] = "deleteRecordingStream";
    ScryptedInterfaceMethod["setRecordingActive"] = "setRecordingActive";
    ScryptedInterfaceMethod["ptzCommand"] = "ptzCommand";
    ScryptedInterfaceMethod["getRecordedEvents"] = "getRecordedEvents";
    ScryptedInterfaceMethod["getVideoClip"] = "getVideoClip";
    ScryptedInterfaceMethod["getVideoClipThumbnail"] = "getVideoClipThumbnail";
    ScryptedInterfaceMethod["getVideoClips"] = "getVideoClips";
    ScryptedInterfaceMethod["removeVideoClips"] = "removeVideoClips";
    ScryptedInterfaceMethod["setVideoStreamOptions"] = "setVideoStreamOptions";
    ScryptedInterfaceMethod["startIntercom"] = "startIntercom";
    ScryptedInterfaceMethod["stopIntercom"] = "stopIntercom";
    ScryptedInterfaceMethod["lock"] = "lock";
    ScryptedInterfaceMethod["unlock"] = "unlock";
    ScryptedInterfaceMethod["addPassword"] = "addPassword";
    ScryptedInterfaceMethod["getPasswords"] = "getPasswords";
    ScryptedInterfaceMethod["removePassword"] = "removePassword";
    ScryptedInterfaceMethod["activate"] = "activate";
    ScryptedInterfaceMethod["deactivate"] = "deactivate";
    ScryptedInterfaceMethod["isReversible"] = "isReversible";
    ScryptedInterfaceMethod["closeEntry"] = "closeEntry";
    ScryptedInterfaceMethod["openEntry"] = "openEntry";
    ScryptedInterfaceMethod["getDevice"] = "getDevice";
    ScryptedInterfaceMethod["releaseDevice"] = "releaseDevice";
    ScryptedInterfaceMethod["adoptDevice"] = "adoptDevice";
    ScryptedInterfaceMethod["discoverDevices"] = "discoverDevices";
    ScryptedInterfaceMethod["createDevice"] = "createDevice";
    ScryptedInterfaceMethod["getCreateDeviceSettings"] = "getCreateDeviceSettings";
    ScryptedInterfaceMethod["reboot"] = "reboot";
    ScryptedInterfaceMethod["getRefreshFrequency"] = "getRefreshFrequency";
    ScryptedInterfaceMethod["refresh"] = "refresh";
    ScryptedInterfaceMethod["getMediaStatus"] = "getMediaStatus";
    ScryptedInterfaceMethod["load"] = "load";
    ScryptedInterfaceMethod["seek"] = "seek";
    ScryptedInterfaceMethod["skipNext"] = "skipNext";
    ScryptedInterfaceMethod["skipPrevious"] = "skipPrevious";
    ScryptedInterfaceMethod["convert"] = "convert";
    ScryptedInterfaceMethod["getSettings"] = "getSettings";
    ScryptedInterfaceMethod["putSetting"] = "putSetting";
    ScryptedInterfaceMethod["armSecuritySystem"] = "armSecuritySystem";
    ScryptedInterfaceMethod["disarmSecuritySystem"] = "disarmSecuritySystem";
    ScryptedInterfaceMethod["setAirPurifierState"] = "setAirPurifierState";
    ScryptedInterfaceMethod["getReadmeMarkdown"] = "getReadmeMarkdown";
    ScryptedInterfaceMethod["getOauthUrl"] = "getOauthUrl";
    ScryptedInterfaceMethod["onOauthCallback"] = "onOauthCallback";
    ScryptedInterfaceMethod["canMixin"] = "canMixin";
    ScryptedInterfaceMethod["getMixin"] = "getMixin";
    ScryptedInterfaceMethod["releaseMixin"] = "releaseMixin";
    ScryptedInterfaceMethod["onRequest"] = "onRequest";
    ScryptedInterfaceMethod["onConnection"] = "onConnection";
    ScryptedInterfaceMethod["onPush"] = "onPush";
    ScryptedInterfaceMethod["run"] = "run";
    ScryptedInterfaceMethod["eval"] = "eval";
    ScryptedInterfaceMethod["loadScripts"] = "loadScripts";
    ScryptedInterfaceMethod["saveScript"] = "saveScript";
    ScryptedInterfaceMethod["trackObjects"] = "trackObjects";
    ScryptedInterfaceMethod["getDetectionInput"] = "getDetectionInput";
    ScryptedInterfaceMethod["getObjectTypes"] = "getObjectTypes";
    ScryptedInterfaceMethod["detectObjects"] = "detectObjects";
    ScryptedInterfaceMethod["generateObjectDetections"] = "generateObjectDetections";
    ScryptedInterfaceMethod["getDetectionModel"] = "getDetectionModel";
    ScryptedInterfaceMethod["setHumidity"] = "setHumidity";
    ScryptedInterfaceMethod["setFan"] = "setFan";
    ScryptedInterfaceMethod["startRTCSignalingSession"] = "startRTCSignalingSession";
    ScryptedInterfaceMethod["createRTCSignalingSession"] = "createRTCSignalingSession";
    ScryptedInterfaceMethod["getScryptedUserAccessControl"] = "getScryptedUserAccessControl";
    ScryptedInterfaceMethod["generateVideoFrames"] = "generateVideoFrames";
    ScryptedInterfaceMethod["connectStream"] = "connectStream";
})(ScryptedInterfaceMethod = exports.ScryptedInterfaceMethod || (exports.ScryptedInterfaceMethod = {}));
exports.ScryptedInterfaceDescriptors = {
    ScryptedDevice: {
        name: 'ScryptedDevice',
        methods: [
            'listen',
            'probe',
            'setMixins',
            'setName',
            'setRoom',
            'setType'
        ],
        properties: [
            'id',
            'info',
            'interfaces',
            'mixins',
            'name',
            'nativeId',
            'pluginId',
            'providedInterfaces',
            'providedName',
            'providedRoom',
            'providedType',
            'providerId',
            'room',
            'type'
        ]
    },
    ScryptedPlugin: {
        name: 'ScryptedPlugin',
        methods: [
            'getPluginJson'
        ],
        properties: []
    },
    OnOff: {
        name: 'OnOff',
        methods: [
            'turnOff',
            'turnOn'
        ],
        properties: [
            'on'
        ]
    },
    Brightness: {
        name: 'Brightness',
        methods: [
            'setBrightness'
        ],
        properties: [
            'brightness'
        ]
    },
    ColorSettingTemperature: {
        name: 'ColorSettingTemperature',
        methods: [
            'getTemperatureMaxK',
            'getTemperatureMinK',
            'setColorTemperature'
        ],
        properties: [
            'colorTemperature'
        ]
    },
    ColorSettingRgb: {
        name: 'ColorSettingRgb',
        methods: [
            'setRgb'
        ],
        properties: [
            'rgb'
        ]
    },
    ColorSettingHsv: {
        name: 'ColorSettingHsv',
        methods: [
            'setHsv'
        ],
        properties: [
            'hsv'
        ]
    },
    Notifier: {
        name: 'Notifier',
        methods: [
            'sendNotification'
        ],
        properties: []
    },
    StartStop: {
        name: 'StartStop',
        methods: [
            'start',
            'stop'
        ],
        properties: [
            'running'
        ]
    },
    Pause: {
        name: 'Pause',
        methods: [
            'pause',
            'resume'
        ],
        properties: [
            'paused'
        ]
    },
    Dock: {
        name: 'Dock',
        methods: [
            'dock'
        ],
        properties: [
            'docked'
        ]
    },
    TemperatureSetting: {
        name: 'TemperatureSetting',
        methods: [
            'setTemperature',
            'setThermostatMode',
            'setThermostatSetpoint',
            'setThermostatSetpointHigh',
            'setThermostatSetpointLow'
        ],
        properties: [
            'temperatureSetting',
            'thermostatActiveMode',
            'thermostatAvailableModes',
            'thermostatMode',
            'thermostatSetpoint',
            'thermostatSetpointHigh',
            'thermostatSetpointLow'
        ]
    },
    Thermometer: {
        name: 'Thermometer',
        methods: [
            'setTemperatureUnit'
        ],
        properties: [
            'temperature',
            'temperatureUnit'
        ]
    },
    HumiditySensor: {
        name: 'HumiditySensor',
        methods: [],
        properties: [
            'humidity'
        ]
    },
    Camera: {
        name: 'Camera',
        methods: [
            'getPictureOptions',
            'takePicture'
        ],
        properties: []
    },
    Microphone: {
        name: 'Microphone',
        methods: [
            'getAudioStream'
        ],
        properties: []
    },
    Display: {
        name: 'Display',
        methods: [
            'startDisplay',
            'stopDisplay'
        ],
        properties: []
    },
    VideoCamera: {
        name: 'VideoCamera',
        methods: [
            'getVideoStream',
            'getVideoStreamOptions'
        ],
        properties: []
    },
    VideoRecorder: {
        name: 'VideoRecorder',
        methods: [
            'getRecordingStream',
            'getRecordingStreamCurrentTime',
            'getRecordingStreamOptions',
            'getRecordingStreamThumbnail'
        ],
        properties: [
            'recordingActive'
        ]
    },
    VideoRecorderManagement: {
        name: 'VideoRecorderManagement',
        methods: [
            'deleteRecordingStream',
            'setRecordingActive'
        ],
        properties: []
    },
    PanTiltZoom: {
        name: 'PanTiltZoom',
        methods: [
            'ptzCommand'
        ],
        properties: [
            'ptzCapabilities'
        ]
    },
    EventRecorder: {
        name: 'EventRecorder',
        methods: [
            'getRecordedEvents'
        ],
        properties: []
    },
    VideoClips: {
        name: 'VideoClips',
        methods: [
            'getVideoClip',
            'getVideoClipThumbnail',
            'getVideoClips',
            'removeVideoClips'
        ],
        properties: []
    },
    VideoCameraConfiguration: {
        name: 'VideoCameraConfiguration',
        methods: [
            'setVideoStreamOptions'
        ],
        properties: []
    },
    Intercom: {
        name: 'Intercom',
        methods: [
            'startIntercom',
            'stopIntercom'
        ],
        properties: []
    },
    Lock: {
        name: 'Lock',
        methods: [
            'lock',
            'unlock'
        ],
        properties: [
            'lockState'
        ]
    },
    PasswordStore: {
        name: 'PasswordStore',
        methods: [
            'addPassword',
            'getPasswords',
            'removePassword'
        ],
        properties: []
    },
    Scene: {
        name: 'Scene',
        methods: [
            'activate',
            'deactivate',
            'isReversible'
        ],
        properties: []
    },
    Entry: {
        name: 'Entry',
        methods: [
            'closeEntry',
            'openEntry'
        ],
        properties: []
    },
    EntrySensor: {
        name: 'EntrySensor',
        methods: [],
        properties: [
            'entryOpen'
        ]
    },
    DeviceProvider: {
        name: 'DeviceProvider',
        methods: [
            'getDevice',
            'releaseDevice'
        ],
        properties: []
    },
    DeviceDiscovery: {
        name: 'DeviceDiscovery',
        methods: [
            'adoptDevice',
            'discoverDevices'
        ],
        properties: []
    },
    DeviceCreator: {
        name: 'DeviceCreator',
        methods: [
            'createDevice',
            'getCreateDeviceSettings'
        ],
        properties: []
    },
    Battery: {
        name: 'Battery',
        methods: [],
        properties: [
            'batteryLevel'
        ]
    },
    Charger: {
        name: 'Charger',
        methods: [],
        properties: [
            'chargeState'
        ]
    },
    Reboot: {
        name: 'Reboot',
        methods: [
            'reboot'
        ],
        properties: []
    },
    Refresh: {
        name: 'Refresh',
        methods: [
            'getRefreshFrequency',
            'refresh'
        ],
        properties: []
    },
    MediaPlayer: {
        name: 'MediaPlayer',
        methods: [
            'getMediaStatus',
            'load',
            'seek',
            'skipNext',
            'skipPrevious'
        ],
        properties: []
    },
    Online: {
        name: 'Online',
        methods: [],
        properties: [
            'online'
        ]
    },
    BufferConverter: {
        name: 'BufferConverter',
        methods: [
            'convert'
        ],
        properties: [
            'fromMimeType',
            'toMimeType'
        ]
    },
    Settings: {
        name: 'Settings',
        methods: [
            'getSettings',
            'putSetting'
        ],
        properties: []
    },
    BinarySensor: {
        name: 'BinarySensor',
        methods: [],
        properties: [
            'binaryState'
        ]
    },
    TamperSensor: {
        name: 'TamperSensor',
        methods: [],
        properties: [
            'tampered'
        ]
    },
    PowerSensor: {
        name: 'PowerSensor',
        methods: [],
        properties: [
            'powerDetected'
        ]
    },
    AudioSensor: {
        name: 'AudioSensor',
        methods: [],
        properties: [
            'audioDetected'
        ]
    },
    MotionSensor: {
        name: 'MotionSensor',
        methods: [],
        properties: [
            'motionDetected'
        ]
    },
    AmbientLightSensor: {
        name: 'AmbientLightSensor',
        methods: [],
        properties: [
            'ambientLight'
        ]
    },
    OccupancySensor: {
        name: 'OccupancySensor',
        methods: [],
        properties: [
            'occupied'
        ]
    },
    FloodSensor: {
        name: 'FloodSensor',
        methods: [],
        properties: [
            'flooded'
        ]
    },
    UltravioletSensor: {
        name: 'UltravioletSensor',
        methods: [],
        properties: [
            'ultraviolet'
        ]
    },
    LuminanceSensor: {
        name: 'LuminanceSensor',
        methods: [],
        properties: [
            'luminance'
        ]
    },
    PositionSensor: {
        name: 'PositionSensor',
        methods: [],
        properties: [
            'position'
        ]
    },
    SecuritySystem: {
        name: 'SecuritySystem',
        methods: [
            'armSecuritySystem',
            'disarmSecuritySystem'
        ],
        properties: [
            'securitySystemState'
        ]
    },
    PM10Sensor: {
        name: 'PM10Sensor',
        methods: [],
        properties: [
            'pm10Density'
        ]
    },
    PM25Sensor: {
        name: 'PM25Sensor',
        methods: [],
        properties: [
            'pm25Density'
        ]
    },
    VOCSensor: {
        name: 'VOCSensor',
        methods: [],
        properties: [
            'vocDensity'
        ]
    },
    NOXSensor: {
        name: 'NOXSensor',
        methods: [],
        properties: [
            'noxDensity'
        ]
    },
    CO2Sensor: {
        name: 'CO2Sensor',
        methods: [],
        properties: [
            'co2ppm'
        ]
    },
    AirQualitySensor: {
        name: 'AirQualitySensor',
        methods: [],
        properties: [
            'airQuality'
        ]
    },
    AirPurifier: {
        name: 'AirPurifier',
        methods: [
            'setAirPurifierState'
        ],
        properties: [
            'airPurifierState'
        ]
    },
    FilterMaintenance: {
        name: 'FilterMaintenance',
        methods: [],
        properties: [
            'filterChangeIndication',
            'filterLifeLevel'
        ]
    },
    Readme: {
        name: 'Readme',
        methods: [
            'getReadmeMarkdown'
        ],
        properties: []
    },
    OauthClient: {
        name: 'OauthClient',
        methods: [
            'getOauthUrl',
            'onOauthCallback'
        ],
        properties: []
    },
    MixinProvider: {
        name: 'MixinProvider',
        methods: [
            'canMixin',
            'getMixin',
            'releaseMixin'
        ],
        properties: []
    },
    HttpRequestHandler: {
        name: 'HttpRequestHandler',
        methods: [
            'onRequest'
        ],
        properties: []
    },
    EngineIOHandler: {
        name: 'EngineIOHandler',
        methods: [
            'onConnection'
        ],
        properties: []
    },
    PushHandler: {
        name: 'PushHandler',
        methods: [
            'onPush'
        ],
        properties: []
    },
    Program: {
        name: 'Program',
        methods: [
            'run'
        ],
        properties: []
    },
    Scriptable: {
        name: 'Scriptable',
        methods: [
            'eval',
            'loadScripts',
            'saveScript'
        ],
        properties: []
    },
    ObjectTracker: {
        name: 'ObjectTracker',
        methods: [
            'trackObjects'
        ],
        properties: []
    },
    ObjectDetector: {
        name: 'ObjectDetector',
        methods: [
            'getDetectionInput',
            'getObjectTypes'
        ],
        properties: []
    },
    ObjectDetection: {
        name: 'ObjectDetection',
        methods: [
            'detectObjects',
            'generateObjectDetections',
            'getDetectionModel'
        ],
        properties: []
    },
    ObjectDetectionPreview: {
        name: 'ObjectDetectionPreview',
        methods: [],
        properties: []
    },
    ObjectDetectionGenerator: {
        name: 'ObjectDetectionGenerator',
        methods: [],
        properties: []
    },
    HumiditySetting: {
        name: 'HumiditySetting',
        methods: [
            'setHumidity'
        ],
        properties: [
            'humiditySetting'
        ]
    },
    Fan: {
        name: 'Fan',
        methods: [
            'setFan'
        ],
        properties: [
            'fan'
        ]
    },
    RTCSignalingChannel: {
        name: 'RTCSignalingChannel',
        methods: [
            'startRTCSignalingSession'
        ],
        properties: []
    },
    RTCSignalingClient: {
        name: 'RTCSignalingClient',
        methods: [
            'createRTCSignalingSession'
        ],
        properties: []
    },
    LauncherApplication: {
        name: 'LauncherApplication',
        methods: [],
        properties: [
            'applicationInfo'
        ]
    },
    ScryptedUser: {
        name: 'ScryptedUser',
        methods: [
            'getScryptedUserAccessControl'
        ],
        properties: []
    },
    VideoFrameGenerator: {
        name: 'VideoFrameGenerator',
        methods: [
            'generateVideoFrames'
        ],
        properties: []
    },
    StreamService: {
        name: 'StreamService',
        methods: [
            'connectStream'
        ],
        properties: []
    }
};
/**
 * @category Core Reference
 */
var ScryptedDeviceType;
(function (ScryptedDeviceType) {
    ScryptedDeviceType["Builtin"] = "Builtin";
    ScryptedDeviceType["Camera"] = "Camera";
    ScryptedDeviceType["Fan"] = "Fan";
    ScryptedDeviceType["Light"] = "Light";
    ScryptedDeviceType["Switch"] = "Switch";
    ScryptedDeviceType["Outlet"] = "Outlet";
    ScryptedDeviceType["Sensor"] = "Sensor";
    ScryptedDeviceType["Scene"] = "Scene";
    ScryptedDeviceType["Program"] = "Program";
    ScryptedDeviceType["Automation"] = "Automation";
    ScryptedDeviceType["Vacuum"] = "Vacuum";
    ScryptedDeviceType["Notifier"] = "Notifier";
    ScryptedDeviceType["Thermostat"] = "Thermostat";
    ScryptedDeviceType["Lock"] = "Lock";
    ScryptedDeviceType["PasswordControl"] = "PasswordControl";
    /**
     * Displays have audio and video output.
     */
    ScryptedDeviceType["Display"] = "Display";
    /**
     * Smart Displays have two way audio and video.
     */
    ScryptedDeviceType["SmartDisplay"] = "SmartDisplay";
    ScryptedDeviceType["Speaker"] = "Speaker";
    /**
     * Smart Speakers have two way audio.
     */
    ScryptedDeviceType["SmartSpeaker"] = "SmartSpeaker";
    ScryptedDeviceType["Event"] = "Event";
    ScryptedDeviceType["Entry"] = "Entry";
    ScryptedDeviceType["Garage"] = "Garage";
    ScryptedDeviceType["DeviceProvider"] = "DeviceProvider";
    ScryptedDeviceType["DataSource"] = "DataSource";
    ScryptedDeviceType["API"] = "API";
    ScryptedDeviceType["Doorbell"] = "Doorbell";
    ScryptedDeviceType["Irrigation"] = "Irrigation";
    ScryptedDeviceType["Valve"] = "Valve";
    ScryptedDeviceType["Person"] = "Person";
    ScryptedDeviceType["SecuritySystem"] = "SecuritySystem";
    ScryptedDeviceType["WindowCovering"] = "WindowCovering";
    ScryptedDeviceType["Siren"] = "Siren";
    ScryptedDeviceType["AirPurifier"] = "AirPurifier";
    ScryptedDeviceType["Unknown"] = "Unknown";
})(ScryptedDeviceType = exports.ScryptedDeviceType || (exports.ScryptedDeviceType = {}));
var HumidityMode;
(function (HumidityMode) {
    HumidityMode["Humidify"] = "Humidify";
    HumidityMode["Dehumidify"] = "Dehumidify";
    HumidityMode["Auto"] = "Auto";
    HumidityMode["Off"] = "Off";
})(HumidityMode = exports.HumidityMode || (exports.HumidityMode = {}));
var FanMode;
(function (FanMode) {
    FanMode["Auto"] = "Auto";
    FanMode["Manual"] = "Manual";
})(FanMode = exports.FanMode || (exports.FanMode = {}));
var TemperatureUnit;
(function (TemperatureUnit) {
    TemperatureUnit["C"] = "C";
    TemperatureUnit["F"] = "F";
})(TemperatureUnit = exports.TemperatureUnit || (exports.TemperatureUnit = {}));
var ThermostatMode;
(function (ThermostatMode) {
    ThermostatMode["Off"] = "Off";
    ThermostatMode["Cool"] = "Cool";
    ThermostatMode["Heat"] = "Heat";
    ThermostatMode["HeatCool"] = "HeatCool";
    ThermostatMode["Auto"] = "Auto";
    ThermostatMode["FanOnly"] = "FanOnly";
    ThermostatMode["Purifier"] = "Purifier";
    ThermostatMode["Eco"] = "Eco";
    ThermostatMode["Dry"] = "Dry";
    ThermostatMode["On"] = "On";
})(ThermostatMode = exports.ThermostatMode || (exports.ThermostatMode = {}));
var PanTiltZoomMovement;
(function (PanTiltZoomMovement) {
    PanTiltZoomMovement["Absolute"] = "Absolute";
    PanTiltZoomMovement["Relative"] = "Relative";
})(PanTiltZoomMovement = exports.PanTiltZoomMovement || (exports.PanTiltZoomMovement = {}));
var LockState;
(function (LockState) {
    LockState["Locked"] = "Locked";
    LockState["Unlocked"] = "Unlocked";
    LockState["Jammed"] = "Jammed";
})(LockState = exports.LockState || (exports.LockState = {}));
var ChargeState;
(function (ChargeState) {
    ChargeState["Trickle"] = "trickle";
    ChargeState["Charging"] = "charging";
    ChargeState["NotCharging"] = "not-charging";
})(ChargeState = exports.ChargeState || (exports.ChargeState = {}));
var AirPurifierStatus;
(function (AirPurifierStatus) {
    AirPurifierStatus["Inactive"] = "Inactive";
    AirPurifierStatus["Idle"] = "Idle";
    AirPurifierStatus["Active"] = "Active";
    AirPurifierStatus["ActiveNightMode"] = "ActiveNightMode";
})(AirPurifierStatus = exports.AirPurifierStatus || (exports.AirPurifierStatus = {}));
var AirPurifierMode;
(function (AirPurifierMode) {
    AirPurifierMode["Manual"] = "Manual";
    AirPurifierMode["Automatic"] = "Automatic";
})(AirPurifierMode = exports.AirPurifierMode || (exports.AirPurifierMode = {}));
var AirQuality;
(function (AirQuality) {
    AirQuality["Unknown"] = "Unknown";
    AirQuality["Excellent"] = "Excellent";
    AirQuality["Good"] = "Good";
    AirQuality["Fair"] = "Fair";
    AirQuality["Inferior"] = "Inferior";
    AirQuality["Poor"] = "Poor";
})(AirQuality = exports.AirQuality || (exports.AirQuality = {}));
var SecuritySystemMode;
(function (SecuritySystemMode) {
    SecuritySystemMode["Disarmed"] = "Disarmed";
    SecuritySystemMode["HomeArmed"] = "HomeArmed";
    SecuritySystemMode["AwayArmed"] = "AwayArmed";
    SecuritySystemMode["NightArmed"] = "NightArmed";
})(SecuritySystemMode = exports.SecuritySystemMode || (exports.SecuritySystemMode = {}));
var SecuritySystemObstruction;
(function (SecuritySystemObstruction) {
    SecuritySystemObstruction["Sensor"] = "Sensor";
    SecuritySystemObstruction["Occupied"] = "Occupied";
    SecuritySystemObstruction["Time"] = "Time";
    SecuritySystemObstruction["Error"] = "Error";
})(SecuritySystemObstruction = exports.SecuritySystemObstruction || (exports.SecuritySystemObstruction = {}));
var MediaPlayerState;
(function (MediaPlayerState) {
    MediaPlayerState["Idle"] = "Idle";
    MediaPlayerState["Playing"] = "Playing";
    MediaPlayerState["Paused"] = "Paused";
    MediaPlayerState["Buffering"] = "Buffering";
})(MediaPlayerState = exports.MediaPlayerState || (exports.MediaPlayerState = {}));
var ScryptedInterface;
(function (ScryptedInterface) {
    ScryptedInterface["ScryptedDevice"] = "ScryptedDevice";
    ScryptedInterface["ScryptedPlugin"] = "ScryptedPlugin";
    ScryptedInterface["OnOff"] = "OnOff";
    ScryptedInterface["Brightness"] = "Brightness";
    ScryptedInterface["ColorSettingTemperature"] = "ColorSettingTemperature";
    ScryptedInterface["ColorSettingRgb"] = "ColorSettingRgb";
    ScryptedInterface["ColorSettingHsv"] = "ColorSettingHsv";
    ScryptedInterface["Notifier"] = "Notifier";
    ScryptedInterface["StartStop"] = "StartStop";
    ScryptedInterface["Pause"] = "Pause";
    ScryptedInterface["Dock"] = "Dock";
    ScryptedInterface["TemperatureSetting"] = "TemperatureSetting";
    ScryptedInterface["Thermometer"] = "Thermometer";
    ScryptedInterface["HumiditySensor"] = "HumiditySensor";
    ScryptedInterface["Camera"] = "Camera";
    ScryptedInterface["Microphone"] = "Microphone";
    ScryptedInterface["Display"] = "Display";
    ScryptedInterface["VideoCamera"] = "VideoCamera";
    ScryptedInterface["VideoRecorder"] = "VideoRecorder";
    ScryptedInterface["VideoRecorderManagement"] = "VideoRecorderManagement";
    ScryptedInterface["PanTiltZoom"] = "PanTiltZoom";
    ScryptedInterface["EventRecorder"] = "EventRecorder";
    ScryptedInterface["VideoClips"] = "VideoClips";
    ScryptedInterface["VideoCameraConfiguration"] = "VideoCameraConfiguration";
    ScryptedInterface["Intercom"] = "Intercom";
    ScryptedInterface["Lock"] = "Lock";
    ScryptedInterface["PasswordStore"] = "PasswordStore";
    ScryptedInterface["Scene"] = "Scene";
    ScryptedInterface["Entry"] = "Entry";
    ScryptedInterface["EntrySensor"] = "EntrySensor";
    ScryptedInterface["DeviceProvider"] = "DeviceProvider";
    ScryptedInterface["DeviceDiscovery"] = "DeviceDiscovery";
    ScryptedInterface["DeviceCreator"] = "DeviceCreator";
    ScryptedInterface["Battery"] = "Battery";
    ScryptedInterface["Charger"] = "Charger";
    ScryptedInterface["Reboot"] = "Reboot";
    ScryptedInterface["Refresh"] = "Refresh";
    ScryptedInterface["MediaPlayer"] = "MediaPlayer";
    ScryptedInterface["Online"] = "Online";
    ScryptedInterface["BufferConverter"] = "BufferConverter";
    ScryptedInterface["Settings"] = "Settings";
    ScryptedInterface["BinarySensor"] = "BinarySensor";
    ScryptedInterface["TamperSensor"] = "TamperSensor";
    ScryptedInterface["PowerSensor"] = "PowerSensor";
    ScryptedInterface["AudioSensor"] = "AudioSensor";
    ScryptedInterface["MotionSensor"] = "MotionSensor";
    ScryptedInterface["AmbientLightSensor"] = "AmbientLightSensor";
    ScryptedInterface["OccupancySensor"] = "OccupancySensor";
    ScryptedInterface["FloodSensor"] = "FloodSensor";
    ScryptedInterface["UltravioletSensor"] = "UltravioletSensor";
    ScryptedInterface["LuminanceSensor"] = "LuminanceSensor";
    ScryptedInterface["PositionSensor"] = "PositionSensor";
    ScryptedInterface["SecuritySystem"] = "SecuritySystem";
    ScryptedInterface["PM10Sensor"] = "PM10Sensor";
    ScryptedInterface["PM25Sensor"] = "PM25Sensor";
    ScryptedInterface["VOCSensor"] = "VOCSensor";
    ScryptedInterface["NOXSensor"] = "NOXSensor";
    ScryptedInterface["CO2Sensor"] = "CO2Sensor";
    ScryptedInterface["AirQualitySensor"] = "AirQualitySensor";
    ScryptedInterface["AirPurifier"] = "AirPurifier";
    ScryptedInterface["FilterMaintenance"] = "FilterMaintenance";
    ScryptedInterface["Readme"] = "Readme";
    ScryptedInterface["OauthClient"] = "OauthClient";
    ScryptedInterface["MixinProvider"] = "MixinProvider";
    ScryptedInterface["HttpRequestHandler"] = "HttpRequestHandler";
    ScryptedInterface["EngineIOHandler"] = "EngineIOHandler";
    ScryptedInterface["PushHandler"] = "PushHandler";
    ScryptedInterface["Program"] = "Program";
    ScryptedInterface["Scriptable"] = "Scriptable";
    ScryptedInterface["ObjectTracker"] = "ObjectTracker";
    ScryptedInterface["ObjectDetector"] = "ObjectDetector";
    ScryptedInterface["ObjectDetection"] = "ObjectDetection";
    ScryptedInterface["ObjectDetectionPreview"] = "ObjectDetectionPreview";
    ScryptedInterface["ObjectDetectionGenerator"] = "ObjectDetectionGenerator";
    ScryptedInterface["HumiditySetting"] = "HumiditySetting";
    ScryptedInterface["Fan"] = "Fan";
    ScryptedInterface["RTCSignalingChannel"] = "RTCSignalingChannel";
    ScryptedInterface["RTCSignalingClient"] = "RTCSignalingClient";
    ScryptedInterface["LauncherApplication"] = "LauncherApplication";
    ScryptedInterface["ScryptedUser"] = "ScryptedUser";
    ScryptedInterface["VideoFrameGenerator"] = "VideoFrameGenerator";
    ScryptedInterface["StreamService"] = "StreamService";
})(ScryptedInterface = exports.ScryptedInterface || (exports.ScryptedInterface = {}));
var ScryptedMimeTypes;
(function (ScryptedMimeTypes) {
    ScryptedMimeTypes["Url"] = "text/x-uri";
    ScryptedMimeTypes["InsecureLocalUrl"] = "text/x-insecure-local-uri";
    ScryptedMimeTypes["LocalUrl"] = "text/x-local-uri";
    ScryptedMimeTypes["PushEndpoint"] = "text/x-push-endpoint";
    ScryptedMimeTypes["SchemePrefix"] = "x-scrypted/x-scrypted-scheme-";
    ScryptedMimeTypes["MediaStreamUrl"] = "text/x-media-url";
    ScryptedMimeTypes["MediaObject"] = "x-scrypted/x-scrypted-media-object";
    ScryptedMimeTypes["RequestMediaObject"] = "x-scrypted/x-scrypted-request-media-object";
    ScryptedMimeTypes["RequestMediaStream"] = "x-scrypted/x-scrypted-request-stream";
    ScryptedMimeTypes["MediaStreamFeedback"] = "x-scrypted/x-media-stream-feedback";
    ScryptedMimeTypes["FFmpegInput"] = "x-scrypted/x-ffmpeg-input";
    ScryptedMimeTypes["FFmpegTranscodeStream"] = "x-scrypted/x-ffmpeg-transcode-stream";
    ScryptedMimeTypes["RTCSignalingChannel"] = "x-scrypted/x-scrypted-rtc-signaling-channel";
    ScryptedMimeTypes["RTCSignalingSession"] = "x-scrypted/x-scrypted-rtc-signaling-session";
    ScryptedMimeTypes["RTCConnectionManagement"] = "x-scrypted/x-scrypted-rtc-connection-management";
    ScryptedMimeTypes["Image"] = "x-scrypted/x-scrypted-image";
})(ScryptedMimeTypes = exports.ScryptedMimeTypes || (exports.ScryptedMimeTypes = {}));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../../../node_modules/debug/src/browser.js":
/*!**************************************************!*\
  !*** ../../../node_modules/debug/src/browser.js ***!
  \**************************************************/
/***/ ((module, exports, __webpack_require__) => {

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = __webpack_require__(/*! ./debug */ "../../../node_modules/debug/src/debug.js");
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit')

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}


/***/ }),

/***/ "../../../node_modules/debug/src/debug.js":
/*!************************************************!*\
  !*** ../../../node_modules/debug/src/debug.js ***!
  \************************************************/
/***/ ((module, exports, __webpack_require__) => {


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = __webpack_require__(/*! ms */ "../../../node_modules/ms/index.js");

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  return debug;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}


/***/ }),

/***/ "../../../node_modules/debug/src/index.js":
/*!************************************************!*\
  !*** ../../../node_modules/debug/src/index.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Detect Electron renderer process, which is node, but we should
 * treat as a browser.
 */

if (typeof process !== 'undefined' && process.type === 'renderer') {
  module.exports = __webpack_require__(/*! ./browser.js */ "../../../node_modules/debug/src/browser.js");
} else {
  module.exports = __webpack_require__(/*! ./node.js */ "../../../node_modules/debug/src/node.js");
}


/***/ }),

/***/ "../../../node_modules/debug/src/node.js":
/*!***********************************************!*\
  !*** ../../../node_modules/debug/src/node.js ***!
  \***********************************************/
/***/ ((module, exports, __webpack_require__) => {

/**
 * Module dependencies.
 */

var tty = __webpack_require__(/*! tty */ "tty");
var util = __webpack_require__(/*! util */ "util");

/**
 * This is the Node.js implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = __webpack_require__(/*! ./debug */ "../../../node_modules/debug/src/debug.js");
exports.init = init;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;

/**
 * Colors.
 */

exports.colors = [6, 2, 3, 4, 5, 1];

/**
 * Build up the default `inspectOpts` object from the environment variables.
 *
 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
 */

exports.inspectOpts = Object.keys(process.env).filter(function (key) {
  return /^debug_/i.test(key);
}).reduce(function (obj, key) {
  // camel-case
  var prop = key
    .substring(6)
    .toLowerCase()
    .replace(/_([a-z])/g, function (_, k) { return k.toUpperCase() });

  // coerce string value into JS value
  var val = process.env[key];
  if (/^(yes|on|true|enabled)$/i.test(val)) val = true;
  else if (/^(no|off|false|disabled)$/i.test(val)) val = false;
  else if (val === 'null') val = null;
  else val = Number(val);

  obj[prop] = val;
  return obj;
}, {});

/**
 * The file descriptor to write the `debug()` calls to.
 * Set the `DEBUG_FD` env variable to override with another value. i.e.:
 *
 *   $ DEBUG_FD=3 node script.js 3>debug.log
 */

var fd = parseInt(process.env.DEBUG_FD, 10) || 2;

if (1 !== fd && 2 !== fd) {
  util.deprecate(function(){}, 'except for stderr(2) and stdout(1), any other usage of DEBUG_FD is deprecated. Override debug.log if you want to use a different log function (https://git.io/debug_fd)')()
}

var stream = 1 === fd ? process.stdout :
             2 === fd ? process.stderr :
             createWritableStdioStream(fd);

/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */

function useColors() {
  return 'colors' in exports.inspectOpts
    ? Boolean(exports.inspectOpts.colors)
    : tty.isatty(fd);
}

/**
 * Map %o to `util.inspect()`, all on a single line.
 */

exports.formatters.o = function(v) {
  this.inspectOpts.colors = this.useColors;
  return util.inspect(v, this.inspectOpts)
    .split('\n').map(function(str) {
      return str.trim()
    }).join(' ');
};

/**
 * Map %o to `util.inspect()`, allowing multiple lines if needed.
 */

exports.formatters.O = function(v) {
  this.inspectOpts.colors = this.useColors;
  return util.inspect(v, this.inspectOpts);
};

/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var name = this.namespace;
  var useColors = this.useColors;

  if (useColors) {
    var c = this.color;
    var prefix = '  \u001b[3' + c + ';1m' + name + ' ' + '\u001b[0m';

    args[0] = prefix + args[0].split('\n').join('\n' + prefix);
    args.push('\u001b[3' + c + 'm+' + exports.humanize(this.diff) + '\u001b[0m');
  } else {
    args[0] = new Date().toUTCString()
      + ' ' + name + ' ' + args[0];
  }
}

/**
 * Invokes `util.format()` with the specified arguments and writes to `stream`.
 */

function log() {
  return stream.write(util.format.apply(util, arguments) + '\n');
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  if (null == namespaces) {
    // If you set a process.env field to null or undefined, it gets cast to the
    // string 'null' or 'undefined'. Just delete instead.
    delete process.env.DEBUG;
  } else {
    process.env.DEBUG = namespaces;
  }
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  return process.env.DEBUG;
}

/**
 * Copied from `node/src/node.js`.
 *
 * XXX: It's lame that node doesn't expose this API out-of-the-box. It also
 * relies on the undocumented `tty_wrap.guessHandleType()` which is also lame.
 */

function createWritableStdioStream (fd) {
  var stream;
  var tty_wrap = process.binding('tty_wrap');

  // Note stream._type is used for test-module-load-list.js

  switch (tty_wrap.guessHandleType(fd)) {
    case 'TTY':
      stream = new tty.WriteStream(fd);
      stream._type = 'tty';

      // Hack to have stream not keep the event loop alive.
      // See https://github.com/joyent/node/issues/1726
      if (stream._handle && stream._handle.unref) {
        stream._handle.unref();
      }
      break;

    case 'FILE':
      var fs = __webpack_require__(/*! fs */ "fs");
      stream = new fs.SyncWriteStream(fd, { autoClose: false });
      stream._type = 'fs';
      break;

    case 'PIPE':
    case 'TCP':
      var net = __webpack_require__(/*! net */ "net");
      stream = new net.Socket({
        fd: fd,
        readable: false,
        writable: true
      });

      // FIXME Should probably have an option in net.Socket to create a
      // stream from an existing fd which is writable only. But for now
      // we'll just add this hack and set the `readable` member to false.
      // Test: ./node test/fixtures/echo.js < /etc/passwd
      stream.readable = false;
      stream.read = null;
      stream._type = 'pipe';

      // FIXME Hack to have stream not keep the event loop alive.
      // See https://github.com/joyent/node/issues/1726
      if (stream._handle && stream._handle.unref) {
        stream._handle.unref();
      }
      break;

    default:
      // Probably an error on in uv_guess_handle()
      throw new Error('Implement me. Unknown stream file type!');
  }

  // For supporting legacy API we put the FD here.
  stream.fd = fd;

  stream._isStdio = true;

  return stream;
}

/**
 * Init logic for `debug` instances.
 *
 * Create a new `inspectOpts` object in case `useColors` is set
 * differently for a particular `debug` instance.
 */

function init (debug) {
  debug.inspectOpts = {};

  var keys = Object.keys(exports.inspectOpts);
  for (var i = 0; i < keys.length; i++) {
    debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
  }
}

/**
 * Enable namespaces listed in `process.env.DEBUG` initially.
 */

exports.enable(load());


/***/ }),

/***/ "../../../node_modules/follow-redirects/debug.js":
/*!*******************************************************!*\
  !*** ../../../node_modules/follow-redirects/debug.js ***!
  \*******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var debug;

module.exports = function () {
  if (!debug) {
    try {
      /* eslint global-require: off */
      debug = __webpack_require__(/*! debug */ "../../../node_modules/debug/src/index.js")("follow-redirects");
    }
    catch (error) { /* */ }
    if (typeof debug !== "function") {
      debug = function () { /* */ };
    }
  }
  debug.apply(null, arguments);
};


/***/ }),

/***/ "../../../node_modules/follow-redirects/index.js":
/*!*******************************************************!*\
  !*** ../../../node_modules/follow-redirects/index.js ***!
  \*******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var url = __webpack_require__(/*! url */ "url");
var URL = url.URL;
var http = __webpack_require__(/*! http */ "http");
var https = __webpack_require__(/*! https */ "https");
var Writable = (__webpack_require__(/*! stream */ "stream").Writable);
var assert = __webpack_require__(/*! assert */ "assert");
var debug = __webpack_require__(/*! ./debug */ "../../../node_modules/follow-redirects/debug.js");

// Whether to use the native URL object or the legacy url module
var useNativeURL = false;
try {
  assert(new URL());
}
catch (error) {
  useNativeURL = error.code === "ERR_INVALID_URL";
}

// URL fields to preserve in copy operations
var preservedUrlFields = [
  "auth",
  "host",
  "hostname",
  "href",
  "path",
  "pathname",
  "port",
  "protocol",
  "query",
  "search",
  "hash",
];

// Create handlers that pass events from native requests
var events = ["abort", "aborted", "connect", "error", "socket", "timeout"];
var eventHandlers = Object.create(null);
events.forEach(function (event) {
  eventHandlers[event] = function (arg1, arg2, arg3) {
    this._redirectable.emit(event, arg1, arg2, arg3);
  };
});

// Error types with codes
var InvalidUrlError = createErrorType(
  "ERR_INVALID_URL",
  "Invalid URL",
  TypeError
);
var RedirectionError = createErrorType(
  "ERR_FR_REDIRECTION_FAILURE",
  "Redirected request failed"
);
var TooManyRedirectsError = createErrorType(
  "ERR_FR_TOO_MANY_REDIRECTS",
  "Maximum number of redirects exceeded",
  RedirectionError
);
var MaxBodyLengthExceededError = createErrorType(
  "ERR_FR_MAX_BODY_LENGTH_EXCEEDED",
  "Request body larger than maxBodyLength limit"
);
var WriteAfterEndError = createErrorType(
  "ERR_STREAM_WRITE_AFTER_END",
  "write after end"
);

// istanbul ignore next
var destroy = Writable.prototype.destroy || noop;

// An HTTP(S) request that can be redirected
function RedirectableRequest(options, responseCallback) {
  // Initialize the request
  Writable.call(this);
  this._sanitizeOptions(options);
  this._options = options;
  this._ended = false;
  this._ending = false;
  this._redirectCount = 0;
  this._redirects = [];
  this._requestBodyLength = 0;
  this._requestBodyBuffers = [];

  // Attach a callback if passed
  if (responseCallback) {
    this.on("response", responseCallback);
  }

  // React to responses of native requests
  var self = this;
  this._onNativeResponse = function (response) {
    try {
      self._processResponse(response);
    }
    catch (cause) {
      self.emit("error", cause instanceof RedirectionError ?
        cause : new RedirectionError({ cause: cause }));
    }
  };

  // Perform the first request
  this._performRequest();
}
RedirectableRequest.prototype = Object.create(Writable.prototype);

RedirectableRequest.prototype.abort = function () {
  destroyRequest(this._currentRequest);
  this._currentRequest.abort();
  this.emit("abort");
};

RedirectableRequest.prototype.destroy = function (error) {
  destroyRequest(this._currentRequest, error);
  destroy.call(this, error);
  return this;
};

// Writes buffered data to the current native request
RedirectableRequest.prototype.write = function (data, encoding, callback) {
  // Writing is not allowed if end has been called
  if (this._ending) {
    throw new WriteAfterEndError();
  }

  // Validate input and shift parameters if necessary
  if (!isString(data) && !isBuffer(data)) {
    throw new TypeError("data should be a string, Buffer or Uint8Array");
  }
  if (isFunction(encoding)) {
    callback = encoding;
    encoding = null;
  }

  // Ignore empty buffers, since writing them doesn't invoke the callback
  // https://github.com/nodejs/node/issues/22066
  if (data.length === 0) {
    if (callback) {
      callback();
    }
    return;
  }
  // Only write when we don't exceed the maximum body length
  if (this._requestBodyLength + data.length <= this._options.maxBodyLength) {
    this._requestBodyLength += data.length;
    this._requestBodyBuffers.push({ data: data, encoding: encoding });
    this._currentRequest.write(data, encoding, callback);
  }
  // Error when we exceed the maximum body length
  else {
    this.emit("error", new MaxBodyLengthExceededError());
    this.abort();
  }
};

// Ends the current native request
RedirectableRequest.prototype.end = function (data, encoding, callback) {
  // Shift parameters if necessary
  if (isFunction(data)) {
    callback = data;
    data = encoding = null;
  }
  else if (isFunction(encoding)) {
    callback = encoding;
    encoding = null;
  }

  // Write data if needed and end
  if (!data) {
    this._ended = this._ending = true;
    this._currentRequest.end(null, null, callback);
  }
  else {
    var self = this;
    var currentRequest = this._currentRequest;
    this.write(data, encoding, function () {
      self._ended = true;
      currentRequest.end(null, null, callback);
    });
    this._ending = true;
  }
};

// Sets a header value on the current native request
RedirectableRequest.prototype.setHeader = function (name, value) {
  this._options.headers[name] = value;
  this._currentRequest.setHeader(name, value);
};

// Clears a header value on the current native request
RedirectableRequest.prototype.removeHeader = function (name) {
  delete this._options.headers[name];
  this._currentRequest.removeHeader(name);
};

// Global timeout for all underlying requests
RedirectableRequest.prototype.setTimeout = function (msecs, callback) {
  var self = this;

  // Destroys the socket on timeout
  function destroyOnTimeout(socket) {
    socket.setTimeout(msecs);
    socket.removeListener("timeout", socket.destroy);
    socket.addListener("timeout", socket.destroy);
  }

  // Sets up a timer to trigger a timeout event
  function startTimer(socket) {
    if (self._timeout) {
      clearTimeout(self._timeout);
    }
    self._timeout = setTimeout(function () {
      self.emit("timeout");
      clearTimer();
    }, msecs);
    destroyOnTimeout(socket);
  }

  // Stops a timeout from triggering
  function clearTimer() {
    // Clear the timeout
    if (self._timeout) {
      clearTimeout(self._timeout);
      self._timeout = null;
    }

    // Clean up all attached listeners
    self.removeListener("abort", clearTimer);
    self.removeListener("error", clearTimer);
    self.removeListener("response", clearTimer);
    self.removeListener("close", clearTimer);
    if (callback) {
      self.removeListener("timeout", callback);
    }
    if (!self.socket) {
      self._currentRequest.removeListener("socket", startTimer);
    }
  }

  // Attach callback if passed
  if (callback) {
    this.on("timeout", callback);
  }

  // Start the timer if or when the socket is opened
  if (this.socket) {
    startTimer(this.socket);
  }
  else {
    this._currentRequest.once("socket", startTimer);
  }

  // Clean up on events
  this.on("socket", destroyOnTimeout);
  this.on("abort", clearTimer);
  this.on("error", clearTimer);
  this.on("response", clearTimer);
  this.on("close", clearTimer);

  return this;
};

// Proxy all other public ClientRequest methods
[
  "flushHeaders", "getHeader",
  "setNoDelay", "setSocketKeepAlive",
].forEach(function (method) {
  RedirectableRequest.prototype[method] = function (a, b) {
    return this._currentRequest[method](a, b);
  };
});

// Proxy all public ClientRequest properties
["aborted", "connection", "socket"].forEach(function (property) {
  Object.defineProperty(RedirectableRequest.prototype, property, {
    get: function () { return this._currentRequest[property]; },
  });
});

RedirectableRequest.prototype._sanitizeOptions = function (options) {
  // Ensure headers are always present
  if (!options.headers) {
    options.headers = {};
  }

  // Since http.request treats host as an alias of hostname,
  // but the url module interprets host as hostname plus port,
  // eliminate the host property to avoid confusion.
  if (options.host) {
    // Use hostname if set, because it has precedence
    if (!options.hostname) {
      options.hostname = options.host;
    }
    delete options.host;
  }

  // Complete the URL object when necessary
  if (!options.pathname && options.path) {
    var searchPos = options.path.indexOf("?");
    if (searchPos < 0) {
      options.pathname = options.path;
    }
    else {
      options.pathname = options.path.substring(0, searchPos);
      options.search = options.path.substring(searchPos);
    }
  }
};


// Executes the next native request (initial or redirect)
RedirectableRequest.prototype._performRequest = function () {
  // Load the native protocol
  var protocol = this._options.protocol;
  var nativeProtocol = this._options.nativeProtocols[protocol];
  if (!nativeProtocol) {
    throw new TypeError("Unsupported protocol " + protocol);
  }

  // If specified, use the agent corresponding to the protocol
  // (HTTP and HTTPS use different types of agents)
  if (this._options.agents) {
    var scheme = protocol.slice(0, -1);
    this._options.agent = this._options.agents[scheme];
  }

  // Create the native request and set up its event handlers
  var request = this._currentRequest =
        nativeProtocol.request(this._options, this._onNativeResponse);
  request._redirectable = this;
  for (var event of events) {
    request.on(event, eventHandlers[event]);
  }

  // RFC7230§5.3.1: When making a request directly to an origin server, […]
  // a client MUST send only the absolute path […] as the request-target.
  this._currentUrl = /^\//.test(this._options.path) ?
    url.format(this._options) :
    // When making a request to a proxy, […]
    // a client MUST send the target URI in absolute-form […].
    this._options.path;

  // End a redirected request
  // (The first request must be ended explicitly with RedirectableRequest#end)
  if (this._isRedirect) {
    // Write the request entity and end
    var i = 0;
    var self = this;
    var buffers = this._requestBodyBuffers;
    (function writeNext(error) {
      // Only write if this request has not been redirected yet
      /* istanbul ignore else */
      if (request === self._currentRequest) {
        // Report any write errors
        /* istanbul ignore if */
        if (error) {
          self.emit("error", error);
        }
        // Write the next buffer if there are still left
        else if (i < buffers.length) {
          var buffer = buffers[i++];
          /* istanbul ignore else */
          if (!request.finished) {
            request.write(buffer.data, buffer.encoding, writeNext);
          }
        }
        // End the request if `end` has been called on us
        else if (self._ended) {
          request.end();
        }
      }
    }());
  }
};

// Processes a response from the current native request
RedirectableRequest.prototype._processResponse = function (response) {
  // Store the redirected response
  var statusCode = response.statusCode;
  if (this._options.trackRedirects) {
    this._redirects.push({
      url: this._currentUrl,
      headers: response.headers,
      statusCode: statusCode,
    });
  }

  // RFC7231§6.4: The 3xx (Redirection) class of status code indicates
  // that further action needs to be taken by the user agent in order to
  // fulfill the request. If a Location header field is provided,
  // the user agent MAY automatically redirect its request to the URI
  // referenced by the Location field value,
  // even if the specific status code is not understood.

  // If the response is not a redirect; return it as-is
  var location = response.headers.location;
  if (!location || this._options.followRedirects === false ||
      statusCode < 300 || statusCode >= 400) {
    response.responseUrl = this._currentUrl;
    response.redirects = this._redirects;
    this.emit("response", response);

    // Clean up
    this._requestBodyBuffers = [];
    return;
  }

  // The response is a redirect, so abort the current request
  destroyRequest(this._currentRequest);
  // Discard the remainder of the response to avoid waiting for data
  response.destroy();

  // RFC7231§6.4: A client SHOULD detect and intervene
  // in cyclical redirections (i.e., "infinite" redirection loops).
  if (++this._redirectCount > this._options.maxRedirects) {
    throw new TooManyRedirectsError();
  }

  // Store the request headers if applicable
  var requestHeaders;
  var beforeRedirect = this._options.beforeRedirect;
  if (beforeRedirect) {
    requestHeaders = Object.assign({
      // The Host header was set by nativeProtocol.request
      Host: response.req.getHeader("host"),
    }, this._options.headers);
  }

  // RFC7231§6.4: Automatic redirection needs to done with
  // care for methods not known to be safe, […]
  // RFC7231§6.4.2–3: For historical reasons, a user agent MAY change
  // the request method from POST to GET for the subsequent request.
  var method = this._options.method;
  if ((statusCode === 301 || statusCode === 302) && this._options.method === "POST" ||
      // RFC7231§6.4.4: The 303 (See Other) status code indicates that
      // the server is redirecting the user agent to a different resource […]
      // A user agent can perform a retrieval request targeting that URI
      // (a GET or HEAD request if using HTTP) […]
      (statusCode === 303) && !/^(?:GET|HEAD)$/.test(this._options.method)) {
    this._options.method = "GET";
    // Drop a possible entity and headers related to it
    this._requestBodyBuffers = [];
    removeMatchingHeaders(/^content-/i, this._options.headers);
  }

  // Drop the Host header, as the redirect might lead to a different host
  var currentHostHeader = removeMatchingHeaders(/^host$/i, this._options.headers);

  // If the redirect is relative, carry over the host of the last request
  var currentUrlParts = parseUrl(this._currentUrl);
  var currentHost = currentHostHeader || currentUrlParts.host;
  var currentUrl = /^\w+:/.test(location) ? this._currentUrl :
    url.format(Object.assign(currentUrlParts, { host: currentHost }));

  // Create the redirected request
  var redirectUrl = resolveUrl(location, currentUrl);
  debug("redirecting to", redirectUrl.href);
  this._isRedirect = true;
  spreadUrlObject(redirectUrl, this._options);

  // Drop confidential headers when redirecting to a less secure protocol
  // or to a different domain that is not a superdomain
  if (redirectUrl.protocol !== currentUrlParts.protocol &&
     redirectUrl.protocol !== "https:" ||
     redirectUrl.host !== currentHost &&
     !isSubdomain(redirectUrl.host, currentHost)) {
    removeMatchingHeaders(/^(?:authorization|cookie)$/i, this._options.headers);
  }

  // Evaluate the beforeRedirect callback
  if (isFunction(beforeRedirect)) {
    var responseDetails = {
      headers: response.headers,
      statusCode: statusCode,
    };
    var requestDetails = {
      url: currentUrl,
      method: method,
      headers: requestHeaders,
    };
    beforeRedirect(this._options, responseDetails, requestDetails);
    this._sanitizeOptions(this._options);
  }

  // Perform the redirected request
  this._performRequest();
};

// Wraps the key/value object of protocols with redirect functionality
function wrap(protocols) {
  // Default settings
  var exports = {
    maxRedirects: 21,
    maxBodyLength: 10 * 1024 * 1024,
  };

  // Wrap each protocol
  var nativeProtocols = {};
  Object.keys(protocols).forEach(function (scheme) {
    var protocol = scheme + ":";
    var nativeProtocol = nativeProtocols[protocol] = protocols[scheme];
    var wrappedProtocol = exports[scheme] = Object.create(nativeProtocol);

    // Executes a request, following redirects
    function request(input, options, callback) {
      // Parse parameters, ensuring that input is an object
      if (isURL(input)) {
        input = spreadUrlObject(input);
      }
      else if (isString(input)) {
        input = spreadUrlObject(parseUrl(input));
      }
      else {
        callback = options;
        options = validateUrl(input);
        input = { protocol: protocol };
      }
      if (isFunction(options)) {
        callback = options;
        options = null;
      }

      // Set defaults
      options = Object.assign({
        maxRedirects: exports.maxRedirects,
        maxBodyLength: exports.maxBodyLength,
      }, input, options);
      options.nativeProtocols = nativeProtocols;
      if (!isString(options.host) && !isString(options.hostname)) {
        options.hostname = "::1";
      }

      assert.equal(options.protocol, protocol, "protocol mismatch");
      debug("options", options);
      return new RedirectableRequest(options, callback);
    }

    // Executes a GET request, following redirects
    function get(input, options, callback) {
      var wrappedRequest = wrappedProtocol.request(input, options, callback);
      wrappedRequest.end();
      return wrappedRequest;
    }

    // Expose the properties on the wrapped protocol
    Object.defineProperties(wrappedProtocol, {
      request: { value: request, configurable: true, enumerable: true, writable: true },
      get: { value: get, configurable: true, enumerable: true, writable: true },
    });
  });
  return exports;
}

function noop() { /* empty */ }

function parseUrl(input) {
  var parsed;
  /* istanbul ignore else */
  if (useNativeURL) {
    parsed = new URL(input);
  }
  else {
    // Ensure the URL is valid and absolute
    parsed = validateUrl(url.parse(input));
    if (!isString(parsed.protocol)) {
      throw new InvalidUrlError({ input });
    }
  }
  return parsed;
}

function resolveUrl(relative, base) {
  /* istanbul ignore next */
  return useNativeURL ? new URL(relative, base) : parseUrl(url.resolve(base, relative));
}

function validateUrl(input) {
  if (/^\[/.test(input.hostname) && !/^\[[:0-9a-f]+\]$/i.test(input.hostname)) {
    throw new InvalidUrlError({ input: input.href || input });
  }
  if (/^\[/.test(input.host) && !/^\[[:0-9a-f]+\](:\d+)?$/i.test(input.host)) {
    throw new InvalidUrlError({ input: input.href || input });
  }
  return input;
}

function spreadUrlObject(urlObject, target) {
  var spread = target || {};
  for (var key of preservedUrlFields) {
    spread[key] = urlObject[key];
  }

  // Fix IPv6 hostname
  if (spread.hostname.startsWith("[")) {
    spread.hostname = spread.hostname.slice(1, -1);
  }
  // Ensure port is a number
  if (spread.port !== "") {
    spread.port = Number(spread.port);
  }
  // Concatenate path
  spread.path = spread.search ? spread.pathname + spread.search : spread.pathname;

  return spread;
}

function removeMatchingHeaders(regex, headers) {
  var lastValue;
  for (var header in headers) {
    if (regex.test(header)) {
      lastValue = headers[header];
      delete headers[header];
    }
  }
  return (lastValue === null || typeof lastValue === "undefined") ?
    undefined : String(lastValue).trim();
}

function createErrorType(code, message, baseClass) {
  // Create constructor
  function CustomError(properties) {
    Error.captureStackTrace(this, this.constructor);
    Object.assign(this, properties || {});
    this.code = code;
    this.message = this.cause ? message + ": " + this.cause.message : message;
  }

  // Attach constructor and set default properties
  CustomError.prototype = new (baseClass || Error)();
  Object.defineProperties(CustomError.prototype, {
    constructor: {
      value: CustomError,
      enumerable: false,
    },
    name: {
      value: "Error [" + code + "]",
      enumerable: false,
    },
  });
  return CustomError;
}

function destroyRequest(request, error) {
  for (var event of events) {
    request.removeListener(event, eventHandlers[event]);
  }
  request.on("error", noop);
  request.destroy(error);
}

function isSubdomain(subdomain, domain) {
  assert(isString(subdomain) && isString(domain));
  var dot = subdomain.length - domain.length - 1;
  return dot > 0 && subdomain[dot] === "." && subdomain.endsWith(domain);
}

function isString(value) {
  return typeof value === "string" || value instanceof String;
}

function isFunction(value) {
  return typeof value === "function";
}

function isBuffer(value) {
  return typeof value === "object" && ("length" in value);
}

function isURL(value) {
  return URL && value instanceof URL;
}

// Exports
module.exports = wrap({ http: http, https: https });
module.exports.wrap = wrap;


/***/ }),

/***/ "../../../node_modules/ms/index.js":
/*!*****************************************!*\
  !*** ../../../node_modules/ms/index.js ***!
  \*****************************************/
/***/ ((module) => {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return;
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name;
  }
  return Math.ceil(ms / n) + ' ' + name + 's';
}


/***/ }),

/***/ "../../common/src/http-auth-fetch.ts":
/*!*******************************************!*\
  !*** ../../common/src/http-auth-fetch.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.authHttpFetch = void 0;
const http_fetch_1 = __webpack_require__(/*! ../../server/src/fetch/http-fetch */ "../../server/src/fetch/http-fetch.ts");
const auth_fetch_1 = __webpack_require__(/*! ../../packages/auth-fetch/src/auth-fetch */ "../../packages/auth-fetch/src/auth-fetch.ts");
exports.authHttpFetch = (0, auth_fetch_1.createAuthFetch)(http_fetch_1.httpFetch, http_fetch_1.httpFetchParseIncomingMessage);
function ensureType(v) {
}
async function test() {
    const a = await (0, exports.authHttpFetch)({
        credential: undefined,
        url: 'http://example.com',
    });
    ensureType(a.body);
    const b = await (0, exports.authHttpFetch)({
        credential: undefined,
        url: 'http://example.com',
        responseType: 'json',
    });
    ensureType(b.body);
    const c = await (0, exports.authHttpFetch)({
        credential: undefined,
        url: 'http://example.com',
        responseType: 'readable',
    });
    ensureType(c.body);
    const d = await (0, exports.authHttpFetch)({
        credential: undefined,
        url: 'http://example.com',
        responseType: 'buffer',
    });
    ensureType(d.body);
    const e = await (0, exports.authHttpFetch)({
        credential: undefined,
        url: 'http://example.com',
        responseType: 'text',
    });
    ensureType(e.body);
}


/***/ }),

/***/ "../../packages/auth-fetch/src/auth-fetch.ts":
/*!***************************************************!*\
  !*** ../../packages/auth-fetch/src/auth-fetch.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createAuthFetch = void 0;
const fetch_1 = __webpack_require__(/*! ../../../server/src/fetch */ "../../server/src/fetch/index.ts");
async function getAuth(options, url, method) {
    if (!options.credential)
        return;
    const { BASIC, DIGEST, parseWWWAuthenticateHeader } = await Promise.resolve().then(function webpackMissingModule() { var e = new Error("Cannot find module 'http-auth-utils'"); e.code = 'MODULE_NOT_FOUND'; throw e; });
    const credential = options.credential;
    const { digest, basic } = credential;
    if (digest) {
        credential.count ||= 0;
        ++credential.count;
        const nc = ('00000000' + credential.count).slice(-8);
        const cnonce = [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        const uri = new URL(url).pathname;
        const { DIGEST, buildAuthorizationHeader } = await Promise.resolve().then(function webpackMissingModule() { var e = new Error("Cannot find module 'http-auth-utils'"); e.code = 'MODULE_NOT_FOUND'; throw e; });
        const response = DIGEST.computeHash({
            username: options.credential.username,
            password: options.credential.password,
            method,
            uri,
            nc,
            cnonce,
            algorithm: 'MD5',
            qop: digest.data.qop,
            ...digest.data,
        });
        const header = buildAuthorizationHeader(DIGEST, {
            username: options.credential.username,
            uri,
            nc,
            cnonce,
            algorithm: digest.data.algorithm,
            qop: digest.data.qop,
            response,
            ...digest.data,
        });
        return header;
    }
    else if (basic) {
        const { BASIC, buildAuthorizationHeader } = await Promise.resolve().then(function webpackMissingModule() { var e = new Error("Cannot find module 'http-auth-utils'"); e.code = 'MODULE_NOT_FOUND'; throw e; });
        const header = buildAuthorizationHeader(BASIC, {
            username: options.credential.username,
            password: options.credential.password,
        });
        return header;
    }
}
function createAuthFetch(h, parser) {
    const authHttpFetch = async (options) => {
        const method = (0, fetch_1.getFetchMethod)(options);
        const headers = (0, fetch_1.createHeadersArray)(options.headers);
        options.headers = headers;
        (0, fetch_1.setDefaultHttpFetchAccept)(headers, options.responseType);
        const initialHeader = await getAuth(options, options.url, method);
        // try to provide an authorization if a session exists, but don't override Authorization if provided already.
        // 401 will trigger a proper auth.
        if (initialHeader && !(0, fetch_1.hasHeader)(headers, 'Authorization'))
            (0, fetch_1.setHeader)(headers, 'Authorization', initialHeader);
        const controller = new AbortController();
        options.signal?.addEventListener('abort', () => controller.abort(options.signal?.reason));
        const initialResponse = await h({
            ...options,
            signal: controller.signal,
            // need to intercept the status code to check for 401.
            // all other status codes will be handled according to the initial request options.
            checkStatusCode(statusCode) {
                // can handle a 401 if an credential is provided.
                // however, not providing a credential is also valid, and should
                // fall through to the normal response handling which may be interested
                // in the 401 response.
                if (statusCode === 401 && options.credential)
                    return true;
                if (options?.checkStatusCode === undefined || options?.checkStatusCode) {
                    const checker = typeof options?.checkStatusCode === 'function' ? options.checkStatusCode : fetch_1.checkStatus;
                    return checker(statusCode);
                }
                return true;
            },
            responseType: 'readable',
        });
        // if it's not a 401, just return the response.
        if (initialResponse.statusCode !== 401) {
            return {
                ...initialResponse,
                body: await parser(initialResponse.body, options.responseType),
            };
        }
        let authenticateHeaders = initialResponse.headers.get('www-authenticate');
        if (!authenticateHeaders)
            throw new Error('Did not find WWW-Authenticate header.');
        if (typeof authenticateHeaders === 'string')
            authenticateHeaders = [authenticateHeaders];
        const { BASIC, DIGEST, parseWWWAuthenticateHeader } = await Promise.resolve().then(function webpackMissingModule() { var e = new Error("Cannot find module 'http-auth-utils'"); e.code = 'MODULE_NOT_FOUND'; throw e; });
        const parsedHeaders = authenticateHeaders.map(h => parseWWWAuthenticateHeader(h));
        const digest = parsedHeaders.find(p => p.type === 'Digest');
        const basic = parsedHeaders.find(p => p.type === 'Basic');
        const credential = options.credential;
        credential.digest = digest;
        credential.basic = basic;
        if (!digest && !basic)
            throw new Error(`Unknown WWW-Authenticate type: ${parsedHeaders[0]?.type}`);
        const header = await getAuth(options, options.url, method);
        if (header)
            (0, fetch_1.setHeader)(headers, 'Authorization', header);
        return h(options);
    };
    return authHttpFetch;
}
exports.createAuthFetch = createAuthFetch;


/***/ }),

/***/ "./src/axis-api.ts":
/*!*************************!*\
  !*** ./src/axis-api.ts ***!
  \*************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AxisAPI = void 0;
const http_auth_fetch_1 = __webpack_require__(/*! @scrypted/common/src/http-auth-fetch */ "../../common/src/http-auth-fetch.ts");
const events_1 = __webpack_require__(/*! events */ "events");
const sdk_1 = __importDefault(__webpack_require__(/*! @scrypted/sdk */ "../../../node_modules/@scrypted/sdk/dist/src/index.js"));
const { mediaManager } = sdk_1.default;
class AxisAPI {
    constructor(ip, username, password, console) {
        this.ip = ip;
        this.console = console;
        this.credential = {
            username,
            password,
        };
    }
    async request(config) {
        const response = await (0, http_auth_fetch_1.authHttpFetch)({
            ...config,
            rejectUnauthorized: false,
            credential: this.credential,
        }); // add this cast
        return response;
    }
    async getDeviceInfo() {
        const response = await this.request({
            url: `http://${this.ip}/axis-cgi/param.cgi?action=list&group=root.Properties`,
            responseType: 'text',
        });
        const lines = response.body.split('\n');
        const info = {};
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
        const streamProfiles = {};
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
        return Object.entries(streamProfiles).map(([profile, params]) => ({
            id: profile,
            name: params.Name || profile,
            url: null,
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
    async subscribeToEvents() {
        const eventEmitter = new events_1.EventEmitter();
        const response = await this.request({
            url: `http://${this.ip}/axis-cgi/event/oneevent.cgi`,
            responseType: 'stream',
        });
        const stream = response.body;
        stream.on('data', (chunk) => {
            const data = chunk.toString();
            if (data.includes('MotionDetection')) {
                const active = data.includes('active=yes');
                eventEmitter.emit('MotionDetected', active);
            }
        });
        return eventEmitter;
    }
    async takeSnapshot() {
        const response = await this.request({
            url: `http://${this.ip}/axis-cgi/jpg/image.cgi`,
            responseType: 'arraybuffer',
        });
        return Buffer.from(response.body);
    }
}
exports.AxisAPI = AxisAPI;


/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const sdk_1 = __importStar(__webpack_require__(/*! @scrypted/sdk */ "../../../node_modules/@scrypted/sdk/dist/src/index.js"));
const rtsp_1 = __webpack_require__(/*! ../../rtsp/src/rtsp */ "../rtsp/src/rtsp.ts");
const axis_api_1 = __webpack_require__(/*! ./axis-api */ "./src/axis-api.ts");
const { mediaManager } = sdk_1.default;
class AxisCamera extends rtsp_1.RtspSmartCamera {
    takeSmartCameraPicture(options) {
        throw new Error("Method not implemented.");
    }
    getConstructedVideoStreamOptions() {
        throw new Error("Method not implemented.");
    }
    constructor(nativeId, provider) {
        super(nativeId, provider);
        this.newMethod().api = new axis_api_1.AxisAPI(this.getHttpAddress(), this.getUsername(), this.getPassword(), this.console);
        this.updateDevice();
        this.listenEvents();
    }
    newMethod() {
        return this;
    }
    getHttpAddress() {
        return this.storage.getItem('ip') || '';
    }
    getUsername() {
        return this.storage.getItem('username') || '';
    }
    getPassword() {
        return this.storage.getItem('password') || '';
    }
    async updateDevice() {
        const interfaces = [
            sdk_1.ScryptedInterface.VideoCamera,
            sdk_1.ScryptedInterface.Camera,
            sdk_1.ScryptedInterface.MotionSensor,
        ];
        this.provider.updateDevice(this.nativeId, this.name, interfaces, sdk_1.ScryptedDeviceType.Camera);
    }
    async getVideoStreamOptions() {
        try {
            const streamOptions = await this.api.getVideoStreamOptions();
            return streamOptions.map(option => ({
                ...option,
                url: `rtsp://${this.getUsername()}:${this.getPassword()}@${this.getHttpAddress()}${option.path}`,
                tool: 'ffmpeg',
            }));
        }
        catch (error) {
            this.console.error('Error getting video stream options:', error);
            return [];
        }
    }
    async listenEvents() {
        try {
            const events = await this.api.subscribeToEvents();
            events.on('MotionDetected', (active) => {
                this.motionDetected = active;
            });
        }
        catch (error) {
            this.console.error('Error subscribing to events:', error);
        }
    }
    async takePicture() {
        try {
            const imageBuffer = await this.api.takeSnapshot();
            return mediaManager.createMediaObject(imageBuffer, 'image/jpeg');
        }
        catch (error) {
            this.console.error('Error taking picture:', error);
            throw error;
        }
    }
    getPictureOptions() {
        return null;
    }
}
class AxisProvider extends rtsp_1.RtspProvider {
    getScryptedDeviceCreator() {
        throw new Error("Method not implemented.");
    }
    getAdditionalInterfaces() {
        return [
            sdk_1.ScryptedInterface.VideoCamera,
            sdk_1.ScryptedInterface.Camera,
            sdk_1.ScryptedInterface.MotionSensor,
        ];
    }
    createCamera(nativeId) {
        return new AxisCamera(nativeId, this);
    }
    async createDevice(settings) {
        const { ip, username, password } = settings;
        try {
            const api = new axis_api_1.AxisAPI(ip, username, password, this.console);
            const deviceInfo = await api.getDeviceInfo();
            const nativeId = await super.createDevice(settings);
            const camera = await this.getDevice(nativeId);
            camera.putSetting('username', username);
            camera.putSetting('password', password);
            camera.putSetting('ip', ip);
            camera.info = {
                model: deviceInfo.model,
                manufacturer: 'Axis',
                firmware: deviceInfo.firmware,
                serialNumber: deviceInfo.serialNumber,
            };
            return nativeId;
        }
        catch (error) {
            this.console.error('Error creating Axis camera device:', error);
            throw error;
        }
    }
    async getCreateDeviceSettings() {
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
exports["default"] = AxisProvider;


/***/ }),

/***/ "../ffmpeg-camera/src/common.ts":
/*!**************************************!*\
  !*** ../ffmpeg-camera/src/common.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CameraProviderBase = exports.CameraBase = void 0;
const sdk_1 = __importStar(__webpack_require__(/*! @scrypted/sdk */ "../../../node_modules/@scrypted/sdk/dist/src/index.js"));
const crypto_1 = __webpack_require__(/*! crypto */ "crypto");
const { deviceManager } = sdk_1.default;
class CameraBase extends sdk_1.ScryptedDeviceBase {
    constructor(nativeId, provider) {
        super(nativeId);
        this.provider = provider;
    }
    takePicture(option) {
        throw new Error("The RTSP Camera does not provide snapshots. Install the Snapshot Plugin if snapshots are available via an URL.");
    }
    async getPictureOptions() {
        return;
    }
    async getVideoStreamOptions() {
        const vsos = this.getRawVideoStreamOptions();
        return vsos;
    }
    isAudioDisabled() {
        return this.storage.getItem('noAudio') === 'true';
    }
    async getVideoStream(options) {
        const vsos = await this.getVideoStreamOptions();
        const vso = vsos?.find(s => s.id === options?.id) || this.getDefaultStream(vsos);
        return this.createVideoStream(vso);
    }
    async getUrlSettings() {
        return [];
    }
    getUsername() {
        return this.storage.getItem('username');
    }
    getPassword() {
        return this.storage.getItem('password');
    }
    async getOtherSettings() {
        return [];
    }
    getDefaultStream(vsos) {
        return vsos?.[0];
    }
    async getStreamSettings() {
        return [];
    }
    getUsernameDescription() {
        return 'Optional: Username for snapshot http requests.';
    }
    getPasswordDescription() {
        return 'Optional: Password for snapshot http requests.';
    }
    async getSettings() {
        const ret = [
            {
                key: 'username',
                title: 'Username',
                value: this.getUsername(),
                description: this.getUsernameDescription(),
            },
            {
                key: 'password',
                title: 'Password',
                value: this.getPassword(),
                type: 'password',
                description: this.getPasswordDescription(),
            },
            ...await this.getUrlSettings(),
            ...await this.getStreamSettings(),
            ...await this.getOtherSettings(),
            {
                key: 'noAudio',
                title: 'No Audio',
                description: 'Enable this setting if the camera does not have audio or to mute audio.',
                type: 'boolean',
                value: (this.isAudioDisabled()).toString(),
            },
        ];
        for (const s of ret) {
            s.group = this.provider.name.replace('Plugin', '').trim();
            s.subgroup ||= 'General';
        }
        return ret;
    }
    async putSettingBase(key, value) {
        if (key === 'defaultStream') {
            const vsos = await this.getVideoStreamOptions();
            const stream = vsos.find(vso => vso.name === value);
            this.storage.setItem('defaultStream', stream?.id || '');
        }
        else {
            this.storage.setItem(key, value.toString());
        }
        this.onDeviceEvent(sdk_1.ScryptedInterface.Settings, undefined);
    }
    async putSetting(key, value) {
        this.putSettingBase(key, value);
    }
}
exports.CameraBase = CameraBase;
class CameraProviderBase extends sdk_1.ScryptedDeviceBase {
    constructor(nativeId) {
        super(nativeId);
        this.devices = new Map();
        this.systemDevice = {
            deviceCreator: this.getScryptedDeviceCreator(),
        };
    }
    async createDevice(settings, nativeId) {
        nativeId ||= (0, crypto_1.randomBytes)(4).toString('hex');
        const name = settings.newCamera?.toString() || 'New Camera';
        await this.updateDevice(nativeId, name, this.getInterfaces());
        return nativeId;
    }
    async getCreateDeviceSettings() {
        return [
            {
                key: 'newCamera',
                title: 'Add Camera',
                placeholder: 'Camera name, e.g.: Back Yard Camera, Baby Camera, etc',
            }
        ];
    }
    getAdditionalInterfaces() {
        return [];
    }
    getInterfaces() {
        return [
            sdk_1.ScryptedInterface.VideoCamera,
            sdk_1.ScryptedInterface.Settings,
            ...this.getAdditionalInterfaces()
        ];
    }
    updateDevice(nativeId, name, interfaces, type) {
        return deviceManager.onDeviceDiscovered({
            nativeId,
            name,
            interfaces,
            type: type || sdk_1.ScryptedDeviceType.Camera,
            info: deviceManager.getNativeIds().includes(nativeId) ? deviceManager.getDeviceState(nativeId)?.info : undefined,
        });
    }
    getDevice(nativeId) {
        let ret = this.devices.get(nativeId);
        if (!ret) {
            ret = this.createCamera(nativeId);
            if (ret)
                this.devices.set(nativeId, ret);
        }
        return ret;
    }
    async releaseDevice(id, nativeId) {
        this.devices.delete(nativeId);
    }
}
exports.CameraProviderBase = CameraProviderBase;


/***/ }),

/***/ "../rtsp/src/rtsp.ts":
/*!***************************!*\
  !*** ../rtsp/src/rtsp.ts ***!
  \***************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RtspProvider = exports.RtspSmartCamera = exports.RtspCamera = void 0;
const promise_utils_1 = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module '@scrypted/common/src/promise-utils'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
const sdk_1 = __importStar(__webpack_require__(/*! @scrypted/sdk */ "../../../node_modules/@scrypted/sdk/dist/src/index.js"));
const url_1 = __importDefault(__webpack_require__(/*! url */ "url"));
const common_1 = __webpack_require__(/*! ../../ffmpeg-camera/src/common */ "../ffmpeg-camera/src/common.ts");
const { mediaManager } = sdk_1.default;
class RtspCamera extends common_1.CameraBase {
    takePicture(option) {
        throw new Error("The RTSP Camera does not provide snapshots. Install the Snapshot Plugin if snapshots are available via an URL.");
    }
    createRtspMediaStreamOptions(url, index) {
        return {
            id: `channel${index}`,
            name: `Stream ${index + 1}`,
            url,
            container: 'rtsp',
            video: {},
            audio: this.isAudioDisabled() ? null : {},
        };
    }
    getChannelFromMediaStreamOptionsId(id) {
        return id.substring('channel'.length);
    }
    getRawVideoStreamOptions() {
        let urls = [];
        try {
            urls = JSON.parse(this.storage.getItem('urls'));
        }
        catch (e) {
            const url = this.storage.getItem('url');
            if (url) {
                urls.push(url);
                this.storage.setItem('urls', JSON.stringify(urls));
                this.storage.removeItem('url');
            }
        }
        // filter out empty strings.
        const ret = urls.filter(url => !!url).map((url, index) => this.createRtspMediaStreamOptions(url, index));
        if (!ret.length)
            return;
        return ret;
    }
    addRtspCredentials(rtspUrl) {
        // ignore this deprecation warning. the WHATWG URL class will trim the password
        // off if it is empty, resulting in urls like rtsp://admin@foo.com/.
        // this causes ffmpeg to fail on sending a blank password.
        // we need to send it as follows: rtsp://admin:@foo.com/.
        // Note the trailing colon.
        // issue: https://github.com/koush/scrypted/issues/134
        const parsedUrl = url_1.default.parse(rtspUrl);
        this.console.log('stream url', rtspUrl);
        const username = this.storage.getItem("username");
        const password = this.storage.getItem("password");
        if (username) {
            // if a username is set, ensure a trailing colon is sent for blank password.
            const auth = `${username}:${password || ''}`;
            parsedUrl.auth = auth;
        }
        const stringUrl = url_1.default.format(parsedUrl);
        return stringUrl;
    }
    createMediaStreamUrl(stringUrl, vso) {
        const ret = {
            container: vso.container,
            url: stringUrl,
            mediaStreamOptions: vso,
        };
        return this.createMediaObject(ret, sdk_1.ScryptedMimeTypes.MediaStreamUrl);
    }
    async createVideoStream(vso) {
        if (!vso)
            throw new Error('video streams not set up or no longer exists.');
        const stringUrl = this.addRtspCredentials(vso.url);
        return this.createMediaStreamUrl(stringUrl, vso);
    }
    // hide the description from CameraBase that indicates it is only used for snapshots
    getUsernameDescription() {
        return;
    }
    // hide the description from CameraBase that indicates it is only used for snapshots
    getPasswordDescription() {
        return;
    }
    async getRtspUrlSettings() {
        return [
            {
                key: 'urls',
                title: 'RTSP Stream URL',
                description: 'An RTSP Stream URL provided by the camera.',
                placeholder: 'rtsp://192.168.1.100[:554]/channel/101',
                value: this.getRawVideoStreamOptions()?.map(vso => vso.url),
                multiple: true,
            },
        ];
    }
    async getOtherSettings() {
        const ret = [];
        ret.push({
            subgroup: 'Advanced',
            key: 'debug',
            title: 'Debug Events',
            description: "Log all events to the console. This will be very noisy and should not be left enabled.",
            value: this.storage.getItem('debug') === 'true',
            type: 'boolean',
        });
        return ret;
    }
    async getUrlSettings() {
        return [
            ...await this.getRtspUrlSettings(),
        ];
    }
    async putRtspUrls(urls) {
        this.storage.setItem('urls', JSON.stringify(urls.filter(url => !!url)));
        this.onDeviceEvent(sdk_1.ScryptedInterface.Settings, undefined);
    }
    async putSettingBase(key, value) {
        if (key === 'urls') {
            this.putRtspUrls(value);
        }
        else {
            super.putSettingBase(key, value);
        }
    }
}
exports.RtspCamera = RtspCamera;
class RtspSmartCamera extends RtspCamera {
    constructor(nativeId, provider) {
        super(nativeId, provider);
        this.lastListen = 0;
        process.nextTick(() => this.listenLoop());
    }
    resetSensors() {
        if (this.interfaces.includes(sdk_1.ScryptedInterface.MotionSensor))
            this.motionDetected = false;
        if (this.interfaces.includes(sdk_1.ScryptedInterface.AudioSensor))
            this.audioDetected = false;
        if (this.interfaces.includes(sdk_1.ScryptedInterface.TamperSensor))
            this.tampered = false;
        if (this.interfaces.includes(sdk_1.ScryptedInterface.BinarySensor))
            this.binaryState = false;
    }
    async listenLoop() {
        this.resetSensors();
        this.lastListen = Date.now();
        if (this.listener)
            return;
        let listener;
        const listenerPromise = this.listener = this.listenEvents();
        let activityTimeout;
        const restartListener = () => {
            if (listenerPromise === this.listener)
                this.listener = undefined;
            clearTimeout(activityTimeout);
            listener?.destroy();
            const listenDuration = Date.now() - this.lastListen;
            const listenNext = listenDuration > 10000 ? 0 : 10000;
            setTimeout(() => this.listenLoop(), listenNext);
        };
        try {
            listener = await this.listener;
        }
        catch (e) {
            this.console.error('listen loop connection failed, restarting listener.', e.message);
            restartListener();
            return;
        }
        const resetActivityTimeout = () => {
            clearTimeout(activityTimeout);
            activityTimeout = setTimeout(() => {
                this.console.error('listen loop 5m idle timeout, destroying listener.');
                restartListener();
            }, 300000);
        };
        resetActivityTimeout();
        listener.on('data', (data) => {
            if (this.storage.getItem('debug') === 'true')
                this.console.log('debug event:\n', data.toString());
            resetActivityTimeout();
        });
        listener.on('close', () => {
            this.console.error('listen loop closed, restarting listener.');
            restartListener();
        });
        listener.on('error', e => {
            this.console.error('listen loop error, restarting listener.', e);
            restartListener();
        });
    }
    async putSetting(key, value) {
        this.putSettingBase(key, value);
        this.listener.then(l => l.emit('error', new Error("new settings")));
    }
    async takePicture(options) {
        return this.takeSmartCameraPicture(options);
    }
    async getRtspUrlSettings() {
        return [
            {
                key: 'urls',
                title: 'RTSP Stream URL Override',
                description: 'Override the RTSP Stream URL provided by the camera.',
                placeholder: 'rtsp://192.168.1.100[:554]/channel/101',
                value: this.getRawVideoStreamOptions()?.map(vso => vso.url),
                multiple: true,
            },
        ];
    }
    async getUrlSettings() {
        const ret = [
            {
                key: 'ip',
                title: 'IP Address',
                placeholder: '192.168.1.100',
                value: this.storage.getItem('ip'),
            },
            ...this.getHttpPortOverrideSettings(),
            ...await this.getRtspPortOverrideSettings(),
        ];
        if (this.showRtspUrlOverride()) {
            const legacyOverride = this.storage.getItem('rtspUrlOverride');
            if (legacyOverride) {
                await this.putRtspUrls([legacyOverride]);
                this.storage.removeItem('rtspUrlOverride');
            }
            ret.push(...await this.getRtspUrlSettings());
        }
        return ret;
    }
    getHttpPortOverrideSettings() {
        if (!this.showHttpPortOverride()) {
            return [];
        }
        return [
            {
                key: 'httpPort',
                subgroup: 'Advanced',
                title: 'HTTP Port Override',
                placeholder: '80',
                value: this.storage.getItem('httpPort'),
            }
        ];
    }
    showHttpPortOverride() {
        return true;
    }
    async getRtspPortOverrideSettings() {
        if (!this.showRtspPortOverride()) {
            return [];
        }
        return [
            {
                key: 'rtspPort',
                subgroup: 'Advanced',
                title: 'RTSP Port Override',
                placeholder: '554',
                value: this.storage.getItem('rtspPort'),
            },
        ];
    }
    showRtspPortOverride() {
        return true;
    }
    showRtspUrlOverride() {
        return true;
    }
    getHttpAddress() {
        return `${this.getIPAddress()}:${this.storage.getItem('httpPort') || 80}`;
    }
    setHttpPortOverride(port) {
        this.storage.setItem('httpPort', port || '');
    }
    getRtspUrlOverride() {
        if (!this.showRtspUrlOverride())
            return;
        return this.storage.getItem('rtspUrlOverride');
    }
    getIPAddress() {
        return this.storage.getItem('ip');
    }
    setIPAddress(ip) {
        return this.storage.setItem('ip', ip);
    }
    getRtspAddress() {
        return `${this.getIPAddress()}:${this.storage.getItem('rtspPort') || 554}`;
    }
    async getVideoStreamOptions() {
        if (this.showRtspUrlOverride()) {
            const vsos = await super.getVideoStreamOptions();
            if (vsos)
                return vsos;
        }
        if (this.constructedVideoStreamOptions)
            return this.constructedVideoStreamOptions;
        this.constructedVideoStreamOptions = (0, promise_utils_1.timeoutPromise)(5000, this.getConstructedVideoStreamOptions()).finally(() => {
            this.constructedVideoStreamOptions = undefined;
        });
        return this.constructedVideoStreamOptions;
    }
    putSettingBase(key, value) {
        this.constructedVideoStreamOptions = undefined;
        return super.putSettingBase(key, value);
    }
}
exports.RtspSmartCamera = RtspSmartCamera;
class RtspProvider extends common_1.CameraProviderBase {
    createCamera(nativeId) {
        return new RtspCamera(nativeId, this);
    }
}
exports.RtspProvider = RtspProvider;


/***/ }),

/***/ "../../server/src/fetch/http-fetch.ts":
/*!********************************************!*\
  !*** ../../server/src/fetch/http-fetch.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.httpFetch = exports.httpFetchParseIncomingMessage = exports.getHttpFetchParser = void 0;
const _1 = __webpack_require__(/*! . */ "../../server/src/fetch/index.ts");
async function readMessageBuffer(response) {
    const buffers = [];
    response.on('data', buffer => buffers.push(buffer));
    const { once } = __webpack_require__(/*! events */ "events");
    await once(response, 'end');
    return Buffer.concat(buffers);
}
const TextParser = {
    async parse(message) {
        return (await readMessageBuffer(message)).toString();
    }
};
const JSONParser = {
    async parse(message) {
        return JSON.parse((await readMessageBuffer(message)).toString());
    }
};
const BufferParser = {
    async parse(message) {
        return readMessageBuffer(message);
    }
};
const StreamParser = {
    async parse(message) {
        return message;
    }
};
function getHttpFetchParser(responseType) {
    switch (responseType) {
        case 'json':
            return JSONParser;
        case 'text':
            return TextParser;
        case 'readable':
            return StreamParser;
    }
    return BufferParser;
}
exports.getHttpFetchParser = getHttpFetchParser;
function httpFetchParseIncomingMessage(readable, responseType) {
    return getHttpFetchParser(responseType).parse(readable);
}
exports.httpFetchParseIncomingMessage = httpFetchParseIncomingMessage;
async function httpFetch(options) {
    const headers = (0, _1.createHeadersArray)(options.headers);
    (0, _1.setDefaultHttpFetchAccept)(headers, options.responseType);
    const { once } = __webpack_require__(/*! events */ "events");
    const { PassThrough, Readable } = __webpack_require__(/*! stream */ "stream");
    const { http, https } = __webpack_require__(/*! follow-redirects */ "../../../node_modules/follow-redirects/index.js");
    const { url } = options;
    const isSecure = url.toString().startsWith('https:');
    const proto = isSecure ? https : http;
    let { body } = options;
    if (body && !(body instanceof Readable)) {
        const newBody = new PassThrough();
        newBody.write(Buffer.from((0, _1.createStringOrBufferBody)(headers, body)));
        newBody.end();
        body = newBody;
    }
    let controller;
    let timeout;
    if (options.timeout) {
        controller = new AbortController();
        timeout = setTimeout(() => controller.abort(), options.timeout);
        options.signal?.addEventListener('abort', () => controller.abort(options.signal?.reason));
    }
    const signal = controller?.signal || options.signal;
    signal?.addEventListener('abort', () => request.destroy(new Error(options.signal?.reason || 'abort')));
    const nodeHeaders = {};
    for (const [k, v] of headers) {
        if (nodeHeaders[k]) {
            nodeHeaders[k].push(v);
        }
        else {
            nodeHeaders[k] = [v];
        }
    }
    const request = proto.request(url, {
        method: (0, _1.getFetchMethod)(options),
        rejectUnauthorized: options.rejectUnauthorized,
        family: options.family,
        headers: nodeHeaders,
        signal,
        timeout: options.timeout,
    });
    if (body)
        body.pipe(request);
    else
        request.end();
    try {
        const [response] = await once(request, 'response');
        if (options?.checkStatusCode === undefined || options?.checkStatusCode) {
            try {
                const checker = typeof options?.checkStatusCode === 'function' ? options.checkStatusCode : _1.checkStatus;
                if (!checker(response.statusCode))
                    throw new Error(`http response statusCode ${response.statusCode}`);
            }
            catch (e) {
                readMessageBuffer(response).catch(() => { });
                throw e;
            }
        }
        const incomingHeaders = new Headers();
        for (const [k, v] of Object.entries(response.headers)) {
            for (const vv of (typeof v === 'string' ? [v] : v)) {
                incomingHeaders.append(k, vv);
            }
        }
        return {
            statusCode: response.statusCode,
            headers: incomingHeaders,
            body: await httpFetchParseIncomingMessage(response, options.responseType),
        };
    }
    finally {
        clearTimeout(timeout);
    }
}
exports.httpFetch = httpFetch;


/***/ }),

/***/ "../../server/src/fetch/index.ts":
/*!***************************************!*\
  !*** ../../server/src/fetch/index.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.domFetch = exports.domFetchParseIncomingMessage = exports.createStringOrBufferBody = exports.createHeadersArray = exports.setDefaultHttpFetchAccept = exports.setHeader = exports.removeHeader = exports.hasHeader = exports.getHttpFetchAccept = exports.getFetchMethod = exports.checkStatus = exports.fetchStatusCodeOk = void 0;
function fetchStatusCodeOk(statusCode) {
    return statusCode >= 200 && statusCode <= 299;
}
exports.fetchStatusCodeOk = fetchStatusCodeOk;
function checkStatus(statusCode) {
    if (!fetchStatusCodeOk(statusCode))
        throw new Error(`http response statusCode ${statusCode}`);
    return true;
}
exports.checkStatus = checkStatus;
function getFetchMethod(options) {
    const method = options.method || (options.body ? 'POST' : 'GET');
    return method;
}
exports.getFetchMethod = getFetchMethod;
function getHttpFetchAccept(responseType) {
    switch (responseType) {
        case 'json':
            return 'application/json';
        case 'text':
            return 'text/plain';
    }
    return;
}
exports.getHttpFetchAccept = getHttpFetchAccept;
function hasHeader(headers, key) {
    key = key.toLowerCase();
    return headers.find(([k]) => k.toLowerCase() === key);
}
exports.hasHeader = hasHeader;
function removeHeader(headers, key) {
    key = key.toLowerCase();
    const filteredHeaders = headers.filter(([headerKey, _]) => headerKey.toLowerCase() !== key);
    headers.length = 0;
    filteredHeaders.forEach(header => headers.push(header));
}
exports.removeHeader = removeHeader;
function setHeader(headers, key, value) {
    removeHeader(headers, key);
    headers.push([key, value]);
}
exports.setHeader = setHeader;
function setDefaultHttpFetchAccept(headers, responseType) {
    if (hasHeader(headers, 'Accept'))
        return;
    const accept = getHttpFetchAccept(responseType);
    if (accept)
        setHeader(headers, 'Accept', accept);
}
exports.setDefaultHttpFetchAccept = setDefaultHttpFetchAccept;
function createHeadersArray(headers) {
    const headersArray = [];
    if (!headers)
        return headersArray;
    if (headers instanceof Headers) {
        for (const [k, v] of headers.entries()) {
            headersArray.push([k, v]);
        }
        return headersArray;
    }
    if (headers instanceof Array) {
        for (const [k, v] of headers) {
            headersArray.push([k, v]);
        }
        return headersArray;
    }
    for (const k of Object.keys(headers)) {
        const v = headers[k];
        headersArray.push([k, v]);
    }
    return headersArray;
}
exports.createHeadersArray = createHeadersArray;
/**
 *
 * @param headers
 * @param body
 * @returns Returns the body and Content-Type header that was set.
 */
function createStringOrBufferBody(headers, body) {
    let contentType;
    if (typeof body === 'object') {
        body = JSON.stringify(body);
        contentType = 'application/json';
    }
    else if (typeof body === 'string') {
        contentType = 'text/plain';
    }
    if (!hasHeader(headers, 'Content-Type'))
        setHeader(headers, 'Content-Type', contentType);
    return body;
}
exports.createStringOrBufferBody = createStringOrBufferBody;
async function domFetchParseIncomingMessage(response, responseType) {
    switch (responseType) {
        case 'json':
            return response.json();
        case 'text':
            return response.text();
        case 'readable':
            return response;
    }
    return new Uint8Array(await response.arrayBuffer());
}
exports.domFetchParseIncomingMessage = domFetchParseIncomingMessage;
async function domFetch(options) {
    const headers = createHeadersArray(options.headers);
    setDefaultHttpFetchAccept(headers, options.responseType);
    let { body } = options;
    if (body && !(body instanceof ReadableStream)) {
        body = createStringOrBufferBody(headers, body);
    }
    let controller;
    let timeout;
    if (options.timeout) {
        controller = new AbortController();
        timeout = setTimeout(() => controller.abort(), options.timeout);
        options.signal?.addEventListener('abort', () => controller.abort(options.signal?.reason));
    }
    try {
        const { url } = options;
        const response = await fetch(url, {
            method: getFetchMethod(options),
            credentials: options.withCredentials ? 'include' : undefined,
            headers,
            signal: controller?.signal || options.signal,
            body,
        });
        if (options?.checkStatusCode === undefined || options?.checkStatusCode) {
            try {
                const checker = typeof options?.checkStatusCode === 'function' ? options.checkStatusCode : checkStatus;
                if (!checker(response.status))
                    throw new Error(`http response statusCode ${response.status}`);
            }
            catch (e) {
                response.arrayBuffer().catch(() => { });
                throw e;
            }
        }
        return {
            statusCode: response.status,
            headers: response.headers,
            body: await domFetchParseIncomingMessage(response, options.responseType),
        };
    }
    finally {
        clearTimeout(timeout);
    }
}
exports.domFetch = domFetch;


/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("assert");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ "net":
/*!**********************!*\
  !*** external "net" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("net");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "tty":
/*!**********************!*\
  !*** external "tty" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("tty");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/main.ts");
/******/ 	var __webpack_export_target__ = (exports = typeof exports === "undefined" ? {} : exports);
/******/ 	for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
/******/ 	if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ 	
/******/ })()
;
//# sourceMappingURL=main.nodejs.js.map