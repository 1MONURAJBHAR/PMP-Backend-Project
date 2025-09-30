import { validationResult } from "express-validator";
import { ApiError } from "../utils/api-error.js";

export const validate = (req, res, next) => {
  const errors = validationResult(req); //This will take the array of error coming from userRegisterValidator()
  //errors is not a simple array or string. Its datatype is an object returned by express-validator, specifically a Result object that represents the result of the validation. 
  
  if (errors.isEmpty()) { //check the array if it is empty then move to next middleware or server
    return next(); 
  }

  //if there are error in this "errors" array then catch them and store in "extractedErrors" array & thorw it
  const extractedErrors = []; //All the errors will be collected in this extractedErrors.

  errors.array().map((err) =>     //Here we are converting errors into an error, actually it is an error but we are again converting it to an error.
    extractedErrors.push({      //By using the map method on errors array, pushing all the "error path" and "error messages" into extractedErrors array.
      [err.path]: err.msg,
    }),
  );
  console.log("Extracted Errors (JSON):",JSON.stringify(extractedErrors, null, 2),
  );
  throw new ApiError(422, "Recieved data is not valid", extractedErrors); //If any errors occurs then throw this error
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**1. JSON.stringify(value)
 Converts a JavaScript object, array, or value into a JSON string.
Example:

const obj = { name: "Monu", age: 25 };
console.log(JSON.stringify(obj)); 
// Output: '{"name":"Monu","age":25}'

2. The second argument (null)
This is usually a replacer function that lets you filter or transform keys.
Here "null" means "no filtering", include all keys.

Example with replacer:

JSON.stringify(obj, ["name"]); 
// Output: '{"name":"Monu"}' (only keeps "name" property)


3. The third argument (2)
This is the space/indentation for pretty-printing.
2 means each nested level is indented by 2 spaces, making it easier to read.

Example:

const arr = [{ email: "invalid" }, { password: "short" }];
console.log(JSON.stringify(arr, null, 2));


Output:

[
  {
    "email": "invalid"
  },
  {
    "password": "short"
  }
]

✅ This is much more readable than a single-line JSON string. 


/************************************************************************************************************************************** */
/*
When you use:
JSON.stringify(extractedErrors, null, 2)
the 2 is the number of spaces used for indentation for each “level” in your object or array.

Example
const errors = [
  { email: "Invalid email" },
  { password: "Password too short" }
];

console.log(JSON.stringify(errors, null, 2));

Output:

[
  {
    "email": "Invalid email"
  },
  {
    "password": "Password too short"
  }
]


The outer array [] is at level 0 → no indentation.
The objects inside { "email": "Invalid email" } are level 1 → each line is indented by 2 spaces.
If you used 4 instead of 2:
JSON.stringify(errors, null, 4)

Output:

[
    {
        "email": "Invalid email"
    },
    {
        "password": "Password too short"
    }
]*/
