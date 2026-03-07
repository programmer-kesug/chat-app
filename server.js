const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

const users = {}; // { socketId: { name, room } }

io.on('connection', (socket) => {

  socket.on('join', (data) => {
    const name = data.name;
    const room = data.room || 'default';
    const taken = Object.values(users).some(u => u.name === name && u.room === room);
    if (taken) { socket.emit('nameTaken'); return; }
    socket.username = name;
    socket.room = room;
    users[socket.id] = { name, room };
    socket.join(room);
    socket.emit('joined', { room, sid: socket.id });
    io.to(room).emit('msg', { user: 'System', text: name + ' เข้าร่วมแล้ว' });
    updateRoom(room);
  });

  // ข้อความห้องกลุ่ม
  socket.on('msg', (data) => {
    const room = socket.room;
    if (!room) return;
    io.to(room).emit('msg', { ...data, sid: socket.id });
  });

  // DM
  socket.on('dm', (data) => {
    const toId = data.toId;
    const payload = { ...data, fromId: socket.id, fromName: socket.username };
    socket.emit('dm', payload);         // ส่งให้ตัวเอง
    if (io.sockets.sockets.get(toId)) {
      io.to(toId).emit('dm', payload);  // ส่งให้อีกฝ่าย
    }
  });

  // WebRTC signaling
  socket.on('webrtc', (data) => {
    const payload = { ...data, from: socket.id, fromName: socket.username };
    if (io.sockets.sockets.get(data.to)) {
      io.to(data.to).emit('webrtc', payload);
    }
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      const room = socket.room;
      delete users[socket.id];
      io.to(room).emit('msg', { user: 'System', text: socket.username + ' ออกไปแล้ว' });
      updateRoom(room);
    }
  });
});

function updateRoom(room) {
  const list = Object.entries(users)
    .filter(([id, u]) => u.room === room)
    .map(([id, u]) => ({ id, name: u.name }));
  io.to(room).emit('users', list);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => console.log('Server running on port ' + PORT));