import 'phaser'
import {Player} from '../Player_ts'

export class Vortex extends Phaser.Physics.Arcade.Sprite {
    static defaultDuration: number = 5 * 1000; // 5 sec default duration

    creator: Player;
    duration: number;

    constructor(scene, creator, x, y, texture, duration = Vortex.defaultDuration) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.creator = creator;
        this.duration = duration;

        // @ts-ignore
        this.body.setAllowGravity(false)
        this.anims.play(texture + '-spin');

        this.creator.aoeSpellObjects.push(this);
        this._destroyAfterDuration();
    }

    _destroyAfterDuration() {
        (function(vortex) {
            setTimeout(() => {
                let index = vortex.creator.aoeSpellObjects.findIndex(
                    v => v === vortex
                );
                if (index > -1) {
                    vortex.creator.aoeSpellObjects.splice(index, 1);
                }
                vortex.destroy();
            }, vortex.duration);
        })(this);
    }

    didCollideWithPlayer(player: Player) {
        console.log(`collode with ${player.name}`);
    }
}
