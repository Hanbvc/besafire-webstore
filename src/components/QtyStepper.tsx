import { IconMinus, IconPlus } from './Icons';

interface QtyStepperProps {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
}

export function QtyStepper({ value, min = 1, max, onChange, label }: QtyStepperProps) {
  return (
    <div className="qty" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Kurangi jumlah">
        <IconMinus width={16} height={16} />
      </button>
      <output aria-live="polite">{value}</output>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Tambah jumlah">
        <IconPlus width={16} height={16} />
      </button>
    </div>
  );
}
