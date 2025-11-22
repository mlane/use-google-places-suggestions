import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { debounce, flattenSuggestions, getGooglePlacesGeocode } from '../utils'
import { geocoderResultMock } from './__mocks__/geocoderResultMock'

type GeocoderCallback = (
  results: google.maps.GeocoderResult[] | null,
  status: google.maps.GeocoderStatus
) => void

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

  describe('getGooglePlacesGeocode', () => {
    beforeEach(() => {
      vi.stubGlobal('google', {
        maps: {
          Geocoder: class {
            geocode() {}
          },
        },
      })
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    test('should reject when geocoder status is not OK', async () => {
      google.maps.Geocoder.prototype.geocode = (
        _: google.maps.GeocoderRequest,
        callback: GeocoderCallback
      ): Promise<google.maps.GeocoderResponse> => {
        callback(null, google.maps.GeocoderStatus.ERROR)
        return Promise.resolve({
          results: [],
          status: google.maps.GeocoderStatus.ERROR,
        })
      }
      await expect(
        getGooglePlacesGeocode({
          address: null,
        })
      ).rejects.toThrow()
    })

    test('should resolve with results when geocoder status is OK', async () => {
      google.maps.Geocoder.prototype.geocode = (
        _: google.maps.GeocoderRequest,
        callback: GeocoderCallback
      ): Promise<google.maps.GeocoderResponse> => {
        callback([geocoderResultMock], 'OK' as google.maps.GeocoderStatus)
        return Promise.resolve({
          results: [geocoderResultMock],
          status: google.maps.GeocoderStatus.OK,
        })
      }
      const result = await getGooglePlacesGeocode({
        address: 'ADDRESS',
      })
      expect(result).toEqual([geocoderResultMock])
    })

    test('should log an error when componentRestrictions is provided without an address', async () => {
      google.maps.Geocoder.prototype.geocode = (
        _: google.maps.GeocoderRequest,
        callback: GeocoderCallback
      ): Promise<google.maps.GeocoderResponse> => {
        callback([], 'OK' as google.maps.GeocoderStatus)
        return Promise.resolve({
          results: [],
          status: google.maps.GeocoderStatus.OK,
        })
      }
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const result = await getGooglePlacesGeocode({
        componentRestrictions: {
          country: 'US',
        },
      })
      expect(errorSpy).toHaveBeenCalled()
      errorSpy.mockRestore()
      expect(result).toEqual([])
    })
  })

  describe.skip('getGooglePlacesGeocodeLatLng', () => {})
})
