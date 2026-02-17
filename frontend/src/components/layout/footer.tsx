
import { Cloud } from "lucide-react"

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


                </div>
            </div>
        </footer>
    )
}
