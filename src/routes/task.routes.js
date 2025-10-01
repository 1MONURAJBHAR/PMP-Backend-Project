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

// Get all tasks of a project, List project tasks
router
  .route("/:projectId")
  .get(validateProjectPermission(AvailableUserRole), getTasks)
  .post(
    validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN, ]), //when we send json data in body express.json() parses it correctly, but when we send data in form with or without files, multer parses the "files" well as "text data" in the form
    upload.array("attachments"), // ⬅️ multer first        // field name is "attachments", so use this name while uploading files on postman,you can upload one or multiple files since it takes as an array of attachments.
    createTheTasks(), // ⬅️ now validators see req.body    // Create a new task,✅ Solution: always put multer before validators, so that it will accept data from "form" as well as "json data" from body.
    validate,
    createTask,
  );


// Get single task by ID, Get task details 
router
  .route("/:projectId/t/:taskId")
  .get(validateProjectPermission(AvailableUserRole), getTaskById)
  .put(  //Update a task
    validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
    upload.array("attachments"),
    validateTaskStatus,
    UpdateTheTask(),
    validate,
    updateTask,
  )
  .delete(  //delete a task
    validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
    deleteTask,
  );  //validateTaskStatus,  we can add this middleware 

//------------------ Subtask Routes ------------------//

// Create a subtask under a task
router
  .route("/:projectId/t/:taskId/subtasks")
  .post( //create a subtask
    validateProjectPermission([
      UserRolesEnum.ADMIN,
      UserRolesEnum.PROJECT_ADMIN,
    ]),
    createTheSubTask(),
    validate,
    createSubTask,
);
  

router
  .route("/:projectId/st/:subTaskId") //this projectId & subTaskId names will be stored in "req.params" so ensure while taking values/destructuring the req.params you use these names only, if you use different name it will return null & also this is same for all.  
  .put(
    // Update a subtask
    validateProjectPermission(AvailableUserRole),
    updateTheSubTask(),
    validate,
    updateSubTask,
  )
  .delete(
    validateProjectPermission([
      UserRolesEnum.ADMIN,
      UserRolesEnum.PROJECT_ADMIN,
    ]),
    deleteSubTask,
  ); //delete a subtask

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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**What is __v?
__v is the version key in Mongoose.
It’s used for internal versioning of documents.
By default, every time you update a document using certain Mongoose methods (save, findOneAndUpdate, etc.), Mongoose increments this __v value.

🛠 Why does it exist?
It’s mainly used for optimistic concurrency control (OCC).
If two processes try to update the same document at the same time, Mongoose can use __v to detect conflicts.

Example:

Process A reads doc (__v: 0)
Process B reads doc (__v: 0)
A updates → doc becomes __v: 1
B tries to update → Mongoose sees mismatch (expected 0 but found 1) → prevents overwriting the new data.
✅ Example

A fresh document:

{
  "_id": "651234abcd",
  "title": "My Task",
  "__v": 0
}


After an update:

{
  "_id": "651234abcd",
  "title": "My Task Updated",
  "__v": 1
}

🔧 Can you remove it?
Yes, if you don’t want it:
Disable versionKey in schema:

const subTaskSchema = new Schema({
  title: String
}, { versionKey: false });

Then documents won’t have __v.
////////////////////////////////////////////////////////
Or rename it (if you prefer a different field name):

const subTaskSchema = new Schema({
  title: String
}, { versionKey: "version" }); */