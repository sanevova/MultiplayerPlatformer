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

var numUsers = 0;
console.log("ROFL");
io.on('connection', (socket) => {
  var addedUser = false;

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
