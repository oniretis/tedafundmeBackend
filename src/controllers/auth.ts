import { Request, Response } from "express";
import User, { TUser } from "../models/user";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { handleError } from "../utils/errorHandler";
import { generateOtp, sendEmail } from "../utils";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

const generateToken = (user: TUser): string => {
  return jwt.sign(
    { email: user.email, userId: user._id },
    process.env.JWT_SECRET as string,
    { expiresIn: "4 days" }
  );
};

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { fullName, password, email, phoneNumber } = req.body;

    // * check if user exists
    const existingUser = await User.findOne({
      email,
    });
    if (existingUser) {
      handleError(res, 400, "User already exists");
      return;
    }
    // * check for duplicate number
    const existingPhoneNumber = await User.findOne({ phoneNumber });
    if (existingPhoneNumber) {
      handleError(res, 400, "User with phone number already exists");
      return;
    }

    // * hash password
    const hashPassword = await bcrypt.hash(password, 16);

    const user = new User({
      fullName,
      email,
      password: hashPassword,
      phoneNumber,
      otp: generateOtp(),
      isVerified: false,
    });
    await user.save();

    // * send verification mail
    await sendEmail(
      email,
      "Verifcation Code",
      `Enter ${user.otp} to verify your account`
    );

    res.status(201).json({
      message: "User registration successful",
    });
  } catch (error) {
    handleError(res, 500, `Internal Server Error", error: ${error}`);
    return;
  }
};

export const verifyUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email, otp });

    if (!user) {
      handleError(res, 400, "Invalid OTP code");
      return;
    }

    user.isVerified = true;
    user.otp = null;
    await user.save();

    res.json({ message: "User verified successfully" });
  } catch (error) {
    handleError(res, 500, `Internal Server Error", error: ${error}`);
    return;
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // * check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      handleError(res, 401, "user does not exist");
      return;
    }

    // * confirms user is verified
    if (!user?.isVerified) {
      handleError(res, 401, "user not verified, verify your account to login");
      return;
    }

    // * checks if password is valid
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      handleError(res, 401, "Password is not correct");
      return;
    }

    const token = generateToken(user);

    res.json({ token });
  } catch (error) {
    handleError(res, 500, `Internal Server Error", error: ${error}`);
    return;
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;
    // * check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      handleError(res, 404, "User not found");
      return;
    }
    // * create new otp and save
    user.otp = generateOtp();
    user.save();

    // * send otp verification email
    await sendEmail(
      email,
      "Verification Code",
      `Enter ${user.otp} to verify your reset password action`
    );

    res.status(200).json({
      message: "Verification email sent",
    });
  } catch (error) {
    handleError(res, 500, `Internal Server Error", error: ${error}`);
    return;
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, otp, newPassword, confirmPassword } = req.body;

  // * check if otp is valid
  const user = await User.findOne({ email, otp });
  if (!user) {
    handleError(res, 400, "Invalid OTP code");
    return;
  }

  //  * check if passwords match
  if (newPassword !== confirmPassword) {
    handleError(res, 400, "Passwords don't match");
    return;
  }

  // * hash new password and save
  const hashPassword = await bcrypt.hash(newPassword, 16);

  user.password = hashPassword;
  user.otp = null;

  user.save();

  res.status(200).json({ message: "Password reset successful" });
  try {
  } catch (error) {
    handleError(res, 500, `Internal Server Error", error: ${error}`);
    return;
  }
};

export const getUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      handleError(res, 401, "user not found");
      return;
    }

    const userDetails = await User.findOne({ email: user.email }).select(
      "-password -otpCode -isVerified"
    );

    if (!userDetails) {
      handleError(res, 404, "User not found");
      return;
    }
    res.json({ user: userDetails });
  } catch (error) {
    handleError(res, 500, `Internal Server Error", error: ${error}`);
    return;
  }
};
