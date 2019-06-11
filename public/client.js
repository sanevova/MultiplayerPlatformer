function connect_as(player) {
  if (window.location.hostname === 'localhost') {
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
