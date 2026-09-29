import { Metadata } from "next";
import { LegalH1, LegalH2, LegalP, LegalUl, LegalLi } from "@/components/site/legal-typography";

export const metadata: Metadata = {
  title: "Pharmacy Partner Agreement",
  description: "The official agreement outlining requirements, responsibilities, and terms for Platino Pharmacy partners.",
  alternates: {
    canonical: "/legal/pharmacy-partner-agreement",
  },
};

export default function PharmacyPartnerAgreement() {
  return (
    <article>
      <LegalH1>Pharmacy Partner Agreement</LegalH1>
      <LegalP>Last Updated: July 1, 2026</LegalP>

      <LegalH2>Pharmacy Requirements</LegalH2>
      <LegalP>To operate on the Platino Pharmacy platform, prospective partners must provide and maintain:</LegalP>
      <LegalUl>
        <LegalLi>Valid Drug License</LegalLi>
        <LegalLi>GST Registration</LegalLi>
        <LegalLi>Business Registration</LegalLi>
        <LegalLi>Owner Identity Proof</LegalLi>
        <LegalLi>Cancelled Cheque for Settlement</LegalLi>
        <LegalLi>Valid physical store address</LegalLi>
      </LegalUl>

      <LegalH2>Pharmacy Responsibilities</LegalH2>
      <LegalP>Once verified and onboarded, Pharmacy Partners are strictly responsible for:</LegalP>
      <LegalUl>
        <LegalLi><strong>Inventory Accuracy:</strong> Maintaining real-time stock levels.</LegalLi>
        <LegalLi><strong>Medicine Authenticity:</strong> Guaranteeing all medicines are genuine and sourced from authorized distributors.</LegalLi>
        <LegalLi><strong>Pricing:</strong> Setting accurate and compliant prices.</LegalLi>
        <LegalLi><strong>Prescription Verification:</strong> Reviewing and validating uploaded prescriptions through a registered pharmacist before dispensing.</LegalLi>
        <LegalLi><strong>Packaging & Delivery:</strong> Ensuring safe, secure, and prompt packaging and delivery of medicines.</LegalLi>
        <LegalLi><strong>Expiry Monitoring:</strong> Tracking batch expiries and never dispensing expired medicines.</LegalLi>
        <LegalLi><strong>Drug Storage:</strong> Maintaining proper storage conditions (e.g., cold chain for insulin).</LegalLi>
        <LegalLi><strong>Customer Support:</strong> Addressing customer queries and resolving issues related to orders.</LegalLi>
        <LegalLi><strong>Legal Compliance:</strong> Adhering to the Drugs & Cosmetics Act and all other relevant local laws.</LegalLi>
      </LegalUl>

      <LegalH2>Pharmacy Agrees</LegalH2>
      <LegalP>By joining the platform, the Pharmacy explicitly agrees to:</LegalP>
      <LegalUl>
        <LegalLi>Maintain valid licenses at all times.</LegalLi>
        <LegalLi>Sell only genuine medicines.</LegalLi>
        <LegalLi>Comply fully with the Drugs & Cosmetics Act.</LegalLi>
        <LegalLi>Maintain an accurate digital inventory and update stock promptly.</LegalLi>
        <LegalLi>Honor all accepted orders without unreasonable delays.</LegalLi>
      </LegalUl>

      <LegalH2>Platform Rights</LegalH2>
      <LegalP>Platino Pharmacy reserves the right to manage its ecosystem to ensure safety and quality. We retain the right to:</LegalP>
      <LegalUl>
        <LegalLi>Approve or Reject Pharmacy applications.</LegalLi>
        <LegalLi>Suspend Pharmacy accounts pending investigation.</LegalLi>
        <LegalLi>Remove specific listings if they violate policy.</LegalLi>
        <LegalLi>Request additional compliance documents at any time.</LegalLi>
        <LegalLi>Conduct independent verification of provided information.</LegalLi>
      </LegalUl>

      <LegalH2>Termination</LegalH2>
      <LegalP>A Pharmacy Partner agreement may be terminated immediately for any of the following reasons:</LegalP>
      <LegalUl>
        <LegalLi>Expired, revoked, or suspended Drug License.</LegalLi>
        <LegalLi>Fraudulent activities or misrepresentation.</LegalLi>
        <LegalLi>Sale of counterfeit or expired medicines.</LegalLi>
        <LegalLi>Repeated customer complaints or failure to meet SLAs.</LegalLi>
        <LegalLi>Any violation of the law or this agreement.</LegalLi>
      </LegalUl>
    </article>
  );
}
