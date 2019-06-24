import 'phaser';
import {YungSkryllaSceneUpdate} from './game/YungSkryllaSceneUpdate'
import {Spell, SpellName} from './spells/Spell'
import {Sprint} from './spells/Sprint'
import {Fireball} from './spells/Fireball'
import {Iceball} from './spells/Iceball'
import {Arrow} from './objects/Arrow'
import {Vortex} from './objects/Vortex'
import {SnowVortex} from './spells/SnowVortex'
import {SolarVortex} from './spells/SolarVortex'
import {Projectile} from './Projectile_ts'
import {playerData} from './game/PlayerUtils'

export var attackDuration = 500;
export var bowAttackDuration = 1000;
export var smashDuration = 350;

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
    SPRINT = 'sprint',
    SLOW = 'slow',
    AMPLIFY = 'amplify'
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
    aoeSpellObjects: Phaser.Physics.Arcade.Sprite[];

    shouldShowBuffTimes: boolean;
    shouldTrace: boolean;
    kTraceCount: number;
    traces: Phaser.GameObjects.Sprite[];

    isAirborne: boolean;
    isDroppingDown: boolean;
    wasDroppingDown: boolean;
    isSmashing: boolean;
    isSmashLanding: boolean;
    airborne: boolean;
    moveSpeed: number;
    isAttacking: boolean;
    isCrouching: boolean;
    shouldMove: boolean;

    didCrouch: boolean;
    didMoveLeft: boolean;
    didMoveRight: boolean;
    didJump: boolean;

    damageCoefficient: number;

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
        this.spells[SpellName.SOLAR_VORTEX] = new SolarVortex(this);
        this.spells[SpellName.SNOW_VORTEX] = new SnowVortex(this);
        this.projectiles = [];
        this.aoeSpellObjects = [];
        this.shouldShowBuffTimes = true;
        this.damageCoefficient = 1;

        // trace animation
        this.shouldTrace = false;
        this.traces = [];
        this.kTraceCount = 5;
        this.shouldMove = false;
        this.isDroppingDown = false;
        this.wasDroppingDown = false;
        this.isSmashing = false;
        this.isSmashLanding = false;

        this.isCrouching = false;
        this.isAttacking = false;

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
        this.isAirborne = !this.body.touching.down;
        this.moveSpeed = this.isCrouching ? moveSpeedNormal / 3 : moveSpeedNormal;
        if (this.wasDroppingDown && !this.isAirborne) {
            this.wasDroppingDown = false;
        }
        if (!this.isAttacking) {
            if (this.isDroppingDown || this.isAirborne) {
                // this.anims.stop();
                this.anims.play('jump', true);
            } else if (this.isSmashing && !this.isAirborne) {
                // landed after smashing;
                // stop smash landinging after animation end
                (function(player) {
                    setTimeout(() => {
                        player.isSmashLanding = false;
                    }, smashDuration);
                })(this);
                this.isSmashing = false;
                this.isSmashLanding = true;
            } else if (this.isSmashLanding) {
                this.anims.play('smash', true);
            } else if (this.shouldMove) {
                this.anims.play('run', true);
            } else if (this.isCrouching) {
                this.anims.play('crouch', true);
            } else {
                this.anims.play('idle', true);
            }
        }

        // draw trace animation
        this.trace();

        this._tryFinishDroppingDown();

        // spells & buffs
        this.buffs.map(b => {
            switch (b.name) {
                case BuffName.SPRINT:
                    this.moveSpeed *= kSprintSpeedMultiplier;
                    break;
                case BuffName.SLOW:
                    this.moveSpeed *= 0.5;
                    break;
                case BuffName.AMPLIFY:
                    this.damageCoefficient = 1.5;
                    break;
            }
        });

        this._processAoeSpellsOverlaps();

        if (this.shouldMove) {
            let isLookingLeft = this.flipX;
            if (isLookingLeft) {
                this.moveLeft();
            } else {
                this.moveRight();
            }
        }
    }

    // check all other players on overlap with aoe spell
    _processAoeSpellsOverlaps() {
        this.scene.players.map(target => {
            if (target === this) {
                // aoe spell objects do not affect caster
                return;
            }
            this.aoeSpellObjects.map(spellObject => {
                if (!this.scene.physics.overlap(target, spellObject)) {
                    return;
                }
                switch (spellObject.texture.key) {
                    case SpellName[SpellName.SNOW_VORTEX.toUpperCase()]:
                        target.applyBuff(BuffName.SLOW, 1 * 1000);
                        break;
                    case SpellName[SpellName.SOLAR_VORTEX.toUpperCase()]:
                        target.applyBuff(
                            BuffName.AMPLIFY,
                            1 * 1000,
                            // reset damage coef on dispell
                            player => {player.damageCoefficient = 1;}
                        );
                        break;
                    default:
                        console.log('unknown AOE spell obj', spellObject);
                        break;
                }
            });
        });
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
        if (this.body.velocity.y < -5 || this.isDroppingDown) {
            // already jumping
            return;
        }
        this.setVelocityY(-jumpSpeedNormal);
    };

    crouch() {
        this.isCrouching = true;
    };

    stopCrouch() {
        this.isCrouching = false;
    };

    moveLeft() {
        this._moveX(true);
    };

    moveRight() {
        this._moveX(false);
    };

    _moveX(isLeft: boolean) {
        let sgn = isLeft ? -1 : 1;
        this.setVelocityX(sgn * this.moveSpeed);
        this.flipX = isLeft;
        this.shouldMove = true;
    }

    stopMove() {
        this.setVelocityX(0);
        this.shouldMove = false;
    };

    // get player (this) <-> platforms collider
    _withPlatformsCollider() {
        return this.scene.physics.world.colliders.getActive().find(
            (c) => c.object1 === this && c.object2 === this.scene.platforms
        );
    }

    tryDropDown() {
        let isTooLow = this.scene.physics.world.bounds.height - this.getBounds().bottom < 2 * this.displayHeight;
        // only calling once per dropdown - checking !this.isDroppingDown;
        let shouldDropDown = !this.isDroppingDown && !this.isAirborne && this.isCrouching && !isTooLow;
        if (!shouldDropDown) {
            // can only drop down when standing on smth
            // need to be crouching to drop down
            return;
        }
        if (this === this.scene.player) {
            this.scene.socket.emit('on_player_dropDown', playerData(this));
        }
        let platformsCollider = this._withPlatformsCollider();
        platformsCollider.active = false;
        this.setVelocityY(jumpSpeedNormal / 2);
        this.isDroppingDown = true;
    }

    _tryFinishDroppingDown() {
        if (!this.isDroppingDown) {
            // nothing to finish
            return;
        }
        if (this.scene.physics.overlap(this, this.scene.platforms) || !this.isAirborne) {
            // overlapping -> still falling thru platform
            // or is on the ground and just starting to drop
            return;
        }
        // if (this !== this.scene.player)
        this._withPlatformsCollider().active = true;
        this.isDroppingDown = false;
        this.wasDroppingDown = true;
        if (this === this.scene.player) {
            this.scene.controller.canDropDown = true;
        }
    }

    trySmash() {
        let shouldSmash = !this.isSmashing && this.isAirborne
                && !this.isAttacking && !this.isDroppingDown && !this.wasDroppingDown;
        if (!shouldSmash) {
            return;
        }
        this.isSmashing = true;
        this.setVelocityY(Math.max(this.body.velocity.y, 0) + 1.5 * jumpSpeedNormal);
        this.scene.socket.emit('on_player_smash', playerData(this));
    }

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
        damageAmount *= this.damageCoefficient;
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
        var existingBuff = this.buffs.find(b => b.name === buffName);
        if (existingBuff === undefined) {
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

    castSpell(spellName: SpellName, targetData = null) {
        let spell = this.spells[spellName];
        if (spell === undefined) {
            console.log(this.name, 'is trying to cast a spell he doesnt have:', spellName);
            return;
        }
        spell.cast(targetData);
        if (this === this.scene.player) {
            // only send cast signal from this client
            // @ts-ignore
            this.scene.socket.emit('on_player_cast', playerData(this), spellName, targetData);
        }

    }
};
