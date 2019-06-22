import {Projectile} from '../Projectile_ts'

export class BallSpellProjectile extends Projectile {
    constructor(scene, creator, texture, type) {
        super(scene, creator, texture, type);

        // fire/ice ball model
        this.setScale(3).setRotation(Math.PI);
        this.setSize(10, 10);

        this.anims.play(type + '-burn');
    }
}
