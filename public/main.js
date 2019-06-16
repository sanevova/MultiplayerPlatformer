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
// import './js/phaser';
require("phaser");
var client_ts_1 = require("./js/client_ts");
var animations_ts_1 = require("./js/animations_ts");
var sockets_ts_1 = require("./js/sockets_ts");
var Player_ts_1 = require("./js/Player_ts");
var Projectile_ts_1 = require("./js/Projectile_ts");
var world = {
    width: window.innerWidth,
    height: window.innerHeight
};
// var xd = connectAs('a');//isLocalhost();
exports.attackDuration = 500;
exports.bowAttackDuration = 1000;
var tickNumber = 0;
var controlsString = 'MOVE=WASD ATTCK=QER CROUCH=C,S HIDE=Z';
var hiScore = {
    name: 'noname',
    count: 0
};
var config = {
    type: Phaser.AUTO,
    width: world.width,
    height: world.height,
    physics: {
        "default": 'arcade',
        arcade: {
            gravity: { y: 600 },
            debug: client_ts_1.isLocalhost()
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};
var player;
var stars;
var cursors;
var score = 0;
var scoreText;
var socket;
var scene;
// declare var game: Phaser.Game;
var YungSkryllaGame = /** @class */ (function (_super) {
    __extends(YungSkryllaGame, _super);
    function YungSkryllaGame(config) {
        var _this = _super.call(this, config) || this;
        _this.players = [];
        return _this;
    }
    return YungSkryllaGame;
}(Phaser.Game));
// export var game = new Phaser.Game(config);
exports.game = new YungSkryllaGame(config);
var keyW;
var keyA;
var keyS;
var keyD;
var keyQ;
var keyE;
var keyR;
var keyF;
var keyC;
var keyK;
var keyCtrl;
function preload() {
    console.log('preload');
    this.load.image('platform', 'assets/blocks/platform.png');
    this.load.spritesheet('adventurer', 'assets/adventurer/adventurer-sheet.png', { frameWidth: 50, frameHeight: 37 });
    this.load.spritesheet('adventurer-bow', 'assets/adventurer/adventurer-bow-sheet.png', { frameWidth: 50, frameHeight: 37 });
    this.load.spritesheet('fireball-small', 'assets/fire/fires/Small_Fireball_10x26.png', { frameWidth: 10, frameHeight: 26 });
    this.load.spritesheet('fireball', 'assets/fire/fires/Fireball_68x9.png', { frameWidth: 68, frameHeight: 9 });
    this.load.spritesheet('iceball', 'assets/fire/fires/Iceball_84x9.png', { frameWidth: 84, frameHeight: 9 });
    this.load.spritesheet('arrow', 'assets/other/arrow.png', { frameWidth: 434, frameHeight: 63 });
    this.load.image('sky', 'assets/blocks/back-walls.png');
    this.load.image('logo', 'assets/blocks/phaser3-logo.png');
    this.load.image('red', 'assets/blocks/red.png');
    keyW = this.input.keyboard.addKey('W');
    keyA = this.input.keyboard.addKey('A');
    keyS = this.input.keyboard.addKey('S');
    keyD = this.input.keyboard.addKey('D');
    keyQ = this.input.keyboard.addKey('Q');
    keyE = this.input.keyboard.addKey('E');
    keyR = this.input.keyboard.addKey('R');
    keyF = this.input.keyboard.addKey('F');
    keyC = this.input.keyboard.addKey('C');
    keyK = this.input.keyboard.addKey('K');
    keyCtrl = this.input.keyboard.addKey('Control');
    scene = this;
}
function playerData(player) {
    return {
        name: player.name,
        pos: {
            x: player.x,
            y: player.y
        }
        // health?
    };
}
exports.playerData = playerData;
function createPlayerFromPlayerData(playerData) {
    // player creation
    console.log('creating from', playerData);
    var newPlayer = new Player_ts_1.Player(scene, playerData.pos.x, playerData.pos.y, playerData.name);
    // collide with platforms
    scene.physics.add.collider(newPlayer, scene.game.platforms);
    return newPlayer;
}
exports.createPlayerFromPlayerData = createPlayerFromPlayerData;
function randname() {
    return Math.random().toString(36).substring(7);
}
function createMyPlayer() {
    var player = createPlayerFromPlayerData({
        name: getUrlParameter('name') || randname(),
        pos: {
            x: 100,
            y: 450
        }
    });
    exports.game.players.push(player);
    socket = client_ts_1.connectAs(playerData(player));
    return player;
}
function create() {
    console.log('create');
    // map creation
    var bg = this.add.image(world.width / 2, world.height / 2, 'sky');
    bg.setScale(Math.min(world.width / bg.width, world.height / bg.height));
    this.game.platforms = this.physics.add.staticGroup();
    this.game.platforms.create(100, 528, 'platform').refreshBody();
    this.game.platforms.create(300, 528, 'platform').refreshBody();
    this.game.platforms.create(500, 528, 'platform').refreshBody();
    this.game.platforms.create(700, 528, 'platform').refreshBody();
    this.game.platforms.create(1000, 628, 'platform').refreshBody();
    this.game.platforms.create(1400, 828, 'platform').refreshBody();
    this.game.platforms.create(1200, 998, 'platform').refreshBody();
    this.game.platforms.create(900, 1100, 'platform').refreshBody();
    for (var i = 0; i < 20; ++i) {
        this.game.platforms.create(200 * i + 100, world.height - 60, 'platform').refreshBody();
    }
    this.game.platforms.create(600, 370, 'platform');
    this.game.platforms.create(50, 250, 'platform');
    this.game.platforms.create(750, 220, 'platform');
    player = createMyPlayer();
    sockets_ts_1.configureSocketEvents(socket);
    // animations
    animations_ts_1.loadAnimations(this);
    cursors = this.input.keyboard.createCursorKeys();
    // spell keybinds
    scene.input.keyboard.on('keydown', function (eventName, event) {
        if (eventName.key === '1') {
            eventName.stopImmediatePropagation();
            player.castSpell(Player_ts_1.SPELLS.SPRINT);
        }
        if (eventName.key === '2') {
            eventName.stopImmediatePropagation();
            player.castSpell(Player_ts_1.SPELLS.FIREBALL);
        }
        if (eventName.key === '3') {
            eventName.stopImmediatePropagation();
            player.castSpell(Player_ts_1.SPELLS.ICEBALL);
        }
    });
    scene.physics.world.on('worldbounds', function (body) {
        if (body.gameObject instanceof Projectile_ts_1.Projectile) {
            body.gameObject.destroy();
        }
    });
    //
    //     // unimportant stuff
    //     createExtra();
}
function checkHit(attacker, attackType) {
    // check hit
    var isBowAttack = attackType.startsWith('attack_bow');
    var isLookingLeft = attacker.flipX;
    for (var i = 0; i < exports.game.players.length; ++i) {
        var target = exports.game.players[i];
        if (target === attacker) {
            continue;
        }
        var xHitDistanceThreshold = target.displayWidth;
        var yHitDistanceThreshold = target.displayHeight / 2;
        var isTargetToLeft = target.x - attacker.x < 0;
        var didHit = Math.abs(target.x - attacker.x) < xHitDistanceThreshold
            && Math.abs(target.y - attacker.y) < yHitDistanceThreshold
            && ((isLookingLeft && isTargetToLeft)
                || (!isLookingLeft && !isTargetToLeft));
        if (didHit) {
            console.log(attacker.name + " hit " + target.name + "!");
            socket.emit('on_player_hit', {
                attacker: {
                    name: attacker.name
                },
                target: {
                    name: target.name
                },
                attackType: attackType
            });
            // will do damage on callback after confirmation from server
            if (isBowAttack) {
                // bow does not splash
                break;
            }
        }
    }
}
function bindAttack(aPlayer, condition, attackType) {
    if (condition && !aPlayer.isAttacking) {
        aPlayer.isAttacking = true;
        var isBowAttack = attackType.startsWith('attack_bow');
        var duration_1 = isBowAttack ? exports.bowAttackDuration : exports.attackDuration;
        // stop attack state after attack finished
        (function (attacker) {
            setTimeout(function () { attacker.isAttacking = false; }, duration_1);
        })(aPlayer);
        // only check for hit by this player on this client
        // to avoid sending the same hit signal from multiple clients
        if (aPlayer === player) {
            // check if hit any target in the middle of the attack
            // for better responsiveness
            (function (attacker, attackType) {
                setTimeout(function () { return checkHit(attacker, attackType); }, duration_1 / 2);
            })(aPlayer, attackType);
        }
        aPlayer.anims.play(attackType, false);
    }
}
exports.bindAttack = bindAttack;
//
function update() {
    if (keyK.isDown) {
        socket.emit('kick_all');
    }
    exports.game.players.map(function (p) { return p.update(); });
    // state
    var airborne = !player.body.touching.down;
    var moveSpeed = player.isCrouching ? Player_ts_1.moveSpeedNormal / 3 : Player_ts_1.moveSpeedNormal;
    // moveSpeed = aPlayer.moveSpeed;
    var shouldAnimateMovement = !airborne && !player.isAttacking;
    // movement
    var shouldCrouch = (keyC.isDown || keyS.isDown || keyCtrl.isDown) && shouldAnimateMovement;
    var shouldMoveLeft = cursors.left.isDown || keyA.isDown;
    var shouldMoveRight = cursors.right.isDown || keyD.isDown;
    var shouldJump = (cursors.up.isDown || keyW.isDown || cursors.space.isDown) && !airborne;
    var shouldSlash = keyQ.isDown;
    var shouldOverhead = keyE.isDown;
    var shouldUppercut = keyR.isDown;
    var shouldBow = keyF.isDown;
    // touch contorls
    var pointer = this.input.activePointer;
    if (pointer.isDown) {
        var touchX = pointer.x;
        var touchY = pointer.y;
        if (touchY > world.height / 2) {
            // |       |       |
            // | left  | right |
            shouldMoveRight = touchX > world.width / 2;
            shouldMoveLeft = !shouldMoveRight;
        }
        else {
            // | slash |  jump |
            // |       |       |
            shouldJump = touchX > world.width / 2 && !airborne;
            shouldSlash = touchX <= world.width / 2;
        }
    }
    if (shouldCrouch && !player.didCrouch) {
        socket.emit('on_player_crouch', playerData(player));
    }
    else if (!shouldCrouch && player.didCrouch) {
        socket.emit('on_player_stop_crouch', playerData(player));
    }
    if (shouldMoveLeft && !player.didMoveLeft) {
        socket.emit('on_player_moveLeft', playerData(player));
    }
    else if (!shouldMoveLeft && player.didMoveLeft) {
        socket.emit('on_player_stop_moveLeft', playerData(player));
    }
    if (shouldMoveRight && !player.didMoveRight) {
        socket.emit('on_player_moveRight', playerData(player));
    }
    else if (!shouldMoveRight && player.didMoveRight) {
        socket.emit('on_player_stop_moveRight', playerData(player));
    }
    if (shouldSlash && !player.didSlash && !player.isAttacking) {
        socket.emit('on_player_attack', playerData(player), 'attack_slash');
    }
    if (shouldOverhead && !player.didOverhead && !player.isAttacking) {
        socket.emit('on_player_attack', playerData(player), 'attack_overhead');
    }
    if (shouldUppercut && !player.didUppercut && !player.isAttacking) {
        socket.emit('on_player_attack', playerData(player), 'attack_uppercut');
    }
    if (shouldBow && !player.didBow && !player.isAttacking) {
        socket.emit('on_player_attack', playerData(player), 'attack_bow');
    }
    if (shouldMoveLeft) {
        player.moveLeft();
    }
    else if (shouldMoveRight) {
        player.moveRight();
    }
    else {
        player.setVelocityX(0);
        if (shouldAnimateMovement) {
            player.anims.play('idle', true);
        }
    }
    // jump
    if (shouldJump) {
        player.jump();
        socket.emit('on_player_jump', playerData(player));
    }
    // crouch
    if (shouldCrouch) {
        player.isCrouching = true;
        player.anims.play('crouch', true);
    }
    else {
        player.isCrouching = false;
    }
    if (airborne && !player.isAttacking) {
        player.anims.play('jump', true);
    }
    bindAttack(player, shouldSlash, 'attack_slash');
    bindAttack(player, shouldOverhead, 'attack_overhead');
    bindAttack(player, shouldUppercut, 'attack_uppercut');
    bindAttack(player, shouldBow, 'attack_bow' + (player.airborne ? '_jump' : ''));
    tickNumber += 1;
    // ~ 7sec per 1k ticks
    if (tickNumber % 50 === 0) {
        // ~3 qps per client
        socket.emit('on_sync_pos', playerData(player));
    }
    player.didCrouch = shouldCrouch;
    player.didMoveLeft = shouldMoveLeft;
    player.didMoveRight = shouldMoveRight;
    player.didJump = shouldJump;
    player.shouldSlash = shouldSlash;
    player.shouldOverhead = shouldOverhead;
    player.shouldUppercut = shouldUppercut;
    player.shouldBow = shouldBow;
    updateLabels();
}
function updateLabels() {
    //     hiScoreText.setText(`hi score: ${hiScore.name} => ${hiScore.count}`);
    //     warning = player.shouldTrackStats ? '' : ' (UNTRACKERD: add ?name=<name> to url)';
    //     jumpScoreText.setText(`jump score: ${player.jumpScore}${warning}`);
    //     if (game.players.length > 1) {
    //         hiScoreText.setText(game.players[0].healthBar.x + ' ' + game.players[0].healthBar.y);
    //         jumpScoreText.setText(game.players[1].healthBar.x + ' ' + game.players[1].healthBar.y);
    //     }
    //     labels.forEach(function(text) {
    //       text.setVisible(player.shouldShowText);
    //     });
}
//
// function createExtra() {
//     // extra
//
//     fontObj = { fontFamily: '"Roboto Condensed"', fontSize:'24px' };
//     // controls
//     controlsText = scene.add.text(0, 0, controlsString, fontObj);
//     hiScoreText = scene.add.text(0, 40, `hi score: ${hiScore.name} => ${hiScore.count}`, fontObj);
//     jumpScoreText = scene.add.text(0, 80, `jump score: ${player.jumpScore}`, fontObj);
//     labels = [controlsText, hiScoreText, jumpScoreText];
//     if (player.shouldTrackStats) {
//         pollMaxJumps();
//     }
//     updateLabels();
//     scene.input.keyboard.on('keydown', function (eventName, event) {
//         if (eventName.key === 'z') {
//             eventName.stopImmediatePropagation();
//             player.shouldShowText = !player.shouldShowText;
//             updateLabels();
//         }
//     });
//     var particles = scene.add.particles('red');
// }
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}
;
