// Allow parsing of .json5 files (with comments and all the good stuff)
import "json5/lib/register";
import dbg from "debug";

const config = require("./config.json5");

dbg.enable("twitter-analyse:*");
const debug = dbg("twitter-analyse:main");
