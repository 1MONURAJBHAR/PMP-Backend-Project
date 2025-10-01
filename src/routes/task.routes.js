import { Router } from "express";

import {
  createTask,
  updateTask,
  deleteTask,
  getTasks,
  getTaskById,
  createSubTask,
  updateSubTask,
  deleteSubTask,
} from "../controllers/task.controllers.js";

import {
  validateProjectPermission,
  verifyJWT,
  validateTaskStatus,
} from "../middlewares/auth.middleware.js"; // if you have auth middleware

import { validate } from "../middlewares/validator.middleware.js"; // optional validators

import {
  createTheTasks,
  UpdateTheTask,
  createTheSubTask,
  updateTheSubTask,
} from "../validators/index.js";


const router = Router();
router.use(verifyJWT);

import { upload } from "../middlewares/multer.middleware.js";

import { AvailableUserRole,UserRolesEnum } from "../utils/constants.js";

//------------------ Task Routes ------------------//

// Get all tasks of a project
router.get("/:projectId",  getTasks);

// Get single task by ID
router.get(
  "/getTaskById/:taskId",
  getTaskById
);

// Create a new task,✅ Solution: always put multer before validators, so that it will accept data from "form" as well as "json data" from body.
router.post(  //when we send json data in body express.json() parses it correctly, but when we send data in form with or without files, multer parses the "files" well as "text data" in the form. 
  "/createTask/:projectId",
  validateProjectPermission([UserRolesEnum.ADMIN]),
  upload.array("attachments"), // ⬅️ multer first        // field name is "attachments", so use this name while uploading files on postman,you can upload one or multiple files since it takes as an array of attachments.
  createTheTasks(), // ⬅️ now validators see req.body
  validate,
  createTask,
);



// Update a task
router.put(
  "/updateTask/:taskId",
    //validateProjectPermission([UserRolesEnum.ADMIN]),
  validateTaskStatus,
  UpdateTheTask(),
  validate,
  updateTask,
);

// Delete a task
router.delete("/deleteTask/:taskId", deleteTask);  //validateTaskStatus,  we can add this middleware 

//------------------ Subtask Routes ------------------//

// Create a subtask under a task
router.post(
  "/subtask/:taskId",
   createTheSubTask(),
  validate,
  createSubTask,
);

// Update a subtask
router.put(
  "/subtask/:subtaskId",
  updateTheSubTask(),
  validate,
  updateSubTask,
);

// Delete a subtask
router.delete(
  "/subtask/:subtaskId",
  deleteSubTask,
);

export default router;



/**Why JSON Body Works but Form-Data Fails
When you send data as raw JSON (application/json), express.json() parses it correctly and your validators (title, description, assignedTo, status) see proper values. ✅
When you send data as form-data (multipart/form-data), the parsing is handled by multer (for files & text) but not by express.json().
Multer will only handle files (attachments) and text fields, but all text fields come as strings.
If your validation schema expects JSON or specific formats (like ObjectId validation), those strings may fail. 


Why It Works with JSON but Not Form-Data
Middleware order
If express-validator runs before multer, then at that point req.body is still empty → validators throw errors (title is required, etc.).
Only after upload.array("attachments") runs, will req.body be populated with your form-data text fields.
✅ Solution: always put multer before validators:

router.post(
  "/createTask/:projectId",
  validateProjectPermission([UserRolesEnum.ADMIN]),
  upload.array("attachments"),   // multer populates req.body + req.files
  createTheTasks(),              // validator checks req.body now
  validate,
  createTask,
);*/
