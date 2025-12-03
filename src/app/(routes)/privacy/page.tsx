import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for DevLink - how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="mb-8">
        <Link 
          href="/"
          className="text-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors inline-flex items-center gap-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
      </div>

      <div className="bg-[#0d0d12] rounded-2xl p-8 border border-white/10">
        <h1 className="text-3xl font-bold text-white mb-2 font-[var(--font-space-grotesk)]">
          Privacy Policy
        </h1>
        <p className="text-[var(--muted-foreground)] mb-8">
          Last updated: December 1, 2024
        </p>

        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Introduction</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              DevLink (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Information We Collect</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed mb-3">
              We collect information you provide directly to us:
            </p>
            <ul className="list-disc list-inside text-[var(--muted-foreground)] space-y-2">
              <li><strong>Account Information:</strong> Email address, username, password, and profile details</li>
              <li><strong>Profile Information:</strong> Bio, location, website, avatar, and portfolio items</li>
              <li><strong>Content:</strong> Posts, comments, and media you upload</li>
              <li><strong>OAuth Data:</strong> Information from Google, GitHub, Discord, or X when you sign in</li>
              <li><strong>Usage Data:</strong> How you interact with the platform, including views and engagement</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. How We Use Your Information</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed mb-3">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-[var(--muted-foreground)] space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Create and manage your account</li>
              <li>Display your profile and content to other users</li>
              <li>Send you notifications and updates</li>
              <li>Detect and prevent fraud, abuse, and security issues</li>
              <li>Analyze usage patterns to improve the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Information Sharing</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed mb-3">
              We may share your information in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-[var(--muted-foreground)] space-y-2">
              <li><strong>Public Profile:</strong> Your profile and posts are visible to other users</li>
              <li><strong>Service Providers:</strong> Third parties that help us operate the platform</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger or acquisition</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Data Security</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal 
              information against unauthorized access, alteration, disclosure, or destruction. This includes 
              encryption, secure connections (HTTPS), and regular security audits.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Data Retention</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              We retain your personal information for as long as your account is active or as needed to 
              provide you services. You can request deletion of your account and associated data at any time 
              through the Settings page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Your Rights</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed mb-3">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-[var(--muted-foreground)] space-y-2">
              <li>Access and receive a copy of your personal data</li>
              <li>Rectify inaccurate personal data</li>
              <li>Request deletion of your personal data</li>
              <li>Object to processing of your personal data</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Cookies and Tracking</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              We use cookies and similar technologies to maintain your session, remember your preferences, 
              and analyze how you use our platform. Essential cookies are required for the platform to function. 
              You can control non-essential cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Third-Party Services</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              Our platform may contain links to third-party websites or services. We are not responsible 
              for the privacy practices of these third parties. We use Supabase for database services, 
              Cloudflare for CDN and storage, and Sentry for error monitoring.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Children&apos;s Privacy</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              Our platform is not intended for users under 13 years of age. We do not knowingly collect 
              personal information from children under 13. If you believe we have collected such information, 
              please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Changes to This Policy</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by 
              posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">12. Contact Us</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              If you have questions about this Privacy Policy or our privacy practices, please contact us 
              through the report system or reach out to the DevLink team.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
