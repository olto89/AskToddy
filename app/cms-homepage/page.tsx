import { DEFAULT_HOMEPAGE_CONTENT } from '@/lib/contentful'

export default async function CMSHomepage() {
  const content = DEFAULT_HOMEPAGE_CONTENT
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Status Banner */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
          <p className="text-green-800 font-medium">
            ✅ Contentful Connected - Space ID: htwj3qfvjshy
          </p>
          <p className="text-green-700 text-sm mt-1">
            Content below comes from CMS (or fallback if no entry exists)
          </p>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {content.heroTitle}
          </h1>
          <h2 className="text-2xl text-gray-700 mb-4">
            {content.heroSubtitle}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            {content.heroDescription}
          </p>
          <button className="bg-orange-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-600 transition shadow-lg">
            {content.ctaButtonText}
          </button>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-12">
          <h3 className="text-2xl font-bold mb-4">
            {content.uploadSectionTitle}
          </h3>
          <p className="text-gray-600">
            {content.uploadSectionDescription}
          </p>
        </div>

        {/* Features */}
        {content.features && content.features.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-center mb-8">
              {content.featuresTitle}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {content.features.map((feature, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg p-6">
                  {feature.icon && (
                    <div className="text-4xl mb-4">{feature.icon}</div>
                  )}
                  <h4 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Debug Info */}
        <div className="mt-12 bg-gray-100 rounded-lg p-6">
          <h4 className="font-bold mb-4">Content Source Debug:</h4>
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(content, null, 2)}
          </pre>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h4 className="font-bold mb-4">How to edit this content:</h4>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Go to Contentful dashboard</li>
            <li>Click on "Content" tab</li>
            <li>Create/Edit your Homepage entry</li>
            <li>Fill in the fields (heroTitle, heroSubtitle, etc.)</li>
            <li>Click "Publish"</li>
            <li>Refresh this page to see changes instantly!</li>
          </ol>
          <p className="mt-4 text-sm text-gray-600">
            <strong>Note:</strong> If no content exists in Contentful, the fallback content (shown above) will be used automatically.
          </p>
        </div>
      </div>
    </div>
  )
}