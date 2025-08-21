// app/privacy-policy/page.tsx

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center">Privacy Policy</h1>
      <p className="text-center text-gray-500 mb-10">Last updated: August 21, 2025</p>

      <div className="space-y-8 text-lg">
        <section>
          <h2 className="text-2xl font-semibold mb-3">Introduction</h2>
          <p>
            <strong>Curated Shop Australia</strong> ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy outlines how we collect, use, disclose, and manage your personal information in accordance with the Australian Privacy Principles (APPs) under the <em>Privacy Act 1988</em> (Cth).
          </p>
          <p className="mt-2">
            By using our website (the "Site"), you agree to the collection and use of information in accordance with this policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">1. What Personal Information We Collect</h2>
          <p>We may collect the following types of personal information:</p>
          <ul className="list-disc list-inside mt-2 space-y-2">
            <li><strong>Information You Provide to Us</strong>: This includes your name, email address, shipping and billing address, phone number, and payment information. This is collected when you place an order, create an account, or subscribe to our newsletter.</li>
            <li><strong>Information Collected Automatically</strong>: When you visit our Site, we may automatically collect certain information about your device, including your IP address, browser type, and browsing behaviour through cookies and similar tracking technologies.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Process, fulfill, and ship your orders.</li>
            <li>Communicate with you and provide customer support.</li>
            <li>Improve and personalize your experience on our Site.</li>
            <li>Send you promotional emails (only if you have opted-in).</li>
            <li>Prevent fraud and enhance the security of our Site.</li>
            <li>Comply with our legal obligations.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">3. Sharing and Disclosure of Your Information</h2>
          <p>We may share your information with trusted third parties only in the following circumstances:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>Service Providers</strong>: With vendors who perform services on our behalf, such as payment processing, shipping, and marketing.</li>
            <li><strong>Legal Compliance</strong>: If required by law or to respond to a valid legal process.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Data Security</h2>
          <p>We take reasonable steps to protect your personal information from misuse, loss, and unauthorized access. We use security measures such as SSL technology to encrypt data. However, no method of transmission over the Internet is 100% secure.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">5. Your Rights and Choices</h2>
          <p>Under the Australian Privacy Act, you have the right to access the personal information we hold about you and request corrections. To do so, or to unsubscribe from marketing, please contact us at <strong>info@curated-shop-australia.com</strong>.</p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">6. Cookies and Tracking Technologies</h2>
          <p>Our Site uses cookies to enhance your experience. You can instruct your browser to refuse cookies, but some parts of our Site may not function properly as a result.</p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">7. Changes to This Privacy Policy</h2>
          <p>We may update this policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">8. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at: <strong>info@curated-shop-australia.com</strong>.</p>
        </section>
      </div>
    </div>
  );
}
