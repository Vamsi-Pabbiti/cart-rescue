import ActionDecision from '../models/ActionDecision.js';
import Session from '../models/Session.js';
import Customer from '../models/Customer.js';
import Campaign from '../models/Campaign.js';
import AuditLog from '../models/AuditLog.js';
import { evaluateActionPolicy } from '../services/policyEngine.js';
import { sendEmail, sendSMS, sendWhatsApp } from '../services/notificationService.js';
import { emitRealtimeEvent } from '../sockets/index.js';

export const recommendAction = async (req, res, next) => {
  try {
    const { sessionData, diagnosis } = req.body;
    const customer = await Customer.findOne({ customerId: sessionData.customerId }) || {};
    const activeCampaign = await Campaign.findOne({ status: 'active' });

    const decision = evaluateActionPolicy(sessionData, diagnosis, customer, activeCampaign);
    res.json(decision);
  } catch (error) {
    next(error);
  }
};

export const executeAction = async (req, res, next) => {
  try {
    const { sessionId, action } = req.body;

    const session = await Session.findOne({ sessionId });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const customer = await Customer.findOne({ customerId: session.customerId }) || {};
    const activeCampaign = await Campaign.findOne({ status: 'active' });

    const diagnosis = { primaryReason: session.abandonmentReason };
    const policyResult = evaluateActionPolicy(session, diagnosis, customer, activeCampaign);

    if (policyResult.policyStatus === 'BLOCKED BY POLICY') {
      return res.status(400).json({
        message: 'Action blocked by policy guardrails upon re-check.',
        policyResult
      });
    }

    session.actionExecuted = true;
    session.actionExecutedAt = new Date();
    await session.save();

    let notificationResult = { status: 'Not required' };
    if (action === 'REMINDER_NOTIFICATION' || action === 'SHOW_PAYMENT_HELP') {
      if (customer.whatsappOptIn && customer.phone) {
        notificationResult = await sendWhatsApp({
          to: customer.phone,
          body: `Hi ${customer.name}, complete your cart (${session.cartItems[0]?.name || 'items'}) with 1-click checkout: https://cartrescue.io/checkout/${session.sessionId}`
        });
      } else if (customer.emailOptIn && customer.email) {
        notificationResult = await sendEmail({
          to: customer.email,
          subject: 'Need help completing your purchase?',
          text: `Hi ${customer.name}, we saved your cart items. Complete your order now!`
        });
      }
    }

    if (activeCampaign && policyResult.estimatedCost > 0) {
      activeCampaign.spent += policyResult.estimatedCost;
      await activeCampaign.save();
    }

    await ActionDecision.create({
      sessionId: session.sessionId,
      action: action || session.recommendedAction,
      reason: policyResult.reason,
      estimatedCost: policyResult.estimatedCost,
      expectedBenefit: policyResult.expectedBenefit,
      policyStatus: policyResult.policyStatus,
      policyChecks: policyResult.policyChecks,
      executed: true,
      executedAt: new Date()
    });

    await AuditLog.create({
      sessionId: session.sessionId,
      riskScore: session.riskScore,
      riskLevel: session.riskLevel,
      signals: [],
      diagnosis: { primaryReason: session.abandonmentReason },
      action: { recommendedAction: action, reason: policyResult.reason, estimatedCost: policyResult.estimatedCost },
      policyChecks: policyResult.policyChecks,
      result: `Action ${action} executed successfully. Notification status: ${notificationResult.status}`,
      actionExecuted: true,
      timestamp: new Date()
    });

    emitRealtimeEvent('action_executed', {
      sessionId: session.sessionId,
      action,
      timestamp: new Date()
    });

    res.json({
      message: `Action ${action} executed successfully`,
      session,
      notificationResult,
      policyResult
    });
  } catch (error) {
    next(error);
  }
};

export const getActionHistory = async (req, res, next) => {
  try {
    const decisions = await ActionDecision.find().sort({ createdAt: -1 }).limit(50);
    res.json(decisions);
  } catch (error) {
    next(error);
  }
};
