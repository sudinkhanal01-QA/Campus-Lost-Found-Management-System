// backend/server.js

require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const userRoutes = require('./routes/userRoutes');
const commentRoutes = require('./routes/CommentRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // 👈 CHANGED THIS TO 5173
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

const users = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('login', (userId) => {
    console.log(`User ${userId} logged in with socket id ${socket.id}`);
    users[userId] = socket.id;
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (const userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        break;
      }
    }
  });
});

connectDB();

app.use(cors({
    origin: 'http://localhost:5173', // 👈 CHANGED THIS TO 5173
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes(io, users));
app.use('/api/admin/users', userRoutes);
app.use('/api/items/:itemId/comments', commentRoutes);

app.get('/', (req, res) => {
    res.send('Lost & Found Portal Backend API is running!');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
