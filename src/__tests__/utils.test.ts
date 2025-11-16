import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { debounce } from '../utils'

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

  describe.skip('flattenSuggestions', () => {})

  describe.skip('getGooglePlacesGeocode', () => {})

  describe.skip('getGooglePlacesGeocodeLatLng', () => {})
})
