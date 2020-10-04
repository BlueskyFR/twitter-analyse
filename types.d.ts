import { CalendarComponent } from "node-ical";

export interface Config {
  calendarURL: string;

  eventMatchName: string;
  analyse: {
    totalHours: number;
    hoursLeft: number;
  };

  tweetDelay: number;

  twitterAPI: {
    key: string;
    secretKey: string;
    bearerToken: string;
    accessToken: string;
    secretAccessToken: string;
  };
}

export interface CourseLookupResult {
  current?: CalendarComponent;
  next?: CalendarComponent;
}
