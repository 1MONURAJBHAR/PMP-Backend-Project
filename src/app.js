import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

/********************************************************************************************************** */
//Using winston & morgan loggers
//Morgan intercepts every request and logs it using the format we defined.
import logger from "./utils/loggers.js";
import morgan from "morgan";

const morganFormat = ":method :url :status :response-time ms";  //morgan fromats the http request in this format.

//app.use() → Adds Morgan as middleware in Express.
app.use(
  morgan(morganFormat, {
    stream: {           //stream.write()--> receives the formatted string (message) from morgan and parses the string into a structured object & then sent it to winston.
      write: (message) => {
        const logObject = {
          //Convert the raw string log into a structured JSON object.
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject)); // Converts the JavaScript object into a string because Winston logs strings & after that it sent it to winston at info level.
      },
    },
  }),
);

/**logger is your Winston logger instance supports info,error,warn,debug & etc */



/**This will log the messages to the console and the file app.log.
 *  The morgan package is used to format the log messages and the stream option is used to write the log messages to the console. */
/****************************************************************************************************************** */

//Basic configurations  //app.use()--->  Used for middleware
/**JSON (JavaScript Object Notation) is a lightweight, text-based data interchange format used to store and transmit structured data */
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));


app.use(cookieParser())
//cors configurations
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));



import healthCheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js"
import projectRouter from "./routes/project.routes.js"
import taskRouter from "./routes/task.routes.js"
import noteRouter from "./routes/note.routes.js"

app.use("/api/v1/healthcheck", healthCheckRouter);// when anybody hits this -->"http://localhost:8000/api/v1/healthcheck" this will gives control to "healthCheckRouter" it will go into "./routes/healthcheck.routes.js";
app.use("/api/v1/auth", authRouter); // when anybody hits this -->"http://localhost:8000/api/v1/auth" this will gives control to "authRouter" it will go into "./routes/auth.routes.js"
app.use("/api/v1/project", projectRouter);
app.use("/api/v1/task", taskRouter);
app.use("/api/v1/note", noteRouter);






app.get("/", (req, res) => {  //“If someone does a GET request to the root URL, run this function.”
    console.log("Welcome to basecampy"); 
    res.send("Hello!");
})

/**
 * Express stores this mapping in its internal router stack:
Method: GET
Path: "/"
Handler: your function

When a request arrives (after app.listen starts the server in index.js):
Express checks the request’s method (GET, POST, etc.).
Checks the request’s path (/, /users, etc.).
If both match, it runs the handler you registered. */


export default app;










/**JSON (JavaScript Object Notation) is a lightweight, text-based data interchange format used to store and transmit structured data. 
 * It uses human-readable text and a simple syntax based on JavaScript objects for name-value pairs and ordered lists of values.
 *  JSON is language-independent and widely used for exchanging data between web servers and browsers, making it a cornerstone of modern web development and data communication  
 * 
 * Key Characteristics
Human-Readable & Machine-Parsable: JSON data is easy for both humans to read and for computers to process, facilitating data exchange. 
Lightweight: Its simple text-based structure makes it efficient for data transfer, especially over networks. 
Language-Independent: Although it has roots in JavaScript, JSON is a universal format supported by virtually all programming languages*/