'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

interface IntegrationCardProps {
    logo: React.ReactNode;
    name: string;
    description: string;
    isConfigured: boolean;
    onConfigure: () => void;
    comingSoon?: boolean;
    proOnly?: boolean;
    userIsPro?: boolean;
}

export function IntegrationCard({
    logo,
    name,
    description,
    isConfigured,
    onConfigure,
    comingSoon = false,
    proOnly = false,
    userIsPro = true,
}: IntegrationCardProps) {
    const isLocked = proOnly && !userIsPro;

    return (
        <Card className={`flex flex-col transition-all duration-300 ${comingSoon ? 'opacity-70 grayscale' : isLocked ? 'opacity-80' : 'hover:shadow-md hover:-translate-y-0.5 hover:border-zinc-300 dark:hover:border-zinc-700'}`}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                {/* Logo */}
                <div className={`flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border flex items-center justify-center overflow-hidden p-3 shadow-inner transition-transform ${isLocked ? 'grayscale' : 'group-hover:scale-105'}`}>
                    {logo}
                </div>

                {/* Status Badge */}
                <div className="flex flex-col items-end gap-2">
                    {proOnly && (
                        <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-500 text-white border-0 shadow-sm text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider">
                            PRO
                        </Badge>
                    )}
                    {comingSoon ? (
                        <Badge className="bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 text-[10px] font-semibold px-2.5 py-1 uppercase tracking-wider">
                            Beta
                        </Badge>
                    ) : isConfigured ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/30 gap-1.5 text-xs font-medium px-2.5 py-1 shadow-sm">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Conectado
                        </Badge>
                    ) : (
                        <Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/30 gap-1.5 text-xs font-medium px-2.5 py-1 shadow-sm">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Inactivo
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="flex-1 pb-4">
                <CardTitle className="text-lg mb-1.5 tracking-tight flex items-center justify-between">
                    {name}
                </CardTitle>
                <CardDescription className="leading-relaxed line-clamp-3">{description}</CardDescription>
            </CardContent>

            <CardFooter className="pt-4 border-t border-border/50">
                {isConfigured || comingSoon || isLocked ? (
                    <Button
                        variant={isConfigured ? 'outline' : 'secondary'}
                        className={`w-full gap-2 transition-all active:scale-[0.98] h-12 rounded-xl text-base`}
                        onClick={onConfigure}
                        disabled={comingSoon || isLocked}
                    >
                        {isLocked ? 'Requiere Plan Pro' : comingSoon ? 'No disponible aún' : 'Configuración'}
                    </Button>
                ) : (
                    <PrimaryButton
                        className="w-full gap-2"
                        onClick={onConfigure}
                    >
                        Conectar cuenta
                        <ChevronRight className="w-4 h-4 ml-auto" />
                    </PrimaryButton>
                )}
            </CardFooter>
        </Card>
    );
}
