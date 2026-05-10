import type { Metadata } from "next";
import { LegalPageShell } from "@/components/landing/LegalPageShell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for DevLink - how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <LegalPageShell
      title="Privacy Policy"
      description="How DevLink collects, uses, protects, and shares information across profiles, posts, reports, and account services."
      updatedAt="December 1, 2024"
      sections={["Data we collect", "How we use it", "Sharing", "Security", "Your rights"]}
    >
          <section>
            <h2>1. Introduction</h2>
            <p>
              DevLink (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) uses this policy to explain what we collect, why we collect it, and how we protect it when you use the platform.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>
            <p>
              We collect the information you add to DevLink or generate while using it:
            </p>
            <ul>
              <li><strong>Account Information:</strong> Email address, username, password, and profile details</li>
              <li><strong>Profile Information:</strong> Bio, location, website, avatar, and portfolio items</li>
              <li><strong>Content:</strong> Posts, comments, and media you upload</li>
              <li><strong>OAuth Data:</strong> Information from Google, GitHub, Discord, or X when you sign in</li>
              <li><strong>Usage Data:</strong> How you interact with the platform, including views and engagement</li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Create and manage your account</li>
              <li>Display your profile and content to other users</li>
              <li>Send you notifications and updates</li>
              <li>Detect and prevent fraud, abuse, and security issues</li>
              <li>Analyze usage patterns to improve the platform</li>
            </ul>
          </section>

          <section>
            <h2>4. Information Sharing</h2>
            <p>
              We may share your information in the following circumstances:
            </p>
            <ul>
              <li><strong>Public Profile:</strong> Your profile and posts are visible to other users</li>
              <li><strong>Service Providers:</strong> Third parties that help us operate the platform</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger or acquisition</li>
            </ul>
          </section>

          <section>
            <h2>5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal 
              information against unauthorized access, alteration, disclosure, or destruction. This includes 
              encryption, secure connections (HTTPS), and regular security audits.
            </p>
          </section>

          <section>
            <h2>6. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as needed to 
              provide you services. You can request deletion of your account and associated data at any time 
              through the Settings page.
            </p>
          </section>

          <section>
            <h2>7. Your Rights</h2>
            <p>
              You have the right to:
            </p>
            <ul>
              <li>Access and receive a copy of your personal data</li>
              <li>Rectify inaccurate personal data</li>
              <li>Request deletion of your personal data</li>
              <li>Object to processing of your personal data</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section>
            <h2>8. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to keep you signed in, remember preferences, 
              and understand how people use DevLink. Essential cookies are required for the platform to function. 
              You can control non-essential cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2>9. Third-Party Services</h2>
            <p>
              Our platform may contain links to third-party websites or services. We are not responsible 
              for the privacy practices of these third parties. We use Supabase for database services, 
              Cloudflare for CDN and storage, and Sentry for error monitoring.
            </p>
          </section>

          <section>
            <h2>10. Children&apos;s Privacy</h2>
            <p>
              Our platform is not intended for users under 13 years of age. We do not knowingly collect 
              personal information from children under 13. If you believe we have collected such information, 
              please contact us immediately.
            </p>
          </section>

          <section>
            <h2>11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by 
              posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2>12. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our privacy practices, please contact us 
              through the report system or reach out to the DevLink team.
            </p>
          </section>
    </LegalPageShell>
  );
}
