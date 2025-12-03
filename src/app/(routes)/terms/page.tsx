import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for DevLink - the professional network for Roblox developers.",
};

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="text-[var(--muted-foreground)] mb-8">
          Last updated: December 1, 2024
        </p>

        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              By accessing or using DevLink (&quot;the Service&quot;), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Description of Service</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              DevLink is a professional network platform for Roblox developers, clients, studios, and influencers. 
              The Service allows users to create profiles, share content, connect with other users, and showcase their work.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. User Accounts</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials. 
              You agree to notify us immediately of any unauthorized use of your account. 
              You must be at least 13 years old to use this Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. User Conduct</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed mb-3">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-[var(--muted-foreground)] space-y-2">
              <li>Post content that is illegal, harmful, threatening, abusive, or otherwise objectionable</li>
              <li>Impersonate any person or entity</li>
              <li>Engage in spamming, phishing, or other malicious activities</li>
              <li>Attempt to gain unauthorized access to other users&apos; accounts</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Scam or defraud other users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Content Ownership</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              You retain ownership of content you post on DevLink. By posting content, you grant DevLink 
              a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content 
              in connection with the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Intellectual Property</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              The DevLink platform, including its design, features, and branding, is protected by copyright, 
              trademark, and other intellectual property laws. You may not copy, modify, or distribute any 
              part of the Service without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Termination</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              We reserve the right to suspend or terminate your account at any time for violations of these 
              Terms of Service or for any other reason at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Disclaimer of Warranties</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              The Service is provided &quot;as is&quot; without warranties of any kind. We do not guarantee that the 
              Service will be uninterrupted, secure, or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Limitation of Liability</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              DevLink shall not be liable for any indirect, incidental, special, consequential, or punitive 
              damages arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Changes to Terms</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              We may update these Terms of Service from time to time. We will notify users of significant 
              changes by posting a notice on the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Contact</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              If you have questions about these Terms, please contact us through the report system or 
              reach out to the DevLink team.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
