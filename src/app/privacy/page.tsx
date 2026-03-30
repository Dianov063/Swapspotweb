import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — SwapSpot",
  description: "SwapSpot Privacy Policy. Learn how we collect, use, and protect your personal information.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-forest text-white py-6">
        <div className="mx-auto max-w-4xl px-6">
          <Link href="/" className="text-2xl font-bold hover:opacity-80 transition-opacity">
            SwapSpot
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="prose mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-forest mb-2" style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
            Privacy Policy
          </h1>
          <p className="text-gray-500 mb-8">Last updated: March 30, 2026</p>

          <p>
            SwapSpot, Inc. (&quot;SwapSpot,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the SwapSpot
            mobile application and website (collectively, the &quot;Platform&quot;). This Privacy Policy explains
            how we collect, use, disclose, and safeguard your information when you use our Platform.
          </p>
          <p>
            By accessing or using SwapSpot, you agree to this Privacy Policy. If you do not agree with the
            terms of this Privacy Policy, please do not access the Platform.
          </p>

          <h2>1. Information We Collect</h2>

          <h3>1.1 Information You Provide</h3>
          <ul>
            <li><strong>Account Information:</strong> When you create an account, we collect your name, email address, phone number, and profile photo.</li>
            <li><strong>Helper Profile Data:</strong> If you register as a helper, we collect additional information including your service descriptions, pricing, availability, areas of expertise, and professional licenses or certifications.</li>
            <li><strong>Location Data:</strong> We collect your precise location when you use the app to find helpers near you or to display your service area as a helper. You can disable location services in your device settings, but this may limit functionality.</li>
            <li><strong>Photos and Media:</strong> You may upload profile photos, portfolio images, or photos related to service requests.</li>
            <li><strong>Communications:</strong> We store messages exchanged between clients and helpers through our in-app chat feature.</li>
            <li><strong>Payment Information:</strong> We collect payment method details to process transactions. Payment card numbers are processed and stored by our third-party payment processor and are never stored on our servers.</li>
          </ul>

          <h3>1.2 Information Collected Automatically</h3>
          <ul>
            <li><strong>Usage Data:</strong> We collect information about how you interact with the Platform, including pages visited, features used, search queries, bookings made, and time spent on the app.</li>
            <li><strong>Device Information:</strong> We collect device type, operating system, unique device identifiers, IP address, browser type, and mobile network information.</li>
            <li><strong>Cookies and Similar Technologies:</strong> We use cookies, web beacons, and similar tracking technologies to collect information about your browsing behavior on our website.</li>
          </ul>

          <h3>1.3 Information from Third Parties</h3>
          <ul>
            <li><strong>Background Check Results:</strong> For helpers, we receive pass/fail results from our background check provider (Checkr). We do not receive or store the details of criminal records, Social Security numbers, or other sensitive personal information used in the screening process — only the eligibility determination.</li>
            <li><strong>Social Login:</strong> If you sign in using Google or Apple, we receive your name and email address from that provider.</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <ul>
            <li><strong>Service Matching:</strong> To connect clients with nearby, qualified helpers based on location, service type, availability, and preferences.</li>
            <li><strong>Communication:</strong> To facilitate in-app messaging between clients and helpers, and to send you service-related notifications (booking confirmations, reminders, status updates).</li>
            <li><strong>Safety and Trust:</strong> To verify helper identities, process background checks, detect fraud, and maintain Platform safety.</li>
            <li><strong>Analytics and Improvement:</strong> To understand how the Platform is used, identify trends, fix bugs, and improve features and user experience.</li>
            <li><strong>Marketing:</strong> To send you promotional communications about SwapSpot features, offers, and updates. You can opt out of marketing emails at any time by clicking &quot;Unsubscribe&quot; or adjusting your notification settings.</li>
            <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, legal processes, or governmental requests.</li>
          </ul>

          <h2>3. Third-Party Services</h2>
          <p>We share information with the following categories of third-party service providers:</p>
          <ul>
            <li><strong>Checkr</strong> — background check provider. We share helper identity information with Checkr to conduct background screenings. Checkr returns only a pass/fail eligibility result to SwapSpot. Checkr&apos;s use of your data is governed by their own privacy policy.</li>
            <li><strong>Stream</strong> — in-app chat infrastructure. Messages between clients and helpers are processed through Stream&apos;s messaging API. Stream processes message content to deliver the chat service.</li>
            <li><strong>Google Maps</strong> — mapping and location services. We use Google Maps to display helper locations and calculate distances. Your location data is shared with Google for this purpose.</li>
            <li><strong>OneSignal</strong> — push notification delivery. We share device tokens and notification content with OneSignal to deliver push notifications to your device.</li>
            <li><strong>PostHog</strong> — product analytics. We share anonymized usage data with PostHog to understand how users interact with the Platform and improve our services.</li>
          </ul>

          <h2>4. Information We Never Store</h2>
          <p>SwapSpot is committed to data minimization. We <strong>never</strong> store the following on our servers:</p>
          <ul>
            <li>Social Security numbers (SSNs)</li>
            <li>Full payment card numbers (handled entirely by our payment processor)</li>
            <li>Detailed criminal record information (only pass/fail from background checks)</li>
            <li>Government-issued ID images (submitted directly to Checkr, not retained by SwapSpot)</li>
          </ul>

          <h2>5. Data Retention</h2>
          <ul>
            <li><strong>Account Data:</strong> Retained for the duration of your active account plus 30 days after account deletion to allow for reactivation or dispute resolution.</li>
            <li><strong>Chat Messages:</strong> Retained for 1 year from the date sent, then permanently deleted.</li>
            <li><strong>Location Data:</strong> Precise location data is retained for 30 days, then deleted. Approximate location (city-level) may be retained longer for analytics purposes.</li>
            <li><strong>Analytics Data:</strong> Anonymized and aggregated after 90 days. Anonymized analytics data may be retained indefinitely.</li>
            <li><strong>Background Check Results:</strong> Pass/fail status is retained for the duration of the helper&apos;s account. Detailed screening information is not stored by SwapSpot.</li>
          </ul>

          <h2>6. Your Rights and Choices</h2>

          <h3>6.1 All Users</h3>
          <ul>
            <li><strong>Access:</strong> You may request a copy of the personal information we hold about you.</li>
            <li><strong>Correction:</strong> You may update or correct your account information at any time through the app settings.</li>
            <li><strong>Deletion:</strong> You may request deletion of your account and personal data by contacting us at wtf073073@gmail.com or through the app settings.</li>
            <li><strong>Opt-Out of Marketing:</strong> You may opt out of marketing emails by clicking &quot;Unsubscribe&quot; in any marketing email or adjusting your notification preferences in the app.</li>
            <li><strong>Location:</strong> You may disable location services through your device settings. Note that this will limit your ability to find nearby helpers or be found by clients.</li>
          </ul>

          <h3>6.2 California Residents (CCPA)</h3>
          <p>If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):</p>
          <ul>
            <li>The right to know what personal information we collect, use, and disclose about you.</li>
            <li>The right to request deletion of your personal information.</li>
            <li>The right to opt out of the &quot;sale&quot; of your personal information. SwapSpot does not sell personal information in the traditional sense, but certain data sharing for targeted advertising may constitute a &quot;sale&quot; under CCPA. You may opt out by contacting us.</li>
            <li>The right to non-discrimination for exercising your CCPA rights.</li>
          </ul>
          <p>To exercise your CCPA rights, contact us at wtf073073@gmail.com or call us at the number listed on our website.</p>

          <h2>7. Security</h2>
          <p>
            We implement industry-standard security measures to protect your personal information, including
            encryption in transit (TLS) and at rest, access controls, regular security audits, and employee
            training. However, no method of electronic transmission or storage is 100% secure, and we cannot
            guarantee absolute security.
          </p>

          <h2>8. Children&apos;s Privacy</h2>
          <p>
            SwapSpot is intended for users who are 18 years of age or older. We do not knowingly collect
            personal information from anyone under 18. If we learn that we have collected personal information
            from a user under 18, we will delete that information promptly. If you believe a child under 18
            has provided us with personal information, please contact us at wtf073073@gmail.com.
          </p>

          <h2>9. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material changes by
            posting the updated policy on the Platform with a new &quot;Last updated&quot; date and, where required
            by law, by sending you a notification. Your continued use of SwapSpot after the effective date
            of the updated Privacy Policy constitutes your acceptance of the changes.
          </p>

          <h2>10. Contact Us</h2>
          <p>If you have questions or concerns about this Privacy Policy or our data practices, please contact us at:</p>
          <p>
            <strong>SwapSpot, Inc.</strong><br />
            Email: <a href="mailto:wtf073073@gmail.com" className="text-forest hover:underline">wtf073073@gmail.com</a><br />
          </p>
        </div>
      </main>

      <footer className="bg-forest-dark text-white/70 text-sm py-8 text-center">
        <div className="mx-auto max-w-4xl px-6">
          <Link href="/" className="hover:text-white transition-colors">
            &larr; Back to SwapSpot
          </Link>
          <span className="mx-4">|</span>
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms of Service
          </Link>
          <p className="mt-4">&copy; 2026 SwapSpot. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
