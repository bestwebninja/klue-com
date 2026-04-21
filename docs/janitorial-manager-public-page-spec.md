# Janitorial Manager Public Page Codex

## Product + Build Specification for Lovable

## Objective

Create a new public-facing page at `/janitorial-manager` inside Kluje.com that serves as:

1. a high-intent SEO landing page for Janitorial Manager
2. a login portal for existing approved Janitorial Manager users
3. a controlled-access request page for new paid users and white-label prospects
4. a bridge to a future standalone enterprise / white-label app

This page is B2B / operator-facing only. It is not a homeowner cleaning-services page.

---

## Navigation Requirements

### Header

Add a highlighted top-level navigation item:

**Janitorial Manager**

Behavior:

* links to `/janitorial-manager`
* visually emphasized compared to standard nav items

### Footer

Add a new footer section:

**Apps**

Under it add:

* **Janitorial Manager**

Behavior:

* links to `/janitorial-manager`

---

## Access Rules

### Existing users

* can log in from this page
* login is for approved users only

### New users

* cannot self-sign up publicly
* must complete a request-access form
* must confirm interest by email
* must be internally reviewed before approval

### Important

Do **not** create a live auth user immediately on public form submission.

---

## CRM / Data Requirements

Use the built-in Janitorial CRM.

### Preferred approach

Create a dedicated intake table:

**`janitorial_access_requests`**

Suggested fields:

* id
* first_name
* surname
* email
* phone
* business_name
* city
* state
* zip_code
* interest_type
* business_stage
* service_focus
* team_size
* monthly_client_goal
* notes
* source_page
* source_campaign
* confirmed_interest
* confirmation_token
* approval_status
* crm_stage
* assigned_salesperson
* created_at
* updated_at

### Fallback

If a dedicated intake table is not practical, use `janitorial_clients_ext` only if the record is clearly marked as a lead-stage prospect and not treated as an active client.

### ZIP Code Requirements

ZIP code must:

* be required
* validate as U.S. ZIP
* be stored as a first-class indexed field
* support territory logic, geo-routing, prospect qualification, and future inquiry routing

Do not bury ZIP inside notes or generic metadata.

---

## Public Form Workflow

### On submit

1. create an intake record
2. set stage/status = `awaiting_email_confirmation`
3. tag source page = `/janitorial-manager`
4. send confirmation email from `kluje.com`

### On confirmation click

1. mark `confirmed_interest = true`
2. move stage/status to `confirmed_interest`
3. create internal follow-up task
4. optionally generate AI-assisted draft email
5. optionally generate AI qualification notes
6. send to internal review pipeline

### Internal pipeline stages

* New request
* Awaiting email confirmation
* Confirmed interest
* Qualified
* Demo / contact scheduled
* Proposal sent
* Approved
* Won
* Lost

---

## Automation Rules

### Required

* no public self-signup
* no public salesperson entry
* no exposure of placeholder API provider settings
* no immediate auth-user creation from form submit

### Optional internal automations

* if `interest_type = White Label Solution`, raise priority
* if `business_stage = Scaling Across Multiple Areas`, flag as expansion / enterprise fit
* if `monthly_client_goal` is high, prioritize internally
* generate internal follow-up task in `janitorial_follow_up_tasks`
* generate stage-based drafts in `janitorial_draft_emails`
* generate qualification notes in `janitorial_ai_insights`

---

## Page Metadata

### SEO Title

**Janitorial Manager by Kluje | Janitorial Business Software, Automation & White Label Platform**

### Meta Description

**Run your janitorial business with quotes, invoices, lead management, automation, and white-label deployment in one platform. Janitorial Manager by Kluje is built for cleaning companies ready to grow.**

### URL

`/janitorial-manager`

### H1

**Run Your Janitorial Business on Automation**

---

## Page Structure + Exact Copy

### Section 1 — Hero

**Eyebrow**
Janitorial Manager by Kluje

**Headline**
Run Your Janitorial Business on Automation

**Subheadline**
Manage clients, quotes, invoices, workflows, and growth from one platform built for janitorial operators, commercial cleaning businesses, and white-label partners.

**Supporting Copy**
Janitorial Manager helps cleaning businesses run faster, respond better, and grow smarter with one system for operations, lead flow, automation, and client management.

**Primary Button**
Janitorial User Login

**Secondary Button**
Request Access

**Tertiary Text Link**
Explore White Label Options

**Trust Strip**
Built for janitorial operators, commercial cleaning teams, and white-label growth partners across the U.S.

---

### Section 2 — Existing User Login

**Heading**
Already a Janitorial Manager user?

**Copy**
Log in to access your dashboard, manage clients, send quotes and invoices, track jobs, and keep your janitorial business running from one place.

**Button**
Login to Janitorial Manager

**Small Note**
Access is available for approved users only. Public signup is not available on this page.

**Login UI Title**
Janitorial Manager Login

**Login UI Subtext**
Enter your approved account details to access your Janitorial Manager workspace.

**Login Fields**

* Email Address
* Password

**Login Actions**

* Log In
* Forgot Password?

**Helper Text**
Need access? Request approval below.

---

### Section 3 — What It Does

**Heading**
A Complete Operating System for Janitorial Businesses

**Intro**
Janitorial Manager is built to help cleaning businesses centralize operations, streamline client management, automate repetitive work, and scale with more control.

**Feature Cards**

1. **Client & Lead Management**
   Track prospects, customers, and ongoing relationships in one organized system.

2. **Quotes & Invoices**
   Create, manage, and send branded quotes and invoices with less manual work.

3. **Operational Visibility**
   Keep jobs, workflows, and follow-up processes visible so your team stays aligned.

4. **Automation Built In**
   Reduce admin time with smart workflows for reminders, updates, and internal processes.

5. **Growth Support**
   Use stronger process, better response speed, and localized expansion strategies to win more business.

6. **White Label Ready**
   Launch a branded version on your own domain with company branding and automation configured around your team.

---

### Section 4 — Who It’s For

**Heading**
Built for Janitorial Operators Ready to Grow

**Intro**
Whether you’re just starting or already managing a growing operation, Janitorial Manager is designed to give you better systems, cleaner workflows, and more room to scale.

**Bullets**

* Solo janitorial operators
* Commercial cleaning companies
* Residential + commercial cleaning teams
* Multi-location cleaning businesses
* Entrepreneurs starting a janitorial company
* Owners who want a branded white-label platform

---

### Section 5 — Why It Matters

**Heading**
Most Businesses Don’t Need More Tools. They Need One Better System.

**Copy**
Too many janitorial businesses operate across disconnected spreadsheets, inboxes, notes, and manual follow-up. Janitorial Manager brings quoting, invoicing, client tracking, workflows, and growth support into one unified platform.

**Supporting Bullets**

* Less admin friction
* Faster response times
* More organized customer handling
* Better team visibility
* Stronger follow-up
* Better platform foundation for scaling

---

### Section 6 — Pricing

**Heading**
Plans for Operators, Growing Teams, and White-Label Partners

**Intro**
Choose the setup that fits your stage, from getting started to launching a fully branded janitorial platform on your own domain.

#### Starter

**Subtitle**
For solo operators getting established

**Price**
$97/mo

**Features**

* Branded workspace
* Client and lead management
* Basic quote workflow
* Basic invoice workflow
* Core operational tracking
* Email support

**Button**
Start with Starter

#### Growth

**Subtitle**
For growing janitorial businesses ready to scale locally

**Price**
$297/mo

**Features**

* Everything in Starter
* Advanced workflow support
* CRM and pipeline visibility
* Automation enhancements
* Guided onboarding
* Growth-focused setup

**Button**
Choose Growth

#### White Label

**Subtitle**
For operators who want full brand ownership

**Price**
From $997/mo

**Features**

* Everything in Growth
* Custom domain setup
* Complete company branding
* AI automation built around your team
* Branded quote and invoice PDFs
* Onboarding and go-live support

**Button**
Explore White Label

---

### Section 7 — White Label

**Eyebrow**
White Label Deployment

**Heading**
Launch Your Own Branded Janitorial Platform

**Copy**
Offer a modern janitorial operating system under your own brand without building the software from scratch. We configure the platform around your business so you can operate, grow, and deliver under your own identity.

**Included Heading**
What’s Included

**Items**

* **Custom domain setup**
  We configure your platform on your own branded domain for a seamless client and team experience.

* **Full AI automation built around your team**
  We tailor workflows around your operations, service delivery, and growth process.

* **Complete company branding**
  Your logo, colors, contact details, and visual identity are applied throughout the experience.

* **Branded quote and invoice PDFs**
  Client-facing documents are fully aligned with your brand.

* **Onboarding and go-live support**
  We help you launch properly so your system is live, configured, and ready to use.

**Hook**
Own the platform. Automate the work. Scale without hiring.

**Button**
Request White Label Access

---

### Section 8 — SEO / Growth

**Heading**
Built for Janitorial Growth Across Local Markets

**Copy**
Janitorial Manager is designed for cleaning businesses that want stronger operations and stronger growth. From lead handling and customer workflows to branded documents and localized market positioning, the platform supports the way modern janitorial businesses scale.

**Subheading**
Use Janitorial Manager to strengthen:

**Bullets**

* quote response time
* invoicing consistency
* customer organization
* workflow visibility
* local expansion readiness
* operational follow-through

**SEO Paragraph**
If you are looking for janitorial management software, cleaning business software, janitorial invoicing software, or a white-label cleaning platform, Janitorial Manager is built to support operators who want more than a generic tool. It is designed for businesses that need better control, more automation, and a stronger foundation for local and regional growth.

---

### Section 9 — Territory / ZIP Positioning

**Heading**
Territory Matters

**Copy**
ZIP code is a critical signal for how janitorial businesses grow. It helps identify market location, service territory, local demand, and future lead-routing opportunities.

**Supporting Copy**
That is why our access request process asks for ZIP code up front. It helps us understand where your business operates, where you want to grow, and how Janitorial Manager can support geo-based opportunity and inquiry flow over time.

---

### Section 10 — Access Request Form

**Heading**
Apply for Access

**Subheadline**
Janitorial Manager is currently available by approval only for paid users and white-label partners.

**Intro**
Complete the form below to request access. Once submitted, we’ll send a confirmation email from kluje.com so you can verify your interest.

**Fields**

* First Name
* Surname
* Email Address
* Phone Number
* Business Name
* City
* State
* ZIP Code
* I’m Interested In
* Business Stage
* Service Focus
* Team Size
* Monthly Client Goal
* Tell Us What You Need Help With

**Dropdown Options**

**I’m Interested In**

* Janitorial Manager Paid Access
* White Label Solution
* Not Sure Yet

**Business Stage**

* Just Starting
* Operating Already
* Growing Locally
* Scaling Across Multiple Areas

**Service Focus**

* Commercial
* Residential
* Both

**Team Size**

* Just Me
* 2–5
* 6–15
* 16+

**Monthly Client Goal**

* 1–10
* 11–25
* 26–50
* 50+

**ZIP Help Text**
Your ZIP code helps us understand your service territory and future geo-based opportunity.

**Notes Placeholder**
Tell us about your business, goals, territory, or what you want the platform to help you automate.

**Consent Checkbox**
I agree to be contacted by Kluje regarding Janitorial Manager and understand that access is reviewed before approval.

**Consent Supporting Text**
After submitting, you’ll receive an email from kluje.com asking you to confirm your interest.

**Submit Button**
Request Access

---

### Section 11 — Success State

**Heading**
Check Your Email

**Copy**
We’ve received your request. Please confirm your interest using the email we just sent from kluje.com.

**Subcopy**
Once confirmed, our team will review your request for Janitorial Manager paid access or white-label eligibility.

**Buttons**

* Return to Page
* Janitorial User Login

---

### Section 12 — Confirmation Email

**Subject**
Confirm Your Interest in Janitorial Manager

**Body**
Hi [First Name],

We received your request to learn more about Janitorial Manager by Kluje.

Please confirm your interest by clicking the link below. Once confirmed, our team will review your request for:

* Janitorial Manager paid access
* or White Label deployment

[Confirm My Interest]

Thanks,
Kluje Team

---

### Section 13 — FAQ

**Heading**
Frequently Asked Questions

1. **Can I sign up instantly?**
   No. Janitorial Manager is currently approval-based. New users must request access and confirm interest by email before review.

2. **Can existing users log in here?**
   Yes. Approved Janitorial Manager users can log in directly from this page.

3. **Is public signup available?**
   No. This page is designed for login and access requests only. Public self-signup is not enabled.

4. **Why do you ask for ZIP code?**
   ZIP code helps us understand your service area, territory, and future geo-based opportunity. It also supports regional strategy and routing logic for qualified users.

5. **Who is Janitorial Manager for?**
   Janitorial Manager is built for janitorial operators, cleaning companies, commercial cleaning teams, and white-label partners.

6. **What is the difference between standard access and white label?**
   Standard access gives you the platform to run your business. White label gives you a branded deployment on your own domain with your own company identity and tailored automation.

7. **Can I use my own domain?**
   Yes. White-label plans are designed for businesses that want their own branded deployment and domain setup.

8. **What happens after I submit the form?**
   You’ll receive a confirmation email from kluje.com. After you confirm your interest, your request is reviewed and routed into the next step.

---

### Section 14 — Final CTA

**Heading**
Everything You Need to Run and Grow a Janitorial Business in One Platform

**Copy**
Whether you need better operational control, faster workflow execution, or a fully branded white-label deployment, Janitorial Manager gives you the platform foundation to move forward.

**Buttons**

* Janitorial User Login
* Request Access
* Explore White Label

---

## Technical Notes for Lovable

* make page indexable and SEO-focused
* keep it separate from homeowner cleaning-service funnels
* treat this as a B2B / operator-facing page
* login path is for existing approved users only
* request access path is for prospects only
* create intake record first, not auth user
* require email confirmation before internal review
* use built-in Janitorial CRM for intake workflow
* create internal follow-up tasks after confirmation
* keep white-label positioning prominent
* structure page so it can later support standalone CleanScope / enterprise deployment
