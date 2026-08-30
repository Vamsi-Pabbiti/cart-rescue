import express from 'express';
import { getCampaigns, createCampaign, updateCampaign, deleteCampaign } from '../controllers/campaignController.js';

const router = express.Router();

router.get('/', getCampaigns);
router.post('/', createCampaign);
router.patch('/:id', updateCampaign);
router.delete('/:id', deleteCampaign);

export default router;
