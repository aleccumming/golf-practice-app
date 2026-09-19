export interface ChoiceOption<T extends string> {
  value: T;
  label: string;
}

export function ChoiceGrid<T extends string>({
  options,
  value,
  onChange,
  columns = 4,
}: {
  options: ChoiceOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  columns?: number;
}) {
  return (
    <div className="chip-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`chip${value === opt.value ? " is-active" : ""}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
