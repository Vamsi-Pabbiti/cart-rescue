import Dataset from '../models/Dataset.js';
import { processCSVDataset } from '../services/datasetService.js';

export const getDatasets = async (req, res, next) => {
  try {
    const datasets = await Dataset.find().sort({ uploadedAt: -1 });
    res.json(datasets);
  } catch (error) {
    next(error);
  }
};

export const uploadDataset = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a CSV dataset file' });
    }

    const record = await processCSVDataset(req.file.path, req.file.originalname);
    res.status(201).json({
      message: 'Dataset imported and processed successfully!',
      dataset: record
    });
  } catch (error) {
    next(error);
  }
};
