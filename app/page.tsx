import { DEFAULT_HOMEPAGE_CONTENT } from '@/lib/contentful'
import HomepageClient from './HomepageClient'

// Revalidate every 60 seconds to fetch fresh content
export const revalidate = 60

export default async function Home() {
  // Use default content (Contentful disabled)
  const homepageContent = DEFAULT_HOMEPAGE_CONTENT
  const uploadFormContent = null

  return (
    <HomepageClient 
      homepageContent={homepageContent}
      uploadFormContent={uploadFormContent}
    />
  )
}