"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
// import './phaser'
require("phaser");
var Projectile_ts_1 = require("./Projectile_ts");
var main_1 = require("../main");
console.log('roflxd');
var kNameFont = {
    fontFamily: '"Roboto Condensed"',
    fontSize: '26px',
    fontStyle: 'bold',
    fill: "#c51b7d"
};
exports.SPELLS = {
    SPRINT: 'sprint',
    FIREBALL: 'fireball',
    ICEBALL: 'iceball'
};
var BUFF_TYPES = {
    SPRINT: 'sprint'
};
var kBuffDurations = {
    'sprint': 10 * 1000 // 10s
};
var attackDamageByType = {
    attack_slash: 10,
    attack_overhead: 10,
    attack_uppercut: 10,
    attack_bow: 20,
    attack_bow_jump: 30
};
var eps = 0.00001;
var kSprintSpeedMultiplier = 1.5;
exports.moveSpeedNormal = 360;
var jumpSpeedNormal = 560;
var healthBarMaxWidth = 70;
var healthBarHeight = 10;
var healthBarOutline = 2;
var healthBarColor = 0x84FB21;
;
var Player = /** @class */ (function (_super) {
    __extends(Player, _super);
    function Player(scene, x, y, name, texture) {
        if (texture === void 0) { texture = 'adventurer'; }
        var _this = 
        // init and bind to scene
        _super.call(this, scene, x, y, texture) || this;
        scene.add.existing(_this);
        scene.physics.add.existing(_this);
        _this.name = name;
        _this.setSize(25, 34).setScale(2);
        _this.setCollideWorldBounds(true);
        _this.health = 100;
        // player name object
        _this.nameTag = scene.add.text(x, y, name, kNameFont);
        // health bar object
        _this.healthBar = scene.add.graphics();
        _this.buffs = [];
        _this.projectiles = [];
        _this.shouldShowBuffTimes = true;
        // trace animation
        _this.shouldTrace = false;
        _this.traces = [];
        _this.kTraceCount = 5;
        return _this;
    }
    Player.prototype.update = function () {
        this._drawChildren();
        this.projectiles.map(function (p) {
            if (p.body.touching.left || p.body.touching.right) {
                p.destroy();
            }
        });
        // state
        this.airborne = !this.body.touching.down;
        this.moveSpeed = this.isCrouching ? exports.moveSpeedNormal / 3 : exports.moveSpeedNormal;
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
        if (this.buffs.some(function (b) { return b.type = BUFF_TYPES.SPRINT; })) {
            this.moveSpeed *= kSprintSpeedMultiplier;
        }
    };
    Player.prototype._drawChildren = function () {
        var _this = this;
        var yOffset = 5;
        var healthBarWidth = this.health / 100 * healthBarMaxWidth;
        var middleX = this.x - this.nameTag.width / 2;
        var startY = this.y - this.displayHeight;
        // draw name tag
        this.nameTag.setX(this.x - this.nameTag.width / 2);
        this.nameTag.setY(startY - 2 * yOffset);
        this.nameTag.setText(this.name + " (" + this.health + ")");
        // draw health bar
        this.healthBar.clear();
        this.healthBar.fillStyle(0x000000);
        //outer rect for outline
        this.healthBar.fillRect(this.x - healthBarMaxWidth / 2 - healthBarOutline, this.y - this.displayHeight + this.nameTag.height - yOffset - healthBarOutline, healthBarMaxWidth + 2 * healthBarOutline, healthBarHeight + 2 * healthBarOutline);
        // actual health
        this.healthBar.fillStyle(healthBarColor);
        this.healthBar.fillRoundedRect(this.x - healthBarMaxWidth / 2, this.y - this.displayHeight + this.nameTag.height - yOffset, healthBarWidth, // based on current hp
        healthBarHeight, 2);
        // spells & buffs
        // @ts-ignore
        if (this.shouldShowBuffTimes || game.config.physics.arcade.debug) {
            this.buffs.map(function (buff, index) {
                var durationLeft = parseFloat(
                // maxDuration - currentDuration
                // @ts-ignore
                (buff.maxDuration - (Date.now() - buff.startTime)) / 1000).toFixed(1);
                buff.debugText.setText(buff.type + ": " + durationLeft + "s");
                buff.debugText.setPosition(_this.nameTag.x, _this.nameTag.y - _this.nameTag.height - 3 * yOffset - 30 * index);
            });
        }
    };
    Player.prototype.jump = function () {
        // < 0 but accounting for float error
        if (this.body.velocity.y < -5) {
            // already jumping
            return;
        }
        this.setVelocityY(-jumpSpeedNormal);
    };
    ;
    Player.prototype.crouch = function () {
        this.isCrouching = true;
        this.anims.play('crouch', true);
    };
    ;
    Player.prototype.stopCrouch = function () {
        this.isCrouching = false;
    };
    ;
    Player.prototype.moveLeft = function () {
        var airborne = !this.body.touching.down;
        var shouldAnimateMovement = !airborne && !this.isAttacking;
        this.setVelocityX(-this.moveSpeed);
        this.flipX = true;
        if (shouldAnimateMovement) {
            this.anims.play('run', true);
        }
    };
    ;
    Player.prototype.moveRight = function () {
        var airborne = !this.body.touching.down;
        var shouldAnimateMovement = !airborne && !this.isAttacking;
        this.setVelocityX(this.moveSpeed);
        this.flipX = false;
        if (shouldAnimateMovement) {
            this.anims.play('run', true);
        }
    };
    ;
    Player.prototype.stopMove = function () {
        this.setVelocityX(0);
        this.anims.play('idle', true);
    };
    ;
    Player.prototype.attack = function (attackType) {
        main_1.bindAttack(this, true, attackType);
    };
    ;
    Player.prototype.destroyPlayer = function () {
        this.nameTag.destroy();
        this.healthBar.destroy();
        this.buffs.map(function (buff) {
            if (buff.debugText !== undefined) {
                buff.debugText.destroy();
            }
            clearTimeout(buff.timeoutHandler);
        });
        this.destroy();
    };
    ;
    Player.prototype.receiveDamage = function (damageAmount) {
        this.health = Math.max(0, this.health - damageAmount);
    };
    Player.prototype.hit = function (target, attackType) {
        target.receiveDamage(attackDamageByType[attackType]);
    };
    ;
    Player.prototype.setShouldTrace = function (shouldTrace) {
        var _this = this;
        this.shouldTrace = shouldTrace;
        this.traces.map(function (t) { return t.setVisible(shouldTrace && _this.isMoving()); });
    };
    Player.prototype.isMoving = function () {
        // @ts-ignore
        return Math.abs(this.body.speed) > 20;
    };
    Player.prototype.trace = function () {
        var _this = this;
        if (!this.shouldTrace) {
            return;
        }
        this.traces.map(function (t) { return t.setVisible(_this.isMoving()); });
        if (this.traces.length === 0) {
            for (i = 0; i < this.kTraceCount; ++i) {
                this.traces.push(this.scene.add.sprite(this.x, this.y, this.texture.key).setScale(2));
            }
        }
        // @ts-ignore
        if (tickNumber % 15 === 0) {
            this.traces.shift().destroy();
            this.traces.push(this.scene.add.sprite(this.x, this.y, this.texture.key)
                .setScale(2)
                .setFrame(this.frame.name));
            for (var i = 0; i < this.kTraceCount; ++i) {
                this.traces[i].setAlpha((i + 1) / (this.kTraceCount + 2));
            }
        }
    };
    Player.prototype._buffTimeoutHandler = function (buffType, buffDuration) {
        return (function (aPlayer, type, duration) {
            return setTimeout(function () { return aPlayer.removeBuff(type); }, duration);
        })(this, buffType, buffDuration);
    };
    Player.prototype.applyBuff = function (buffType, buffDuration, dispellCallback) {
        if (dispellCallback === void 0) { dispellCallback = null; }
        // @ts-ignore target is es6 in tsconfig????????
        var existingBuff = this.buffs.find(function (b) { return b.type === buffType; });
        if (existingBuff === undefined) {
            console.log('not found', buffType, existingBuff, this.buffs);
            this.buffs.push({
                type: buffType,
                startTime: Date.now(),
                maxDuration: buffDuration,
                timeoutHandler: this._buffTimeoutHandler(buffType, buffDuration),
                dispellCallback: dispellCallback,
                debugText: this.scene.add.text(0, 0, '', kNameFont)
            });
        }
        else {
            // always rewrite buffs for now
            // maybe change to only leave the longer one in the future
            clearTimeout(existingBuff.timeoutHandler);
            // dispell callback here?
            existingBuff.timeoutHandler =
                this._buffTimeoutHandler(buffType, buffDuration);
            existingBuff.startTime = Date.now();
        }
    };
    Player.prototype.removeBuff = function (buffType) {
        // @ts-ignore target is es6 in tsconfig????????
        var buffIndex = this.buffs.findIndex(function (b) { return b.type === buffType; });
        if (buffIndex > -1) {
            var buff = this.buffs[buffIndex];
            // @ts-ignore
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
    };
    Player.prototype.castSpell = function (spellType) {
        switch (spellType) {
            case exports.SPELLS.SPRINT:
                this.setShouldTrace(true);
                this.applyBuff(BUFF_TYPES.SPRINT, kBuffDurations[BUFF_TYPES.SPRINT], function (caster) { return (caster.setShouldTrace(false)); });
                break;
            case exports.SPELLS.FIREBALL:
            case exports.SPELLS.ICEBALL:
                var projectile = new Projectile_ts_1.Projectile(this.scene, this, // creator
                spellType, // texture
                spellType // type
                );
                break;
        }
        // @ts-ignore
        if (player === this) {
            // only send cast signal from this client
            // @ts-ignore
            socket.emit('on_player_cast', main_1.playerData(this), spellType);
        }
    };
    return Player;
}(Phaser.Physics.Arcade.Sprite));
exports.Player = Player;
;
