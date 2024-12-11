const WebSocket = require('ws');

// Create WebSocket server
const wss = new WebSocket.Server({ port: 40510 });

// Store connected clients
let clients = [];

wss.on('connection', (ws) => {
  clients.push(ws);
  console.log('Client connected');

  ws.on('message', (message) => {
    console.log('received: %s', message);
  });

  ws.on('close', () => {
    clients = clients.filter((client) => client !== ws);
    console.log('Client disconnected');
  });

  // For testing purposes, send current time every second
 // setInterval(() => {
 //   if (ws.readyState === WebSocket.OPEN) {
  //    ws.send(`${new Date()}`);
  //  }
 // }, 10000);
});

// Broadcast function
const broadcast = (data) => {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// Export the broadcast function
module.exports = broadcast;
