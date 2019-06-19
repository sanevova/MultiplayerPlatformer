import {YungSkryllaSceneCreate} from './YungSkryllaSceneCreate'

export class YungSkryllaSceneUpdate extends YungSkryllaSceneCreate {
    constructor(config) {
        super(config);
        if (this.constructor === YungSkryllaSceneUpdate) {
            throw new TypeError('Abstract class "YungSkryllaSceneUpdate" cannot be instantiated directly.');
        }
    }
}
