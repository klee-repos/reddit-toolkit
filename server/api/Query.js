import _ from "lodash";

class Query {
  constructor(db) {
    this.db = db;
  }

  async listSubreddits() {
    try {
      let subreddits = [];
      let results = {
        total: 0,
        subreddits: [],
      };
      let snapshot = await this.db.collection("subreddits").get();
      await snapshot.docs.map((doc) => {
        subreddits.push(doc.data());
      });
      results.total = subreddits.length;
      for (let s in subreddits) {
        let subscribers = _.sortBy(subreddits[s].subscribers, [
          "date",
        ]).reverse();
        results.subreddits.push({
          name: subreddits[s].name,
          display_name_prefixed: subreddits[s].display_name_prefixed,
          subscribers: subscribers[0].count,
          date: subscribers[0].date,
        });
      }
      return results;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}

export default Query;
