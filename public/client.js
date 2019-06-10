function connect_as(player) {
  if (window.location.hostname === 'localhost') {
      rhost = 'localhost';
      rport = 3001;
  } else {
      rhost = 'ec2-35-178-211-253.eu-west-2.compute.amazonaws.com';
      rport = 8303;
  }

  var socket = io(`http://${rhost}:${rport}`,  {secure: true});

  socket.emit('on_player_connect', player);
  return socket;
};
