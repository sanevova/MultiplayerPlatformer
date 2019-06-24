import 'phaser'
import {SpellName} from '../spells/Spell'
import {Position} from '../game/PlayerUtils'
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
    keyZ: Key;

    cursors: any;

    canDropDown: boolean;

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
        this.keyZ = scene.input.keyboard.addKey('Z');
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.canDropDown = true;
        this._bindSpells(scene);
    }

    static pointerPosition(scene: YungSkryllaScenePreload): Position {
        let pointer = scene.input.activePointer;
        return {
            x: pointer.x,
            y: pointer.y
        };
    }

    _bindSpells(scene: YungSkryllaScenePreload): void {
        // spell keybinds
        (function(gameScene) {
            scene.input.keyboard.on('keydown', function (eventName, event) {
                let player = gameScene.player;
                if (eventName.key === '1') {
                    eventName.stopImmediatePropagation();
                    player.castSpell(SpellName.SPRINT);
                } else if (eventName.key === '2') {
                    eventName.stopImmediatePropagation();
                    player.castSpell(SpellName.FIREBALL);
                } else if (eventName.key === '3') {
                    eventName.stopImmediatePropagation();
                    player.castSpell(SpellName.ICEBALL);
                } else if (eventName.key === '4') {
                    eventName.stopImmediatePropagation();
                    if (scene.input.activePointer === null) {
                        return;
                    }
                    player.castSpell(
                        SpellName.SOLAR_VORTEX,
                        Controller.pointerPosition(scene)
                    );
                } else if (eventName.key === '5') {
                    eventName.stopImmediatePropagation();
                    if (scene.input.activePointer === null) {
                        return;
                    }
                    player.castSpell(
                        SpellName.SNOW_VORTEX,
                        Controller.pointerPosition(scene)
                    );
                }
            });
        })(scene);
    }
}
