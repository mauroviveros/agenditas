import { useId } from "react";
import { TIME_OPTIONS } from "../lib/schedule";

interface TimeSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function TimeSelect({ label, value, onChange }: TimeSelectProps) {
  const id = useId();
  return (
    <div className="flex-1">
      <label htmlFor={id} className="mb-1 block text-xs font-semibold">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-md border border-control bg-surface px-3 font-mono text-base focus-visible:outline-2 focus-visible:outline-primary"
      >
        {TIME_OPTIONS.map((time) => (
          <option key={time} value={time}>
            {time}
          </option>
        ))}
      </select>
    </div>
  );
}
