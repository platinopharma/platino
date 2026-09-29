import { Metadata } from "next";
import { LegalH1, LegalH2, LegalP, LegalUl, LegalLi } from "@/components/site/legal-typography";

export const metadata: Metadata = {
  title: "Acceptable Use Policy",
  description: "Rules and guidelines for acceptable usage of the Platino Pharmacy platform.",
  alternates: {
    canonical: "/legal/acceptable-use",
  },
};

export default function AcceptableUse() {
  return (
    <article>
      <LegalH1>Acceptable Use Policy</LegalH1>
      <LegalP>Last Updated: July 1, 2026</LegalP>

      <LegalP>This Acceptable Use Policy defines the rules that all users—both customers and pharmacy partners—must follow when accessing the Platino Pharmacy platform.</LegalP>

      <LegalH2>Prohibited Activities</LegalH2>
      <LegalP>Users must <strong>NOT</strong> engage in any of the following activities:</LegalP>
      <LegalUl>
        <LegalLi><strong>Upload fake prescriptions:</strong> Submitting forged, altered, or invalid medical documents.</LegalLi>
        <LegalLi><strong>Upload illegal documents:</strong> Submitting stolen identity documents or falsified licenses.</LegalLi>
        <LegalLi><strong>Spam pharmacies:</strong> Flooding pharmacies with fake inquiries or orders.</LegalLi>
        <LegalLi><strong>Hack APIs:</strong> Attempting to bypass security controls, scrape data, or access unauthorized endpoints.</LegalLi>
        <LegalLi><strong>Reverse engineer:</strong> Decompiling or attempting to extract the source code of the platform.</LegalLi>
        <LegalLi><strong>Use bots:</strong> Employing automated scripts for ordering, scraping, or interacting with the platform without explicit permission.</LegalLi>
        <LegalLi><strong>Attempt fraud:</strong> Engaging in payment fraud, chargeback abuse, or exploiting promotional codes.</LegalLi>
        <LegalLi><strong>Create fake accounts:</strong> Registering multiple deceptive accounts to bypass bans or limits.</LegalLi>
        <LegalLi><strong>Abuse customer support:</strong> Harassing, threatening, or using abusive language towards platform staff or pharmacy personnel.</LegalLi>
      </LegalUl>

      <LegalH2>Violation Results</LegalH2>
      <LegalP>Platino Pharmacy takes violations of this policy seriously. Depending on the severity of the offense, violations will result in:</LegalP>
      <LegalUl>
        <LegalLi><strong>Warning:</strong> A formal notice for minor infractions.</LegalLi>
        <LegalLi><strong>Suspension:</strong> Temporary loss of account access pending investigation.</LegalLi>
        <LegalLi><strong>Permanent Ban:</strong> Irreversible deletion of the account and IP blocking.</LegalLi>
        <LegalLi><strong>Legal Action:</strong> In cases of severe fraud, hacking, or medical document forgery, we will report the activity to the relevant law enforcement and regulatory authorities.</LegalLi>
      </LegalUl>
    </article>
  );
}
