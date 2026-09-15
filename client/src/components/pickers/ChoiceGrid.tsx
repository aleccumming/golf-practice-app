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
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 8 }}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              padding: "14px 8px",
              borderRadius: 10,
              border: active ? "2px solid #2f8f4e" : "1px solid #ccc",
              background: active ? "#e6f4ea" : "#fff",
              fontWeight: active ? 700 : 500,
              fontSize: 15,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
