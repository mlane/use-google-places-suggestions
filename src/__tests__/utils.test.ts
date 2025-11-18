import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { debounce, flattenSuggestions } from '../utils'

describe('utils', () => {
  describe('debounce', () => {
    const mockCallback = vi.fn(props => props)
    const mockProps = {
      value: 'VALUE',
    }
    const debouncedFunction = debounce(mockCallback, 1000)

    afterEach(() => {
      vi.resetAllMocks()
    })

    beforeEach(() => {
      vi.useFakeTimers()
    })

    test('should run after the specified duration', () => {
      debouncedFunction(mockProps)
      expect(mockCallback).not.toHaveBeenCalled()
      vi.advanceTimersByTime(1000)
      expect(mockCallback).toHaveBeenCalled()
      expect(mockCallback).toHaveBeenCalledWith(mockProps)
    })

    test('should reset the wait time on successive calls', () => {
      debouncedFunction(mockProps)
      expect(mockCallback).not.toHaveBeenCalled()
      vi.advanceTimersByTime(200)
      debouncedFunction(mockProps)
      expect(mockCallback).not.toHaveBeenCalled()
      vi.advanceTimersByTime(1000)
      expect(mockCallback).toHaveBeenCalledTimes(1)
      vi.advanceTimersByTime(1000)
      expect(mockCallback).toHaveBeenCalledTimes(1)
    })

    test('should not run if cancelled', () => {
      debouncedFunction(mockProps)
      expect(mockCallback).not.toHaveBeenCalled()
      debouncedFunction.cancel()
      vi.advanceTimersByTime(1000)
      expect(mockCallback).not.toHaveBeenCalled()
    })
  })

  describe('flattenSuggestions', () => {
    const mockPlacePrediction: google.maps.places.AutocompleteSuggestion['placePrediction'] =
      {
        placeId: 'PLACE_ID',
        distanceMeters: 100,
        mainText: {
          matches: [],
          text: 'MAIN_TEXT',
        },
        secondaryText: {
          matches: [],
          text: 'SECONDARY_TEXT',
        },
        text: {
          matches: [],
          text: 'TEXT',
        },
        toPlace: vi.fn(),
        types: ['geocode'],
      }
    const mockSuggestions: google.maps.places.AutocompleteSuggestion[] = [
      {
        placePrediction: mockPlacePrediction,
      },
    ]
    const mockFlattenedSuggestions: google.maps.places.AutocompleteSuggestion['placePrediction'][] =
      [mockPlacePrediction]

    test('should return an empty array when given no suggestions', () => {
      expect(flattenSuggestions([])).toEqual([])
    })

    test('should keep existing placePrediction fields', () => {
      expect(flattenSuggestions(mockSuggestions)).toEqual(
        mockFlattenedSuggestions
      )
    })

    test('should not flatten FormattableText fields when they are missing', () => {
      const mockPlacePredictionWithoutFormattableText: google.maps.places.AutocompleteSuggestion['placePrediction'] =
        {
          ...mockPlacePrediction,
          mainText: null,
          secondaryText: null,
          toPlace: mockPlacePrediction.toPlace,
        }
      const mockSuggestionsWithoutFormattableText: google.maps.places.AutocompleteSuggestion[] =
        [
          {
            placePrediction: mockPlacePredictionWithoutFormattableText,
          },
        ]
      const mockFlattenedSuggestionsWithoutFormattableText: google.maps.places.AutocompleteSuggestion['placePrediction'][] =
        [mockPlacePredictionWithoutFormattableText]
      expect(flattenSuggestions(mockSuggestionsWithoutFormattableText)).toEqual(
        mockFlattenedSuggestionsWithoutFormattableText
      )
    })
  })

  describe.skip('getGooglePlacesGeocode', () => {})

  describe.skip('getGooglePlacesGeocodeLatLng', () => {})
})
