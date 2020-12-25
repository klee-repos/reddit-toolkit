require("dotenv").config();
import path from "path";
import express from "express";
var app = express();
var server = require("http").createServer(app);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

import bodyParser from "body-parser";
app.use(bodyParser.json({ limit: "100mb" })); // support json encoded bodies
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true })); // support encoded bodies

// =========== ADD HEADERS ===========
app.use(function (req, res, next) {
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  }
  res.setHeader("Cache-Control", "max-age=0,no-cache,no-store,must-revalidate");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

// authentication
const auth = require('./auth');
app.use(auth);

// =========== Routes ===========
import ingest from './routes/ingest';
import insight from './routes/insight';
app.use('/ingest', ingest);
app.use('/insight', insight);

// =========== Firestore ===========
import Firestore from './api/Firestore';
let firestore = new Firestore(process.env.GOOGLE_PROJECT_ID);
let initFirebase = async() => {
  let db = await firestore.initializeFirestore();
  app.set('db', db);
}
initFirebase();

// =========== INDEX.HTML ===========
app.get("/", function (request, response) {
  if (process.env.NODE_ENV === "production") {
    response.sendFile(path.resolve("client", "build", "index.html"));
  } else {
    response.sendFile(path.resolve("client", "public", "index.html"));
  }
});

// =========== SERVER ===========
server.listen(process.env.PORT || 8080, function () {
  console.info("Node server started");
});
server.setTimeout(300000);
