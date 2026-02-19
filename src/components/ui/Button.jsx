import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Link } from 'react-router-dom';

const Button = ({ className, variant = 'primary', size = 'md', to, href, children, ...props }) => {
    const variants = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        outline: 'btn-outline',
        ghost: 'text-gray-500 hover:bg-gray-100 px-4 py-2 rounded-md transition-all',
    };

    const sizes = {
        sm: 'text-xs py-1.5 px-3',
        md: 'text-sm py-2 px-4',
        lg: 'text-base py-3 px-6 font-semibold',
    };

    const classes = twMerge(variants[variant], sizes[size], className);

    if (to) {
        return (
            <Link to={to} className={classes} {...props}>
                {children}
            </Link>
        );
    }

    if (href) {
        return (
            <a href={href} className={classes} {...props}>
                {children}
            </a>
        );
    }

    return (
        <button
            className={classes}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
