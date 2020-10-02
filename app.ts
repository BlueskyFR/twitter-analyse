// Allow parsing of .json5 files (with comments and all the good stuff)
import "json5/lib/register";
import dbg from "debug";
import AnalyseScheduler from "./AnalyseScheduler";
import { Config } from "./types";

const config: Config = require("./config.json5");

dbg.enable("twitter-analyse:*");
const debug = dbg("twitter-analyse:main");

/*
DateTime.fromJSDate(event.start as Date) <= now &&
DateTime.fromJSDate(event.end as Date) >= now
*/

async function main() {
  let scheduler: AnalyseScheduler = new AnalyseScheduler();
}

main(); // ISO 8601
