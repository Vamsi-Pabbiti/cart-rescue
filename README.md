 
AI BUILD 2026  ·  E-COMMERCE IN INDIA  ·  STUDENT EDITION 
Track 2 · Cart Rescue 
Abandonment Diagnosis & Remediation Agent 
 
CATEGORY 
Growth, Conversion & Payments 
DIFFICULTY 
Intermediate 
TEAM SIZE 
2–4 participants 
 
Core AI focus: Real-time abandonment-risk scoring agent with policy-bounded remediation 
HOW THIS TRACK GETS SCORED 
Dimension Weight 
Business Impact 20% 
AI Innovation & Depth 20% 
Technical Excellence 20% 
Enterprise Architecture & Integration 15% 
User Experience 10% 
Scalability, Security & Cost 10% 
Presentation 5% 
 
THE PROBLEM 
Indian shoppers abandon carts for very different reasons — a surprise shipping cost, a failed UPI/netbanking payment, a 
disappointing delivery date, price-checking another app, no COD option, or plain friction in the form. Most sites respond the 
same way regardless: blast a discount coupon. That erodes margin on people who would have bought anyway, and does 
nothing for someone whose payment simply failed. 
YOUR MISSION 
Build an AI system that scores each active session for abandonment risk in real time, using signals already present in 
the data — payment attempts and failures, cart-value changes, time-on-page, browsing pattern — and recommends 
one action per session from a bounded menu, where "do nothing" is a valid choice, not just "send a discount." 
 
SUCCESS LOOKS LIKE 
• Correctly flag sessions likely to abandon, validated against real held-out purchase/no-purchase outcomes 
• Distinguish a payment-failure session from a browsing/price-shopping session, using signals already in the data 
• Recommend one clear action per session — including "do nothing" 
• Spend less discount per recovered cart — don't discount people who'd have converted anyway 
AI Build 2026 · Cart Rescue · Student Problem Statement 
WHAT YOU'LL WORK WITH — AND THE RULES THAT COME WITH IT 
DATA YOUR SOLUTION SHOULD USE 
• Session clickstream and funnel events 
• Cart contents and value 
• Payment attempt & failure signals (where the dataset 
includes them) 
• Purchase / no-purchase outcome per session — your 
ground-truth label to validate against 
Not handed to you at the event — but every item here is covered by 
the real datasets below. 
GUARDRAILS YOU MUST RESPECT 
• Margin Guardrail: operate within a per-user and 
per-campaign discount budget; report incremental 
margin impact, not just recovery rate. 
• Prove It Works: validate your recommended actions 
against a holdout control group — correlation-only claims 
of "it worked" don't count. 
• Consent & Channel Policy: respect user communication 
preferences and Indian rules (TRAI/DND for SMS, 
WhatsApp opt-in). 
• Auditability: log the risk score, the signals behind it, and 
the chosen action for every session. 
• Latency: real-time in-session nudges (e.g., exit intent) 
must trigger within a few hundred milliseconds. 
SYSTEMS & APIS YOUR SOLUTION WOULD INTEGRATE WITH 
• CRM & Notification API (email, SMS, WhatsApp, push) 
Real, free options exist below (SendGrid for email, Twilio for SMS/WhatsApp) — nothing here needs a mock. Analytics and payment-gateway data 
already come from the datasets below; the coupon logic and holdout test are yours to build, not external systems. 
GENERAL BUILD PRINCIPLES (APPLIES TO EVERY TRACK) 
• Prefer several specialized, cooperating agents over one giant mega-prompt. 
• Use cheap/fast models for routine decisions and save expensive reasoning for the high-stakes ones — report a rough 
cost-per-decision. 
• Where practical, show that a smaller open-source model, RAG, or a classical solver could replace constant calls to an 
expensive commercial LLM. 
• Add a self-check step: have the system review its own output against the Business Goals before it's final. 
WHAT TO DELIVER 
✓ A working MVP demonstrating the full user journey for this track 
✓ A short tech write-up: architecture diagram, AI workflow, and stack used 
✓ Source code in a GitHub repo with setup instructions 
✓ A short business pitch: problem, solution, value, rough cost-per-transaction, what's next 
✓ A live demo (max 8 minutes): the problem, your solution, a walkthrough, your AI architecture, impact & roadmap 
AI Build 2026 · Cart Rescue · Student Problem Statement 
DATASETS TO GET YOU STARTED 
1. E-commerce Clickstream and Transaction Dataset 
Kaggle 
Session-level page views, clicks, product views and purchases — for direct funnel-path modelling. 
2. E-commerce Transactions + Clickstream 
Kaggle 
Multi-table: customers, products, sessions, clickstream events, orders, order items, reviews. 
3. Ecommerce Clickstream Dataset (5.27 GB) 
Kaggle 
Large-scale logs with explicit cart actions — good for real training rather than toy demos. 
4. e-Shop Clickstream Dataset 
Kaggle 
A classic clickstream benchmark — useful as a clean baseline. 
5. SendGrid 
Twilio — permanent free tier 
100 emails/day free, forever, real API — genuinely usable for cart-recovery emails, not a trial that expires mid-hackathon. 
6. Twilio SMS/WhatsApp 
Free trial credits 
Real SMS/WhatsApp sending on a trial account — enough to demo a live recovery-nudge flow, not a mock. 
These are real, ready-to-load datasets and live APIs that cover everything this track needs, including the system above. Nothing here needs a mock. 
 
AI Build 2026 · Cart Rescue · Student Problem Statement 
