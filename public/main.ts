import 'phaser';
import {YungSkryllaScene} from './js/game/YungSkryllaScene'
import {isLocalhost} from './js/client_ts'

let world = {
    width: window.innerWidth,
    height: window.innerHeight
};

let controlsString = 'MOVE=WASD ATTCK=QER CROUCH=C,S HIDE=Z';

export var scene = new YungSkryllaScene('YungSkrylla');

var newConfig = {
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
    scene: scene
};

var game = new Phaser.Game(newConfig);
