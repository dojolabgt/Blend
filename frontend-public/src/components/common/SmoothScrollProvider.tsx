"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            touchMultiplier: 1.5,
        });

        lenisRef.current = lenis;

        // Handle anchor links — lenis needs to know about hash changes
        function onHashChange() {
            const hash = window.location.hash;
            if (hash) {
                const target = document.querySelector(hash);
                if (target) lenis.scrollTo(target as HTMLElement, { offset: -72 });
            }
        }

        window.addEventListener("hashchange", onHashChange);

        // Intercept clicks on anchor links so lenis handles them smoothly
        function onClick(e: MouseEvent) {
            const anchor = (e.target as HTMLElement).closest("a[href^='#']");
            if (!anchor) return;
            const href = anchor.getAttribute("href");
            if (!href) return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                lenis.scrollTo(target as HTMLElement, { offset: -72 });
                // update URL without triggering a scroll jump
                history.pushState(null, "", href);
            }
        }

        document.addEventListener("click", onClick);

        // RAF loop
        let rafId: number;
        function raf(time: number) {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }
        rafId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener("hashchange", onHashChange);
            document.removeEventListener("click", onClick);
            lenis.destroy();
        };
    }, []);

    return <>{children}</>;
}
