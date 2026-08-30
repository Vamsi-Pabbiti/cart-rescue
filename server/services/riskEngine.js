import { RISK_LEVELS } from '../config/constants.js';

export function calculateRiskScore(sessionData) {
  let score = 0;
  const contributingSignals = [];

  const {
    timeOnPage = 0,
    productViews = 0,
    cartValue = 0,
    cartValueChange = 0,
    checkoutStarted = false,
    paymentAttempts = 0,
    paymentFailures = 0,
    pageTransitions = 0,
    exitIntent = false,
    shippingCost = 0,
    deliveryDays = 3,
    codAvailable = true,
    previousPurchases = 0
  } = sessionData;

  // 1. Payment failure (Critical signal)
  if (paymentFailures > 0) {
    const impact = 30 + Math.min((paymentFailures - 1) * 10, 20);
    score += impact;
    contributingSignals.push({
      signal: 'Payment failure detected',
      impact
    });
  }

  // 2. Multiple payment attempts without success
  if (paymentAttempts >= 2 && paymentFailures > 0) {
    const impact = 15;
    score += impact;
    contributingSignals.push({
      signal: 'Multiple payment retries',
      impact
    });
  }

  // 3. Exit intent detected
  if (exitIntent) {
    const impact = 20;
    score += impact;
    contributingSignals.push({
      signal: 'Exit intent detected',
      impact
    });
  }

  // 4. Long time in checkout/on page (> 5 minutes)
  if (checkoutStarted && timeOnPage > 300) {
    const impact = 15;
    score += impact;
    contributingSignals.push({
      signal: 'Long checkout duration (>5m)',
      impact
    });
  } else if (timeOnPage > 600) {
    const impact = 10;
    score += impact;
    contributingSignals.push({
      signal: 'Extended session duration',
      impact
    });
  }

  // 5. High shipping cost ratio (> 15% of cart value)
  if (cartValue > 0 && shippingCost > 0) {
    const shippingRatio = shippingCost / cartValue;
    if (shippingRatio > 0.15 || shippingCost > 150) {
      const impact = 10;
      score += impact;
      contributingSignals.push({
        signal: 'High shipping cost ratio',
        impact
      });
    }
  }

  // 6. Price comparison / product switching
  if (productViews >= 6 && pageTransitions >= 8 && !checkoutStarted) {
    const impact = 10;
    score += impact;
    contributingSignals.push({
      signal: 'Frequent product switching / price comparison',
      impact
    });
  }

  // 7. Delivery delay (> 5 days delivery)
  if (deliveryDays > 5 && checkoutStarted) {
    const impact = 10;
    score += impact;
    contributingSignals.push({
      signal: 'Slow delivery timeframe (>5 days)',
      impact
    });
  }

  // 8. Negative cart value change (item removed)
  if (cartValueChange < 0) {
    const impact = 8;
    score += impact;
    contributingSignals.push({
      signal: 'Items removed from cart',
      impact
    });
  }

  // 9. Low engagement / idle behavior
  if (timeOnPage < 30 && productViews <= 1 && cartValue > 0) {
    const impact = 5;
    score += impact;
    contributingSignals.push({
      signal: 'Low session engagement',
      impact
    });
  }

  if (previousPurchases > 2) {
    score = Math.max(0, score - 10);
  }

  const normalizedScore = Math.min(Math.max(Math.round(score), 0), 100);

  let riskLevel = RISK_LEVELS.LOW;
  if (normalizedScore > 80) riskLevel = RISK_LEVELS.CRITICAL;
  else if (normalizedScore > 60) riskLevel = RISK_LEVELS.HIGH;
  else if (normalizedScore > 30) riskLevel = RISK_LEVELS.MEDIUM;

  return {
    riskScore: normalizedScore,
    riskLevel,
    contributingSignals
  };
}
