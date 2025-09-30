import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";

const getProjects = asyncHandler(async (req, res) => {
  const projects = await ProjectMember.aggregate([
    {
      $match: {
        //Find all ProjectMember documents from ProjectMember collections where (user = req.user._id)
        user: new mongoose.Types.ObjectId(req.user._id), //Note that one person can be assigned to multiple projects
      },
    },
    {
      $lookup: {
        //We will get the project document on each projectmember document in the projects field, obtained from above match
        from: "projects",
        localField: "project",
        foreignField: "_id",
        as: "projects",
        pipeline: [
          //Apply pipeline on project document to count how many people are assigned to this project
          {
            $lookup: {
              //Count all the members assigned to this project
              from: "projectmembers", //we can get multiple projectMember documents because on the same project multiple people can work with different roles.
              localField: "_id",
              foreignField: "project",
              as: "projectmembers", //In project document a field "projectmembers" is added which contains all the projectMember documents whose "projectId" is matched with projects "id"
            },
          },
          {
            $addFields: {
              members: { //dynamically creating this member field.
                $size: "$projectmembers",
              },
            },
          },
        ],
      },
    },
    {
      $unwind: "$project", //Convert project array to object
    },
    {
      $project: {
        //Inside ProjectMember documents only take "project" field and in project field keep these--> project._id, project.name, project.description, project.members, project.createdAt, project.createdBy and the role from ProjectMember.
        project: {
          //Project all these fields from "project object" inside projectMember document.
          _id: 1,
          name: 1,
          description: 1,
          members: 1,
          createdAt: 1,
          createdBy: 1,
        },
        role: 1, //project this field from ProjectMember document
        _id: 0, //Don't show the id of ProjectMember document
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, projects, "Projects fetched successfully"));
});

const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project fetched successfully"));
});

const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  //Project is created with name, description, and createdBy.
  const project = await Project.create({
    name,
    description,
    createdBy: new mongoose.Types.ObjectId(req.user._id),
  });

  //we also have to add who created the project , the project id and role of creater.
  await ProjectMember.create({
    user: new mongoose.Types.ObjectId(req.user._id),
    project: new mongoose.Types.ObjectId(project._id),
    role: UserRolesEnum.ADMIN,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, project, "Project created Successfully"));
});

const updateProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const { projectId } = req.params;

  const project = await Project.findByIdAndUpdate(
    projectId,
    {
      name,  //update the name and description
      description,
    },
    { new: true }, //return the new document
  );

  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project updated successfully"));
});

const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findByIdAndDelete(projectId);
  if (!project) {  //This conatains the deleted project
    throw new ApiError(404, "Project not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project deleted successfully"));
});

const addMembersToProject = asyncHandler(async (req, res) => {
  const { email, role } = req.body; //Extracts the email and role from the request body.
  const { projectId } = req.params; //Extracts projectId from the request URL (like /projects/:projectId/members).
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User does not exists");
  }

  await ProjectMember.findByIdAndUpdate(
    //or u can use "findOneAndUpdate"
    {
      user: new mongoose.Types.ObjectId(user._id), //This searches for a document in the ProjectMember collection that matches the combination of this user and this project.If found, it will update the document with the new role.
      project: new mongoose.Types.ObjectId(projectId),
    }, //If the user is already a project member, their role will be updated.
    {
      //If the user is not yet a project member, a new membership document will be created.
      user: new mongoose.Types.ObjectId(user._id),
      project: new mongoose.Types.ObjectId(projectId),
      role: role,
    },
    {
      new: true, // // return the updated document instead of the old one
      upsert: true, //// if no matching doc is found, create a new one
    },
  );

  return res
    .status(201)
    .json(new ApiResponse(201, {}, "Project member added successfully"));
});


const getProjectMembers = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const projectMembers = await ProjectMember.aggregate([
    {//First stage
      $match: { //we will get many ProjectMember documents here, whose project fields "id" is same as "projectId", because there are many users/people working on same project,so for each user/prople diffrernt ProjectMember document will be created.
        project: new mongoose.Types.ObjectId(projectId),
      },
    },
     //Now we have only that projectMember document whose project fields "id" is same as "projectId"
    {//This will lookup on each project member document one by one.
      $lookup: { //Applying this lookup on each ProjectMember document 
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
        pipeline: [
          {   //Project only these fields from user documents 
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
        user: {  //convert user field from array to an object in ProjectMember document 
          $arrayElemAt: ["$user", 0],//means select only that element in user array whose is at 0th index.
        },
      },
    },
    {
      $project: { //Project these fields in projectMember document 
        project: 1,
        user: 1,
        role: 1,
        createdAt: 1,
        updatedAt: 1,
        _id: 0,  //Do not print the id of projectMember document.
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, projectMembers, "Project members fetched"));
});

const updateMemberRole = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;
  const { newRole } = req.body;

  if (!AvailableUserRole.includes(newRole)) {
    throw new ApiError(400, "Invalid Role");
  }

  //Extracting the projectMember document from the projectMember collection whose (project === projectId) & (user === userId).
  let projectMember = await ProjectMember.findOne({
    project: new mongoose.Types.ObjectId(projectId),
    user: new mongoose.Types.ObjectId(userId),
  });

  if (!projectMember) {
    throw new ApiError(400, "Project member not found");
  }
 
  //Update the projectMember document with newRole
  projectMember = await ProjectMember.findByIdAndUpdate(
    projectMember._id,
    {
      role: newRole,
    },
    { new: true },
  );

  if (!projectMember) {
    throw new ApiError(400, "Project member not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        projectMember,
        "Project member role updated successfully",
      ),
    );
});

const deleteMember = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;

  let projectMember = await ProjectMember.findOne({
    project: new mongoose.Types.ObjectId(projectId),
    user: new mongoose.Types.ObjectId(userId),
  });

  if (!projectMember) {
    throw new ApiError(400, "Project member not found");
  }

  //This projectMember holds the deleted document
  projectMember = await ProjectMember.findByIdAndDelete(projectMember._id);

  if (!projectMember) {
    throw new ApiError(400, "Project member not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        projectMember,
        "Project member deleted successfully",
      ),
    );
});

export {
  addMembersToProject,
  createProject,
  deleteMember,
  getProjects,
  getProjectById,
  getProjectMembers,
  updateProject,
  deleteProject,
  updateMemberRole,
};


/**Function Purpose
getProjectMembers → fetch all members of a given project, along with their user details (name, avatar, etc.) and their role in the project.
Step-by-step breakdown of the pipeline

1. $match
{
  $match: {
    project: new mongoose.Types.ObjectId(projectId),
  },
}


Only take ProjectMember documents where project == projectId.
So now we’re only looking at members of that specific project.

2. $lookup (join with users)
{
  $lookup: {
    from: "users",
    localField: "user",
    foreignField: "_id",
    as: "user",
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
}


Joins each ProjectMember document with the users collection.

Matches:
ProjectMember.user → User._id
Result goes into an array called user.
The pipeline ensures only selected fields (_id, username, fullName, avatar) are brought in.

So now each ProjectMember looks like:

{
  "project": "P1",
  "user": [
    { "_id": "U1", "username": "alice", "fullName": "Alice Doe", "avatar": "alice.png" }
  ],
  "role": "admin"
}

3. $addFields
{
  $addFields: {
    user: {
      $arrayElemAt: ["$user", 0],
    },
  },
}


Since $lookup always returns an array, this takes the first element (index 0).
So "user" field changes from an array → a single object.
Now it looks like:

{
  "project": "P1",
  "user": { "_id": "U1", "username": "alice", "fullName": "Alice Doe", "avatar": "alice.png" },
  "role": "admin"
}

4. $project
{
  $project: {
    project: 1,
    user: 1,
    role: 1,
    createdAt: 1,
    updatedAt: 1,
    _id: 0,
  },
}


Keeps only:
project (project ID),
user (user info object),
role (like admin, member),
createdAt, updatedAt.
Removes MongoDB’s default _id.

Final result example:

[
  {
    "project": "P1",
    "user": {
      "_id": "U1",
      "username": "alice",
      "fullName": "Alice Doe",
      "avatar": "alice.png"
    },
    "role": "admin",
    "createdAt": "2025-09-20T08:00:00Z",
    "updatedAt": "2025-09-21T10:00:00Z"
  },
  {
    "project": "P1",
    "user": {
      "_id": "U2",
      "username": "bob",
      "fullName": "Bob Smith",
      "avatar": "bob.png"
    },
    "role": "member",
    "createdAt": "2025-09-20T08:00:00Z",
    "updatedAt": "2025-09-21T10:00:00Z"
  }
]

⚡ Why it looks tricky
$lookup always returns an array, even if it’s a single match → that’s why $arrayElemAt is needed.
You’re essentially joining tables in SQL, but in MongoDB style:
ProjectMember = relation table
User = user info table
$project at the end is just cleaning up the fields.

✅ In short:
This pipeline gets all members of a project, fetches their user profile info, and returns a clean object with projectId, userInfo, role, createdAt, updatedAt. */

//********************************************************************************************************************************************************************************************************************************************************************************************************************* */
/**ChatGPT said:
Perfect 👍 this is almost the same idea as your getProjectMembers, but reversed — instead of finding members inside a project, this one finds all projects a user belongs to.
Let’s break it step by step.

📌 Function Purpose
getProjects → fetch all projects where the logged-in user is a member, including:
Project details
Number of members in each project
The user’s role in that project

Step-by-step aggregation
1. $match
{
  $match: {
    user: new mongoose.Types.ObjectId(req.user._id),
  },
}


Start from ProjectMember collection.
Get all documents where the user field equals the current user’s _id.
One user may belong to multiple projects → so this gives you all their memberships.

2. $lookup (join with projects)
{
  $lookup: {
    from: "projects",
    localField: "project",
    foreignField: "_id",
    as: "projects",
    pipeline: [
      {
        $lookup: {
          from: "projectmembers",
          localField: "_id",
          foreignField: "project",
          as: "projectmembers",
        },
      },
      {
        $addFields: {
          members: { $size: "$projectmembers" },
        },
      },
    ],
  },
}


For each ProjectMember document, join with the projects collection.
localField: "project" → the project ID in ProjectMember
foreignField: "_id" → the project’s primary key
as: "projects" → result is an array (but usually of length 1).

Inside this lookup:
Another $lookup pulls all ProjectMember docs belonging to that project.
$addFields.members counts them → giving total number of project members.

So now each ProjectMember doc looks like:

{
  "user": "U1",
  "project": "P1",
  "role": "admin",
  "projects": [
    {
      "_id": "P1",
      "name": "CRM",
      "description": "Manage customers",
      "createdBy": "U2",
      "createdAt": "...",
      "projectmembers": [ ... ],
      "members": 5
    }
  ]
}

3. $unwind
{
  $unwind: "$project"
}


⚠️ Bug here: You wrote as: "projects" in $lookup, so the joined data is under "projects" (plural). But here you’re unwinding "project" (singular).
If you keep it as "project", it will return nothing.
If corrected to:
{ $unwind: "$projects" }


then it will flatten the projects array into a single object.

So after fixing, it becomes:

{
  "user": "U1",
  "project": "P1",
  "role": "admin",
  "projects": {
    "_id": "P1",
    "name": "CRM",
    "description": "Manage customers",
    "members": 5,
    "createdAt": "...",
    "createdBy": "U2"
  }
}

4. $project
{
  $project: {
    project: {
      _id: 1,
      name: 1,
      description: 1,
      members: 1,
      createdAt: 1,
      createdBy: 1,
    },
    role: 1,
    _id: 0,
  },
}


Keeps only:
From the project field → id, name, description, members count, createdAt, createdBy
From ProjectMember → role
Removes MongoDB’s _id
Final cleaned object looks like:

{
  "project": {
    "_id": "P1",
    "name": "CRM",
    "description": "Manage customers",
    "members": 5,
    "createdAt": "2025-09-01T10:00:00Z",
    "createdBy": "U2"
  },
  "role": "admin"
}

✅ Final Output (for a user in 2 projects)
[
  {
    "project": {
      "_id": "P1",
      "name": "CRM",
      "description": "Manage customers",
      "members": 5,
      "createdAt": "2025-09-01T10:00:00Z",
      "createdBy": "U2"
    },
    "role": "admin"
  },
  {
    "project": {
      "_id": "P2",
      "name": "Task Manager",
      "description": "Track tasks",
      "members": 3,
      "createdAt": "2025-09-10T08:00:00Z",
      "createdBy": "U1"
    },
    "role": "member"
  }
]

⚡ In short
$match: get only ProjectMember docs for this user
$lookup: fetch the project each membership belongs to, plus count members
$unwind: flatten the joined project array
$project: clean up → return only project details + user’s role */