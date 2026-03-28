/**
 * Kluje service categories - 10 main categories for the platform
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
    slug: 'architecture',
    name: 'Architecture',
    heroImage: '/src/assets/hero-commercial.jpg',
    tagline: 'Find architects for residential and commercial design',
    article: [
      'Professional architects across the US are ready to bring your vision to life.',
      'From conceptual design to construction administration, our architects are licensed and experienced.',
      'Kluje connects you with qualified architects in your area for residential, commercial, and specialized projects.',
      'Browse portfolios, compare pricing, and get detailed quotes from multiple architects before deciding.',
    ],
    subcategories: ['Residential Design', 'Commercial Design', '3D Rendering', 'Renovation Design', 'CAD Drafting'],
    stats: [
      { label: 'Licensed Architects', value: '50k+' },
      { label: 'Active Projects', value: '1000+' },
      { label: 'Avg Response Time', value: '24hrs' },
    ],
    faqs: [
      { q: 'How much does an architect cost?', a: 'Fees typically range from $50-150/hour or 5-10% of project cost, depending on scope.' },
      { q: 'Do I need an architect for my project?', a: 'Required for major structural changes; recommended for any new construction or complex renovations.' },
    ],
    internalLinks: [
      { label: 'Post an Architecture Job', href: '/post-job' },
      { label: 'Browse Architects', href: '/browse-providers' },
    ],
  },
  {
    slug: 'contractors',
    name: 'Contractors',
    heroImage: '/src/assets/hero-contractor.jpg',
    tagline: 'General contractors, subcontractors, and specialized trades',
    article: [
      'Find licensed general contractors and specialized trades across the United States.',
      'From foundation work to final finishes, our contractor network handles projects of all sizes.',
      'Verified credentials, insurance, and bonding ensure professional workmanship.',
      'Post your project and receive competitive quotes from multiple contractors in your area.',
    ],
    subcategories: ['General Contractor', 'Electrician', 'Plumber', 'HVAC', 'Carpenter', 'Roofing', 'Painting'],
    stats: [
      { label: 'Licensed Contractors', value: '700k+' },
      { label: 'Average Quotes', value: '3+' },
      { label: 'Market Size', value: '$600bn' },
    ],
    faqs: [
      { q: 'How do I verify a contractor?', a: 'Check state licensing boards and verify insurance. On Kluje, all providers display credentials.' },
      { q: 'What should I ask a contractor?', a: 'Ask about experience, timeline, warranty, payment schedule, and references.' },
    ],
    internalLinks: [
      { label: 'Post a Contractor Job', href: '/post-job' },
      { label: 'Browse Contractors', href: '/browse-providers' },
    ],
  },
  {
    slug: 'finance',
    name: 'Finance',
    heroImage: '/src/assets/hero-business.jpg',
    tagline: 'Financial advisors, accountants, and business services',
    article: [
      'Connect with CPAs, financial advisors, and business accountants nationwide.',
      'Get help with tax planning, business accounting, financial planning, and auditing.',
      'Our network includes specialized professionals for contractors, real estate, and small business.',
      'Receive quotes and consultations from qualified finance professionals.',
    ],
    subcategories: ['CPA', 'Financial Advisor', 'Tax Preparation', 'Bookkeeping', 'Auditing', 'Business Planning'],
    stats: [
      { label: 'Finance Professionals', value: '100k+' },
      { label: 'Business Sectors', value: '20+' },
      { label: 'Avg Consultation', value: '$150-300/hr' },
    ],
    faqs: [
      { q: 'Do I need a CPA?', a: 'Required for complex business structures, multi-state operations, and significant investments.' },
      { q: 'What is bookkeeping vs accounting?', a: 'Bookkeeping records transactions; accounting analyzes and reports financial data.' },
    ],
    internalLinks: [
      { label: 'Post a Finance Job', href: '/post-job' },
      { label: 'Browse Finance Professionals', href: '/browse-providers' },
    ],
  },
  {
    slug: 'kluje-ai-ops',
    name: 'Kluje AI Ops',
    heroImage: '/src/assets/hero-it-services.jpg',
    tagline: 'AI operations, automation, and intelligent business solutions',
    article: [
      'Leverage AI and automation to streamline your business operations.',
      'Our AI operations specialists help contractors, real estate, and service businesses automate workflows.',
      'From document processing to AI-powered scheduling, discover how AI can save time and money.',
      'Get expert guidance on implementing AI tools specific to your industry.',
    ],
    subcategories: ['AI Automation', 'Workflow Optimization', 'Document Processing', 'Data Analysis', 'AI Implementation'],
    stats: [
      { label: 'AI Specialists', value: '500+' },
      { label: 'Time Saved (avg)', value: '20 hrs/week' },
      { label: 'Cost Reduction', value: '30-50%' },
    ],
    faqs: [
      { q: 'How can AI help my business?', a: 'AI can automate scheduling, invoicing, document review, lead qualification, and reporting.' },
      { q: 'Is AI implementation expensive?', a: 'Initial setup varies; many solutions pay for themselves within 3-6 months through time savings.' },
    ],
    internalLinks: [
      { label: 'Post an AI/Ops Job', href: '/post-job' },
      { label: 'Browse AI Specialists', href: '/browse-providers' },
    ],
  },
  {
    slug: 'legal-services',
    name: 'Legal Services',
    heroImage: '/src/assets/hero-legal.jpg',
    tagline: 'Attorneys, paralegals, and legal consulting',
    article: [
      'Find qualified attorneys and legal professionals for business, personal, and real estate matters.',
      'Our network includes licensed attorneys across all practice areas and jurisdictions.',
      'Get legal advice, contract review, litigation support, and business consulting.',
      'Connect with bar-verified attorneys and receive competitive rates.',
    ],
    subcategories: ['General Practice', 'Real Estate Law', 'Business Law', 'Contract Review', 'Litigation', 'Estate Planning'],
    stats: [
      { label: 'Licensed Attorneys', value: '400k+' },
      { label: 'Practice Areas', value: '30+' },
      { label: 'Bar Verified', value: '100%' },
    ],
    faqs: [
      { q: 'When do I need an attorney?', a: 'For contracts, disputes, business formation, real estate transactions, and legal compliance.' },
      { q: 'How much do attorneys cost?', a: 'Rates vary; typical range $150-400/hour. Many offer flat fees for specific services.' },
    ],
    internalLinks: [
      { label: 'Post a Legal Services Job', href: '/post-job' },
      { label: 'Browse Attorneys', href: '/browse-providers' },
    ],
  },
  {
    slug: 'professional',
    name: 'Professional',
    heroImage: '/src/assets/hero-business.jpg',
    tagline: 'Professional services including consulting and management',
    article: [
      'Access a network of business consultants, project managers, and professional service providers.',
      'Expert guidance for business strategy, operational improvement, and professional development.',
      'Industries: construction, real estate, technology, and general business.',
      'Hire professionals for short-term projects or ongoing support.',
    ],
    subcategories: ['Business Consultant', 'Project Manager', 'HR Consulting', 'Marketing', 'Training', 'Staffing'],
    stats: [
      { label: 'Professional Consultants', value: '150k+' },
      { label: 'Industries Served', value: '20+' },
      { label: 'Avg Project Value', value: '$10k-100k' },
    ],
    faqs: [
      { q: 'What is a business consultant?', a: 'Consultants analyze operations and recommend improvements for efficiency, growth, and profitability.' },
      { q: 'How long do consulting projects take?', a: 'Ranges from weeks to months depending on scope; many are scoped as specific deliverables.' },
    ],
    internalLinks: [
      { label: 'Post a Professional Services Job', href: '/post-job' },
      { label: 'Browse Consultants', href: '/browse-providers' },
    ],
  },
  {
    slug: 'real-estate',
    name: 'Real Estate',
    heroImage: '/src/assets/hero-home-services.jpg',
    tagline: 'Real estate agents, brokers, and property specialists',
    article: [
      'Connect with licensed real estate professionals for buying, selling, and investment properties.',
      'Comprehensive services: property search, valuation, negotiation, closing, and investment analysis.',
      'Expert agents across residential, commercial, and investment real estate.',
      'Get market analysis and investment recommendations from experienced professionals.',
    ],
    subcategories: ['Residential Sales', 'Commercial Real Estate', 'Investment Properties', 'Property Management', 'Appraisal'],
    stats: [
      { label: 'Real Estate Professionals', value: '2M+' },
      { label: 'Listings', value: '1M+' },
      { label: 'Market Value', value: '$30T+' },
    ],
    faqs: [
      { q: 'Do I need a real estate agent?', a: 'Agents provide market expertise, negotiation, paperwork management, and buyer/seller networks.' },
      { q: 'What are realtor commissions?', a: 'Typically 5-6% split between buyer and seller agents; negotiable in many markets.' },
    ],
    internalLinks: [
      { label: 'Post a Real Estate Job', href: '/post-job' },
      { label: 'Browse Real Estate Professionals', href: '/browse-providers' },
    ],
  },
  {
    slug: 'realtors',
    name: 'Realtors',
    heroImage: '/src/assets/hero-home-services.jpg',
    tagline: 'Realtor agents and property management specialists',
    article: [
      'Work with experienced realtor agents for residential and commercial property transactions.',
      'Services include property listing, buyer representation, market analysis, and closing coordination.',
      'Our agents are NAR-certified with strong local market knowledge.',
      'Find the right agent for your property goals and budget.',
    ],
    subcategories: ['Buyer Agent', 'Seller Agent', 'Property Manager', 'Lease Negotiator', 'Investment Advisor'],
    stats: [
      { label: 'NAR Agents', value: '1.3M+' },
      { label: 'Home Sales (annual)', value: '$1.5T' },
      { label: 'Avg Transaction', value: '$400k' },
    ],
    faqs: [
      { q: 'Should I hire a buyer or seller agent?', a: 'Buyer agents represent your interests in purchasing; seller agents list and market properties.' },
      { q: 'How are realtors different from real estate agents?', a: 'Realtors are NAR members and agree to a code of ethics; all realtors are agents but not vice versa.' },
    ],
    internalLinks: [
      { label: 'Post a Realtor Job', href: '/post-job' },
      { label: 'Browse Realtors', href: '/browse-providers' },
    ],
  },
  {
    slug: 'residential',
    name: 'Residential',
    heroImage: '/src/assets/hero-home-services.jpg',
    tagline: 'Residential services including home renovation and repairs',
    article: [
      'Complete home improvement and repair services for residential properties.',
      'From routine maintenance to major renovations, find trusted local professionals.',
      'Licensed, insured, and verified contractors for all residential projects.',
      'Request free quotes and compare multiple providers for quality and price.',
    ],
    subcategories: ['Renovation', 'Repair', 'Maintenance', 'Interior Design', 'Landscaping', 'Cleaning'],
    stats: [
      { label: 'Residential Pros', value: '500k+' },
      { label: 'Market Value', value: '$400bn' },
      { label: 'Avg Project', value: '$5k-50k' },
    ],
    faqs: [
      { q: 'What permits do I need?', a: 'Structural, electrical, plumbing, and HVAC work typically require local building permits.' },
      { q: 'Should I get multiple quotes?', a: 'Yes; getting 3+ quotes helps you compare price, timeline, and approach.' },
    ],
    internalLinks: [
      { label: 'Post a Residential Job', href: '/post-job' },
      { label: 'Browse Residential Services', href: '/browse-providers' },
    ],
  },
  {
    slug: 'suppliers',
    name: 'Suppliers',
    heroImage: '/src/assets/hero-commercial.jpg',
    tagline: 'Material suppliers, distributors, and wholesale vendors',
    article: [
      'Source building materials, equipment, and supplies from verified wholesale suppliers.',
      'Direct access to lumber suppliers, electrical distributors, plumbing suppliers, and more.',
      'Competitive pricing with bulk discounts and professional delivery options.',
      'Find local suppliers and get instant quotes for your material needs.',
    ],
    subcategories: ['Building Materials', 'Electrical Supply', 'Plumbing Supply', 'HVAC Supply', 'Hardware', 'Lumber Yard'],
    stats: [
      { label: 'Suppliers', value: '10k+' },
      { label: 'Product Categories', value: '50+' },
      { label: 'Bulk Discount', value: 'Up to 30%' },
    ],
    faqs: [
      { q: 'Do I need a contractor license to buy from suppliers?', a: 'Some offer contractor pricing for licensed professionals; others serve all customers.' },
      { q: 'Can I get bulk discounts?', a: 'Yes; most suppliers offer volume discounts on large orders.' },
    ],
    internalLinks: [
      { label: 'Post a Supply Request', href: '/post-job' },
      { label: 'Browse Suppliers', href: '/browse-providers' },
    ],
  },
];

export default categories;

export function getCategoryBySlug(slug: string): CategoryLandingInfo | undefined {
  return categories.find((c) => c.slug === slug);
}
