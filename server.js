const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

io.on('connection', (socket) => {
  socket.on('join', (name) => {
    socket.username = name;
    io.emit('msg', { user: 'System', text: name + ' เข้าร่วมแล้ว' });
  });
  socket.on('msg', (data) => {
    io.emit('msg', data);
  });
  socket.on('disconnect', () => {
    if (socket.username) {
      io.emit('msg', { user: 'System', text: socket.username + ' ออกไปแล้ว' });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log('Server running on port ' + PORT);
});
