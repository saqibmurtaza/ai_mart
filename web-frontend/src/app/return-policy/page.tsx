// app/return-policy/page.tsx

export default function ReturnPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center">Return & Refund Policy</h1>
      <p className="text-center text-gray-500 mb-10">Last updated: August 21, 2025</p>
      
      <div className="space-y-8 text-lg">
        <p>
          At <strong>Curated Shop Australia</strong>, we are committed to ensuring your satisfaction with every purchase. If you are not entirely satisfied with your order, we're here to help.
        </p>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Returns</h2>
          <p>
            You have <strong>30 calendar days</strong> to return an item from the date you received it.
          </p>
          <p className="mt-2">
            To be eligible for a return, your item must meet the following criteria:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>The item must be unused and in the same condition that you received it.</li>
            <li>The item must be in its original packaging.</li>
            <li>All original tags and labels must be attached.</li>
          </ul>
          <p className="mt-2 text-gray-600">
            Please note that certain items are not eligible for return, including gift cards, downloadable software products, and items marked as "Final Sale."
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Refund Process</h2>
          <ol className="list-decimal list-inside space-y-3">
            <li>
              <strong>Initiate a Return</strong>: To start a return, please contact our customer support team at <strong>support@aimart.com</strong> with your order number and the reason for your return. We will provide you with detailed instructions on how to proceed.
            </li>
            <li>
              <strong>Inspection</strong>: Once we receive your returned item, our team will inspect it to ensure it meets the return eligibility criteria. We will send you an email to notify you that we have received your item and are processing your request.
            </li>
            <li>
              <strong>Approval & Refund</strong>: If your return is approved, we will initiate a refund to your original method of payment. You will receive the credit within a certain number of days, depending on your card issuer's policies.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Shipping Costs</h2>
          <p>
            You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of the original shipping may be deducted from your refund.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Damaged or Incorrect Items</h2>
          <p>
            If you receive an item that is defective, damaged, or incorrect, please contact us at <strong>support@aimart.com</strong> within 7 days of receiving your order. We will work with you to resolve the issue promptly and will cover any associated shipping costs for the return.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
          <p>
            If you have any questions about our Return & Refund Policy, please do not hesitate to contact us at <strong>support@aimart.com</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
