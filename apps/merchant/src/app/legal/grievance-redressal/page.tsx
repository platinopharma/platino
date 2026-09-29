import { Metadata } from "next";
import { LegalH1, LegalH2, LegalH3, LegalP, LegalUl, LegalLi } from "@/components/site/legal-typography";

export const metadata: Metadata = {
  title: "Grievance Redressal Policy",
  description: "How to raise complaints and how Platino Pharmacy handles grievances.",
  alternates: {
    canonical: "/legal/grievance-redressal",
  },
};

export default function GrievanceRedressal() {
  return (
    <article>
      <LegalH1>Grievance Redressal Policy</LegalH1>
      <LegalP>Last Updated: July 1, 2026</LegalP>

      <LegalP>We strive to provide a seamless experience, but we understand issues may arise. This policy outlines how complaints are categorized and resolved.</LegalP>

      <LegalH2>The Redressal Workflow</LegalH2>
      <LegalP>When a customer files a complaint, it follows a strict workflow:</LegalP>
      <ol className="list-decimal pl-5 text-ink-muted space-y-2 mb-6 font-medium">
        <li>Customer submits the complaint via the platform.</li>
        <li>Platform Support receives and reviews the issue.</li>
        <li>The issue is Categorized (Platform vs. Medicine).</li>
        <li>If it is a <strong>Platform Issue</strong>, it is resolved directly by Platino Pharmacy.</li>
        <li>If it is a <strong>Medicine Issue</strong>, it is redirected to the dispensing Pharmacy Partner for resolution.</li>
      </ol>

      <LegalH2>Issue Categorization</LegalH2>
      
      <LegalH3>Platform Handles</LegalH3>
      <LegalP>Platino Pharmacy is directly responsible for resolving:</LegalP>
      <LegalUl>
        <LegalLi>Technical Issues and Platform Bugs</LegalLi>
        <LegalLi>Login and Account Access Issues</LegalLi>
        <LegalLi>Order Visibility Issues</LegalLi>
        <LegalLi>Issues with the digital payment gateway process</LegalLi>
      </LegalUl>

      <LegalH3>Pharmacy Handles</LegalH3>
      <LegalP>The respective Pharmacy Partner is solely responsible for resolving:</LegalP>
      <LegalUl>
        <LegalLi>Medicine Quality or Authenticity Concerns</LegalLi>
        <LegalLi>Pricing Disputes</LegalLi>
        <LegalLi>Refunds, Replacements, and Exchanges</LegalLi>
        <LegalLi>Delivery Delays (if handled by the pharmacy)</LegalLi>
        <LegalLi>Prescription Verification queries</LegalLi>
      </LegalUl>

      <LegalH2>Legal Disclaimer</LegalH2>
      <div className="bg-paper border border-line rounded-lg p-6 mt-6 shadow-sm">
        <p className="text-sm text-ink-muted leading-relaxed mb-4">
          Platino Pharmacy is a technology platform that connects customers with independent verified pharmacy partners. Platino Pharmacy does not manufacture, stock, distribute, prescribe, or sell medicines.
        </p>
        <p className="text-sm text-ink-muted leading-relaxed mb-4">
          All medicines listed on the platform are sold by independent pharmacies. The respective pharmacy is solely responsible for inventory, pricing, authenticity, prescription compliance, packaging, delivery, refunds (if offered), returns (if accepted), exchanges (if accepted), and compliance with applicable laws.
        </p>
        <p className="text-sm text-ink-muted leading-relaxed mb-4">
          The platform provides only technology infrastructure to facilitate medicine discovery, prescription uploads, and order placement.
        </p>
        <p className="text-sm text-ink-muted leading-relaxed">
          Nothing on the platform should be interpreted as medical advice, diagnosis, or treatment. Customers should always consult a qualified healthcare professional before consuming any medicine.
        </p>
      </div>
    </article>
  );
}
