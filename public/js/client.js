function connectAs(player) {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      rhost = 'localhost';
      rport = 5000;
  } else {
      rhost = 'yungskrylla.herokuapp.com';
      rport = 80;
  }

  var socket = io(`http://${rhost}:${rport}`,  {secure: true});

  socket.emit('on_player_connect', player);
  return socket;
};
