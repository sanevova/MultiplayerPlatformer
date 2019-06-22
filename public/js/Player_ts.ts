import 'phaser';
import {YungSkryllaSceneUpdate} from './game/YungSkryllaSceneUpdate'
import {Spell, SpellName} from './spells/Spell'
import {Sprint} from './spells/Sprint'
import {Fireball} from './spells/Fireball'
import {Iceball} from './spells/Iceball'
import {Arrow} from './objects/Arrow'
import {Projectile} from './Projectile_ts'
import {playerData} from './game/PlayerUtils'

export var attackDuration = 500;
export var bowAttackDuration = 1000;

var kNameFont = {
    fontFamily: '"Roboto Condensed"',
    fontSize: '26px',
    fontStyle: 'bold',
    fill: "#c51b7d"
};

const BUFF_TYPES = {
    SPRINT: 'sprint',
};
var kBuffDurations = {
    'sprint': 10 * 1000 // 10s
};

var attackDamageByType = {
    attack_slash: 10,
    attack_overhead: 10,
    attack_uppercut: 10
};

var eps = 0.00001;
var kSprintSpeedMultiplier = 1.5;
export var moveSpeedNormal = 500;
var jumpSpeedNormal = 470;
var healthBarMaxWidth = 70;
var healthBarHeight = 10;
var healthBarOutline = 2;
var healthBarColor = 0x84FB21;

//[name in SpellName]: Spell; // requires all names to be present in map
type PlayerSpells = {[name: string]: Spell};

export enum BuffName {
    SPRINT = 'sprint'
}

interface Buff {
    name: BuffName;
    startTime: number;
    maxDuration: number;
    timeoutHandler: any;//number;
    dispellCallback: (Player) => void;
    debugText: Phaser.GameObjects.Text;
};

export class Player extends Phaser.Physics.Arcade.Sprite {
    scene: YungSkryllaSceneUpdate;
    name: string;
    health: number;
    nameTag: Phaser.GameObjects.Text;
    healthBar: Phaser.GameObjects.Graphics;
    spells: PlayerSpells;
    buffs: Buff[];
    projectiles: Projectile[];

    shouldShowBuffTimes: boolean;
    shouldTrace: boolean;
    kTraceCount: number;
    traces: Phaser.GameObjects.Sprite[];

    airborne: boolean;
    moveSpeed: number;
    shouldAnimateMovement: boolean;
    isAttacking: boolean;
    isCrouching: boolean;
    shouldMove: boolean;

    didCrouch: boolean;
    didMoveLeft: boolean;
    didMoveRight: boolean;
    didJump: boolean;

    constructor(scene, x, y, name, texture = 'adventurer') {
        // init and bind to scene
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.scene = scene;
        this.name = name;
        this.setSize(25, 34).setScale(2)
        this.setCollideWorldBounds(true);
        this.health = 100;

        // player name object
        this.nameTag = scene.add.text(x, y, name, kNameFont);
        // health bar object
        this.healthBar = scene.add.graphics();

        this.buffs = [];
        this.spells = {};
        this.spells[SpellName.SPRINT] = new Sprint(this);
        this.spells[SpellName.FIREBALL] = new Fireball(this);
        this.spells[SpellName.ICEBALL] = new Iceball(this);
        this.projectiles = [];
        this.shouldShowBuffTimes = true;

        // trace animation
        this.shouldTrace = false;
        this.traces = [];
        this.kTraceCount = 5;
        this.shouldMove = false;

        return this;
    }

    update(): void {
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
        if (this.buffs.some(b => b.name === BuffName.SPRINT)) {
            this.moveSpeed *= kSprintSpeedMultiplier;
        }

        if (this.shouldMove) {
            let isLookingLeft = this.flipX;
            if (isLookingLeft) {
                this.moveLeft();
            } else {
                this.moveRight();
            }
        }
    }

    _drawChildren(): void {
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
        // @ts-ignore
        if (this.shouldShowBuffTimes || this.scene.config.physics.arcade.debug) {
            this.buffs.map((buff, index) => {
                var durationLeft = parseFloat(
                    // maxDuration - currentDuration
                    // @ts-ignore
                    (buff.maxDuration - (Date.now() - buff.startTime)) / 1000
                ).toFixed(1);
                buff.debugText.setText(`${buff.name}: ${durationLeft}s`);
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
        let airborne = !this.body.touching.down;
        let shouldAnimateMovement = !airborne && !this.isAttacking;
        this.setVelocityX(-this.moveSpeed);
        this.flipX = true;
        if (shouldAnimateMovement) {
            this.anims.play('run', true);
        }
    };

    moveRight() {
        let airborne = !this.body.touching.down;
        let shouldAnimateMovement = !airborne && !this.isAttacking;
        this.setVelocityX(this.moveSpeed);
        this.flipX = false;
        if (shouldAnimateMovement) {
            this.anims.play('run', true);
        }
    };

    stopMove() {
        this.setVelocityX(0);
        this.anims.play('idle', true);
    };

    checkHitAll(attackType) {
        // check hit
        let isBowAttack = attackType.startsWith('attack_bow');
        if (isBowAttack) {
            // shots create arrows which do damage; the bow attack does not;
            return;
        }
        let isLookingLeft = this.flipX;
        for (var i = 0; i < this.scene.players.length; ++i) {
            let target = this.scene.players[i];
            if (target === this) {
                continue;
            }
            let xHitDistanceThreshold = target.displayWidth;
            let yHitDistanceThreshold = target.displayHeight / 2;
            let isTargetToLeft = target.x - this.x < 0;
            let didHit =
                Math.abs(target.x - this.x) < xHitDistanceThreshold
                && Math.abs(target.y - this.y) < yHitDistanceThreshold
                && (
                    (isLookingLeft && isTargetToLeft)
                    || (!isLookingLeft && !isTargetToLeft)
                );
            if (didHit) {
                console.log(`${this.name} hit ${target.name}!`)
                this.scene.socket.emit('on_player_hit', {
                    attacker: {
                        name: this.name
                    },
                    target: {
                        name: target.name
                    },
                    attackType: attackType
                });
            }
        }
    }

    bindAttack(condition, attackType) {
        if (condition && !this.isAttacking) {
            this.isAttacking = true;
            let isBowAttack = attackType.startsWith('attack_bow');
            let duration = isBowAttack ? bowAttackDuration : attackDuration;
            // stop attack state after attack finished
            (function(attacker, type) {
                setTimeout(() => {
                    attacker.isAttacking = false;
                    let isBowAttack = attackType.startsWith('attack_bow');
                    if (isBowAttack) {
                        new Arrow(attacker.scene, attacker);
                    }
                }, duration);
            })(this, attackType);

            // only check for hit by this player on this client
            // to avoid sending the same hit signal from multiple clients
            if (this === this.scene.player) {
                // check if hit any target in the middle of the attack
                // for better responsiveness
                (function(attacker, attackType) {
                    setTimeout(() => attacker.checkHitAll(attackType), duration / 2);
                })(this, attackType);
            }
            this.anims.play(attackType, false);
        }
    }

    attack(attackType) {
        this.bindAttack(true, attackType);
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
        this.traces.map(t => t.setVisible(shouldTrace && this.isMoving()));
    }

    isMoving() {
        // @ts-ignore
        return Math.abs(this.body.speed) > 20;
    }

    trace() {
        if (!this.shouldTrace) {
            return;
        }
        this.traces.map(t => t.setVisible(this.isMoving()));
        if (this.traces.length === 0) {
            for (i = 0; i < this.kTraceCount; ++i) {
                this.traces.push(this.scene.add.sprite(this.x, this.y, this.texture.key).setScale(2));
            }
        }
        // @ts-ignore
        if (this.scene.tickNumber % 15 === 0) {
            this.traces.shift().destroy();
            this.traces.push(
                this.scene.add.sprite(this.x, this.y, this.texture.key)
                    .setScale(2)
                    .setFrame(this.frame.name)
                    .setFlipX(this.flipX)
            );
            for (var i = 0; i < this.kTraceCount; ++i) {
                this.traces[i].setAlpha((i + 1) / (this.kTraceCount + 2));
            }
        }
    }

    _buffTimeoutHandler(buffName: BuffName, buffDuration) {
        return (function(aPlayer, name, duration) {
            return setTimeout(() => aPlayer.removeBuff(name), duration);
        })(this, buffName, buffDuration);
    }

    applyBuff(buffName: BuffName, buffDuration, dispellCallback = null) {
        console.log(`${buffName}, enum: ${BuffName.SPRINT}`);
        var existingBuff = this.buffs.find(b => b.name === buffName);
        if (existingBuff === undefined) {
            console.log('not found', buffName, existingBuff, this.buffs);
            this.buffs.push({
                name: buffName,
                startTime: Date.now(),
                maxDuration: buffDuration,
                timeoutHandler: this._buffTimeoutHandler(buffName, buffDuration),
                dispellCallback: dispellCallback,
                debugText: this.scene.add.text(0, 0, '', kNameFont)
            });
        } else {
            // always rewrite buffs for now
            // maybe change to only leave the longer one in the future
            clearTimeout(existingBuff.timeoutHandler);
            // dispell callback here?
            existingBuff.timeoutHandler =
                this._buffTimeoutHandler(buffName, buffDuration);
            existingBuff.startTime = Date.now();
        }
    }

    removeBuff(buffName: BuffName) {
        var buffIndex = this.buffs.findIndex(b => b.name === buffName);
        if (buffIndex > -1) {
            var buff = this.buffs[buffIndex];
            // @ts-ignore
            if (this.shouldShowBuffTimes || this.scene.config.physics.arcade.debug) {
                if (buff.debugText !== undefined) {
                    buff.debugText.destroy();
                }
            }
            clearTimeout(buff.timeoutHandler);
            this.buffs.splice(buffIndex, 1);
            if (buff.dispellCallback !== null) {
                console.log('dispell callback on', this.name, buffName);
                buff.dispellCallback(this);
            }
        }
    }

    castSpell(spellName: SpellName) {
        let spell = this.spells[spellName];
        if (spell === undefined) {
            console.log(this.name, 'is trying to cast a spell he doesnt have:', spellName);
            return;
        }
        spell.cast();
        if (this === this.scene.player) {
            // only send cast signal from this client
            // @ts-ignore
            this.scene.socket.emit('on_player_cast', playerData(this), spellName);
        }

    }
};
