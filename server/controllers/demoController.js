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

export const triggerDemoScenario = async (req, res, next) => {
  try {
    const { scenarioType = 'payment_failure' } = req.body;
    const sessionId = `CR-DEMO-${Math.floor(10000 + Math.random() * 90000)}`;
    const customerId = `CUST-DEMO-${Math.floor(1000 + Math.random() * 9000)}`;

    let customer = await Customer.findOne({ customerId });
    if (!customer) {
      customer = await Customer.create({
        customerId,
        name: 'Demo Customer (Live Test)',
        email: 'democustomer@example.com',
        phone: '+919876543210',
        emailOptIn: true,
        whatsappOptIn: true,
        smsOptIn: false
      });
    }

    let sessionInit = {
      sessionId,
      customerId,
      customerName: customer.name,
      cartItems: [
        { productId: 'P-101', name: 'Wireless Noise-Canceling Headphones', price: 4999, quantity: 1, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' }
      ],
      cartValue: 4999,
      status: 'active'
    };

    switch (scenarioType) {
      case 'payment_failure':
        sessionInit.checkoutStarted = true;
        sessionInit.paymentAttempts = 2;
        sessionInit.paymentFailures = 2;
        sessionInit.timeOnPage = 320;
        sessionInit.status = 'abandoned';
        sessionInit.events = [
          { eventType: 'checkout_started', details: { cartValue: 4999 } },
          { eventType: 'payment_attempted', details: { gateway: 'Razorpay' } },
          { eventType: 'payment_failed', details: { errorCode: 'GATEWAY_TIMEOUT' } },
          { eventType: 'payment_attempted', details: { gateway: 'Razorpay' } },
          { eventType: 'payment_failed', details: { errorCode: 'BANK_DECLINED' } }
        ];
        break;

      case 'price_shopping':
        sessionInit.productViews = 9;
        sessionInit.pageTransitions = 12;
        sessionInit.timeOnPage = 450;
        sessionInit.checkoutStarted = false;
        sessionInit.status = 'active';
        sessionInit.events = [
          { eventType: 'product_viewed', details: { product: 'Headphones Pro' } },
          { eventType: 'product_viewed', details: { product: 'Bluetooth Speaker' } },
          { eventType: 'product_viewed', details: { product: 'Smart Watch' } },
          { eventType: 'cart_updated', details: { itemsCount: 1 } }
        ];
        break;

      case 'shipping_shock':
        sessionInit.cartValue = 499;
        sessionInit.shippingCost = 149;
        sessionInit.checkoutStarted = true;
        sessionInit.timeOnPage = 180;
        sessionInit.exitIntent = true;
        sessionInit.events = [
          { eventType: 'checkout_started', details: { cartValue: 499 } },
          { eventType: 'shipping_calculated', details: { shippingCost: 149 } },
          { eventType: 'exit_intent', details: { page: '/checkout/shipping' } }
        ];
        break;

      case 'cod_missing':
        sessionInit.checkoutStarted = true;
        sessionInit.codAvailable = false;
        sessionInit.timeOnPage = 210;
        sessionInit.events = [
          { eventType: 'checkout_started', details: {} },
          { eventType: 'cod_attempted', details: { status: 'pincode_unserviceable' } }
        ];
        break;

      case 'checkout_friction':
        sessionInit.checkoutStarted = true;
        sessionInit.timeOnPage = 540;
        sessionInit.pageTransitions = 7;
        sessionInit.events = [
          { eventType: 'checkout_started', details: {} },
          { eventType: 'product_viewed', details: { page: '/checkout/address' } }
        ];
        break;

      case 'low_risk':
      default:
        sessionInit.productViews = 2;
        sessionInit.timeOnPage = 60;
        sessionInit.checkoutStarted = true;
        sessionInit.events = [
          { eventType: 'product_viewed', details: {} },
          { eventType: 'checkout_started', details: {} }
        ];
        break;
    }

    const session = await Session.create(sessionInit);
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
      eventText: `DEMO: ${scenarioType.replace('_', ' ').toUpperCase()}`,
      riskScore: riskResult.riskScore,
      action: policyResult.action
    });

    res.json({
      message: `Demo scenario '${scenarioType}' executed successfully!`,
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
