import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/index.js";

dotenv.config({
    path: "./.env",
})


const port = process.env.PORT || 3000;

connectDB()
    .then(() => {
        app.listen(port, () => {
          console.log(`Example app listening on port http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.log(`Example app is listening on port http://localhost:${port}`);
    });


 








/**When you write this:

app.get("/", (req, res) => {
    console.log("Welcome to basecampy"); 
});


You are registering a route handler. Let’s break that down:
What does it mean?

app.get(path, handler) is Express’ way of saying:
“Whenever an HTTP GET request comes to this path, call this handler function.”
So here:

path = "/" → means the root URL (http://localhost:3000/).
handler = (req, res) => { ... } → the callback that will run when that route is hit.

What actually happens in Express internally?

When you call app.get("/", handler):

Express stores this mapping in its internal router stack:

Method: GET
Path: "/"
Handler: your function


When a request arrives (after app.listen starts the server):
Express checks the request’s method (GET, POST, etc.).
Checks the request’s path (/, /users, etc.).
If both match, it runs the handler you registered.
Example flow

You start your server (app.listen(3000)).
You open browser → http://localhost:3000/.
Browser sends a request:

GET / HTTP/1.1
Host: localhost:3000


Express matches it to your app.get("/").
Your handler runs:

console.log("Welcome to basecampy");
res.send("Hello!");   // (you should send a response, otherwise request hangs)

✅ So “registers a route handler for GET /” means you’re telling Express:
“If someone does a GET request to the root URL, run this function.” */























/**Step 1: What happens when you import app from "./app.js"
When you import a module in Node.js (ESM), all top-level code in that file is executed immediately.
So:
import express from "express"; → loads Express.
const app = express(); → creates an Express application instance.
app.get("/", ...) → registers a route handler for GET /.
After these run, the app object is exported.
👉 That’s why it looks like app.js “automatically executes” — in reality, the top-level statements run as soon as the module is imported.

Step 2: Why doesn’t console.log("Welcome to basecampy") run immediately?
Because:
app.get("/", (req, res) => {
    console.log("Welcome to basecampy");
})


is just registering a callback function, not running it right away.
It says: “When someone makes a GET request to /, call this function.”
So console.log("Welcome to basecampy") will only run when you actually hit http://localhost:3000/ in browser or Postman.

Step 3: What makes the server actually listen?
That happens in your other file (e.g. server.js):

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

Without app.listen, your routes are defined but the server is not accepting requests.

✅ Summary:
Importing app.js runs its top-level code automatically.
The app.get("/", ...) doesn’t execute immediately; it just registers a route.
The callback (console.log("Welcome to basecampy")) executes only when you visit /. */


