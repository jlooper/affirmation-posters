import { createServerFn } from '@tanstack/react-start'
import { getAffirmation } from './fetchAffirmation'
import { uploadToCloudinary, buildCloudinaryImageUrl } from './buildCloudinaryUrl'

export interface AffirmationData {
  affirmation: string
  longestWord: string
  cloudinaryUrl: string
  photoId: string
  publicId: string
}

export const fetchNewAffirmationData = createServerFn({
  method: 'GET',
}).handler(async (): Promise<AffirmationData> => {
  // First fetch the affirmation
  const affirmationData = await getAffirmation()
  
  // Extract the longest word from the affirmation to use as image search query
  const words = affirmationData.affirmation.split(' ').filter(word => word.length > 0)
  const longestWord = words.reduce((longest, current) => 
    current.length > longest.length ? current : longest, ''
  ).toLowerCase()
  
  // Fetch an image based on the longest word
  const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY
  if (!accessKey) {
    throw new Error('Unsplash access key not configured')
  }
  
  const unsplashResponse = await fetch(
    `https://api.unsplash.com/photos/random?client_id=${accessKey}&orientation=landscape&query=${encodeURIComponent(longestWord)}`
  )
  if (!unsplashResponse.ok) {
    throw new Error('Failed to fetch Unsplash photo')
  }
  const unsplashData = await unsplashResponse.json() as { id: string; urls: { full: string } }

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
})
