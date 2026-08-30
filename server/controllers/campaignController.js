import Campaign from '../models/Campaign.js';

export const getCampaigns = async (req, res, next) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    next(error);
  }
};

export const createCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.create(req.body);
    res.status(201).json(campaign);
  } catch (error) {
    next(error);
  }
};

export const updateCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json(campaign);
  } catch (error) {
    next(error);
  }
};

export const deleteCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    next(error);
  }
};
