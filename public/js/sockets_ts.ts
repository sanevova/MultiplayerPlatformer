import {game, createPlayerFromPlayerData} from '../main'
// import 'socket.io'

function findPlayer(name) {
    // @ts-ignore
    return game.players.find(
        (aPlayer) => aPlayer.name === name
    );
}


export function configureSocketEvents(socket) {
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
        let newPlayerObj = createPlayerFromPlayerData(newPlayer);
        newPlayerObj.anims.play('idle', true);
        game.players.push(newPlayerObj);
    });
    socket.on('player_did_disconnect', (name) => {
        console.log('disconnected!', name);
        // @ts-ignore
        let dcPlayerIndex = game.players.findIndex(x => x.name === name);
        game.players.splice(dcPlayerIndex, 1)[0].destroyPlayer();
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
            jumpingPlayer.jump();
            jumpingPlayer.setPosition(playerData.pos.x, playerData.pos.y);
        }
    });
    socket.on('player_did_crouch', (playerData) => {
        let match = findPlayer(playerData.name);
        if (match) {
            match.crouch();
            match.setPosition(playerData.pos.x, playerData.pos.y);
        }
    });
    socket.on('player_did_stop_crouch', (playerData) => {
        let match = findPlayer(playerData.name);
        if (match) {
            match.stopCrouch();
            match.setPosition(playerData.pos.x, playerData.pos.y);
        }
    });
    socket.on('player_did_moveLeft', (playerData) => {
        let match = findPlayer(playerData.name);
        if (match) {
            match.moveLeft();
            match.setPosition(playerData.pos.x, playerData.pos.y);
        }
    });
    socket.on('player_did_stop_moveLeft', (playerData) => {
        let match = findPlayer(playerData.name);
        if (match) {
            match.stopMove();
            match.setPosition(playerData.pos.x, playerData.pos.y);
        }
    });
    socket.on('player_did_moveRight', (playerData) => {
        let match = findPlayer(playerData.name);
        if (match) {
            match.moveRight();
            match.setPosition(playerData.pos.x, playerData.pos.y);
        }
    });
    socket.on('player_did_stop_moveRight', (playerData) => {
        let match = findPlayer(playerData.name);
        if (match) {
            match.stopMove();
            match.setPosition(playerData.pos.x, playerData.pos.y);
        }
    });

    socket.on('player_did_attack', (playerData, attackType) => {
        let match = findPlayer(playerData.name);
        if (match) {
            match.attack(attackType);
            match.setPosition(playerData.pos.x, playerData.pos.y);
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


    socket.on('player_did_cast', (playerData, spellType) => {
        let match = findPlayer(playerData.name);
        if (match) {
            match.castSpell(spellType);
        }
    });
};
