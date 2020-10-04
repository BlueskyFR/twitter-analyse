import axios from "axios";
//import { Parser, Calendar } from "ikalendar";
import { async as ical, CalendarComponent } from "node-ical";
import { DateTime, Duration, Settings } from "luxon";
import dbg from "debug";

import TweetScheduler from "./TweetScheduler";
import { Config, CourseLookupResult } from "./types";

const debug = dbg("twitter-analyse:CalendarChecker");

// For test only
/* DateTime.local = function () {
  return DateTime.fromObject({ day: 5, month: 10, year: 2020, hour: 16, minute: 59 });
}; */

export default class CalendarChecker {
  private config: Config;

  constructor(config: Config) {
    // Luxon - Set the defaut timezone to FR
    Settings.defaultLocale = "fr";

    this.config = config;
  }

  // Download the calendar as .ics file
  private async downloadICS(url: string): Promise<string> {
    debug("Downloading calendar...");
    return (
      await axios.get(url, {
        timeout: Duration.fromObject({ minutes: 2 }).as("milliseconds"),
      })
    ).data;
  }

  private async getCalendar(url: string): Promise<CalendarComponent[]> {
    return Object.values(await ical.parseICS(await this.downloadICS(url)));
  }

  // Downloads, parses and extracts the current and the next courses from the calendar
  async courseLookup(): Promise<CourseLookupResult> {
    // Download and parse the calendar
    let calendar: CalendarComponent[] = await this.getCalendar(this.config.calendarURL);

    // Get the current course's index in the calendar
    const now = DateTime.local();
    let index = calendar.findIndex(
      (event) =>
        DateTime.fromJSDate(event.start as Date) <= now &&
        DateTime.fromJSDate(event.end as Date) >= now
    );

    // Return the current and the next courses
    return <CourseLookupResult>{
      current: calendar[index],
      // We suppose that the next index in the calendar is the next course
      next: calendar.length > index + 1 ? calendar[index + 1] : null,
    };
  }

  isAnalyse(course: CalendarComponent): boolean {
    return (course.summary as string).includes(this.config.eventMatchName);
  }

  getLengthOf(course: CalendarComponent): number {
    // Compute the length of the current analyse course
    const start = DateTime.fromJSDate(course.start as Date);
    const end = DateTime.fromJSDate(course.end as Date);

    return end.diff(start, "hours").hours;
  }

  /**
   * Only checks if the next course is not analyse too,
   * or is analyse but begins more than 30 after the end of the current course.
   * You must check if the current course is analyse before by calling `isAnalyse(...)`
   * @param courses the course lookup result returned by `courseLookup()`
   */
  shouldTweet(courses: CourseLookupResult): boolean {
    // If the next course does not exist, is not analyse
    if (!courses.next || !this.isAnalyse(courses.next)) return true;

    // The next course exists and is analyse
    let currentEnd = DateTime.fromJSDate(courses.next.start as Date);
    let nextStart = DateTime.fromJSDate(courses.current.end as Date);
    let diff = nextStart.diff(currentEnd, "minutes").minutes;

    // If the next analyse course begins more than 30 minutes
    // after the end of the current course
    if (diff >= 30) return true;

    return false;
  }
}
