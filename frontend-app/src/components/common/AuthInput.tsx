import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
    rightElement?: React.ReactNode;
}

export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
    ({ className, icon, rightElement, ...props }, ref) => {
        return (
            <div className="relative w-full">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                        {icon}
                    </div>
                )}
                <Input
                    ref={ref}
                    className={cn(
                        "h-12 rounded-xl border-zinc-200 dark:border-zinc-800 focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white bg-white dark:bg-zinc-900 shadow-sm transition-colors",
                        icon ? "pl-11" : "",
                        rightElement ? "pr-11" : "",
                        className
                    )}
                    {...props}
                />
                {rightElement && (
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400">
                        {rightElement}
                    </div>
                )}
            </div>
        )
    }
)
AuthInput.displayName = "AuthInput"
