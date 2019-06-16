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
var main_1 = require("../main");
var kProjectileSpeed = {
    'arrow': 1000,
    'fireball': 800,
    'iceball': 600
};
var kProjectileDamage = {
    'arrow': 10,
    'fireball': 30,
    'iceball': 40
};
var Projectile = /** @class */ (function (_super) {
    __extends(Projectile, _super);
    function Projectile(scene, creator, texture, type) {
        var _this = this;
        var x = creator.x;
        var y = creator.y - creator.displayHeight / 4;
        _this = _super.call(this, scene, x, y, texture) || this;
        _this.type = type;
        _this.creator = creator;
        scene.add.existing(_this);
        scene.physics.add.existing(_this);
        scene.physics.add.collider(_this, scene.game.platforms, function (projectile, platform) { return projectile.didCollideWithPlatform(platform); });
        // global state = questionable
        main_1.game.players.map(function (aPlayer) {
            // don't add collisions with player who created the projectile
            if (aPlayer !== _this.creator) {
                scene.physics.add.collider(_this, aPlayer, function (projectile, target) {
                    return projectile.didCollideWithPlayer(target);
                });
            }
        });
        // minimize knockback
        _this.setMass(0.000001);
        // @ts-ignore
        _this.body.setAllowGravity(false);
        // @ts-ignore
        _this.body.setCollideWorldBounds(true);
        // @ts-ignore
        _this.body.onWorldBounds = true;
        // fire/ice ball model
        _this.setScale(3).setRotation(Math.PI);
        _this.setSize(10, 10);
        // this.setOrigin(0.8, 1);
        _this.setPosition(x - creator.displayWidth, y);
        _this.flipX = creator.flipX;
        var isLookingLeft = creator.flipX;
        if (isLookingLeft) {
            _this.setOrigin(1.2, 1);
            _this.setVelocityX(-kProjectileSpeed[type]);
        }
        else {
            _this.setOrigin(0.8, 1);
            _this.setVelocityX(kProjectileSpeed[type]);
        }
        _this.anims.play(type + '-burn');
        _this.creator.projectiles.push(_this);
        return _this;
    }
    Projectile.prototype.didCollideWithPlatform = function (platform) {
        this.destroy();
    };
    Projectile.prototype.didCollideWithPlayer = function (target, a, b) {
        if (this.creator === target) {
            console.log('lol hit urself noob');
            return;
        }
        target.receiveDamage(kProjectileDamage[this.type]);
    };
    Projectile.prototype.destroy = function () {
        var index = this.creator.projectiles.indexOf(this);
        if (index !== -1) {
            this.creator.projectiles.splice(index, 1);
        }
        _super.prototype.destroy.call(this);
    };
    return Projectile;
}(Phaser.Physics.Arcade.Sprite));
exports.Projectile = Projectile;
