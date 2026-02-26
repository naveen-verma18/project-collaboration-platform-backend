import dotenv from "dotenv";
dotenv.config();
import { initSocket } from "./socket/socket.js"

import http from "http";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import app from "./app.js";
import prisma from "./prisma/client.js";



const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // later restrict this for frontend
    pingInterval: 10000,   // 10 seconds
    pingTimeout: 5000      // 5 seconds
  },
});
// Socket initialization handled in socket/socket.js
initSocket(io);

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
