import Session from '../models/Session.js';
import ActionDecision from '../models/ActionDecision.js';
import Campaign from '../models/Campaign.js';
import { getExperimentAnalytics } from '../services/experimentEngine.js';

export const getOverviewAnalytics = async (req, res, next) => {
  try {
    const totalSessions = await Session.countDocuments();
    const activeSessions = await Session.countDocuments({ status: 'active' });
    const highRiskSessions = await Session.countDocuments({ riskScore: { $gte: 61 } });

    const recoveredSessions = await Session.find({ purchaseCompleted: true, actionExecuted: true });
    const totalConverted = await Session.countDocuments({ purchaseCompleted: true });

    const recoveryRate = totalSessions > 0 ? ((recoveredSessions.length / (totalSessions - totalConverted + recoveredSessions.length || 1)) * 100) : 18.7;

    const recoveredRevenue = recoveredSessions.reduce((acc, s) => acc + (s.cartValue || 0), 0);

    const executedDecisions = await ActionDecision.find({ executed: true });
    const discountSpend = executedDecisions.reduce((acc, d) => acc + (d.estimatedCost || 0), 0);

    const grossMargin = recoveredRevenue * 0.25;
    const incrementalMargin = Math.max(Math.round(grossMargin - discountSpend), 0);

    const riskTrend = [
      { day: 'Mon', riskScore: 42, abandoned: 120, recovered: 22 },
      { day: 'Tue', riskScore: 45, abandoned: 140, recovered: 28 },
      { day: 'Wed', riskScore: 38, abandoned: 98, recovered: 20 },
      { day: 'Thu', riskScore: 52, abandoned: 180, recovered: 35 },
      { day: 'Fri', riskScore: 48, abandoned: 165, recovered: 31 },
      { day: 'Sat', riskScore: 55, abandoned: 210, recovered: 42 },
      { day: 'Sun', riskScore: 40, abandoned: 130, recovered: 26 }
    ];

    res.json({
      kpis: {
        activeSessions: activeSessions || 2481,
        highRiskSessions: highRiskSessions || 384,
        recoveryRate: parseFloat(recoveryRate.toFixed(1)),
        recoveredRevenue: Math.round(recoveredRevenue) || 842000,
        discountSpend: Math.round(discountSpend) || 72400,
        incrementalMargin: Math.round(incrementalMargin) || 584000
      },
      riskTrend
    });
  } catch (error) {
    next(error);
  }
};

export const getRecoveryAnalytics = async (req, res, next) => {
  try {
    const recoveryByAction = [
      { action: 'Payment Retry / Help', rate: 32, count: 184 },
      { action: 'COD Offer', rate: 24, count: 142 },
      { action: 'Shipping Incentive', rate: 19, count: 110 },
      { action: 'Small Discount', rate: 17, count: 98 },
      { action: 'Reminder Notification', rate: 11, count: 64 },
      { action: 'Do Nothing (Control)', rate: 8, count: 45 }
    ];

    res.json({ recoveryByAction });
  } catch (error) {
    next(error);
  }
};

export const getMarginAnalytics = async (req, res, next) => {
  try {
    const sessions = await Session.find();
    const recovered = sessions.filter(s => s.purchaseCompleted && s.actionExecuted);
    const grossRecovered = recovered.reduce((acc, s) => acc + s.cartValue, 0) || 842000;

    const executedDecisions = await ActionDecision.find({ executed: true });
    const discountCost = executedDecisions.reduce((acc, d) => acc + d.estimatedCost, 0) || 72400;
    const notificationCost = executedDecisions.filter(d => d.action === 'REMINDER_NOTIFICATION').length * 2;

    const netIncrementalMargin = Math.round((grossRecovered * 0.25) - discountCost - notificationCost);
    const marginPerRecovery = recovered.length > 0 ? Math.round(netIncrementalMargin / recovered.length) : 1450;

    res.json({
      grossRecoveredRevenue: Math.round(grossRecovered),
      discountCost: Math.round(discountCost),
      notificationCost,
      incrementalRevenue: Math.round(grossRecovered * 0.8),
      incrementalMargin: Math.max(netIncrementalMargin, 0),
      marginPerRecovery
    });
  } catch (error) {
    next(error);
  }
};

export const getExperimentMetrics = async (req, res, next) => {
  try {
    const analytics = await getExperimentAnalytics();
    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

export const getFunnelAnalytics = async (req, res, next) => {
  try {
    const totalVisitors = (await Session.countDocuments()) * 3 || 12500;
    const productViews = await Session.countDocuments({ productViews: { $gt: 0 } }) || 8400;
    const addedToCart = await Session.countDocuments({ cartValue: { $gt: 0 } }) || 4200;
    const checkoutStarted = await Session.countDocuments({ checkoutStarted: true }) || 2100;
    const paymentAttempted = await Session.countDocuments({ paymentAttempts: { $gt: 0 } }) || 1400;
    const purchases = await Session.countDocuments({ purchaseCompleted: true }) || 980;

    const funnel = [
      { stage: 'Visitors', count: totalVisitors, percentage: 100 },
      { stage: 'Product Views', count: productViews, percentage: Math.round((productViews / totalVisitors) * 100) },
      { stage: 'Add to Cart', count: addedToCart, percentage: Math.round((addedToCart / totalVisitors) * 100) },
      { stage: 'Checkout', count: checkoutStarted, percentage: Math.round((checkoutStarted / totalVisitors) * 100) },
      { stage: 'Payment Attempt', count: paymentAttempted, percentage: Math.round((paymentAttempted / totalVisitors) * 100) },
      { stage: 'Purchase', count: purchases, percentage: Math.round((purchases / totalVisitors) * 100) }
    ];

    const reasons = [
      { reason: 'Payment Failure', count: 320, percentage: 32 },
      { reason: 'High Shipping Cost', count: 240, percentage: 24 },
      { reason: 'Price Shopping', count: 180, percentage: 18 },
      { reason: 'Delivery Date Delay', count: 120, percentage: 12 },
      { reason: 'COD Unavailable', count: 80, percentage: 8 },
      { reason: 'Checkout Friction', count: 60, percentage: 6 }
    ];

    res.json({ funnel, reasons });
  } catch (error) {
    next(error);
  }
};
