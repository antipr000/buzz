import { useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import GooglePlacesTextInput, {
  type GooglePlacesTextInputRef,
  type Place,
} from 'react-native-google-places-textinput';

export type PickedLocation = {
  readonly address: string;
  readonly label: string;
  readonly latitude: number;
  readonly longitude: number;
};

type LocationFieldProps = {
  onLocationChange: (value: PickedLocation | null) => void;
  placeholder?: string;
};


// TODO: Before release — lock down EXPO_PUBLIC key in GCP (Android/iOS app restrictions, APIs = Places New only), budgets/alerts; proxy only if key must stay off-device.

function pickFromPlace(place: Place): PickedLocation | null {
  const d = place.details;
  if (!d || typeof d !== 'object') return null;
  const formattedAddress =
    typeof d.formattedAddress === 'string' && d.formattedAddress.length > 0
      ? d.formattedAddress
      : null;
  const loc = d.location as { latitude?: number; longitude?: number } | undefined;
  const lat = loc?.latitude;
  const lng = loc?.longitude;
  if (!formattedAddress || typeof lat !== 'number' || typeof lng !== 'number') return null;

  // Places docs: use structured main/secondary text for concise display labels.
  const mainText = place.structuredFormat?.mainText?.text?.trim();
  const secondaryCountry = place.structuredFormat?.secondaryText?.text
    ?.split(',')
    .at(-1)
    ?.trim();
  const shortLabel =
    [mainText, secondaryCountry].filter(Boolean).join(', ') ||
    formattedAddress.split(',')[0]?.trim() ||
    formattedAddress;

  return {
    address: formattedAddress,
    label: shortLabel,
    latitude: lat,
    longitude: lng,
  };
}

/**
 * Places autocomplete + details via [react-native-google-places-textinput](https://github.com/amitpdev/react-native-google-places-textinput)
 * (Places API New). Enable “Places API (New)” on the key in GCP.
 */
export function LocationField({ onLocationChange, placeholder }: LocationFieldProps) {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ?? '';
  const inputRef = useRef<GooglePlacesTextInputRef>(null);
  const textRef = useRef('');
  const hasCommittedPickRef = useRef(false);

  const invalidatePick = useCallback(() => {
    hasCommittedPickRef.current = false;
    onLocationChange(null);
  }, [onLocationChange]);

  const handleTextChange = useCallback(
    (text: string) => {
      textRef.current = text;
      invalidatePick();
    },
    [invalidatePick],
  );

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      if (hasCommittedPickRef.current) return;
      if (textRef.current.trim().length > 0) {
        inputRef.current?.clear();
        textRef.current = '';
      }
    }, 800);
  }, []);

  const handlePlaceSelect = useCallback(
    (place: Place) => {
      const picked = pickFromPlace(place);
      if (picked) {
        hasCommittedPickRef.current = true;
        onLocationChange(picked);
        textRef.current = place.structuredFormat.mainText.text;
      } else {
        hasCommittedPickRef.current = false;
        onLocationChange(null);
      }
    },
    [onLocationChange],
  );

  return (
    <View className="w-full">
      <GooglePlacesTextInput
        ref={inputRef}
        apiKey={apiKey}
        placeHolderText={placeholder ?? 'Where is your amazing event taking place?'}
        onPlaceSelect={handlePlaceSelect}
        onTextChange={handleTextChange}
        onBlur={handleBlur}
        fetchDetails
        detailsFields={['id', 'formattedAddress', 'location']}
        languageCode="en"
        includedRegionCodes={['in']}
        minCharsToFetch={2}
        debounceDelay={400}
        scrollEnabled={false}
        nestedScrollEnabled={false}
        style={{
          container: { width: '100%' },
          inputContainer: {
            borderWidth: 0,
            paddingHorizontal: 0,
            paddingVertical: 0,
            backgroundColor: 'transparent',
          },
          input: {
            backgroundColor: 'rgba(240,239,255,1)',
            height: 40,
            borderRadius: 8,
            paddingLeft: 36,
            paddingRight: 12,
            fontSize: 12,
          },
          suggestionsContainer: {
            maxHeight: 200,
            marginTop: 4,
            borderRadius: 8,
            backgroundColor: '#fff',
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: 'rgba(79, 70, 229, 0.2)',
          },
          suggestionText: {
            main: { fontSize: 12 },
            secondary: { fontSize: 11, color: '#666' },
          },
        }}
      />
    </View>
  );
}
