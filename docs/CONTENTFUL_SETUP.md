# Contentful Setup Guide for AskToddy

## 1. Get Your Contentful Credentials

1. Go to [app.contentful.com](https://app.contentful.com)
2. Create a new space or use existing one
3. Go to **Settings** → **API keys**
4. Click **Add API key**
5. Copy:
   - **Space ID**
   - **Content Delivery API - access token**
6. Add to `.env.local` and Vercel

## 2. Create Content Models

In Contentful, go to **Content model** and create these:

### Model 1: Homepage
**ID:** `homepage`

Fields:
- `heroTitle` (Short text) - Main headline
- `heroSubtitle` (Short text) - Subheadline
- `heroDescription` (Long text) - Hero description
- `ctaButtonText` (Short text) - Call-to-action button
- `uploadSectionTitle` (Short text)
- `uploadSectionDescription` (Long text)
- `featuresTitle` (Short text)
- `features` (JSON) - Array of features

### Model 2: Upload Form
**ID:** `uploadForm`

Fields:
- `title` (Short text) - Form title
- `projectTypeLabel` (Short text) - Label for project type
- `projectTypes` (JSON) - Array of project types:
  ```json
  [
    {"value": "renovation", "label": "Renovation"},
    {"value": "repair", "label": "Repair"},
    {"value": "installation", "label": "Installation"},
    {"value": "landscaping", "label": "Landscaping"},
    {"value": "painting", "label": "Painting"},
    {"value": "plumbing", "label": "Plumbing"},
    {"value": "electrical", "label": "Electrical"},
    {"value": "other", "label": "Other"}
  ]
  ```
- `descriptionLabel` (Short text)
- `descriptionPlaceholder` (Long text)
- `uploadLabel` (Short text)
- `uploadHelperText` (Short text)
- `submitButtonText` (Short text)
- `submitButtonTextLoading` (Short text)
- `validationMessages` (JSON):
  ```json
  {
    "requiredDescription": "Description is required",
    "noImages": "Please upload at least one image",
    "fileTooLarge": "File is too large",
    "invalidFileType": "Invalid file type"
  }
  ```

### Model 3: Pricing Tier
**ID:** `pricingTier`

Fields:
- `name` (Short text) - e.g., "Standard", "Premium"
- `description` (Long text)
- `priceMultiplier` (Number) - e.g., 1.0, 1.5, 2.0
- `features` (JSON) - Array of feature strings
- `order` (Number) - Display order

### Model 4: UI Text
**ID:** `uiText`

Fields:
- `key` (Short text) - Unique identifier
- `value` (Long text) - The actual text
- `description` (Short text) - What this text is for

### Model 5: AI Prompt
**ID:** `aiPrompt`

Fields:
- `type` (Short text) - e.g., "projectAnalysis", "followUp"
- `prompt` (Long text) - The actual prompt template
- `description` (Short text) - What this prompt is for
- `active` (Boolean) - Whether to use this prompt

## 3. Create Initial Content

### Create Homepage Entry:
```
heroTitle: "Get Instant AI-Powered Construction Quotes"
heroSubtitle: "Professional estimates in seconds"
heroDescription: "Upload photos of your project and get detailed quotes instantly"
ctaButtonText: "Get Your Quote Now"
uploadSectionTitle: "Upload Your Project"
uploadSectionDescription: "Take photos or videos of your project area"
```

### Create Upload Form Entry:
```
title: "Upload Your Project"
projectTypeLabel: "What type of project is this?"
descriptionLabel: "Describe your project"
descriptionPlaceholder: "Tell us about your project. What work needs to be done? What are your goals?"
uploadLabel: "Upload Images or Videos"
uploadHelperText: "Upload photos or videos of your project area"
submitButtonText: "Get Instant Quote"
submitButtonTextLoading: "Analyzing your project..."
```

### Create Pricing Tiers:
- **DIY Helper** (multiplier: 0.7) - Materials only, DIY guidance
- **Standard** (multiplier: 1.0) - Professional installation
- **Premium** (multiplier: 1.5) - Top contractors, warranty included

### Create UI Texts:
- `error.upload.failed`: "Upload failed. Please try again."
- `error.analysis.failed`: "Analysis failed. Please try again."
- `success.quote.ready`: "Your quote is ready!"
- `loading.analyzing`: "Our AI is analyzing your project..."

## 4. Test the Integration

1. Add your Contentful credentials to `.env.local`
2. Restart dev server: `npm run dev`
3. Content will now be fetched from Contentful
4. Make changes in Contentful and see them live!

## Benefits

- ✅ Change text without deploying
- ✅ A/B test different messages
- ✅ Marketing team can edit content
- ✅ Add seasonal promotions
- ✅ Adjust AI prompts on the fly
- ✅ Multi-language support ready