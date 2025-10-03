import { createLogger, format, transports } from "winston";
const { combine, timestamp, json, colorize } = format;

// Custom format for console logging with colors
const consoleLogFormat = format.combine(
  format.colorize(),  //colorize the response
  format.printf(({ level, message, timestamp }) => {  //send response in this format
    return `${level}: ${message}: ${timestamp}`;
  }),
);

// Create a Winston logger
//Winston logs it with timestamps, levels, and optionally colors or files.
const logger = createLogger({
  level: "info", //set the default as level info
  format: combine(colorize(), timestamp(), json()), //You get "colored" logs in console AND structured "JSON" logs with "timestamps", which is perfect for both development and production.
  transports: [
    new transports.Console({
      //Print to the console in this format --> consoleLogFormat
      format: consoleLogFormat,
    }),
    new transports.File({ filename: "app.log" }), //write/transport the info in this file named "app.log"
  ],
});

export default logger; 

/*This code configures Winston to log messages to the console and a file called app.log. 
It also sets the log level to info and uses the colorize and timestamp formatters to add colors and timestamps to the console logs.*/