import axios from "axios";
//import { Parser, Calendar } from "ikalendar";
import { async as ical, CalendarComponent } from "node-ical";
import { DateTime, Settings } from "luxon";
import dbg from "debug";

import AnalyseScheduler from "./AnalyseScheduler";

const debug = dbg("twitter-analyse:CalendarChecker");

// Download the calendar as .ics file
async function downloadICS(url: string): Promise<string> {
  return (await axios.get(url)).data;
}

async function getCalendar(url: string): Promise<CalendarComponent[]> {
  return Object.values(await ical.parseICS(await downloadICS(url)));
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

function isAnalyse(course: CalendarComponent, eventMatchName: string): boolean {
  return (course.summary as string).includes(eventMatchName);
}

export default async function checkForAnalyse(config, scheduler: AnalyseScheduler) {
  // Set the defaut timezone to FR
  Settings.defaultLocale = "fr";

  let calendar: CalendarComponent[] = await getCalendar(config.calendarURL);
  let currentCourse = getCurrentCourse(calendar);

  let courseIsAnalyse;
  if (currentCourse != false) {
    courseIsAnalyse = isAnalyse(currentCourse, config.eventMatchName);
  }

  debug(`courseIsAnalyse -> ${courseIsAnalyse}`);
}
