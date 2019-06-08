console.log('loaded plat.js');

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
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

    this.load.image('platform', 'assets/blocks/platform.png');
    this.load.spritesheet('adventurer', 'assets/adventurer/adventurer-sheet.png', { frameWidth: 50, frameHeight: 37 });

    this.load.image('sky', 'assets/blocks/space3.png');
    this.load.image('logo', 'assets/blocks/phaser3-logo.png');
    this.load.image('red', 'assets/blocks/red.png');

    keyW = this.input.keyboard.addKey('W');
    keyA = this.input.keyboard.addKey('A');
    keyS = this.input.keyboard.addKey('S');
    keyD = this.input.keyboard.addKey('D');

}

function create ()
{
    console.log('create');
    this.add.image(400, 300, 'sky');

    platforms = this.physics.add.staticGroup();

    platforms.create(100, 528, 'platform').refreshBody();
    platforms.create(300, 528, 'platform').refreshBody();
    platforms.create(500, 528, 'platform').refreshBody();
    platforms.create(700, 528, 'platform').refreshBody();

    platforms.create(600, 370, 'platform');
    platforms.create(50, 250, 'platform');
    platforms.create(750, 220, 'platform');

    player = this.physics.add.sprite(100, 450, 'adventurer').setSize(25, 37).setScale(2);
    console.log(player);
    player.setCollideWorldBounds(true);

    this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('adventurer', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'crouch',
        frames: this.anims.generateFrameNumbers('adventurer', { start: 4, end: 8 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'run',
        frames: this.anims.generateFrameNumbers('adventurer', { start: 9, end: 14 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'jump',
        frames: this.anims.generateFrameNumbers('adventurer', { start: 15, end: 18 }),
        frameRate: 5,
        repeat: -1
    });

    cursors = this.input.keyboard.createCursorKeys();

    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    this.physics.add.collider(player, platforms);
}

function update ()
{
    airborne = !player.body.touching.down;
    if (cursors.left.isDown || keyA.isDown)
    {
        player.setVelocityX(-360);

        player.flipX = 1;
        if (!airborne) {
            player.anims.play('run', true);
        }
    }
    else if (cursors.right.isDown || keyD.isDown)
    {
        player.setVelocityX(360);
        player.flipX = 0;
        if (!airborne) {
            player.anims.play('run', true);
        }
    }
    else
    {
        player.anims.play('idle', true);
        player.setVelocityX(0);
    }

    if ((cursors.up.isDown || keyW.isDown || cursors.space.isDown) && player.body.touching.down)
    {
        player.setVelocityY(-530);
    }

    if (airborne) {
      player.anims.play('jump', true);
    }
}
