console.log('loaded plat.js');

world = {
    width: window.innerWidth,
    height: window.innerHeight
};
attackDuration = 500;
moveSpeedNormal = 360;
jumpSpeedNormal = 560;
tickNumber = 0;
controlsString = 'MOVE=WASD ATTCK=QER CROUCH=C,S';

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
var platforms;
var cursors;
var score = 0;
var scoreText;

var game = new Phaser.Game(config);

function preload ()
{
    console.log('preload');

    platform_image = this.load.image('platform', 'assets/blocks/platform.png');
    console.log('img', platform_image);
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
    keyCtrl = this.input.keyboard.addKey('Control');

}

function create ()
{
    console.log('create');

    // map creation
    this.add.image(400, 300, 'sky');

    platforms = this.physics.add.staticGroup();

    platforms.create(100, 528, 'platform').refreshBody();
    platforms.create(300, 528, 'platform').refreshBody();
    platforms.create(500, 528, 'platform').refreshBody();
    platforms.create(700, 528, 'platform').refreshBody();
    platforms.create(1000, 628, 'platform').refreshBody();
    platforms.create(1400, 828, 'platform').refreshBody();
    platforms.create(1200, 998, 'platform').refreshBody();
    platforms.create(900, 1100, 'platform').refreshBody();
    for (i = 0; i < 20; ++i) {
        platforms.create(200 * i + 100, world.height - 60, 'platform').refreshBody();
    }
    platforms.create(600, 370, 'platform');
    platforms.create(50, 250, 'platform');
    platforms.create(750, 220, 'platform');

    // player creation
    player = this.physics.add.sprite(100, 450, 'adventurer').setSize(25, 34).setScale(2);
    console.log(player);
    player.setCollideWorldBounds(true);
    player.isAttacking = false;
    player.name = getUrlParameter('name');
    player.shouldTrackStats = player.name.length > 0;
    player.jumpScore = 0;
    var particles = this.add.particles('red');


    // animations
    loadAnimations(this);

    cursors = this.input.keyboard.createCursorKeys();

    this.physics.add.collider(player, platforms);

    // controls
    this.add.text(0, 0, controlsString, { fontFamily: '"Roboto Condensed"', fontSize:'24px' });
    hiScoreText = this.add.text(0, 40, `hi score: ${hiScore.name} => ${hiScore.count}`,
        { fontFamily: '"Roboto Condensed"', fontSize:'24px' });
    jumpScore = this.add.text(0, 80, `jump score: ${player.jumpScore}`,
        { fontFamily: '"Roboto Condensed"', fontSize:'24px' });
    pollMaxJumps();
}

function bindAttack(condition, animationName) {
    if (condition && !player.isAttacking) {
        player.isAttacking = true;
        setTimeout(() => {player.isAttacking = false;}, attackDuration);
        player.anims.play(animationName, false);
    }
}

function updateScoreLabels() {
    hiScoreText.setText(`hi score: ${hiScore.name} => ${hiScore.count}`);
    warning = player.shouldTrackStats ? '' : ' (UNTRACKERD: add ?name=<name> to url)';
    jumpScore.setText(`jump score: ${player.jumpScore}${warning}`);
}

// random name tries to set max score (count)
function trySetMaxJumps(name, count) {
    console.log('got jumps for max', name, count);
    if (player.shouldTrackStats && name === player.name && count > player.jumpScore) {
        player.jumpScore = count;
    }
    if (count > hiScore.count) {
        console.log('INSIDEW', count, hiScore.count);
        hiScore = {
            name: name,
            count: count
        };
    }
    updateScoreLabels();

}

function pollMaxJumps() {
    console.log('polling');
    console.log('polling max');
    readMax(trySetMaxJumps);
    if (player.shouldTrackStats) {
        console.log('polling', name);
        read(player.name, trySetMaxJumps);
    }
}

function jump() {
    // < 0 but accounting for float error
    if (player.body.velocity.y < -5) {
        console.log('already started jumping');
        return;
    }
    console.log('jumping');
    player.setVelocityY(-jumpSpeedNormal);
    // stats
    if (player.shouldTrackStats) {
        // bump jump count
        read(player.name, (name, count) => {
            player.jumpScore = count + 1;
            write(name, player.jumpScore);
            trySetMaxJumps(name, player.jumpScore);
        });
    } else {
        // means no db reads or writes for this player
        player.jumpScore += 1;
    }
    updateScoreLabels();
}

function update()
{
    // state
    airborne = !player.body.touching.down;
    moveSpeed = player.isCrouching ? moveSpeedNormal / 3 : moveSpeedNormal;
    shouldAnimateMovement = !airborne && !player.isAttacking;

    // movement
    shouldCrouch = (keyC.isDown || keyS.isDown || keyCtrl.isDown) && shouldAnimateMovement
    shouldMoveLeft = cursors.left.isDown || keyA.isDown
    shouldMoveRight = cursors.right.isDown || keyD.isDown;
    shouldJump = (cursors.up.isDown || keyW.isDown || cursors.space.isDown) && !airborne;
    shouldSlash = keyQ.isDown;


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
        jump();
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

    bindAttack(shouldSlash, 'attack_slash');
    bindAttack(keyE.isDown, 'attack_overhead');
    bindAttack(keyR.isDown, 'attack_uppercut');


    tickNumber += 1;
    // ~ 9sec per 1k ticks
    if (tickNumber % 2000 === 0) {
        console.log('2000 ticks');
        pollMaxJumps();
    }
}

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};
