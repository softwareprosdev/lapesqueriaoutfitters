import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Accessibility Statement | La Pesqueria's Studio",
  description: "Accessibility Statement for La Pesqueria's Studio. Our commitment to making our website accessible to everyone.",
};

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-600 via-blue-600 to-cyan-700 py-20 text-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Accessibility Statement</h1>
          <p className="text-xl text-cyan-100 max-w-2xl mx-auto">
            Our commitment to creating an inclusive online experience for everyone.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 -mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8 text-gray-700 leading-relaxed">

            <p className="italic text-gray-500">Last Updated: December 2025</p>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment</h2>
              <p>
                La Pesqueria&apos;s Studio is committed to ensuring digital accessibility for people with disabilities. We are
                continually improving the user experience for everyone and applying the relevant accessibility
                standards to ensure we provide equal access to all users.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Conformance Status</h2>
              <p>
                We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1, Level AA. These
                guidelines explain how to make web content more accessible for people with disabilities and
                more user-friendly for everyone.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Accessibility Features</h2>
              <p className="mb-4">Our website includes the following accessibility features:</p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-teal-50 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-2">Navigation</h3>
                  <ul className="list-disc pl-4 space-y-1 text-sm">
                    <li>Keyboard navigation support</li>
                    <li>Skip to main content links</li>
                    <li>Consistent navigation structure</li>
                    <li>Descriptive page titles</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-2">Visual Design</h3>
                  <ul className="list-disc pl-4 space-y-1 text-sm">
                    <li>High contrast color schemes</li>
                    <li>Resizable text without loss of functionality</li>
                    <li>Focus indicators for interactive elements</li>
                    <li>No content that flashes more than 3 times per second</li>
                  </ul>
                </div>

                <div className="bg-cyan-50 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-2">Content</h3>
                  <ul className="list-disc pl-4 space-y-1 text-sm">
                    <li>Alternative text for images</li>
                    <li>Descriptive link text</li>
                    <li>Clear headings and structure</li>
                    <li>Simple, readable language</li>
                  </ul>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-2">Forms & Checkout</h3>
                  <ul className="list-disc pl-4 space-y-1 text-sm">
                    <li>Clear form labels and instructions</li>
                    <li>Error identification and suggestions</li>
                    <li>Sufficient time to complete tasks</li>
                    <li>Input assistance and validation</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Assistive Technology Compatibility</h2>
              <p>
                Our website is designed to be compatible with the following assistive technologies:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Screen readers (NVDA, JAWS, VoiceOver, TalkBack)</li>
                <li>Screen magnification software</li>
                <li>Speech recognition software</li>
                <li>Keyboard-only navigation</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Known Limitations</h2>
              <p className="mb-4">
                Despite our best efforts, some content on our website may not be fully accessible:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Third-party content:</strong> Some embedded content from third parties (such as payment
                  processors) may not be fully accessible.
                </li>
                <li>
                  <strong>PDF documents:</strong> Some older PDF documents may not be fully accessible. We are
                  working to update these.
                </li>
                <li>
                  <strong>AR features:</strong> Our augmented reality try-on feature may have limited accessibility
                  for users with visual impairments.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Alternative Access</h2>
              <p>
                If you have difficulty accessing any content on our website, we are happy to assist you through
                alternative means. Please contact us and we will work with you to provide the information or
                service you need in an accessible format.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Feedback</h2>
              <p className="mb-4">
                We welcome your feedback on the accessibility of our website. Please let us know if you encounter
                accessibility barriers:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Email:</strong> accessibility@lapesqueria.com</p>
                <p><strong>Phone:</strong> (956) 555-0123</p>
                <p><strong>Response Time:</strong> We aim to respond to accessibility feedback within 5 business days.</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Continuous Improvement</h2>
              <p>
                We are committed to continually improving the accessibility of our website. We regularly review
                our website using automated accessibility testing tools and manual testing. We also train our
                team members on accessibility best practices.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Formal Complaints</h2>
              <p>
                If you are not satisfied with our response to your accessibility concern, you may file a complaint
                with the U.S. Department of Justice or contact us directly to discuss your concerns further.
                We are committed to resolving accessibility issues promptly.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
