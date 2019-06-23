import 'phaser'
import {Controller} from './Controller'
import {Player} from '../Player_ts'

export class YungSkryllaScenePreload extends Phaser.Scene {
    controller: Controller;
    players: Player[];
    player: Player;

    constructor(config) {
        super(config);
        this.players = [];
        if (this.constructor === YungSkryllaScenePreload) {
            throw new TypeError('Abstract class "YungSkryllaScenePreload" cannot be instantiated directly.');
        }
    }

    preload(): void {
        this.controller = new Controller(this);
        console.log('preload');
        this.load.image('platform', 'assets/blocks/platform.png');
        this.load.spritesheet('adventurer', 'assets/adventurer/adventurer-sheet.png', { frameWidth: 50, frameHeight: 37 });
        this.load.spritesheet('adventurer-bow', 'assets/adventurer/adventurer-bow-sheet.png', { frameWidth: 50, frameHeight: 37 });
        this.load.spritesheet('fireball-small', 'assets/fire/fires/Small_Fireball_10x26.png', { frameWidth: 10, frameHeight: 26 });
        this.load.spritesheet('fireball', 'assets/fire/fires/Fireball_68x9.png', { frameWidth: 68, frameHeight: 9 });
        this.load.spritesheet('iceball', 'assets/fire/fires/Iceball_84x9.png', { frameWidth: 84, frameHeight: 9 });
        this.load.spritesheet('arrow', 'assets/other/arrow.png', { frameWidth: 434, frameHeight: 63 });
        this.load.spritesheet('solar_vortex', 'assets/effects/13_vortex_spritesheet.png', { frameWidth: 100, frameHeight: 100 });
        this.load.spritesheet('snow_vortex', 'assets/effects/12_nebula_spritesheet.png', { frameWidth: 100, frameHeight: 100 });

        this.load.image('sky', 'assets/blocks/back-walls.png');
        this.load.image('logo', 'assets/blocks/phaser3-logo.png');
        this.load.image('red', 'assets/blocks/red.png');
    }
};
