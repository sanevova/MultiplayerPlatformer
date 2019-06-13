class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, name, texture = 'adventurer') {
        // init and bind to scene
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.name = name;
        this.setSize(25, 34).setScale(2)
        this.setCollideWorldBounds(true);
        this.health = 100;

        // player name object
        this.nameTag = scene.add.text(x, y, name, kNameFont);
        // health bar object
        this.healthBar = scene.add.graphics();
        return this;
    }

    update() {
        this._drawChildren();

        // state
        this.airborne = !this.body.touching.down;
        this.moveSpeed = this.isCrouching ? moveSpeedNormal / 3 : moveSpeedNormal;
        this.shouldAnimateMovement = !this.airborne && !this.isAttacking;
        if (!this.isAttacking) {
            // fix animations? here ?????????
            // if (aPlayer.airborne) {
            //     aPlayer.anims.play('jump', true);
            // } else if (aPlayer.isCrouching) {
            //     aPlayer.anims.play('crouch', true);
            // } else {
            //     aPlayer.anims.play('idle', true);
            // }
        }
    }

    _drawChildren() {
        var yOffset = 5;
        var healthBarWidth = this.health / 100 * healthBarMaxWidth;

        // draw name tag
        this.nameTag.setX(this.x - this.nameTag.width / 2);
        this.nameTag.setY(this.y - this.displayHeight - 2 * yOffset);
        this.nameTag.setText(`${this.name} (${this.health})`);

        // draw health bar
        this.healthBar.clear();
        this.healthBar.fillStyle(0x000000);
        //outer rect for outline
        this.healthBar.fillRect(
            this.x - healthBarMaxWidth / 2 - healthBarOutline,
            this.y - this.displayHeight + this.nameTag.height - yOffset - healthBarOutline,
            healthBarMaxWidth + 2 * healthBarOutline,
            healthBarHeight + 2 * healthBarOutline);
        // actual health
        this.healthBar.fillStyle(healthBarColor);
        this.healthBar.fillRoundedRect(
            this.x - healthBarMaxWidth / 2,
            this.y - this.displayHeight + this.nameTag.height - yOffset,
            healthBarWidth, // based on current hp
            healthBarHeight,
            2);

    }

    jump() {
        // < 0 but accounting for float error
        if (this.body.velocity.y < -5) {
            // already jumping
            return;
        }
        this.setVelocityY(-jumpSpeedNormal);
    };

    crouch() {
        this.isCrouching = true;
        this.anims.play('crouch', true);
    };

    stopCrouch() {
        this.isCrouching = false;
    };

    moveLeft() {
        airborne = !this.body.touching.down;
        shouldAnimateMovement = !airborne && !this.isAttacking;
        this.setVelocityX(-this.moveSpeed);
        this.flipX = 1;
        if (shouldAnimateMovement) {
            this.anims.play('run', true);
        }
    };

    moveRight() {
        airborne = !this.body.touching.down;
        shouldAnimateMovement = !airborne && !this.isAttacking;
        this.setVelocityX(this.moveSpeed);
        this.flipX = 0;
        if (shouldAnimateMovement) {
            this.anims.play('run', true);
        }
    };

    stopMove() {
        this.setVelocityX(0);
        this.anims.play('idle', true);
    };

    attack(attackType) {
        bindAttack(this, true, attackType);
    };

    destroyPlayer() {
        this.nameTag.destroy();
        this.healthBar.destroy();
        this.destroy();
    };

    hit(target, attackType) {
        target.health =
            Math.max(0, target.health - attackDamageByType[attackType]);
    };

};
