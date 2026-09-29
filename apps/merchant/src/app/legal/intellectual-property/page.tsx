import { Metadata } from "next";
import { LegalH1, LegalH2, LegalP, LegalUl, LegalLi } from "@/components/site/legal-typography";

export const metadata: Metadata = {
  title: "Intellectual Property Policy",
  description: "Details regarding the ownership of intellectual property on the Platino Pharmacy platform.",
  alternates: {
    canonical: "/legal/intellectual-property",
  },
};

export default function IntellectualProperty() {
  return (
    <article>
      <LegalH1>Intellectual Property Policy</LegalH1>
      <LegalP>Last Updated: July 1, 2026</LegalP>

      <LegalH2>Platform Ownership</LegalH2>
      <LegalP>All core assets of the digital platform remain the exclusive property of <strong>Platino Pharmacy</strong>. This includes, but is not limited to:</LegalP>
      <LegalUl>
        <LegalLi>Platform Logo and Trademarks</LegalLi>
        <LegalLi>Brand Identity and Guidelines</LegalLi>
        <LegalLi>Design and User Interface (UI)</LegalLi>
        <LegalLi>Source Code and Architecture</LegalLi>
        <LegalLi>Application Programming Interfaces (APIs)</LegalLi>
        <LegalLi>Original Content and Copywriting</LegalLi>
        <LegalLi>Proprietary Images and Graphics</LegalLi>
      </LegalUl>
      <LegalP>Users may not copy, modify, distribute, sell, or lease any part of our services or included software without explicit written permission.</LegalP>

      <LegalH2>Pharmacy Ownership</LegalH2>
      <LegalP>While operating on the platform, independent Pharmacy Partners retain full ownership of their specific business assets, which include:</LegalP>
      <LegalUl>
        <LegalLi><strong>Store Name:</strong> Their registered business name and trading name.</LegalLi>
        <LegalLi><strong>Store Logo:</strong> Their specific brand marks.</LegalLi>
        <LegalLi><strong>Medicine Images:</strong> Any custom product photography uploaded by the pharmacy.</LegalLi>
        <LegalLi><strong>Business Documents:</strong> Their drug licenses, GST certificates, and identity documents.</LegalLi>
      </LegalUl>

      <LegalH2>Copyright Infringement</LegalH2>
      <LegalP>If you believe that your intellectual property rights have been violated by a Pharmacy Partner or another user on the platform, please contact our legal team with a formal takedown notice detailing the alleged infringement.</LegalP>
    </article>
  );
}
