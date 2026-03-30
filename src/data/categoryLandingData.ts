/**
 * Kluje service categories
 */

export interface CategoryLandingInfo {
  slug: string;
  name: string;
  heroImage: string;
  tagline: string;
  article: string[];
  subcategories: string[];
  stats: { label: string; value: string }[];
  faqs: { q: string; a: string }[];
  internalLinks: { label: string; href: string }[];
}

const categories: CategoryLandingInfo[] = [
  {
    slug: 'design-and-build',
    name: 'Design & Build',
    heroImage: '/src/assets/hero-commercial.jpg',
    tagline: 'Architecture, design, and full-service build professionals',
    article: [
      'Find licensed architects, interior designers, and design-build contractors across the US.',
      'From concept to completion, our professionals handle every phase of your project.',
      'Kluje connects you with verified design and build experts for residential and commercial projects.',
      'Compare portfolios, get quotes, and hire the right team for your vision.',
    ],
    subcategories: ['Architect', 'Interior Designer', 'General Contractor', '3D Rendering', 'CAD Drafting', 'Project Management'],
    stats: [
      { label: 'Design Professionals', value: '80k+' },
      { label: 'Projects Completed', value: '200k+' },
      { label: 'Avg Response Time', value: '24hrs' },
    ],
    faqs: [
      { q: 'What is a design-build firm?', a: 'A design-build firm handles both design and construction under one contract, streamlining the process.' },
      { q: 'How much does an architect cost?', a: 'Typically 5–15% of total project cost, or $100–$250/hour for standalone design services.' },
    ],
    internalLinks: [
      { label: 'Post a Design & Build Job', href: '/post-job' },
      { label: 'Browse Design Professionals', href: '/browse-providers' },
    ],
  },
  {
    slug: 'smart-security',
    name: 'Smart Security',
    heroImage: '/src/assets/hero-it-services.jpg',
    tagline: 'Smart home security, access control, and surveillance systems',
    article: [
      'Protect your property with professional smart security installation and monitoring services.',
      'From CCTV and access control to biometric systems and smart locks, our pros cover it all.',
      'Licensed security specialists install, configure, and monitor residential and commercial systems.',
      'Get multiple quotes from verified security professionals in your area.',
    ],
    subcategories: ['CCTV Installation', 'Access Control', 'Smart Locks', 'Alarm Systems', 'Biometric Systems', 'Security Monitoring'],
    stats: [
      { label: 'Security Installers', value: '30k+' },
      { label: 'Market Size', value: '$50bn+' },
      { label: 'Avg Install Time', value: '1–2 days' },
    ],
    faqs: [
      { q: 'Do I need a permit for security cameras?', a: 'Generally no for private property, but commercial installations may require permits in some jurisdictions.' },
      { q: 'What is a smart security system?', a: 'A connected system combining cameras, sensors, locks, and monitoring accessible from your phone.' },
    ],
    internalLinks: [
      { label: 'Post a Security Job', href: '/post-job' },
      { label: 'Browse Security Professionals', href: '/browse-providers' },
    ],
  },
  {
    slug: 'build-ops',
    name: 'Build Ops',
    heroImage: '/src/assets/hero-contractor.jpg',
    tagline: 'General contractors, subcontractors, and specialist trades',
    article: [
      'Find licensed general contractors and specialist tradespeople across the United States.',
      'From foundations to final finishes, our verified contractor network handles every scope.',
      'All providers carry appropriate licensing, insurance, and bonding for your protection.',
      'Post a job and receive competitive quotes from multiple contractors in your area.',
    ],
    subcategories: ['General Contractor', 'Electrician', 'Plumber', 'HVAC', 'Roofing', 'Concrete', 'Framing', 'Painting'],
    stats: [
      { label: 'Licensed Contractors', value: '700k+' },
      { label: 'Avg Quotes Received', value: '3+' },
      { label: 'Market Size', value: '$600bn' },
    ],
    faqs: [
      { q: 'How do I verify a contractor is licensed?', a: 'Check your state contractor licensing board. On Kluje, verified providers display their credentials.' },
      { q: 'What should a contractor quote include?', a: 'Scope of work, materials, labor, timeline, payment schedule, and warranty terms.' },
    ],
    internalLinks: [
      { label: 'Post a Build Ops Job', href: '/post-job' },
      { label: 'Browse Contractors', href: '/browse-providers' },
    ],
  },
  {
    slug: 'capital',
    name: 'Capital',
    heroImage: '/src/assets/hero-business.jpg',
    tagline: 'Finance, accounting, and business capital services',
    article: [
      'Connect with CPAs, financial advisors, lenders, and capital specialists nationwide.',
      'Covering tax planning, business accounting, construction financing, and investment funding.',
      'Our network includes professionals specialized in contractor, real estate, and small business finance.',
      'Get consultations and proposals from qualified finance professionals.',
    ],
    subcategories: ['CPA', 'Financial Advisor', 'Business Loans', 'Construction Finance', 'Tax Preparation', 'Bookkeeping', 'Auditing'],
    stats: [
      { label: 'Finance Professionals', value: '100k+' },
      { label: 'Capital Deployed', value: '$5bn+' },
      { label: 'Avg Consultation', value: '$150–300/hr' },
    ],
    faqs: [
      { q: 'What types of construction loans are available?', a: 'Construction-to-permanent loans, renovation loans (203k), hard money loans, and business lines of credit.' },
      { q: 'Do I need a CPA for my contracting business?', a: 'Strongly recommended — contractors have complex tax situations including depreciation, job costing, and payroll.' },
    ],
    internalLinks: [
      { label: 'Post a Finance Job', href: '/post-job' },
      { label: 'Browse Finance Professionals', href: '/browse-providers' },
    ],
  },
  {
    slug: 'ai-core',
    name: 'AI Core',
    heroImage: '/src/assets/hero-it-services.jpg',
    tagline: 'AI operations, automation, and intelligent business solutions',
    article: [
      'Leverage AI and automation to streamline your construction and real estate operations.',
      'From document processing to AI-powered scheduling, our specialists implement tools that save time.',
      'Experts in AI workflow automation for contractors, realtors, legal, and business services.',
      'Book consultations with AI implementation specialists and transform your operations.',
    ],
    subcategories: ['AI Automation', 'Workflow Optimization', 'Document AI', 'Data Analytics', 'Chatbots', 'AI Implementation'],
    stats: [
      { label: 'AI Specialists', value: '500+' },
      { label: 'Time Saved (avg)', value: '20 hrs/week' },
      { label: 'Cost Reduction', value: '30–50%' },
    ],
    faqs: [
      { q: 'How can AI help my construction business?', a: 'AI can automate scheduling, invoicing, document review, lead qualification, and safety monitoring.' },
      { q: 'Is AI implementation expensive?', a: 'Initial setup varies; most solutions deliver ROI within 3–6 months through efficiency gains.' },
    ],
    internalLinks: [
      { label: 'Post an AI Project', href: '/post-job' },
      { label: 'Browse AI Specialists', href: '/browse-providers' },
    ],
  },
  {
    slug: 'legal-shield',
    name: 'Legal Shield',
    heroImage: '/src/assets/hero-legal.jpg',
    tagline: 'Attorneys, legal consulting, and compliance services',
    article: [
      'Find qualified attorneys for construction law, real estate, contracts, and business compliance.',
      'Our network includes bar-verified attorneys across all major practice areas and jurisdictions.',
      'Services include contract review, dispute resolution, lien law, and regulatory compliance.',
      'Connect with experienced legal professionals and receive competitive proposals.',
    ],
    subcategories: ['Construction Law', 'Real Estate Law', 'Contract Review', 'Business Law', 'Dispute Resolution', 'Compliance'],
    stats: [
      { label: 'Licensed Attorneys', value: '400k+' },
      { label: 'Practice Areas', value: '30+' },
      { label: 'Bar Verified', value: '100%' },
    ],
    faqs: [
      { q: 'When do contractors need an attorney?', a: 'For contract disputes, mechanic liens, licensing issues, business formation, and regulatory compliance.' },
      { q: 'How much do construction attorneys cost?', a: 'Typically $200–$450/hour; many offer flat fees for contract review and standard filings.' },
    ],
    internalLinks: [
      { label: 'Post a Legal Services Job', href: '/post-job' },
      { label: 'Browse Attorneys', href: '/browse-providers' },
    ],
  },
  {
    slug: 'connections',
    name: 'Connections',
    heroImage: '/src/assets/hero-business.jpg',
    tagline: 'Professional networking, consulting, and business connections',
    article: [
      'Connect with business consultants, project managers, and industry professionals across the US.',
      'Expand your network with vetted professionals in construction, real estate, and technology.',
      'Services include business strategy, operational consulting, staffing, and professional development.',
      'Find the right connections to grow your business and close more deals.',
    ],
    subcategories: ['Business Consultant', 'Project Manager', 'HR Consulting', 'Marketing', 'Business Development', 'Staffing'],
    stats: [
      { label: 'Professionals', value: '150k+' },
      { label: 'Industries Served', value: '20+' },
      { label: 'Avg Engagement', value: '$10k–100k' },
    ],
    faqs: [
      { q: 'What is a business development consultant?', a: 'They identify growth opportunities, build partnerships, and create strategies to expand revenue.' },
      { q: 'How do I find the right business consultant?', a: 'Look for industry-specific experience, verifiable results, and clear deliverables.' },
    ],
    internalLinks: [
      { label: 'Post a Connections Job', href: '/post-job' },
      { label: 'Browse Consultants', href: '/browse-providers' },
    ],
  },
  {
    slug: 'property-deals',
    name: 'Property Deals',
    heroImage: '/src/assets/hero-home-services.jpg',
    tagline: 'Real estate transactions, investment, and property deals',
    article: [
      'Access licensed real estate professionals for buying, selling, and investment properties.',
      'Comprehensive services including property valuation, negotiation, investment analysis, and closing.',
      'Expert agents specializing in fix-and-flip, buy-and-hold, commercial, and residential deals.',
      'Get market analysis and investment recommendations from experienced professionals.',
    ],
    subcategories: ['Residential Sales', 'Commercial Real Estate', 'Fix & Flip', 'Buy & Hold', 'Property Valuation', 'Wholesaling'],
    stats: [
      { label: 'Real Estate Pros', value: '2M+' },
      { label: 'Annual Listings', value: '5M+' },
      { label: 'Market Value', value: '$30T+' },
    ],
    faqs: [
      { q: 'What is wholesaling in real estate?', a: 'Wholesalers contract a property and assign the contract to a buyer for a fee, without taking title.' },
      { q: 'How do I find investment properties?', a: 'Work with agents specializing in investment real estate; look for off-market deals, foreclosures, and distressed properties.' },
    ],
    internalLinks: [
      { label: 'Post a Property Deals Job', href: '/post-job' },
      { label: 'Browse Real Estate Professionals', href: '/browse-providers' },
    ],
  },
  {
    slug: 'sales-agents',
    name: 'Sales Agents',
    heroImage: '/src/assets/hero-home-services.jpg',
    tagline: 'Realtor agents and property sales specialists',
    article: [
      'Work with experienced realtor agents for residential and commercial property transactions.',
      'Buyer representation, seller listing, lease negotiation, and investment advisory services.',
      'Our agents are NAR-certified with deep local market knowledge and proven track records.',
      'Find the right agent to buy, sell, or lease your property at the best terms.',
    ],
    subcategories: ['Buyer Agent', 'Seller Agent', 'Listing Agent', 'Lease Agent', 'Commercial Agent', 'Investment Advisor'],
    stats: [
      { label: 'NAR Agents', value: '1.3M+' },
      { label: 'Annual Sales', value: '$1.5T' },
      { label: 'Avg Transaction', value: '$400k' },
    ],
    faqs: [
      { q: 'What does a buyer agent do?', a: 'Represents the purchaser, identifies properties, negotiates price, and guides through closing.' },
      { q: 'How are agent commissions structured?', a: 'Typically 2.5–3% per side; buyer agents are usually compensated by the seller.' },
    ],
    internalLinks: [
      { label: 'Post a Sales Agent Job', href: '/post-job' },
      { label: 'Browse Sales Agents', href: '/browse-providers' },
    ],
  },
  {
    slug: 'living-solutions',
    name: 'Living Solutions',
    heroImage: '/src/assets/hero-home-services.jpg',
    tagline: 'Residential services for homeowners and renters',
    article: [
      'Complete home services for residential properties — from renovations to routine maintenance.',
      'Trusted local professionals for repairs, cleaning, landscaping, and home improvement.',
      'All providers are licensed, insured, and background-checked for your peace of mind.',
      'Get free quotes from multiple providers and choose the best fit for your home.',
    ],
    subcategories: ['Renovation', 'Home Repair', 'Cleaning', 'Landscaping', 'Interior Design', 'Appliance Repair', 'Moving'],
    stats: [
      { label: 'Home Service Pros', value: '500k+' },
      { label: 'Market Size', value: '$400bn' },
      { label: 'Avg Project', value: '$5k–50k' },
    ],
    faqs: [
      { q: 'What home repairs require a permit?', a: 'Structural, electrical, plumbing, and HVAC changes typically require local building permits.' },
      { q: 'How many quotes should I get?', a: 'At least three; comparing quotes helps you evaluate price, timeline, and approach.' },
    ],
    internalLinks: [
      { label: 'Post a Home Services Job', href: '/post-job' },
      { label: 'Browse Home Service Pros', href: '/browse-providers' },
    ],
  },
  {
    slug: 'it-services',
    name: 'IT Services',
    heroImage: '/src/assets/hero-it-services.jpg',
    tagline: 'Web design, software development, cybersecurity, and managed IT for US businesses',
    article: [
      'Find expert US-based IT and digital service providers for your business — from web design and custom software to cybersecurity and managed IT support.',
      'Whether you run a construction firm, real estate agency, or small business, Kluje connects you with verified IT professionals who understand your industry.',
      'Our network covers the full technology stack: front-end and back-end development, cloud infrastructure, SEO, data analytics, and enterprise IT support.',
      'Post your IT project, compare portfolios and quotes from multiple providers, and hire the right team with confidence.',
    ],
    subcategories: [
      'Web Design', 'Software Development', 'SEO & Digital Marketing', 'Cybersecurity',
      'Cloud Services', 'IT Support & MSP', 'Mobile App Development', 'Database Management',
      'Network Infrastructure', 'UI/UX Design', 'E-Commerce Development', 'DevOps & CI/CD',
    ],
    stats: [
      { label: 'IT Professionals', value: '50k+' },
      { label: 'US Market Size', value: '$600bn+' },
      { label: 'Avg Project Delivery', value: '2–8 wks' },
    ],
    faqs: [
      { q: 'How much does a business website cost?', a: 'A professional business website typically ranges from $2,000–$15,000 depending on complexity, custom features, and the agency you choose. E-commerce sites run higher.' },
      { q: 'What is a Managed Service Provider (MSP)?', a: 'An MSP handles your IT infrastructure on an ongoing basis — network monitoring, security patches, helpdesk support, and backups — for a predictable monthly fee.' },
      { q: 'Do I need cybersecurity services for a small business?', a: 'Yes. Over 43% of cyberattacks target small businesses. Basic measures like endpoint protection, secure backups, and employee training are essential.' },
      { q: 'How do I choose between custom software and off-the-shelf tools?', a: 'Off-the-shelf tools are faster and cheaper upfront; custom software pays off when your workflow is unique, you need deep integrations, or you want a competitive advantage.' },
    ],
    internalLinks: [
      { label: 'Post an IT Project', href: '/post-job' },
      { label: 'Browse IT Professionals', href: '/browse-providers' },
      { label: 'Explore AI Core Services', href: '/services/ai-core' },
      { label: 'Smart Security Systems', href: '/services/smart-security' },
      { label: 'Ask an IT Expert', href: '/ask-expert' },
    ],
  },
  {
    slug: 'materials',
    name: 'Materials',
    heroImage: '/src/assets/hero-commercial.jpg',
    tagline: 'Building materials, supplies, and wholesale distributors',
    article: [
      'Source building materials and supplies directly from verified wholesale suppliers across the US.',
      'Lumber, electrical, plumbing, HVAC, hardware, and specialty materials — all in one place.',
      'Competitive pricing with bulk discounts and professional delivery to your job site.',
      'Compare supplier quotes and secure materials for your projects faster.',
    ],
    subcategories: ['Lumber', 'Electrical Supply', 'Plumbing Supply', 'HVAC Supply', 'Hardware', 'Concrete & Masonry', 'Specialty Materials'],
    stats: [
      { label: 'Verified Suppliers', value: '10k+' },
      { label: 'Product Categories', value: '50+' },
      { label: 'Bulk Discount', value: 'Up to 30%' },
    ],
    faqs: [
      { q: 'Can homeowners buy from building suppliers?', a: 'Yes; while some offer contractor-only pricing, most suppliers welcome all customers.' },
      { q: 'Do suppliers deliver to job sites?', a: 'Most suppliers offer delivery; confirm minimums and lead times when requesting quotes.' },
    ],
    internalLinks: [
      { label: 'Post a Materials Request', href: '/post-job' },
      { label: 'Browse Suppliers', href: '/browse-providers' },
    ],
  },
];

export default categories;

export function getCategoryBySlug(slug: string): CategoryLandingInfo | undefined {
  return categories.find((c) => c.slug === slug);
}
