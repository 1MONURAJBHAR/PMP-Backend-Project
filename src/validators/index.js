import { body } from "express-validator";   //body is method is taking from express-validator
import { AvailableUserRole } from "../utils/constants.js";

//This will collect the errors from coming request body in an array and return the array of error to the next validator 
const userRegisterValidator = () => { //notice here there is no "req,res,next" means it will only collect the error and send it to validator
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")//if there is error in the upper subsequent method then this withMessage will throw error<--common for all.
      .isEmail()                       //This will check that the email is in the format of email or not
      .withMessage("Email is invalid"),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLowercase()
      .withMessage("Username must be in lower case")
      .isLength({ min: 3 })    //minimum length of the user must be 3
      .withMessage("Username must be at least 3 characters long"),
    body("password").trim().notEmpty().withMessage("Password is required"),
    body("fullName").optional().trim(),
  ];
};

const userLoginValidator = () => {
  return [
    body("email").optional().isEmail().withMessage("Email is invalid"),
    body("password").notEmpty().withMessage("Password is required"),
    body("username").optional().notEmpty().trim().withMessage("Username is required")
  ];
};

const userChangeCurrentPasswordValidator = () => {
  return [
    body("oldPassword").notEmpty().withMessage("Old password is required"),
    body("newPassword").notEmpty().withMessage("New password is required"),
  ];
};

const userForgotPasswordValidator = () => {
  return [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
  ];
};

const userResetForgotPasswordValidator = () => {
  return [body("newPassword").notEmpty().withMessage("Password is required")];
};

const createProjectValidator = () => {
  return [
    body("name").notEmpty().withMessage("Name is required"),
    body("description").optional(),
  ];
};

const addMembertoProjectValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("role")
      .notEmpty()
      .withMessage("Role is required")
      .isIn(AvailableUserRole)
      .withMessage("Role is invalid"),
  ];
};

const createTheTasks = () => {
  return [
    body("title").notEmpty.withMessage("Title is required").trim(),
    body("description").notEmpty().withMessage("Description is required"),
    body("assignedTo").notEmpty().withMessage("Provide the user details to whom the project is assigned to")
  ];
}

const UpdateTheTask = () => {
  return [
    body("title").notEmpty.withMessage("Title is required").trim(),
    body("description").notEmpty().withMessage("Description is required"),
    body("assignedTo").notEmpty().withMessage("Provide the user details to whom the project is assigned to")
  ]
}

const createTheSubTask = () => {
  return [
    body("title").notEmpty.withMessage("Title is required").trim(),
    body("description").notEmpty().withMessage("Description is required"),
  ];
}
const updateTheSubTask = () => {
  return [
    body("title").notEmpty.withMessage("Title is required").trim(),
    body("description").notEmpty().withMessage("Description is required"),
  ];
}


export {
  userRegisterValidator,
  userLoginValidator,
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
  userResetForgotPasswordValidator,
  createProjectValidator,
  addMembertoProjectValidator,
  createTheTasks,
  UpdateTheTask,
  createTheSubTask,
  updateTheSubTask,
};
