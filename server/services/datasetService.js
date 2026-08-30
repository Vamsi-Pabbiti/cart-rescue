import fs from 'fs';
import csvParser from 'csv-parser';
import Session from '../models/Session.js';
import Dataset from '../models/Dataset.js';
import { calculateRiskScore } from './riskEngine.js';
import { diagnoseAbandonment } from './diagnosisEngine.js';
import { evaluateActionPolicy } from './policyEngine.js';
import AuditLog from '../models/AuditLog.js';

export async function processCSVDataset(filePath, filename) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          let importedSessions = 0;
          let importedEvents = 0;

          for (const row of results) {
            // Flexible header mapping supporting Kaggle Clickstream, e-Shop Clickstream, and Multi-table formats
            const sessionId = row.sessionId || row.session_id || row['session ID'] || row.SessionId || `CR-KAG-${Math.floor(100000 + Math.random() * 900000)}`;
            const customerId = row.customerId || row.customer_id || row['customer ID'] || row.user_id || `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
            const cartValue = parseFloat(row.cartValue || row.cart_value || row.price || row.Price || row['price 2'] || 2499);
            const timeOnPage = parseInt(row.timeOnPage || row.time_on_page || row.duration || 180, 10);
            const productViews = parseInt(row.productViews || row.product_views || row.page || row['page 1 (main category)'] || 3, 10);
            const paymentAttempts = parseInt(row.paymentAttempts || row.payment_attempts || (row.event_type === 'payment_failed' ? 1 : 0), 10);
            const paymentFailures = parseInt(row.paymentFailures || row.payment_failures || (row.event_type === 'payment_failed' ? 1 : 0), 10);
            const checkoutStarted = row.checkoutStarted === 'true' || row.checkout_started === '1' || row.order === '1' || row.event_type === 'checkout';
            const purchaseCompleted = row.purchaseCompleted === 'true' || row.purchase_completed === '1' || row.event_type === 'purchase';

            const sessionData = {
              sessionId,
              customerId,
              cartValue,
              timeOnPage,
              productViews,
              paymentAttempts,
              paymentFailures,
              checkoutStarted,
              purchaseCompleted,
              status: purchaseCompleted ? 'converted' : (paymentFailures > 0 ? 'abandoned' : 'active')
            };

            const riskAssessment = calculateRiskScore(sessionData);
            const diagnosis = diagnoseAbandonment(sessionData, riskAssessment);
            const policyResult = evaluateActionPolicy(sessionData, diagnosis, {}, null);

            sessionData.riskScore = riskAssessment.riskScore;
            sessionData.riskLevel = riskAssessment.riskLevel;
            sessionData.abandonmentReason = diagnosis.primaryReason;
            sessionData.recommendedAction = policyResult.action;

            await Session.findOneAndUpdate({ sessionId }, sessionData, { upsert: true, new: true });
            importedSessions += 1;
            importedEvents += (productViews + paymentAttempts + 1);

            await AuditLog.create({
              sessionId,
              riskScore: riskAssessment.riskScore,
              riskLevel: riskAssessment.riskLevel,
              signals: riskAssessment.contributingSignals,
              diagnosis: {
                primaryReason: diagnosis.primaryReason,
                confidence: diagnosis.confidence,
                explanation: diagnosis.explanation
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
          }

          const datasetRecord = await Dataset.create({
            filename,
            datasetSource: 'Kaggle E-Commerce Clickstream Benchmark',
            totalRows: results.length,
            importedSessions,
            importedEvents,
            status: 'completed'
          });

          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }

          resolve(datasetRecord);
        } catch (err) {
          reject(err);
        }
      })
      .on('error', (err) => reject(err));
  });
}
