import React from 'react';

export function Card({ children, className = '' }) {
  return <div className={`bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition-colors ${className}`}>{children}</div>;
}

export function CardHeader({ children, className = '' }) {
  return <div className={`p-5 pb-3 flex justify-between items-center ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }) {
  return <h3 className={`text-base font-semibold text-gray-900 dark:text-white ${className}`}>{children}</h3>;
}

export function CardContent({ children, className = '' }) {
  return <div className={`p-5 pt-0 ${className}`}>{children}</div>;
}
