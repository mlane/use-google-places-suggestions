import { vi } from 'vitest'

export const placePredictionMock: google.maps.places.AutocompleteSuggestion['placePrediction'] =
  {
    distanceMeters: 0,
    mainText: {
      matches: [],
      text: 'MAIN_TEXT',
    },
    placeId: 'PLACE_ID',
    secondaryText: {
      matches: [],
      text: 'SECONDARY_TEXT',
    },
    text: {
      matches: [],
      text: 'TEXT',
    },
    toPlace: vi.fn(() => ({
      fetchFields: vi.fn(),
      getNextOpeningTime: vi.fn(),
      id: 'ID',
      isOpen: vi.fn(),
      toJSON: vi.fn(),
    })),
    types: ['geocode'],
  }
