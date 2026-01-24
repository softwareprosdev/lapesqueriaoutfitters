import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Terms of Service | La Pesqueria's Studio",
  description: "Terms of Service for La Pesqueria's Studio. Read our terms governing the use of our website and services.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-600 via-blue-600 to-cyan-700 py-20 text-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-xl text-cyan-100 max-w-2xl mx-auto">
            Please read these terms carefully before using our services.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 -mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8 text-gray-700 leading-relaxed">

            <p className="italic text-gray-500">Last Updated: December 2025</p>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p>
                By accessing or using La Pesqueria&apos;s Studio&apos;s website and services, you agree to be bound by these Terms of Service.
                If you do not agree to these terms, please do not use our services.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use of Our Services</h2>
              <p className="mb-4">You agree to use our services only for lawful purposes and in accordance with these Terms. You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the service in any way that violates any applicable laws or regulations</li>
                <li>Engage in any conduct that restricts or inhibits anyone&apos;s use of the service</li>
                <li>Attempt to gain unauthorized access to any part of the service</li>
                <li>Use automated systems or software to extract data from the website</li>
                <li>Introduce viruses or other malicious code</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account Registration</h2>
              <p>
                To access certain features of our service, you may be required to register for an account.
                You agree to provide accurate, current, and complete information during registration and to update
                such information to keep it accurate, current, and complete. You are responsible for safeguarding
                your password and for all activities that occur under your account.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Products and Orders</h2>
              <p className="mb-4">
                All products displayed on our website are subject to availability. We reserve the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Limit the quantity of items purchased per person or per order</li>
                <li>Refuse or cancel any order for any reason</li>
                <li>Discontinue any product without prior notice</li>
                <li>Correct pricing errors (if an order has been placed at an incorrect price, we will notify you)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Pricing and Payment</h2>
              <p>
                All prices are displayed in USD and are subject to change without notice. Payment must be received
                in full before an order is processed. We accept major credit cards and other payment methods as
                indicated at checkout. All payments are processed securely through our payment partners.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Shipping and Delivery</h2>
              <p>
                Shipping times and costs vary based on your location and chosen shipping method. While we strive
                to meet estimated delivery times, we cannot guarantee specific delivery dates. Risk of loss and
                title for items purchased pass to you upon delivery to the carrier.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Returns and Refunds</h2>
              <p>
                We want you to be completely satisfied with your purchase. If you are not satisfied, you may
                return unused items in their original packaging within 30 days of delivery for a full refund.
                Custom or personalized items cannot be returned unless defective. Please contact us at
                info@lapesqueria.com to initiate a return.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Intellectual Property</h2>
              <p>
                All content on this website, including text, graphics, logos, images, and software, is the property
                of La Pesqueria&apos;s Studio and is protected by copyright and trademark laws. You may not reproduce, distribute,
                or create derivative works from any content without our express written permission.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, La Pesqueria&apos;s Studio shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages arising out of or relating to your use of our services.
                Our total liability shall not exceed the amount paid by you for the product or service in question.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon
                posting to the website. Your continued use of the service after any changes constitutes acceptance
                of the new Terms.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at info@lapesqueria.com.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
