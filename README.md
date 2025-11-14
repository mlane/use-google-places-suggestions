# use-google-places-suggestions

[![version](https://img.shields.io/npm/v/use-google-places-suggestions?style=flat-square)](https://www.npmjs.com/package/use-google-places-suggestions)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/use-google-places-suggestions)](https://bundlephobia.com/package/use-google-places-suggestions)
![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)

A lightweight, zero-dependency React hook for Google Places Autocomplete using the modern [**AutocompleteSuggestion API**](https://developers.google.com/maps/documentation/javascript/reference/autocomplete-data#AutocompleteSuggestion). It handles talking to Google, debouncing, and `sessionStorage` caching; your UI and state stay in your app. Inspired by [`use-places-autocomplete`](https://github.com/wellyshen/use-places-autocomplete), but deliberately UI-agnostic.

```bash
npm install use-google-places-suggestions
```

You are responsible for loading the Google Maps JavaScript API with Places and `AutocompleteSuggestion` before using this hook.

Automated tests are currently in progress and will be added in an upcoming release.

## How it works

You pass a controlled `value` string into the hook (plus optional `cacheExpiration`, `cacheKey`, and `config`). The hook waits for `window.google.maps.places.AutocompleteSuggestion`, debounces calls to `fetchAutocompleteSuggestions`, caches results per lowercased query in `sessionStorage`, and returns `isLoading`, `onClear`, `onSelectPrediction`, and `predictions` for you to wire into your UI.

`cacheKey`, `cacheExpiration`, and `config` are expected to be stable per hook instance. If you need different settings (e.g. domestic vs international), use separate `useGooglePlacesSuggestions` instances rather than changing options dynamically.

```tsx
import { useState } from 'react'
import {
  getGooglePlacesGeocode,
  getGooglePlacesGeocodeLatLng,
  useGooglePlacesSuggestions,
} from 'use-google-places-suggestions'

export const Geocoder = () => {
  const [value, setValue] = useState('')
  const { isLoading, onClear, onSelectPrediction, predictions } =
    useGooglePlacesSuggestions({
      value,
      // cacheExpiration: 24 * 60 * 60, // optional (seconds, default 24h)
      // cacheKey: 'ugps',              // optional
      // config: { types: ['address'] } // optional AutocompleteRequest options
    })

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedValue = event.currentTarget.value
    setValue(updatedValue)

    if (!updatedValue.trim()) onClear()
  }

  const onClick = (
    prediction: google.maps.places.AutocompleteSuggestion['placePrediction']
  ) => {
    onSelectPrediction(prediction)

    if (!prediction?.text?.text) return

    /**
     * Gets the geocoder result from a Google Places geocoder request.
     * @param request - The geocoder request.
     * @returns The geocoder result.
     * @see https://developers.google.com/maps/documentation/javascript/geocoding
     */
    getGooglePlacesGeocode({
      address: prediction?.text?.text,
    }).then(results => {
      const first = results?.[0]

      if (!first) return

      /**
       * Gets the latitude and longitude from a Google Places geocoder result.
       * @param result - The geocoder result.
       * @returns The latitude and longitude as a LatLngLiteral.
       */
      const latLng = getGooglePlacesGeocodeLatLng(first)
    })
  }

  return (
    <div>
      <input
        disabled={isLoading}
        type='text'
        value={value}
        onChange={onChange}
        placeholder={isLoading ? 'Loading Places…' : 'Search an address'}
      />

      {predictions?.map(prediction => (
        <button
          key={prediction?.placeId}
          type='button'
          onClick={() => onClick(prediction)}
        >
          {prediction?.text?.text}
        </button>
      ))}
    </div>
  )
}
```

## Contributors

Issues and small, focused PRs are welcome, especially around the [AutocompleteSuggestion flow](https://developers.google.com/maps/documentation/javascript/reference/autocomplete-data#AutocompleteSuggestion), caching, or geocoding helpers.

## License

[MIT](./LICENSE)
