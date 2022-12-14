// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var os = require("os");
var hostname = os.hostname();

var port = process.env.PORT || 3001;

var game = {
    players: [],
    sockets: {},
};

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "X-Requested-With");
   res.header("Access-Control-Allow-Headers", "Content-Type");
   res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
   next();
});

function findPlayer(name) {
    return game.players.find(x => x.name === name);
}

console.log("ROFL");
io.on('connection', (socket) => {

    socket.on('disconnect', function() {
        name = game.sockets[socket.id];
        playerIndex = game.players.findIndex(x => x.name === name);
        if (playerIndex >= 0) {
            game.players.splice(playerIndex, 1);
            delete game.sockets[socket.id];
            socket.broadcast.emit('player_did_disconnect', name);
        }
    });
    socket.on('on_player_connect', (player) => {
        // notify new player about other players
        socket.emit('did_connect', {
            otherPlayers: game.players
        });
        game.players.push(player);
        // notify everybody about new player
        socket.broadcast.emit('player_did_connect', player);
        game.sockets[socket.id] = player.name;
    });
    socket.on('kick_all', () => {
        game.players = [];
        game.sockets = {};
    });
    socket.on('on_player_jump', (player) => {
        socket.broadcast.emit('player_did_jump', player);
    });
    socket.on('on_player_crouch', (player) => {
        socket.broadcast.emit('player_did_crouch', player);
    });
    socket.on('on_player_stop_crouch', (player) => {
        socket.broadcast.emit('player_did_stop_crouch', player);
    });
    socket.on('on_player_moveLeft', (player) => {
        socket.broadcast.emit('player_did_moveLeft', player);
    });
    socket.on('on_player_stop_moveLeft', (player) => {
        socket.broadcast.emit('player_did_stop_moveLeft', player);
    });
    socket.on('on_player_moveRight', (player) => {
        socket.broadcast.emit('player_did_moveRight', player);
    });
    socket.on('on_player_stop_moveRight', (player) => {
        socket.broadcast.emit('player_did_stop_moveRight', player);
    });
    socket.on('on_player_dropDown', (player) => {
        socket.broadcast.emit('player_did_dropDown', player);
    });
    socket.on('on_player_smash', (player) => {
        socket.broadcast.emit('player_did_smash', player);
    });
    // socket.on('player_Jump', (player) => {
    //     socket.broadcast.emit('player_did_Jump', player);
    // });
    socket.on('on_player_attack', (player, attackType) => {
        socket.broadcast.emit('player_did_attack', player, attackType);
    });
    socket.on('on_player_hit', (hitData) => {
        socket.emit('player_did_hit', hitData);
        socket.broadcast.emit('player_did_hit', hitData);
    });
    socket.on('on_player_cast', (playerData, spellType, targetData) => {
        socket.broadcast.emit('player_did_cast', playerData, spellType, targetData);
    });

    socket.on('on_sync_pos', (player) => {
        aPlayer = findPlayer(player.name);
        if (aPlayer) {
            aPlayer = player;
            socket.broadcast.emit('did_sync_pos', player);
        }
    });


  // test
  // when the client emits 'new message', this listens and executes
    socket.on('new message', (data) => {
        // we tell the client to execute 'new message'
        socket.broadcast.emit('new message', {
            username: 'some username',
            message: data
        });
    });

  socket.on('YUNG connect', (playerName) => {
      console.log(playerName, 'connected');
      socket.broadcast.emit('new YUNG', {
        name: playerName
      });
  });
});
