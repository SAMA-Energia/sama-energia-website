# Evidence review: high-converting B2B lead-gen front page (for SAMA Energia)

Compiled 2.11.2026. Scope: published studies, benchmark reports and documented tests only. Dated or weak evidence is marked. Vendor data (Unbounce, WordStream, HubSpot) is correlational, not causal.

## 1. Above the fold

- NN/g eyetracking, 120 users / 130k fixations: 57% of viewing time in the first screenful, 17% in the second, 26% in the whole rest; 74% within two screenfuls, 81% within three. Attention drops sharply right after the fold. https://www.nngroup.com/articles/scrolling-and-attention/ (15 Apr 2018)
- The 100 px just above the fold are viewed 102% more than the 100 px just below; users scroll only if what they see promises more. https://www.nngroup.com/articles/page-fold-manifesto/ (1 Feb 2015)
- Full-viewport heroes create a "false floor": in one test 6 of 8 users did not realise the page scrolled. https://www.nngroup.com/articles/illusion-of-completeness/ (17 Jan 2016)
- Homepage principles: state what the company does next to the logo, show specific offerings rather than category labels, prioritise above the fold, do not animate logo/tagline/headline, avoid auto-advancing carousels, use CTA labels that say what the user gets (not "Learn more"). https://www.nngroup.com/articles/homepage-design-principles/ (15 Mar 2024)
- 83% of B2B buyers leave if they cannot tell what the company offers; survey of 175 buyers, dated. https://www.marketingprofs.com/charts/2014/24654/what-b2b-buyers-want-from-vendor-websites (Oct 2013)
- Scanning: first lines and left-most words get most attention unless text is formatted with headings/bullets. https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/ (12 Nov 2017)

## 2. Page length, proof, pricing, progressive disclosure

- Length should match the size of the decision; long pages work when each section resolves one specific objection. Counter-example: a B2B SaaS demo page got +65% bookings (3.53% to 5.85%) after being shortened. https://cxl.com/long-form-or-short-form/ (2013, updated Aug 2026)
- Unbounce CBR 2024 (41k pages, 57M conversions): commercial & professional services median 6.1%; conversion peaks at 275–745 words; 5th–7th-grade reading level 12.9% vs 6.6% at 8th–9th grade; word count correlates −18.6% with conversion. Landing pages, not homepages. https://unbounce.com/conversion-benchmark-report/professional-services-conversion-rate/ (2024)
- Writing: concise +58%, scannable +47%, objective (no promotional language) +27%, all three +124% measured usability; 79% scan. Dated but consistent with 2017 F-pattern work. https://www.nngroup.com/articles/how-users-read-on-the-web/ (30 Sep 1997)
- Pricing: B2B users ranked price the most important of 28 information types, 29% above the next; price ranges help; incomplete descriptions create scepticism. 179 sites, dated. https://www.nngroup.com/articles/b2b-usability/ (31 May 2006). Transparent cost info ranked #1 (25%) and case studies #2 (23%) by 451 buyers. https://clutch.co/press-releases/b2b-buyers-most-concerned-about-transparent-costs-b2b-companies-websites (26 Feb 2020)
- Accordions/expanders: avoid when users need most of the content; hidden content gets skipped; fine for a few key topics (FAQ) and on mobile. https://www.nngroup.com/articles/accordions-complex-content/ (18 May 2014). Truncated content is mistaken for the full content. https://baymard.com/research-articles/truncation-design (21 May 2014)

## 3. Motion, animation, scroll-jacking, sticky elements

- Scrolljacking (scroll-controlled animation): most participants disoriented, some left or refreshed; task-focused users most annoyed; worse on mobile; keep text out of it, place below the fold, mix with normal scrolling, avoid on mobile. https://www.nngroup.com/articles/scrolljacking-101/ (6 Aug 2023)
- Scroll-triggered fade-ins: fast scanners scroll past text before it appears; fades >500 ms feel slow; create illusion of completeness; animate once, 100–400 ms, avoid on mobile. https://www.nngroup.com/articles/scroll-fading-101/ (8 Dec 2023)
- Parallax experiment, N=86, between-subjects: only "fun" rose (5.2 vs 4.7, p=.008); no difference in usability, satisfaction or visual appeal; 2 of 86 became nauseous; authors had to simplify the effect to keep load time constant. https://uxpajournal.org/wp-content/uploads/sites/7/pdf/JUS_Frederick_Feb2015.pdf (Feb 2015)
- Animated elements near text increased fixations and task time in a search task (N=24, small). https://www.frontiersin.org/articles/10.3389/fpsyg.2014.00211/full (2014)
- 93% of B2B buyers annoyed by auto-play media, 88% by animated elements moving across the page (same 2013 survey, dated).
- Accessibility: over 35% of adults have experienced vestibular dysfunction by age 40; WCAG requires pause/stop/hide for auto-moving content; honour prefers-reduced-motion. https://web.dev/learn/accessibility/motion
- Performance: 53% of mobile visitors leave a page that takes >3 s; 1 s to 7 s raises bounce probability 113%. https://blog.amp.dev/2017/02/28/new-industry-benchmarks-for-mobile-page-speed/ (Google/SOASTA, 2017). Vodafone LCP −31% gave +8% sales; Lazada LCP 3× faster gave +16.9% mobile conversion; Agrofy LCP −70% cut load abandonment 76%. https://web.dev/case-studies/vitals-business-impact (updated 1 Sep 2021). JS, CSS and image bytes are the strongest predictors of failing LCP. https://dev.to/httparchive/correlation-between-core-web-vitals-and-web-characteristics-219f (12 Jan 2021)
- Sticky navigation: tasks 22% faster, all users with a preference preferred it (N=40, dated). https://shop.smashingmagazine.com/2012/09/sticky-menus-are-quicker-to-navigate/ (11 Sep 2012); NN/g 2023 found sticky nav was the escape route from confusing scrolljacks.
- Gap: no published study shows explanatory 3D/scroll animation raising B2B lead conversion. The evidence supports short animation that adds context (NN/g 2023, BBC example) and "fun" in hedonic contexts (2015), not persuasion of task-focused buyers.

## 4. Trust in high-ticket B2B

- Stanford credibility guidelines (4,500+ participants): show a real organisation (physical address), real people, expertise, easy contact (phone, address, email), no errors, restraint with promotion. https://credibility.stanford.edu/guidelines (2002, dated but foundational)
- Specific beats vague: replacing "award-winning, fully integrated" with exact figures raised CTR 20.9%. https://marketingexperiments.com/?p=4249 (30 Jun 2010). Numerals attract the scanning eye because they signal facts. https://www.nngroup.com/articles/web-writing-show-numbers-as-numerals/ (15 Apr 2007). Clearer value proposition on a B2B lead page: +201% leads (no significance reported). https://sherpablog.marketingsherpa.com/b2b-marketing/lead-gen/lead-capture-clearer-value-prop/ (11 Jun 2012)
- Faces: stock photos are ignored; real team portraits got 10% more viewing time than bios occupying 316% more space. https://www.nngroup.com/articles/photos-as-web-content/ (31 Oct 2010). Testimonials with photos recalled more (p=.0035); recognisable logos recalled more than unknown ones (p=.009); numbers and unknown logos not memorable (survey N=1,153). https://cxl.com/research-study/social-proof/ (6 Sep 2016)
- Third-party/data-led content: 73% of 3,500 decision-makers trust thought leadership more than marketing material when judging competence; top-rated content has strong research/data (55%) and concrete case guidance (43%); 86% would invite such producers to an RFP. https://www.edelman.com/insights/thought-leadership-gets-b2b-buyers-back-into-game (28 Feb 2024)
- Contact info: 68% call address/contact details critical, 55% leave without them, 51% say thorough contact + about info is the best credibility builder (2013 survey, dated).
- Personal value: buyers who see personal value for themselves are 3× as likely to buy (71% vs 22.6%; ~3,000 buyers). https://www.marketingcharts.com/industries/business-to-business-37036 (CEB/Google, 2013)

## 5. Forms, CTAs, benchmarks

- Fields: across 40,000 pages conversion fell only slightly with more single-line fields, but multi-line text areas and several dropdowns depressed it strongly. https://blog.hubspot.com/blog/tabid/6307/bid/6746/which-types-of-form-fields-lower-landing-page-conversions.aspx (2010 data)
- B2B quote request: fewer fields + instant result + credibility indicators + comparison chart gave +262% leads. https://marketingexperiments.com/?p=10874 (26 Sep 2012)
- Multi-step: only vendor-cited lifts (Conversion Fanatics +59.2%, via https://blog.hubspot.com/marketing/multi-step-forms); Zuko states neither format consistently wins. https://zuko.io/blog/single-page-or-multi-step-form. Treat as a test, not a rule.
- CTA wording: "Start your trial" to "Start my trial" +90% (single test, no sample size). https://marketingexperiments.com/?p=12262 (15 Mar 2013). NN/g 2024: descriptive labels naming what the user gets.
- Number of links: 1 link 13.5%, 2 links 11.9%, 3 links 10.5% average conversion across 18,639 pages (correlational, campaign pages). https://www.marketingprofs.com/charts/2018/33935/what-converts-web-landing-page-benchmarks-and-trends-infographic (2018)
- Phone: 58% of B2B buyers prefer phone, 81% email, 39% forms (2013); phone number is a Stanford credibility signal; the only A/B evidence is weak (+9% conversions, +2% LTV, own test). https://cxl.com/blog/phone-number-website/ (15 Dec 2019). Chat: no independent published evidence found; vendor claims only.
- Benchmarks: Unbounce 2024 all-industry median 6.6%, professional services 6.1%. Google Ads search CVR Apr 2023–Mar 2024 (17,998 campaigns): Industrial & Commercial 6.84%, Business Services 5.78%, Home Improvement 8.62%, overall 6.96%. https://www.wordstream.com/blog/2024-google-ads-benchmarks. No energy/BESS-specific benchmark exists; homepage rates are normally well below campaign-page medians.
- Buyer behaviour: 77% say their last purchase was very complex; buyers spend 17% of buying time with suppliers; groups of 6–10 each bring 4–5 self-gathered pieces of information. https://www.gartner.com/en/sales/insights/b2b-buying-journey (undated). 33% prefer a seller-free experience, 44% of millennials. https://www.gartner.com/en/newsroom/press-releases/2020-09-15-gartner-says-80--of-b2b-sales-interactions-between-su (15 Sep 2020). 64% of B2B buyers are millennial/Gen Z. https://www.forrester.com/press-newsroom/changing-b2b-buying-behaviors/ (15 Feb 2023)

## 6. Segment paths vs one message

- Audience-based navigation is "usually problematic": users cannot self-classify, fear missing better offers, pogo-stick between duplicated sections; make topic/task the primary structure and audience secondary; it works only when segment content is unique and categories are mutually exclusive. https://www.nngroup.com/articles/audience-based-navigation/ (7 Sep 2015). Same finding in 2006 B2B study (segment menus do not match how customers see themselves).
- NN/g 2024 homepage: group CTAs by audience only where paths differ.
- Gartner's 6–10-person buying group means one page is read by owner, CFO and facility manager; segment pages serve the "4–5 pieces of information" each gathers.
- Gap: no robust published A/B evidence that segmented B2B pages outperform one page. A widely quoted HubSpot 2011 "more landing pages = 7×/12× more leads" claim could not be verified from the source page; treat as unverified.

## 7. Deep explainers: sub-page vs front page

- Information foraging: users click when a link carries strong scent (descriptive text naming the destination); slogans carry no scent; show sample content on the homepage so the site looks "nutritious and easy to get into". https://www.nngroup.com/articles/information-foraging-leave-site/ (29 Jun 2003)
- Long pages need signposts (2015); do not fragment content into tiny pages, but content users must understand should not be hidden (2014).
- Data-rich explainers are what buyers trust most (Edelman 2024) and what they gather independently (Gartner) — this argues for dedicated pages that can be sent, searched and linked.

## (a) Recommended front-page structure

1. Hero (first screen, within ~600 px): one plain sentence stating what SAMA does and for whom; the chosen energy-independence headline; one primary CTA that names the result; phone number visible; static or lightweight visual; the next section visibly peeking in. Evidence: NN/g 2018/2015/2016/2024, KoMarketing 83%, Stanford.
2. Proof strip (second screenful, 17% of attention): 3–4 sourced numerals per market (Fingrid/Elering facts, each market its own), a named reference only where a client has agreed. Evidence: NN/g 2007 numerals, CXL 2016 logos/photos, Edelman 2024 data-led trust.
3. Pain/opportunity block (connection as asset): short, scannable, numerals, no promotional adjectives. Evidence: NN/g 1997 objective language, F-pattern.
4. What you get: the three-product ladder with the free assessment as the door; say what the assessment contains and what is free vs paid. Evidence: NN/g 2006 pricing, Clutch 2020 cost transparency.
5. How it works, four steps with who does what (SAMA integrates, aggregator operates). Evidence: Gartner buyer enablement, 17% time with suppliers.
6. Who it is for: segment cards linking to sub-pages; audience as secondary path. Evidence: NN/g 2015, 2024.
7. Why SAMA + team with real portraits, address, registry number. Evidence: NN/g 2010, Stanford, KoMarketing 51%.
8. Reserve-market teaser with a descriptive link and static preview of the explainer page. Evidence: information scent 2003.
9. FAQ as accordion (few key objections). Evidence: NN/g 2014.
10. Lead form: 4–5 single-line fields (name, company, phone, email, site/connection size), no required textarea, state what happens next and when; email and phone shown beside it. Evidence: HubSpot 40k, MarketingExperiments 2012, KoMarketing preferences.
11. Footer with full contact details. Budget: roughly 500–800 words on the page, 7th-grade reading level (Unbounce 2024, correlational).

Flag: the header CTA was switched off on 07.09.2026. Fold and sticky-nav evidence favours a persistent compact CTA/phone; worth re-testing.

## (b) Where heavy 3D / scroll explainers live

- Front page: a 3D element may sit beside the content as an ambient, mouse-reactive visual only if it never controls scrolling, never contains the text, never delays text appearing, loads after LCP with a weight budget, has a static poster on mobile and under prefers-reduced-motion, and conveys nothing that is only in the animation. Evidence: NN/g 2023 (both articles), Frederick 2015, web.dev motion, Google 3 s, Vodafone/Lazada LCP cases.
- Explainers (how the battery earns, grid map with layers, battery-day diagram): dedicated sub-pages. Build them as short chapters interleaved with normal-scrolling sections, sticky nav to escape, a stepper or static version on mobile, text outside the animated area. Link from the front page with descriptive link text plus a static preview image, not "Learn more". Rationale: task-focused buyers (CFO checking cost) are the most annoyed by scrolljacking; explorers get full value on a page that can also be sent to the other 5–9 members of the buying group.

## (c) Five things to measure after launch

1. Lead-form submission rate per session, by device and by language site, against the 6.1% professional-services median as a ceiling reference (Unbounce 2024).
2. Scroll depth (25/50/75/100%) and share reaching the form; a drop right after the hero signals a false floor (NN/g 2016).
3. Field Core Web Vitals (CrUX/Search Console) on mobile with the 3D element live: LCP ≤2.5 s, CLS ≤0.1, INP ≤200 ms.
4. Explainer sub-pages: click-through from the front page, exits/refreshes inside scroll-driven sections (NN/g 2023 failure signal), and whether explainer viewers convert at a higher rate.
5. Lead quality and channel: % of submissions meeting the ≥100 kW / decision-maker criteria, phone calls via a tracked number vs form, and time to first contact.
