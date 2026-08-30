import express from 'express';
import { handleEvent } from '../controllers/eventController.js';

const router = express.Router();

router.post('/', handleEvent);
router.post('/product-view', (req, res, next) => {
  req.body.eventType = 'product_viewed';
  handleEvent(req, res, next);
});
router.post('/cart-update', (req, res, next) => {
  req.body.eventType = 'cart_updated';
  handleEvent(req, res, next);
});
router.post('/payment-attempt', (req, res, next) => {
  req.body.eventType = 'payment_attempted';
  handleEvent(req, res, next);
});
router.post('/payment-failure', (req, res, next) => {
  req.body.eventType = 'payment_failed';
  handleEvent(req, res, next);
});
router.post('/purchase', (req, res, next) => {
  req.body.eventType = 'payment_success';
  handleEvent(req, res, next);
});
router.post('/exit-intent', (req, res, next) => {
  req.body.eventType = 'exit_intent';
  handleEvent(req, res, next);
});

export default router;
