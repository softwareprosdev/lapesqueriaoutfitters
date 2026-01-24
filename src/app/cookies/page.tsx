import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Cookie Policy | La Pesqueria's Studio",
  description: "Cookie Policy for La Pesqueria's Studio. Learn how we use cookies and similar technologies on our website.",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-600 via-blue-600 to-cyan-700 py-20 text-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Cookie Policy</h1>
          <p className="text-xl text-cyan-100 max-w-2xl mx-auto">
            How we use cookies to improve your browsing experience.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 -mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8 text-gray-700 leading-relaxed">

            <p className="italic text-gray-500">Last Updated: December 2025</p>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. What Are Cookies?</h2>
              <p>
                Cookies are small text files that are placed on your device when you visit a website. They are
                widely used to make websites work more efficiently and to provide information to website owners.
                Cookies help us remember your preferences and improve your browsing experience.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Types of Cookies We Use</h2>

              <div className="space-y-6">
                <div className="border-l-4 border-teal-500 pl-4">
                  <h3 className="font-bold text-gray-900 mb-2">Essential Cookies</h3>
                  <p>
                    These cookies are necessary for the website to function properly. They enable core functionality
                    such as security, shopping cart, and account authentication. You cannot opt out of these cookies.
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-bold text-gray-900 mb-2">Functional Cookies</h3>
                  <p>
                    These cookies enable enhanced functionality and personalization, such as remembering your
                    preferences, language settings, and items in your cart. Without these cookies, some features
                    may not work correctly.
                  </p>
                </div>

                <div className="border-l-4 border-cyan-500 pl-4">
                  <h3 className="font-bold text-gray-900 mb-2">Analytics Cookies</h3>
                  <p>
                    We use analytics cookies to understand how visitors interact with our website. This helps us
                    improve our website and services. These cookies collect information anonymously.
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-bold text-gray-900 mb-2">Marketing Cookies</h3>
                  <p>
                    These cookies are used to track visitors across websites to display relevant advertisements.
                    They are set by our advertising partners and help us measure the effectiveness of our marketing.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Specific Cookies We Use</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Cookie Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Purpose</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-sm">next-auth.session-token</td>
                      <td className="px-4 py-3 text-sm">User authentication session</td>
                      <td className="px-4 py-3 text-sm">Session</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 text-sm">__stripe_mid</td>
                      <td className="px-4 py-3 text-sm">Stripe payment processing</td>
                      <td className="px-4 py-3 text-sm">1 year</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm">cart</td>
                      <td className="px-4 py-3 text-sm">Shopping cart contents</td>
                      <td className="px-4 py-3 text-sm">7 days</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 text-sm">_ga, _gid</td>
                      <td className="px-4 py-3 text-sm">Google Analytics tracking</td>
                      <td className="px-4 py-3 text-sm">2 years / 24 hours</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm">preferences</td>
                      <td className="px-4 py-3 text-sm">User preferences (theme, etc.)</td>
                      <td className="px-4 py-3 text-sm">1 year</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Third-Party Cookies</h2>
              <p className="mb-4">
                We use services from the following third parties that may set their own cookies:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Stripe</strong> - For secure payment processing</li>
                <li><strong>Google Analytics</strong> - For website analytics</li>
                <li><strong>Vercel</strong> - For website hosting and performance</li>
                <li><strong>Meta (Facebook/Instagram)</strong> - For social media integration</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Managing Your Cookie Preferences</h2>
              <p className="mb-4">
                You can control and manage cookies in several ways:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Browser Settings:</strong> Most browsers allow you to refuse or delete cookies through
                  their settings. Check your browser&apos;s help section for instructions.
                </li>
                <li>
                  <strong>Our Cookie Banner:</strong> When you first visit our site, you can choose which
                  non-essential cookies to accept.
                </li>
                <li>
                  <strong>Opt-Out Links:</strong> For Google Analytics, visit{' '}
                  <a href="https://tools.google.com/dlpage/gaoptout" className="text-teal-600 hover:underline" target="_blank" rel="noopener noreferrer">
                    Google Analytics Opt-out
                  </a>
                </li>
              </ul>
              <p className="mt-4 text-sm text-gray-600">
                Note: Disabling certain cookies may affect the functionality of our website.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Changes to This Policy</h2>
              <p>
                We may update this Cookie Policy from time to time to reflect changes in our practices or for
                other operational, legal, or regulatory reasons. We encourage you to review this policy periodically.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact Us</h2>
              <p>
                If you have questions about our use of cookies, please contact us at info@lapesqueria.com.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
