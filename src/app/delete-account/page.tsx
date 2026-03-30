import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Delete Your Account — SwapSpot",
  description: "Learn how to delete your SwapSpot account and what happens to your data.",
};

export default function DeleteAccount() {
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
            Delete Your SwapSpot Account
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            We&apos;re sorry to see you go. Follow the steps below to request account deletion.
          </p>

          <h2>How to Delete Your Account</h2>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8 not-prose">
            <ol className="space-y-4">
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center font-semibold text-sm">1</span>
                <div className="pt-1">
                  <p className="text-gray-800">Open the <strong>SwapSpot app</strong> on your device</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center font-semibold text-sm">2</span>
                <div className="pt-1">
                  <p className="text-gray-800">Go to <strong>Profile &rarr; Settings &rarr; Account</strong></p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center font-semibold text-sm">3</span>
                <div className="pt-1">
                  <p className="text-gray-800">Tap <strong>&quot;Delete my account&quot;</strong></p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center font-semibold text-sm">4</span>
                <div className="pt-1">
                  <p className="text-gray-800"><strong>Confirm deletion</strong> when prompted</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center font-semibold text-sm">5</span>
                <div className="pt-1">
                  <p className="text-gray-800">Your account will be <strong>scheduled for deletion</strong></p>
                </div>
              </li>
            </ol>
          </div>

          <div className="bg-forest/5 border border-forest/20 rounded-xl p-6 mb-8 not-prose">
            <p className="text-gray-700">
              <strong>Can&apos;t access the app?</strong> Email us at{" "}
              <a href="mailto:wtf073073@gmail.com" className="text-forest underline font-medium">
                wtf073073@gmail.com
              </a>{" "}
              with the subject line <strong>&quot;Delete my account&quot;</strong> from the email address
              associated with your SwapSpot account. We will process your request within <strong>72 hours</strong>.
            </p>
          </div>

          <h2>What Data Is Deleted</h2>

          <div className="overflow-x-auto mb-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-forest/20">
                  <th className="py-3 pr-4 text-forest font-semibold">Data</th>
                  <th className="py-3 text-forest font-semibold">What Happens</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b border-gray-200">
                  <td className="py-3 pr-4">Profile information (name, bio, photo)</td>
                  <td className="py-3">Deleted immediately</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 pr-4">Email and phone number</td>
                  <td className="py-3">Deleted immediately</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 pr-4">Services and pricing</td>
                  <td className="py-3">Deleted immediately</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 pr-4">Chat messages</td>
                  <td className="py-3">Deleted within 30 days</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 pr-4">Reviews you wrote</td>
                  <td className="py-3">Anonymized (text kept, your name removed)</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 pr-4">Reviews others wrote about you</td>
                  <td className="py-3">Anonymized</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 pr-4">Booking history</td>
                  <td className="py-3">Anonymized and retained for legal/tax purposes for 1 year</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 pr-4">Location data</td>
                  <td className="py-3">Deleted immediately</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 pr-4">Photos and portfolio</td>
                  <td className="py-3">Deleted within 7 days from storage</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>What Is Retained</h2>

          <ul>
            <li>
              <strong>Anonymized booking records</strong> (for legal compliance) — retained for 1 year, then deleted
            </li>
            <li>
              <strong>Anonymized review text</strong> (without your name) — retained to maintain platform integrity
            </li>
            <li>
              <strong>Payment transaction records</strong> (if any) — retained for 7 years per tax law requirements
            </li>
          </ul>

          <hr className="my-10 border-gray-200" />

          <p className="text-gray-600">
            Questions? Contact us at{" "}
            <a href="mailto:wtf073073@gmail.com" className="text-forest underline">
              wtf073073@gmail.com
            </a>
          </p>
          <p className="text-gray-500 text-sm">
            Last updated: March 2026
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
