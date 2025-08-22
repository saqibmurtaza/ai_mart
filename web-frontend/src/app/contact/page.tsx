// app/contact/page.tsx

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center">Contact Us</h1>
      <p className="text-center text-gray-500 mb-10">
        We're here to help with any questions you may have.
      </p>

      <div className="grid md:grid-cols-2 gap-10">

        {/* Customer Support Section */}
        <div className="bg-gray-50 p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Customer Support & Enquiries</h2>
          <div className="space-y-4 text-lg text-gray-700">
            <p>
              For all questions about orders, products, or general enquiries, please reach out to our support team.
            </p>
            <p>
              <strong>Email:</strong> <a href="mailto:info@curated-shop-australia.com" className="text-blue-600 hover:underline">info@curated-shop-australia.com</a>
            </p>
            <p>
              <strong>Phone:</strong> +92 3171938567
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Our support team aims to respond within 24-48 hours. Please note phone support is based internationally.
            </p>
          </div>
        </div>

        {/* Returns Address Section */}
        <div className="bg-gray-50 p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Returns Address</h2>
          <div className="space-y-4 text-lg text-gray-700">
             <p>
              For all product returns, please use our Australian-based returns facility.
            </p>
            <address className="not-italic">
              <strong>Curated Shop Australia (Returns)</strong><br />
              21 Leda Drive, Tarneit VIC 3029<br />
              Australia
            </address>
             <p className="mt-4 text-sm text-gray-500">
              Please initiate a return by contacting our support team before sending any items.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
