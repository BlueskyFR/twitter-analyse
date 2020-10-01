// Allow parsing of .json5 files (with comments and all the good stuff)
import "json5/lib/register";
import dbg from "debug";
import axios from "axios";
//import { Parser, Calendar } from "ikalendar";
import { async as ical, CalendarComponent } from "node-ical";
import { DateTime, Settings } from "luxon";

const config = require("./config.json5");

dbg.enable("twitter-analyse:*");
const debug = dbg("twitter-analyse:main");

// Download the calendar as .ics file
async function getICS(): Promise<string> {
  return (await axios.get(config.calendarURL)).data;
}

async function getCalendar(): Promise<CalendarComponent[]> {
  return Object.values(await ical.parseICS(await getICS()));
}

function getCurrentCourse(calendar: CalendarComponent[]): CalendarComponent | false {
  const now = DateTime.local();

  return (
    calendar.find(
      (event) =>
        DateTime.fromJSDate(event.start as Date) <= now &&
        DateTime.fromJSDate(event.end as Date) >= now
    ) || false
  );
}

/*
DateTime.fromJSDate(event.start as Date) <= now &&
DateTime.fromJSDate(event.end as Date) >= now
*/

async function main() {
  // Set the defaut timezone to FR
  Settings.defaultLocale = "fr";

  let calendar: CalendarComponent[] = await getCalendar();

  debug(getCurrentCourse(calendar));
}

main(); // ISO 8601
