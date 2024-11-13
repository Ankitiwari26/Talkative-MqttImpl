// const express = require("express");
// const connectDB = require("./config/db");
// const dotenv = require("dotenv");
// const userRoutes = require("./routes/userRoutes");
// const chatRoutes = require("./routes/chatRoutes");
// const messageRoutes = require("./routes/messageRoutes");
// const { notFound, errorHandler } = require("./middleware/errorMiddleware");
// const path = require("path");

// dotenv.config();
// connectDB();
// const app = express();

// app.use(express.json()); // to accept json data

// // app.get("/", (req, res) => {
// //   res.send("API Running!");
// // });

// app.use("/api/user", userRoutes);
// app.use("/api/chat", chatRoutes);
// app.use("/api/message", messageRoutes);

// // --------------------------deployment------------------------------

// const __dirname1 = path.resolve();

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname1, "/frontend/build")));

//   app.get("*", (req, res) =>
//     res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
//   );
// } else {
//   app.get("/", (req, res) => {
//     res.send("API is running..");
//   });
// }

// // --------------------------deployment------------------------------

// // Error Handling middlewares
// app.use(notFound);
// app.use(errorHandler);

// const PORT = process.env.PORT;

// const server = app.listen(
//   PORT,
//   console.log(`Server running on PORT ${PORT}...`.yellow.bold)
// );



// const io = require("socket.io")(server, {
//   pingTimeout: 60000,
//   cors: {
//     origin: "http://localhost:3000",
//     // credentials: true,
//   },
// });

// io.on("connection", (socket) => {
//   console.log("Connected to socket.io");
//   socket.on("setup", (userData) => {
//     socket.join(userData._id);
//     socket.emit("connected");
//   });

//   socket.on("join chat", (room) => {
//     socket.join(room);
//     console.log("User Joined Room: " + room);
//   });
//   socket.on("typing", (room) => socket.in(room).emit("typing"));
//   socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

//   socket.on("new message", (newMessageRecieved) => {
//     var chat = newMessageRecieved.chat;

//     if (!chat.users) return console.log("chat.users not defined");

//     chat.users.forEach((user) => {
//       if (user._id == newMessageRecieved.sender._id) return;

//       socket.in(user._id).emit("message recieved", newMessageRecieved);
//     });
//   });

//   socket.off("setup", () => {
//     console.log("USER DISCONNECTED");
//     socket.leave(userData._id);
//   });
// });

const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const path = require("path");
const mqtt = require("mqtt");

dotenv.config();
connectDB();
const app = express();

app.use(express.json()); // to accept json data

// API Routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// --------------------------deployment------------------------------

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

// --------------------------deployment------------------------------

// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start the Express server
const server = app.listen(
  PORT,
  console.log(`Server running on PORT ${PORT}...`.yellow.bold)
);

// MQTT Client Setup
const mqttClient = mqtt.connect('mqtts://c3fb6cea12c74138a6233a6b0343101d.s1.eu.hivemq.cloud:8883', {
  username: 'AnkitHive',  //username
  password: 'Ankit@9981',  // password
  clientId: 'chat-app-server',  // Unique id for server
});

mqttClient.on('connect', () => {
  console.log('Connected to HiveMQ Cloud MQTT broker');

  // Subscribe to a topic like 'chat-room'
  mqttClient.subscribe('chat-room/#', (err) => {
    if (err) {
      console.log('Error subscribing to chat-room topic:', err);
    } else {
      console.log('Subscribed to chat-room topic');
    }
  });
});

// Handle incoming MQTT messages
mqttClient.on('message', (topic, message) => {
  console.log(`Message received on topic ${topic}: ${message.toString()}`);


  if (topic.startsWith('chat-room/')) {
    // Handle chat message logic
    const newMessage = JSON.parse(message.toString());
    const chat = newMessage.chat;
    if (!chat.users) return console.log("chat.users not defined");

    // Iterate through the users in the chat
    chat.users.forEach((user) => {
      if (user._id === newMessage.sender._id) return;
    });
  }
});

// MQTT connection error handling
mqttClient.on('error', (err) => {
  console.log('MQTT connection error:', err);
});
