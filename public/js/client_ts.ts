import * as io from 'socket.io-client';

export function isLocalhost(): boolean {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}

export function connectAs(player) {
    var rhost, rport;
    if (isLocalhost()) {
        rhost = 'localhost';
        rport = 5000;
    } else {
        rhost = 'yungskrylla.herokuapp.com';
        rport = 80;
    }

  // var socket = socketio.io(`http://${rhost}:${rport}`,  {secure: true});
  var socket = io.connect(`http://${rhost}:${rport}`,  {secure: true});

  socket.emit('on_player_connect', player);
  return socket;
};
