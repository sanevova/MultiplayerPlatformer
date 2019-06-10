function main() {


  if (window.location.hostname === 'localhost') {
      rhost = 'localhost';
      rport = 3001;
  } else {
      rhost = 'aws_ec2.pem ubuntu@ec2-35-177-47-61.eu-west-2.compute.amazonaws.com';
      rport = 8303;
  }

  var socket = io(`http://${rhost}:${rport}`);

  socket.on('new YUNG', (data) => {
    console.log('server recevd yung connected', data.name);
  });

  socket.emit('YUNG connect', 'actual_yubg');
};


main();
