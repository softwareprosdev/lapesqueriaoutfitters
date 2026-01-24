import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Terms and Conditions | La Pesqueria Outfitters",
  description: "Terms and Conditions for La Pesqueria Outfitters. Complete legal terms governing purchases and use of our services.",
};

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#001F3F] via-blue-900 to-[#001F3F] py-20 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1440 320%22%3E%3Cpath fill=%22%23ffffff%22 d=%22M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,181.3C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z%22%3E%3C/path%3E%3C/svg%3E')] bg-cover bg-bottom" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms and Conditions</h1>
          <p className="text-xl text-cyan-100 max-w-2xl mx-auto">
            Complete terms governing your relationship with La Pesqueria Outfitters.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-2xl shadow-xl p-8 md:p-12 space-y-8 text-slate-300 leading-relaxed border border-slate-800">

            <p className="italic text-slate-500">Last Updated: January 2026</p>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
              <p>
                These Terms and Conditions (&quot;Terms&quot;) govern your use of the La Pesqueria Outfitters website located at
                lapesqueria.com (&quot;Website&quot;) and any related services provided by La Pesqueria Outfitters (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
                By accessing or using our Website, you agree to be bound by these Terms.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">2. Definitions</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>&quot;Customer&quot;</strong> refers to any individual or entity that purchases products from our Website</li>
                <li><strong>&quot;Products&quot;</strong> refers to fishing apparel, gear, and related items sold on our Website</li>
                <li><strong>&quot;Order&quot;</strong> refers to a request to purchase Products through our Website</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">3. Eligibility</h2>
              <p>
                You must be at least 18 years old to make purchases on our Website. If you are under 18, you may only
                use our Website with the involvement of a parent or guardian. By using our Website, you represent that
                you meet these requirements.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">4. Product Descriptions</h2>
              <p>
                We strive to display our products as accurately as possible. However, colors may appear differently
                on different devices. As our products are manufactured, slight variations in appearance may occur.
                These variations are not considered defects.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">5. Order Acceptance</h2>
              <p className="mb-4">
                Your order constitutes an offer to purchase our products. We reserve the right to accept or decline
                any order for any reason, including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Product unavailability</li>
                <li>Errors in product or pricing information</li>
                <li>Suspected fraudulent activity</li>
                <li>Shipping restrictions</li>
              </ul>
              <p className="mt-4">
                If we cancel your order after payment, we will issue a full refund to your original payment method.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">6. Conservation Donations</h2>
              <p>
                A portion of each purchase is donated to local marine conservation efforts. These donations are made on
                your behalf and are non-refundable. Donation percentages are stated on each product page. We partner
                with verified conservation organizations and provide transparency reports on our donations.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">7. Returns and Exchanges</h2>
              <p className="mb-4">
                We accept returns within 30 days of delivery for unworn, unwashed items in original condition.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Items must have all tags attached</li>
                <li>Returns are processed within 5-7 business days of receipt</li>
                <li>Custom or personalized items are final sale unless defective</li>
                <li>Sale items are eligible for exchange only</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">8. Warranty</h2>
              <p>
                We warrant that our products will be free from defects in materials and workmanship for 90 days
                from the date of delivery. This warranty does not cover normal wear and tear, damage from misuse,
                or damage from exposure to saltwater, chemicals, or extreme conditions.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">9. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, La Pesqueria Outfitters shall not be liable for any indirect,
                incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether
                incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting
                from your use of our products or services.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">10. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the State of Texas,
                without regard to its conflict of law provisions. Any disputes arising under these Terms shall be
                resolved in the courts of Cameron County, Texas.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">11. Contact Information</h2>
              <p>
                For questions about these Terms and Conditions, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
                <p><strong>La Pesqueria Outfitters</strong></p>
                <p>4400 N 23rd St Suite 135</p>
                <p>McAllen, TX 78504</p>
                <p>Email: info@lapesqueria.com</p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
