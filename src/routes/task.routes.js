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
} from "./validators/index.js";


const router = Router();
router.use(verifyJWT);

import { upload } from "../middlewares/multer.middleware.js";

//------------------ Task Routes ------------------//

// Get all tasks of a project
router.get("/:projectId",  getTasks);

// Get single task by ID
router.get(
  "/task/:taskId",
  validateProjectPermission(AvailableUserRole),
  getTaskById,
);

// Create a new task
router.post(
  "/:projectId",
    validateProjectPermission([UserRolesEnum.ADMIN]),
  createTheTasks(),
  validate,
  upload.array("attachments"), // field name is "attachments"
  createTask,
);

// Update a task
router.put(
  "/task/:taskId",
    validateProjectPermission([UserRolesEnum.ADMIN]),
  validateTaskStatus,
  UpdateTheTask(),
  validate,
  updateTask,
);

// Delete a task
router.delete("/task/:taskId", validateProjectPermission([UserRolesEnum.ADMIN]), validateTaskStatus, deleteTask);

//------------------ Subtask Routes ------------------//

// Create a subtask under a task
router.post(
  "/subtask/:taskId",
  validateProjectPermission([UserRolesEnum.PROJECT_ADMIN]),
   createTheSubTask(),
  validate,
  createSubTask,
);

// Update a subtask
router.put(
  "/subtask/:subtaskId",
  validateProjectPermission([UserRolesEnum.PROJECT_ADMIN]),
  validateTaskStatus,
  updateTheSubTask(),
  validate,
  updateSubTask,
);

// Delete a subtask
router.delete(
  "/subtask/:subtaskId",
    validateProjectPermission([UserRolesEnum.PROJECT_ADMIN]),
  validateTaskStatus,
  deleteSubTask,
);

export default router;
