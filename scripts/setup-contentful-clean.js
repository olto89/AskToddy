const contentfulManagement = require('contentful-management')

const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN || ''
const SPACE_ID = 'htwj3qfvjshy'
const ENVIRONMENT_ID = 'master'

if (!MANAGEMENT_TOKEN) {
  console.error('❌ Missing CONTENTFUL_MANAGEMENT_TOKEN')
  process.exit(1)
}

async function cleanAndSetupContentful() {
  try {
    console.log('🧹 Starting Contentful cleanup and setup...\n')
    
    const client = contentfulManagement.createClient({
      accessToken: MANAGEMENT_TOKEN
    })

    const space = await client.getSpace(SPACE_ID)
    const environment = await space.getEnvironment(ENVIRONMENT_ID)

    // First, try to clean up existing homepage model
    console.log('🗑️  Checking for existing homepage model...')
    try {
      const existingHomepage = await environment.getContentType('homepage')
      
      // Delete all entries first
      console.log('  Deleting homepage entries...')
      const entries = await environment.getEntries({
        content_type: 'homepage'
      })
      
      for (const entry of entries.items) {
        if (entry.isPublished()) {
          await entry.unpublish()
        }
        await entry.delete()
      }
      
      console.log('  Unpublishing homepage model...')
      if (existingHomepage.isPublished()) {
        await existingHomepage.unpublish()
      }
      
      console.log('  Deleting homepage model...')
      await existingHomepage.delete()
      console.log('✅ Existing homepage model cleaned up')
      
    } catch (error) {
      if (error.message?.includes('not found')) {
        console.log('  No existing homepage model found')
      } else {
        console.log('⚠️  Could not fully clean homepage model:', error.message)
        console.log('  Will create fresh models instead...')
      }
    }

    // Create all models fresh
    console.log('\n📝 Creating content models...\n')

    // 1. Create Homepage Content Type
    console.log('Creating Homepage content type...')
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
      console.log('❌ Could not create Homepage:', error.message)
    }

    // 2. Create Upload Form Content Type
    console.log('Creating Upload Form content type...')
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
        console.log('⚠️  Upload Form already exists')
      } else {
        console.log('❌ Error:', error.message)
      }
    }

    // 3. Create Pricing Tier Content Type
    console.log('Creating Pricing Tier content type...')
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
        console.log('⚠️  Pricing Tier already exists')
      } else {
        console.log('❌ Error:', error.message)
      }
    }

    // Create sample content after a short delay
    console.log('\n⏳ Waiting for models to be ready...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    
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
      console.log('⚠️  Homepage entry error:', error.message)
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
      console.log('⚠️  Upload Form entry error:', error.message)
    }

    console.log('\n✨ Setup complete!')
    console.log('\n📝 Next steps:')
    console.log('1. Visit http://localhost:3000/cms-homepage to see your content')
    console.log('2. Edit content in Contentful dashboard')
    console.log('3. Changes appear instantly on refresh!')
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

cleanAndSetupContentful()