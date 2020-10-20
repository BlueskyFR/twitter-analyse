import { CalendarComponent } from "node-ical";
import Twit from "twit";
import dbg from "debug";
import { Config } from "./types";
import { DateTime, Duration } from "luxon";

const debug = dbg("twitter-analyse:TweetScheduler");

// For test only
/* DateTime.local = function () {
  return DateTime.fromObject({ day: 5, month: 10, year: 2020, hour: 14, minute: 32 });
}; */

export default class TweetScheduler {
  private config: Config;
  private twitter: Twit;

  constructor(config: Config) {
    this.config = config;

    this.twitter = new Twit({
      consumer_key: config.twitterAPI.key,
      consumer_secret: config.twitterAPI.secretKey,
      access_token: config.twitterAPI.accessToken,
      access_token_secret: config.twitterAPI.secretAccessToken,
      strictSSL: true,
    });
  }

  async tweetAfter(course: CalendarComponent) {
    // Compute the delay after which the Tweet will be posted, which corresponds to
    // the delay from now until the end of the current course + the delay specified in the config file
    const delay =
      DateTime.fromJSDate(course.end as Date).diffNow("milliseconds").milliseconds +
      Duration.fromObject({ minutes: this.config.tweetDelay }).as("milliseconds");

    const totalHours: number = this.config.analyse.totalHours;
    const hoursLeft: number = this.config.analyse.hoursLeft;
    const percentsAchieved: number = parseInt((((totalHours - hoursLeft) / totalHours) * 100).toFixed(0));

    setTimeout(async () => {
      try {
        const specialEvent: boolean = percentsAchieved >= 50;
        const response = await this.twitter.post("statuses/update", <Twit.Params>{
          status: specialEvent ?
            `OMG WOW IL NE RESTE DÉJÀ PLUS QUE ${hoursLeft} HEURES D'ANALYYYYYSEEEEE GLHF POUR LES ${100 - percentsAchieved}% restants !!!\n🥳🥳🎉🎉🌮🌮` :
            `Et hop, il reste ${hoursLeft} heures d'analyse !\nCourage ! (${percentsAchieved}% déjà effectués 🙃)`,
        });

        debug(`Tweet successfully posted! ID: ${(response.data as any).id_str}`);
      } catch (err) {
        debug(`Error while posting the Tweet! You can find more details below:\n${err}`);
      }
    }, delay);

    debug(
      `Tweet scheduled for ${DateTime.local().plus({ milliseconds: delay }).toFormat("HH:mm")}!`
    );
  }
}
