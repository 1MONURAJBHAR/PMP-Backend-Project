class ApiError extends Error{
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
      super(message); //calling the constructor of parent class & it expects only one parameter to be passed on.
      ((this.statusCode = statusCode),
        (this.data = null),
        (this.message = message),
        (this.success = false),
        (this.errors = errors)); //// <-- this line assigns the errors you passed in.

      /**In JavaScript, every Error object has a .stack property.
         It’s a string showing where the error happened (call stack trace).
         If stack is provided externally, use that (this.stack = stack).
         Otherwise, generate a fresh stack trace using Error.captureStackTrace. */

      if (stack) {
        this.stack = stack;
      } else {
        //It tells V8: “Generate a .stack trace for this error object.” Here error object-->new ApiError()
        Error.captureStackTrace(this, this.constructor);
      }
      /**Error.captureStackTrace(this, this.constructor) means:
👉      “Attach a stack trace to this error object(new ApiError()), but don’t show this class’s constructor in the trace.” */
    }
};


export { ApiError };



/**What is stack?
In JavaScript, every Error object has a .stack property.
It’s a string showing where the error happened (call stack trace).

Example:

try {
  throw new Error("Something went wrong");
} catch (err) {
  console.log(err.stack);
}


Might output:

Error: Something went wrong
    at Object.<anonymous> (/path/file.js:2:9)
    at Module._compile (internal/modules/cjs/loader.js:999:30)

Step 2: What does Error.captureStackTrace do?
It’s a V8-specific method (works in Node.js, not in browsers).
It tells V8: “Generate a .stack trace for this error object.”

Syntax:
Error.captureStackTrace(targetObject, constructorOpt);

targetObject = the object to which the .stack property will be assigned (usually this).
constructorOpt = a function to exclude from the trace (here this.constructor so that the class constructor itself doesn’t appear in stack trace).

So, Error.captureStackTrace(this, this.constructor) means:
👉 “Attach a stack trace to this error object, but don’t show this class’s constructor in the trace.”

Step 3: Why the if (stack) check?
This allows flexibility:
If stack is provided externally, use that (this.stack = stack).
Otherwise, generate a fresh stack trace using Error.captureStackTrace.

Real-world usage: Custom Error class
class ApiError extends Error {
    constructor(message, statusCode, stack = "") {
        super(message);
        this.statusCode = statusCode;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}


If you manually pass a stack, it uses that.
Otherwise, it auto-generates the stack for debugging.

✅ In short:
stack = a string showing where the error occurred.
Error.captureStackTrace = generates a .stack trace for custom errors.
The if lets you reuse an existing stack trace or create a new one. */

/**Meaning of this.errors = errors
this.errors → a property on your ApiError object instance.
errors → the argument passed when creating the error (could be an array of validation error objects, or custom messages).
So, it just stores additional error details inside the error response object, so that when you send it back in an API response, the client gets more context.
Example usage:

throw new ApiError(400, "Validation failed", [
  { field: "email", message: "Invalid email address" },
]);

This would produce an error object with:

{
  "statusCode": 400,
  "message": "Validation failed",
  "success": false,
  "errors": [
    { "field": "email", "message": "Invalid email address" }
  ]
} */