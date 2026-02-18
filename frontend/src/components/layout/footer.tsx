
import { Youtube, Instagram, Twitter } from "lucide-react"

export function Footer() {
    return (
        <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-8 mt-20">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Vasha AI. All rights reserved.
                    </span>
                </div>

                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                        <a
                            href="https://youtube.com/@vasha_ai?si=XbuLmcYV6Vp37nnA"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Vasha AI YouTube"
                            className="flex items-center space-x-2 text-sm text-muted-foreground bg-accent/10 px-3 py-1 rounded-full border border-accent/20 hover:opacity-90"
                        >
                            <Youtube className="h-10 w-10 text-red-600" />
                        </a>

                        <a
                            href="https://www.instagram.com/vasha.ai?igsh=NG04bXh0OWx3cXg1"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Vasha AI Instagram"
                            className="flex items-center space-x-2 text-sm text-muted-foreground bg-accent/10 px-3 py-1 rounded-full border border-accent/20 hover:opacity-90"
                        >
                            <Instagram className="h-10 w-10 text-pink-500" />
                        </a>

                        <a
                            href="https://x.com/VashaAI"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Vasha AI X"
                            className="flex items-center space-x-2 text-sm text-muted-foreground bg-accent/10 px-3 py-1 rounded-full border border-accent/20 hover:opacity-90"
                        >
                            <Twitter className="h-10 w-10 text-sky-500" />
                        </a>
                    </div>

                </div>
            </div>
        </footer>
    )
}
