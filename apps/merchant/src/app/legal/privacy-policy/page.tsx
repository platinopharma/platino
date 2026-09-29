import { Metadata } from "next";
import { LegalH1, LegalH2, LegalH3, LegalP, LegalUl, LegalLi } from "@/components/site/legal-typography";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how Platino Pharmacy collects, uses, shares, and protects your personal and medical information.",
  alternates: {
    canonical: "/legal/privacy-policy",
  },
};

export default function PrivacyPolicy() {
  return (
    <article>
      <LegalH1>Privacy Policy</LegalH1>
      <LegalP>Last Updated: July 1, 2026</LegalP>

      <LegalH2>Information Collected</LegalH2>
      <LegalH3>Personal Information</LegalH3>
      <LegalP>We collect personal information necessary to provide our services, which includes your Name, Email Address, Phone Number, Physical Delivery Address, and Date of Birth.</LegalP>
      
      <LegalH3>Location</LegalH3>
      <LegalP>To optimize delivery and connect you with nearby pharmacies, we collect your GPS location and saved addresses.</LegalP>

      <LegalH3>Technical Data</LegalH3>
      <LegalP>For security and platform optimization, we automatically collect technical data such as Device Information, Browser Type, and IP Address.</LegalP>

      <LegalH3>Order Data</LegalH3>
      <LegalP>We securely store details regarding your Orders, Prescriptions, and Payment Methods to facilitate seamless transactions.</LegalP>

      <LegalH3>Files</LegalH3>
      <LegalP>We securely store files uploaded by you, including Prescription Images and Verification Documents required for compliance.</LegalP>

      <LegalH2>How Information is Used</LegalH2>
      <LegalP>Your data is used strictly for operational purposes, including:</LegalP>
      <LegalUl>
        <LegalLi>User Authentication and Account Security</LegalLi>
        <LegalLi>Order Processing and Routing</LegalLi>
        <LegalLi>Sending Operational Notifications</LegalLi>
        <LegalLi>Pharmacy Verification Processes</LegalLi>
        <LegalLi>Customer Support and Dispute Resolution</LegalLi>
        <LegalLi>Fraud Prevention and Platform Security</LegalLi>
        <LegalLi>Internal Analytics to improve our services</LegalLi>
      </LegalUl>

      <LegalH2>Data Sharing</LegalH2>
      <LegalH3>Shared With</LegalH3>
      <LegalP>We may share your data with verified third parties exclusively to fulfill your requests:</LegalP>
      <LegalUl>
        <LegalLi><strong>Pharmacy Partners:</strong> To process and dispense your orders.</LegalLi>
        <LegalLi><strong>Delivery Partners:</strong> If applicable, to fulfill last-mile delivery.</LegalLi>
        <LegalLi><strong>Payment Gateways:</strong> To securely process financial transactions.</LegalLi>
        <LegalLi><strong>Government Authorities:</strong> Strictly when required by law or judicial order.</LegalLi>
      </LegalUl>
      <LegalH3>Never Sold</LegalH3>
      <LegalP>Platino Pharmacy explicitly guarantees that we will never sell your personal or medical data to advertisers or third-party data brokers.</LegalP>

      <LegalH2>Data Security</LegalH2>
      <LegalP>We employ industry-leading security practices to protect your information:</LegalP>
      <LegalUl>
        <LegalLi><strong>Encryption:</strong> All data is encrypted in transit and at rest.</LegalLi>
        <LegalLi><strong>HTTPS:</strong> Secure communication protocols across all endpoints.</LegalLi>
        <LegalLi><strong>JWT:</strong> Secure JSON Web Tokens for authentication sessions.</LegalLi>
        <LegalLi><strong>Secure Storage & Access Control:</strong> Strict, role-based access to databases.</LegalLi>
      </LegalUl>

      <LegalH2>Data Retention</LegalH2>
      <LegalP>We retain data only as long as necessary. Customer Accounts, Orders, Prescriptions, and System Logs are maintained in compliance with local healthcare and data protection regulations, after which they are securely deleted or anonymized.</LegalP>

      <LegalH2>Customer Rights</LegalH2>
      <LegalP>You retain full control over your data. You have the right to:</LegalP>
      <LegalUl>
        <LegalLi>Access your personal information.</LegalLi>
        <LegalLi>Correct any inaccuracies in your data.</LegalLi>
        <LegalLi>Request Deletion of your account and associated data.</LegalLi>
        <LegalLi>Download a copy of your data.</LegalLi>
        <LegalLi>Withdraw consent for data processing at any time.</LegalLi>
      </LegalUl>
    </article>
  );
}
