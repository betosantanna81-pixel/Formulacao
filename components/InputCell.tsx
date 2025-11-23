import React, { useState, useEffect, FocusEvent, ChangeEvent } from 'react';

interface InputCellProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string | number;
  onValueChange: (val: string) => void;
  className?: string;
  suffix?: string;
  isDecimal?: boolean;
}

export const InputCell: React.FC<InputCellProps> = ({ 
  value, 
  onValueChange, 
  className = "", 
  suffix,
  isDecimal = false,
  ...props 
}) => {
  // Internal state for the text visible in the input
  const [localValue, setLocalValue] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);

  // Format a value (string or number) to pt-BR decimal format
  const formatDecimal = (val: string | number): string => {
    if (val === "" || val === undefined) return "";
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return "";
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Initialize or sync localValue from props
  useEffect(() => {
    if (!isFocused) {
      if (value === "" || value === undefined) {
        setLocalValue("");
      } else if (isDecimal) {
        setLocalValue(formatDecimal(value));
      } else {
        setLocalValue(value.toString());
      }
    }
  }, [value, isDecimal, isFocused]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val); // Update display immediately

    // Normalize comma to dot for calculation/state
    // Allow typical float chars: numbers, comma, dot, minus
    const normalized = val.replace(/\./g, '').replace(',', '.');
    
    // Only propagate if it's a valid partial number or empty
    // We just pass the normalized string up; parent uses parseFloat
    onValueChange(normalized);
  };

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (props.onFocus) props.onFocus(e);
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    // Re-format on blur
    if (isDecimal && localValue !== "") {
       // Parse current text to ensure valid number before formatting
       const normalized = localValue.replace(/\./g, '').replace(',', '.');
       const num = parseFloat(normalized);
       if (!isNaN(num)) {
         setLocalValue(num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
       }
    }
    if (props.onBlur) props.onBlur(e);
  };

  return (
    <div className="relative w-full h-full flex items-center group">
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`w-full h-full px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm ${className}`}
        {...props}
      />
      {suffix && <span className="absolute right-1 text-xs text-gray-400 pointer-events-none">{suffix}</span>}
    </div>
  );
};

export const TextCell: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { onValueChange: (v: string) => void }> = ({ 
  value, 
  onValueChange, 
  className = "", 
  ...props 
}) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className={`w-full h-full px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm ${className}`}
      {...props}
    />
  );
};