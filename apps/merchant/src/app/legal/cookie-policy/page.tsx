import { Metadata } from "next";
import { LegalH1, LegalH2, LegalP, LegalUl, LegalLi } from "@/components/site/legal-typography";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Information on how Platino Pharmacy uses cookies to improve your experience.",
  alternates: {
    canonical: "/legal/cookie-policy",
  },
};

export default function CookiePolicy() {
  return (
    <article>
      <LegalH1>Cookie Policy</LegalH1>
      <LegalP>Last Updated: July 1, 2026</LegalP>

      <LegalP>Platino Pharmacy uses cookies to ensure our platform functions securely and efficiently. This policy explains what cookies we use and why.</LegalP>

      <LegalH2>Cookies Used</LegalH2>
      <LegalUl>
        <LegalLi><strong>Authentication Cookies:</strong> Strictly necessary cookies used to verify your identity, maintain your logged-in state, and secure your account.</LegalLi>
        <LegalLi><strong>Session Cookies:</strong> Temporary cookies used to remember your shopping cart contents and current order state while you navigate the platform.</LegalLi>
        <LegalLi><strong>Analytics Cookies:</strong> Used to understand how users interact with our platform, allowing us to improve navigation and user experience.</LegalLi>
        <LegalLi><strong>Preference Cookies:</strong> Used to remember your settings, such as language preferences or theme (e.g., dark mode).</LegalLi>
        <LegalLi><strong>Performance Cookies:</strong> Used to monitor platform performance, load times, and error rates to ensure a smooth experience.</LegalLi>
      </LegalUl>

      <LegalH2>Managing Cookies</LegalH2>
      <LegalP>Customers may choose to disable cookies through their browser settings. However, please be aware that disabling cookies—especially Authentication and Session cookies—will cause core features of the platform (like logging in and placing orders) to stop functioning.</LegalP>
    </article>
  );
}
