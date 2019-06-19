import 'phaser'
import {YungSkryllaSceneCreate} from './YungSkryllaSceneCreate'
import {Player} from '../Player_ts'

export interface Position {
    x: number;
    y: number;
}

export interface PlayerData {
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

export function createPlayerFromPlayerData(
    scene: YungSkryllaSceneCreate,
    playerData: PlayerData
): Player {
    // player creation
    console.log('creating from', playerData);
    let newPlayer = new Player(scene, playerData.pos.x, playerData.pos.y, playerData.name);
    // collide with platforms
    scene.physics.add.collider(newPlayer, scene.platforms);
    return newPlayer;
}
