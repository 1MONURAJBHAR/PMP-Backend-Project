import mongoose, { Schema } from "mongoose";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";

const projectMemberSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    role: {
      type: String,
      enum: AvailableUserRole,
      default: UserRolesEnum.MEMBER,
    },
  },
  { timestamps: true },
);

/**enum: AvailableUserRole → only allows values that exist inside AvailableUserRole.
If you try to save something outside this enum, Mongoose will throw a validation error. */

export const ProjectMember = mongoose.model(
  "ProjectMember",
  projectMemberSchema,
);
