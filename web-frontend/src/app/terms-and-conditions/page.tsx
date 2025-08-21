// app/terms-and-conditions/page.tsx

export default function TermsAndConditionsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center">Terms and Conditions</h1>
      <p className="text-center text-gray-500 mb-10">Last updated: August 21, 2025</p>

      <div className="space-y-8 text-lg">
        <section>
          <h2 className="text-2xl font-semibold mb-3">1. Agreement to Terms</h2>
          <p>
            Welcome to <strong>Curated Shop Australia</strong> (the "Site"). These Terms and Conditions ("Terms") govern your use of our website and the services, features, and content we offer. By accessing or using the Site, you agree to be bound by these Terms. If you do not agree with any part of the terms, you are prohibited from using our services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">2. Use of Our Website</h2>
          <p>
            You agree to use the Site for lawful purposes only. You are responsible for ensuring that your access to and use of this Site is not illegal or prohibited by laws that apply to you. You agree not to:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Use the Site for any fraudulent or malicious activities.</li>
            <li>Interfere with or disrupt the security of the Site or any services, systems, or networks connected to it.</li>
            <li>Use any data mining, robots, or similar data gathering and extraction tools on the Site.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">3. Products and Pricing</h2>
          <p>
            We strive to ensure that all details, descriptions, and prices which appear on this Site are accurate. However, errors may occur. If we discover an error in the price of any goods which you have ordered, we will inform you of this as soon as possible and give you the option of reconfirming your order at the correct price or cancelling it.
          </p>
          <p className="mt-2">
            All prices are listed in Australian Dollars (AUD) and are inclusive of GST (Goods and Services Tax), where applicable. We reserve the right to change prices at any time without notice.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Orders and Payment</h2>
          <p>
            By placing an order, you are offering to purchase a product on and subject to these Terms. All orders are subject to availability and confirmation of the order price. We accept various payment methods as indicated at the checkout. Payment must be received in full before any goods are dispatched.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">5. Intellectual Property</h2>
          <p>
            The content on this Site, including but not limited to text, graphics, logos, images, and software, is the property of <strong>Curated Shop Australia</strong> or its content suppliers and is protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or otherwise use any of the content without our express written permission.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">6. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by Australian law, <strong>Curated Shop Australia</strong> will not be liable for any direct, indirect, incidental, special, or consequential damages that result from the use of, or the inability to use, this Site or the products purchased on this Site. This includes, but is not limited to, reliance by a user on any information obtained from the Site, or that results from mistakes, omissions, interruptions, or any failure of performance.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">7. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of Australia. Any disputes arising in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of Australia.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">8. Changes to Terms</h2>
          <p>
            We reserve the right to amend these Terms and Conditions from time to time. Any amendments will be effective immediately upon notification on this Site. Your continued use of the website following such notification will represent an agreement by you to be bound by the terms and conditions as amended.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">9. Contact Us</h2>
          <p>
            If you have any questions or concerns about these Terms and Conditions, please contact us at: <strong>info@curated-shop-australia.com</strong>
          </p>
        </section>
      </div>
    </div>
  );
}
