import axios from "axios";
import admin from "firebase-admin";

const REDDIT_URL = `https://www.reddit.com`;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class Reddit {
  constructor(db, limit, maxResults, throttle, turns) {
    this.db = db;
    this.limit = limit ? limit : 25;
    this.maxResults = maxResults ? maxResults : 100;
    this.throttle = throttle ? throttle : 1000;
    this.turns = turns ? turns : 40;
  }

  async getFromPopular() {
    try {
      let subreddits = [];
      let after;
      let count = 0;
      let turn = 1;
      let finish = false;
      let date = new Date();
      while (finish == false) {
        // get popular subreddits from reddit
        let url = `${REDDIT_URL}/subreddits.json?limit=${this.limit}&count=${count}&after=${after}`;
        let results = await axios({
          method: "get",
          url,
        });
        // logging
        console.log(url);
        // console.log(results.data);
        // set correct limit in request
        count += this.limit;
        // set correct after in request
        after = results.data.data.after;
        // aggregate results into subreddits array
        let subs = results.data.data.children;
        for (let s in subs) {
          let sub = {
            id: subs[s].data.id,
            public_description: subs[s].data.public_description,
            created_utc: subs[s].data.created_utc,
            name: subs[s].data.name,
            display_name: subs[s].data.display_name,
            title: subs[s].data.title,
            display_name_prefixed: subs[s].data.display_name_prefixed,
            subscribers: admin.firestore.FieldValue.arrayUnion({
              date: date.toISOString(),
              timestamp: Date.now(),
              count: subs[s].data.subscribers,
            }),
            advertiser_category: subs[s].data.advertiser_category,
            primary_color: subs[s].data.primary_color,
          };
          // save subreddit to database
          let fbRef = this.db.collection("subreddits").doc(sub.name);
          let commitResults = fbRef.set(sub, { merge: true });
          subreddits.push(sub);
        }
        // throttle requests to reddit
        if (turn % this.turns === 0) {
          console.log(`initializing delay of ${this.throttle} ms`);
          console.log(`total requests: ${turn}`);
          await delay(this.throttle);
        }
        if (after == null || subreddits.length > this.maxResults) {
          finish = true;
          console.log("done aggregating subreddit data");
        }
        turn++;
      }
      return subreddits;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async updateExisting() {
    try {
      let subreddits = [];
      let turn = 1;
      let date = new Date();
      let subreddit_subscribers;
      let position = 0;
      let snapshot = await this.db.collection("subreddits").get();
      await snapshot.docs.map((doc) => {
        subreddits.push(doc.data());
      });
      for (let s in subreddits) {
        while (!subreddit_subscribers) {
          // get subreddits
          let display_name_prefixed = subreddits[s].display_name_prefixed;
          let url = `${REDDIT_URL}/${display_name_prefixed}.json?limit=${this.limit}`;
          let results = await axios({
            method: "get",
            url,
          });
          subreddit_subscribers =
            results.data.data.children[position].data.subreddit_subscribers;
          if (!subreddit_subscribers) {
            position++;
          } else {
            position = 0;
          }
          // throttle requests to reddit
          if (turn % this.turns === 0) {
            console.log(`initializing delay of ${this.throttle} ms`);
            console.log(`total requests: ${turn}`);
            await delay(this.throttle);
          }
          turn++;
        }
        // save subreddit to database
        let data = {
          date: date.toLocaleDateString(),
          timestamp: date.toISOString(),
          count: subreddit_subscribers,
        };
        let fbRef = this.db.collection("subreddits").doc(subreddits[s].name);
        let commitResults = fbRef.set(
          {
            subscribers: admin.firestore.FieldValue.arrayUnion(data),
          },
          { merge: true }
        );
        subreddit_subscribers = null;
      }
      return subreddits;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}

export default Reddit;
