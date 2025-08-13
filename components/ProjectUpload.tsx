'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface ProjectData {
  description: string
  projectType: string
  images: File[]
}

interface FileError {
  fileName: string
  error: string
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm']
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const MAX_VIDEO_SIZE = 200 * 1024 * 1024 // 200MB

interface ProjectUploadProps {
  onAnalysisComplete: (analysis: any) => void
  onAnalysisStart: () => void
}

export default function ProjectUpload({ onAnalysisComplete, onAnalysisStart }: ProjectUploadProps) {
  const [projectData, setProjectData] = useState<ProjectData>({
    description: '',
    projectType: 'renovation',
    images: []
  })
  const [uploading, setUploading] = useState(false)
  const [previewUrls, setPreviewUrls] = useState<{ url: string; type: string }[]>([])
  const [fileErrors, setFileErrors] = useState<FileError[]>([])

  const validateFile = (file: File): string | null => {
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type)
    
    if (!isImage && !isVideo) {
      return `File type not supported. Please upload images (JPEG, PNG, GIF, WebP) or videos (MP4, MPEG, MOV, AVI, WebM).`
    }
    
    if (isImage && file.size > MAX_FILE_SIZE) {
      return `Image file too large. Maximum size is 50MB.`
    }
    
    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      return `Video file too large. Maximum size is 200MB.`
    }
    
    return null
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      const validFiles: File[] = []
      const errors: FileError[] = []
      const newPreviews: { url: string; type: string }[] = []
      
      files.forEach(file => {
        const error = validateFile(file)
        if (error) {
          errors.push({ fileName: file.name, error })
        } else {
          validFiles.push(file)
          const fileType = file.type.startsWith('video/') ? 'video' : 'image'
          newPreviews.push({ 
            url: URL.createObjectURL(file), 
            type: fileType 
          })
        }
      })
      
      setFileErrors(errors)
      setProjectData({ ...projectData, images: [...projectData.images, ...validFiles] })
      setPreviewUrls([...previewUrls, ...newPreviews])
      
      // Reset the input value to allow re-uploading the same file
      e.target.value = ''
      
      // Clear errors after 5 seconds
      if (errors.length > 0) {
        setTimeout(() => setFileErrors([]), 5000)
      }
    }
  }

  const removeImage = (index: number) => {
    const newImages = projectData.images.filter((_, i) => i !== index)
    const newUrls = previewUrls.filter((_, i) => i !== index)
    setProjectData({ ...projectData, images: newImages })
    setPreviewUrls(newUrls)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    onAnalysisStart()

    try {
      const uploadedImageUrls: string[] = []

      for (let i = 0; i < projectData.images.length; i++) {
        const image = projectData.images[i]
        const fileExt = image.name.split('.').pop()
        const timestamp = Date.now()
        const fileName = `${timestamp}-${i}-${image.name.replace(/[^a-zA-Z0-9]/g, '_')}`
        const filePath = `project-images/${fileName}`

        const { data, error: uploadError } = await supabase.storage
          .from('project-uploads')
          .upload(filePath, image)

        if (uploadError) {
          throw uploadError
        }

        // For private buckets, we need to create a signed URL or store the path
        // Since we're using the anon key, we can access it via the authenticated URL
        const { data: urlData } = await supabase.storage
          .from('project-uploads')
          .createSignedUrl(filePath, 60 * 60 * 24 * 7) // 7 days expiry

        if (urlData?.signedUrl) {
          uploadedImageUrls.push(urlData.signedUrl)
        } else {
          // Fallback: store the path to retrieve later
          uploadedImageUrls.push(filePath)
        }
      }

      // Call AI analysis
      const analysisResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: projectData.description,
          projectType: projectData.projectType,
          imageUrls: uploadedImageUrls
        })
      })

      if (analysisResponse.ok) {
        const analysis = await analysisResponse.json()
        console.log('AI Analysis:', analysis)
        onAnalysisComplete(analysis)
      } else {
        alert('Analysis failed. Please try again.')
      }
      
      setProjectData({
        description: '',
        projectType: 'renovation',
        images: []
      })
      setPreviewUrls([])
    } catch (error) {
      console.error('Error uploading project:', error)
      alert('Error uploading project. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 text-navy-900">Upload Your Project</h2>
        <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full"></div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-navy-800 mb-2">
            Project Type
          </label>
          <select
            value={projectData.projectType}
            onChange={(e) => setProjectData({ ...projectData, projectType: e.target.value })}
            className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="renovation">Renovation</option>
            <option value="repair">Repair</option>
            <option value="installation">Installation</option>
            <option value="landscaping">Landscaping</option>
            <option value="painting">Painting</option>
            <option value="plumbing">Plumbing</option>
            <option value="electrical">Electrical</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-navy-800 mb-2">
            Project Description
          </label>
          <textarea
            value={projectData.description}
            onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Describe your project in detail. What work needs to be done? What are your goals?"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-navy-800 mb-2">
            Upload Images or Videos
          </label>
          <div className="border-2 border-dashed border-primary-300 rounded-lg p-6 text-center bg-gradient-to-br from-primary-50 to-secondary-50">
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleImageSelect}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 shadow-md transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Images or Videos
            </label>
            <p className="text-sm text-grey-700 mt-2">
              Upload photos or videos of your project area
            </p>
            <p className="text-xs text-grey-600 mt-1">
              Images: JPEG, PNG, GIF, WebP (max 50MB) | Videos: MP4, MOV, AVI, WebM (max 200MB)
            </p>
          </div>

          {fileErrors.length > 0 && (
            <div className="mt-2 space-y-1">
              {fileErrors.map((error, index) => (
                <div key={index} className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  <span className="font-medium">{error.fileName}:</span> {error.error}
                </div>
              ))}
            </div>
          )}

          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {previewUrls.map((preview, index) => (
                <div key={index} className="relative group">
                  {preview.type === 'video' ? (
                    <div className="relative">
                      <video
                        src={preview.url}
                        className="w-full h-32 object-cover rounded-lg"
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={preview.url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={uploading || projectData.images.length === 0}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 shadow-md ${
            uploading || projectData.images.length === 0
              ? 'bg-grey-400 text-grey-200 cursor-not-allowed'
              : 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:from-primary-600 hover:to-secondary-600 transform hover:scale-[1.02]'
          }`}
        >
          {uploading ? 'Uploading...' : 'Submit Project for Quote'}
        </button>
      </form>
    </div>
  )
}