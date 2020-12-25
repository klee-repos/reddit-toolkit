import _ from "lodash";

var organizeSubs = async (db, growthDuration) => {
  try {
    let subreddits = [];
    let results = [];
    let snapshot = await db.collection("subreddits").get();
    await snapshot.docs.map((doc) => {
      subreddits.push(doc.data());
    });
    for (let s in subreddits) {
      // sort subscribers by timestamp
      let subscribers = _.sortBy(subreddits[s].subscribers, [
        "timestamp",
      ]).reverse();
      let subByDay = [];
      // get single subscriber count by day
      for (let i in subscribers) {
        let date = subscribers[i].date.split("T")[0];
        let dateExists = _.findIndex(subByDay, (o) => {
          return o.date == date;
        });
        if (dateExists < 0) {
          subByDay.push({
            date,
            count: subscribers[i].count,
          });
        }
      }
      // calculate sub growth rate
      let growth;
      if (subByDay[growthDuration]) {
        growth =
          ((subByDay[0].count - subByDay[growthDuration].count) /
            subByDay[growthDuration].count) *
          100;
      } else {
        console.log(subByDay);
        growth = 0;
      }
      results.push({
        display_name_prefixed: subreddits[s].display_name_prefixed,
        public_description: subreddits[s].public_description,
        currentSub: subByDay[0].count,
        growth,
        subByDay,
      });
    }
    return _.sortBy(results, ["growth"]).reverse();
  } catch (e) {
    console.log(e);
    return null;
  }
};

class Subreddits {
  constructor(db, minSubs, maxSubs, growthDuration) {
    this.db = db;
    this.minSubs = minSubs;
    this.maxSubs = maxSubs;
    this.growthDuration = growthDuration;
  }

  async search() {
    try {
      let subreddits = await organizeSubs(this.db, this.growthDuration);
      let queryResults = [];
      for (let s in subreddits) {
        if (
          subreddits[s].currentSub >= this.minSubs &&
          subreddits[s].currentSub <= this.maxSubs &&
          subreddits[s].subByDay[0].date ===
            new Date().toISOString().split("T")[0]
        ) {
          queryResults.push(subreddits[s]);
        }
      }
      return queryResults;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}

export default Subreddits;
