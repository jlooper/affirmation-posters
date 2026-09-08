export interface AffirmationResponse {
  affirmation: string
}

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
