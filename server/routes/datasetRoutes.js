import express from 'express';
import multer from 'multer';
import { getDatasets, uploadDataset } from '../controllers/datasetController.js';

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.get('/', getDatasets);
router.post('/upload', upload.single('file'), uploadDataset);
router.post('/import', upload.single('file'), uploadDataset);

export default router;
