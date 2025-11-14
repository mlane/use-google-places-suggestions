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

type UseGooglePlacesSuggestionsReturn = {
  isLoading: boolean
  onClear: VoidFunction
  onSelectPrediction: (prediction: Prediction) => Prediction
  predictions: Prediction[]
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
  const debouncedSearch = useCallback(
    debounce((updatedValue: string) => {
      onSearch(updatedValue)
    }, 300),
    []
  )

  useEffect(() => {
    let waitForAutocompleteSuggestion = setInterval(() => {
      if (window?.google?.maps?.places?.AutocompleteSuggestion) {
        setIsLoading(false)
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

      const { suggestions } =
        await google?.maps?.places?.AutocompleteSuggestion?.fetchAutocompleteSuggestions(
          {
            ...config,
            input: updatedValue,
          }
        )
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
    return prediction
  }

  return {
    isLoading,
    onClear,
    onSelectPrediction,
    predictions,
  }
}
