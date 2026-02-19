import React from 'react';
import { twMerge } from 'tailwind-merge';

const Input = ({ label, error, className, id, icon, ...props }) => {
    return (
        <div className="space-y-1.5 w-full text-left">
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                        {icon}
                    </div>
                )}
                <input
                    id={id}
                    className={twMerge(
                        "input-standard",
                        icon ? "pl-10" : "",
                        error ? "border-red-500 focus:ring-red-500" : "border-gray-200",
                        className
                    )}
                    {...props}
                />
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
};

export default Input;
