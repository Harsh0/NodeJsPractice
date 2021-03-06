const net = require('net');
const server = net.createServer();
const inputPort = 8080;
const outputPort = 443;

server.on('error', (err) => {
  console.log('SERVER ERROR');
  console.log(err);
});

server.on('close', () => {
  console.log('Client Disconnected');
});

server.on('connection', (clientToProxySocket) => {
    console.log('Client Connected To Proxy');
    // We need only the data once, the starting packet
    clientToProxySocket.once('data', (data) => {
      let isTLSConnection = data.toString().indexOf('CONNECT') !== -1;
    
      //Considering Port as 4000 by default 
      let serverPort = inputPort;
      let serverAddress;
      if (isTLSConnection) {
        // Port changed to 443, parsing the host from CONNECT 
        serverPort = outputPort;
        serverAddress = data.toString()
                            .split('CONNECT ')[1]
                            .split(' ')[0].split(':')[0];
      } else {
         // Parsing HOST from HTTP
         serverAddress = 'localhost';
      }
      let proxyToServerSocket = net.createConnection({
        host: serverAddress,
        port: serverPort
      }, () => {
        console.log('PROXY TO SERVER SET UP');
        
        if (isTLSConnection) {
          //Send Back OK to HTTPS CONNECT Request
          clientToProxySocket.write('HTTP/1.1 200 OK\r\n\n');
        } else {
          proxyToServerSocket.write(data);
        }
        // Piping the sockets
        clientToProxySocket.pipe(proxyToServerSocket);
        proxyToServerSocket.pipe(clientToProxySocket);
        
        proxyToServerSocket.on('error', (err) => {
          console.log('PROXY TO SERVER ERROR');
          console.log(err);
        });
      });
      clientToProxySocket.on('error', err => {
        console.log('CLIENT TO PROXY ERROR');
        console.log(err);
      });
    });
  });

  server.listen(outputPort, () => {
    console.log('Server runnig at http://localhost:' + outputPort);
  });
  
