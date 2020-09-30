// Allow parsing of .json5 files (with comments and all the good stuff)
import "json5/lib/register";
import dbg from "debug";
import axios from "axios";
import { Parser, Calendar } from "ikalendar";

const config = require("./config.json5");

dbg.enable("twitter-analyse:*");
const debug = dbg("twitter-analyse:main");

// Download the calendar as .ics file
async function getICS(): Promise<string> {
  return (await axios.get(config.calendarURL)).data;
}

async function getCalendar(): Promise<Calendar> {
  const parser = new Parser();
  return parser.parse(await getICS());
}

async function main() {
  debug(await getCalendar());
}

main();
