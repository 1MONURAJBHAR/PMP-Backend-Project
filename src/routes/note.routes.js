import express from "express"
//const router = express.Router();
//**************or directly************** */
import { Router } from "express";

import {
    getProjectNotes,
    createProjectNote,
    getProjectNoteById,
    updateProjectNote,
    deleteProjetNote
} from "../controllers/note.controllers.js"

import { validateContentNote } from "../validators/index.js";
import { verifyJWT, validateProjectPermission, validateTaskStatus } from "../middlewares/auth.middleware.js"
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";
import { validate } from "../middlewares/validator.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/:projectId")
    .get(validateProjectPermission(AvailableUserRole), getProjectNotes)
    .post(validateProjectPermission([UserRolesEnum.ADMIN]), validateContentNote(), validate, createProjectNote);

router
  .route("/:projectId/n/:noteId")
  .get(validateProjectPermission(AvailableUserRole), getProjectNoteById)
  .put(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    validateContentNote(),
    validate,
    updateProjectNote,
  )
  .delete(validateProjectPermission([UserRolesEnum.ADMIN]), deleteProjetNote);

export default router;

   /**Router() → creates a mini Express app for grouping routes.
   router.use(verifyJWT) → protects all routes in this router by requiring JWT authentication.
   router.route() → groups multiple HTTP methods for the same route path. */
