function configureSocketEvents(socket) {
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
        newPlayerObj = createPlayerFromPlayerData(newPlayer);
        newPlayerObj.anims.play('idle', true);
        game.players.push(newPlayerObj);
    });
    socket.on('player_did_disconnect', (name) => {
        console.log('disconnected!', name);
        dcPlayerIndex = game.players.findIndex(x => x.name === name);
        game.players.splice(dcPlayerIndex, 1)[0].destroyPlayer();
    });
    socket.on('did_sync_pos', (playerData) => {
        aPlayer = findPlayer(playerData.name);
        aPlayer.setPosition(playerData.pos.x, playerData.pos.y);
    });

    socket.on('player_did_jump', (jumpingPlayerData) => {
        // add game object for new player
        jumpingPlayer = findPlayer(jumpingPlayerData.name);
        if (jumpingPlayer) {
            jumpingPlayer.jump();
        }
    });
    socket.on('player_did_crouch', (aPlayer) => {
        match = findPlayer(aPlayer.name);
        if (match) {
            match.crouch();
        }
    });
    socket.on('player_did_stop_crouch', (aPlayer) => {
        match = findPlayer(aPlayer.name);
        if (match) {
            match.stopCrouch();
        }
    });
    socket.on('player_did_moveLeft', (aPlayer) => {
        match = findPlayer(aPlayer.name);
        if (match) {
            match.moveLeft();
        }
    });
    socket.on('player_did_stop_moveLeft', (aPlayer) => {
        match = findPlayer(aPlayer.name);
        if (match) {
            match.stopMove();
        }
    });
    socket.on('player_did_moveRight', (aPlayer) => {
        match = findPlayer(aPlayer.name);
        if (match) {
            match.moveRight();
        }
    });
    socket.on('player_did_stop_moveRight', (aPlayer) => {
        match = findPlayer(aPlayer.name);
        if (match) {
            match.stopMove();
        }
    });

    socket.on('player_did_slash', (aPlayer) => {
        match = findPlayer(aPlayer.name);
        if (match) {
            match.slash();
        }
    });
};
