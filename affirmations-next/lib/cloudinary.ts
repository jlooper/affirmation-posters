/**
 * Builds a Cloudinary URL without text overlay for Successory style
 * @param publicId - The Cloudinary public_id (after upload)
 * @returns The complete Cloudinary transformation URL
 */
export function buildCloudinaryImageUrl(publicId: string): string {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME

  if (!cloudName) {
    throw new Error('Cloudinary cloud name not configured')
  }

  // Don't encode the public_id - Cloudinary expects the raw path
  // Slashes in public_id are valid path separators
  const plainPublicId = publicId

  const transformations = [
    `c_fill,w_1200,h_800`, // Fill to 1200x800 for poster feel
    `f_auto`, // Auto format
    `q_auto`, // Auto quality
  ].join('/')

  // Return the complete Cloudinary URL with transformations
  // Note: public_id with folder path (e.g., affirmations/ebqlhasct6aenp7zcylr) should not be encoded
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${plainPublicId}`
}

