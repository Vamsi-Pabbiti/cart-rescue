import Session from '../models/Session.js';
import Customer from '../models/Customer.js';
import Campaign from '../models/Campaign.js';
import RiskAssessment from '../models/RiskAssessment.js';
import ActionDecision from '../models/ActionDecision.js';
import AuditLog from '../models/AuditLog.js';
import { calculateRiskScore } from '../services/riskEngine.js';
import { diagnoseAbandonment } from '../services/diagnosisEngine.js';
import { evaluateActionPolicy } from '../services/policyEngine.js';
import { emitRealtimeEvent } from '../sockets/index.js';

export const handleEvent = async (req, res, next) => {
  try {
    const {
      sessionId,
      eventType,
      details = {},
      timeOnPage,
      currentPage,
      cartItems,
      cartValue
    } = req.body;

    let session = await Session.findOne({ sessionId });
    if (!session) {
      session = await Session.create({
        sessionId: sessionId || `CR-${Math.floor(10000 + Math.random() * 90000)}`,
        customerId: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: 'Guest Customer',
        cartValue: cartValue || 0,
        cartItems: cartItems || []
      });
    }

    session.events.push({ eventType, details, timestamp: new Date() });

    if (currentPage) session.currentPage = currentPage;
    if (timeOnPage !== undefined) session.timeOnPage = timeOnPage;
    if (cartItems) session.cartItems = cartItems;
    if (cartValue !== undefined) {
      session.cartValueChange = cartValue - session.cartValue;
      session.cartValue = cartValue;
    }

    switch (eventType) {
      case 'product_viewed':
        session.productViews += 1;
        session.pageTransitions += 1;
        break;
      case 'checkout_started':
        session.checkoutStarted = true;
        break;
      case 'payment_attempted':
        session.paymentAttempts += 1;
        session.checkoutStarted = true;
        break;
      case 'payment_failed':
        session.paymentFailures += 1;
        session.status = 'abandoned';
        break;
      case 'payment_success':
        session.purchaseCompleted = true;
        session.status = 'converted';
        break;
      case 'exit_intent':
        session.exitIntent = true;
        if (session.status === 'active') session.status = 'abandoned';
        break;
      default:
        break;
    }

    const customer = await Customer.findOne({ customerId: session.customerId }) || {};
    const activeCampaign = await Campaign.findOne({ status: 'active' });

    const riskResult = calculateRiskScore(session);
    const diagnosisResult = diagnoseAbandonment(session, riskResult);
    const policyResult = evaluateActionPolicy(session, diagnosisResult, customer, activeCampaign);

    session.riskScore = riskResult.riskScore;
    session.riskLevel = riskResult.riskLevel;
    session.abandonmentReason = diagnosisResult.primaryReason;
    session.recommendedAction = policyResult.action;
    await session.save();

    const riskAssessment = await RiskAssessment.create({
      sessionId: session.sessionId,
      score: riskResult.riskScore,
      level: riskResult.riskLevel,
      signals: riskResult.contributingSignals,
      primaryReason: diagnosisResult.primaryReason,
      confidence: diagnosisResult.confidence
    });

    const actionDecision = await ActionDecision.create({
      sessionId: session.sessionId,
      action: policyResult.action,
      reason: policyResult.reason,
      estimatedCost: policyResult.estimatedCost,
      expectedBenefit: policyResult.expectedBenefit,
      policyStatus: policyResult.policyStatus,
      policyChecks: policyResult.policyChecks
    });

    const auditLog = await AuditLog.create({
      sessionId: session.sessionId,
      riskScore: riskResult.riskScore,
      riskLevel: riskResult.riskLevel,
      signals: riskResult.contributingSignals,
      diagnosis: {
        primaryReason: diagnosisResult.primaryReason,
        confidence: diagnosisResult.confidence,
        explanation: diagnosisResult.explanation
      },
      action: {
        recommendedAction: policyResult.action,
        reason: policyResult.reason,
        estimatedCost: policyResult.estimatedCost,
        expectedBenefit: policyResult.expectedBenefit
      },
      policyChecks: policyResult.policyChecks,
      result: policyResult.policyStatus === 'Approved' ? 'Action Approved' : 'Blocked by Policy',
      timestamp: new Date()
    });

    emitRealtimeEvent('session_updated', session);
    emitRealtimeEvent('risk_updated', {
      sessionId: session.sessionId,
      riskScore: riskResult.riskScore,
      riskLevel: riskResult.riskLevel,
      primaryReason: diagnosisResult.primaryReason,
      recommendedAction: policyResult.action
    });
    emitRealtimeEvent('live_activity', {
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      sessionId: session.sessionId,
      eventText: getLiveActivityText(eventType, diagnosisResult.primaryReason),
      riskScore: riskResult.riskScore,
      action: policyResult.action
    });

    res.json({
      session,
      riskAssessment,
      diagnosis: diagnosisResult,
      actionDecision: policyResult,
      auditLog
    });
  } catch (error) {
    next(error);
  }
};

function getLiveActivityText(eventType, reason) {
  if (eventType === 'payment_failed') return 'Payment failure detected';
  if (reason === 'price_shopping') return 'Price shopping detected';
  if (reason === 'shipping_cost') return 'High shipping cost shock';
  if (eventType === 'checkout_started') return 'Checkout initiated';
  return `${eventType.replace('_', ' ')} logged`;
}
