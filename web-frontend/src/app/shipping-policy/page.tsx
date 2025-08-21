// app/shipping-policy/page.tsx

export default function ShippingPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center">Shipping Policy</h1>
      <p className="text-center text-gray-500 mb-10">Last updated: August 21, 2025</p>

      <div className="space-y-8 text-lg">
        <p>
          Thank you for visiting and shopping at <strong>Curated Shop Australia</strong>. The following terms and conditions constitute our Shipping Policy.
        </p>

        <section>
          <h2 className="text-2xl font-semibold mb-3">1. Order Processing & Handling</h2>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Order Processing</strong>: Orders are typically processed within <strong>1-2 business days</strong> (excluding weekends and holidays) after you receive your order confirmation email.</li>
            <li><strong>Handling Time</strong>: Each item is carefully packed to ensure it arrives in perfect condition. This process typically takes an additional <strong>1-2 business days</strong>.</li>
          </ul>
          <p className="mt-2">You will receive another notification when your order has shipped.</p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">2. Shipping Rates & Delivery Estimates</h2>
           <ul className="list-disc list-inside space-y-1">
            <li><strong>Shipping Costs</strong>: Shipping charges for your order will be calculated and displayed at checkout.</li>
            <li><strong>Free Shipping</strong>: We are pleased to offer <strong>free standard shipping</strong> Australia-wide.</li>
            <li><strong>Delivery Estimates</strong>:
              <ul className="list-disc list-inside ml-6 mt-1">
                <li><strong>Standard Shipping</strong>: [5] - [8] business days</li>
                <li><strong>Express Shipping</strong>: [1] - [4] business days (additional charges apply)</li>
              </ul>
            </li>
          </ul>
          <p className="mt-2 text-gray-600">Please note that these are estimates and delivery times may vary depending on your location, the courier, and other external factors.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">3. Order Tracking</h2>
          <p>Once your order has shipped, you will receive an email notification from us which will include a tracking number you can use to check its status.</p>
          <p className="mt-2">If you haven’t received your tracking information within 3 business days of receiving your shipping confirmation email, please contact us at <strong>info@curated-shop-australia.com</strong> with your name and order number, and we will look into it for you.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Shipping Delays</h2>
          <p>While we make every effort to ship your order on time, there may be occasional delays due to factors such as high order volumes, postal service issues, or weather conditions that are outside of our control. We will notify you as soon as possible if there is a significant delay in the shipment of your order.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">5. Incorrect Shipping Information</h2>
          <p>Please ensure your shipping address is correct when placing an order. We are not responsible for lost shipments or delays due to incorrect or incomplete addresses. If you notice an error, please contact us immediately at <strong>info@curated-shop-australia.com</strong> so we can attempt to correct it before the order is shipped.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">6. Lost or Damaged Packages</h2>
          <p>If your package is lost in transit, please contact the shipping carrier directly to file a claim. If your order arrives damaged, please contact us at <strong>info@curated-shop-australia.com</strong> as soon as possible with your order number and a photo of the item’s condition. We address these on a case-by-case basis but will try our best to work towards a satisfactory solution.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">7. Returns & Exchanges</h2>
          <p>For information on returns and exchanges, please refer to our <strong>Return & Refund Policy</strong> page.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">8. Contact Us</h2>
          <p>If you have any further questions about your order or our shipping policy, please don’t hesitate to contact us at <strong>info@curated-shop-australia.com</strong>.</p>
        </section>
      </div>
    </div>
  );
}
