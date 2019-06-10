function main() {


  if (window.location.hostname === 'localhost') {
  //     rhost = 'localhost';
  //     rport = 3001;
  // } else {
      rhost = 'ec2-35-177-47-61.eu-west-2.compute.amazonaws.com';
      rport = 8303;
  }

  var socket = io(`https://${rhost}:${rport}`);

  socket.on('new YUNG', (data) => {
    console.log('server recevd yung connected', data.name);
  });

  socket.emit('YUNG connect', 'actual_yubg');
};


main();
