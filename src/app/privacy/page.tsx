import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Privacy Policy | La Pesqueria Outfitters",
  description: "Privacy Policy for La Pesqueria Outfitters. Learn how we collect, use, and protect your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-[#001F3F] py-20 text-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 uppercase tracking-tight">Privacy Policy</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Your privacy matters to us. Transparency in how we handle your data.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 -mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8 text-gray-700 leading-relaxed">
            
            <p className="italic text-gray-500">Last Updated: January 2026</p>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p>
                Welcome to La Pesqueria Outfitters. We are committed to protecting your personal information and your right to privacy.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website
                and purchase our fishing apparel and gear.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
              <p className="mb-4">We collect information that you voluntarily provide to us when you:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Register on the website</li>
                <li>Place an order for our products</li>
                <li>Sign up for our newsletter</li>
                <li>Contact us for support</li>
              </ul>
              <p className="mt-4">
                This information may include your name, email address, shipping address, billing address, and payment information (processed securely by our payment processors).
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Process and fulfill your orders and returns</li>
                <li>Send you order confirmations and shipping updates</li>
                <li>Communicate with you about our products and services</li>
                <li>Improve our website and customer service</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. How We Protect Your Information</h2>
              <p>
                We implement appropriate technical and organizational security measures to protect your personal information against
                unauthorized access, alteration, disclosure, or destruction. This includes SSL encryption, secure servers, and
                regular security assessments.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cookies and Tracking Technologies</h2>
              <p>
                We use cookies and similar tracking technologies to track activity on our website and hold certain information.
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Third-Party Services</h2>
              <p className="mb-4">We may use trusted third-party services for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Payment processing (Stripe)</li>
                <li>Shipping and fulfillment</li>
                <li>Analytics and website improvement</li>
                <li>Email communications</li>
              </ul>
              <p className="mt-4">
                These third parties have access to your information only to perform these tasks on our behalf.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Rights</h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access and receive a copy of your personal data</li>
                <li>Rectify inaccurate personal data</li>
                <li>Request deletion of your personal data</li>
                <li>Object to or restrict processing of your personal data</li>
                <li>Data portability</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact Us</h2>
              <p>
                If you have questions or comments about this Privacy Policy, please contact us at{' '}
                <a href="mailto:info@lapesqueria.com" className="text-[#FF4500] font-semibold hover:underline">
                  info@lapesqueria.com
                </a>
                {' '}or visit our{' '}
                <a href="/contact" className="text-[#FF4500] font-semibold hover:underline">
                  contact page
                </a>.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
