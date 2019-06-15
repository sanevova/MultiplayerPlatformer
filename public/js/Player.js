const SPELLS = {
    SPRINT: 'sprint',
    FIREBALL: 'fireball',
    ICEBALL: 'iceball',
};
const BUFF_TYPES = {
    SPRINT: 'sprint',
};
kBuffDurations = {
    'sprint': 10 * 1000 // 10s
};

eps = 0.00001;
kSprintSpeedMultiplier = 1.5;

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

        this.buffs = [];
        this.projectiles = [];
        this.shouldShowBuffTimes = true;

        // trace animation
        this.shouldTrace = false;
        this.traces = [];
        this.kTraceCount = 5;

        return this;
    }

    update() {
        this._drawChildren();
        this.projectiles.map(p => {
            if (p.body.touching.left || p.body.touching.right) {
                p.destroy();
            }
        });

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

        // draw trace animation
        this.trace();

        // spells & buffs
        if (this.buffs.some(b => b.type = BUFF_TYPES.SPRINT)) {
            this.moveSpeed *= kSprintSpeedMultiplier;
        }
    }

    _drawChildren() {
        var yOffset = 5;
        var healthBarWidth = this.health / 100 * healthBarMaxWidth;

        var middleX = this.x - this.nameTag.width / 2;
        var startY = this.y - this.displayHeight;
        // draw name tag
        this.nameTag.setX(this.x - this.nameTag.width / 2);
        this.nameTag.setY(startY - 2 * yOffset);
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

        // spells & buffs
        if (this.shouldShowBuffTimes || game.config.physics.arcade.debug) {
            this.buffs.map((buff, index) => {
                var durationLeft = parseFloat(
                    // maxDuration - currentDuration
                    (buff.maxDuration - (Date.now() - buff.startTime)) / 1000
                ).toFixed(1);
                if (!buff.debugText) {
                    buff.debugText = scene.add.text(0, 0, '', kNameFont);
                }
                buff.debugText.setText(`${buff.type}: ${durationLeft}s`);
                buff.debugText.setPosition(
                    this.nameTag.x,
                    this.nameTag.y - this.nameTag.height - 3 * yOffset - 30 * index
                );
            });
        }
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
        this.buffs.map(buff => {
            if (buff.debugText !== undefined) {
                buff.debugText.destroy();
            }
            clearTimeout(buff.timeoutHandler);
        });
        this.destroy();
    };

    receiveDamage(damageAmount) {
        this.health = Math.max(0, this.health - damageAmount);
    }

    hit(target, attackType) {
        target.receiveDamage(attackDamageByType[attackType]);
    };

    setShouldTrace(shouldTrace) {
        this.shouldTrace = shouldTrace;
        this.traces.map(t => t.setVisible(shouldTrace && this.isMoving));
    }

    isMoving() {
        return Math.abs(this.body.speed) > 20;
    }

    trace() {
        if (!this.shouldTrace) {
            return;
        }
        this.traces.map(t => t.setVisible(this.isMoving()));
        if (this.traces.length === 0) {
            for (i = 0; i < this.kTraceCount; ++i) {

                this.traces.push(scene.add.sprite(player.x, player.y, player.texture.key﻿﻿﻿﻿)﻿.setScale(2));
            }
        }
        if (tickNumber % 15 === 0) {
            this.traces.shift().destroy();
            this.traces.push(
                scene.add.sprite(this.x, this.y, this.texture.key)
                    .setScale(2)
                    .setFrame(this.frame.name)
            );
            for (i = 0; i < this.kTraceCount; ++i) {
                this.traces[i].setAlpha((i + 1) / (this.kTraceCount + 2));
            }
        }
    }

    _buffTimeoutHandler(buffType, buffDuration) {
        return (function(aPlayer, type, duration) {
            return setTimeout(() => aPlayer.removeBuff(type), duration);
        })(this, buffType, buffDuration);
    }

    applyBuff(buffType, buffDuration, dispellCallback = null) {
        var existingBuff = this.buffs.find(b => b.type === buffType);
        if (existingBuff === undefined) {
            console.log('not found', buffType, existingBuff, this.buffs);
            this.buffs.push({
                type: buffType,
                startTime: Date.now(),
                maxDuration: buffDuration,
                timeoutHandler: this._buffTimeoutHandler(buffType, buffDuration),
                dispellCallback: dispellCallback
            });
        } else {
            // always rewrite buffs for now
            // maybe change to only leave the longer one in the future
            clearTimeout(existingBuff.timeoutHandler);
            // dispell callback here?
            existingBuff.timeoutHandler =
                this._buffTimeoutHandler(buffType, buffDuration);
            existingBuff.startTime = Date.now();
        }
    }

    removeBuff(buffType) {
        // console.log('removing buff', buffType, this.buffs);
        var buffIndex = this.buffs.findIndex(b => b.type === buffType);
        if (buffIndex > -1) {
            var buff = this.buffs[buffIndex];
            if (this.shouldShowBuffTimes || game.config.physics.arcade.debug) {
                if (buff.debugText !== undefined) {
                    buff.debugText.destroy();
                }
            }
            clearTimeout(buff.timeoutHandler);
            this.buffs.splice(buffIndex, 1);
            if (buff.dispellCallback !== null) {
                console.log('dispell callback on', this.name, buffType);
                buff.dispellCallback(this);
            }
        }
    }

    castSpell(spellType) {
        switch (spellType) {
            case SPELLS.SPRINT:
                this.setShouldTrace(true);
                this.applyBuff(
                    BUFF_TYPES.SPRINT,
                    kBuffDurations[BUFF_TYPES.SPRINT],
                    (caster) => (caster.setShouldTrace(false))
                );
                break;
            case SPELLS.FIREBALL:
            case SPELLS.ICEBALL:
                var projectile = new Projectile(
                    scene,
                    this, // creator
                    spellType, // texture
                    spellType // type
                );
                break;
        }
        if (player === this) {
            // only send cast signal from this client
            socket.emit('on_player_cast', playerData(this), spellType);
        }

    }
};
