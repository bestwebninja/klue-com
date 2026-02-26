 import { supabase } from '@/integrations/supabase/client';
 
 interface BlogPost {
   id: string;
   title: string;
   slug: string;
   excerpt: string | null;
   meta_keywords: string[] | null;
 }
 
 interface InternalLink {
   keyword: string;
   url: string;
   title: string;
 }
 
 // Site-wide internal linking keywords mapped to pages
 export const siteInternalLinks: InternalLink[] = [
   { keyword: 'service provider', url: '/browse-providers', title: 'Browse Service Providers' },
   { keyword: 'service providers', url: '/browse-providers', title: 'Browse Service Providers' },
   { keyword: 'find a tradesperson', url: '/browse-providers', title: 'Find a Tradesperson' },
   { keyword: 'find a contractor', url: '/browse-providers', title: 'Find a Contractor' },
   { keyword: 'post a job', url: '/post-job', title: 'Post a Job' },
   { keyword: 'posting a job', url: '/post-job', title: 'Post a Job' },
   { keyword: 'job listing', url: '/jobs', title: 'Browse Jobs' },
   { keyword: 'job listings', url: '/jobs', title: 'Browse Jobs' },
   { keyword: 'browse jobs', url: '/jobs', title: 'Browse Jobs' },
   { keyword: 'ask an expert', url: '/ask-expert', title: 'Ask an Expert' },
   { keyword: 'expert advice', url: '/ask-expert', title: 'Ask an Expert' },
   { keyword: 'get quotes', url: '/post-job', title: 'Get Quotes' },
   { keyword: 'free quotes', url: '/post-job', title: 'Get Free Quotes' },
   { keyword: 'how it works', url: '/how-it-works', title: 'How Kluje Works' },
   { keyword: 'pricing', url: '/pricing', title: 'View Pricing' },
   { keyword: 'subscription', url: '/pricing', title: 'Subscription Plans' },
   { keyword: 'sign up', url: '/auth', title: 'Sign Up' },
   { keyword: 'register', url: '/auth', title: 'Register' },
  
  // Home DIY and Renovation
   { keyword: 'electrician', url: '/browse-providers?category=electrician', title: 'Find an Electrician' },
   { keyword: 'plumber', url: '/browse-providers?category=plumber', title: 'Find a Plumber' },
   { keyword: 'carpenter', url: '/browse-providers?category=carpenter', title: 'Find a Carpenter' },
   { keyword: 'painter', url: '/browse-providers?category=painter', title: 'Find a Painter' },
   { keyword: 'roofer', url: '/browse-providers?category=roofing', title: 'Find a Roofer' },
   { keyword: 'roofing', url: '/browse-providers?category=roofing', title: 'Find Roofing Services' },
   { keyword: 'handyman', url: '/browse-providers?category=handyman', title: 'Find a Handyman' },
   { keyword: 'landscaping', url: '/browse-providers?category=landscaping', title: 'Find Landscaping Services' },
   { keyword: 'home renovation', url: '/browse-providers?category=renovation', title: 'Home Renovation Services' },
  { keyword: 'window and door', url: '/browse-providers?category=window-door', title: 'Window and Door Services' },
  { keyword: 'interior designer', url: '/browse-providers?category=interior-designer', title: 'Find an Interior Designer' },
  { keyword: 'heating engineer', url: '/browse-providers?category=heating-gas', title: 'Find a Heating Engineer' },
  { keyword: 'gas engineer', url: '/browse-providers?category=heating-gas', title: 'Find a Gas Engineer' },
  { keyword: 'swimming pool', url: '/browse-providers?category=swimming-pool', title: 'Swimming Pool Services' },
  { keyword: 'tiling', url: '/browse-providers?category=tiling', title: 'Find a Tiler' },
  { keyword: 'paving', url: '/browse-providers?category=paving', title: 'Find Paving Services' },
  { keyword: 'air conditioning', url: '/browse-providers?category=airconditioning', title: 'Air Conditioning Services' },
  { keyword: 'flooring', url: '/browse-providers?category=flooring', title: 'Find Flooring Services' },
  { keyword: 'blacksmith', url: '/browse-providers?category=blacksmith', title: 'Find a Blacksmith' },
  { keyword: 'drain specialist', url: '/browse-providers?category=drain-specialist', title: 'Find a Drain Specialist' },
  { keyword: 'bricklayer', url: '/browse-providers?category=bricklayer', title: 'Find a Bricklayer' },
  { keyword: 'builder', url: '/browse-providers?category=builder', title: 'Find a Builder' },
  { keyword: 'plasterer', url: '/browse-providers?category=plasterer', title: 'Find a Plasterer' },
  { keyword: 'gardener', url: '/browse-providers?category=garden-landscaping', title: 'Find a Gardener' },
  { keyword: 'pest control', url: '/browse-providers?category=pest-control', title: 'Pest Control Services' },
  { keyword: 'locksmith', url: '/browse-providers?category=locksmith', title: 'Find a Locksmith' },
  { keyword: 'home security', url: '/browse-providers?category=home-security', title: 'Home Security Services' },
  { keyword: 'architect', url: '/browse-providers?category=architecture', title: 'Find an Architect' },
  { keyword: 'project manager', url: '/browse-providers?category=project-management', title: 'Find a Project Manager' },
  { keyword: 'appliance repair', url: '/browse-providers?category=appliance-repair', title: 'Appliance Repair Services' },

  // Commercial Renovations and Services
  { keyword: 'shopfitting', url: '/browse-providers?category=shopfitting', title: 'Shopfitting Services' },
  { keyword: 'commercial maintenance', url: '/browse-providers?category=commercial-maintenance', title: 'Commercial Maintenance' },
  { keyword: 'cleaning service', url: '/browse-providers?category=cleaning', title: 'Cleaning Services' },

  // Events and Catering
  { keyword: 'catering', url: '/browse-providers?category=catering', title: 'Catering Services' },
  { keyword: 'wedding planner', url: '/browse-providers?category=wedding-planning', title: 'Find a Wedding Planner' },
  { keyword: 'wedding planning', url: '/browse-providers?category=wedding-planning', title: 'Wedding Planning Services' },
  { keyword: 'event decorator', url: '/browse-providers?category=event-decorating', title: 'Event Decorating Services' },
  { keyword: 'photographer', url: '/browse-providers?category=photography', title: 'Find a Photographer' },
  { keyword: 'photography', url: '/browse-providers?category=photography', title: 'Photography Services' },
  { keyword: 'videographer', url: '/browse-providers?category=videography', title: 'Find a Videographer' },
  { keyword: 'DJ', url: '/browse-providers?category=dj', title: 'Find a DJ' },
  { keyword: 'magician', url: '/browse-providers?category=magician', title: 'Find a Magician' },
  { keyword: 'florist', url: '/browse-providers?category=florist', title: 'Find a Florist' },
  { keyword: 'bartender', url: '/browse-providers?category=bartending', title: 'Find a Bartender' },
  { keyword: 'personal chef', url: '/browse-providers?category=personal-chef', title: 'Find a Personal Chef' },
  { keyword: 'photo booth', url: '/browse-providers?category=photo-booth', title: 'Photo Booth Rental' },
  { keyword: 'bounce house', url: '/browse-providers?category=party-inflatables', title: 'Bounce House Rental' },
  { keyword: 'face painting', url: '/browse-providers?category=face-painting', title: 'Face Painting Services' },

  // Health and Fitness
  { keyword: 'personal trainer', url: '/browse-providers?category=personal-trainer', title: 'Find a Personal Trainer' },
  { keyword: 'massage therapist', url: '/browse-providers?category=massage-therapy', title: 'Find a Massage Therapist' },
  { keyword: 'physiotherapy', url: '/browse-providers?category=physiotherapy', title: 'Physiotherapy Services' },
  { keyword: 'nutritionist', url: '/browse-providers?category=nutritionist', title: 'Find a Nutritionist' },
  { keyword: 'life coach', url: '/browse-providers?category=life-coaching', title: 'Find a Life Coach' },
  { keyword: 'yoga instructor', url: '/browse-providers?category=yoga', title: 'Find a Yoga Instructor' },
  { keyword: 'pilates', url: '/browse-providers?category=pilates', title: 'Find Pilates Instruction' },
  { keyword: 'therapist', url: '/browse-providers?category=therapy-counseling', title: 'Find a Therapist' },
  { keyword: 'counselling', url: '/browse-providers?category=therapy-counseling', title: 'Counselling Services' },
  { keyword: 'beauty salon', url: '/browse-providers?category=beauty-salon', title: 'Beauty Salon Services' },
  { keyword: 'hair stylist', url: '/browse-providers?category=hair-coloring', title: 'Find a Hair Stylist' },

  // Pets Services
  { keyword: 'dog walker', url: '/browse-providers?category=dog-walking', title: 'Find a Dog Walker' },
  { keyword: 'dog walking', url: '/browse-providers?category=dog-walking', title: 'Dog Walking Services' },
  { keyword: 'pet sitter', url: '/browse-providers?category=pet-sitting', title: 'Find a Pet Sitter' },
  { keyword: 'pet sitting', url: '/browse-providers?category=pet-sitting', title: 'Pet Sitting Services' },
  { keyword: 'dog groomer', url: '/browse-providers?category=dog-grooming', title: 'Find a Dog Groomer' },
  { keyword: 'dog trainer', url: '/browse-providers?category=dog-training', title: 'Find a Dog Trainer' },
  { keyword: 'pet boarding', url: '/browse-providers?category=pet-boarding', title: 'Pet Boarding Services' },

  // Business Services
  { keyword: 'accountant', url: '/browse-providers?category=accounting', title: 'Find an Accountant' },
  { keyword: 'accounting', url: '/browse-providers?category=accounting', title: 'Accounting Services' },
  { keyword: 'business consultant', url: '/browse-providers?category=business-consulting', title: 'Business Consulting' },
  { keyword: 'tax preparation', url: '/browse-providers?category=tax-preparation', title: 'Tax Preparation Services' },
  { keyword: 'payroll services', url: '/browse-providers?category=payroll', title: 'Payroll Services' },
  { keyword: 'resume writing', url: '/browse-providers?category=resume-writing', title: 'Resume Writing Services' },
  { keyword: 'private investigator', url: '/browse-providers?category=private-investigation', title: 'Private Investigation' },
  { keyword: 'security guard', url: '/browse-providers?category=security', title: 'Security Services' },

  // IT Services
  { keyword: 'web designer', url: '/browse-providers?category=web-design', title: 'Find a Web Designer' },
  { keyword: 'web design', url: '/browse-providers?category=web-design', title: 'Web Design Services' },
  { keyword: 'web developer', url: '/browse-providers?category=software-development', title: 'Find a Web Developer' },
  { keyword: 'software developer', url: '/browse-providers?category=software-development', title: 'Software Development' },
  { keyword: 'graphic designer', url: '/browse-providers?category=graphic-design', title: 'Find a Graphic Designer' },
  { keyword: 'logo design', url: '/browse-providers?category=logo-design', title: 'Logo Design Services' },
  { keyword: 'SEO', url: '/browse-providers?category=seo-service', title: 'SEO Services' },
  { keyword: 'search engine optimization', url: '/browse-providers?category=seo-service', title: 'SEO Services' },
  { keyword: 'social media marketing', url: '/browse-providers?category=social-media-marketing', title: 'Social Media Marketing' },
  { keyword: 'computer repair', url: '/browse-providers?category=computer-repair', title: 'Computer Repair Services' },
  { keyword: 'data recovery', url: '/browse-providers?category=data-recovery', title: 'Data Recovery Services' },
  { keyword: 'network support', url: '/browse-providers?category=network-support', title: 'Network Support Services' },
  { keyword: 'mobile app', url: '/browse-providers?category=mobile-design', title: 'Mobile App Development' },
  { keyword: 'e-commerce', url: '/browse-providers?category=ecommerce-consulting', title: 'E-commerce Services' },

  // Legal Services
  { keyword: 'solicitor', url: '/browse-providers?category=legal', title: 'Find a Solicitor' },
  { keyword: 'lawyer', url: '/browse-providers?category=legal', title: 'Find a Lawyer' },
  { keyword: 'divorce lawyer', url: '/browse-providers?category=divorce-attorney', title: 'Find a Divorce Lawyer' },
  { keyword: 'family lawyer', url: '/browse-providers?category=family-law', title: 'Family Law Services' },
  { keyword: 'immigration lawyer', url: '/browse-providers?category=immigration-attorney', title: 'Immigration Services' },
  { keyword: 'personal injury', url: '/browse-providers?category=personal-injury', title: 'Personal Injury Lawyer' },
  { keyword: 'criminal defence', url: '/browse-providers?category=criminal-defense', title: 'Criminal Defence Lawyer' },
  { keyword: 'estate planning', url: '/browse-providers?category=wills-estate', title: 'Estate Planning Services' },
  { keyword: 'wills and probate', url: '/browse-providers?category=wills-estate', title: 'Wills and Probate' },
  { keyword: 'notary', url: '/browse-providers?category=notarization', title: 'Notary Services' },
  { keyword: 'mediation', url: '/browse-providers?category=mediation', title: 'Mediation Services' },

  // Lessons
  { keyword: 'tutor', url: '/browse-providers?category=lessons', title: 'Find a Tutor' },
  { keyword: 'tutoring', url: '/browse-providers?category=lessons', title: 'Tutoring Services' },
  { keyword: 'language lessons', url: '/browse-providers?category=language-lessons', title: 'Language Lessons' },
  { keyword: 'music lessons', url: '/browse-providers?category=music-lessons', title: 'Music Lessons' },
  { keyword: 'dance lessons', url: '/browse-providers?category=dance-lessons', title: 'Dance Lessons' },
  { keyword: 'driving instructor', url: '/browse-providers?category=driving-lessons', title: 'Find a Driving Instructor' },

  // Moving and Transport
  { keyword: 'removals', url: '/browse-providers?category=movers', title: 'Removal Services' },
  { keyword: 'moving company', url: '/browse-providers?category=movers', title: 'Moving Services' },
  { keyword: 'man with a van', url: '/browse-providers?category=man-van', title: 'Man With a Van' },
  { keyword: 'courier', url: '/browse-providers?category=courier', title: 'Courier Services' },
  { keyword: 'car servicing', url: '/browse-providers?category=car-servicing', title: 'Car Servicing' },
 ];
 
 // Fetch related blog posts based on keywords
 export const fetchRelatedPostsByKeywords = async (
   currentPostId: string,
   keywords: string[] | null,
   limit: number = 3
 ): Promise<BlogPost[]> => {
   try {
     const { data, error } = await supabase
       .from('blog_posts' as any)
       .select('id, title, slug, excerpt, meta_keywords')
       .eq('status', 'published')
       .neq('id', currentPostId)
       .order('published_at', { ascending: false })
       .limit(20);
 
     if (error || !data) return [];
 
     const posts = data as unknown as BlogPost[];
     
     if (!keywords || keywords.length === 0) {
       return posts.slice(0, limit);
     }
 
     // Score posts based on keyword matches
     const scoredPosts = posts.map(post => {
       let score = 0;
       const postKeywords = post.meta_keywords || [];
       const titleLower = post.title.toLowerCase();
       
       keywords.forEach(keyword => {
         const keywordLower = keyword.toLowerCase();
         // Check title
         if (titleLower.includes(keywordLower)) score += 3;
         // Check post keywords
         if (postKeywords.some(pk => pk.toLowerCase().includes(keywordLower))) score += 2;
       });
       
       return { post, score };
     });
 
     // Sort by score and return top matches
     return scoredPosts
       .sort((a, b) => b.score - a.score)
       .slice(0, limit)
       .map(sp => sp.post);
   } catch (error) {
     console.error('Error fetching related posts:', error);
     return [];
   }
 };
 
 // Generate "Also Read" suggestions based on content analysis
 export const generateAlsoReadSuggestions = async (
   currentPostId: string,
   content: string,
   keywords: string[] | null
 ): Promise<BlogPost[]> => {
   try {
     const { data, error } = await supabase
       .from('blog_posts' as any)
       .select('id, title, slug, excerpt, meta_keywords')
       .eq('status', 'published')
       .neq('id', currentPostId)
       .order('published_at', { ascending: false })
       .limit(30);
 
     if (error || !data) return [];
 
     const posts = data as unknown as BlogPost[];
     const contentLower = content.toLowerCase();
     
     // Score posts based on relevance to current content
     const scoredPosts = posts.map(post => {
       let score = 0;
       const titleWords = post.title.toLowerCase().split(/\s+/);
       const postKeywords = post.meta_keywords || [];
       
       // Check if post title words appear in content
       titleWords.forEach(word => {
         if (word.length > 4 && contentLower.includes(word)) score += 1;
       });
       
       // Check keyword matches
       postKeywords.forEach(pk => {
         if (contentLower.includes(pk.toLowerCase())) score += 2;
       });
       
       // Boost if current post keywords match
       if (keywords) {
         keywords.forEach(keyword => {
           const keywordLower = keyword.toLowerCase();
           if (post.title.toLowerCase().includes(keywordLower)) score += 3;
           if (postKeywords.some(pk => pk.toLowerCase().includes(keywordLower))) score += 2;
         });
       }
       
       return { post, score };
     });
 
     return scoredPosts
       .filter(sp => sp.score > 0)
       .sort((a, b) => b.score - a.score)
       .slice(0, 2)
       .map(sp => sp.post);
   } catch (error) {
     console.error('Error generating also read suggestions:', error);
     return [];
   }
 };
 
 // Apply internal linking to content - returns processed content with link markers
 export const processContentWithLinks = (
   content: string,
   blogLinks: { title: string; slug: string }[],
   maxLinksPerType: number = 2
 ): string => {
   let processedContent = content;
   const appliedLinks = new Set<string>();
   
   // Add blog post links (limit to avoid over-linking)
   let blogLinkCount = 0;
   blogLinks.forEach(blog => {
     if (blogLinkCount >= maxLinksPerType) return;
     
     const titleWords = blog.title.split(/\s+/).filter(w => w.length > 5);
     for (const word of titleWords) {
       const regex = new RegExp(`\\b(${escapeRegex(word)})\\b`, 'gi');
       if (processedContent.match(regex) && !appliedLinks.has(word.toLowerCase())) {
         processedContent = processedContent.replace(
           regex,
           `[[BLOG_LINK:${blog.slug}:$1]]`
         );
         appliedLinks.add(word.toLowerCase());
         blogLinkCount++;
         break;
       }
     }
   });
   
   // Add site internal links
   let siteLinkCount = 0;
   siteInternalLinks.forEach(link => {
     if (siteLinkCount >= maxLinksPerType) return;
     
     const regex = new RegExp(`\\b(${escapeRegex(link.keyword)})\\b`, 'gi');
     if (processedContent.match(regex) && !appliedLinks.has(link.keyword.toLowerCase())) {
       processedContent = processedContent.replace(
         regex,
         `[[SITE_LINK:${link.url}:$1]]`
       );
       appliedLinks.add(link.keyword.toLowerCase());
       siteLinkCount++;
     }
   });
   
   return processedContent;
 };
 
 // Helper to escape regex special characters
 const escapeRegex = (str: string): string => {
   return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
 };