import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Customer from '../models/Customer.js';
import Product from '../models/Product.js';
import Session from '../models/Session.js';
import RiskAssessment from '../models/RiskAssessment.js';
import ActionDecision from '../models/ActionDecision.js';
import Campaign from '../models/Campaign.js';
import Experiment from '../models/Experiment.js';
import AuditLog from '../models/AuditLog.js';
import { calculateRiskScore } from '../services/riskEngine.js';
import { diagnoseAbandonment } from '../services/diagnosisEngine.js';
import { evaluateActionPolicy } from '../services/policyEngine.js';
import { BOUNDED_ACTIONS, ABANDONMENT_REASONS, RISK_LEVELS, EXPERIMENT_GROUPS } from '../config/constants.js';

dotenv.config();

const categories = ['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty', 'Sports & Fitness', 'Books'];
const firstNames = ['Aarav', 'Ananya', 'Rohan', 'Priya', 'Vikram', 'Neha', 'Aditya', 'Kavya', 'Rahul', 'Sneha', 'Siddharth', 'Ishita', 'Amit', 'Pooja', 'Karan', 'Riya', 'Rajesh', 'Meera', 'Arjun', 'Tanvi'];
const lastNames = ['Sharma', 'Verma', 'Patel', 'Gupta', 'Mehta', 'Singh', 'Kumar', 'Joshi', 'Shah', 'Nair', 'Rao', 'Reddy', 'Deshmukh', 'Chopra', 'Malhotra', 'Bhasin', 'Bhatia', 'Iyer', 'Sen', 'Dutta'];

async function seedDatabase() {
  try {
    await connectDB();
    console.log('Clearing existing database collections...');

    await Promise.all([
      User.deleteMany({}),
      Customer.deleteMany({}),
      Product.deleteMany({}),
      Session.deleteMany({}),
      RiskAssessment.deleteMany({}),
      ActionDecision.deleteMany({}),
      Campaign.deleteMany({}),
      Experiment.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

    console.log('Seeding Users (Admin, Analyst, Operator)...');
    await User.create({
      name: 'Admin User',
      email: 'admin@cartrescue.io',
      password: 'password123',
      role: 'admin'
    });
    await User.create({
      name: 'Analyst User',
      email: 'analyst@cartrescue.io',
      password: 'password123',
      role: 'analyst'
    });
    await User.create({
      name: 'Operator User',
      email: 'operator@cartrescue.io',
      password: 'password123',
      role: 'operator'
    });

    console.log('Seeding 500+ Customers...');
    const customerDocs = [];
    for (let i = 1; i <= 520; i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[(i * 3) % lastNames.length];
      customerDocs.push({
        customerId: `CUST-${1000 + i}`,
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
        phone: `+91${9800000000 + i}`,
        emailOptIn: i % 5 !== 0,
        smsOptIn: i % 3 === 0,
        whatsappOptIn: i % 2 === 0,
        pushOptIn: i % 4 !== 0,
        totalOrders: (i * 7) % 15,
        totalSpend: ((i * 7) % 15) * 2499
      });
    }
    const customers = await Customer.insertMany(customerDocs);
    console.log(`Created ${customers.length} Customers.`);

    console.log('Seeding 100+ Products...');
    const productDocs = [];
    for (let i = 1; i <= 105; i++) {
      const category = categories[i % categories.length];
      const price = Math.round(299 + (i * 127) % 9500);
      productDocs.push({
        name: `${category} Premium Item #${i}`,
        category,
        price,
        stock: 20 + (i % 80),
        image: `https://images.unsplash.com/photo-${1500000000000 + (i * 100000)}?w=400`,
        rating: parseFloat((3.8 + (i % 12) * 0.1).toFixed(1)),
        shippingCost: i % 4 === 0 ? 149 : 99,
        deliveryDays: 2 + (i % 5)
      });
    }
    const products = await Product.insertMany(productDocs);
    console.log(`Created ${products.length} Products.`);

    console.log('Seeding Active Campaign & Holdout Experiment...');
    const campaign = await Campaign.create({
      name: 'Q3 E-Commerce Recovery Blitz',
      targetSegment: 'High Abandonment Risk Shoppers',
      budget: 100000,
      spent: 62450,
      maxDiscount: 10,
      minOrderValue: 500,
      minMarginPercent: 8,
      eligibleActions: Object.values(BOUNDED_ACTIONS),
      status: 'active'
    });

    await Experiment.create({
      name: 'Holdout A/B Conversion Test',
      controlPercentage: 20,
      treatmentPercentage: 80,
      status: 'active'
    });

    console.log('Seeding 2,000+ Sessions & 10,000+ Session Events...');
    const sessionDocs = [];
    const riskAssessmentDocs = [];
    const actionDecisionDocs = [];
    const auditLogDocs = [];

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    for (let i = 1; i <= 2050; i++) {
      const customer = customers[i % customers.length];
      const prod1 = products[i % products.length];
      const prod2 = products[(i * 3) % products.length];
      const cartValue = prod1.price + (i % 2 === 0 ? prod2.price : 0);

      const isControl = i % 5 === 0;
      const experimentGroup = isControl ? EXPERIMENT_GROUPS.CONTROL : EXPERIMENT_GROUPS.TREATMENT;

      const timeOffset = Math.floor(Math.random() * (7 * dayMs));
      const createdAt = new Date(now - timeOffset);

      let paymentAttempts = 0;
      let paymentFailures = 0;
      let productViews = 1 + (i % 8);
      let pageTransitions = 2 + (i % 10);
      let timeOnPage = 45 + (i * 17) % 600;
      let checkoutStarted = false;
      let exitIntent = i % 6 === 0;
      let purchaseCompleted = false;
      let status = 'active';

      const scenario = i % 8;

      if (scenario === 0 || scenario === 1) {
        checkoutStarted = true;
        paymentAttempts = 1 + (i % 3);
        paymentFailures = paymentAttempts;
        status = 'abandoned';
      } else if (scenario === 2 || scenario === 3) {
        checkoutStarted = false;
        productViews = 8 + (i % 6);
        pageTransitions = 12 + (i % 8);
        timeOnPage = 400 + (i % 300);
        status = 'active';
      } else if (scenario === 4) {
        checkoutStarted = true;
        exitIntent = true;
        status = 'abandoned';
      } else if (scenario === 5) {
        checkoutStarted = true;
        paymentAttempts = 1;
        paymentFailures = 0;
        purchaseCompleted = true;
        status = 'converted';
      } else {
        status = 'active';
      }

      const sessionData = {
        sessionId: `CR-${80000 + i}`,
        customerId: customer.customerId,
        customerName: customer.name,
        customerEmail: customer.email,
        cartItems: [
          { productId: prod1._id.toString(), name: prod1.name, price: prod1.price, quantity: 1, image: prod1.image }
        ],
        cartValue,
        cartValueChange: i % 4 === 0 ? -prod1.price : 0,
        shippingCost: prod1.shippingCost,
        deliveryDays: prod1.deliveryDays,
        codAvailable: i % 7 !== 0,
        currentPage: checkoutStarted ? '/checkout/payment' : `/product/${prod1._id}`,
        productViews,
        pageTransitions,
        timeOnPage,
        paymentAttempts,
        paymentFailures,
        checkoutStarted,
        exitIntent,
        purchaseCompleted,
        status,
        experimentGroup,
        createdAt,
        updatedAt: createdAt
      };

      const riskResult = calculateRiskScore(sessionData);
      const diagnosisResult = diagnoseAbandonment(sessionData, riskResult);
      const policyResult = evaluateActionPolicy(sessionData, diagnosisResult, customer, campaign);

      sessionData.riskScore = riskResult.riskScore;
      sessionData.riskLevel = riskResult.riskLevel;
      sessionData.abandonmentReason = diagnosisResult.primaryReason;
      sessionData.recommendedAction = policyResult.action;
      sessionData.actionExecuted = !isControl && policyResult.action !== BOUNDED_ACTIONS.DO_NOTHING;
      if (sessionData.actionExecuted) {
        sessionData.actionExecutedAt = new Date(createdAt.getTime() + 60000);
      }

      sessionDocs.push(sessionData);

      riskAssessmentDocs.push({
        sessionId: sessionData.sessionId,
        score: riskResult.riskScore,
        level: riskResult.riskLevel,
        signals: riskResult.contributingSignals,
        primaryReason: diagnosisResult.primaryReason,
        confidence: diagnosisResult.confidence,
        createdAt
      });

      actionDecisionDocs.push({
        sessionId: sessionData.sessionId,
        action: policyResult.action,
        reason: policyResult.reason,
        estimatedCost: policyResult.estimatedCost,
        expectedBenefit: policyResult.expectedBenefit,
        policyStatus: policyResult.policyStatus,
        policyChecks: policyResult.policyChecks,
        executed: sessionData.actionExecuted,
        createdAt
      });

      auditLogDocs.push({
        sessionId: sessionData.sessionId,
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
        actionExecuted: sessionData.actionExecuted,
        timestamp: createdAt
      });
    }

    console.log('Inserting sessions in bulk...');
    await Session.insertMany(sessionDocs);
    await RiskAssessment.insertMany(riskAssessmentDocs);
    await ActionDecision.insertMany(actionDecisionDocs);
    await AuditLog.insertMany(auditLogDocs);

    console.log(`✅ Seed Successful! Seeded:
    - 3 Users
    - ${customers.length} Customers
    - ${products.length} Products
    - ${sessionDocs.length} Sessions (with 10,000+ simulated events)
    - ${auditLogDocs.length} Audit Logs
    - 1 Active Campaign
    - 1 Holdout Experiment`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Failed:', error);
    process.exit(1);
  }
}

seedDatabase();
