import { Metadata } from "next";
import { LegalH1, LegalH2, LegalP, LegalUl, LegalLi } from "@/components/site/legal-typography";

export const metadata: Metadata = {
  title: "Refund, Return & Cancellation Policy",
  description: "Understand the policies regarding order cancellations, returns, and refunds on Platino Pharmacy.",
  alternates: {
    canonical: "/legal/refund-cancellation",
  },
};

export default function RefundCancellation() {
  return (
    <article>
      <LegalH1>Refund, Return & Cancellation Policy</LegalH1>
      <LegalP>Last Updated: July 1, 2026</LegalP>

      <LegalH2>Customer Cancellation</LegalH2>
      <LegalP><strong>Allowed before pharmacy acceptance:</strong> Customers may freely cancel their order directly through the platform interface provided the pharmacy has not yet accepted or started processing the order.</LegalP>
      <LegalP><strong>After Acceptance:</strong> Once the pharmacy has accepted the order, the customer cannot cancel it using the platform. In this scenario, the customer must contact the pharmacy directly to request a cancellation.</LegalP>

      <LegalH2>Refunds</LegalH2>
      <LegalP>Platino Pharmacy operates as a technology intermediary and <strong>DOES NOT process refunds</strong>.</LegalP>
      <LegalP>Refunds are entirely a matter between the customer and the respective Pharmacy Partner. If an order is canceled or returned, the pharmacy is responsible for initiating and fulfilling the refund process according to their internal policies.</LegalP>

      <LegalH2>Returns & Exchanges</LegalH2>
      <LegalP>The Platino Pharmacy platform does not manage, facilitate, or guarantee returns or exchanges of medicines or medical products. All return and exchange policies are determined solely by the independent Pharmacy Partner fulfilling the order.</LegalP>

      <LegalH2>Damaged, Wrong, or Expired Medicines</LegalH2>
      <LegalUl>
        <LegalLi><strong>Damaged Medicines:</strong> If a customer receives damaged items, they must contact the dispensing pharmacy immediately.</LegalLi>
        <LegalLi><strong>Wrong Medicines:</strong> If an incorrect medicine is delivered, the customer must contact the pharmacy to arrange a correction.</LegalLi>
        <LegalLi><strong>Expired Medicines:</strong> If a customer notices a medicine is expired upon delivery, they must contact the pharmacy immediately for a replacement or refund. Selling expired medicine is a strict violation of our Pharmacy Partner Agreement.</LegalLi>
      </LegalUl>

      <LegalH2>Payment Disputes</LegalH2>
      <LegalP>Any disputes regarding payments, overcharging, or failed refunds must be handled directly between the customer and the pharmacy. While Platino Pharmacy facilitates the digital transaction, the financial relationship and liability ultimately reside with the dispensing pharmacy.</LegalP>
    </article>
  );
}
