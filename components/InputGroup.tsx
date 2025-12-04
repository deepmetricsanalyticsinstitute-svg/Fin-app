import React from 'react';

interface InputGroupProps {
  label: string;
  id: string;
  type: 'number' | 'text';
  value: number | string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: number;
  step?: string;
  placeholder?: string;
  errorMessage?: string;
  icon?: React.ReactNode;
}

const InputGroup: React.FC<InputGroupProps> = ({
  label,
  id,
  type,
  value,
  onChange,
  min,
  step,
  placeholder,
  errorMessage,
  icon,
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-gray-700 text-sm font-semibold mb-2">
        {label}
      </label>
      <div className="relative flex items-center">
        {icon && <div className="absolute left-3 text-gray-500">{icon}</div>}
        <input
          type={type}
          id={id}
          value={value}
          onChange={onChange}
          min={min}
          step={step}
          placeholder={placeholder}
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 ${
            errorMessage ? 'border-red-500' : 'border-gray-300'
          } ${icon ? 'pl-10' : ''}`}
        />
      </div>
      {errorMessage && (
        <p className="text-red-500 text-xs italic mt-1">{errorMessage}</p>
      )}
    </div>
  );
};

export default InputGroup;
