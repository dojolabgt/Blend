import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const PrimaryButton = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
    ({ className, children, ...props }, ref) => {
        return (
            <Button
                ref={ref}
                className={cn(
                    "h-12 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white shadow-md transition-all font-medium text-base",
                    className
                )}
                {...props}
            >
                {children}
            </Button>
        )
    }
)
PrimaryButton.displayName = "PrimaryButton"
