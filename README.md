# Twitter-Analyse

Un bot Twitter qui compte le nombre d'heures de Maths (Analyse) restantes :)

## Setup

To run this project on your own, you must create a `config.json5` containing the following informations:

```json5
{
  // .ics file URL
  calendarURL: "https://url_to_ics_file",

  // Twitter API credentials
  twitterAPI: {
    key: "<your bot's key>",
    secretKey: "<your bot's secret key>",
    bearerToken: "<your bot's bearer token>",
  },
}
```
