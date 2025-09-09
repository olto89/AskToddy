export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Privacy Policy</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6 text-gray-600">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Data Collection</h2>
            <p>When you use AskToddy and provide feedback, we collect:</p>
            <ul className="list-disc ml-6 mt-2">
              <li>Your email address</li>
              <li>Your feedback rating and comments</li>
              <li>Usage analytics (pages visited, features used)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">How We Use Your Data</h2>
            <ul className="list-disc ml-6">
              <li>To improve our service and user experience</li>
              <li>To respond to your feedback</li>
              <li>To send you tool hire offers and updates (only with your consent)</li>
              <li>To analyze usage patterns and optimize our platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Data Storage</h2>
            <p>Your data is stored securely using:</p>
            <ul className="list-disc ml-6 mt-2">
              <li>Mailchimp for email and feedback management (US-based, GDPR compliant)</li>
              <li>Firebase Analytics for usage tracking (Google Cloud)</li>
              <li>All data is encrypted in transit and at rest</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Your Rights</h2>
            <p>Under GDPR, you have the right to:</p>
            <ul className="list-disc ml-6 mt-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent at any time</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Marketing Communications</h2>
            <p>
              We only send marketing emails if you explicitly opt-in. You can unsubscribe at any time
              using the link in our emails or by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Cookies & Tracking</h2>
            <p>We use:</p>
            <ul className="list-disc ml-6 mt-2">
              <li>Essential cookies for site functionality</li>
              <li>Firebase Analytics for anonymous usage tracking</li>
              <li>No third-party advertising cookies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Us</h2>
            <p>For any privacy concerns or data requests, contact:</p>
            <p className="mt-2">
              Toddy Tool Hire<br />
              Email: oliver@toddytoolhire.co.uk<br />
              Phone: 01394 447658
            </p>
          </section>

          <section>
            <p className="text-sm text-gray-500 pt-4 border-t">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}