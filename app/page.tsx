import { getHomepageContent, getUploadFormContent } from '@/lib/contentful'
import HomepageClient from './HomepageClient'

// Revalidate every 60 seconds to fetch fresh content
export const revalidate = 60

export default async function Home() {
  // Fetch content from CMS (with automatic fallbacks)
  const [homepageContent, uploadFormContent] = await Promise.all([
    getHomepageContent(),
    getUploadFormContent()
  ])

  return (
    <HomepageClient 
      homepageContent={homepageContent}
      uploadFormContent={uploadFormContent}
    />
  )
}