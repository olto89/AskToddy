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
    // Import PDF.js dynamically to avoid SSR issues
    const pdfjsLib = await import('pdfjs-dist')
    
    // Set up the worker
    if (typeof window !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
    }

    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer()
    
    // Load the PDF document
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise
    const numPages = Math.min(pdf.numPages, maxPages)
    const imageDataUrls: string[] = []

    // Convert each page to canvas and then to data URL
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum)
        const scale = 2.0 // Higher scale for better quality
        const viewport = page.getViewport({ scale })
        
        // Create canvas
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.height = viewport.height
        canvas.width = viewport.width

        if (context) {
          // Render PDF page to canvas
          await page.render({
            canvasContext: context,
            viewport: viewport,
            canvas: canvas
          }).promise

          // Convert canvas to data URL
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
          imageDataUrls.push(dataUrl)
        }
      } catch (pageError) {
        console.warn(`Failed to convert PDF page ${pageNum}:`, pageError)
      }
    }

    return imageDataUrls
  } catch (error) {
    console.error('Failed to convert PDF to images:', error)
    throw new Error('Unable to process PDF file. Please try uploading images instead.')
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
