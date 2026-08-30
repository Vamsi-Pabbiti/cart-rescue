import express from 'express';
import { getCustomers, getCustomerById, updateCustomerConsent } from '../controllers/customerController.js';

const router = express.Router();

router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.patch('/:id', updateCustomerConsent);

export default router;
