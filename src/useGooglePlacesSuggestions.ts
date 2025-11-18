import { useCallback, useEffect, useState } from 'react'
import { debounce, flattenSuggestions } from './utils'

type CacheData = Record<
  string,
  {
    data: Prediction[]
    maxAge: number
  }
>

type Prediction = google.maps.places.AutocompleteSuggestion['placePrediction']

// SessionToken is not in @types/google.maps but exists in the API
interface SessionToken {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

type UseGooglePlacesSuggestionsReturn = {
  isLoading: boolean
  onClear: VoidFunction
  onSelectPrediction: (prediction: Prediction) => Prediction
  predictions: Prediction[]
  sessionToken: SessionToken | null
}

export const useGooglePlacesSuggestions = ({
  cacheExpiration = 24 * 60 * 60, // 24 hours
  cacheKey = 'ugps',
  config = {},
  value,
}: {
  cacheExpiration?: number
  cacheKey?: string
  config?: Omit<google.maps.places.AutocompleteRequest, 'input'>
  value: string
}): UseGooglePlacesSuggestionsReturn => {
  const [isLoading, setIsLoading] = useState(true)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [sessionToken, setSessionToken] = useState<SessionToken | null>(null)
  const debouncedSearch = useCallback(
    debounce((updatedValue: string) => {
      onSearch(updatedValue)
    }, 300),
    []
  )

  useEffect(() => {
    const waitForAutocompleteSuggestion = setInterval(() => {
      if (window?.google?.maps?.places?.AutocompleteSuggestion) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const places = window.google.maps.places as any
        const hasSessionToken =
          places &&
          'SessionToken' in places &&
          typeof places.SessionToken === 'function'

        setIsLoading(false)
        if (hasSessionToken) {
          setSessionToken(createNewSessionToken())
        }
        clearInterval(waitForAutocompleteSuggestion)
      }
    }, 50)

    return () => clearInterval(waitForAutocompleteSuggestion)
  }, [])

  useEffect(() => {
    return () => debouncedSearch.cancel()
  }, [debouncedSearch])

  useEffect(() => {
    const trimmedValue = value?.trim()

    if (!trimmedValue) return onClear()

    debouncedSearch(trimmedValue)
  }, [value])

  const createNewSessionToken = useCallback((): SessionToken | null => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const places = window?.google?.maps?.places as any
    if (
      places &&
      'SessionToken' in places &&
      typeof places.SessionToken === 'function'
    ) {
      return new places.SessionToken() as SessionToken
    }
    return null
  }, [])

  const onClear = () => setPredictions([])

  const onSearch = async (updatedValue: string) => {
      try {
        const cachedDataFromSessionStorage: CacheData = JSON.parse(
          sessionStorage.getItem(cacheKey) || '{}'
        )
        const cachedData: CacheData = Object.keys(
          cachedDataFromSessionStorage
        )?.reduce<CacheData>((total, key) => {
          if (cachedDataFromSessionStorage?.[key]?.maxAge - Date.now() >= 0)
            total[key] = cachedDataFromSessionStorage?.[key]

          return total
        }, {})
        const cacheItemKey = updatedValue?.toLowerCase()

        if (cachedData?.[cacheItemKey]?.data)
          return setPredictions(cachedData?.[cacheItemKey]?.data)

        const requestConfig: google.maps.places.AutocompleteRequest = {
          ...config,
          input: updatedValue,
        }

        if (sessionToken) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(requestConfig as any).sessionToken = sessionToken
        }

        const { suggestions } =
          (await google?.maps?.places?.AutocompleteSuggestion?.fetchAutocompleteSuggestions(
            requestConfig
          )) ?? []
        const flattenedSuggestions = flattenSuggestions(suggestions)
        setPredictions(flattenedSuggestions ?? [])
        cachedData[cacheItemKey] = {
          data: flattenedSuggestions,
          maxAge: Date.now() + cacheExpiration * 1000,
        }
        sessionStorage.setItem(cacheKey, JSON.stringify(cachedData))
      } catch (error) {
        console.error(error)
      }
    }

  const onSelectPrediction = (prediction: Prediction) => {
    setPredictions([])
    // Renew session token for next session
    setSessionToken(createNewSessionToken())
    return prediction
  }

  return {
    isLoading,
    onClear,
    onSelectPrediction,
    predictions,
    sessionToken,
  }
}
