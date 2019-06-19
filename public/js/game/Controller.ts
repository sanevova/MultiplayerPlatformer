import 'phaser'
import {SpellName} from '../spells/Spell'
import {YungSkryllaScenePreload} from './YungSkryllaScenePreload'

type Key = Phaser.Input.Keyboard.Key;

export class Controller {
    keyW: Key;
    keyA: Key;
    keyS: Key;
    keyD: Key;
    keyQ: Key;
    keyE: Key;
    keyR: Key;
    keyF: Key;
    keyC: Key;
    keyK: Key;

    cursors: any;

    constructor(scene: YungSkryllaScenePreload) {
        this.keyW = scene.input.keyboard.addKey('W');
        this.keyA = scene.input.keyboard.addKey('A');
        this.keyS = scene.input.keyboard.addKey('S');
        this.keyD = scene.input.keyboard.addKey('D');
        this.keyQ = scene.input.keyboard.addKey('Q');
        this.keyE = scene.input.keyboard.addKey('E');
        this.keyR = scene.input.keyboard.addKey('R');
        this.keyF = scene.input.keyboard.addKey('F');
        this.keyC = scene.input.keyboard.addKey('C');
        this.keyK = scene.input.keyboard.addKey('K');
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.bindSpells(scene);
    }

    bindSpells(scene: YungSkryllaScenePreload): void {
        // spell keybinds
        (function(gameScene) {
            scene.input.keyboard.on('keydown', function (eventName, event) {
                if (eventName.key === '1') {
                    eventName.stopImmediatePropagation();
                    gameScene.player.castSpell(SpellName.SPRINT);
                } else if (eventName.key === '2') {
                    eventName.stopImmediatePropagation();
                    gameScene.player.castSpell(SpellName.FIREBALL);
                } else if (eventName.key === '3') {
                    eventName.stopImmediatePropagation();
                    gameScene.player.castSpell(SpellName.ICEBALL);
                }
            });
        })(scene);
    }
}
