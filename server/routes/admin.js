import express from "express";
const router = express.Router();

import Query from "../api/Query";

router.post("/list-subreddits", async (req, res) => {
  try {
    // track request start time;
    let hrstart = process.hrtime();
    let db = req.app.get("db");
    let query = new Query(db);
    let results = await query.listSubreddits();
     // strack request end time
     let hrend = process.hrtime(hrstart);
     // log request duration
     console.info("Execution time: %ds", hrend[0]);
    res.send(results);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

export default router;
