import React, { useState, useEffect, useRef } from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: React.ReactNode;
  suffix?: string;
  inputClassName?: string; // Prop para customizar estilo do input (ex: aumentar fonte)
}

const stripLeadingZeros = (val: string): string => val.replace(/^0+(?=\d)/, '');

const InputField: React.FC<InputFieldProps> = ({
  label,
  icon,
  suffix,
  name,
  value,
  onChange,
  onFocus,
  onBlur,
  onKeyUp,
  inputClassName,
  type,
  ...rest
}) => {
  const isNumberInput = type === 'number';
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState<string>(() =>
    value === undefined || value === null ? '' : String(value)
  );

  useEffect(() => {
    if (!isNumberInput) return;

    const propStr = value === undefined || value === null ? '' : String(value);

    if (!isFocused) {
      setDisplayValue(propStr);
    } else {
      const numericDisplay = displayValue === '' ? 0 : parseFloat(displayValue);
      const numericProp = typeof value === 'number' ? value : parseFloat(propStr || '0');
      const isEmptyZero = displayValue === '' && numericProp === 0;

      if (!isEmptyZero && !Number.isNaN(numericProp) && numericDisplay !== numericProp) {
        setDisplayValue(propStr);
      }
    }
  }, [value, isFocused, isNumberInput]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isNumberInput) {
      const raw = e.target.value;
      const cleaned = stripLeadingZeros(raw);

      if (cleaned !== raw) {
        e.target.value = cleaned;
      }

      setDisplayValue(cleaned);
    }

    onChange?.(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);

    if (isNumberInput) {
      const domVal = e.currentTarget.value;
      if (domVal === '') {
        const fallbackStr = value === undefined || value === null ? '0' : String(value);
        setDisplayValue(fallbackStr);
      } else {
        const cleaned = stripLeadingZeros(domVal);
        if (cleaned !== domVal) {
          e.currentTarget.value = cleaned;
        }
        setDisplayValue(cleaned);
      }
    }

    onBlur?.(e);
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isNumberInput) {
      const domVal = e.currentTarget.value;
      const cleaned = stripLeadingZeros(domVal);
      if (cleaned !== domVal) {
        e.currentTarget.value = cleaned;
        setDisplayValue(cleaned);
      }
    }

    onKeyUp?.(e);
  };

  return (
    <div>
      <label htmlFor={name} className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="relative group">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-focus-within:text-brand-primary transition-colors">
          {icon}
        </div>
        <input
          ref={inputRef}
          id={name}
          name={name}
          type={type}
          value={isNumberInput ? displayValue : value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyUp={handleKeyUp}
          className={`block w-full rounded-xl border-slate-200 bg-slate-50/50 pl-10 ${suffix ? 'pr-12' : ''} py-3 text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-brand-accent focus:bg-white focus:ring-2 focus:ring-brand-accent/20 sm:text-sm transition-all font-medium ${inputClassName || ''}`}
          {...rest}
        />
        {suffix && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-slate-400 text-xs font-semibold bg-slate-100 px-1.5 py-0.5 rounded">{suffix}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputField;