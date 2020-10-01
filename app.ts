// Allow parsing of .json5 files (with comments and all the good stuff)
import "json5/lib/register";
import dbg from "debug";
import axios from "axios";
//import { Parser, Calendar } from "ikalendar";
import { async as ical, CalendarComponent } from "node-ical";

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

async function main() {
  let calendar: CalendarComponent[] = await getCalendar();

  debug(calendar);
}

main(); // ISO 8601
