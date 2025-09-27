import express from "express";
import cors from "cors";

const app = express();


//Basic configurations  //app.use()--->  Used for middleware
/**JSON (JavaScript Object Notation) is a lightweight, text-based data interchange format used to store and transmit structured data */
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

//cors configurations
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));


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