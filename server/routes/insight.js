import express from "express";
const router = express.Router();

import Subreddits from "../api/Subreddits";
import Twilio from "../api/Twilio";

router.post("/test", async (req, res) => {
  try {
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

router.post("/search", async (req, res) => {
  try {
    // track request start time;
    let hrstart = process.hrtime();
    let db = req.app.get("db");
    let subreddits = new Subreddits(
      db,
      parseInt(req.query.minSubs),
      parseInt(req.query.maxSubs),
      parseInt(req.query.growthDuration)
    );
    let results = await subreddits.search();
    console.log(results);
    // send sms
    if (req.query.sendSMS === "true") {
      let twilio = new Twilio(req.query.sendTo, parseInt(req.query.limit));
      let message = await twilio.topGrowingSubreddits(results);
      let smsResults = await twilio.sendSMS(message);
      console.log(smsResults);
    }
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
