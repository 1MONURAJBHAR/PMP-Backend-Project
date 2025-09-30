import mongoose, { Schema } from "mongoose";
import { AvailableTaskStatues, TaskStatusEnum } from "../utils/constants.js";

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
     type:String,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: AvailableTaskStatues,
      default: TaskStatusEnum.TODO,
    },
    attachments: {
      type: [
        {
          url: String,
          mimetype: String,
          size: Number,
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

export const Task = mongoose.model("Task", taskSchema);


/**What runValidators: true does
By default, findByIdAndUpdate (and findOneAndUpdate) does not run schema validation.
If you enable runValidators: true, only the fields being updated are validated against the schema.
 It does not re-validate the whole document every time.

✅ Example with your schema
const updatedTask = await Task.findByIdAndUpdate(
  taskId,
  { status: "INVALID_STATUS" }, // wrong value
  { new: true, runValidators: true }
);


Schema says status must be one of AvailableTaskStatues.
"INVALID_STATUS" is not in that enum.
❌ ValidationError will be thrown.

const updatedTask = await Task.findByIdAndUpdate(
  taskId,
  { description: "New desc" }, // valid
  { new: true, runValidators: true }
);


Schema allows description: String.

✅ Update works fine.
Other fields (title, project, etc.) won’t be re-validated since they’re not being modified.

⚠️ Important things to know
required: true rules are checked only when you set/update that field.

Example: If title is already in DB, and you update only status, it won’t complain about title.
But if you try to set title: "" → ❌ validation error.
enum validation runs only on status when it’s updated.
Typo in your model:
export const Taks = mongoose.model("Task", taskSchema);


Should be:
export const Task = mongoose.model("Task", taskSchema);

✅ Conclusion
No, it won’t throw errors for all fields “again and again”.
It only validates the fields you are updating.
Errors only appear if you try to save invalid values (like wrong status, missing required title, etc.). */