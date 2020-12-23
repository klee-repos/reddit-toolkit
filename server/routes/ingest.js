import express from "express";
const router = express.Router();

import Reddit from "../api/Reddit";

router.post("/reddit-popular", async (req, res) => {
  try {
    let db = req.app.get("db");
    let reddit = new Reddit(
      db,
      req.body.limit,
      req.body.maxResults,
      req.body.throttle,
      req.body.turns
    );
    let subreddits = await reddit.getFromPopular();
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

export default router;
