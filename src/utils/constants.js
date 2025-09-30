//Here we are passing the UserRolesEnum as Objects,it contains Key value pair
export const UserRolesEnum = {//export in object form
    ADMIN: "admin",
    PROJECT_ADMIN: "project_admin",
    MEMBER: "member"
}

//Here we are converting UserRolesEnum object into an array AvailableUserRole containing only values of the object.
export const AvailableUserRole = Object.values(UserRolesEnum);//export in array form

//So we can use any data structure array or object depending on our need.

//Doing same thing as above
export const TaskStatusEnum = {//Export the object form
    TODO: "todo",
    IN_PROGRESS: "in_progress",
    DONE:"done"
}

export const AvailableTaskStatues = Object.values(TaskStatusEnum)//Export the array form


export const DB_NAME = "PMP_Database"

/**export const UserRolesEnum = {
    ADMIN: "admin",
    PROJECT_ADMIN: "project_admin",
    MEMBER: "member"
}

What this means:
It’s an object that stores constant values (roles in this case).

ADMIN → "admin"
PROJECT_ADMIN → "project_admin"
MEMBER → "member"

Why use this instead of raw strings?
To avoid magic strings scattered in code:

js
Copy code
if (user.role === "admin") { ... }   // ❌ easy to mistype
Instead, use:

js
Copy code
if (user.role === UserRolesEnum.ADMIN) { ... }   // ✅ consistent & safer
Acts like an Enum (enumeration)
JavaScript doesn’t have a true enum type (like TypeScript, Java, C#).
So devs often use objects to simulate enums.

Example usage:
js
Copy code
import { UserRolesEnum } from "./constants.js";

function canDeleteProject(user) {
    return user.role === UserRolesEnum.ADMIN 
        || user.role === UserRolesEnum.PROJECT_ADMIN;
}

const user = { role: UserRolesEnum.MEMBER };

console.log(canDeleteProject(user));  // false
✅ So this is a constants object (enum-like structure) to define fixed values for user roles in your app.
It makes your code cleaner, safer, and easier to maintain.

 */