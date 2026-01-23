import AffirmationPoster from '@/components/AffirmationPoster'
import { fetchNewAffirmationData } from '@/lib/actions'

export default async function Home() {
  const initialData = await fetchNewAffirmationData()

  return <AffirmationPoster initialData={initialData} />
}

