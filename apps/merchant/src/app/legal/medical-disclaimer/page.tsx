import { Metadata } from "next";
import { LegalH1, LegalH2, LegalP, LegalUl, LegalLi } from "@/components/site/legal-typography";

export const metadata: Metadata = {
  title: "Medical Disclaimer & Prescription Policy",
  description: "Important medical disclaimers and the policy for prescription uploads on Platino Pharmacy.",
  alternates: {
    canonical: "/legal/medical-disclaimer",
  },
};

export default function MedicalDisclaimer() {
  return (
    <article>
      <LegalH1>Medical Disclaimer & Prescription Policy</LegalH1>
      <LegalP>Last Updated: July 1, 2026</LegalP>

      <LegalH2>Medical Disclaimer</LegalH2>
      <LegalP>Platino Pharmacy is strictly a technology platform. We emphatically state that we <strong>DO NOT</strong>:</LegalP>
      <LegalUl>
        <LegalLi>Provide Medical Advice</LegalLi>
        <LegalLi>Provide Medical Diagnosis</LegalLi>
        <LegalLi>Recommend Specific Medicines or Treatments</LegalLi>
        <LegalLi>Replace the professional judgment of Doctors</LegalLi>
        <LegalLi>Replace the dispensing expertise of Pharmacists</LegalLi>
        <LegalLi>Replace Hospitals or Clinical Care</LegalLi>
      </LegalUl>
      <LegalP>Nothing on the platform should be interpreted as medical advice. Customers must always consult a qualified healthcare professional before consuming any medicine.</LegalP>

      <LegalH2>Prescription Policy</LegalH2>
      <LegalP>For medications that legally require a prescription, the following process strictly applies:</LegalP>
      <LegalUl>
        <LegalLi>Customers must upload a clear, legible digital copy of a valid prescription.</LegalLi>
        <LegalLi>The receiving Pharmacy Partner reviews the uploaded prescription.</LegalLi>
        <LegalLi>A registered pharmacist at the Pharmacy Partner decides whether to approve or reject the prescription.</LegalLi>
        <LegalLi>The Platform only acts as a secure storage and transmission medium for these files and does not verify prescriptions itself.</LegalLi>
      </LegalUl>

      <LegalH2>Restricted Medicines</LegalH2>
      <LegalP>Platino Pharmacy does not programmatically approve or endorse the sale of controlled substances. The sole responsibility for legal compliance regarding the sale and dispensing of restricted or scheduled drugs remains entirely with the verified Pharmacy Partner.</LegalP>

      <LegalH2>Medicine Information</LegalH2>
      <LegalP>Any medicine descriptions, images, or details provided on the platform are for informational purposes only. They are not guaranteed to be exhaustive and should not be used as a substitute for reading the physical packaging or consulting a doctor.</LegalP>

      <LegalH2>Emergency Usage</LegalH2>
      <LegalP><strong>The Platino Pharmacy platform must never be used for medical emergencies.</strong> If you are experiencing a medical emergency, please call your local emergency services or visit the nearest hospital immediately.</LegalP>
    </article>
  );
}
