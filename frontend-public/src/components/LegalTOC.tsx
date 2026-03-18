'use client';

import { useState, useEffect } from 'react';

interface TOCItem {
    id: string;
    label: string;
}

export function LegalTOC({ items }: { items: TOCItem[] }) {
    const [activeId, setActiveId] = useState<string>('');

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                if (visible.length > 0) {
                    setActiveId(visible[0].target.id);
                }
            },
            { rootMargin: '-80px 0px -50% 0px' },
        );

        items.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [items]);

    return (
        <nav className="space-y-0.5">
            {items.map(({ id, label }, i) => (
                <a
                    key={id}
                    href={`#${id}`}
                    className={`flex items-baseline gap-2 py-1.5 px-2 rounded text-[11.5px] transition-colors group ${
                        activeId === id
                            ? 'text-white/75 bg-white/[0.06]'
                            : 'text-white/28 hover:text-white/55'
                    }`}
                >
                    <span className="text-[10px] tabular-nums text-white/20 shrink-0 group-hover:text-white/30 transition-colors">
                        {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="leading-snug">{label}</span>
                </a>
            ))}
        </nav>
    );
}
