import type { BookingServiceOption } from "@/domain/service";

export type BookingViewProps = { services: BookingServiceOption[] };
export type ServicePickerProps = {
  services: BookingServiceOption[];
  selectedIds: number[];
  onToggle: (id: number) => void;
};
export type BookingSummaryProps = {
  selected: BookingServiceOption[];
  onContinue?: () => void;
  selectedSlot?: string;
};
export type DatePickerProps = {
  value: string;
  min: string;
  max: string;
  onChange: (value: string) => void;
};
export type TimeSlotGridProps = {
  slots: string[];
  selected: string;
  loading: boolean;
  error: string;
  onSelect: (slot: string) => void;
};
