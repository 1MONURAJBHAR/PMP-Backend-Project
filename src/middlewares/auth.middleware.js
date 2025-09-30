import { User } from "../models/user.model.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import jwt from "jsonwebtoken";


//we have to give the access token with each single request from client to server. 
//we will send the refresh token only when the access token is expired,for refreshing the access token. 
export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");
    //Mobile apps doesn't have the cookie thats why they always send through the bearer token in Authorization header --> "Authorization Bearer accessToken"
  
  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    //Appending the request so that it has user info
    req.user = user;
    next(); // next()-->hop on to next middleware or just proceed with the controller itself.
  } catch (error) {
    throw new ApiError(401, "Invalid access token");
  }
});

export const validateProjectPermission = (roles = []) => {
  asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;

    if (!projectId) {
      throw new ApiError(400, "project id is missing");
    }

    const project = await ProjectMember.findOne({
      project: new mongoose.Types.ObjectId(projectId),
      user: new mongoose.Types.ObjectId(req.user._id),
    });

    if (!project) {
      throw new ApiError(400, "project not found");
    }

    const givenRole = project?.role;

    req.user.role = givenRole;

    if (!roles.includes(givenRole)) {
      throw new ApiError(
        403,
        "You do not have permission to perform this action",
      );
    }

    next();
  });
};


import { AvailableTaskStatues } from "../constants/taskStatusEnum.js"; // adjust path

// Middleware to validate task status
export const validateTaskStatus = (req, res, next) => {
  const { status } = req.body;

  // Check if status is provided
  if (!status) {
    return res.status(400).json({ message: "Task status is required" });
  }

  // Check if status is valid
  if (!AvailableTaskStatues.includes(status)) {
    return res.status(400).json({
      message: `Invalid task status. Allowed values: ${AvailableTaskStatues.join(", ")}`,
    });
  }

  // If valid, move to next middleware/controller
  next();
};
