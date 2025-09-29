import mongoose, { Schema } from "mongoose";
import brcypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new Schema(
  {
    avatar: {
      type: {
        url: String,
        localPath: String,
      },
      default: {
        url: `https://placehold.co/200x200`,
        localPath: "",
      },
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    }, 
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordExpiry: {
      type: Date,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function (next) {  //Don't use arrow function here because it has global context for "this"
  if (!this.isModified("password")) return next();  //checks if password is not modified then move to next(), if modified then move ahead and hash the password before save.

  this.password = await brcypt.hash(this.password, 10);  
  next();
});

/**
 this → refers to the current Mongoose document (the user being saved).
.isModified("password") → a built-in Mongoose method that checks if the password field was changed in the current save/update.
!this.isModified("password") → means password was NOT changed.
return next() → skip hashing and continue to the next middleware (or directly save).

Why do we need this?
If you update another field (e.g., username), you don’t want the password to be hashed again.
Without this check, bcrypt would keep re-hashing an already hashed password, making it unusable for login.
 * 
 * 
 * bcrypt.hash(plainTextPassword, saltRounds)
plainTextPassword → The password before hashing.
saltRounds (10) → The cost factor; higher = more secure but slower.
Here, 10 means bcrypt will perform 2¹⁰ (1024) hashing iterations internally. This makes brute-force attacks harder.

Also note:
It’s hashing, not encryption → you can’t "decrypt" it back.
The stored hash will be different even if two users choose the same password (because of the salt). */


userSchema.methods.isPasswordCorrect = async function (password) {
  return await brcypt.compare(password, this.password);   //password-->current passwrod send by user, this.password-->password from database.
};  //bcrypt will compare both these password and return true or false.




/**************************************Tokens with data******************************************** */
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY },
  );
};

/*****************************Token without data********************** */
//can be used for verifying the user,for reset the password etc.
/** The crypto module is a built-in Node.js library that provides cryptographic functionality — things like hashing, encryption, decryption, and generating random values.
 *  It’s widely used for authentication, password security, API tokens, and more*/
userSchema.methods.generateTemporaryToken = function () {
    const unHashedToken = crypto.randomBytes(20).toString("hex")
    //Hashing is permanent, after hashing we cannot decrypt it
    const hashedToken = crypto  //hasing the same unHashedToken
        .createHash("sha256")
        .update(unHashedToken)  
        .digest("hex")

    const tokenExpiry = Date.now() + (20*60*1000) //set the expiry time 20 mins ahead of current Date.now() 
  return { unHashedToken, hashedToken, tokenExpiry };
};

export const User = mongoose.model("User", userSchema);




/**The crypto module is a built-in Node.js library that provides cryptographic functionality — things like hashing, encryption, decryption, and generating random values.
 *  It’s widely used for authentication, password security, API tokens, and more.

🔑 Key Features of crypto
Hashing → One-way functions (e.g., sha256, md5, sha512).
HMAC (Hash-based Message Authentication Code) → Verifies both data integrity & authenticity.
Encryption / Decryption → Symmetric (AES) and Asymmetric (RSA, EC).
Random Values → crypto.randomBytes() for tokens, IDs, salts.
Key Derivation → pbkdf2 for password-based key stretching.

✅ Example Usages
1. Hashing a password:

import crypto from "crypto";

const password = "mySecret123";
const hash = crypto.createHash("sha256").update(password).digest("hex");

console.log("SHA256 Hash:", hash); */




























/**The keywords async and await in JavaScript are syntactic sugar built on top of Promises, 
 * designed to make asynchronous code more readable and easier to manage, resembling synchronous code. 

• async keyword: 
	• Declaring a function with async before the function keyword signifies that it's an asynchronous function. 
	• An async function always returns a Promise. 
	• If the async function explicitly returns a Promise, that Promise is returned directly. 
	• If the async function returns a non-Promise value (e.g., a number, string, or object), JavaScript automatically wraps that value in a resolved Promise. 
	• If an async function throws an error, that error is automatically wrapped in a rejected Promise. 

    async function fetchData() {
      // This function will implicitly return a Promise
      return "Data fetched successfully!";
    }

    async function getError() {
      throw new Error("Something went wrong!");
    }

• await keyword: 
	• The await keyword can only be used inside an async function. 
	• It pauses the execution of the async function until the Promise it is awaiting settles (either resolves or rejects). 
	• If the awaited Promise resolves, await returns the resolved value, allowing you to assign it to a variable as if it were a synchronous return. 
	• If the awaited Promise rejects, await throws the rejected value as an error, which can then be caught using a try...catch block. 

    async function processData() {
      try {
        let result = await fetchData(); // Pauses execution until fetchData's Promise resolves
        console.log(result); // "Data fetched successfully!"

        await getError(); // This will cause an error to be thrown
      } catch (error) {
        console.error("Caught an error:", error.message); // "Caught an error: Something went wrong!"
      }
    }

    processData();

In essence, async ensures a function's return value is always a Promise, 
and await provides a clean way to interact with those Promises by pausing execution 
and extracting their resolved values or handling their rejections. 
for more info goto:
[1] https://www.geeksforgeeks.org/javascript/async-await-function-in-javascript/ */

/***************************************************************************************************************************** */
/**1. What happens when a function is async?
async function foo() {
  return 42;
}

Even though it returns 42, JavaScript automatically wraps it in a Promise.
So foo() actually returns:

Promise.resolve(42);

2. Who extracts the value from a Promise?
Nobody extracts it automatically — the promise just represents a future value.
To get the real value, you need either:

.then() chaining 
     //or
await inside another async function

Example:

foo().then(value => console.log(value)); // logs 42


Or:

async function bar() {
  const value = await foo(); 
  console.log(value); // logs 42
}


You call bar():

bar();

Because bar is async, it immediately returns a Promise.
So if you log it:

console.log(bar()); // Promise { <pending> }

Inside bar:
It calls foo().

foo() is async, so it returns Promise.resolve(42).
At this point:
const value = await foo();

pauses execution until that Promise settles.

Event loop + microtask queue:
JavaScript puts the continuation of bar (the part after await) into the microtask queue.
This allows other synchronous code to run first.
When the promise resolves:

await foo() unwraps the value 42.
Execution continues:

console.log(value); // logs 42

bar finishes:
Since there’s no return, bar resolves to undefined.
So:
bar().then(result => console.log(result)); // logs 42, then logs undefined

Key idea:
Calling an async function does not block — it returns a Promise immediately.
The code inside the async function pauses at await, and resumes later when the awaited Promise resolves.


Here:
await pauses execution until the Promise is resolved.
The JS runtime (via the event loop + microtask queue) resumes the function with the resolved value.

3. In your Mongoose example:
this.password = await bcrypt.hash(this.password, 10);

bcrypt.hash() returns a Promise.
await extracts the resolved value (the hashed string).
Without await, this.password would just be set to a Promise object, not the actual hash.

⚡ In short:
The JavaScript runtime (event loop + await/.then) handles extracting the value from a Promise, not you manually. */


/********************************************************************************************************************************* */