interface TransformInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
}

export function TransformInput({ label, value, onChange, step = 0.1, min }: TransformInputProps) {
  return (
    <div>
      <label className="text-sm text-gray-400 block">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        step={step}
        min={min}
        className="w-full p-1 bg-gray-800 border border-gray-700 rounded text-gray-200"
      />
    </div>
  );
}