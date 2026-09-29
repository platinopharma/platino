import { Metadata } from "next";
import { LegalH1, LegalH2, LegalP, LegalUl, LegalLi } from "@/components/site/legal-typography";

export const metadata: Metadata = {
  title: "Community Guidelines",
  description: "Guidelines for maintaining a respectful and safe community on Platino Pharmacy.",
  alternates: {
    canonical: "/legal/community-guidelines",
  },
};

export default function CommunityGuidelines() {
  return (
    <article>
      <LegalH1>Community Guidelines</LegalH1>
      <LegalP>Last Updated: July 1, 2026</LegalP>

      <LegalP>Platino Pharmacy aims to foster a safe, efficient, and mutually respectful environment for both our customers and our pharmacy partners. We require all users to adhere to the following community guidelines.</LegalP>

      <LegalH2>Guidelines for Customers</LegalH2>
      <LegalUl>
        <LegalLi><strong>Be Respectful:</strong> Treat pharmacy staff, delivery personnel, and platform support teams with courtesy. Abusive or threatening language will not be tolerated.</LegalLi>
        <LegalLi><strong>Provide Accurate Information:</strong> Ensure your delivery addresses, contact numbers, and health information are accurate to prevent delays.</LegalLi>
        <LegalLi><strong>Upload Genuine Prescriptions:</strong> Only upload authentic, unaltered prescriptions issued by a registered medical practitioner. Forging prescriptions is illegal and endangers your health.</LegalLi>
      </LegalUl>

      <LegalH2>Guidelines for Pharmacies</LegalH2>
      <LegalUl>
        <LegalLi><strong>Maintain Inventory:</strong> Ensure your digital stock levels accurately reflect your physical inventory to avoid cancelling customer orders.</LegalLi>
        <LegalLi><strong>Respond Promptly:</strong> Accept, pack, and process orders in a timely manner to provide a great customer experience.</LegalLi>
        <LegalLi><strong>Sell Authentic Medicines:</strong> Never compromise on quality. Source medicines only from authorized distributors.</LegalLi>
        <LegalLi><strong>Follow Regulations:</strong> Strictly adhere to all local healthcare laws, including those governing the dispensing of prescription medication.</LegalLi>
      </LegalUl>
    </article>
  );
}
