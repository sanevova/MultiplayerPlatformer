import {scene} from '../main'
import {createPlayerFromPlayerData} from './game/PlayerUtils'

function findPlayer(name) {
    return scene.players.find((aPlayer) => aPlayer.name === name);
}


export function configureSocketEvents(socket) {
    socket.on('did_connect', (gameState) => {
        console.log('connected! other players:', gameState);
        // add game objects for other players
        scene.players = scene.players.concat(gameState.otherPlayers.map(
            (otherPlayer) => createPlayerFromPlayerData(scene, otherPlayer)
        ));
    });
    socket.on('player_did_connect', (newPlayer) => {
        console.log('new player connected!', newPlayer);
        // add game object for new player
        let newPlayerObj = createPlayerFromPlayerData(scene, newPlayer);
        newPlayerObj.anims.play('idle', true);
        scene.players.push(newPlayerObj);
    });
    socket.on('player_did_disconnect', (name) => {
        console.log('disconnected!', name);
        let dcPlayerIndex = scene.players.findIndex(x => x.name === name);
        scene.players.splice(dcPlayerIndex, 1)[0].destroyPlayer();
    });
    socket.on('did_sync_pos', (playerData) => {
        let match = findPlayer(playerData.name);
        if (match) {
            match.setPosition(playerData.pos.x, playerData.pos.y);
        }
    });

    socket.on('player_did_jump', (playerData) => {
        // add game object for new player
        let jumpingPlayer = findPlayer(playerData.name);
        if (jumpingPlayer) {
            jumpingPlayer.setPosition(playerData.pos.x, playerData.pos.y);
            jumpingPlayer.jump();
        }
    });
    socket.on('player_did_crouch', (playerData) => {
        let match = findPlayer(playerData.name);
        if (match) {
            match.setPosition(playerData.pos.x, playerData.pos.y);
            match.crouch();
        }
    });
    socket.on('player_did_stop_crouch', (playerData) => {
        let match = findPlayer(playerData.name);
        if (match) {
            match.setPosition(playerData.pos.x, playerData.pos.y);
            match.stopCrouch();
        }
    });
    socket.on('player_did_moveLeft', (playerData) => {
        let match = findPlayer(playerData.name);
        if (match) {
            match.setPosition(playerData.pos.x, playerData.pos.y);
            match.shouldMove = true;
            match.moveLeft();
        }
    });
    socket.on('player_did_stop_moveLeft', (playerData) => {
        let match = findPlayer(playerData.name);
        if (match) {
            match.setPosition(playerData.pos.x, playerData.pos.y);
            match.shouldMove = false;
            match.stopMove();
        }
    });
    socket.on('player_did_moveRight', (playerData) => {
        let match = findPlayer(playerData.name);
        if (match) {
            match.setPosition(playerData.pos.x, playerData.pos.y);
            match.shouldMove = true;
            match.moveRight();
        }
    });
    socket.on('player_did_dropDown', (playerData) => {
        let match = findPlayer(playerData.name);
        if (match) {
            match.tryDropDown();
        }
    });
    socket.on('player_did_stop_moveRight', (playerData) => {
        let match = findPlayer(playerData.name);
        if (match) {
            match.setPosition(playerData.pos.x, playerData.pos.y);
            match.shouldMove = false;
            match.stopMove();
        }
    });

    socket.on('player_did_attack', (playerData, attackType) => {
        let match = findPlayer(playerData.name);
        if (match) {
            match.setPosition(playerData.pos.x, playerData.pos.y);
            match.attack(attackType);
        }
    });
    socket.on('player_did_hit', (hitData) => {
        let attacker = findPlayer(hitData.attacker.name);
        let target = findPlayer(hitData.target.name);
        let attackType = hitData.attackType;
        if (attacker && target) {
            attacker.hit(target, attackType);
        }
    });


    socket.on('player_did_cast', (playerData, spellType, targetData) => {
        let match = findPlayer(playerData.name);
        if (match) {
            match.castSpell(spellType, targetData);
        }
    });
};
