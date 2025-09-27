import mongoose from "mongoose";
import { DB_NAME } from "../utils/constants.js";

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log("✅ MongoDB connected");
        
    } catch (error) {
        console.error("❌ MongoDB connection error", error);
        process.exit(1);
        
    }
}

export default connectDB
/**It’s a Node.js method that ends the running process immediately.
Syntax:
process.exit([code])

code = exit code number you return to the operating system (OS).
Exit codes meaning:
0 → success (no error).
Example: process.exit(0) means “program finished fine.”

Non-zero (like 1) → failure/error.
Example: process.exit(1) means “program exited with an error.”

This is useful in:
Scripts
Servers
CI/CD pipelines
Because other tools can check the exit code to know if the process succeeded or failed. */


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**MongoDB Atlas Project confusion
In Atlas, a Project is a container for clusters, databases, users, and services.
Think of it like a “workspace.”
Inside a Project you can have:
Multiple clusters (databases/servers)
Database users & roles
Monitoring, alerts, security settings
Can You Have Multiple Projects in One Atlas Project?

❌ No.
An Atlas Project is a top-level container — you can’t “nest” projects inside it.
✅ But you can have multiple clusters (which hold multiple databases, collections, etc.) inside a single Project.
So if your Backend_Project Atlas project needs to host multiple apps (YouTube clone, Twitter clone, etc.), you can do it by:
Creating multiple databases inside the same cluster
Or creating multiple clusters inside the same Project
////////////////////////////////////////////////
Example Structure in Your Case

You have Backend_Project (Atlas Project).
Inside it you could organize like this:

Cluster0
Database: youtube_clone
Collections: users, videos, comments
Database: twitter_clone
Collections: users, tweets, likes

Or you could make separate clusters if you want more isolation.
///////////////////////////////////////////////////////////////////
When to Use Multiple Projects vs One Project

One Project with multiple databases ✅
If apps are small and just for your personal learning/portfolio.
Easier to manage under one umbrella.

Separate Projects ✅
If you’re working with different teams, clients, or organizations.
Helps in separating access control, billing, monitoring.
👉 In your screenshot, Backend_Project is an Atlas Project.
Inside it, you can host multiple databases (for multiple backend apps) in the same cluster. */