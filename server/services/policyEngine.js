import { BOUNDED_ACTIONS, ABANDONMENT_REASONS } from '../config/constants.js';

export function evaluateActionPolicy(sessionData, diagnosisResult, customerData = {}, activeCampaign = null) {
  const { primaryReason } = diagnosisResult;
  const { cartValue = 0, shippingCost = 0 } = sessionData;

  let candidateAction = BOUNDED_ACTIONS.DO_NOTHING;
  let reasonText = 'No intervention required.';
  let estimatedCost = 0;
  let expectedBenefit = 0.05;

  switch (primaryReason) {
    case ABANDONMENT_REASONS.PAYMENT_FAILURE:
      candidateAction = BOUNDED_ACTIONS.SHOW_PAYMENT_HELP;
      reasonText = 'Payment failure detected. Offer instant payment retry assistance or alternative gateway.';
      estimatedCost = 0;
      expectedBenefit = 0.28;
      break;

    case ABANDONMENT_REASONS.SHIPPING_COST:
      candidateAction = BOUNDED_ACTIONS.SHIPPING_INCENTIVE;
      estimatedCost = shippingCost > 0 ? shippingCost : 99;
      reasonText = `Free shipping incentive (₹${estimatedCost}) to resolve shipping cost friction.`;
      expectedBenefit = 0.22;
      break;

    case ABANDONMENT_REASONS.DELIVERY_DELAY:
      candidateAction = BOUNDED_ACTIONS.DELIVERY_INFORMATION;
      reasonText = 'Show express delivery guarantee and tracking assurance.';
      estimatedCost = 0;
      expectedBenefit = 0.15;
      break;

    case ABANDONMENT_REASONS.COD_UNAVAILABLE:
      candidateAction = BOUNDED_ACTIONS.OFFER_COD;
      reasonText = 'Offer alternative verified COD partner or ₹50 UPI cashback for prepaid completion.';
      estimatedCost = 50;
      expectedBenefit = 0.25;
      break;

    case ABANDONMENT_REASONS.PRICE_SHOPPING:
      candidateAction = BOUNDED_ACTIONS.DO_NOTHING;
      reasonText = 'Price shopping detected. Do not dilute margin with unneeded discount.';
      estimatedCost = 0;
      expectedBenefit = 0.08;
      break;

    case ABANDONMENT_REASONS.CHECKOUT_FRICTION:
      candidateAction = BOUNDED_ACTIONS.REMINDER_NOTIFICATION;
      reasonText = 'Trigger gentle checkout assistance prompt to complete saved cart.';
      estimatedCost = 0;
      expectedBenefit = 0.14;
      break;

    case ABANDONMENT_REASONS.LOW_INTENT:
    default:
      candidateAction = BOUNDED_ACTIONS.DO_NOTHING;
      reasonText = 'Low abandonment risk. Do nothing to preserve margin.';
      estimatedCost = 0;
      expectedBenefit = 0.05;
      break;
  }

  const policyChecks = {
    budgetCheck: true,
    marginCheck: true,
    consentCheck: true,
    actionAllowed: true,
    status: 'Approved'
  };

  if (candidateAction === BOUNDED_ACTIONS.DO_NOTHING) {
    return {
      action: BOUNDED_ACTIONS.DO_NOTHING,
      reason: reasonText,
      estimatedCost: 0,
      expectedBenefit,
      expectedIncrementalMargin: Math.round(cartValue * expectedBenefit * 0.25),
      policyChecks,
      policyStatus: 'Approved'
    };
  }

  if (activeCampaign) {
    const remainingBudget = activeCampaign.budget - activeCampaign.spent;
    if (estimatedCost > remainingBudget) {
      policyChecks.budgetCheck = false;
      policyChecks.status = 'BLOCKED BY POLICY';
    }

    const discountPercentage = cartValue > 0 ? (estimatedCost / cartValue) * 100 : 0;
    if (discountPercentage > activeCampaign.maxDiscount) {
      policyChecks.marginCheck = false;
      policyChecks.status = 'BLOCKED BY POLICY';
    }
  }

  const baseMargin = cartValue * 0.25;
  const netMarginAfterIncentive = baseMargin - estimatedCost;
  const netMarginPercent = cartValue > 0 ? (netMarginAfterIncentive / cartValue) * 100 : 0;

  if (netMarginPercent < 8) {
    policyChecks.marginCheck = false;
    policyChecks.status = 'BLOCKED BY POLICY';
  }

  if (candidateAction === BOUNDED_ACTIONS.REMINDER_NOTIFICATION) {
    const hasAnyOptIn = customerData.emailOptIn || customerData.smsOptIn || customerData.whatsappOptIn || customerData.pushOptIn;
    if (!hasAnyOptIn) {
      policyChecks.consentCheck = false;
      policyChecks.status = 'BLOCKED BY POLICY';
    }
  }

  if (!policyChecks.budgetCheck || !policyChecks.marginCheck || !policyChecks.consentCheck || !policyChecks.actionAllowed) {
    const blockReason = !policyChecks.budgetCheck ? 'Campaign budget exceeded' :
                        !policyChecks.marginCheck ? 'Net margin drop below 8% guardrail' :
                        !policyChecks.consentCheck ? 'Customer notification opt-in missing' : 'Policy violation';

    return {
      action: BOUNDED_ACTIONS.DO_NOTHING,
      reason: `Action ${candidateAction} blocked by policy: ${blockReason}`,
      estimatedCost: 0,
      expectedBenefit: 0.05,
      expectedIncrementalMargin: Math.round(cartValue * 0.05 * 0.25),
      policyChecks,
      policyStatus: 'BLOCKED BY POLICY'
    };
  }

  const expectedIncrementalRevenue = Math.round(cartValue * expectedBenefit);
  const expectedIncrementalMargin = Math.round((expectedIncrementalRevenue * 0.25) - estimatedCost);

  return {
    action: candidateAction,
    reason: reasonText,
    estimatedCost,
    expectedBenefit,
    expectedIncrementalMargin: Math.max(expectedIncrementalMargin, 0),
    policyChecks,
    policyStatus: 'Approved'
  };
}
