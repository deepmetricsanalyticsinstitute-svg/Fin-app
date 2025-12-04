import React from 'react';

interface Option {
  value: string | number;
  label: string;
}

interface SelectGroupProps {
  label: string;
  id: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  errorMessage?: string;
  icon?: React.ReactNode;
}

const SelectGroup: React.FC<SelectGroupProps> = ({
  label,
  id,
  value,
  onChange,
  options,
  errorMessage,
  icon,
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-gray-700 text-sm font-semibold mb-2">
        {label}
      </label>
      <div className="relative flex items-center">
        {icon && <div className="absolute left-3 text-gray-500 z-10">{icon}</div>}
        <select
          id={id}
          value={value}
          onChange={onChange}
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white ${
            errorMessage ? 'border-red-500' : 'border-gray-300'
          } ${icon ? 'pl-10' : ''}`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
      {errorMessage && (
        <p className="text-red-500 text-xs italic mt-1">{errorMessage}</p>
      )}
    </div>
  );
};

export default SelectGroup;
