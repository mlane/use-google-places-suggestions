import { vi } from 'vitest'

export const geocoderResultMock: google.maps.GeocoderResult = {
  address_components: [],
  formatted_address: 'FORMATTED_ADDRESS',
  geometry: {
    location: {
      equals: vi.fn(),
      lat: vi.fn(() => 0),
      lng: vi.fn(() => 0),
      toJSON: vi.fn(),
      toUrlValue: vi.fn(),
    },
    location_type: 'ROOFTOP' as google.maps.GeocoderLocationType,
    viewport: {
      contains: vi.fn(),
      extend: vi.fn(),
      equals: vi.fn(),
      getCenter: vi.fn(),
      getNorthEast: vi.fn(),
      getSouthWest: vi.fn(),
      intersects: vi.fn(),
      isEmpty: vi.fn(),
      toJSON: vi.fn(),
      toSpan: vi.fn(),
      toUrlValue: vi.fn(),
      union: vi.fn(),
    },
  },
  place_id: 'PLACE_ID',
  types: ['geocode'],
}
