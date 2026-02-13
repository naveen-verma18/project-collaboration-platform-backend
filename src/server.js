import dotenv from "dotenv";
dotenv.config();
import {initSocket} from "./socket/socket.js"

import http from "http";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import app from "./app.js";
import  prisma  from "./prisma/client.js"; 



const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // later restrict this for frontend
    pingInterval: 10000,   // 10 seconds
    pingTimeout: 5000      // 5 seconds
  },
});
initSocket(io);


 // Socket Authentication (JWT)

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("Authentication error"));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Attach authenticated user to socket
    socket.user = {
      id: payload.userId,
      email: payload.email,
    };

    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});


//  In-memory presence tracking

const projectPresence = new Map(); 


//  Socket Connection Handler

io.on("connection", (socket) => {
  console.log(
    `✅ User ${socket.user.id} connected (socket ${socket.id})`
  );



  
  socket.on("join:project", async ({ projectId }) => {
    const userId = socket.user.id;

    // Check membership
    const member = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId,
      },
    });

    if (!member) {
      return; 
    }

   
    socket.join(`project:${projectId}`);

    // Update presence
    if (!projectPresence.has(projectId)) {
      projectPresence.set(projectId, new Set());
    }
    projectPresence.get(projectId).add(userId);

    // Notify others
    socket.to(`project:${projectId}`).emit("user:joined", {
      userId,
    });

    // Send updated presence list
    io.to(`project:${projectId}`).emit("presence:update", {
      users: Array.from(projectPresence.get(projectId)),
    });
  });



 
  // JOIN DOCUMENT ROOM
  
  socket.on("join:document", async ({ documentId }) => {
    const userId = socket.user.id;

    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) return;

    const member = await prisma.projectMember.findFirst({
      where: {
        projectId: document.projectId,
        userId,
      },
    });

    if (!member) return;

    socket.join(`document:${documentId}`);

    socket.to(`document:${documentId}`).emit("user:viewingDocument", {
      userId,
    });
  });

 
  // TYPING INDICATOR

  socket.on("typing:start", ({ documentId }) => {
    socket.to(`document:${documentId}`).emit("user:typing", {
      userId: socket.user.id,
    });
  });

  socket.on("typing:stop", ({ documentId }) => {
    socket.to(`document:${documentId}`).emit("user:stoppedTyping", {
      userId: socket.user.id,
    });
  });





  socket.on("disconnect", () => {
    console.log(
      `❌ User ${socket.user.id} disconnected`
    );
    socket.activeProjects?.clear();
    socket.activeDocuments?.clear();

    // Cleanup presence
    for (const [projectId, users] of projectPresence.entries()) {
      if (users.has(socket.user.id)) {
        users.delete(socket.user.id);

        io.to(`project:${projectId}`).emit("user:left", {
          userId: socket.user.id,
        });

        io.to(`project:${projectId}`).emit("presence:update", {
          users: Array.from(users),
        });

        if (users.size === 0) {
          projectPresence.delete(projectId);
        }
      }
    }
  });
});






const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
