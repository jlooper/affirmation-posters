import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo, useRef, useEffect } from 'react'
import { RefreshCw, Loader2, Printer } from 'lucide-react'
import { fetchNewAffirmationData } from '../data/fetchNewAffirmationData'

export const Route = createFileRoute('/')({
  loader: async () => {
    return await fetchNewAffirmationData()
  },
  component: AffirmationPage,
})

function AffirmationPage() {
  const initialData = Route.useLoaderData()
  const [imageUrl, setImageUrl] = useState(initialData.cloudinaryUrl)
  const [affirmation, setAffirmation] = useState(initialData.affirmation)
  const [longestWord, setLongestWord] = useState(initialData.longestWord)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const posterRef = useRef<HTMLDivElement>(null)
  const wordRef = useRef<HTMLHeadingElement>(null)

  // Convert to uppercase for display with styled first/last letters, remove punctuation
  const longestWordForDisplay = longestWord.replace(/[^\w]/g, '').toUpperCase()
  
  // Create styled word: first & last letters bigger, middle underlined
  const styledWord = useMemo(() => {
    const letters = longestWordForDisplay.split('')
    if (letters.length <= 2) {
      return <span>{letters.join('')}</span>
    }
    
    const first = letters[0]
    const middle = letters.slice(1, -1).join('')
    const last = letters[letters.length - 1]
    
    return (
      <span className="inline-flex items-start">
        <span className="text-[1.3em]">{first}</span>
        <span className="underline underline-offset-4 decoration-2 box-decoration-clone">{middle}</span>
        <span className="text-[1.3em] ml-[0.05em]">{last}</span>
      </span>
    )
  }, [longestWordForDisplay])
  
  // Plain text version for print
  const longestWordWithDots = longestWordForDisplay

  // Adjust font size to fit the word in the container
  useEffect(() => {
    if (!wordRef.current) return
    
    const element = wordRef.current
    const container = element.parentElement
    if (!container) return

    // Reset to max size first
    element.style.fontSize = ''
    
    // Check if text overflows
    if (element.scrollWidth > container.clientWidth) {
      // Binary search for the right font size
      let minSize = 8 // minimum 8px
      let maxSize = 128 // start with max reasonable size
      let bestSize = minSize
      
      const testSize = (size: number) => {
        element.style.fontSize = `${size}px`
        return element.scrollWidth <= container.clientWidth
      }
      
      while (minSize <= maxSize) {
        const midSize = Math.floor((minSize + maxSize) / 2)
        if (testSize(midSize)) {
          bestSize = midSize
          minSize = midSize + 1
        } else {
          maxSize = midSize - 1
        }
      }
      
      element.style.fontSize = `${bestSize}px`
    }
  }, [longestWordForDisplay])

  const handleGetNewOne = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchNewAffirmationData()
      setImageUrl(data.cloudinaryUrl)
      setAffirmation(data.affirmation)
      setLongestWord(data.longestWord)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch affirmation')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrint = () => {
    if (posterRef.current) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Affirmation Poster</title>
              <style>
                @page {
                  size: letter landscape;
                  margin: 0;
                }
                * {
                  page-break-inside: avoid;
                  page-break-after: avoid;
                  page-break-before: avoid;
                }
                body {
                  margin: 0;
                  padding: 0;
                  background: black;
                  display: flex;
                  justify-content: center;
                  align-items: flex-start;
                  height: 8.5in;
                  width: 11in;
                  font-family: Georgia, serif;
                  overflow: hidden;
                }
                .poster-container {
                  width: 11in;
                  height: 8.5in;
                  max-height: 8.5in;
                  background: black;
                  padding: 0.75in;
                  box-sizing: border-box;
                  display: flex;
                  flex-direction: column;
                  page-break-inside: avoid;
                }
                .poster-image {
                  width: 100%;
                  max-height: 3.5in;
                  object-fit: cover;
                  border: 2px solid rgba(255,255,255,0.2);
                  margin-bottom: 1rem;
                  flex-shrink: 0;
                }
                h1 {
                  text-align: center;
                  font-weight: 900;
                  text-transform: uppercase;
                  letter-spacing: 0.2em;
                  color: #d97706;
                  margin: 0.5rem 0;
                  white-space: nowrap;
                  font-size: 2.5rem;
                  flex-shrink: 0;
                }
                .poster-line {
                  width: 200px;
                  height: 4px;
                  background: #d97706;
                  margin: 1rem auto;
                  flex-shrink: 0;
                }
                h2 {
                  text-align: center;
                  font-size: 1.2rem;
                  text-transform: uppercase;
                  letter-spacing: 0.1em;
                  color: white;
                  line-height: 1.6;
                  max-width: 100%;
                  margin: 0;
                  flex: 1;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
                @media print {
                  body { 
                    margin: 0;
                    padding: 0;
                    height: 8.5in;
                    width: 11in;
                  }
                  .poster-container {
                    width: 11in;
                    height: 8.5in;
                    max-height: 8.5in;
                  }
                  .poster-image {
                    max-height: 3.5in;
                  }
                }
              </style>
            </head>
            <body>
              <div class="poster-container">
                <img src="${imageUrl}" alt="${affirmation}" class="poster-image" />
                <h1>${longestWordWithDots}</h1>
                <div class="poster-line"></div>
                <h2>${affirmation}</h2>
              </div>
            </body>
          </html>
        `)
        printWindow.document.close()
        
        // Wait for image to load before printing
        setTimeout(() => {
          printWindow.focus()
          printWindow.print()
          printWindow.onafterprint = () => printWindow.close()
        }, 250)
      }
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-8">
        {/* Successory Style Poster */}
        <div ref={posterRef} className="bg-black border-4 border-white/10 p-8 shadow-2xl">
          {/* Image */}
          <div className="relative aspect-[3/2] mb-8 border border-white/20">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <Loader2 className="w-16 h-16 text-amber-400 animate-spin" />
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex items-center justify-center bg-red-900/20 border-2 border-red-500">
                <p className="text-red-400 text-center px-4">{error}</p>
              </div>
            ) : (
              <img
                src={imageUrl}
                alt={affirmation}
                className="w-full h-full object-cover"
                onError={() => {
                  console.error('Image failed to load:', imageUrl)
                  setError('Failed to load image')
                }}
                loading="lazy"
              />
            )}
          </div>

          {/* Main Word (Successory Style) */}
          {!isLoading && !error && (
            <div className="text-center mb-6">
              <h2 
                ref={wordRef}
                className="text-xl sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black uppercase tracking-[0.2em] text-amber-600 mb-4 whitespace-nowrap" 
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {styledWord}
              </h2>
              {/* Full Affirmation Text */}
              <p className="text-lg md:text-xl uppercase tracking-wide text-white leading-relaxed max-w-3xl mx-auto">
                {affirmation}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handleGetNewOne}
            disabled={isLoading}
            className="flex items-center gap-3 px-8 py-4 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-900 text-white font-semibold rounded-lg transition-all shadow-lg shadow-amber-600/50 hover:shadow-xl hover:shadow-amber-600/70 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                <span>Get New Affirmation</span>
              </>
            )}
          </button>
          
          <button
            onClick={handlePrint}
            disabled={isLoading}
            className="flex items-center gap-3 px-8 py-4 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-900 text-white font-semibold rounded-lg transition-all shadow-lg shadow-slate-700/50 hover:shadow-xl hover:shadow-slate-700/70 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Printer className="w-5 h-5" />
            <span>Print</span>
          </button>
        </div>
      </div>
    </div>
  )
}
