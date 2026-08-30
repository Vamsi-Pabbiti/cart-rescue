import { ABANDONMENT_REASONS } from '../config/constants.js';

export function diagnoseAbandonment(sessionData, riskAssessment) {
  const {
    paymentAttempts = 0,
    paymentFailures = 0,
    cartValue = 0,
    shippingCost = 0,
    deliveryDays = 3,
    codAvailable = true,
    productViews = 0,
    pageTransitions = 0,
    checkoutStarted = false,
    timeOnPage = 0,
    events = []
  } = sessionData;

  const { riskScore = 0 } = riskAssessment || {};

  if (riskScore <= 25) {
    return {
      primaryReason: ABANDONMENT_REASONS.LOW_INTENT,
      confidence: 0.88,
      explanation: 'Customer is browsing normally with low risk of cart abandonment.',
      signals: ['Low risk score (<=25)', 'Normal browsing speed']
    };
  }

  // Hierarchy 1: Payment Failure
  if (paymentAttempts > 0 && paymentFailures > 0) {
    const isRetry = paymentAttempts > 1;
    return {
      primaryReason: ABANDONMENT_REASONS.PAYMENT_FAILURE,
      confidence: 0.94,
      explanation: isRetry 
        ? `Customer attempted payment ${paymentAttempts} times and encountered ${paymentFailures} failure(s). Returned to checkout indicating high purchase intent blocked by payment gateway error.`
        : 'Payment attempt failed during checkout process.',
      signals: [`Payment attempts: ${paymentAttempts}`, `Payment failures: ${paymentFailures}`]
    };
  }

  // Hierarchy 2: COD Unavailable
  const codEvent = events.find(e => e.eventType === 'cod_attempted');
  if (codEvent || (!codAvailable && checkoutStarted)) {
    return {
      primaryReason: ABANDONMENT_REASONS.COD_UNAVAILABLE,
      confidence: 0.89,
      explanation: 'Customer sought Cash on Delivery (COD) payment option which was unavailable for their pin code or order.',
      signals: ['COD option checked/unavailable', 'Checkout reached']
    };
  }

  // Hierarchy 3: High Shipping Cost
  const shippingRatio = cartValue > 0 ? (shippingCost / cartValue) : 0;
  if (shippingCost > 0 && (shippingRatio > 0.15 || shippingCost >= 149)) {
    return {
      primaryReason: ABANDONMENT_REASONS.SHIPPING_COST,
      confidence: 0.86,
      explanation: `Shipping fee of ₹${shippingCost} represents ${(shippingRatio * 100).toFixed(1)}% of total cart value, triggering shipping fee sticker shock at checkout.`,
      signals: [`Shipping cost: ₹${shippingCost}`, `Cart ratio: ${(shippingRatio * 100).toFixed(1)}%`]
    };
  }

  // Hierarchy 4: Delivery Delay
  if (deliveryDays > 5 && checkoutStarted) {
    return {
      primaryReason: ABANDONMENT_REASONS.DELIVERY_DELAY,
      confidence: 0.82,
      explanation: `Estimated delivery duration of ${deliveryDays} days caused customer hesitation during shipping step.`,
      signals: [`Delivery timeline: ${deliveryDays} days`, 'Checkout reached']
    };
  }

  // Hierarchy 5: Price Shopping / Comparison
  if (productViews >= 5 && pageTransitions >= 6 && !checkoutStarted) {
    return {
      primaryReason: ABANDONMENT_REASONS.PRICE_SHOPPING,
      confidence: 0.85,
      explanation: 'Customer engaged in extensive multi-product comparison without initiating checkout, indicating price evaluation across competing sites.',
      signals: [`Product views: ${productViews}`, `Page switches: ${pageTransitions}`, 'No checkout initiated']
    };
  }

  // Hierarchy 6: Checkout Form Friction
  if (checkoutStarted && timeOnPage > 240 && paymentAttempts === 0) {
    return {
      primaryReason: ABANDONMENT_REASONS.CHECKOUT_FRICTION,
      confidence: 0.79,
      explanation: 'Customer spent excessive time on checkout form without completing payment, indicating form field friction or address verification issue.',
      signals: ['Checkout initiated', `Time in checkout: ${Math.round(timeOnPage / 60)}m`, '0 payment attempts']
    };
  }

  return {
    primaryReason: ABANDONMENT_REASONS.LOW_INTENT,
    confidence: 0.65,
    explanation: 'General hesitation without single dominant technical error or shipping barrier.',
    signals: ['High overall risk score', 'General browsing pattern']
  };
}
