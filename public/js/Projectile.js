kProjectileSpeed = {
    'arrow': 1000,
    'fireball': 800,
    'iceball': 600
};

kProjectileDamage = {
    'arrow': 10,
    'fireball': 30,
    'iceball': 40
};

class Projectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, creator, texture, type) {
        let x = creator.x;
        let y = creator.y - creator.displayHeight / 4;
        super(scene, x, y, texture);
        this.type = type;
        this.creator = creator;
        scene.add.existing(this);
        scene.physics.add.existing(this);
        scene.physics.add.collider(
            this,
            scene.game.platforms,
            (projectile, platform) => projectile.didCollideWithPlatform(platform));

        // global state = questionable
        game.players.map(aPlayer => {
            // don't add collisions with player who created the projectile
            if (aPlayer !== this.creator) {
                scene.physics.add.collider(
                    this,
                    aPlayer,
                    (projectile, target) =>
                        projectile.didCollideWithPlayer(target)
                );
            }
        });

        // minimize knockback
        this.setMass(0.000001);
        this.body.setAllowGravity(false);
        this.body.setCollideWorldBounds(true);
        this.body.onWorldBounds = true;

        // fire/ice ball model
        this.setScale(3).setRotation(Math.PI);
        this.setSize(10, 10);
        // this.setOrigin(0.8, 1);
        this.setPosition(x - creator.displayWidth, y);
        this.flipX = creator.flipX;
        let isLookingLeft = creator.flipX;
        if (isLookingLeft) {
            this.setOrigin(1.2, 1);
            this.setVelocityX(-kProjectileSpeed[type]);
        } else {
            this.setOrigin(0.8, 1);
            this.setVelocityX(kProjectileSpeed[type]);
        }
        this.anims.play(type + '-burn');
        this.creator.projectiles.push(this);
    }

    didCollideWithPlatform(platform) {
        this.destroy();
    }

    didCollideWithPlayer(target, a, b) {
        if (this.creator === target) {
            console.log('lol hit urself noob');
            return;
        }
        target.receiveDamage(kProjectileDamage[this.type]);
    }

    destroy() {
        let index = this.creator.projectiles.indexOf(this);
        if (index !== -1) {
          this.creator.projectiles.splice(index, 1);
        }
        super.destroy();
    }
}
