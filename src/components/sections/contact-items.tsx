
'use client';

import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContactKey } from "./contact";
import { getLink, getLabel, getActionText } from "./contact";

type ContactItemsProps = {
    availableContacts: [ContactKey, string][];
    iconMap: Record<ContactKey, React.ReactElement>;
}

export default function ContactItems({ availableContacts, iconMap }: ContactItemsProps) {
    const handleContactClick = (key: ContactKey, value: string) => {
        const url = getLink(key, value);
        if (url !== '#') {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    }

    return (
        <>
            {availableContacts.map(([key, value], index) => (
                <div
                    key={key}
                    onClick={() => handleContactClick(key, value)}
                    className={cn(
                        "group flex items-center justify-between p-6 transition-colors hover:bg-muted/50 cursor-pointer",
                        index === 0 && "rounded-t-xl",
                        index === availableContacts.length - 1 && "rounded-b-xl"
                    )}
                >
                    <div className="flex items-center gap-4">
                        {iconMap[key]}
                        <div>
                            <p className="font-semibold text-lg capitalize">{key}</p>
                            <p className="text-sm text-muted-foreground">{getLabel(key, value)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <span className="text-sm font-medium">{getActionText(key)}</span>
                        <ArrowRight className="h-4 w-4" />
                    </div>
                </div>
            ))}
        </>
    )
}
