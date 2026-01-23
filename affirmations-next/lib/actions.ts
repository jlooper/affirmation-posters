'use server'

import { buildCloudinaryImageUrl } from './cloudinary'

export interface AffirmationResponse {
  affirmation: string
}

interface CloudinaryUploadResponse {
  public_id: string
  secure_url: string
  url: string
}

export interface AffirmationData {
  affirmation: string
  longestWord: string
  cloudinaryUrl: string
  photoId: string
  publicId: string
}

/**
 * Fetches a random affirmation from affirmations.dev
 */
export async function getAffirmation(): Promise<AffirmationResponse> {
  try {
    const response = await fetch('https://www.affirmations.dev/')
    if (!response.ok) {
      throw new Error('Failed to fetch affirmation')
    }
    const data = await response.json()
    return data as AffirmationResponse
  } catch (error) {
    console.error('Error fetching affirmation:', error)
    throw error
  }
}

/**
 * Uploads an Unsplash image to Cloudinary and returns the public_id
 */
export async function uploadToCloudinary(url: string): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'unsigned'

  if (!cloudName) {
    throw new Error('Cloudinary credentials not configured')
  }

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: new URLSearchParams({
          file: url,
          upload_preset: uploadPreset,
          folder: 'affirmations',
        }).toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Upload failed:', errorData)
      throw new Error(`Cloudinary upload failed: ${errorData}`)
    }

    const data = (await response.json()) as CloudinaryUploadResponse
    return data.public_id
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error)
    throw error
  }
}

/**
 * Fetches a new affirmation with image - used by client for refresh
 */
export async function fetchNewAffirmationData(): Promise<AffirmationData> {
  try {
    // First fetch the affirmation
    const affirmationData = await getAffirmation()

    // Extract the longest word from the affirmation to use as image search query
    const words = affirmationData.affirmation.split(' ').filter(word => word.length > 0)
    const longestWord = words
      .reduce((longest, current) => (current.length > longest.length ? current : longest), '')
      .toLowerCase()

    // Fetch an image based on the longest word using direct fetch
    const accessKey = process.env.UNSPLASH_ACCESS_KEY
    if (!accessKey) {
      throw new Error('Unsplash access key not configured')
    }

    const unsplashResponse = await fetch(
      `https://api.unsplash.com/photos/random?client_id=${accessKey}&orientation=landscape&query=${encodeURIComponent(longestWord)}`
    )
    if (!unsplashResponse.ok) {
      throw new Error('Failed to fetch Unsplash photo')
    }
    const unsplashData = (await unsplashResponse.json()) as { id: string; urls: { full: string } }

    // Upload the Unsplash image to Cloudinary
    const publicId = await uploadToCloudinary(unsplashData.urls.full)

    // Build the Cloudinary URL with transformations
    const cloudinaryUrl = buildCloudinaryImageUrl(publicId)

    return {
      affirmation: affirmationData.affirmation,
      longestWord,
      cloudinaryUrl,
      photoId: unsplashData.id,
      publicId,
    }
  } catch (error) {
    console.error('Error fetching new affirmation data:', error)
    throw error
  }
}

