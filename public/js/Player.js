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
