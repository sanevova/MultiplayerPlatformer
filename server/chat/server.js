// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var os = require("os");
var hostname = os.hostname();

// aws starts with ip
var port = hostname.startsWith('ip') ? 8303 : 3001;

var game = {
    players: []
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

console.log("ROFL");
io.on('connection', (socket) => {

    socket.on('on_player_connect', (player) => {
        // notify new player about other players
        socket.emit('did_connect', {
            otherPlayers: game.players
        });
        game.players.push(player);
        // notify everybody about new player
        socket.broadcast.emit('player_did_connect', player);
    });
    socket.on('kick_all', () => {
        game.players = [];
    });
    socket.on('on_player_jump', (player) => {
        socket.broadcast.emit('player_did_jump', player);
    });
    socket.on('on_player_crouch', (player) => {
        socket.broadcast.emit('player_did_crouch', player);
    });
    socket.on('on_player_stop_crouch', (player) => {
        socket.broadcast.emit('player_did_stop_crouch');
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
    // socket.on('player_Jump', (player) => {
    //     socket.broadcast.emit('player_did_Jump', player);
    // });
    socket.on('on_player_slash', (player) => {
        socket.broadcast.emit('player_did_slash', player);
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
