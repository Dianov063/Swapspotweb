import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — SwapSpot",
  description: "SwapSpot Terms of Service. Please read these terms carefully before using our platform.",
};

export default function TermsOfService() {
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
            Terms of Service
          </h1>
          <p className="text-gray-500 mb-8">Last updated: March 30, 2026</p>

          <p>
            Welcome to SwapSpot. These Terms of Service (&quot;Terms&quot;) govern your access to and use of the
            SwapSpot mobile application and website (collectively, the &quot;Platform&quot;), operated by SwapSpot,
            Inc. (&quot;SwapSpot,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By creating an account or using the Platform, you
            agree to be bound by these Terms. If you do not agree, do not use SwapSpot.
          </p>

          <h2>1. The SwapSpot Platform</h2>

          <h3>1.1 Marketplace, Not Employer</h3>
          <p>
            SwapSpot is a technology platform that connects individuals seeking services (&quot;Clients&quot;) with
            independent service providers (&quot;Helpers&quot;). <strong>SwapSpot is a marketplace only.</strong> We
            do not employ Helpers, nor do we perform, supervise, or control the services offered through
            the Platform. SwapSpot is not a party to the agreements between Clients and Helpers.
          </p>

          <h3>1.2 Independent Contractors</h3>
          <p>
            Helpers are independent contractors, not employees, agents, joint venturers, or partners of
            SwapSpot. Helpers retain full control over:
          </p>
          <ul>
            <li><strong>Pricing:</strong> Helpers set their own rates and prices for services.</li>
            <li><strong>Schedule:</strong> Helpers determine their own hours and availability.</li>
            <li><strong>Methods:</strong> Helpers decide how to perform their services, including the tools, materials, and techniques they use.</li>
            <li><strong>Clients:</strong> Helpers may accept or decline any service request at their discretion.</li>
          </ul>
          <p>
            Nothing in these Terms creates an employment relationship, agency, or partnership between SwapSpot
            and any Helper. SwapSpot does not withhold taxes, provide benefits, or exercise the kind of
            control over Helpers that would characterize an employer-employee relationship.
          </p>

          <h3>1.3 Client Responsibility</h3>
          <p>
            Clients hire Helpers at their own discretion and risk. While SwapSpot facilitates background
            checks and displays reviews, we do not guarantee the quality, safety, legality, or suitability
            of any Helper or service. Clients are responsible for evaluating Helpers and making informed
            decisions about whom they hire.
          </p>

          <h2>2. Account Registration and Eligibility</h2>
          <ul>
            <li>You must be at least 18 years old to use SwapSpot.</li>
            <li>You must provide accurate, complete, and current information when creating your account.</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.</li>
            <li>You may not create multiple accounts, transfer your account, or use another person&apos;s account without authorization.</li>
          </ul>

          <h2>3. Helper Requirements</h2>

          <h3>3.1 Background Checks</h3>
          <p>
            All Helpers must consent to and pass a background check conducted by our third-party provider
            (Checkr) before they can accept bookings on the Platform. SwapSpot receives only a pass/fail
            eligibility result and does not access detailed criminal records.
          </p>

          <h3>3.2 License Disclosure</h3>
          <p>
            Helpers who provide services that require professional licenses, certifications, or permits
            (e.g., electrical work, plumbing, cosmetology) must disclose and verify their credentials on
            the Platform. Providing services without required licenses is a violation of these Terms and
            may result in immediate account termination.
          </p>

          <h3>3.3 Insurance</h3>
          <p>
            Helpers are encouraged to maintain their own professional liability insurance. SwapSpot may
            offer optional insurance programs but does not provide coverage by default.
          </p>

          <h2>4. Bookings and Payments</h2>
          <ul>
            <li>Clients book services through the Platform at prices set by Helpers.</li>
            <li>Payment is processed through SwapSpot&apos;s payment system. SwapSpot collects a service fee from each transaction.</li>
            <li>Helpers receive payment after the service is completed, subject to any applicable hold periods.</li>
            <li>Cancellation policies are set by individual Helpers and displayed at the time of booking.</li>
          </ul>

          <h2>5. Prohibited Conduct</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Platform for any unlawful purpose or in violation of any applicable law or regulation.</li>
            <li>Provide false, misleading, or inaccurate information in your profile, reviews, or communications.</li>
            <li>Harass, threaten, intimidate, or discriminate against any user.</li>
            <li>Circumvent SwapSpot&apos;s payment system by arranging direct payments outside the Platform for services initially booked through SwapSpot.</li>
            <li>Scrape, crawl, or use automated means to access the Platform or collect user data.</li>
            <li>Post fake reviews or manipulate the rating system.</li>
            <li>Impersonate another person or misrepresent your identity or qualifications.</li>
            <li>Use the Platform to advertise or sell products or services unrelated to the Platform&apos;s purpose.</li>
          </ul>

          <h2>6. Intellectual Property</h2>
          <p>
            The SwapSpot name, logo, and all related trademarks, service marks, designs, and content on
            the Platform are the property of SwapSpot, Inc. or its licensors. You may not use, reproduce,
            or distribute any SwapSpot intellectual property without our prior written consent.
          </p>
          <p>
            By posting content on the Platform (including reviews, photos, and profile information), you
            grant SwapSpot a non-exclusive, worldwide, royalty-free license to use, display, and distribute
            that content in connection with operating and promoting the Platform.
          </p>

          <h2>7. Disclaimer of Warranties</h2>
          <p>
            <strong>THE PLATFORM IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
            EITHER EXPRESS OR IMPLIED.</strong> SwapSpot disclaims all warranties, including but not limited to
            implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
          </p>
          <p>
            SwapSpot does not warrant that:
          </p>
          <ul>
            <li>The Platform will be uninterrupted, error-free, or secure.</li>
            <li>Any Helper will meet your expectations or perform services to a particular standard.</li>
            <li>The results obtained from using the Platform will be accurate or reliable.</li>
            <li>Any defects in the Platform will be corrected.</li>
          </ul>

          <h2>8. Limitation of Liability</h2>
          <p>
            <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW, SWAPSPOT&apos;S TOTAL LIABILITY TO YOU FOR ANY CLAIMS
            ARISING OUT OF OR RELATED TO THESE TERMS OR YOUR USE OF THE PLATFORM SHALL NOT EXCEED THE
            TOTAL AMOUNT OF FEES PAID BY YOU TO SWAPSPOT IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.</strong>
          </p>
          <p>
            IN NO EVENT SHALL SWAPSPOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
            OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR GOODWILL,
            REGARDLESS OF THE THEORY OF LIABILITY.
          </p>
          <p>
            SwapSpot is not liable for any damages, injuries, or losses arising from the acts or omissions
            of Helpers or Clients, including but not limited to property damage, personal injury, or the
            quality of services performed.
          </p>

          <h2>9. Indemnification</h2>
          <p>
            You agree to indemnify, defend, and hold harmless SwapSpot, its officers, directors, employees,
            agents, and affiliates from and against any and all claims, damages, losses, liabilities, costs,
            and expenses (including reasonable attorneys&apos; fees) arising out of or related to:
          </p>
          <ul>
            <li>Your use of the Platform or violation of these Terms.</li>
            <li>Your interaction with any other user, including any services performed or received.</li>
            <li>Your violation of any applicable law, regulation, or third-party right.</li>
            <li>Any content you post or submit through the Platform.</li>
          </ul>

          <h2>10. Dispute Resolution and Arbitration</h2>

          <h3>10.1 Mandatory Arbitration</h3>
          <p>
            <strong>You and SwapSpot agree that any dispute, claim, or controversy arising out of or
            relating to these Terms or the Platform shall be resolved through binding individual arbitration</strong>
            administered by the American Arbitration Association (&quot;AAA&quot;) under its Consumer Arbitration
            Rules. The arbitration shall be conducted in English and take place in Austin, Texas, or at
            a location mutually agreed upon by the parties, or remotely via videoconference.
          </p>

          <h3>10.2 Class Action Waiver</h3>
          <p>
            <strong>YOU AND SWAPSPOT AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR
            ITS INDIVIDUAL CAPACITY, AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS,
            CONSOLIDATED, OR REPRESENTATIVE PROCEEDING.</strong> The arbitrator may not consolidate more than
            one person&apos;s claims and may not preside over any form of class, consolidated, or representative
            proceeding.
          </p>

          <h3>10.3 Opt-Out</h3>
          <p>
            You may opt out of the arbitration and class action waiver provisions by sending written notice
            to wtf073073@gmail.com within 30 days of first accepting these Terms. Your notice must include
            your name, address, email, and a clear statement that you wish to opt out. If you opt out,
            either party may pursue claims in court.
          </p>

          <h3>10.4 Exceptions</h3>
          <p>
            Notwithstanding the above, either party may seek injunctive or equitable relief in any court
            of competent jurisdiction to prevent the actual or threatened infringement, misappropriation,
            or violation of intellectual property rights.
          </p>

          <h2>11. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the State of
            Texas, without regard to its conflict of law principles. Any legal action or proceeding not
            subject to arbitration shall be brought exclusively in the state or federal courts located in
            Travis County, Texas.
          </p>

          <h2>12. Termination</h2>
          <p>
            SwapSpot may suspend or terminate your account at any time, with or without cause, and with or
            without notice. You may terminate your account at any time by contacting us or through the app
            settings. Upon termination, your right to use the Platform ceases immediately, but provisions
            of these Terms that by their nature should survive (including Sections 7-11) will remain in effect.
          </p>

          <h2>13. Changes to These Terms</h2>
          <p>
            We may modify these Terms from time to time. We will notify you of material changes by posting
            the updated Terms on the Platform with a new &quot;Last updated&quot; date and, where required by law,
            by sending you a notification. Your continued use of the Platform after the effective date of
            the updated Terms constitutes your acceptance.
          </p>

          <h2>14. Contact Us</h2>
          <p>If you have questions about these Terms, please contact us at:</p>
          <p>
            <strong>SwapSpot, Inc.</strong><br />
            Email: <a href="mailto:wtf073073@gmail.com" className="text-forest hover:underline">wtf073073@gmail.com</a>
          </p>
        </div>
      </main>

      <footer className="bg-forest-dark text-white/70 text-sm py-8 text-center">
        <div className="mx-auto max-w-4xl px-6">
          <Link href="/" className="hover:text-white transition-colors">
            &larr; Back to SwapSpot
          </Link>
          <span className="mx-4">|</span>
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <p className="mt-4">&copy; 2026 SwapSpot. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
