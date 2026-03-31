import * as React from "react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={`flex h-10 w-full rounded-md border border-[#77C7EC]/40 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-[#143A82] dark:text-white shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#3E91DE]/50 dark:placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3E91DE] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
