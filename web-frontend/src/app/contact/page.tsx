// app/contact/page.tsx

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="text-4xl font-bold mb-6 text-center">Contact Us</h1>
      <p className="text-center text-gray-500 mb-12">
        We're here to help. Please direct your query to the appropriate team below.
      </p>

      {/* Grid layout for different contact points */}
      <div className="grid md:grid-cols-2 gap-10">

        {/* Column 1: Australian-based Product & Order Support */}
        <div className="bg-gray-50 p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Product & Order Enquiries</h2>
          <div className="space-y-4 text-lg text-gray-700">
            <p>
              For all questions about our products, your order status, shipping, or to initiate a return, please contact our Australian-based support team.
            </p>
            <p>
              <strong>Email:</strong> <a href="mailto:info@curated-shop-australia.com" className="text-blue-600 hover:underline">info@curated-shop-australia.com</a>
            </p>
            <p className="mt-4 text-sm text-gray-500">
              This ensures you receive the fastest and most accurate assistance.
            </p>
          </div>
        </div>

        {/* Column 2: Business & Marketing Enquiries */}
        <div className="bg-gray-50 p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Business & Marketing Enquiries</h2>
          <div className="space-y-4 text-lg text-gray-700">
            <p>
              For partnerships, marketing, promotions, or other general business enquiries, please reach out to our administrative team.
            </p>
            <p>
              <strong>Phone:</strong> +92 3171938567
            </p>
             <p>
              <strong>Email:</strong> <a href="mailto:info@curated-shop-australia.com" className="text-blue-600 hover:underline">info@curated-shop-australia.com</a>
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Please note the phone contact is based internationally.
            </p>
          </div>
        </div>

      </div>

      {/* Standalone Section for Returns Address */}
      <div className="mt-12 pt-8 border-t">
        <h2 className="text-3xl font-bold mb-4 text-center">Returns Address</h2>
        <div className="text-center text-lg bg-gray-50 p-6 rounded-lg max-w-md mx-auto">
           <p className="mb-4">
            Before sending any items, please initiate a return by contacting our <strong>Product & Order Enquiries</strong> team.
          </p>
          <address className="not-italic">
            <strong>Curated Shop Australia (Returns)</strong><br />
            [Your Supplier's Street Address]<br />
            [Suburb, State, Postcode]<br />
            Australia
          </address>
        </div>
      </div>

    </div>
  );
}
