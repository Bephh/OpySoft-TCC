// functions/index.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const isAuthenticated = require("./authMiddleware"); 

admin.initializeApp();

const routes = require("./routes");

const app = express();

const corsOptions = {
    origin: [
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
    ],
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

app.use("/api", isAuthenticated); 

app.use("/api", routes);


exports.api = functions.https.onRequest(app);