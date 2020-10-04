# Twitter-Analyse

Un bot Twitter qui compte le nombre d'heures de Maths (Analyse) restantes :)

## Setup

To run this project on your own, you must create a `config.json5` containing the following informations:

```json5
{
  // .ics file URL
  calendarURL: "https://url_to_ics_file",
  // The partial name of the event to look for in order to trigger a match
  eventMatchName: "Analyse pour l'ingenieur",

  analyse: {
    totalHours: 72,
    hoursLeft: 54,
  },

  // How many minutes to wait before tweeting after the Analyse course
  tweetDelay: 15,

  // Twitter API credentials
  twitterAPI: {
    key: "<your bot's key>",
    secretKey: "<your bot's secret key>",
    bearerToken: "<your bot's bearer token>",
    accessToken: "<your bot's access token>",
    secretAccessToken: "<your bot's secret access token>",
  },
}
```
