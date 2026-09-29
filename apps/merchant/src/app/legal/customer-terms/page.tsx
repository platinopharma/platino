import { Metadata } from "next";
import { LegalH1, LegalH2, LegalH3, LegalP, LegalUl, LegalLi } from "@/components/site/legal-typography";

export const metadata: Metadata = {
  title: "Customer Terms of Service",
  description: "Read the comprehensive Customer Terms of Service governing the use of the Platino Pharma technology platform.",
  alternates: {
    canonical: "/legal/customer-terms",
  },
};

export default function CustomerTerms() {
  return (
    <article>
      <LegalH1>Platino Pharma Customer Terms of Service</LegalH1>
      
      <LegalP><strong>Effective Date:</strong> [DD/MM/YYYY]</LegalP>
      <LegalP><strong>Last Updated:</strong> [DD/MM/YYYY]</LegalP>

      <LegalH2>Introduction</LegalH2>
      <LegalP>Welcome to Platino Pharma.</LegalP>
      <LegalP>These Customer Terms of Service ("Terms") govern your access to and use of the Platino Pharma website, mobile application, and related services ("Platform").</LegalP>
      <LegalP>Platino Pharma is a technology platform that enables customers to discover nearby licensed pharmacy partners, upload prescriptions where required, place medicine requests, and communicate digitally with registered pharmacies.</LegalP>
      <LegalP>Platino Pharma does not own, manufacture, stock, distribute, prescribe, dispense, or sell medicines.</LegalP>
      <LegalP>Every medicine available through the Platform is sold solely by an independent licensed pharmacy partner.</LegalP>
      <LegalP>By accessing or using the Platform, you acknowledge that you have read, understood, and agreed to be bound by these Terms and Conditions.</LegalP>
      <LegalP>If you do not agree with these Terms, you must discontinue use of the Platform immediately.</LegalP>

      <LegalH2>Nature of the Platform</LegalH2>
      <LegalP>Platino Pharma operates solely as a technology intermediary.</LegalP>
      <LegalP>The Platform facilitates:</LegalP>
      <LegalUl>
        <LegalLi>Pharmacy discovery</LegalLi>
        <LegalLi>Medicine catalog browsing</LegalLi>
        <LegalLi>Prescription uploads</LegalLi>
        <LegalLi>Order placement</LegalLi>
        <LegalLi>Communication between customers and pharmacies</LegalLi>
        <LegalLi>Order status updates</LegalLi>
        <LegalLi>Digital notifications</LegalLi>
        <LegalLi>Pharmacy management tools</LegalLi>
      </LegalUl>

      <LegalP>The Platform does not:</LegalP>
      <LegalUl>
        <LegalLi>Own medicines</LegalLi>
        <LegalLi>Purchase medicines</LegalLi>
        <LegalLi>Sell medicines</LegalLi>
        <LegalLi>Dispense medicines</LegalLi>
        <LegalLi>Recommend medicines</LegalLi>
        <LegalLi>Provide medical advice</LegalLi>
        <LegalLi>Operate warehouses</LegalLi>
        <LegalLi>Control pharmacy inventory</LegalLi>
        <LegalLi>Guarantee medicine availability</LegalLi>
        <LegalLi>Guarantee prices</LegalLi>
        <LegalLi>Guarantee delivery timelines</LegalLi>
      </LegalUl>
      <LegalP>Each pharmacy partner operates independently.</LegalP>

      <LegalH2>Eligibility</LegalH2>
      <LegalP>To use Platino Pharma, users must:</LegalP>
      <LegalUl>
        <LegalLi>Be at least 18 years of age or use the Platform under the supervision of a parent or legal guardian.</LegalLi>
        <LegalLi>Provide accurate, complete, and current information.</LegalLi>
        <LegalLi>Use the Platform only for lawful purposes.</LegalLi>
        <LegalLi>Not impersonate another individual or entity.</LegalLi>
        <LegalLi>Comply with all applicable laws and regulations.</LegalLi>
      </LegalUl>
      <LegalP>The Company reserves the right to refuse access to any user at its sole discretion.</LegalP>

      <LegalH2>Customer Accounts</LegalH2>
      <LegalP>Customers may create an account using approved authentication methods.</LegalP>
      <LegalP>Customers are responsible for:</LegalP>
      <LegalUl>
        <LegalLi>Maintaining password confidentiality.</LegalLi>
        <LegalLi>Protecting their account credentials.</LegalLi>
        <LegalLi>Keeping personal information up to date.</LegalLi>
        <LegalLi>Preventing unauthorized access to their account.</LegalLi>
      </LegalUl>
      <LegalP>Customers are solely responsible for all activities performed through their account.</LegalP>

      <LegalH2>Pharmacy Partner Accounts</LegalH2>
      <LegalP>Only licensed pharmacies approved by Platino Pharma may operate on the Platform.</LegalP>
      <LegalP>Each pharmacy is responsible for:</LegalP>
      <LegalUl>
        <LegalLi>Maintaining valid licenses.</LegalLi>
        <LegalLi>Ensuring medicine authenticity.</LegalLi>
        <LegalLi>Maintaining inventory accuracy.</LegalLi>
        <LegalLi>Complying with all applicable healthcare regulations.</LegalLi>
        <LegalLi>Employing qualified pharmacists where legally required.</LegalLi>
      </LegalUl>
      <LegalP>Platino Pharma may suspend or terminate pharmacy access at any time if compliance requirements are not met.</LegalP>

      <LegalH2>Medicine Listings</LegalH2>
      <LegalP>Medicine information displayed on the Platform is provided by pharmacy partners.</LegalP>
      <LegalP>The Platform does not guarantee:</LegalP>
      <LegalUl>
        <LegalLi>Stock availability</LegalLi>
        <LegalLi>Price accuracy</LegalLi>
        <LegalLi>Product descriptions</LegalLi>
        <LegalLi>Images</LegalLi>
        <LegalLi>Brand availability</LegalLi>
        <LegalLi>Manufacturer availability</LegalLi>
      </LegalUl>
      <LegalP>Pharmacies are solely responsible for maintaining accurate information.</LegalP>

      <LegalH2>Prescription Medicines</LegalH2>
      <LegalP>Certain medicines require a valid prescription.</LegalP>
      <LegalP>Customers agree to:</LegalP>
      <LegalUl>
        <LegalLi>Upload genuine prescriptions.</LegalLi>
        <LegalLi>Upload prescriptions issued by registered medical practitioners.</LegalLi>
        <LegalLi>Not alter or forge prescriptions.</LegalLi>
        <LegalLi>Not upload expired prescriptions where prohibited by law.</LegalLi>
      </LegalUl>
      <LegalP>The pharmacy partner independently verifies every prescription.</LegalP>
      <LegalP>Platino Pharma does not approve, reject, or validate prescriptions.</LegalP>

      <LegalH2>Order Placement</LegalH2>
      <LegalP>Submitting an order through the Platform constitutes a request to purchase medicines from the selected pharmacy.</LegalP>
      <LegalP>The pharmacy may:</LegalP>
      <LegalUl>
        <LegalLi>Accept the order.</LegalLi>
        <LegalLi>Reject the order.</LegalLi>
        <LegalLi>Modify availability.</LegalLi>
        <LegalLi>Contact the customer for clarification.</LegalLi>
      </LegalUl>
      <LegalP>An order is considered confirmed only after the pharmacy accepts it.</LegalP>

      <LegalH2>Pricing</LegalH2>
      <LegalP>Medicine prices are determined exclusively by the pharmacy partner.</LegalP>
      <LegalP>Platino Pharma does not:</LegalP>
      <LegalUl>
        <LegalLi>Control medicine pricing.</LegalLi>
        <LegalLi>Modify prices.</LegalLi>
        <LegalLi>Add hidden charges.</LegalLi>
        <LegalLi>Negotiate pharmacy pricing.</LegalLi>
      </LegalUl>
      <LegalP>Prices may vary between pharmacies.</LegalP>

      <LegalH2>Delivery Model</LegalH2>
      <LegalP>Delivery may be performed by:</LegalP>
      <LegalUl>
        <LegalLi>The pharmacy itself.</LegalLi>
        <LegalLi>A delivery person assigned by the pharmacy.</LegalLi>
        <LegalLi>An authorized logistics partner engaged by the pharmacy.</LegalLi>
      </LegalUl>
      <LegalP>Platino Pharma facilitates delivery tracking where available but is not the delivery provider.</LegalP>

      <LegalH2>Payment Policy</LegalH2>
      <LegalH3>Cash on Delivery</LegalH3>
      <LegalP>Platino Pharma primarily operates on a Pay on Delivery model.</LegalP>
      <LegalP>Customers shall make payment only after the delivery representative arrives at the delivery location.</LegalP>
      <LegalP>Payment must be made directly to the pharmacy or its authorized delivery representative using the payment methods accepted by that pharmacy.</LegalP>
      <LegalP>Platino Pharma does not collect payment on behalf of pharmacies unless explicitly stated.</LegalP>
      
      <LegalH3>Customer Verification Before Payment</LegalH3>
      <LegalP>Customers are strongly advised to inspect the order before completing payment.</LegalP>
      <LegalP>The customer should verify:</LegalP>
      <LegalUl>
        <LegalLi>Correct medicines</LegalLi>
        <LegalLi>Correct quantities</LegalLi>
        <LegalLi>Correct dosage</LegalLi>
        <LegalLi>Brand (if applicable)</LegalLi>
        <LegalLi>Expiry dates</LegalLi>
        <LegalLi>Packaging condition</LegalLi>
        <LegalLi>Physical damage</LegalLi>
        <LegalLi>Prescription compliance</LegalLi>
      </LegalUl>
      <LegalP>If any issue is identified, the customer should immediately refuse acceptance of the affected medicines before payment is completed.</LegalP>

      <LegalH2>Refund Policy</LegalH2>
      <LegalP>Platino Pharma does not provide refunds.</LegalP>
      <LegalUl>
        <LegalLi>The Platform does not process refund requests.</LegalLi>
        <LegalLi>The Platform does not hold customer money.</LegalLi>
        <LegalLi>The Platform does not reverse payments.</LegalLi>
        <LegalLi>The Platform does not guarantee refunds.</LegalLi>
      </LegalUl>
      <LegalP>Once payment has been completed and medicines have been accepted by the customer, the transaction is considered final.</LegalP>

      <LegalH2>Return Policy</LegalH2>
      <LegalP>Medicines cannot be returned through Platino Pharma.</LegalP>
      <LegalP>Customers are expected to inspect all medicines at the time of delivery.</LegalP>
      <LegalP>Any refusal must occur immediately while the delivery representative is present.</LegalP>
      <LegalP>After the customer accepts delivery and completes payment, no returns can be initiated through the Platform.</LegalP>

      <LegalH2>Replacement Policy</LegalH2>
      <LegalP>Platino Pharma does not process replacements.</LegalP>
      <LegalP>If the customer identifies:</LegalP>
      <LegalUl>
        <LegalLi>Incorrect medicine</LegalLi>
        <LegalLi>Damaged medicine</LegalLi>
        <LegalLi>Expired medicine</LegalLi>
        <LegalLi>Wrong quantity</LegalLi>
        <LegalLi>Incorrect product</LegalLi>
      </LegalUl>
      <LegalP>the issue must be resolved immediately with the pharmacy before accepting the delivery.</LegalP>

      <LegalH2>Cancellation Policy</LegalH2>
      <LegalP>Customers may cancel an order only before the pharmacy begins processing it.</LegalP>
      <LegalP>Once a pharmacy has accepted and prepared an order, cancellation may not be possible.</LegalP>
      <LegalP>Repeated fake orders or misuse of cancellations may result in account suspension.</LegalP>

      <LegalH2>Customer Responsibilities</LegalH2>
      <LegalP>Customers agree to:</LegalP>
      <LegalUl>
        <LegalLi>Provide accurate information.</LegalLi>
        <LegalLi>Upload valid prescriptions.</LegalLi>
        <LegalLi>Be available at the delivery address.</LegalLi>
        <LegalLi>Inspect medicines before payment.</LegalLi>
        <LegalLi>Make payment promptly upon accepting delivery.</LegalLi>
        <LegalLi>Use medicines only under professional medical guidance.</LegalLi>
        <LegalLi>Comply with all applicable laws.</LegalLi>
      </LegalUl>

      <LegalH2>Pharmacy Responsibilities</LegalH2>
      <LegalP>Each pharmacy partner is solely responsible for:</LegalP>
      <LegalUl>
        <LegalLi>Maintaining valid licenses.</LegalLi>
        <LegalLi>Selling genuine medicines.</LegalLi>
        <LegalLi>Maintaining inventory.</LegalLi>
        <LegalLi>Updating stock availability.</LegalLi>
        <LegalLi>Correct pricing.</LegalLi>
        <LegalLi>Prescription verification.</LegalLi>
        <LegalLi>Proper medicine storage.</LegalLi>
        <LegalLi>Safe packaging.</LegalLi>
        <LegalLi>Delivery arrangements.</LegalLi>
        <LegalLi>Customer support.</LegalLi>
        <LegalLi>Legal compliance.</LegalLi>
        <LegalLi>Drug authenticity.</LegalLi>
        <LegalLi>Expiry monitoring.</LegalLi>
      </LegalUl>

      <LegalH2>Platform Responsibilities</LegalH2>
      <LegalP>Platino Pharma provides:</LegalP>
      <LegalUl>
        <LegalLi>Technology infrastructure</LegalLi>
        <LegalLi>Secure user accounts</LegalLi>
        <LegalLi>Pharmacy discovery</LegalLi>
        <LegalLi>Search functionality</LegalLi>
        <LegalLi>Prescription upload</LegalLi>
        <LegalLi>Order routing</LegalLi>
        <LegalLi>Notifications</LegalLi>
        <LegalLi>Order tracking</LegalLi>
        <LegalLi>Pharmacy verification</LegalLi>
        <LegalLi>Platform security</LegalLi>
        <LegalLi>Analytics tools</LegalLi>
      </LegalUl>

      <LegalH2>Platform Limitations</LegalH2>
      <LegalP>Platino Pharma is not responsible for:</LegalP>
      <LegalUl>
        <LegalLi>Medicine quality</LegalLi>
        <LegalLi>Medicine efficacy</LegalLi>
        <LegalLi>Side effects</LegalLi>
        <LegalLi>Pricing disputes</LegalLi>
        <LegalLi>Inventory shortages</LegalLi>
        <LegalLi>Delivery delays</LegalLi>
        <LegalLi>Pharmacy conduct</LegalLi>
        <LegalLi>Prescription approval decisions</LegalLi>
        <LegalLi>Refund decisions</LegalLi>
        <LegalLi>Product replacements</LegalLi>
        <LegalLi>Customer misuse of medicines</LegalLi>
      </LegalUl>
      <LegalP>These responsibilities remain exclusively with the pharmacy partner.</LegalP>

      <LegalH2>Prohibited Activities</LegalH2>
      <LegalP>Users must not:</LegalP>
      <LegalUl>
        <LegalLi>Upload forged prescriptions.</LegalLi>
        <LegalLi>Place fake orders.</LegalLi>
        <LegalLi>Abuse pharmacy staff.</LegalLi>
        <LegalLi>Reverse engineer the Platform.</LegalLi>
        <LegalLi>Attempt unauthorized access.</LegalLi>
        <LegalLi>Use bots or automated scripts.</LegalLi>
        <LegalLi>Spread malware.</LegalLi>
        <LegalLi>Interfere with Platform operations.</LegalLi>
        <LegalLi>Misrepresent their identity.</LegalLi>
        <LegalLi>Violate applicable laws.</LegalLi>
      </LegalUl>
      <LegalP>Violations may result in immediate suspension or permanent account termination.</LegalP>

      <LegalH2>Intellectual Property</LegalH2>
      <LegalP>All rights relating to the Platform, including its software, source code, design, trademarks, branding, logos, user interface, APIs, documentation, databases (excluding pharmacy-owned content), and proprietary technology, are the exclusive property of Platino Pharma.</LegalP>
      <LegalP>Pharmacy partners retain ownership of their own business names, logos, licenses, product information, and business documents.</LegalP>

      <LegalH2>Limitation of Liability</LegalH2>
      <LegalP>To the maximum extent permitted by law, Platino Pharma shall not be liable for any direct, indirect, incidental, consequential, special, or punitive damages arising from:</LegalP>
      <LegalUl>
        <LegalLi>Pharmacy operations</LegalLi>
        <LegalLi>Medicine quality</LegalLi>
        <LegalLi>Incorrect dispensing</LegalLi>
        <LegalLi>Delivery failures</LegalLi>
        <LegalLi>Pricing disputes</LegalLi>
        <LegalLi>Medical outcomes</LegalLi>
        <LegalLi>Customer misuse of medicines</LegalLi>
        <LegalLi>Technical interruptions beyond reasonable control</LegalLi>
      </LegalUl>
      <LegalP>The Platform's role is limited to providing technology infrastructure.</LegalP>

      <LegalH2>Governing Law</LegalH2>
      <LegalP>These Terms shall be governed by the laws of the Republic of India.</LegalP>
      <LegalP>Any disputes arising from the use of the Platform shall be subject to the exclusive jurisdiction of the competent courts where Platino Pharma is registered, unless otherwise required by applicable law.</LegalP>

      <LegalH2>Contact Information</LegalH2>
      <LegalP>For platform-related support, technical issues, account concerns, or legal inquiries, users may contact Platino Pharma through the official support channels published on the Platform.</LegalP>
      <LegalP><strong>Important:</strong> Issues related to medicine quality, pricing, refunds, replacements, prescription verification, or delivery should be addressed directly with the respective pharmacy partner, as those matters fall outside the Platform's operational responsibility.</LegalP>

      <LegalH2>Important Notice</LegalH2>
      <div className="bg-paper border border-line rounded-lg p-6 mt-6 shadow-sm mb-6">
        <p className="text-sm text-ink-muted leading-relaxed">
          By placing an order through Platino Pharma, you acknowledge and agree that you have had the opportunity to inspect the medicines before making payment. Once you accept the medicines and complete payment, the order is considered accepted in full. Platino Pharma does not provide refunds, returns, exchanges, or replacements, and does not mediate post-delivery medicine disputes. Customers are expected to verify all medicines, quantities, expiry dates, packaging, and prescription compliance at the time of delivery.
        </p>
      </div>

      <LegalH2>Important Legal Note</LegalH2>
      <div className="bg-paper border border-line rounded-lg p-6 mt-6 shadow-sm">
        <p className="text-sm text-ink-muted leading-relaxed mb-4">
          Because Platino Pharma operates as a healthcare-related technology platform in India, these Customer Terms of Service should be reviewed and finalized by a qualified legal professional to ensure compliance with the Information Technology Act, 2000, the Digital Personal Data Protection Act, 2023, the Drugs and Cosmetics Act, 1940, the Drugs and Cosmetics Rules, 1945, the Consumer Protection Act, 2019, and all other applicable central and state laws.
        </p>
        <p className="text-sm text-ink-muted leading-relaxed">
          This document is intended to serve as a business and product policy foundation and should not be considered legal advice. It should be reviewed and customized by legal counsel before being adopted as the official Customer Terms of Service for Platino Pharma.
        </p>
      </div>
    </article>
  );
}
