import { useCallback } from 'react';

import { Input } from '@/components/ui/input';

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

/** Web: plain input so the screen stays usable without a Places proxy; no coordinates until a later phase. */
export function LocationField({ onLocationChange, placeholder }: LocationFieldProps) {
  const onChangeText = useCallback(() => {
    onLocationChange(null);
  }, [onLocationChange]);

  return (
    <Input
      placeholder={placeholder ?? 'Where is your amazing event taking place?'}
      className="border-0 placeholder:text-xs bg-[rgba(240,239,255,1)] pl-9 text-xs"
      onChangeText={onChangeText}
    />
  );
}
