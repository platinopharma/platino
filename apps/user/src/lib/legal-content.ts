// Legal content for Platino Pharma.
// This content is app-owned editable copy. Replace the ENTITY block and any
// bracketed placeholders with your registered legal, contact, and grievance
// details before publication. Nothing here is a certification or an audit
// statement; it describes the platform's stated practices as of the
// EFFECTIVE_DATE.

export const ENTITY = {
  name: "Platino Pharma",
  legalName: "Platino Pharma Technologies Pvt. Ltd.",
  jurisdiction: "India",
  seat: "Hyderabad, Telangana",
  supportEmail: "support@platinopharma.com",
  privacyEmail: "privacy@platinopharma.com",
  grievanceEmail: "grievance@platinopharma.com",
  grievanceOfficer: "Grievance Redressal Officer",
  phone: "+91 80000 00000",
  address: "Registered Corporate Office, Hyderabad, Telangana, India",
} as const;

export const EFFECTIVE_DATE = "6 July 2026";
export const LEGAL_VERSION = "v1.0.0";

export type LegalSection = {
  heading: string;
  body?: string[];
  bullets?: string[];
};

export type LegalDoc = {
  slug: string;
  order: number;
  title: string;
  short: string;
  description: string;
  intro?: string;
  sections: LegalSection[];
};

const P = ENTITY.name;

export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: "terms",
    order: 1,
    title: "Terms & Conditions",
    short: "The master agreement that governs use of the platform.",
    description: `The master agreement between ${P} and everyone who uses the platform — customers and pharmacy partners.`,
    intro: `Welcome to ${P}. ${P} ("Platform", "Company", "We", "Us", or "Our") is a technology platform that enables customers to discover nearby licensed pharmacies, upload valid prescriptions where required, place medicine requests, and communicate digitally with registered pharmacy partners. ${P} does not own, manufacture, stock, distribute, prescribe, dispense, or sell medicines. Every medicine available through the Platform is sold solely by an independent licensed pharmacy partner registered on the Platform. By accessing or using the Platform, you acknowledge that you have read, understood, and agreed to be bound by these Terms and Conditions. If you do not agree with these Terms, you must discontinue use of the Platform immediately.`,
    sections: [
      {
        heading: "1. Introduction",
        body: [
          `Welcome to ${P}.`,
          `${P} ("Platform", "Company", "We", "Us", or "Our") is a technology platform that enables customers to discover nearby licensed pharmacies, upload valid prescriptions where required, place medicine requests, and communicate digitally with registered pharmacy partners.`,
          `${P} does not own, manufacture, stock, distribute, prescribe, dispense, or sell medicines.`,
          `Every medicine available through the Platform is sold solely by an independent licensed pharmacy partner registered on the Platform.`,
          `By accessing or using the Platform, you acknowledge that you have read, understood, and agreed to be bound by these Terms and Conditions.`,
          `If you do not agree with these Terms, you must discontinue use of the Platform immediately.`,
        ],
      },
      {
        heading: "2. Nature of the Platform",
        body: [
          `${P} operates solely as a technology intermediary.`,
          "The Platform facilitates:",
        ],
        bullets: [
          "Pharmacy discovery",
          "Medicine catalog browsing",
          "Prescription uploads",
          "Order placement",
          "Communication between customers and pharmacies",
          "Order status updates",
          "Digital notifications",
          "Pharmacy management tools",
        ],
      },
      {
        heading: "2a. The Platform does not",
        bullets: [
          "Own medicines",
          "Purchase medicines",
          "Sell medicines",
          "Dispense medicines",
          "Recommend medicines",
          "Provide medical advice",
          "Operate warehouses",
          "Control pharmacy inventory",
          "Guarantee medicine availability",
          "Guarantee prices",
          "Guarantee delivery timelines",
        ],
        body: ["Each pharmacy partner operates independently."],
      },
      {
        heading: "3. Eligibility",
        body: [`To use ${P}, users must:`],
        bullets: [
          "Be at least 18 years of age or use the Platform under the supervision of a parent or legal guardian.",
          "Provide accurate, complete, and current information.",
          "Use the Platform only for lawful purposes.",
          "Not impersonate another individual or entity.",
          "Comply with all applicable laws and regulations.",
        ],
      },
      {
        heading: "4. Customer Accounts",
        body: [
          "Customers may create an account using approved authentication methods.",
          "Customers are responsible for:",
        ],
        bullets: [
          "Maintaining password confidentiality.",
          "Protecting their account credentials.",
          "Keeping personal information up to date.",
          "Preventing unauthorized access to their account.",
        ],
      },
      {
        heading: "5. Pharmacy Partner Accounts",
        body: [
          `Only licensed pharmacies approved by ${P} may operate on the Platform.`,
          "Each pharmacy is responsible for:",
        ],
        bullets: [
          "Maintaining valid licenses.",
          "Ensuring medicine authenticity.",
          "Maintaining inventory accuracy.",
          "Complying with all applicable healthcare regulations.",
          "Employing qualified pharmacists where legally required.",
        ],
      },
      {
        heading: "6. Medicine Listings",
        body: [
          "Medicine information displayed on the Platform is provided by pharmacy partners.",
          "The Platform does not guarantee:",
        ],
        bullets: [
          "Stock availability",
          "Price accuracy",
          "Product descriptions",
          "Images",
          "Brand availability",
          "Manufacturer availability",
        ],
      },
      {
        heading: "7. Prescription Medicines",
        body: [
          "Certain medicines require a valid prescription.",
          "Customers agree to:",
        ],
        bullets: [
          "Upload genuine prescriptions.",
          "Upload prescriptions issued by registered medical practitioners.",
          "Not alter or forge prescriptions.",
          "Not upload expired prescriptions where prohibited by law.",
        ],
      },
      {
        heading: "8. Order Placement",
        body: [
          "Submitting an order through the Platform constitutes a request to purchase medicines from the selected pharmacy.",
          "The pharmacy may:",
        ],
        bullets: [
          "Accept the order.",
          "Reject the order.",
          "Modify availability.",
          "Contact the customer for clarification.",
        ],
      },
      {
        heading: "9. Pricing",
        body: [
          "Medicine prices are determined exclusively by the pharmacy partner.",
          `${P} does not:`,
        ],
        bullets: [
          "Control medicine pricing.",
          "Modify prices.",
          "Add hidden charges.",
          "Negotiate pharmacy pricing.",
        ],
      },
      {
        heading: "10. Delivery Model",
        body: ["Delivery may be performed by:"],
        bullets: [
          "The pharmacy itself.",
          "A delivery person assigned by the pharmacy.",
          "An authorized logistics partner engaged by the pharmacy.",
        ],
      },
      {
        heading: "11. Payment Policy — Cash on Delivery",
        body: [
          `${P} primarily operates on a Pay on Delivery model.`,
          "Customers shall make payment only after the delivery representative arrives at the delivery location.",
          "Payment must be made directly to the pharmacy or its authorized delivery representative using the payment methods accepted by that pharmacy.",
          `${P} does not collect payment on behalf of pharmacies unless explicitly stated.`,
        ],
      },
      {
        heading: "12. Customer Verification Before Payment",
        body: [
          "Customers are strongly advised to inspect the order before completing payment.",
          "The customer should verify:",
        ],
        bullets: [
          "Correct medicines",
          "Correct quantities",
          "Correct dosage",
          "Brand (if applicable)",
          "Expiry dates",
          "Packaging condition",
          "Physical damage",
          "Prescription compliance",
        ],
      },
      {
        heading: "13. Refund Policy",
        body: [
          `${P} does not provide refunds.`,
          "The Platform does not process refund requests.",
          "The Platform does not hold customer money.",
          "The Platform does not reverse payments.",
          "The Platform does not guarantee refunds.",
          "Once payment has been completed and medicines have been accepted by the customer, the transaction is considered final.",
        ],
      },
      {
        heading: "14. Return Policy",
        body: [
          `Medicines cannot be returned through ${P}.`,
          "Customers are expected to inspect all medicines at the time of delivery.",
          "Any refusal must occur immediately while the delivery representative is present.",
          "After the customer accepts delivery and completes payment, no returns can be initiated through the Platform.",
        ],
      },
      {
        heading: "15. Replacement Policy",
        body: [
          `${P} does not process replacements.`,
          "If the customer identifies:",
        ],
        bullets: [
          "Incorrect medicine",
          "Damaged medicine",
          "Expired medicine",
          "Wrong quantity",
          "Incorrect product",
        ],
      },
      {
        heading: "16. Cancellation Policy",
        body: [
          "Customers may cancel an order only before the pharmacy begins processing it.",
          "Once a pharmacy has accepted and prepared an order, cancellation may not be possible.",
          "Repeated fake orders or misuse of cancellations may result in account suspension.",
        ],
      },
      {
        heading: "17. Customer Responsibilities",
        body: ["Customers agree to:"],
        bullets: [
          "Provide accurate information.",
          "Upload valid prescriptions.",
          "Be available at the delivery address.",
          "Inspect medicines before payment.",
          "Make payment promptly upon accepting delivery.",
          "Use medicines only under professional medical guidance.",
          "Comply with all applicable laws.",
        ],
      },
      {
        heading: "18. Pharmacy Responsibilities",
        body: ["Each pharmacy partner is solely responsible for:"],
        bullets: [
          "Maintaining valid licenses.",
          "Selling genuine medicines.",
          "Maintaining inventory.",
          "Updating stock availability.",
          "Correct pricing.",
          "Prescription verification.",
          "Proper medicine storage.",
          "Safe packaging.",
          "Delivery arrangements.",
          "Customer support.",
          "Legal compliance.",
          "Drug authenticity.",
          "Expiry monitoring.",
        ],
      },
      {
        heading: "19. Platform Responsibilities",
        body: [`${P} provides:`],
        bullets: [
          "Technology infrastructure",
          "Secure user accounts",
          "Pharmacy discovery",
          "Search functionality",
          "Prescription upload",
          "Order routing",
          "Notifications",
          "Order tracking",
          "Pharmacy verification",
          "Platform security",
          "Analytics tools",
        ],
      },
      {
        heading: "20. Platform Limitations",
        body: [`${P} is not responsible for:`],
        bullets: [
          "Medicine quality",
          "Medicine efficacy",
          "Side effects",
          "Pricing disputes",
          "Inventory shortages",
          "Delivery delays",
          "Pharmacy conduct",
          "Prescription approval decisions",
          "Refund decisions",
          "Product replacements",
          "Customer misuse of medicines",
        ],
      },
      {
        heading: "21. Prohibited Activities",
        body: ["Users must not:"],
        bullets: [
          "Upload forged prescriptions.",
          "Place fake orders.",
          "Abuse pharmacy staff.",
          "Reverse engineer the Platform.",
          "Attempt unauthorized access.",
          "Use bots or automated scripts.",
          "Spread malware.",
          "Interfere with Platform operations.",
          "Misrepresent their identity.",
          "Violate applicable laws.",
        ],
      },
      {
        heading: "22. Intellectual Property",
        body: [
          `All rights relating to the Platform, including its software, source code, design, trademarks, branding, logos, user interface, APIs, documentation, databases (excluding pharmacy-owned content), and proprietary technology, are the exclusive property of ${P}.`,
          "Pharmacy partners retain ownership of their own business names, logos, licenses, product information, and business documents.",
        ],
      },
      {
        heading: "23. Limitation of Liability",
        body: [
          `To the maximum extent permitted by law, ${P} shall not be liable for any direct, indirect, incidental, consequential, special, or punitive damages arising from:`,
        ],
        bullets: [
          "Pharmacy operations",
          "Medicine quality",
          "Incorrect dispensing",
          "Delivery failures",
          "Pricing disputes",
          "Medical outcomes",
          "Customer misuse of medicines",
          "Technical interruptions beyond reasonable control",
        ],
      },
      {
        heading: "24. Governing Law",
        body: [
          "These Terms shall be governed by the laws of the Republic of India.",
          `Any disputes arising from the use of the Platform shall be subject to the exclusive jurisdiction of the competent courts where ${P} is registered, unless otherwise required by applicable law.`,
        ],
      },
      {
        heading: "25. Contact Information",
        body: [
          `For platform-related support, technical issues, account concerns, or legal inquiries, users may contact ${P} through the official support channels published on the Platform.`,
          `Important: Issues related to medicine quality, pricing, refunds, replacements, prescription verification, or delivery should be addressed directly with the respective pharmacy partner, as those matters fall outside the Platform's operational responsibility.`,
        ],
      },
      {
        heading: "Important Note",
        body: [
          `Because ${P} operates as a healthcare-related platform in India, these terms should be reviewed and finalized by a qualified legal professional to ensure compliance with laws such as the Information Technology Act, 2000, the Digital Personal Data Protection Act, 2023, the Drugs and Cosmetics Act, 1940, the Drugs and Cosmetics Rules, 1945, the Consumer Protection Act, 2019, and any applicable state pharmacy regulations. This draft is a strong business and product foundation but should not be treated as legal advice.`,
        ],
      },
    ],
  },

  {
    slug: "privacy",
    order: 2,
    title: "Privacy Policy",
    short: "What personal data we collect, how we use it, and your rights.",
    description: `How ${P} collects, uses, shares, and safeguards personal information.`,
    intro: `This Privacy Policy describes how ${ENTITY.legalName} handles personal data collected through the ${P} platform.`,
    sections: [
      { heading: "Information we collect", bullets: [
        "Personal information: name, email address, phone number, delivery addresses, date of birth.",
        "Location: GPS location (when granted) and saved delivery addresses.",
        "Technical data: device identifiers, browser type, IP address, session data.",
        "Order data: order history, prescription records, and payment method metadata.",
        "Files: prescription images and health-related documents you upload.",
      ] },
      { heading: "How we use your information", bullets: [
        "Authenticate your account and secure the Platform.",
        "Process and route Orders to the Pharmacy you select.",
        "Send transactional notifications (order status, prescription review).",
        "Verify Pharmacy partners and moderate the marketplace.",
        "Provide customer support and resolve grievances.",
        "Detect and prevent fraud or abuse.",
        "Improve reliability, safety, and product analytics.",
      ] },
      { heading: "Data sharing", bullets: [
        "With the Pharmacy you select, to fulfil your Order.",
        "With delivery partners engaged by the Pharmacy, where applicable.",
        "With payment gateways to process transactions.",
        "With government or regulatory authorities when legally required.",
        `We do not sell your personal information.`,
      ] },
      { heading: "Data security", bullets: [
        "Transport encryption (HTTPS/TLS) for data in transit.",
        "Signed session tokens for authenticated access.",
        "Access controls limiting who inside our team can view sensitive records.",
        "Encrypted storage for prescription files.",
        "This describes our stated controls; it is not an independent security certification.",
      ] },
      { heading: "Data retention", bullets: [
        "Account data is retained while your account is active.",
        "Orders and prescriptions are retained as long as reasonably needed for tax, dispute-resolution, and regulatory recordkeeping.",
        "Server and audit logs are retained for a rolling window and then rotated or deleted.",
      ] },
      { heading: "Your rights", bullets: [
        "Access the personal information we hold about you.",
        "Correct inaccurate information.",
        "Request deletion of your account and associated data.",
        "Download a copy of your data in a portable format.",
        "Withdraw consent for optional processing at any time.",
      ] },
      { heading: "Contact", body: [`Privacy questions or requests: ${ENTITY.privacyEmail}.`] },
    ],
  },

  {
    slug: "customer-terms",
    order: 3,
    title: "Customer Terms of Service",
    short: "Rules and responsibilities for people who place orders.",
    description: `Rules of the road for Customers placing orders on ${P}.`,
    sections: [
      { heading: "Customer responsibilities", bullets: [
        "Provide accurate personal, contact, and delivery information.",
        "Upload only valid, unaltered prescriptions issued by a qualified practitioner.",
        "Use ordered medicines lawfully and only for the person for whom they were prescribed.",
        "Keep your delivery address complete and reachable.",
        "Cooperate with identity or age verification where required.",
      ] },
      { heading: "You agree not to", bullets: [
        "Misuse the Platform or interfere with its operation.",
        "Upload fake, altered, or non-consented prescriptions.",
        "Harass, threaten, or abuse Pharmacies, delivery staff, or support agents.",
        "Violate any applicable law, including narcotic and controlled-substance laws.",
      ] },
      { heading: "Account suspension", body: ["We may suspend or terminate accounts involved in fraud, fake orders, prescription misuse, or illegal activity, and cooperate with authorities as required by law."] },
    ],
  },

  {
    slug: "pharmacy-partner",
    order: 4,
    title: "Pharmacy Partner Agreement",
    short: "Terms for pharmacies listing on the platform.",
    description: `The agreement between ${P} and independent pharmacies that list on the Platform.`,
    sections: [
      { heading: "Pharmacy requirements", bullets: [
        "Valid drug license under the Drugs & Cosmetics Act.",
        "Valid GST registration.",
        "Valid business registration or proprietorship documentation.",
        "Owner identity documentation.",
        "Cancelled cheque or equivalent bank verification.",
        "Verifiable business address.",
      ] },
      { heading: "Pharmacy responsibilities", bullets: [
        "Maintain accurate inventory and stock levels.",
        "Sell genuine, in-date medicines from authorised sources.",
        "Set and display honest pricing.",
        "Verify prescriptions before dispensing.",
        "Package medicines safely and hygienically.",
        "Complete delivery reliably (directly or via a delivery partner).",
        "Monitor and remove expired stock.",
        "Store medicines under required conditions.",
        "Provide direct customer support for order-level issues.",
        "Comply with the Drugs & Cosmetics Act and all applicable healthcare and consumer laws.",
      ] },
      { heading: "Pharmacy commitments", bullets: [
        "Keep all licenses current throughout the listing period.",
        "Never sell counterfeit, mislabelled, or substandard medicines.",
        "Honor Orders accepted through the Platform.",
        "Keep listed stock and prices reasonably synchronized with reality.",
      ] },
      { heading: "Platform rights", bullets: [
        "Approve, reject, or defer Pharmacy applications.",
        "Suspend or delist Pharmacies that violate this Agreement.",
        "Remove listings that are inaccurate, misleading, or unlawful.",
        "Request additional documentation or clarification.",
        "Conduct verification checks and periodic re-verifications.",
      ] },
      { heading: "Termination", bullets: [
        "Expiry or revocation of the Pharmacy's licenses.",
        "Fraud or misrepresentation.",
        "Sale of counterfeit or substandard medicines.",
        "Repeated substantiated customer complaints.",
        "Serious or repeated legal violations.",
      ] },
    ],
  },

  {
    slug: "refunds",
    order: 5,
    title: "Refund, Return & Cancellation Policy",
    short: "Pay on delivery. Inspect before you pay. No refunds or returns after payment.",
    description: `${P} operates on a Pay on Delivery model. Inspect your order before paying. Refunds, returns, and replacements are not processed by the Platform.`,
    intro: `${P} primarily operates on a Pay on Delivery model. Customers should inspect every medicine at the point of delivery, before completing payment. Once payment has been made and delivery accepted, the transaction is considered final on the Platform.`,
    sections: [
      {
        heading: "Payment — Pay on Delivery",
        body: [
          `${P} primarily operates on a Pay on Delivery model.`,
          "Customers shall make payment only after the delivery representative arrives at the delivery location.",
          "Payment is made directly to the pharmacy or its authorized delivery representative.",
          `${P} does not collect payment on behalf of pharmacies unless explicitly stated.`,
        ],
      },
      {
        heading: "Inspect before you pay",
        body: ["The customer should verify every item before completing payment. Verify:"],
        bullets: [
          "Correct medicines",
          "Correct quantities and dosage",
          "Brand (if applicable)",
          "Expiry dates",
          "Packaging condition and physical damage",
          "Prescription compliance",
        ],
      },
      {
        heading: "If something is wrong at delivery",
        body: [
          "If any issue is identified, the customer should immediately refuse acceptance of the affected medicines before payment is completed.",
          "Incorrect, damaged, expired, or wrong-quantity items must be resolved with the delivery representative and pharmacy before payment is made.",
        ],
      },
      {
        heading: "Refunds",
        body: [
          `${P} does not provide refunds.`,
          "The Platform does not process refund requests, hold customer money, or reverse payments.",
          "Once payment has been completed and medicines have been accepted, the transaction is considered final.",
        ],
      },
      {
        heading: "Returns",
        body: [
          `Medicines cannot be returned through ${P}.`,
          "Any refusal must occur immediately while the delivery representative is present.",
          "After delivery is accepted and payment is completed, no returns can be initiated through the Platform.",
        ],
      },
      {
        heading: "Replacements",
        body: [
          `${P} does not process replacements.`,
          "Any issue (incorrect, damaged, expired, wrong quantity, or wrong product) must be resolved with the pharmacy at the point of delivery before payment.",
        ],
      },
      {
        heading: "Cancellation",
        body: [
          "Customers may cancel an order only before the pharmacy begins processing it.",
          "Once a pharmacy has accepted and prepared an order, cancellation may not be possible.",
          "Repeated fake orders or misuse of cancellations may result in account suspension.",
        ],
      },
      {
        heading: "Payment disputes",
        body: [
          "Any payment disputes are handled directly between the customer and the pharmacy.",
          "The Platform's role is limited to routing the order and providing technology infrastructure.",
        ],
      },
    ],
  },

  {
    slug: "medical-disclaimer",
    order: 6,
    title: "Medical Disclaimer & Prescription Policy",
    short: "Important health and prescription boundaries.",
    description: "Important boundaries about medical advice, prescriptions, and emergencies.",
    sections: [
      { heading: "Medical disclaimer", bullets: [
        `${P} does not provide medical advice, diagnosis, or treatment.`,
        `${P} does not recommend medicines, treatment plans, or dosages.`,
        `${P} does not replace consultation with a qualified doctor, pharmacist, or hospital.`,
      ] },
      { heading: "Prescription policy", bullets: [
        "Customers upload the prescription with the Order.",
        "The Pharmacy reviews and validates the prescription.",
        "The Pharmacy is solely responsible for approving or rejecting dispensation.",
        "The Platform stores the uploaded file to enable review; it does not evaluate medical suitability.",
      ] },
      { heading: "Restricted medicines", body: ["The Platform does not approve, list, or facilitate the sale of controlled substances or medicines that require special authorisation beyond routine prescriptions. Legal compliance rests with the Pharmacy."] },
      { heading: "Medicine information", body: ["Any medicine descriptions or educational content on the Platform are informational only and are not a substitute for professional medical advice."] },
      { heading: "Emergency use", body: ["The Platform must not be used for medical emergencies. In an emergency, call your local emergency services immediately."] },
    ],
  },

  {
    slug: "platform-responsibilities",
    order: 7,
    title: "Platform Responsibilities",
    short: "What the platform does — and what it deliberately does not do.",
    description: `A clear separation of what ${P} does and does not provide.`,
    sections: [
      { heading: `${P} provides`, bullets: [
        "The technology platform that connects Customers and Pharmacies.",
        "Search and discovery of participating Pharmacies and medicines.",
        "Order placement, prescription upload, and file storage.",
        "Notifications and status tracking.",
        "User authentication and account management.",
        "Pharmacy verification and onboarding workflow.",
        "Administrative tooling for Pharmacies and internal operations.",
        "Platform security controls appropriate to a marketplace of this kind.",
        "Aggregate analytics used to improve the product.",
      ] },
      { heading: `${P} does not`, bullets: [
        "Own, stock, or dispense medicines.",
        "Deliver medicines directly.",
        "Prescribe medicines or provide medical advice.",
        "Guarantee inventory availability at any given Pharmacy.",
        "Guarantee pricing set by Pharmacies.",
        "Guarantee delivery, refunds, or returns beyond what the Pharmacy agrees to.",
      ] },
    ],
  },

  {
    slug: "acceptable-use",
    order: 8,
    title: "Acceptable Use Policy",
    short: "What users may not do on the platform.",
    description: `Behavior that is not acceptable on ${P}.`,
    sections: [
      { heading: "Users must not", bullets: [
        "Upload fake, altered, or fraudulent prescriptions.",
        "Upload documents that are illegal or infringe on others' rights.",
        "Spam, harass, or abuse Pharmacies, delivery staff, or customer support.",
        "Attempt to hack, probe, or overload the Platform or its APIs.",
        "Reverse-engineer, decompile, or scrape the Platform outside published interfaces.",
        "Use bots, scripts, or automation not offered by the Platform.",
        "Attempt payment fraud or misuse of promotions.",
        "Create fake or duplicate accounts.",
      ] },
      { heading: "Consequences", bullets: [
        "Warning.",
        "Temporary suspension.",
        "Permanent ban.",
        "Referral to law enforcement where warranted.",
      ] },
    ],
  },

  {
    slug: "ip",
    order: 9,
    title: "Intellectual Property Policy",
    short: "Who owns what on the platform.",
    description: `Ownership of platform IP and Pharmacy IP on ${P}.`,
    sections: [
      { heading: "Platform IP", body: [`The ${P} logo, brand, product design, source code, APIs, editorial content, imagery, and user interface remain the exclusive property of ${ENTITY.legalName}.`] },
      { heading: "Pharmacy IP", bullets: [
        "Store name and store logo.",
        "Medicine and store imagery uploaded by the Pharmacy.",
        "Business documents provided during onboarding.",
      ] },
      { heading: "License to display", body: [`Pharmacies grant ${P} a non-exclusive license to display their store information and imagery on the Platform for the purpose of facilitating discovery and ordering.`] },
      { heading: "Reporting infringement", body: [`If you believe content on ${P} infringes your rights, contact ${ENTITY.supportEmail} with details and evidence.`] },
    ],
  },

  {
    slug: "cookies",
    order: 10,
    title: "Cookie Policy",
    short: "Cookies and similar technologies the platform uses.",
    description: `Cookies and similar technologies used by ${P}.`,
    sections: [
      { heading: "Categories we use", bullets: [
        "Authentication and session cookies to keep you signed in.",
        "Preference cookies (e.g. selected delivery area, theme).",
        "Performance and reliability cookies used to detect errors.",
        "Analytics cookies used in aggregate to improve the Platform.",
      ] },
      { heading: "Your choices", body: ["You can disable cookies in your browser. Some functionality — including sign-in and cart persistence — may stop working if you do."] },
    ],
  },

  {
    slug: "community-guidelines",
    order: 11,
    title: "Community Guidelines",
    short: "How customers and pharmacies should treat each other.",
    description: `How Customers and Pharmacies are expected to conduct themselves on ${P}.`,
    sections: [
      { heading: "For customers", bullets: [
        "Be respectful to Pharmacy staff and delivery personnel.",
        "Provide accurate personal and delivery information.",
        "Upload genuine prescriptions issued to you.",
        "Report issues honestly and constructively.",
      ] },
      { heading: "For pharmacies", bullets: [
        "Keep inventory and pricing information accurate.",
        "Respond promptly to Orders and Customer messages.",
        "Sell only genuine medicines from authorised sources.",
        "Follow all applicable regulations and packaging norms.",
      ] },
    ],
  },

  {
    slug: "grievance",
    order: 12,
    title: "Grievance Redressal Policy",
    short: "How complaints are triaged and resolved.",
    description: `How to raise a grievance about ${P} and how we route it.`,
    intro: "Consistent with the Information Technology Rules, 2021 for intermediaries, complaints are triaged and routed to the party best placed to resolve them.",
    sections: [
      { heading: "How to raise a grievance", bullets: [
        `Email: ${ENTITY.grievanceEmail}`,
        `Grievance Officer: ${ENTITY.grievanceOfficer}`,
        `Address: ${ENTITY.address}`,
      ] },
      { heading: "How complaints are routed", body: [
        "Complaints are received by platform support and categorised.",
        `Platform issues — technical problems, sign-in issues, account issues, order visibility, and platform bugs — are resolved by ${P}.`,
        "Medicine and order issues — quality, pricing, refunds, replacements, exchanges, delivery, and prescription verification — are routed to the responsible Pharmacy for resolution.",
      ] },
      { heading: "Response timelines", bullets: [
        "Acknowledgment: within 48 hours of receipt.",
        "Resolution or substantive update: aim within 15 days, subject to complexity and cooperation from third parties.",
      ] },
      { heading: "Escalation", body: ["If you are not satisfied with the response, you may write to the Grievance Officer at the address above, or approach the appropriate consumer forum or regulatory authority."] },
    ],
  },
];

export function getLegalDoc(slug: string): LegalDoc | undefined {
  return LEGAL_DOCS.find((d) => d.slug === slug);
}
