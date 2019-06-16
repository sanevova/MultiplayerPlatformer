"use strict";
exports.__esModule = true;
var main_1 = require("../main");
function findPlayer(name) {
    // @ts-ignore
    return main_1.game.players.find(function (aPlayer) { return aPlayer.name === name; });
}
function configureSocketEvents(socket) {
    socket.on('did_connect', function (gameState) {
        console.log('connected! other players:', gameState);
        // add game objects for other players
        main_1.game.players = main_1.game.players.concat(gameState.otherPlayers.map(function (otherPlayer) { return main_1.createPlayerFromPlayerData(otherPlayer); }));
    });
    socket.on('player_did_connect', function (newPlayer) {
        console.log('new player connected!', newPlayer);
        // add game object for new player
        var newPlayerObj = main_1.createPlayerFromPlayerData(newPlayer);
        newPlayerObj.anims.play('idle', true);
        main_1.game.players.push(newPlayerObj);
    });
    socket.on('player_did_disconnect', function (name) {
        console.log('disconnected!', name);
        // @ts-ignore
        var dcPlayerIndex = main_1.game.players.findIndex(function (x) { return x.name === name; });
        main_1.game.players.splice(dcPlayerIndex, 1)[0].destroyPlayer();
    });
    socket.on('did_sync_pos', function (playerData) {
        var match = findPlayer(playerData.name);
        if (match) {
            match.setPosition(playerData.pos.x, playerData.pos.y);
        }
    });
    socket.on('player_did_jump', function (playerData) {
        // add game object for new player
        var jumpingPlayer = findPlayer(playerData.name);
        if (jumpingPlayer) {
            jumpingPlayer.jump();
            jumpingPlayer.setPosition(playerData.pos.x, playerData.pos.y);
        }
    });
    socket.on('player_did_crouch', function (playerData) {
        var match = findPlayer(playerData.name);
        if (match) {
            match.crouch();
            match.setPosition(playerData.pos.x, playerData.pos.y);
        }
    });
    socket.on('player_did_stop_crouch', function (playerData) {
        var match = findPlayer(playerData.name);
        if (match) {
            match.stopCrouch();
            match.setPosition(playerData.pos.x, playerData.pos.y);
        }
    });
    socket.on('player_did_moveLeft', function (playerData) {
        var match = findPlayer(playerData.name);
        if (match) {
            match.moveLeft();
            match.setPosition(playerData.pos.x, playerData.pos.y);
        }
    });
    socket.on('player_did_stop_moveLeft', function (playerData) {
        var match = findPlayer(playerData.name);
        if (match) {
            match.stopMove();
            match.setPosition(playerData.pos.x, playerData.pos.y);
        }
    });
    socket.on('player_did_moveRight', function (playerData) {
        var match = findPlayer(playerData.name);
        if (match) {
            match.moveRight();
            match.setPosition(playerData.pos.x, playerData.pos.y);
        }
    });
    socket.on('player_did_stop_moveRight', function (playerData) {
        var match = findPlayer(playerData.name);
        if (match) {
            match.stopMove();
            match.setPosition(playerData.pos.x, playerData.pos.y);
        }
    });
    socket.on('player_did_attack', function (playerData, attackType) {
        var match = findPlayer(playerData.name);
        if (match) {
            match.attack(attackType);
            match.setPosition(playerData.pos.x, playerData.pos.y);
        }
    });
    socket.on('player_did_hit', function (hitData) {
        var attacker = findPlayer(hitData.attacker.name);
        var target = findPlayer(hitData.target.name);
        var attackType = hitData.attackType;
        if (attacker && target) {
            attacker.hit(target, attackType);
        }
    });
    socket.on('player_did_cast', function (playerData, spellType) {
        var match = findPlayer(playerData.name);
        if (match) {
            match.castSpell(spellType);
        }
    });
}
exports.configureSocketEvents = configureSocketEvents;
;
