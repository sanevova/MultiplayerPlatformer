import 'phaser';
import {attackDuration, bowAttackDuration} from './Player_ts'

export function loadAnimations(scene) {
    // adventurer
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
    scene.anims.create({
        key: 'attack_bow',
        frames: scene.anims.generateFrameNumbers('adventurer-bow', { start: 0, end: 8 }),
        duration: bowAttackDuration,
        repeat: 0
    });
    scene.anims.create({
        key: 'attack_bow_jump',
        frames: scene.anims.generateFrameNumbers('adventurer-bow', { start: 9, end: 14 }),
        duration: bowAttackDuration,
        repeat: 0
    });

    // projectiles
    scene.anims.create({
        key: 'fireball-burn',
        frames: scene.anims.generateFrameNumbers('fireball', { start: 0, end: 59 }),
        frameRate: 30,
        repeat: -1
    });
    scene.anims.create({
        key: 'iceball-burn',
        frames: scene.anims.generateFrameNumbers('iceball', { start: 0, end: 59 }),
        frameRate: 30,
        repeat: -1
    });
    scene.anims.create({
        key: 'fireball-small-burn',
        frames: scene.anims.generateFrameNumbers('fireball-small', { start: 0, end: 59 }),
        frameRate: 30,
        repeat: -1
    });

    // effects
    scene.anims.create({
        key: 'solar_vortex-spin',
        frames: scene.anims.generateFrameNumbers('solar_vortex', { start: 0, end: 60 }),
        frameRate: 30,
        repeat: -1
    });
    scene.anims.create({
        key: 'snow_vortex-spin',
        frames: scene.anims.generateFrameNumbers('snow_vortex', { start: 0, end: 60 }),
        frameRate: 30,
        repeat: -1
    });
}
