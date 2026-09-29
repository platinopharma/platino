import { Metadata } from "next";
import { LegalH1, LegalH2, LegalP, LegalUl, LegalLi } from "@/components/site/legal-typography";

export const metadata: Metadata = {
  title: "Platform Responsibilities",
  description: "Understand the specific role, services, and limitations of the Platino Pharmacy technology platform.",
  alternates: {
    canonical: "/legal/platform-responsibilities",
  },
};

export default function PlatformResponsibilities() {
  return (
    <article>
      <LegalH1>Platform Responsibilities</LegalH1>
      <LegalP>Last Updated: July 1, 2026</LegalP>

      <LegalH2>What Platino Pharmacy Provides</LegalH2>
      <LegalP>Platino Pharmacy serves as a digital infrastructure provider. We are responsible for providing and maintaining the following technology services:</LegalP>
      <LegalUl>
        <LegalLi><strong>Technology Platform:</strong> The core software, web apps, and APIs.</LegalLi>
        <LegalLi><strong>Search:</strong> Algorithms to help users find nearby pharmacies and medicines.</LegalLi>
        <LegalLi><strong>Order Placement:</strong> Secure digital carts and checkout flows.</LegalLi>
        <LegalLi><strong>Prescription Upload:</strong> Secure file transmission for medical documents.</LegalLi>
        <LegalLi><strong>Notifications:</strong> Order status updates via SMS, email, or push.</LegalLi>
        <LegalLi><strong>Tracking:</strong> Digital visibility into order states.</LegalLi>
        <LegalLi><strong>User Authentication:</strong> Secure login and account management.</LegalLi>
        <LegalLi><strong>Pharmacy Verification:</strong> Initial onboarding checks of pharmacy licenses.</LegalLi>
        <LegalLi><strong>Admin Dashboard:</strong> Tools for pharmacies to manage their digital store.</LegalLi>
        <LegalLi><strong>Platform Security:</strong> Maintaining the integrity and safety of user data.</LegalLi>
        <LegalLi><strong>Analytics:</strong> Providing business insights to pharmacy partners.</LegalLi>
      </LegalUl>

      <LegalH2>What Platino Pharmacy DOES NOT Do</LegalH2>
      <LegalP>To ensure absolute clarity regarding liability and operations, Platino Pharmacy explicitly <strong>DOES NOT</strong>:</LegalP>
      <LegalUl>
        <LegalLi>Own any medicines listed on the platform.</LegalLi>
        <LegalLi>Stock or warehouse any medical inventory.</LegalLi>
        <LegalLi>Deliver medicines (unless facilitated via a third-party logistics integration, which operates independently).</LegalLi>
        <LegalLi>Prescribe medicines or alter prescriptions.</LegalLi>
        <LegalLi>Provide medical advice or consultations.</LegalLi>
        <LegalLi>Guarantee the inventory accuracy of partner pharmacies.</LegalLi>
        <LegalLi>Guarantee or set the pricing of medicines.</LegalLi>
        <LegalLi>Guarantee delivery times.</LegalLi>
        <LegalLi>Guarantee refunds or accept returns directly.</LegalLi>
      </LegalUl>
    </article>
  );
}
