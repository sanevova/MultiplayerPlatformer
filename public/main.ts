// import './js/phaser';
import 'phaser';
import {isLocalhost, connectAs} from './js/client_ts'
import {loadAnimations} from './js/animations_ts'
import {configureSocketEvents} from './js/sockets_ts'
import {Player, moveSpeedNormal} from './js/Player_ts'
import {SpellName} from './js/spells/Spell'
import {Projectile} from './js/Projectile_ts'

var world = {
    width: window.innerWidth,
    height: window.innerHeight
};

export var attackDuration = 500;
export var bowAttackDuration = 1000;

export var tickNumber = 0;

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
        default: 'arcade',
        arcade: {
            gravity: { y: 450 },
            debug: isLocalhost()
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
export var socket;
var scene;

// declare var game: Phaser.Game;
class YungSkryllaGame extends Phaser.Game {
    players: Player[];
    player: Player;

    constructor(config) {
        super(config);
        this.players = [];
    }
}

// import {YungSkryllaScene} from './js/game/YungSkryllaScene'
//
// var newConfig = {
//     type: Phaser.AUTO,
//     width: world.width,
//     height: world.height,
//     physics: {
//         default: 'arcade',
//         arcade: {
//             gravity: { y: 450 },
//             debug: isLocalhost()
//         }
//     },
//     scene: new YungSkryllaScene(newConfig) // scene name instead of config actually
// https://github.com/photonstorm/phaser3-examples/blob/master/public/src/scenes/scene%20from%20instance.js
// };
// export var game = new Phaser.Game(config);

// var gameScene = new Phaser.Scene('Game');

// export var game = new Phaser.Game(newConfig);
// export var game = new Phaser.Game(config);
export var game = new YungSkryllaGame(config);

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

interface Position {
    x: number;
    y: number;
}

interface PlayerData {
    name: string;
    pos: Position;
}

export function playerData(player): PlayerData {
    return {
        name: player.name,
        pos: {
            x: player.x,
            y: player.y
        }
        // health?
    };
}

export function createPlayerFromPlayerData(playerData) {
    // player creation
    console.log('creating from', playerData);
    let newPlayer = new Player(scene, playerData.pos.x, playerData.pos.y, playerData.name);
    // collide with platforms
    scene.physics.add.collider(newPlayer, scene.game.platforms);
    return newPlayer;
}

function randname() {
    return Math.random().toString(36).substring(7);
}

function createMyPlayer() {
    player = createPlayerFromPlayerData({
        name:  getUrlParameter('name') || randname(),
        pos: {
            x: 100,
            y: 450
        }
    });
    game.player = player;
    game.players.push(player);
    socket = connectAs(playerData(player));
    return player;
}

function create() {
    console.log('create');
    // map creation
    let bg = this.add.image(world.width / 2, world.height / 2, 'sky');
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
    configureSocketEvents(socket);

    // animations
    loadAnimations(this);
    cursors = this.input.keyboard.createCursorKeys();

    // spell keybinds
    scene.input.keyboard.on('keydown', function (eventName, event) {
        if (eventName.key === '1') {
            eventName.stopImmediatePropagation();
            player.castSpell(SpellName.SPRINT);
        } else if (eventName.key === '2') {
            eventName.stopImmediatePropagation();
            player.castSpell(SpellName.FIREBALL);
        } else if (eventName.key === '3') {
            eventName.stopImmediatePropagation();
            player.castSpell(SpellName.ICEBALL);
        }
    });

    scene.physics.world.on('worldbounds', function(body) {
        if (body.gameObject instanceof Projectile) {
            body.gameObject.destroy();
        }
    });
}

function checkHit(attacker, attackType) {
    // check hit
    let isBowAttack = attackType.startsWith('attack_bow');
    let isLookingLeft = attacker.flipX;
    for (var i = 0; i < game.players.length; ++i) {
        let target = game.players[i];
        if (target === attacker) {
            continue;
        }
        let xHitDistanceThreshold = target.displayWidth;
        let yHitDistanceThreshold = target.displayHeight / 2;
        let isTargetToLeft = target.x - attacker.x < 0;
        let didHit =
            Math.abs(target.x - attacker.x) < xHitDistanceThreshold
            && Math.abs(target.y - attacker.y) < yHitDistanceThreshold
            && (
                (isLookingLeft && isTargetToLeft)
                || (!isLookingLeft && !isTargetToLeft)
            );
        if (didHit) {
            console.log(`${attacker.name} hit ${target.name}!`)
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

export function bindAttack(aPlayer, condition, attackType) {
    if (condition && !aPlayer.isAttacking) {
        aPlayer.isAttacking = true;
        let isBowAttack = attackType.startsWith('attack_bow');
        let duration = isBowAttack ? bowAttackDuration : attackDuration;
        // stop attack state after attack finished
        (function(attacker) {
            setTimeout(() => {attacker.isAttacking = false;}, duration);
        })(aPlayer);

        // only check for hit by this player on this client
        // to avoid sending the same hit signal from multiple clients
        if (aPlayer === player) {
            // check if hit any target in the middle of the attack
            // for better responsiveness
            (function(attacker, attackType) {
                setTimeout(() => checkHit(attacker, attackType), duration / 2);
            })(aPlayer, attackType);
        }
        aPlayer.anims.play(attackType, false);
    }
}

function update(time, delta) {
    if (keyK.isDown) {
        socket.emit('kick_all');
    }

    game.players.map(p => p.update());

    // state
    let airborne = !player.body.touching.down;
    let moveSpeed = player.isCrouching ? moveSpeedNormal / 3 : moveSpeedNormal;
    // moveSpeed = aPlayer.moveSpeed;
    let shouldAnimateMovement = !airborne && !player.isAttacking;

    // movement
    let shouldCrouch = (keyC.isDown || keyS.isDown || keyCtrl.isDown) && shouldAnimateMovement
    let shouldMoveLeft = cursors.left.isDown || keyA.isDown
    let shouldMoveRight = cursors.right.isDown || keyD.isDown;
    let shouldJump = (cursors.up.isDown || keyW.isDown || cursors.space.isDown) && !airborne;
    let shouldSlash = keyQ.isDown;
    let shouldOverhead = keyE.isDown;
    let shouldUppercut = keyR.isDown;
    let shouldBow = keyF.isDown;

    if (shouldMoveLeft && shouldMoveRight) {
        shouldMoveLeft = shouldMoveRight = false;
    }

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
        } else {
            // | slash |  jump |
            // |       |       |
            shouldJump = touchX > world.width / 2  && !airborne;
            shouldSlash = touchX <= world.width / 2;
        }
    }


    if (shouldCrouch && !player.didCrouch) {
        socket.emit('on_player_crouch', playerData(player));
    } else if (!shouldCrouch && player.didCrouch) {
        socket.emit('on_player_stop_crouch', playerData(player));
    }
    if (shouldMoveLeft && !player.didMoveLeft) {
        socket.emit('on_player_moveLeft', playerData(player));
    } else if (!shouldMoveLeft && player.didMoveLeft) {
        socket.emit('on_player_stop_moveLeft', playerData(player));
    }
    if (shouldMoveRight && !player.didMoveRight) {
        socket.emit('on_player_moveRight', playerData(player));
    } else if (!shouldMoveRight && player.didMoveRight) {
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
    } else {
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
    if (tickNumber % 500 === 0) {
        // socket.emit('on_sync_pos', playerData(player));
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

function getUrlParameter(name: string): string {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};
