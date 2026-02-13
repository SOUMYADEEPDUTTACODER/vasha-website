
import { Github, Cloud } from "lucide-react"
import { Button } from "@/components/ui/button"

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
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
                        <Cloud className="h-4 w-4 text-accent" />
                        <span>Cloud Deployed</span>
                    </div>

                    <Button variant="ghost" size="sm" asChild className="hover:text-primary gap-2">
                        <a
                            href="https://github.com/SOUMYADEEPDUTTACODER/vasha-website.git"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2"
                        >
                            <Github className="h-5 w-5" />
                            <span>Source Code</span>
                        </a>
                    </Button>
                </div>
            </div>
        </footer>
    )
}
