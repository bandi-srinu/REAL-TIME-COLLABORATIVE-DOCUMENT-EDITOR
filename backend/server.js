import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
import { Server as SocketIOServer } from 'socket.io';
import Document from './models/Document.js';

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));

app.post('/documents', async (req, res) => {
  try {
    const { id, title } = req.body || {};
    const docId = id || cryptoRandomId();
    const existing = await Document.findById(docId);
    if (!existing) {
      await Document.create({ _id: docId, title: title || 'Untitled Document', data: {} });
    }
    res.json({ id: docId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

function cryptoRandomId() {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const io = new SocketIOServer(server, {
  cors: { origin: CLIENT_ORIGIN, methods: ['GET', 'POST'] }
});

const SAVE_INTERVAL_MS = 2000;

io.on('connection', socket => {
  socket.on('get-document', async docId => {
    if (!docId) return;

    let document = await Document.findById(docId);
    if (!document) document = await Document.create({ _id: docId, data: {} });

    socket.join(docId);
    socket.emit('load-document', document.data);

    socket.on('send-changes', delta => {
      socket.broadcast.to(docId).emit('receive-changes', delta);
    });

    socket.on('save-document', async data => {
      try {
        await Document.findByIdAndUpdate(docId, { data, updatedAt: Date.now() });
      } catch (err) {
        console.error('Save error:', err);
      }
    });
  });
});

server.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
