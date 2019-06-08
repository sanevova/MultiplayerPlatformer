function loadAnimations(scene) {
    scene.anims.create({
        key: 'idle',
        frames: scene.anims.generateFrameNumbers('adventurer', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
    scene.anims.create({
        key: 'crouch',
        frames: scene.anims.generateFrameNumbers('adventurer', { start: 4, end: 8 }),
        frameRate: 10,
        repeat: -1
    });
    scene.anims.create({
        key: 'run',
        frames: scene.anims.generateFrameNumbers('adventurer', { start: 9, end: 14 }),
        frameRate: 10,
        repeat: -1
    });
    scene.anims.create({
        key: 'jump',
        frames: scene.anims.generateFrameNumbers('adventurer', { start: 15, end: 18 }),
        duration: 1500,
        repeat: -1,
        yoyo: 1
    });
    scene.anims.create({
        key: 'attack_uppercut',
        frames: scene.anims.generateFrameNumbers('adventurer', { start: 42, end: 46 }),
        duration: attackDuration,
        repeat: 0
    });
    scene.anims.create({
        key: 'attack_overhead',
        frames: scene.anims.generateFrameNumbers('adventurer', { start: 47, end: 52 }),
        duration: attackDuration,
        repeat: 0
    });
    scene.anims.create({
        key: 'attack_slash',
        frames: scene.anims.generateFrameNumbers('adventurer', { start: 53, end: 59 }),
        duration: attackDuration,
        repeat: 0
    });
}
