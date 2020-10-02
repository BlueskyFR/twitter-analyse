import { CalendarComponent } from "node-ical";

export interface Config {
  calendarURL: string;

  eventMatchName: string;

  twitterAPI: {
    key: string;
    secretKey: string;
    bearerToken: string;
  };
}

export interface CourseLookupResult {
  current?: CalendarComponent;
  next?: CalendarComponent;
}
