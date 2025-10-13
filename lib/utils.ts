import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert a PDF file to image data URLs for AI analysis
 * This function converts the first few pages of a PDF to images
 */
export async function convertPdfToImages(file: File, maxPages: number = 3): Promise<string[]> {
  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      throw new Error('PDF processing only available in browser')
    }

    // Import PDF.js dynamically to avoid SSR issues
    const pdfjsLib = await import('pdfjs-dist')
    
    // Set up the worker with correct URL
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer()
    
    // Load the PDF document with options
    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer,
      cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
      cMapPacked: true,
    }).promise
    
    const numPages = Math.min(pdf.numPages, maxPages)
    const imageDataUrls: string[] = []

    console.log(`Converting ${numPages} pages from PDF...`)

    // Convert each page to canvas and then to data URL
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum)
        const scale = 2.0 // Higher scale for better quality
        const viewport = page.getViewport({ scale })
        
        // Create canvas
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        
        if (!context) {
          throw new Error('Could not get canvas context')
        }
        
        canvas.height = viewport.height
        canvas.width = viewport.width

        // Render PDF page to canvas
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise

        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        imageDataUrls.push(dataUrl)
        
        console.log(`Converted PDF page ${pageNum}/${numPages}`)
      } catch (pageError) {
        console.warn(`Failed to convert PDF page ${pageNum}:`, pageError)
        // Continue with other pages even if one fails
      }
    }

    if (imageDataUrls.length === 0) {
      throw new Error('No pages could be converted from PDF')
    }

    console.log(`Successfully converted ${imageDataUrls.length} pages from PDF`)
    return imageDataUrls
  } catch (error) {
    console.error('Failed to convert PDF to images:', error)
    // More specific error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Unable to process PDF file: ${errorMessage}. Please try uploading images instead.`)
  }
}

/**
 * Check if a file is a PDF
 */
export function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf'
}

/**
 * Create a data URL from a File object
 */
export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
