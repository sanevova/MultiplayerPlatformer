"use strict";
exports.__esModule = true;
var socketio = require("socket.io");
function isLocalhost() {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}
exports.isLocalhost = isLocalhost;
function connectAs(player) {
    var rhost, rport;
    if (isLocalhost()) {
        rhost = 'localhost';
        rport = 5000;
    }
    else {
        rhost = 'yungskrylla.herokuapp.com';
        rport = 80;
    }
    var socket = socketio.io("http://" + rhost + ":" + rport, { secure: true });
    socket.emit('on_player_connect', player);
    return socket;
}
exports.connectAs = connectAs;
;
