import { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { handleError } from "../utils/errorHandler";

export type AuthenticatedRequest = Request & {
  user?: any;
};

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.header("Authorization");

  if (!token) {
    handleError(res, 401, "Unauthorized! Token not provided");
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (error, user) => {
    if (error) {
      handleError(res, 403, "Forbidden: Invalid Token");
      return;
    }
    req.user = user;

    next();
  });
};
