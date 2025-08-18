const contentfulManagement = require('contentful-management')

// You'll need a management token - get it from:
// Settings -> API keys -> Content management tokens -> Generate personal token
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN || ''
const SPACE_ID = 'htwj3qfvjshy'
const ENVIRONMENT_ID = 'master'

if (!MANAGEMENT_TOKEN) {
  console.error('❌ Missing CONTENTFUL_MANAGEMENT_TOKEN')
  console.log('\nTo get your management token:')
  console.log('1. Go to https://app.contentful.com')
  console.log('2. Settings -> API keys -> Content management tokens')
  console.log('3. Click "Generate personal token"')
  console.log('4. Run: CONTENTFUL_MANAGEMENT_TOKEN=your-token npm run setup-contentful')
  process.exit(1)
}

async function setupContentful() {
  try {
    console.log('🚀 Starting Contentful setup...\n')
    
    const client = contentfulManagement.createClient({
      accessToken: MANAGEMENT_TOKEN
    })

    const space = await client.getSpace(SPACE_ID)
    const environment = await space.getEnvironment(ENVIRONMENT_ID)

    // 1. Create Homepage Content Type
    console.log('📝 Creating Homepage content type...')
    try {
      const homepage = await environment.createContentTypeWithId('homepage', {
        name: 'Homepage',
        displayField: 'pageTitle',
        fields: [
          {
            id: 'pageTitle',
            name: 'Page Title',
            type: 'Symbol',
            required: false,
            localized: false
          },
          {
            id: 'heroTitle',
            name: 'Hero Title',
            type: 'Symbol',
            required: false,
            localized: false,
            validations: [{size: {max: 200}}]
          },
          {
            id: 'heroSubtitle',
            name: 'Hero Subtitle',
            type: 'Symbol',
            required: false,
            localized: false
          },
          {
            id: 'heroDescription',
            name: 'Hero Description',
            type: 'Text',
            required: false,
            localized: false
          },
          {
            id: 'ctaButtonText',
            name: 'CTA Button Text',
            type: 'Symbol',
            required: false,
            localized: false
          },
          {
            id: 'uploadSectionTitle',
            name: 'Upload Section Title',
            type: 'Symbol',
            required: false,
            localized: false
          },
          {
            id: 'uploadSectionDescription',
            name: 'Upload Section Description',
            type: 'Text',
            required: false,
            localized: false
          },
          {
            id: 'featuresTitle',
            name: 'Features Title',
            type: 'Symbol',
            required: false,
            localized: false
          },
          {
            id: 'features',
            name: 'Features',
            type: 'Object',
            required: false,
            localized: false
          }
        ]
      })
      await homepage.publish()
      console.log('✅ Homepage content type created')
    } catch (error) {
      if (error.message?.includes('already exists')) {
        console.log('⚠️  Homepage content type already exists')
      } else {
        throw error
      }
    }

    // 2. Create Upload Form Content Type
    console.log('📝 Creating Upload Form content type...')
    try {
      const uploadForm = await environment.createContentTypeWithId('uploadForm', {
        name: 'Upload Form',
        displayField: 'title',
        fields: [
          {
            id: 'title',
            name: 'Form Title',
            type: 'Symbol',
            required: true,
            localized: false
          },
          {
            id: 'projectTypeLabel',
            name: 'Project Type Label',
            type: 'Symbol',
            required: false,
            localized: false
          },
          {
            id: 'projectTypes',
            name: 'Project Types',
            type: 'Object',
            required: false,
            localized: false
          },
          {
            id: 'descriptionLabel',
            name: 'Description Label',
            type: 'Symbol',
            required: false,
            localized: false
          },
          {
            id: 'descriptionPlaceholder',
            name: 'Description Placeholder',
            type: 'Text',
            required: false,
            localized: false
          },
          {
            id: 'uploadLabel',
            name: 'Upload Label',
            type: 'Symbol',
            required: false,
            localized: false
          },
          {
            id: 'uploadHelperText',
            name: 'Upload Helper Text',
            type: 'Symbol',
            required: false,
            localized: false
          },
          {
            id: 'submitButtonText',
            name: 'Submit Button Text',
            type: 'Symbol',
            required: false,
            localized: false
          },
          {
            id: 'submitButtonTextLoading',
            name: 'Submit Button Loading Text',
            type: 'Symbol',
            required: false,
            localized: false
          },
          {
            id: 'validationMessages',
            name: 'Validation Messages',
            type: 'Object',
            required: false,
            localized: false
          }
        ]
      })
      await uploadForm.publish()
      console.log('✅ Upload Form content type created')
    } catch (error) {
      if (error.message?.includes('already exists')) {
        console.log('⚠️  Upload Form content type already exists')
      } else {
        throw error
      }
    }

    // 3. Create Pricing Tier Content Type
    console.log('📝 Creating Pricing Tier content type...')
    try {
      const pricingTier = await environment.createContentTypeWithId('pricingTier', {
        name: 'Pricing Tier',
        displayField: 'name',
        fields: [
          {
            id: 'name',
            name: 'Tier Name',
            type: 'Symbol',
            required: true,
            localized: false
          },
          {
            id: 'description',
            name: 'Description',
            type: 'Text',
            required: false,
            localized: false
          },
          {
            id: 'priceMultiplier',
            name: 'Price Multiplier',
            type: 'Number',
            required: true,
            localized: false,
            validations: [{range: {min: 0, max: 10}}]
          },
          {
            id: 'features',
            name: 'Features',
            type: 'Object',
            required: false,
            localized: false
          },
          {
            id: 'order',
            name: 'Display Order',
            type: 'Integer',
            required: false,
            localized: false
          },
          {
            id: 'recommended',
            name: 'Recommended',
            type: 'Boolean',
            required: false,
            localized: false
          }
        ]
      })
      await pricingTier.publish()
      console.log('✅ Pricing Tier content type created')
    } catch (error) {
      if (error.message?.includes('already exists')) {
        console.log('⚠️  Pricing Tier content type already exists')
      } else {
        throw error
      }
    }

    // 4. Create AI Prompt Content Type
    console.log('📝 Creating AI Prompt content type...')
    try {
      const aiPrompt = await environment.createContentTypeWithId('aiPrompt', {
        name: 'AI Prompt',
        displayField: 'name',
        fields: [
          {
            id: 'name',
            name: 'Prompt Name',
            type: 'Symbol',
            required: true,
            localized: false
          },
          {
            id: 'type',
            name: 'Prompt Type',
            type: 'Symbol',
            required: true,
            localized: false,
            validations: [{
              in: ['projectAnalysis', 'followUp', 'quote', 'materials']
            }]
          },
          {
            id: 'prompt',
            name: 'Prompt Template',
            type: 'Text',
            required: true,
            localized: false
          },
          {
            id: 'description',
            name: 'Description',
            type: 'Symbol',
            required: false,
            localized: false
          },
          {
            id: 'active',
            name: 'Active',
            type: 'Boolean',
            required: false,
            localized: false
          }
        ]
      })
      await aiPrompt.publish()
      console.log('✅ AI Prompt content type created')
    } catch (error) {
      if (error.message?.includes('already exists')) {
        console.log('⚠️  AI Prompt content type already exists')
      } else {
        throw error
      }
    }

    // 5. Create UI Text Content Type
    console.log('📝 Creating UI Text content type...')
    try {
      const uiText = await environment.createContentTypeWithId('uiText', {
        name: 'UI Text',
        displayField: 'key',
        fields: [
          {
            id: 'key',
            name: 'Key',
            type: 'Symbol',
            required: true,
            localized: false,
            validations: [{unique: true}]
          },
          {
            id: 'value',
            name: 'Value',
            type: 'Text',
            required: true,
            localized: false
          },
          {
            id: 'description',
            name: 'Description',
            type: 'Symbol',
            required: false,
            localized: false
          }
        ]
      })
      await uiText.publish()
      console.log('✅ UI Text content type created')
    } catch (error) {
      if (error.message?.includes('already exists')) {
        console.log('⚠️  UI Text content type already exists')
      } else {
        throw error
      }
    }

    console.log('\n🎉 Content types created successfully!')
    
    // Now create sample content
    console.log('\n📚 Creating sample content...\n')

    // Create Homepage entry
    try {
      const homepageEntry = await environment.createEntry('homepage', {
        fields: {
          pageTitle: {'en-US': 'AskToddy - AI Construction Quotes'},
          heroTitle: {'en-US': 'Get Instant AI-Powered Construction Quotes'},
          heroSubtitle: {'en-US': 'Professional estimates in seconds, not days'},
          heroDescription: {'en-US': 'Upload photos of your DIY project and receive detailed cost breakdowns, material lists, and timelines powered by advanced AI'},
          ctaButtonText: {'en-US': 'Get Your Free Quote'},
          uploadSectionTitle: {'en-US': 'Upload Your Project'},
          uploadSectionDescription: {'en-US': 'Take photos or videos of your project area and describe what you need done. Our AI will analyze and provide instant estimates.'},
          featuresTitle: {'en-US': 'Why Choose AskToddy'},
          features: {'en-US': [
            {
              title: 'Instant Quotes',
              description: 'Get detailed estimates in seconds, not days',
              icon: '⚡'
            },
            {
              title: 'AI-Powered Analysis',
              description: 'Advanced AI analyzes your photos for accurate estimates',
              icon: '🤖'
            },
            {
              title: 'Detailed Breakdowns',
              description: 'See materials, labor, and timeline clearly outlined',
              icon: '📊'
            }
          ]}
        }
      })
      await homepageEntry.publish()
      console.log('✅ Homepage sample content created')
    } catch (error) {
      console.log('⚠️  Homepage entry might already exist:', error.message)
    }

    // Create Upload Form entry
    try {
      const uploadFormEntry = await environment.createEntry('uploadForm', {
        fields: {
          title: {'en-US': 'Upload Your Project'},
          projectTypeLabel: {'en-US': 'What type of project is this?'},
          projectTypes: {'en-US': [
            {value: 'renovation', label: 'Renovation'},
            {value: 'repair', label: 'Repair'},
            {value: 'installation', label: 'Installation'},
            {value: 'landscaping', label: 'Landscaping'},
            {value: 'painting', label: 'Painting'},
            {value: 'plumbing', label: 'Plumbing'},
            {value: 'electrical', label: 'Electrical'},
            {value: 'other', label: 'Other'}
          ]},
          descriptionLabel: {'en-US': 'Describe your project'},
          descriptionPlaceholder: {'en-US': 'Tell us about your project in detail. What work needs to be done? What are your goals?'},
          uploadLabel: {'en-US': 'Upload Images or Videos'},
          uploadHelperText: {'en-US': 'Upload photos or videos of your project area'},
          submitButtonText: {'en-US': 'Get Instant Quote'},
          submitButtonTextLoading: {'en-US': 'Analyzing your project...'},
          validationMessages: {'en-US': {
            requiredDescription: 'Please describe your project',
            noImages: 'Please upload at least one photo',
            fileTooLarge: 'File is too large',
            invalidFileType: 'Please upload images or videos only'
          }}
        }
      })
      await uploadFormEntry.publish()
      console.log('✅ Upload Form sample content created')
    } catch (error) {
      console.log('⚠️  Upload Form entry might already exist:', error.message)
    }

    // Create Pricing Tiers
    const tiers = [
      {
        name: 'DIY Helper',
        description: 'Perfect for hands-on homeowners. Get materials lists and step-by-step guidance.',
        priceMultiplier: 0.7,
        features: ['Materials list', 'DIY instructions', 'Tool recommendations', 'Safety tips'],
        order: 1,
        recommended: false
      },
      {
        name: 'Standard',
        description: 'Professional installation with licensed contractors.',
        priceMultiplier: 1.0,
        features: ['Licensed contractors', 'Standard warranty', 'Project management', 'Quality guarantee'],
        order: 2,
        recommended: true
      },
      {
        name: 'Premium',
        description: 'White glove service with top-rated professionals.',
        priceMultiplier: 1.5,
        features: ['Top-rated contractors', 'Extended warranty', 'Priority scheduling', 'Cleanup included', '24/7 support'],
        order: 3,
        recommended: false
      }
    ]

    for (const tier of tiers) {
      try {
        const tierEntry = await environment.createEntry('pricingTier', {
          fields: {
            name: {'en-US': tier.name},
            description: {'en-US': tier.description},
            priceMultiplier: {'en-US': tier.priceMultiplier},
            features: {'en-US': tier.features},
            order: {'en-US': tier.order},
            recommended: {'en-US': tier.recommended}
          }
        })
        await tierEntry.publish()
        console.log(`✅ Pricing tier "${tier.name}" created`)
      } catch (error) {
        console.log(`⚠️  Pricing tier "${tier.name}" might already exist`)
      }
    }

    console.log('\n✨ Setup complete! Your Contentful space is ready.')
    console.log('\n📝 Next steps:')
    console.log('1. Visit http://localhost:3000/cms-homepage to see your content')
    console.log('2. Edit content in Contentful dashboard')
    console.log('3. Changes appear instantly on refresh!')
    
  } catch (error) {
    console.error('❌ Error setting up Contentful:', error)
    process.exit(1)
  }
}

setupContentful()