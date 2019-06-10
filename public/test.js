var config = {
    type: Phaser.WEBGL,
    width: 800,
    height: 600,
    backgroundColor: '#000',
    parent: 'phaser-example',
    scene: {
        preload: preload,
        create: create
    }
};

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('spark', 'assets/blocks/red.png');
}

function create ()
{
    //  First create a particle manager
    //  A single manager can be responsible for multiple emitters
    //  The manager also controls which particle texture is used by _all_ emitter
    var particles = this.add.particles('spark');

    var emitter = particles.createEmitter();

    emitter.setPosition(400, 300);
    emitter.setSpeed(200);
    emitter.setBlendMode(Phaser.BlendModes.ADD).setScale(0.2);
    setupSocket();
}

function setupSocket() {
    socket = new WebSocket('ws://localhost:8765');
    console.log(socket);
    socket.onopen = function() {
                  // Web Socket is connected, send data using send()
                  console.log(socket);
                  socket.send("close");
                  // socket.send("Message to send1");
                  socket.send("Message to send2");
                  console.log("Message is sent...");
                  console.log(socket);
                  return true;
               };
    socket.onmessage = function(e){
        console.log(socket);
       var server_message = e.data;
       console.log('onmessage', server_message);
       return false;
    }

    socket.onclose = function(event) {
      if (event.wasClean) {
        alert(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
      } else {
        // e.g. server process killed or network down
        // event.code is usually 1006 in this case
        alert('[close] Connection died');
      }
    };
    socket.onerror = function(error) {
      alert(`[error] ${error.message}`);
    };
}
