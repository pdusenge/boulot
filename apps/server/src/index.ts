import 'dotenv/config';
import { createServer } from 'http';
import { connectDB } from './config/db';
import { initSocket } from './services/socket.service';
import { createExpressApp } from './app';

const app = createExpressApp();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

// Initialize Socket.IO
initSocket(httpServer);

// Bootstrap
const start = async () => {
  try {
    await connectDB();
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
