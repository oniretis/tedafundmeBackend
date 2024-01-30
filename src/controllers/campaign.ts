import { Request, Response } from "express";
import { handleError } from "../utils/errorHandler";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import Campaign from "../models/campaign";
import Donor from "../models/donor";
import User from "../models/user";
import { sendEmail } from "../utils";

export const createCampaign = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, story, goal, location, coverMedia, category } = req.body;

    const campaign = new Campaign({
      name,
      story,
      goal,
      location,
      coverMedia,
      category,
      donors: [],
      currentGoal: 0,
      userId: req.user.userId,
    });
    await campaign.save();

    res
      .status(201)
      .json({ message: "Campaign created successfully", campaign });
  } catch (error) {
    handleError(res, 500, `Internal server error: ${error}`);
    return;
  }
};

export const getAllCampaigns = async (req: Request, res: Response) => {
  try {
    const campaigns = await Campaign.find();

    res.status(200).json({ campaigns });
  } catch (error) {
    handleError(res, 500, `Internal server error: ${error}`);
    return;
  }
};

export const getUserCampaigns = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const campaigns = await Campaign.find({ userId: req.user.userId });

    res.status(200).json({ campaigns });
  } catch (error) {
    handleError(res, 500, `Internal server error: ${error}`);
    return;
  }
};

export const getSingleCampaign = async (req: Request, res: Response) => {
  try {
    const campaign = await Campaign.findById(req.params.campaignId);

    if (!campaign) {
      handleError(
        res,
        404,
        `Campaign not found, prolly cause it doesn't exists or has been deleted`
      );
      return;
    }
    res.status(200).json({ campaign });
  } catch (error) {
    handleError(res, 500, `Internal server error: ${error}`);
    return;
  }
};

export const editCampaign = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const campaign = await Campaign.findById(req.params.campaignId);
    if (!campaign) {
      handleError(
        res,
        404,
        `Campaign not found, prolly cause it doesn't exists or has been deleted`
      );
      return;
    }

    if (req.user.userId !== campaign.userId) {
      handleError(res, 403, "You are not allowed to do that!");
      return;
    }

    // * Update the campaign properties as needed
    campaign.name = req.body.name || campaign.name;
    campaign.story = req.body.story || campaign.story;
    campaign.goal = req.body.goal || campaign.goal;
    campaign.category = req.body.category || campaign.category;
    campaign.location = req.body.location || campaign.location;
    campaign.currentGoal = req.body.currentGoal || campaign.currentGoal;
    campaign.coverMedia = req.body.coverMedia || campaign.coverMedia;

    const updatedCampaign = await campaign.save();

    res
      .status(200)
      .json({ message: "edited campaign successfully", updatedCampaign });
  } catch (error) {
    handleError(res, 500, `Internal server error: ${error}`);
    return;
  }
};

export const deleteCampaign = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const campaign = await Campaign.findById(req.params.campaignId);
    if (!campaign) {
      handleError(
        res,
        404,
        `Campaign not found, prolly cause it doesn't exists or has been deleted`
      );
      return;
    }

    if (req.user.userId !== campaign.userId) {
      handleError(res, 403, "You are not allowed to do that!");
      return;
    }

    if (campaign.donors.length > 0) {
      await Donor.deleteMany({
        campaignId: campaign._id,
      });
    }
    // * Delete the campaign
    await campaign.deleteOne();

    res.status(204).send();
  } catch (error) {
    handleError(res, 500, `Internal server error: ${error}`);
    return;
  }
};

export const donateToCampaign = async (req: Request, res: Response) => {
  try {
    const { amount, email, name } = req.body;

    const campaign = await Campaign.findById(req.params.campaignId);
    if (!campaign) {
      handleError(
        res,
        404,
        `Campaign not found, prolly cause it doesn't exists or has been deleted`
      );
      return;
    }
    // * create donor
    const donor = new Donor({
      name,
      email,
      amount,
      campaignId: campaign._id,
    });

    // * update campaign current goal
    const donatedCampaign = await campaign.updateOne({
      currentGoal: campaign.currentGoal + amount,
    });

    // * get campaign user
    const user = await User.findById(campaign.userId);

    // * send email to donor saying thank you & to user updating him
    await sendEmail(
      donor.email,
      `Thanks for believing in ${campaign.name} goal`,
      `You just donated ${donor.amount} successfully to ${campaign.name} goal`
    );
    await sendEmail(
      user?.email as string,
      `Hurray! ${donor.name} just donated ${donor.amount} to your campaign ${campaign.name}.`,
      `Hurray! ${donor.name} just donated ${donor.amount} to your campaign ${campaign.name}.`
    );

    res.status(200).json({
      message: `Donated ${amount} to ${campaign.name} successfully`,
      donor,
      donatedCampaign,
    });
  } catch (error) {
    handleError(res, 500, `Internal server error: ${error}`);
    return;
  }
};
