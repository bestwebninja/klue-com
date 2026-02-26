/**
 * UK-focused content for each main service category landing page.
 * Used by the CategoryLanding page component.
 */

export interface CategoryLandingInfo {
  slug: string;
  name: string;
  heroImage: string;
  tagline: string;
  /** UK-focused article paragraphs */
  article: string[];
  /** Sub-categories shown as service chips */
  subcategories: string[];
  /** Stats to highlight */
  stats: { label: string; value: string }[];
  /** FAQ items */
  faqs: { q: string; a: string }[];
}

const categories: CategoryLandingInfo[] = [
  {
    slug: 'home-diy-renovation',
    name: 'Home DIY & Renovation',
    heroImage: '/src/assets/hero-home-services.jpg',
    tagline: 'Transform your home with trusted UK tradespeople',
    article: [
      'Whether you are planning a full house renovation or a simple kitchen refresh, finding the right tradespeople in the UK can feel overwhelming. With over 300,000 registered tradespeople operating across England, Scotland, Wales and Northern Ireland, homeowners need a reliable way to compare skills, read genuine reviews and request competitive quotes.',
      'From certified Gas Safe engineers in Manchester to NICEIC-approved electricians in London, Kluje connects you with vetted professionals who understand local building regulations and British Standards. Our service providers carry the appropriate insurance, qualifications, and trade body memberships — giving you peace of mind from the first consultation to the final sign-off.',
      'The UK home improvement market is worth over £55 billion annually, and homeowners increasingly value transparency, verified credentials and fair pricing. By posting your project on Kluje, you receive up to three tailored quotes from local professionals, allowing you to compare pricing, timelines and past work before making a decision.',
      'Whether it is damp-proofing a Victorian terrace in Bristol, installing underfloor heating in a new-build in Edinburgh, or fitting a garden room in Surrey, our network of skilled tradespeople is ready to deliver quality workmanship at a fair price.',
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
      { label: 'UK Tradespeople', value: '300k+' },
      { label: 'Market Value', value: '£55bn' },
      { label: 'Avg Quotes Received', value: '3' },
    ],
    faqs: [
      { q: 'Do I need planning permission for a home renovation?', a: 'Many projects fall under permitted development rights, but extensions, loft conversions, and listed building work often require planning approval from your local council.' },
      { q: 'How do I check if a tradesperson is qualified?', a: 'Look for relevant trade body memberships such as Gas Safe, NICEIC, NAPIT, or FMB. On Kluje, verified providers display their credentials on their profile.' },
      { q: 'What does a typical kitchen renovation cost in the UK?', a: 'Costs vary widely by region and specification, but a mid-range kitchen renovation typically ranges from £8,000 to £20,000 including labour and materials.' },
    ],
  },
  {
    slug: 'commercial-services',
    name: 'Commercial Renovations & Services',
    heroImage: '/src/assets/hero-commercial.jpg',
    tagline: 'Professional commercial fit-outs and maintenance across the UK',
    article: [
      'From high-street shopfitting in Birmingham to office refurbishments in Canary Wharf, commercial renovation demands specialists who understand tight deadlines, health and safety compliance, and minimal disruption to trading. UK businesses invest billions each year upgrading retail spaces, offices, restaurants and industrial units.',
      'Commercial projects require CDM-compliant contractors who carry appropriate public liability insurance and can manage multi-trade coordination. Whether you need a complete strip-out and refit or ongoing facilities maintenance, Kluje connects you with experienced commercial service providers across the UK.',
      'Our network includes shopfitters, commercial electricians, HVAC specialists, fire safety engineers and cleaning contractors — all vetted and reviewed by previous clients. Post your commercial project and let qualified providers compete for your business with transparent, itemised quotes.',
      'With rising commercial rents across major UK cities, maximising the value of your premises through smart renovation and regular maintenance is more important than ever. A well-executed commercial fit-out can increase footfall, improve staff productivity and boost your brand image.',
    ],
    subcategories: [
      'Shopfitting', 'Maintenance Service', 'Cleaning Service',
      'Architecture/Planning', 'Electrician', 'Plumber', 'Carpenter',
      'Gas and Heating Engineer', 'Roofing', 'Interior Design',
      'Renovation Specialist', 'Builder',
    ],
    stats: [
      { label: 'Commercial Projects', value: '£12bn+' },
      { label: 'UK Businesses Served', value: '5.5m' },
      { label: 'Avg Turnaround', value: '4 wks' },
    ],
    faqs: [
      { q: 'Do commercial fit-outs require building regulations approval?', a: 'Yes, most commercial alterations require building control approval, especially those involving structural changes, fire safety, or electrical systems.' },
      { q: 'What insurance should a commercial contractor carry?', a: 'At minimum, public liability insurance (typically five to ten million pounds), employers liability insurance, and professional indemnity insurance for design work.' },
      { q: 'Can work be done outside business hours?', a: 'Many commercial contractors offer out-of-hours and weekend work to minimise disruption. Discuss scheduling requirements when requesting quotes.' },
    ],
  },
  {
    slug: 'events-catering',
    name: 'Events & Catering',
    heroImage: '/src/assets/hero-events.jpg',
    tagline: 'Plan unforgettable events with top UK event professionals',
    article: [
      'The UK events industry is one of the largest in Europe, contributing over £70 billion to the economy annually. From intimate wedding receptions in the Cotswolds to corporate conferences in central London, finding the right mix of caterers, entertainers, photographers and planners is essential to creating a memorable occasion.',
      'British events carry their own unique traditions — afternoon tea receptions, garden parties, Burns Night suppers and summer fêtes all require specialist knowledge. Kluje connects you with experienced UK event professionals who understand local licensing requirements, venue partnerships and seasonal considerations.',
      'Whether you need a hog roast caterer for a village festival, a professional DJ for a milestone birthday in Leeds, or a full wedding planning service in Edinburgh, our verified providers deliver exceptional experiences backed by genuine client reviews.',
      'With post-pandemic recovery driving strong demand across weddings, corporate events and private celebrations, booking early and comparing multiple quotes ensures you get the best value and availability for your special occasion.',
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
      { label: 'Industry Value', value: '£70bn' },
      { label: 'UK Weddings/Year', value: '260k+' },
      { label: 'Event Professionals', value: '25k+' },
    ],
    faqs: [
      { q: 'How far in advance should I book event services?', a: 'For weddings, 12–18 months is ideal. Corporate events typically need 3–6 months lead time. Popular dates (summer weekends, December) book up fastest.' },
      { q: 'Do I need an events licence?', a: 'If your event involves alcohol sales, live music after 11pm, or large gatherings, you may need a Temporary Event Notice (TEN) from your local council.' },
      { q: 'What is the average cost of wedding catering in the UK?', a: 'Expect £50–£150 per head for a sit-down wedding breakfast, depending on menu complexity, location and service style.' },
    ],
  },
  {
    slug: 'health-fitness',
    name: 'Health & Fitness',
    heroImage: '/src/assets/hero-health-fitness.jpg',
    tagline: 'Find qualified health and wellness professionals near you',
    article: [
      'The UK health and fitness industry is booming, with over 10 million gym memberships and growing demand for personal trainers, physiotherapists, nutritionists and holistic therapists. Whether you are recovering from injury, training for a marathon, or seeking better mental wellbeing, qualified professionals make all the difference.',
      'From CIMSPA-registered personal trainers in London to chartered physiotherapists in Glasgow, the UK has strict professional standards that protect clients. Kluje helps you find health and fitness professionals who hold the right qualifications, insurance and professional body memberships.',
      'The shift towards personalised wellness means more people are investing in one-to-one services — private yoga instruction, bespoke nutrition plans, sports massage and counselling. Our platform lets you compare credentials, read genuine reviews and book with confidence.',
      'Whether you are looking for a mobile personal trainer who comes to your home in Brighton, a Pilates instructor in Manchester, or a qualified counsellor offering sessions in Cardiff, Kluje connects you with verified professionals across the UK.',
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
      { label: 'UK Gym Members', value: '10m+' },
      { label: 'Industry Worth', value: '£5bn' },
      { label: 'Registered PTs', value: '60k+' },
    ],
    faqs: [
      { q: 'What qualifications should a UK personal trainer have?', a: 'Look for Level 3 Personal Training certification (minimum), CIMSPA registration, valid first aid certificate, and professional liability insurance.' },
      { q: 'Is physiotherapy available on the NHS?', a: 'Yes, but waiting times can be long. Many people choose private physiotherapy for faster access. Typical private sessions cost £40–£70.' },
      { q: 'Can I claim health services on private insurance?', a: 'Many private health insurers cover physiotherapy, counselling and some complementary therapies. Check your policy or ask the provider if they are recognised by your insurer.' },
    ],
  },
  {
    slug: 'agriculture',
    name: 'Agriculture & Transport',
    heroImage: '/src/assets/hero-agriculture.jpg',
    tagline: 'Reliable agricultural services and transport across the UK',
    article: [
      'Agriculture remains a cornerstone of the UK economy, with over 216,000 farms spanning 17 million hectares. From crop management in the East Anglian fens to livestock services in the Welsh valleys, agricultural professionals keep Britain\'s food supply chain running smoothly.',
      'The sector also encompasses essential transport and logistics services. Whether you need a reliable courier in the Midlands, commercial movers for an office relocation in Bristol, or a man with a van for a house move in Newcastle, finding trusted providers with competitive rates is crucial.',
      'UK agriculture is undergoing rapid modernisation, with precision farming, renewable energy installations, and sustainable land management creating new demand for specialist service providers. Kluje connects landowners, farmers and businesses with qualified professionals across the sector.',
      'From breakdown recovery on the M1 to limousine hire for a special occasion in the Home Counties, our transport providers offer transparent pricing, verified reviews and professional service standards.',
    ],
    subcategories: [
      'Commercial Movers', 'Home Movers', 'Man With a Van',
      'Courier Services', 'Car Servicing', 'Car Windscreen Repair/Replacement',
      'Car Wheel and Tyre', 'Breakdown Services', 'Bus Rental',
      'Limousine/Chauffeur Service',
    ],
    stats: [
      { label: 'UK Farms', value: '216k' },
      { label: 'Farmland (Hectares)', value: '17m' },
      { label: 'Moving Jobs/Year', value: '3m+' },
    ],
    faqs: [
      { q: 'How much does a house move cost in the UK?', a: 'A typical 2–3 bedroom house move costs £400–£1,200 depending on distance, volume of belongings and time of year. Get multiple quotes to compare.' },
      { q: 'Do removal companies need to be insured?', a: 'Reputable movers carry goods-in-transit insurance and public liability insurance. Always ask for proof before booking.' },
      { q: 'What qualifications do agricultural contractors need?', a: 'Requirements vary by service. Pesticide application requires PA1/PA2 certification, and many roles require relevant NVQs and CSCS cards for site work.' },
    ],
  },
  {
    slug: 'pets-services',
    name: 'Pet Services',
    heroImage: '/src/assets/hero-pets.jpg',
    tagline: 'Trusted pet care professionals across the UK',
    article: [
      'The UK is a nation of animal lovers, with over 34 million pets across 12 million households. From dog walking in Hyde Park to cat grooming in suburban Edinburgh, pet owners are increasingly investing in professional services to keep their companions happy and healthy.',
      'The UK pet care market is worth over £7 billion annually and growing. Professional dog trainers, groomers, pet sitters and behaviourists play a vital role in supporting responsible pet ownership. Many providers hold qualifications from organisations like the IMDT, City & Guilds, or the Animal Behaviour and Training Council.',
      'Whether you need a reliable dog walker in your neighbourhood, overnight pet boarding while you travel, or specialist aquarium maintenance for your office, Kluje connects you with insured and reviewed pet professionals in your area.',
      'With the rise of working from home and the post-lockdown puppy boom, demand for professional pet services has never been higher. Posting your requirements on Kluje lets you compare local providers, read genuine reviews and find the perfect match for your pet.',
    ],
    subcategories: [
      'Dog Walking', 'Dog Training', 'Dog Grooming', 'Dog Daycare',
      'Dog Fence Installation', 'Cat Grooming', 'Pet Sitting',
      'Pet Boarding', 'Aquarium Services',
      'Animal Training and Behavior Modification',
    ],
    stats: [
      { label: 'UK Pets', value: '34m+' },
      { label: 'Pet Households', value: '12m' },
      { label: 'Market Value', value: '£7bn' },
    ],
    faqs: [
      { q: 'Does a dog walker need insurance?', a: 'Yes. Professional dog walkers should carry public liability insurance (minimum £1m) and ideally care, custody and control cover for the animals in their charge.' },
      { q: 'How much does dog grooming cost in the UK?', a: 'Prices vary by breed and size. A standard groom for a medium-sized dog typically costs £30–£60. Specialist breeds may cost more.' },
      { q: 'What should I look for in a pet sitter?', a: 'Check for DBS clearance, pet first aid training, insurance, and genuine reviews from other pet owners. A meet-and-greet before booking is always recommended.' },
    ],
  },
  {
    slug: 'business-services',
    name: 'Business Services',
    heroImage: '/src/assets/hero-business.jpg',
    tagline: 'Professional business support services across the UK',
    article: [
      'With over 5.5 million private businesses operating in the UK, demand for professional support services — from accountancy and payroll to consulting and administrative support — continues to grow. Small and medium enterprises in particular rely on outsourced expertise to manage costs and stay competitive.',
      'Finding the right business service provider can transform your operations. Whether you need a qualified accountant in Birmingham for your annual returns, a virtual assistant in London to handle diary management, or a private investigator in Leeds for due diligence, Kluje connects you with verified professionals across the UK.',
      'The UK business services sector is worth over £200 billion and encompasses everything from HR consulting to data analysis. Our platform lets you compare credentials, read reviews from other business owners, and request itemised quotes — all in one place.',
      'As HMRC reporting requirements become more complex with Making Tax Digital, and employment law continues to evolve, having access to qualified professionals who understand the UK regulatory landscape is more important than ever.',
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
      { label: 'UK Businesses', value: '5.5m' },
      { label: 'Sector Value', value: '£200bn' },
      { label: 'SMEs', value: '99%' },
    ],
    faqs: [
      { q: 'Do I need a qualified accountant for my small business?', a: 'While not legally required, a qualified accountant (ACA, ACCA, or CIMA) can save you money through tax-efficient planning and ensure HMRC compliance.' },
      { q: 'How much do payroll services cost?', a: 'UK payroll services typically charge £3–£8 per employee per month, depending on complexity. Many offer discounted rates for smaller teams.' },
      { q: 'What is Making Tax Digital?', a: 'MTD is an HMRC initiative requiring businesses to keep digital records and submit VAT returns using compatible software. It is being extended to income tax from April 2026.' },
    ],
  },
  {
    slug: 'it-services',
    name: 'IT Services',
    heroImage: '/src/assets/hero-it-services.jpg',
    tagline: 'Expert IT and digital services for UK businesses',
    article: [
      'The UK digital economy is the largest in Europe, worth over £150 billion. From web development agencies in Shoreditch to SEO consultants in Manchester, IT service providers are essential partners for businesses navigating digital transformation.',
      'Whether you need a responsive website built for your new restaurant, a mobile app for your e-commerce brand, or ongoing IT support for your office network, Kluje connects you with qualified UK-based tech professionals who deliver results.',
      'Cybersecurity is a growing concern, with UK businesses facing over 2.4 million cyber attacks annually. Our network includes Cyber Essentials-certified providers who can audit your systems, implement protections and provide ongoing monitoring.',
      'From graphic designers creating brand identities to social media marketers growing your online presence, the UK tech talent pool is world-class. Compare portfolios, read verified reviews and request quotes from multiple providers to find the perfect digital partner.',
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
      { label: 'Digital Economy', value: '£150bn' },
      { label: 'Cyber Attacks/Year', value: '2.4m' },
      { label: 'Tech Workers', value: '1.7m' },
    ],
    faqs: [
      { q: 'How much does a website cost in the UK?', a: 'A basic brochure website costs £1,500–£5,000. E-commerce sites range from £5,000–£30,000+. Custom web applications can exceed £50,000 depending on complexity.' },
      { q: 'What is Cyber Essentials certification?', a: 'A UK Government-backed scheme that helps organisations protect against common online threats. It is increasingly required for government contracts and demonstrates good security practice.' },
      { q: 'Should I hire a freelancer or an agency?', a: 'Freelancers offer flexibility and lower costs for smaller projects. Agencies provide broader expertise and capacity for larger, multi-discipline projects. Consider your budget and ongoing needs.' },
    ],
  },
  {
    slug: 'legal-services',
    name: 'Legal Services',
    heroImage: '/src/assets/hero-legal.jpg',
    tagline: 'Find qualified solicitors and legal professionals in the UK',
    article: [
      'Navigating the UK legal system can be complex, whether you are buying your first home, setting up a business, resolving a dispute or planning your estate. With over 150,000 practising solicitors in England and Wales alone, finding the right legal professional for your specific needs is crucial.',
      'All solicitors in England and Wales must be regulated by the Solicitors Regulation Authority (SRA), while Scottish solicitors are regulated by the Law Society of Scotland. This ensures minimum standards of competence, ethics and client protection — including access to the Legal Ombudsman if things go wrong.',
      'Legal costs in the UK vary significantly by practice area and location. Conveyancing fees for a straightforward house purchase typically range from £800–£1,500, while family law matters can cost considerably more. Kluje lets you compare quotes from multiple solicitors, ensuring transparency and competitive pricing.',
      'Whether you need an immigration solicitor in London, a family law specialist in Cardiff, a commercial contracts lawyer in Edinburgh, or a will-writing service in your local area, our verified legal professionals provide clear fee structures and genuine client reviews.',
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
      { label: 'UK Solicitors', value: '150k+' },
      { label: 'Conveyancing Cost', value: '£800–1.5k' },
      { label: 'Regulated By', value: 'SRA' },
    ],
    faqs: [
      { q: 'How do I check if a solicitor is legitimate?', a: 'Search the SRA\'s online register (for England and Wales) or the Law Society of Scotland\'s register. All practising solicitors must appear on these registers.' },
      { q: 'What is a no-win-no-fee arrangement?', a: 'Also called a Conditional Fee Agreement (CFA), the solicitor only charges fees if your case is successful. A success fee (up to 100% of standard charges) may apply.' },
      { q: 'Do I need a solicitor to buy a house?', a: 'Yes, in England and Wales you need a solicitor or licensed conveyancer to handle the legal transfer of property. In Scotland, solicitors play an even larger role in the process.' },
    ],
  },
  {
    slug: 'lessons',
    name: 'Lessons & Tutoring',
    heroImage: '/src/assets/hero-lessons.jpg',
    tagline: 'Expert tutors and instructors across the UK',
    article: [
      'Private tutoring and lessons are a thriving industry in the UK, worth over £6 billion annually. From GCSE and A-Level tutors helping students achieve top grades to music teachers, language instructors and sports coaches, the demand for one-to-one learning has never been higher.',
      'The UK tutoring market has evolved significantly, with many instructors offering both in-person and online sessions. Whether you need a maths tutor in London for your child\'s 11+ preparation, a Spanish teacher in Manchester, or a tennis coach in Surrey, Kluje connects you with qualified and reviewed instructors.',
      'Quality instruction can be transformative. Research shows that students receiving one-to-one tutoring perform significantly better than their peers. Our platform lets you compare qualifications, teaching experience, DBS clearance status and genuine parent reviews before booking.',
      'From beginner guitar lessons to advanced coding bootcamps, swimming instruction to public speaking coaching, Kluje\'s network of UK-based instructors covers every subject and skill level. Post your requirements and receive quotes from enthusiastic, qualified teachers in your area.',
    ],
    subcategories: [
      'Language Lessons', 'Lifestyle & Hobby Lessons',
      'Academic Lessons', 'Sporting Lessons',
    ],
    stats: [
      { label: 'Tutoring Market', value: '£6bn' },
      { label: 'Private Tutors', value: '1m+' },
      { label: 'Students Tutored', value: '25%' },
    ],
    faqs: [
      { q: 'How much does private tutoring cost in the UK?', a: 'Rates vary by subject and level. GCSE tutoring typically costs £25–£45/hour, A-Level £30–£60/hour, and specialist subjects or Oxbridge preparation can exceed £80/hour.' },
      { q: 'Should a tutor have a DBS check?', a: 'Yes. Any tutor working with children or vulnerable adults should hold a valid Enhanced DBS certificate. Always ask to see this before booking.' },
      { q: 'Are online lessons as effective as in-person?', a: 'Research suggests online tutoring can be equally effective for many subjects, particularly for older students. It also offers greater flexibility and access to tutors outside your local area.' },
    ],
  },
];

export default categories;

export function getCategoryBySlug(slug: string): CategoryLandingInfo | undefined {
  return categories.find((c) => c.slug === slug);
}
