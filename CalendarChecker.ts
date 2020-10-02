import axios from "axios";
//import { Parser, Calendar } from "ikalendar";
import { async as ical, CalendarComponent } from "node-ical";
import { DateTime, Settings } from "luxon";
import dbg from "debug";

import AnalyseScheduler from "./AnalyseScheduler";
import { Config, CourseLookupResult } from "./types";

const debug = dbg("twitter-analyse:CalendarChecker");

export default class CalendarChecker {
  private config: Config;
  private scheduler: AnalyseScheduler;
  private lastAnalyseCourseID: string;

  constructor(config: Config, scheduler: AnalyseScheduler) {
    this.config = config;
    this.scheduler = scheduler;
  }

  // Download the calendar as .ics file
  private async downloadICS(url: string): Promise<string> {
    return (await axios.get(url)).data;
  }

  private async getCalendar(url: string): Promise<CalendarComponent[]> {
    return Object.values(await ical.parseICS(await this.downloadICS(url)));
  }

  private analyseLookup(calendar: CalendarComponent[]): CourseLookupResult {
    const now = DateTime.local();
    let index = calendar.findIndex(
      (event) =>
        DateTime.fromJSDate(event.start as Date) <= now &&
        DateTime.fromJSDate(event.end as Date) >= now
    );

    return <CourseLookupResult>{
      current: calendar[index],
      // We suppose that the next index is the next course
      next: calendar.length > index + 1 ? calendar[index + 1] : null,
    };
  }

  private isAnalyse(course: CalendarComponent): boolean {
    return (course.summary as string).includes(this.config.eventMatchName);
  }

  async checkForAnalyse() {
    // Set the defaut timezone to FR
    Settings.defaultLocale = "fr";

    let calendar: CalendarComponent[] = await this.getCalendar(this.config.calendarURL);
    let courses: CourseLookupResult = this.analyseLookup(calendar);

    // If at least a course was found, the current course is Analyse (maths) and it was not yet processed
    if (
      courses.current &&
      this.isAnalyse(courses.current) &&
      this.lastAnalyseCourseID != courses.current.uid
    ) {
      // Save the current course's id to avoid reprocessing it next time
      this.lastAnalyseCourseID = courses.current.uid as string;
      // Decrease the amount of time left in config file

      // If the next one is not Analyse too
      if (!courses.next || !this.isAnalyse(courses.next)) {
        // Schedule tweet
      }
    }
  }
}
