import {Projectile} from '../Projectile_ts'

export class Arrow extends Projectile {
    constructor(scene, creator) {
        super(scene, creator, 'arrow', 'arrow');
        this.setScale(0.15);
        this.setPosition(
            creator.x + creator.displayWidth / 2,
            creator.y
        );
    }
}
