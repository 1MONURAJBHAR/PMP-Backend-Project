import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { Task } from "../models/task.models.js";
import { Subtask } from "../models/subtask.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";
import { pipeline } from "nodemailer/lib/xoauth2/index.js";

const getTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  const tasks = await Task.find({
    project: new mongoose.Types.ObjectId(projectId),
  }).populate("assignedTo", "avatar username fullName");

  return res
    .staus(201)
    .json(new ApiResponse(201, tasks, "Task fetched successfully"));
});

const createTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, status } = req.body;
  const { projectId } = req.params;
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  const files = req.files || [];

  const attachments = files.map((file) => {
    return {
      url: `${process.env.SERVER_URL}/images/${file.originalname}`,
      mimetype: file.mimetype,
      size: file.size,
    };
  });

  const task = await Task.create({
    title,
    description,
    project: new mongoose.Types.ObjectId(projectId),
    assignedTo: assignedTo
      ? new mongoose.Types.ObjectId(assignedTo)
      : undefined,
    status,
    assignedBy: new mongoose.Types.ObjectId(req.user._id),
    attachments,
  });

  return res
    .staus(201)
    .json(new ApiResponse(201, task, "Task created successfully"));
});

const getTaskById = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(taskId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "assignedTo",
        foreignField: "_id",
        as: "assignedTo",
        pipeline: [
          {
            _id: 1,
            username: 1,
            fullName: 1,
            avatar: 1,
          },
        ],
      },
    },
    {
      $lookup: {
        from: "subtasks",
        localField: "_id",
        foreignField: "task",
        as: "subtasks",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "createdBy",
              foreignField: "_id",
              as: "createdBy",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              createdBy: {
                $arrayElemAt: ["$createdBy", 0],
              },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        assignedTo: {
          $arrayElemAt: ["$assignedTo", 0],
        },
      },
    },
  ]);

  if (!task || task.length === 0) {
    throw new ApiError(404, "Task not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, task[0], "Task fetched successfully"));
});

const updateTask = asyncHandler(async (req, res) => {
  //chai
});
const deleteTask = asyncHandler(async (req, res) => {
  //chai
});
const createSubTask = asyncHandler(async (req, res) => {
  //chai
});
const updateSubTask = asyncHandler(async (req, res) => {
  //chai
});
const deleteSubTask = asyncHandler(async (req, res) => {
  //chai
});

export {
  createSubTask,
  createTask,
  deleteTask,
  deleteSubTask,
  getTaskById,
  getTasks,
  updateSubTask,
  updateTask,
};

/**📌 Purpose
Fetch a task by its ID, along with:
The user it is assigned to (assignedTo)
Its subtasks
For each subtask, the user who created it (createdBy)
Step-by-Step Pipeline
1. $match
{
  $match: {
    _id: new mongoose.Types.ObjectId(taskId),
  },
}


Start with the Task collection.
Find the task whose _id matches the taskId from the request params.

2. $lookup (assignedTo → User)
{
  $lookup: {
    from: "users",
    localField: "assignedTo",
    foreignField: "_id",
    as: "assignedTo",
    pipeline: [
      {
        _id: 1,
        username: 1,
        fullName: 1,
        avatar: 1,
      },
    ],
  },
}


Joins the task’s assignedTo field (which is a user _id) with the users collection.
The result is stored in an array called assignedTo.

⚠️ Here you forgot $project inside the pipeline. It should be:

pipeline: [
  {
    $project: {
      _id: 1,
      username: 1,
      fullName: 1,
      avatar: 1,
    },
  },
],


After this, assignedTo looks like:

[
  {
    "_id": "U1",
    "username": "alice",
    "fullName": "Alice Doe",
    "avatar": "alice.png"
  }
]

3. $lookup (subtasks → with creator info)
{
  $lookup: {
    from: "subtasks",
    localField: "_id",
    foreignField: "task",
    as: "subtasks",
    pipeline: [
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdBy",
          pipeline: [
            {
              $project: {
                _id: 1,
                username: 1,
                fullName: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          createdBy: {
            $arrayElemAt: ["$createdBy", 0],
          },
        },
      },
    ],
  },
}


Joins the task _id with the subtasks.task field → fetches all subtasks belonging to this task.

For each subtask:
$lookup joins with the users collection to get details of the createdBy user.
$addFields.createdBy takes the first element (since $lookup gives an array) → converts it to a single object.
Now each subtask looks like:

{
  "_id": "S1",
  "title": "Fix bug",
  "task": "T1",
  "createdBy": {
    "_id": "U2",
    "username": "bob",
    "fullName": "Bob Smith",
    "avatar": "bob.png"
  }
}

4. $addFields (flatten assignedTo)
{
  $addFields: {
    assignedTo: {
      $arrayElemAt: ["$assignedTo", 0],
    },
  },
}


Since $lookup always returns an array, we take the first element and make assignedTo a single object.
Now the task looks like:

{
  "_id": "T1",
  "title": "Build dashboard",
  "assignedTo": {
    "_id": "U1",
    "username": "alice",
    "fullName": "Alice Doe",
    "avatar": "alice.png"
  },
  "subtasks": [
    {
      "_id": "S1",
      "title": "Fix bug",
      "createdBy": {
        "_id": "U2",
        "username": "bob",
        "fullName": "Bob Smith",
        "avatar": "bob.png"
      }
    },
    {
      "_id": "S2",
      "title": "Write tests",
      "createdBy": {
        "_id": "U3",
        "username": "charlie",
        "fullName": "Charlie Lee",
        "avatar": "charlie.png"
      }
    }
  ]
}

5. Final check
if (!task || task.length === 0) {
  throw new ApiError(404, "Task not found");
}


If no task was found → throw 404.

6. Return response
return res
  .status(200)
  .json(new ApiResponse(200, task[0], "Task fetched successfully"));


Returns the first element of the aggregation result (since $match by ID returns only 1 document).

✅ In short

This pipeline:
Finds the task by ID.
Looks up the assigned user → attaches their details.
Looks up all subtasks → attaches creator details for each subtask.
Flattens arrays (assignedTo and createdBy) into objects.
Returns a fully hydrated task object with subtasks and user info. */