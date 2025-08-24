import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import friendRoutes from './routes/friendRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import { initSocket } from './socket/index.js';

const app = express();

app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

const clientOrigin = process.env.CLIENT_ORIGIN?.split(',') || ['*'];
app.use(cors({ origin: clientOrigin, credentials: true }));

app.get('/', (_, res) => res.send('ChatterBox API running'));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/messages', messageRoutes);

const server = http.createServer(app);
initSocket(server, clientOrigin);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server.listen(PORT, () => console.log(`🚀 Server listening on ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
