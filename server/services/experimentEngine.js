import Experiment from '../models/Experiment.js';
import Session from '../models/Session.js';
import { EXPERIMENT_GROUPS } from '../config/constants.js';

export async function assignExperimentGroup(sessionId) {
  try {
    let experiment = await Experiment.findOne({ status: 'active' });
    if (!experiment) {
      experiment = await Experiment.create({
        name: 'Default Holdout A/B Experiment',
        controlPercentage: 20,
        treatmentPercentage: 80,
        status: 'active'
      });
    }

    const rand = Math.random() * 100;
    const group = rand < experiment.controlPercentage ? EXPERIMENT_GROUPS.CONTROL : EXPERIMENT_GROUPS.TREATMENT;

    if (group === EXPERIMENT_GROUPS.CONTROL) {
      experiment.metrics.controlSessions += 1;
    } else {
      experiment.metrics.treatmentSessions += 1;
    }
    await experiment.save();

    return group;
  } catch (error) {
    console.error('[ExperimentEngine] Error assigning group:', error);
    return EXPERIMENT_GROUPS.TREATMENT;
  }
}

export async function getExperimentAnalytics() {
  const controlSessions = await Session.find({ experimentGroup: EXPERIMENT_GROUPS.CONTROL });
  const treatmentSessions = await Session.find({ experimentGroup: EXPERIMENT_GROUPS.TREATMENT });

  const totalControl = controlSessions.length || 1;
  const totalTreatment = treatmentSessions.length || 1;

  const controlConversions = controlSessions.filter(s => s.purchaseCompleted).length;
  const treatmentConversions = treatmentSessions.filter(s => s.purchaseCompleted).length;

  const controlConversionRate = (controlConversions / totalControl) * 100;
  const treatmentConversionRate = (treatmentConversions / totalTreatment) * 100;

  const controlRevenue = controlSessions.reduce((acc, s) => acc + (s.purchaseCompleted ? s.cartValue : 0), 0);
  const treatmentRevenue = treatmentSessions.reduce((acc, s) => acc + (s.purchaseCompleted ? s.cartValue : 0), 0);

  const treatmentDiscountSpend = treatmentSessions.reduce((acc, s) => {
    if (s.actionExecuted && s.recommendedAction === 'SHIPPING_INCENTIVE') return acc + (s.shippingCost || 99);
    if (s.actionExecuted && s.recommendedAction === 'SMALL_DISCOUNT') return acc + Math.round(s.cartValue * 0.10);
    return acc;
  }, 0);

  const controlAvgOrderValue = controlConversions > 0 ? controlRevenue / controlConversions : 0;
  const treatmentAvgOrderValue = treatmentConversions > 0 ? treatmentRevenue / treatmentConversions : 0;

  const incrementalConversionRate = treatmentConversionRate - controlConversionRate;
  
  const controlRevPerSession = controlRevenue / totalControl;
  const treatmentRevPerSession = treatmentRevenue / totalTreatment;
  const incrementalRevPerSession = treatmentRevPerSession - controlRevPerSession;
  const totalIncrementalRevenue = Math.round(incrementalRevPerSession * totalTreatment);

  const grossIncrementalMargin = totalIncrementalRevenue * 0.25;
  const netIncrementalMargin = Math.max(Math.round(grossIncrementalMargin - treatmentDiscountSpend), 0);

  return {
    control: {
      totalSessions: totalControl,
      conversions: controlConversions,
      conversionRate: parseFloat(controlConversionRate.toFixed(2)),
      revenue: Math.round(controlRevenue),
      avgOrderValue: Math.round(controlAvgOrderValue)
    },
    treatment: {
      totalSessions: totalTreatment,
      conversions: treatmentConversions,
      conversionRate: parseFloat(treatmentConversionRate.toFixed(2)),
      revenue: Math.round(treatmentRevenue),
      discountSpend: Math.round(treatmentDiscountSpend),
      avgOrderValue: Math.round(treatmentAvgOrderValue)
    },
    impact: {
      incrementalConversionRate: parseFloat(incrementalConversionRate.toFixed(2)),
      totalIncrementalRevenue: Math.max(totalIncrementalRevenue, 0),
      treatmentDiscountSpend: Math.round(treatmentDiscountSpend),
      netIncrementalMargin
    }
  };
}
