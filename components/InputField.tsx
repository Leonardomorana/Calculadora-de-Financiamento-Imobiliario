import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: React.ReactNode;
  suffix?: string;
  inputClassName?: string; // Prop para customizar estilo do input (ex: aumentar fonte)
}

const InputField: React.FC<InputFieldProps> = ({ label, icon, suffix, name, value, onChange, inputClassName, ...rest }) => {
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
          id={name}
          name={name}
          value={value}
          onChange={onChange}
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