// Allows parsing of .json5 files (with comments and all the good stuff)
import * as jju from "jju";
import * as fs from "fs";
import dbg from "debug";
import AnalyseScheduler from "./TweetScheduler";
import { Config, CourseLookupResult } from "./types";
import TweetScheduler from "./TweetScheduler";
import { DateTime, Duration, Settings } from "luxon";
import CalendarChecker from "./CalendarChecker";

dbg.enable("twitter-analyse:*");
const debug = dbg("twitter-analyse:main");

// For test only
/* DateTime.local = function () {
  return DateTime.fromObject({ day: 5, month: 10, year: 2020, hour: 16, minute: 59 });
}; */

const configFileName = "config.json5";
let rawConfig: string;

function readConfigFile(): Config {
  rawConfig = fs.readFileSync(configFileName, "utf8");
  return jju.parse(rawConfig);
}

function updateConfigFile(newConfig: Config) {
  fs.writeFileSync(configFileName, jju.update(rawConfig, newConfig));
}

const config: Config = readConfigFile();
let lastAnalyseCourseID: string;

async function loop(calendar: CalendarChecker, tweetScheduler: TweetScheduler) {
  debug("Running loop...");

  // Use a try...catch structure to handle errors such as timeout in the calendar download request
  try {
    // Get the current and the next courses
    let courseLookup: CourseLookupResult = await calendar.courseLookup();
    debug(`Course lookup done! Current course: ${courseLookup.current?.summary ?? "none"}`);
    // Check if at least a course was found, the current course is Analyse (maths) and it was not yet processed
    if (
      courseLookup.current &&
      calendar.isAnalyse(courseLookup.current) &&
      lastAnalyseCourseID != courseLookup.current.uid
    ) {
      debug("Current course is analyse! Updating hours left...");

      // Save the current course's id to avoid reprocessing it next time
      lastAnalyseCourseID = courseLookup.current.uid as string;

      // Decrease the hours count left in the config file
      config.analyse.hoursLeft -= calendar.getLengthOf(courseLookup.current);
      updateConfigFile(config);

      if (calendar.shouldTweet(courseLookup)) {
        debug("Tweeting!");

        // Schedule the tweet
        tweetScheduler.tweetAfter(courseLookup.current);
      }
    }
  } catch (err) {
    debug(`Error handled in loop: [${err}]`);
  }
}

function startLoop() {
  debug("Starting loop...");

  // Luxon - Set the defaut timezone to FR
  Settings.defaultLocale = "fr";

  const now = DateTime.local();

  // We want to run the loop each hours and a half (Xh30),
  // so we compute the time left until we launch the setInterval
  // Set the minutes to 30
  let nextHalf = now.set({ minute: 30 });
  // Now add an hour if the current minutes were >= 29
  // (we are adding 1 minute of safety to avoid running it 2 times
  // consecutively at the first execution)
  if (nextHalf <= now.plus({ minutes: 1 })) nextHalf.plus({ hours: 1 });

  // Initialize the Tweet Scheduler
  const tweetScheduler: TweetScheduler = new TweetScheduler(config);
  // Initialize the Calendar Checker
  const calendarChecker: CalendarChecker = new CalendarChecker(config);

  loop(calendarChecker, tweetScheduler);
  setTimeout(() => {
    loop(calendarChecker, tweetScheduler);
    setInterval(
      loop,
      Duration.fromObject({ hours: 1 }).as("milliseconds"),
      calendarChecker,
      tweetScheduler
    );
  }, nextHalf.diffNow().as("milliseconds"));
}

startLoop();
