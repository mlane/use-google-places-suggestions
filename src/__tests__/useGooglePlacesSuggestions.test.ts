// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react'
import { describe, test, expect, vi, afterEach, beforeEach } from 'vitest'
import { useGooglePlacesSuggestions } from '../useGooglePlacesSuggestions'
import { placePredictionMock } from './__mocks__/placePredictionMock'

const sessionStorageItemData = [JSON.parse(JSON.stringify(placePredictionMock))]

describe('useGooglePlacesSuggestions', () => {
  afterEach(() => {
    vi.resetAllMocks()
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('google', {
      maps: {
        places: {
          AutocompleteSuggestion: class {
            static fetchAutocompleteSuggestions = {}
          },
        },
      },
    })
  })

  test('should set isLoading to false once AutocompleteSuggestion becomes available', () => {
    const { result } = renderHook(() =>
      useGooglePlacesSuggestions({
        value: '',
      })
    )
    expect(result.current.isLoading).toBe(true)
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current.isLoading).toBe(false)
  })

  test('should clear predictions when calling onClear', () => {
    const { result } = renderHook(() =>
      useGooglePlacesSuggestions({
        value: '',
      })
    )
    act(() => {
      result.current.onClear()
    })
    expect(result.current.predictions).toEqual([])
  })

  test('should return the selected prediction and clear the list', () => {
    const { result } = renderHook(() =>
      useGooglePlacesSuggestions({
        value: '',
      })
    )
    expect(result.current.predictions).toEqual([])
    act(() => {
      result.current.onSelectPrediction(placePredictionMock)
    })
    expect(result.current.onSelectPrediction(placePredictionMock)).toEqual(
      placePredictionMock
    )
  })

  test('should trigger a debounced search when value changes', async () => {
    sessionStorage.clear()
    sessionStorage.setItem('ugps', '{}')
    google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions = vi
      .fn()
      .mockResolvedValue({
        suggestions: [
          {
            placePrediction: placePredictionMock,
          },
        ],
      })
    const { result, rerender } = renderHook(
      ({ value }) =>
        useGooglePlacesSuggestions({
          value,
        }),
      {
        initialProps: {
          value: '',
        },
      }
    )
    rerender({
      value: 'VALUE',
    })
    await act(async () => {
      vi.advanceTimersByTime(300)
    })
    expect(
      google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions
    ).toHaveBeenCalled()
    expect(result.current.predictions).toMatchObject([placePredictionMock])
    expect(JSON.parse(sessionStorage.getItem('ugps')!)).toMatchObject({
      value: {
        data: sessionStorageItemData,
      },
    })
  })

  test('should read from sessionStorage when a cached result exists', async () => {
    sessionStorage.setItem(
      'ugps',
      JSON.stringify({
        value: {
          data: sessionStorageItemData,
          maxAge: Date.now() + 24 * 60 * 60 * 1000,
        },
      })
    )
    const { result } = renderHook(() =>
      useGooglePlacesSuggestions({
        value: 'VALUE',
      })
    )
    await act(async () => {
      vi.advanceTimersByTime(300)
    })
    expect(result.current.predictions).toMatchObject(sessionStorageItemData)
  })
})
