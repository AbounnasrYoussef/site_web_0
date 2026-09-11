'use client';

import { useId, ChangeEvent } from 'react';

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  id?: string;
  statusLabel?: string;
  statusEnabled?: string;
  statusDisabled?: string; 
  statusClassName?: string;
  title?: string; 
}

export default function ToggleSwitch({
  label,
  checked,
  onChange,
  disabled = false,
  id: externalId,
  statusLabel,
  statusEnabled,
  statusDisabled,
  statusClassName = '',
  title,
}: ToggleSwitchProps) {
  const switchId = externalId || useId();

  return (
    <div className="flex flex-col w-full gap-1">
      <div className="flex items-center justify-between w-full gap-4">
        <div className='flex flex-col'>
          <label
            htmlFor={switchId}
            className="flex-1 text-sm font-medium cursor-pointer select-none text-(--color-text)"
            title={title}
          >
            {label}
            {statusLabel && (
              <div className={`flex items-center gap-1 text-xs text-(--color-muted) ${statusClassName}`}>
                <span>{statusLabel}</span>
                <span
                  className={`font-semibold ${
                    checked ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {checked ? statusEnabled : statusDisabled}
                </span>
              </div>
            )}
          </label>


        </div>

        <div className="relative flex items-center">
          <input
            id={switchId}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="peer appearance-none w-10 h-6 bg-gray-200 border-2 border-black rounded-sm checked:bg-[#454545] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="absolute left-1 top-1 w-4 h-4 bg-(--color-light) border-2 border-black transition-all peer-checked:translate-x-4 peer-checked:bg-black peer-checked:border-(--color-light) pointer-events-none" />
        </div>
      </div>
    </div>
  );
}