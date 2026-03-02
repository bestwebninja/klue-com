/**
 * US-focused content for each main service category landing page.
 * Used by the CategoryLanding page component.
 */

export interface CategoryLandingInfo {
  slug: string;
  name: string;
  heroImage: string;
  tagline: string;
  /** US-focused article paragraphs */
  article: string[];
  /** Sub-categories shown as service chips */
  subcategories: string[];
  /** Stats to highlight */
  stats: { label: string; value: string }[];
  /** FAQ items */
  faqs: { q: string; a: string }[];
  /** Internal links to other pages */
  internalLinks: { label: string; href: string }[];
}

const categories: CategoryLandingInfo[] = [
  {
    slug: 'home-diy-renovation',
    name: 'Home DIY & Renovation',
    heroImage: '/src/assets/hero-home-services.jpg',
    tagline: 'Transform your home with trusted US contractors',
    article: [
      'Whether you are planning a full home remodel or a simple kitchen refresh, finding the right contractors in the United States can feel overwhelming. With over 700,000 licensed general contractors operating across all 50 states, homeowners need a reliable way to compare skills, read genuine reviews and request competitive quotes.',
      'From licensed electricians in Houston to certified plumbers in Chicago, Kluje connects you with vetted professionals who understand local building codes, state licensing requirements and county permit processes. Our service providers carry the appropriate insurance, bonding and professional credentials — giving you peace of mind from the first consultation to the final walkthrough.',
      'The US home improvement market is worth over $600 billion annually, and homeowners increasingly value transparency, verified credentials and fair pricing. By posting your project on Kluje, you receive up to three tailored quotes from local professionals, allowing you to compare pricing, timelines and past work before making a decision.',
      'Whether it is waterproofing a brownstone in Brooklyn, installing radiant floor heating in a new build in Denver, or adding a sunroom in Atlanta, our network of skilled contractors is ready to deliver quality workmanship at a fair price.',
    ],
    subcategories: [
      'Handyman', 'Electrician', 'Plumber', 'Carpenter', 'Window and Door',
      'Painter', 'Interior Designer', 'Renovation', 'Heating and Gas Engineer',
      'Roofing', 'Swimming Pool', 'Tiling', 'Paving', 'Air Conditioning',
      'Flooring', 'Blacksmith', 'Drain Specialist', 'Bricklayer', 'Builder',
      'Plasterer/Renderer', 'Garden/Landscaping', 'Pest Control', 'Locksmith',
      'Home Security', 'Architecture/Planning', 'Project Management', 'Appliance Repair',
    ],
    stats: [
      { label: 'US Contractors', value: '700k+' },
      { label: 'Market Value', value: '$600bn' },
      { label: 'Avg Quotes Received', value: '3' },
    ],
    faqs: [
      { q: 'Do I need a permit for a home renovation?', a: 'Most structural work, electrical, plumbing and HVAC changes require permits from your local building department. Minor cosmetic updates usually do not.' },
      { q: 'How do I verify a contractor is licensed?', a: 'Check your state\'s contractor licensing board website. On Kluje, verified providers display their license numbers and credentials on their profile.' },
      { q: 'What does a typical kitchen renovation cost in the US?', a: 'Costs vary widely by region and specification. A mid-range kitchen remodel typically ranges from $25,000 to $75,000 including labor and materials.' },
    ],
    internalLinks: [
      { label: 'Post a Home Renovation Job', href: '/post-job' },
      { label: 'Browse Home Service Providers', href: '/browse-providers' },
      { label: 'Ask a Home Improvement Expert', href: '/ask-expert' },
      { label: 'Commercial Renovation Services', href: '/services/commercial-services' },
      { label: 'How Kluje Works', href: '/how-it-works' },
      { label: 'Read Home Improvement Tips', href: '/blog' },
    ],
  },
  {
    slug: 'commercial-services',
    name: 'Commercial Renovations & Services',
    heroImage: '/src/assets/hero-commercial.jpg',
    tagline: 'Professional commercial build-outs and maintenance across the US',
    article: [
      'From retail build-outs in Manhattan to office renovations in downtown Los Angeles, commercial construction demands specialists who understand tight deadlines, OSHA compliance, and minimal disruption to business operations. US businesses invest hundreds of billions each year upgrading retail spaces, offices, restaurants and industrial facilities.',
      'Commercial projects require licensed general contractors who carry the appropriate general liability insurance, workers\' compensation and bonding. Whether you need a complete tenant improvement or ongoing facilities maintenance, Kluje connects you with experienced commercial service providers across the United States.',
      'Our network includes commercial electricians, HVAC specialists, fire protection contractors, ADA compliance experts and janitorial service companies — all vetted and reviewed by previous clients. Post your commercial project and let qualified providers compete for your business with transparent, itemized quotes.',
      'With commercial real estate costs rising in major US metros, maximizing the value of your space through smart renovation and regular maintenance is more important than ever. A well-executed commercial build-out can increase foot traffic, improve employee productivity and strengthen your brand.',
    ],
    subcategories: [
      'Shopfitting', 'Maintenance Service', 'Cleaning Service',
      'Architecture/Planning', 'Electrician', 'Plumber', 'Carpenter',
      'Gas and Heating Engineer', 'Roofing', 'Interior Design',
      'Renovation Specialist', 'Builder',
    ],
    stats: [
      { label: 'Commercial Construction', value: '$200bn+' },
      { label: 'US Businesses', value: '33m+' },
      { label: 'Avg Turnaround', value: '4 wks' },
    ],
    faqs: [
      { q: 'Do commercial build-outs require permits?', a: 'Yes, most commercial alterations require building permits from your local jurisdiction, especially those involving structural changes, fire safety, electrical or plumbing work.' },
      { q: 'What insurance should a commercial contractor carry?', a: 'At minimum, general liability insurance (typically $1–2 million), workers\' compensation, and professional liability insurance for design-build work.' },
      { q: 'Can work be done outside business hours?', a: 'Many commercial contractors offer after-hours and weekend work to minimize business disruption. Discuss scheduling when requesting quotes.' },
    ],
    internalLinks: [
      { label: 'Post a Commercial Job', href: '/post-job' },
      { label: 'Browse Commercial Contractors', href: '/browse-providers' },
      { label: 'Home Renovation Services', href: '/services/home-diy-renovation' },
      { label: 'IT Services for Businesses', href: '/services/it-services' },
      { label: 'Business Support Services', href: '/services/business-services' },
      { label: 'View Pricing Plans', href: '/pricing' },
    ],
  },
  {
    slug: 'events-catering',
    name: 'Events & Catering',
    heroImage: '/src/assets/hero-events.jpg',
    tagline: 'Plan unforgettable events with top US event professionals',
    article: [
      'The US events industry is one of the largest in the world, contributing over $1 trillion to the economy annually. From intimate wedding receptions in Napa Valley to corporate conferences in New York City, finding the right mix of caterers, entertainers, photographers and planners is essential to creating a memorable occasion.',
      'American events come in every style — outdoor barbecue receptions in Texas, rooftop cocktail parties in Miami, vineyard weddings in Oregon and black-tie galas in Washington, D.C. Kluje connects you with experienced US event professionals who understand local permitting, venue partnerships and seasonal considerations.',
      'Whether you need a taco truck for a block party in San Diego, a professional DJ for a milestone birthday in Nashville, or a full wedding planning service in Charleston, our verified providers deliver exceptional experiences backed by genuine client reviews.',
      'With Americans spending an average of $33,000 on weddings and corporate event budgets rising, comparing multiple quotes ensures you get the best value and availability for your special occasion.',
    ],
    subcategories: [
      'DJ', 'Catering', 'Photography', 'Videography', 'Wedding Planning',
      'Wedding Coordination', 'Florist', 'Event Decorating', 'Venue Rental',
      'Bartending', 'Personal Chef', 'Pastry Chef and Cake Making',
      'Photo Booth Rental', 'Bounce House and Party Inflatables Rental',
      'Magician', 'Face Painting', 'Balloon Decorations', 'Wait Staff',
      'Security & Bouncer Services', 'Food Truck or Cart Services',
      'AV Equipment Rental', 'Comedy Entertainment', 'Dance Entertainment',
      'Invitations', 'Calligraphy', 'Wine Tastings and Tours',
    ],
    stats: [
      { label: 'Industry Value', value: '$1T+' },
      { label: 'US Weddings/Year', value: '2.5m+' },
      { label: 'Event Professionals', value: '200k+' },
    ],
    faqs: [
      { q: 'How far in advance should I book event services?', a: 'For weddings, 12–18 months is ideal. Corporate events typically need 3–6 months lead time. Popular dates (summer weekends, holiday season) book up fastest.' },
      { q: 'Do I need a permit for my event?', a: 'If your event involves alcohol sales, amplified music, or large outdoor gatherings, you may need permits from your city or county. Requirements vary by jurisdiction.' },
      { q: 'What is the average cost of wedding catering in the US?', a: 'Expect $70–$200 per person for a sit-down wedding dinner, depending on menu, location and service style. Buffet options typically run $50–$150 per person.' },
    ],
    internalLinks: [
      { label: 'Post an Event Job', href: '/post-job' },
      { label: 'Browse Event Professionals', href: '/browse-providers' },
      { label: 'Ask an Events Expert', href: '/ask-expert' },
      { label: 'Health & Fitness Services', href: '/services/health-fitness' },
      { label: 'Read Event Planning Tips', href: '/blog' },
      { label: 'How Kluje Works', href: '/how-it-works' },
    ],
  },
  {
    slug: 'health-fitness',
    name: 'Health & Fitness',
    heroImage: '/src/assets/hero-health-fitness.jpg',
    tagline: 'Find qualified health and wellness professionals near you',
    article: [
      'The US health and fitness industry is a powerhouse, with over 70 million gym memberships and rapidly growing demand for personal trainers, physical therapists, nutritionists and wellness coaches. Whether you are recovering from surgery, training for a marathon, or seeking better mental health, qualified professionals make all the difference.',
      'From NASM-certified personal trainers in Los Angeles to licensed physical therapists in Boston, the US has rigorous professional standards that protect clients. Kluje helps you find health and fitness professionals who hold the right certifications, liability insurance and professional credentials.',
      'The shift toward personalized wellness means more Americans are investing in one-on-one services — private yoga instruction, customized meal plans, sports massage and therapy sessions. Our platform lets you compare credentials, read genuine reviews and book with confidence.',
      'Whether you are looking for a mobile personal trainer in Austin, a Pilates instructor in San Francisco, or a licensed therapist offering telehealth sessions nationwide, Kluje connects you with verified professionals across the US.',
    ],
    subcategories: [
      'Personal Trainer', 'Physiotherapy', 'Massage Therapy', 'Nutritionist',
      'Hair Coloring and Highlights', 'Beauty and Salon Services',
      'Home Care', 'Alternative Healing', 'Facial Treatments',
      'Family Counseling', 'Health and Wellness Coaching', 'Hypnotherapy',
      'Life Coaching', 'Marriage and Relationship Counseling',
      'Private Pilates Instruction', 'Private Yoga Instruction',
      'Private Tai Chi Instruction', 'Therapy and Counseling',
      'Dance Lessons', 'Spiritual Counseling',
    ],
    stats: [
      { label: 'US Gym Members', value: '70m+' },
      { label: 'Industry Worth', value: '$35bn' },
      { label: 'Certified Trainers', value: '400k+' },
    ],
    faqs: [
      { q: 'What certifications should a US personal trainer have?', a: 'Look for NASM, ACE, ACSM, or NSCA certification, current CPR/AED certification, and professional liability insurance.' },
      { q: 'Does health insurance cover physical therapy?', a: 'Most health insurance plans cover physical therapy with a referral. Co-pays typically range from $20–$75 per session. Out-of-pocket sessions average $75–$150.' },
      { q: 'Can I use an HSA or FSA for wellness services?', a: 'Physical therapy, chiropractic care and some medically-prescribed fitness programs qualify for HSA/FSA spending. Check with your plan administrator for specifics.' },
    ],
    internalLinks: [
      { label: 'Post a Health & Fitness Job', href: '/post-job' },
      { label: 'Browse Wellness Providers', href: '/browse-providers' },
      { label: 'Ask a Health Expert', href: '/ask-expert' },
      { label: 'Lessons & Tutoring', href: '/services/lessons' },
      { label: 'Pet Services', href: '/services/pets-services' },
      { label: 'View Provider Plans', href: '/pricing' },
    ],
  },
  {
    slug: 'agriculture',
    name: 'Agriculture & Transport',
    heroImage: '/src/assets/hero-agriculture.jpg',
    tagline: 'Reliable agricultural services and transport across the US',
    article: [
      'Agriculture is a cornerstone of the American economy, with over 2 million farms spanning 900 million acres. From crop management in the Midwest to ranch services in Texas, agricultural professionals keep the nation\'s food supply chain running smoothly.',
      'The sector also encompasses essential transport and logistics services. Whether you need a reliable courier in the Midwest, commercial movers for an office relocation in Phoenix, or a man with a van for a local move in Portland, finding trusted providers with competitive rates is crucial.',
      'US agriculture is undergoing rapid modernization, with precision farming, renewable energy installations and sustainable land management creating new demand for specialist service providers. Kluje connects landowners, farmers and businesses with qualified professionals across the sector.',
      'From roadside assistance on Interstate 95 to limousine service for a special occasion in the Hamptons, our transport providers offer transparent pricing, verified reviews and professional service standards.',
    ],
    subcategories: [
      'Commercial Movers', 'Home Movers', 'Man With a Van',
      'Courier Services', 'Car Servicing', 'Car Windscreen Repair/Replacement',
      'Car Wheel and Tyre', 'Breakdown Services', 'Bus Rental',
      'Limousine/Chauffeur Service',
    ],
    stats: [
      { label: 'US Farms', value: '2m+' },
      { label: 'Farmland (Acres)', value: '900m' },
      { label: 'Moving Jobs/Year', value: '35m+' },
    ],
    faqs: [
      { q: 'How much does a local move cost in the US?', a: 'A typical local move for a 2–3 bedroom home costs $800–$2,500 depending on distance, volume of belongings, and time of year. Long-distance moves average $2,500–$7,500.' },
      { q: 'Do moving companies need to be licensed?', a: 'Interstate movers must be registered with the FMCSA and carry a USDOT number. State movers need appropriate state-level licensing. Always verify before booking.' },
      { q: 'What qualifications do agricultural contractors need?', a: 'Requirements vary by state and service. Pesticide application requires EPA-certified applicator licenses. Many agricultural roles require state-specific certifications.' },
    ],
    internalLinks: [
      { label: 'Post an Agriculture or Moving Job', href: '/post-job' },
      { label: 'Browse Transport Providers', href: '/browse-providers' },
      { label: 'Home Renovation Services', href: '/services/home-diy-renovation' },
      { label: 'Commercial Services', href: '/services/commercial-services' },
      { label: 'Business Support Services', href: '/services/business-services' },
      { label: 'How Kluje Works', href: '/how-it-works' },
    ],
  },
  {
    slug: 'pets-services',
    name: 'Pet Services',
    heroImage: '/src/assets/hero-pets.jpg',
    tagline: 'Trusted pet care professionals across the US',
    article: [
      'America is a nation of pet lovers, with over 200 million pets in nearly 70% of US households. From dog walking in Central Park to cat grooming in suburban Phoenix, pet owners are increasingly investing in professional services to keep their companions happy and healthy.',
      'The US pet care market is worth over $150 billion annually and growing. Professional dog trainers, groomers, pet sitters and behaviorists play a vital role in supporting responsible pet ownership. Many providers hold certifications from organizations like the CPDT-KA, the National Dog Groomers Association, or the International Association of Animal Behavior Consultants.',
      'Whether you need a reliable dog walker in your neighborhood, overnight pet boarding while you travel, or specialist aquarium maintenance for your office, Kluje connects you with insured and reviewed pet professionals in your area.',
      'With remote work trends and the pandemic-era pet adoption boom, demand for professional pet services has never been higher. Posting your requirements on Kluje lets you compare local providers, read genuine reviews and find the perfect match for your pet.',
    ],
    subcategories: [
      'Dog Walking', 'Dog Training', 'Dog Grooming', 'Dog Daycare',
      'Dog Fence Installation', 'Cat Grooming', 'Pet Sitting',
      'Pet Boarding', 'Aquarium Services',
      'Animal Training and Behavior Modification',
    ],
    stats: [
      { label: 'US Pets', value: '200m+' },
      { label: 'Pet Households', value: '70%' },
      { label: 'Market Value', value: '$150bn' },
    ],
    faqs: [
      { q: 'Does a dog walker need insurance?', a: 'Yes. Professional dog walkers should carry general liability insurance (minimum $1 million) and ideally bonding and care, custody and control coverage.' },
      { q: 'How much does dog grooming cost in the US?', a: 'Prices vary by breed and size. A standard groom for a medium-sized dog typically costs $40–$90. Specialty breeds or large dogs may cost more.' },
      { q: 'What should I look for in a pet sitter?', a: 'Check for background checks, pet first aid/CPR certification, insurance, and genuine reviews from other pet owners. A meet-and-greet before booking is always recommended.' },
    ],
    internalLinks: [
      { label: 'Post a Pet Services Job', href: '/post-job' },
      { label: 'Browse Pet Care Providers', href: '/browse-providers' },
      { label: 'Ask a Pet Expert', href: '/ask-expert' },
      { label: 'Health & Fitness Services', href: '/services/health-fitness' },
      { label: 'Lessons & Tutoring', href: '/services/lessons' },
      { label: 'Read Pet Care Tips on Our Blog', href: '/blog' },
    ],
  },
  {
    slug: 'business-services',
    name: 'Business Services',
    heroImage: '/src/assets/hero-business.jpg',
    tagline: 'Professional business support services across the US',
    article: [
      'With over 33 million small businesses operating in the United States, demand for professional support services — from accounting and payroll to consulting and administrative support — continues to grow. Small and medium enterprises rely on outsourced expertise to manage costs and stay competitive.',
      'Finding the right business service provider can transform your operations. Whether you need a CPA in Dallas for your annual tax filings, a virtual assistant in New York to handle scheduling, or a private investigator in Miami for due diligence, Kluje connects you with verified professionals across the US.',
      'The US business services sector is worth over $1 trillion and encompasses everything from HR consulting to data analytics. Our platform lets you compare credentials, read reviews from other business owners, and request itemized quotes — all in one place.',
      'As IRS reporting requirements evolve and employment law continues to change at both federal and state levels, having access to qualified professionals who understand the US regulatory landscape is more important than ever.',
    ],
    subcategories: [
      'Accounting', 'Administrative Support', 'Business Consulting',
      'Business Tax Preparation', 'Individual Tax Preparation',
      'Payroll Services', 'Phone or Tablet Repair', 'Presentation Design',
      'Printer and Copier Repair', 'Private Investigation', 'Process Serving',
      'Public Relations', 'Recruiting', 'Resume Writing',
      'Security and Body Guard Services', 'Statistical Data Analysis',
      'Exercise Equipment Repair', '3D Modeling',
      'Telemarketing and Telesales', 'Writing and Editing Services',
    ],
    stats: [
      { label: 'US Small Businesses', value: '33m+' },
      { label: 'Sector Value', value: '$1T+' },
      { label: 'SMEs', value: '99.9%' },
    ],
    faqs: [
      { q: 'Do I need a CPA for my small business?', a: 'While not legally required, a Certified Public Accountant (CPA) can save you money through tax-efficient planning, help with IRS compliance and provide valuable financial guidance.' },
      { q: 'How much do payroll services cost?', a: 'US payroll services typically charge $20–$100 per month base fee plus $2–$10 per employee per pay period, depending on complexity and state requirements.' },
      { q: 'What are the tax filing deadlines for US businesses?', a: 'S-Corps and partnerships file by March 15, C-Corps and sole proprietors by April 15. Extensions are available but estimated taxes are still due quarterly.' },
    ],
    internalLinks: [
      { label: 'Post a Business Services Job', href: '/post-job' },
      { label: 'Browse Business Professionals', href: '/browse-providers' },
      { label: 'IT Services', href: '/services/it-services' },
      { label: 'Legal Services', href: '/services/legal-services' },
      { label: 'Commercial Renovation Services', href: '/services/commercial-services' },
      { label: 'View Provider Plans', href: '/pricing' },
    ],
  },
  {
    slug: 'it-services',
    name: 'IT Services',
    heroImage: '/src/assets/hero-it-services.jpg',
    tagline: 'Expert IT and digital services for US businesses',
    article: [
      'The US tech sector is the largest in the world, worth over $1.8 trillion. From web development agencies in Silicon Valley to SEO consultants in Austin, IT service providers are essential partners for businesses navigating digital transformation.',
      'Whether you need a responsive website built for your new restaurant, a mobile app for your e-commerce brand, or ongoing managed IT support for your office network, Kluje connects you with qualified US-based tech professionals who deliver results.',
      'Cybersecurity is a top concern, with US businesses facing millions of cyber attacks annually. Our network includes SOC 2 compliant and NIST-certified providers who can audit your systems, implement protections and provide ongoing monitoring.',
      'From graphic designers creating brand identities to digital marketers growing your online presence, the US tech talent pool is world-class. Compare portfolios, read verified reviews and request quotes from multiple providers to find the perfect digital partner.',
    ],
    subcategories: [
      'Web Design', 'Web Hosting', 'Software Development', 'SEO Service',
      'Social Media Marketing', 'Marketing', 'Graphic Design', 'Logo Design',
      'Mobile Design', 'E-commerce Consulting', 'Computer Repair',
      'Data Recovery Service', 'Network Support Services',
      'Virus Removal Services', 'Animation', 'Illustrating',
      'Translation', 'Outreach', 'Electronic Machine Repair',
    ],
    stats: [
      { label: 'Tech Sector Value', value: '$1.8T' },
      { label: 'Cyber Attacks/Year', value: '800m+' },
      { label: 'Tech Workers', value: '9m+' },
    ],
    faqs: [
      { q: 'How much does a website cost in the US?', a: 'A basic brochure website costs $3,000–$10,000. E-commerce sites range from $10,000–$50,000+. Custom web applications can exceed $100,000 depending on complexity.' },
      { q: 'What is SOC 2 compliance?', a: 'SOC 2 is an auditing standard developed by the AICPA that ensures service providers securely manage data to protect your organization. It is increasingly required for B2B tech vendors.' },
      { q: 'Should I hire a freelancer or an agency?', a: 'Freelancers offer flexibility and lower costs for smaller projects. Agencies provide broader expertise and capacity for larger, multi-discipline projects. Consider your budget, timeline and ongoing needs.' },
    ],
    internalLinks: [
      { label: 'Post an IT Services Job', href: '/post-job' },
      { label: 'Browse IT Professionals', href: '/browse-providers' },
      { label: 'Ask a Tech Expert', href: '/ask-expert' },
      { label: 'Business Support Services', href: '/services/business-services' },
      { label: 'Legal Services', href: '/services/legal-services' },
      { label: 'Read Tech Tips on Our Blog', href: '/blog' },
    ],
  },
  {
    slug: 'legal-services',
    name: 'Legal Services',
    heroImage: '/src/assets/hero-legal.jpg',
    tagline: 'Find qualified attorneys and legal professionals in the US',
    article: [
      'Navigating the US legal system can be complex, whether you are buying your first home, forming a business entity, resolving a dispute or planning your estate. With over 1.3 million active attorneys in the United States, finding the right legal professional for your specific needs is crucial.',
      'All attorneys in the US must be licensed by the state bar association where they practice. This ensures minimum standards of competence, ethics and client protection — including access to disciplinary boards if issues arise. Many states also require continuing legal education (CLE) credits.',
      'Legal costs in the US vary significantly by practice area, location and attorney experience. Real estate closing costs typically range from $1,500–$3,000 in attorney fees, while family law matters can cost considerably more. Kluje lets you compare quotes from multiple attorneys, ensuring transparency and competitive pricing.',
      'Whether you need an immigration attorney in New York, a family law specialist in Los Angeles, a corporate lawyer in Chicago, or an estate planning attorney in your local area, our verified legal professionals provide clear fee structures and genuine client reviews.',
    ],
    subcategories: [
      'Wills and Estate Planning', 'Contracts Attorney', 'Corporate Law Attorney',
      'Criminal Defense Attorney', 'Divorce Attorney', 'Family Law Attorney',
      'Estate Attorney', 'Immigration Attorney', 'Real Estate Attorney',
      'Personal Injury Attorney', 'Tax Attorney', 'DUI Attorney',
      'Disability Attorney', 'Intellectual Property Attorney',
      'International Law Attorney', 'Labor and Employment Attorney',
      'Legal Document Preparation', 'Mediation', 'Notarization',
      'Personal Bankruptcy Attorney', 'Personal Financial Planning',
      'Traffic Law Attorney', 'Court Interpreting',
    ],
    stats: [
      { label: 'US Attorneys', value: '1.3m+' },
      { label: 'Avg Closing Costs', value: '$1.5–3k' },
      { label: 'Regulated By', value: 'State Bars' },
    ],
    faqs: [
      { q: 'How do I verify an attorney is licensed?', a: 'Search your state bar association\'s online directory. All licensed attorneys must appear in their state\'s records. Many states also list disciplinary history.' },
      { q: 'What is a contingency fee arrangement?', a: 'The attorney only charges fees if your case is successful, typically taking 33–40% of the settlement or award. Common in personal injury and employment cases.' },
      { q: 'Do I need an attorney to buy a house?', a: 'Requirements vary by state. Some states like New York and Massachusetts require an attorney for real estate closings, while others allow title companies to handle the process.' },
    ],
    internalLinks: [
      { label: 'Post a Legal Services Job', href: '/post-job' },
      { label: 'Browse Legal Professionals', href: '/browse-providers' },
      { label: 'Ask a Legal Expert', href: '/ask-expert' },
      { label: 'Business Support Services', href: '/services/business-services' },
      { label: 'IT Services', href: '/services/it-services' },
      { label: 'How Kluje Works', href: '/how-it-works' },
    ],
  },
  {
    slug: 'lessons',
    name: 'Lessons & Tutoring',
    heroImage: '/src/assets/hero-lessons.jpg',
    tagline: 'Expert tutors and instructors across the US',
    article: [
      'Private tutoring and lessons are a thriving industry in the United States, worth over $12 billion annually. From SAT and ACT prep tutors helping students achieve top scores to music teachers, language instructors and sports coaches, the demand for one-on-one learning has never been higher.',
      'The US tutoring market has evolved significantly, with many instructors offering both in-person and virtual sessions. Whether you need a math tutor in New York for your child\'s college prep, a Spanish teacher in Miami, or a tennis coach in Scottsdale, Kluje connects you with qualified and reviewed instructors.',
      'Quality instruction can be transformative. Research shows students receiving one-on-one tutoring perform significantly better than their peers. Our platform lets you compare qualifications, teaching experience, background check status and genuine parent reviews before booking.',
      'From beginner guitar lessons to advanced coding bootcamps, swim instruction to public speaking coaching, Kluje\'s network of US-based instructors covers every subject and skill level. Post your requirements and receive quotes from enthusiastic, qualified teachers in your area.',
    ],
    subcategories: [
      'Language Lessons', 'Lifestyle & Hobby Lessons',
      'Academic Lessons', 'Sporting Lessons',
    ],
    stats: [
      { label: 'Tutoring Market', value: '$12bn' },
      { label: 'Private Tutors', value: '1.5m+' },
      { label: 'Students Tutored', value: '30%+' },
    ],
    faqs: [
      { q: 'How much does private tutoring cost in the US?', a: 'Rates vary by subject and level. SAT/ACT prep typically costs $40–$100/hour, academic tutoring $30–$80/hour, and specialist subjects or college admissions consulting can exceed $150/hour.' },
      { q: 'Should a tutor have a background check?', a: 'Yes. Any tutor working with minors should have passed a background check. Many states require this for professionals working with children. Always ask to verify.' },
      { q: 'Are online lessons as effective as in-person?', a: 'Research suggests online tutoring can be equally effective for many subjects, particularly for older students. It also offers greater flexibility and access to tutors beyond your local area.' },
    ],
    internalLinks: [
      { label: 'Post a Tutoring Job', href: '/post-job' },
      { label: 'Browse Tutors & Instructors', href: '/browse-providers' },
      { label: 'Ask an Education Expert', href: '/ask-expert' },
      { label: 'Health & Fitness Services', href: '/services/health-fitness' },
      { label: 'Pet Services', href: '/services/pets-services' },
      { label: 'Read Learning Tips on Our Blog', href: '/blog' },
    ],
  },
];

export default categories;

export function getCategoryBySlug(slug: string): CategoryLandingInfo | undefined {
  return categories.find((c) => c.slug === slug);
}
