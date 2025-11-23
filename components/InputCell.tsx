import React from 'react';

interface InputCellProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string | number;
  onValueChange: (val: string) => void;
  className?: string;
  suffix?: string;
}

export const InputCell: React.FC<InputCellProps> = ({ 
  value, 
  onValueChange, 
  className = "", 
  suffix,
  ...props 
}) => {
  return (
    <div className="relative w-full h-full flex items-center group">
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className={`w-full h-full px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm ${className}`}
        {...props}
      />
      {suffix && <span className="absolute right-6 text-xs text-gray-400 pointer-events-none">{suffix}</span>}
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