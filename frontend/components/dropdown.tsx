'use client';

import { useState, useRef, useEffect, ReactNode, KeyboardEvent } from 'react';
import { FiChevronDown } from 'react-icons/fi';

export type DropdownOption = string | { label: string; value: string };

interface DropdownProps {
    options: DropdownOption[];
    value: string;
    icon?: ReactNode;
    onChange: (val: string) => void;
    maxVisible?: number;
    placeholder: string;
    label: string;
}

export default function Dropdown({
    options,
    value,
    icon,
    onChange,
    maxVisible = 5,
    placeholder,
    label,
}: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const optionsRef = useRef<(HTMLDivElement | null)[]>([]);

    const itemHeight = 44;
    const maxHeight = maxVisible * itemHeight;

    const selectedOption = options.find((opt) => {
        const optVal = typeof opt === 'string' ? opt : opt.value;
        return optVal === value;
    });

    const displayValue = selectedOption
        ? typeof selectedOption === 'string'
            ? selectedOption
            : selectedOption.label
        : '';

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setHighlightedIndex(-1);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reset highlighted index when options change
    useEffect(() => {
        setHighlightedIndex(-1);
    }, [options]);

    const handleTriggerKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (isOpen) {
                // If a highlighted option exists, select it
                if (highlightedIndex >= 0 && highlightedIndex < options.length) {
                    const opt = options[highlightedIndex];
                    const optValue = typeof opt === 'string' ? opt : opt.value;
                    selectOption(optValue);
                } else {
                    // No highlighted option → just close the dropdown
                    setIsOpen(false);
                    setHighlightedIndex(-1);
                }
            } else {
                // Open the dropdown and highlight the first option
                setIsOpen(true);
                setHighlightedIndex(0);
            }
            return;
        }

        // Arrow Up / Down
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            if (!isOpen) {
                setIsOpen(true);
                const firstIndex = e.key === 'ArrowDown' ? 0 : options.length - 1;
                setHighlightedIndex(firstIndex);
            } else {
                const direction = e.key === 'ArrowDown' ? 1 : -1;
                setHighlightedIndex((prev) => {
                    const newIndex = prev + direction;
                    if (newIndex < 0) return options.length - 1;
                    if (newIndex >= options.length) return 0;
                    return newIndex;
                });
            }
            return;
        }

        if (e.key === 'Escape') {
            setIsOpen(false);
            setHighlightedIndex(-1);
            triggerRef.current?.focus();
        }
    };

    const handleOptionKeyDown = (e: KeyboardEvent<HTMLDivElement>, index: number) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const opt = options[index];
            const optValue = typeof opt === 'string' ? opt : opt.value;
            onChange(optValue);
            setIsOpen(false);
            setHighlightedIndex(-1);
            triggerRef.current?.focus();
        }
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const direction = e.key === 'ArrowDown' ? 1 : -1;
            setHighlightedIndex((prev) => {
                const newIndex = prev + direction;
                if (newIndex < 0) return options.length - 1;
                if (newIndex >= options.length) return 0;
                return newIndex;
            });
        }
        if (e.key === 'Escape') {
            setIsOpen(false);
            setHighlightedIndex(-1);
            triggerRef.current?.focus();
        }
        if (e.key === 'Tab') {
            setIsOpen(false);
            setHighlightedIndex(-1);
        }
    };

    // Scroll highlighted option into view
    useEffect(() => {
        if (highlightedIndex >= 0 && optionsRef.current[highlightedIndex]) {
            optionsRef.current[highlightedIndex]?.scrollIntoView({
                block: 'nearest',
            });
        }
    }, [highlightedIndex]);

    const selectOption = (optValue: string) => {
        onChange(optValue);
        setIsOpen(false);
        setHighlightedIndex(-1);
        triggerRef.current?.focus();
    };

    return (
        <div className="relative w-full flex flex-col gap-1" ref={dropdownRef}>
            <label className="text-sm font-bold uppercase tracking-wide text-(--color-text) flex gap-2 items-center">
                {icon && icon}
                {label}
            </label>

            {/* Trigger */}
            <div
                ref={triggerRef}
                tabIndex={0}
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-label={label}
                onClick={() => {
                    setIsOpen((prev) => !prev);
                    if (!isOpen) setTimeout(() => setHighlightedIndex(0), 0);
                    else setHighlightedIndex(-1);
                }}
                onKeyDown={handleTriggerKeyDown}
                className={`w-full border-2 border-(--color-text) p-3 text-sm font-semibold bg-(--color-surface) text-(--color-text) cursor-pointer flex justify-between items-center transition-all focus:outline-none focus:shadow-[2px_2px_0_0_var(--color-text)] hover:shadow-[2px_2px_0_0_var(--color-text)] ${isOpen ? 'shadow-[2px_2px_0_0_var(--color-text)]' : ''
                    }`}
            >
                <span className={`text-xs sm:text-sm ${value ? 'text-(--color-text)' : 'text-gray-400'}`}>
                    {displayValue || placeholder}
                </span>
                <FiChevronDown
                    className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    size={18}
                />
            </div>

            {/* Options list */}
            {isOpen && (
                <div
                    className="absolute top-full left-0 w-full bg-(--color-light) border-2 border-(--color-text) mt-1 z-50 overflow-y-auto custom-scrollbar shadow-[4px_4px_0_0_var(--color-text)]"
                    style={{ maxHeight: `${maxHeight}px` }}
                    role="listbox"
                >
                    {options.length > 0 ? (
                        options.map((opt, idx) => {
                            const optLabel = typeof opt === 'string' ? opt : opt.label;
                            const optValue = typeof opt === 'string' ? opt : opt.value;
                            const isHighlighted = highlightedIndex === idx;
                            const isSelected = value === optValue;

                            return (
                                <div
                                    key={idx}
                                    ref={(el) => { optionsRef.current[idx] = el; }}
                                    role="option"
                                    aria-selected={isSelected}
                                    tabIndex={-1}
                                    onClick={() => selectOption(optValue)}
                                    onKeyDown={(e) => handleOptionKeyDown(e, idx)}
                                    className={`p-3 text-sm font-semibold cursor-pointer transition-colors border-b-2 border-b-gray-100 last:border-b-0 ${isSelected
                                            ? 'bg-(--color-text) text-(--color-light)'
                                            : isHighlighted
                                                ? 'bg-gray-100 text-(--color-text)'
                                                : 'hover:bg-gray-100 text-(--color-text)'
                                        }`}
                                    style={{
                                        height: `${itemHeight}px`,
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    {optLabel}
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-3 text-sm text-gray-400">No options available</div>
                    )}
                </div>
            )}
        </div>
    );
}