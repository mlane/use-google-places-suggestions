/**
 * Debounces a function call.
 * @param callback - The function to debounce.
 * @param duration - The duration in milliseconds to debounce the function.
 * @returns A debounced function that can be cancelled.
 */
const debounce = <T>(
  callback: (props: T) => void,
  duration = 0
): ((props: T) => void) & {
  cancel: VoidFunction
} => {
  let timer: ReturnType<typeof setTimeout>
  const debounced = (props: T) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      callback(props)
    }, duration)
  }
  debounced.cancel = () => clearTimeout(timer)
  return debounced
}

/**
 * Flattens suggestions by converting all FormattableText fields into plain
 * JSON-friendly objects to ensure they are safe for caching and rehydration.
 * @param suggestions - The suggestions to flatten.
 * @returns The flattened suggestions.
 */
const flattenSuggestions = (
  suggestions: google.maps.places.AutocompleteSuggestion[]
) =>
  suggestions?.reduce<
    google.maps.places.AutocompleteSuggestion['placePrediction'][]
  >((total, current) => {
    if (current?.placePrediction) {
      const placePrediction: google.maps.places.AutocompleteSuggestion['placePrediction'] =
        {
          distanceMeters: current?.placePrediction?.distanceMeters,
          placeId: current?.placePrediction?.placeId,
          mainText: current?.placePrediction?.mainText,
          secondaryText: current?.placePrediction?.secondaryText,
          text: current?.placePrediction?.text,
          toPlace: current?.placePrediction?.toPlace,
          types: current?.placePrediction?.types,
        }

      if (placePrediction?.mainText?.text) {
        placePrediction.mainText = {
          matches: [],
          text: placePrediction?.mainText?.text,
        }
      }

      if (placePrediction?.secondaryText?.text) {
        placePrediction.secondaryText = {
          matches: [],
          text: placePrediction?.secondaryText?.text,
        }
      }

      if (placePrediction?.text?.text) {
        placePrediction.text = {
          matches: [],
          text: placePrediction?.text?.text,
        }
      }

      total.push(placePrediction)
    }

    return total
  }, [])

/**
 * Gets the geocoder result from a Google Places geocoder request.
 * @param request - The geocoder request.
 * @returns The geocoder result.
 * @see https://developers.google.com/maps/documentation/javascript/geocoding
 */
const getGooglePlacesGeocode = (
  request: google.maps.GeocoderRequest
): Promise<google.maps.GeocoderResult[]> => {
  const geocoder = new google.maps.Geocoder()
  return new Promise((resolve, reject) => {
    geocoder.geocode(request, (results, status) => {
      if (status !== 'OK') reject(status)

      if (!request?.address && request?.componentRestrictions) {
        console.error(
          'Please provide an address when using getGooglePlacesGeocode() with the componentRestrictions.'
        )
      }

      resolve(results ?? [])
    })
  })
}

/**
 * Gets the latitude and longitude from a Google Places geocoder result.
 * @param result - The geocoder result.
 * @returns The latitude and longitude as a LatLngLiteral.
 */
const getGooglePlacesGeocodeLatLng = (
  result: google.maps.GeocoderResult
): google.maps.LatLngLiteral => {
  const { lat, lng } = result?.geometry.location ?? {}
  return {
    lat: lat(),
    lng: lng(),
  }
}

export {
  debounce,
  flattenSuggestions,
  getGooglePlacesGeocode,
  getGooglePlacesGeocodeLatLng,
}
