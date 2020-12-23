import express from "express";
const router = express.Router();

import Reddit from "../api/Reddit";

router.post("/test", async (req, res) => {
  try {
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

router.post("/reddit-popular", async (req, res) => {
  try {
    let db = req.app.get("db");
    let reddit = new Reddit(
      db,
      parseInt(req.query.limit),
      parseInt(req.query.maxResults),
      parseInt(req.query.throttle),
      parseInt(req.query.turns)
    );
    let subreddits = await reddit.getFromPopular();
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

export default router;
