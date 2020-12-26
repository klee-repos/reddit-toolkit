import TwilioClient from "twilio";

const REDDIT_URL = `https://www.reddit.com`;

class Twilio {
  constructor(sendTo, limit) {
    this.twilio = new TwilioClient(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.sendFrom = process.env.TWILIO_NUMBER;
    this.sendTo = sendTo;
    this.limit = limit;
  }

  async sendSMS(body) {
    try {
      let results = await this.twilio.messages.create({
        body,
        from: this.sendFrom,
        to: this.sendTo,
      });
      return results;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async topGrowingSubreddits(subreddits) {
    try {
      let sms = "";
      for (let i = 0; i < this.limit; i++) {
        sms += `📈 ${subreddits[i].display_name_prefixed} ${subreddits[
          i
        ].growth.toFixed(2)}%\n${
          subreddits[i].public_description
        }\n${REDDIT_URL}/${subreddits[i].display_name_prefixed}\n\n`;
      }
      return sms;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}

export default Twilio;
