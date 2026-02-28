import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SocialButtonProps extends React.ComponentProps<typeof Button> {
    icon: React.ReactNode;
}

export const SocialButton = React.forwardRef<HTMLButtonElement, SocialButtonProps>(
    ({ className, children, icon, ...props }, ref) => {
        return (
            <Button
                ref={ref}
                variant="outline"
                className={cn(
                    "w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 shadow-sm font-semibold text-zinc-700 dark:text-zinc-300",
                    className
                )}
                {...props}
            >
                <span className="mr-2 flex items-center justify-center">{icon}</span>
                {children}
            </Button>
        )
    }
)
SocialButton.displayName = "SocialButton"
