interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

// Interruptor de 44 px de alto. El texto va aparte: acá solo el nombre accesible.
export function Toggle({ label, checked, onChange, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex h-11 w-14 shrink-0 items-center justify-center focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50"
    >
      <span
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-control"
        }`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-surface transition-[left] ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}
