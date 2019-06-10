console.log('loaded plat.js');

world = {
    width: window.innerWidth,
    height: window.innerHeight
};
attackDuration = 500;
moveSpeedNormal = 360;
jumpSpeedNormal = 560;
tickNumber = 0;

controlsString = 'MOVE=WASD ATTCK=QER CROUCH=C,S HIDE=Z';
nameFont = {
    fontFamily: '"Roboto Condensed"',
    fontSize: '32px',
    fontStyle: 'bold',
    fill: "#c51b7d"
};

hiScore = {
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
            gravity: { y: 600 },
            debug: false
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
var myname;


var game = new Phaser.Game(config);

game.players = [];

function preload ()
{
    console.log('preload');

    platform_image = this.load.image('platform', 'assets/blocks/platform.png');
    this.load.spritesheet('adventurer', 'assets/adventurer/adventurer-sheet.png', { frameWidth: 50, frameHeight: 37 });

    this.load.image('sky', 'assets/blocks/space3.png');
    this.load.image('logo', 'assets/blocks/phaser3-logo.png');
    this.load.image('red', 'assets/blocks/red.png');
    keyW = this.input.keyboard.addKey('W');
    keyA = this.input.keyboard.addKey('A');
    keyS = this.input.keyboard.addKey('S');
    keyD = this.input.keyboard.addKey('D');
    keyQ = this.input.keyboard.addKey('Q');
    keyE = this.input.keyboard.addKey('E');
    keyR = this.input.keyboard.addKey('R');
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
    };
}

function createPlayerFromPlayerData(playerData) {
    // player creation
    console.log('creating from', playerData);
    newPlayer = scene.physics.add.sprite(playerData.pos.x, playerData.pos.y, 'adventurer').setSize(25, 34).setScale(2);
    newPlayer.setCollideWorldBounds(true);
    newPlayer.isAttacking = false;
    newPlayer.name = playerData.name;
    newPlayer.shouldTrackStats = false; //newPlayer.name.length > 0;
    newPlayer.shouldShowText = false;
    newPlayer.jumpScore = 0;

    // collide with platforms
    scene.physics.add.collider(newPlayer, scene.game.platforms);

    newPlayer.jump = function() {
        // < 0 but accounting for float error
        if (this.body.velocity.y < -5) {
            // already jumping
            return;
        }
        this.setVelocityY(-jumpSpeedNormal);
    };
    newPlayer.crouch = function() {
        this.isCrouching = true;
        this.anims.play('crouch', true);
    };
    newPlayer.stopCrouch = function() {
        this.isCrouching = false;
    };
    newPlayer.moveLeft = function() {
        airborne = !this.body.touching.down;
        shouldAnimateMovement = !airborne && !this.isAttacking;
        this.setVelocityX(-this.moveSpeed);

        this.flipX = 1;
        if (shouldAnimateMovement) {
            this.anims.play('run', true);
        }
    };
    newPlayer.moveRight = function() {
        airborne = !this.body.touching.down;
        shouldAnimateMovement = !airborne && !this.isAttacking;
        this.setVelocityX(this.moveSpeed);
        this.flipX = 0;
        if (shouldAnimateMovement) {
            this.anims.play('run', true);
        }
    };
    newPlayer.stopMove = function() {
        this.setVelocityX(0);
        this.anims.play('idle', true);
    };
    newPlayer.slash = function() {
        bindAttack(this, true, 'attack_slash');
    };
    // diplay player name
    nameTag = scene.add.text(playerData.pos.x, playerData.pos.y, playerData.name, nameFont);
    newPlayer.nameTag = nameTag;
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
    myname = player.name;
    game.players.push(player);
    socket = connect_as(playerData(player));
    return player;
}

function findPlayer(name) {
    return game.players.find(
        (aPlayer) => aPlayer.name === name
    );
}

function configureSocketEvents() {
    socket.on('did_connect', (gameState) => {
        console.log('connected! other players:', gameState);
        // add game objects for other players
        game.players = game.players.concat(gameState.otherPlayers.map(
            (otherPlayer) => createPlayerFromPlayerData(otherPlayer)
        ));
    });
    socket.on('player_did_connect', (newPlayer) => {
        console.log('new player connected!', newPlayer);
        // add game object for new player
        newPlayerObj = createPlayerFromPlayerData(newPlayer);
        newPlayerObj.anims.play('idle', true);
        game.players.push(newPlayerObj);
    });
    socket.on('player_did_jump', (jumpingPlayerData) => {
        // add game object for new player
        jumpingPlayer = findPlayer(jumpingPlayerData.name);
        if (jumpingPlayer) {
            jumpingPlayer.jump();
        }
    });
    socket.on('player_did_crouch', (aPlayer) => {
        match = findPlayer(aPlayer.name);
        if (match) {
            match.crouch();
        }
    });
    socket.on('player_did_stop_crouch', (aPlayer) => {
        match = findPlayer(aPlayer.name);
        if (match) {
            match.stopCrouch();
        }
    });
    socket.on('player_did_moveLeft', (aPlayer) => {
        match = findPlayer(aPlayer.name);
        if (match) {
            match.moveLeft();
        }
    });
    socket.on('player_did_stop_moveLeft', (aPlayer) => {
        match = findPlayer(aPlayer.name);
        if (match) {
            match.stopMove();
        }
    });
    socket.on('player_did_moveRight', (aPlayer) => {
        match = findPlayer(aPlayer.name);
        if (match) {
            match.moveRight();
        }
    });
    socket.on('player_did_stop_moveRight', (aPlayer) => {
        match = findPlayer(aPlayer.name);
        if (match) {
            match.stopMove();
        }
    });

    socket.on('player_did_slash', (aPlayer) => {
        match = findPlayer(aPlayer.name);
        if (match) {
            match.slash();
        }
    });

}

function create() {
    console.log('create');

    // map creation
    this.add.image(400, 300, 'sky');

    this.game.platforms = this.physics.add.staticGroup();

    this.game.platforms.create(100, 528, 'platform').refreshBody();
    this.game.platforms.create(300, 528, 'platform').refreshBody();
    this.game.platforms.create(500, 528, 'platform').refreshBody();
    this.game.platforms.create(700, 528, 'platform').refreshBody();
    this.game.platforms.create(1000, 628, 'platform').refreshBody();
    this.game.platforms.create(1400, 828, 'platform').refreshBody();
    this.game.platforms.create(1200, 998, 'platform').refreshBody();
    this.game.platforms.create(900, 1100, 'platform').refreshBody();
    for (i = 0; i < 20; ++i) {
        this.game.platforms.create(200 * i + 100, world.height - 60, 'platform').refreshBody();
    }
    this.game.platforms.create(600, 370, 'platform');
    this.game.platforms.create(50, 250, 'platform');
    this.game.platforms.create(750, 220, 'platform');

    player = createMyPlayer();
    configureSocketEvents();
    // this.physics.add.collider(player, this.game.platforms);

    // animations
    loadAnimations(this);
    cursors = this.input.keyboard.createCursorKeys();

    // unimportant stuff
    createExtra();
}

function bindAttack(aPlayer, condition, animationName) {
    if (condition && !aPlayer.isAttacking) {
        aPlayer.isAttacking = true;
        setTimeout(() => {aPlayer.isAttacking = false;}, attackDuration);
        aPlayer.anims.play(animationName, false);
    }
}

function updatePlayer(aPlayer) {
    // console.log('updating', aPlayer.name);
    aPlayer.nameTag.setX(aPlayer.x - aPlayer.body.width / 2);
    aPlayer.nameTag.setY(aPlayer.y - aPlayer.body.height);

    // state
    aPlayer.airborne = !aPlayer.body.touching.down;
    aPlayer.moveSpeed = aPlayer.isCrouching ? moveSpeedNormal / 3 : moveSpeedNormal;
    aPlayer.shouldAnimateMovement = !aPlayer.airborne && !aPlayer.isAttacking;
    if (!aPlayer.isAttacking) {
        // if (aPlayer.airborne) {
        //     aPlayer.anims.play('jump', true);
        // } else if (aPlayer.isCrouching) {
        //     aPlayer.anims.play('crouch', true);
        // } else {
        //     aPlayer.anims.play('idle', true);
        // }
    }
}

function update()
{
    if (keyK.isDown) {
        socket.emit('kick_all');
    }

    game.players.map(updatePlayer);

    // state
    airborne = !player.body.touching.down;
    moveSpeed = player.isCrouching ? moveSpeedNormal / 3 : moveSpeedNormal;
    // moveSpeed = aPlayer.moveSpeed;
    shouldAnimateMovement = !airborne && !player.isAttacking;

    // movement
    shouldCrouch = (keyC.isDown || keyS.isDown || keyCtrl.isDown) && shouldAnimateMovement
    shouldMoveLeft = cursors.left.isDown || keyA.isDown
    shouldMoveRight = cursors.right.isDown || keyD.isDown;
    shouldJump = (cursors.up.isDown || keyW.isDown || cursors.space.isDown) && !airborne;
    shouldSlash = keyQ.isDown;

    if (shouldCrouch && !player.didCrouch) {
        socket.emit('on_player_crouch', {name: player.name});
    } else if (!shouldCrouch && player.didCrouch) {
        socket.emit('on_player_stop_crouch', {name: player.name});
    }
    if (shouldMoveLeft && !player.didMoveLeft) {
        socket.emit('on_player_moveLeft', {name: player.name});
    } else if (!shouldMoveLeft && player.didMoveLeft) {
        socket.emit('on_player_stop_moveLeft', {name: player.name});
    }
    if (shouldMoveRight && !player.didMoveRight) {
        socket.emit('on_player_moveRight', {name: player.name});
    } else if (!shouldMoveRight && player.didMoveRight) {
        socket.emit('on_player_stop_moveRight', {name: player.name});
    }
    if (shouldSlash && !player.didSlash) {
        socket.emit('on_player_slash', {name: player.name});
    }





    if (game.players.length <= 1) {
        // touch contorls
        // disalbe for multiplayer
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
    }

    if (shouldMoveLeft) {
        player.setVelocityX(-moveSpeed);

        player.flipX = 1;
        if (shouldAnimateMovement) {
            player.anims.play('run', true);
        }
    }
    else if (shouldMoveRight) {
        player.setVelocityX(moveSpeed);
        player.flipX = 0;
        if (shouldAnimateMovement) {
            player.anims.play('run', true);
        }
    }
    else {
        player.setVelocityX(0);
        if (shouldAnimateMovement) {
            player.anims.play('idle', true);
        }
    }

    // jump
    if (shouldJump) {
        // jumpStats();
        player.jump();
        if (player.name === myname) {
            socket.emit('on_player_jump', {
                name: player.name
            });
        }
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
    bindAttack(player, keyE.isDown, 'attack_overhead');
    bindAttack(player, keyR.isDown, 'attack_uppercut');

    tickNumber += 1;
    // ~ 9sec per 1k ticks
    if (tickNumber % 2000 === 0 && player.shouldTrackStats) {
        console.log('2000 ticks', new Date());
        // pollMaxJumps();
    }

    player.didCrouch = shouldCrouch;
    player.didMoveLeft = shouldMoveLeft;
    player.didMoveRight = shouldMoveRight;
    player.didJump = shouldJump;
    player.didSlash = shouldSlash;
}

function updateLabels() {
    hiScoreText.setText(`hi score: ${hiScore.name} => ${hiScore.count}`);
    warning = player.shouldTrackStats ? '' : ' (UNTRACKERD: add ?name=<name> to url)';
    jumpScoreText.setText(`jump score: ${player.jumpScore}${warning}`);
    labels.forEach(function(text) {
      text.setVisible(player.shouldShowText);
    });
}

function createExtra() {
    // extra

    fontObj = { fontFamily: '"Roboto Condensed"', fontSize:'24px' };
    // controls
    controlsText = scene.add.text(0, 0, controlsString, fontObj);
    hiScoreText = scene.add.text(0, 40, `hi score: ${hiScore.name} => ${hiScore.count}`, fontObj);
    jumpScoreText = scene.add.text(0, 80, `jump score: ${player.jumpScore}`, fontObj);
    labels = [controlsText, hiScoreText, jumpScoreText];
    if (player.shouldTrackStats) {
        pollMaxJumps();
    }
    updateLabels();
    scene.input.keyboard.on('keydown', function (eventName, event) {
        if (eventName.key === 'z') {
            eventName.stopImmediatePropagation();
            player.shouldShowText = !player.shouldShowText;
            updateLabels();
        }
    });
    var particles = scene.add.particles('red');
}

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};
