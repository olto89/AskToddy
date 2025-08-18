import { getHomepageContent, getUploadFormContent } from '@/lib/contentful'
import HomepageClient from './HomepageClient'

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