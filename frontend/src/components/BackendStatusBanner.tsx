import { useState, useEffect } from "react";
import { asrService } from "@/services/asrService";
import { AlertCircle, ExternalLink, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const BackendStatusBanner = () => {
    const [isBackendDown, setIsBackendDown] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const isHealthy = await asrService.checkBackendHealth();
                setIsBackendDown(!isHealthy);
            } catch (error) {
                setIsBackendDown(true);
            }
        };

        // Initial check
        checkStatus();

        // Re-check periodically
        const interval = setInterval(checkStatus, 30000); // every 30 seconds

        return () => clearInterval(interval);
    }, []);

    if (!isBackendDown || !isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative overflow-hidden rounded-2xl bg-destructive/10 backdrop-blur-md border border-destructive/20 p-4 shadow-2xl md:p-6 max-w-4xl mx-auto">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-destructive/10 blur-3xl" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />

                <div className="relative flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20 text-destructive ring-8 ring-destructive/5">
                        <AlertCircle className="h-6 w-6" />
                    </div>

                    <div className="flex-grow text-center md:text-left">
                        <h3 className="text-lg font-bold text-foreground mb-1">Service Update</h3>
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                            Our backend service is temporarily down due to funding issues. But feel free to explore our website or use our local deployed software.
                        </p>
                    </div>

                    <div className="flex flex-shrink-0 gap-2 w-full md:w-auto mt-2 md:mt-0">
                        <button
                            onClick={() => setIsVisible(false)}
                            className="flex-1 md:flex-none inline-flex items-center justify-center rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground transition-all hover:bg-secondary/80 active:scale-95"
                        >
                            Dismiss
                        </button>
                        <a
                            href="https://github.com/deephabiswashi/Vasha-AI.git"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 md:flex-none inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-95 shadow-lg shadow-primary/25"
                        >
                            Local Version
                            <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                    </div>
                </div>

                {/* Close button for quick dismissal */}
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-2 right-2 p-1 rounded-full text-muted-foreground hover:bg-muted transition-colors md:hidden"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};
