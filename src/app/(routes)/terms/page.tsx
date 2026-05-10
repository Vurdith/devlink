import type { Metadata } from "next";
import { LegalPageShell } from "@/components/landing/LegalPageShell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for DevLink - the professional network for Roblox developers.",
};

export default function TermsPage() {
  return (
    <LegalPageShell
      title="Terms of Service"
      description="The rules for using DevLink as a professional network for Roblox developers, studios, clients, and creators."
      updatedAt="December 1, 2024"
      sections={["Accounts", "Conduct", "Your content", "Platform rights", "Changes"]}
    >
          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By using DevLink (&quot;the Service&quot;), you agree to these Terms of Service. 
              If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2>2. Description of Service</h2>
            <p>
              DevLink is a professional network for Roblox developers, clients, studios, and creators. 
              You can create a profile, share work, connect with other users, and look for opportunities.
            </p>
          </section>

          <section>
            <h2>3. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials. 
              You agree to notify us immediately of any unauthorized use of your account. 
              You must be at least 13 years old to use this Service.
            </p>
          </section>

          <section>
            <h2>4. User Conduct</h2>
            <p>
              You agree not to:
            </p>
            <ul>
              <li>Post content that is illegal, harmful, threatening, abusive, or otherwise objectionable</li>
              <li>Impersonate any person or entity</li>
              <li>Engage in spamming, phishing, or other malicious activities</li>
              <li>Attempt to gain unauthorized access to other users&apos; accounts</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Scam or defraud other users</li>
            </ul>
          </section>

          <section>
            <h2>5. Content Ownership</h2>
            <p>
              You retain ownership of content you post on DevLink. By posting content, you grant DevLink 
              a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content 
              in connection with the Service.
            </p>
          </section>

          <section>
            <h2>6. Intellectual Property</h2>
            <p>
              The DevLink platform, including its design, features, and branding, is protected by copyright, 
              trademark, and other intellectual property laws. You may not copy, modify, or distribute any 
              part of the Service without our prior written consent.
            </p>
          </section>

          <section>
            <h2>7. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account at any time for violations of these 
              Terms of Service or for any other reason at our discretion.
            </p>
          </section>

          <section>
            <h2>8. Disclaimer of Warranties</h2>
            <p>
              The Service is provided &quot;as is&quot; without warranties of any kind. We do not guarantee that the 
              Service will be uninterrupted, secure, or error-free.
            </p>
          </section>

          <section>
            <h2>9. Limitation of Liability</h2>
            <p>
              DevLink shall not be liable for any indirect, incidental, special, consequential, or punitive 
              damages arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2>10. Changes to Terms</h2>
            <p>
              We may update these Terms of Service from time to time. We will notify users of significant 
              changes by posting a notice on the Service.
            </p>
          </section>

          <section>
            <h2>11. Contact</h2>
            <p>
              If you have questions about these Terms, please contact us through the report system or 
              reach out to the DevLink team.
            </p>
          </section>
    </LegalPageShell>
  );
}
