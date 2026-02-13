
import { Link } from "react-router-dom"
import { ArrowLeft, Chrome, Server, Laptop, ChevronRight, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/layout/header"

export default function ChromeExtension() {
    const manualSteps = [
        {
            title: "Extension Overview",
            description: "Allow Vasha AI to capture audio from your active tab.",
            image: "/chromextension1.jpeg",
        },
        {
            title: "Active Recording",
            description: "The extension captures audio in real-time for processing.",
            image: "/chromextension2.jpeg",
        },
        {
            title: "Audio Processing",
            description: "Visual indicator showing that audio is being streamed and processed.",
            image: "/chromextension3.jpeg",
        },
        {
            title: "Translation Output",
            description: "View the translated text and hear the audio playback.",
            image: "/chromextension4.jpeg",
        },
    ]

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto px-4 py-12">
                {/* Header Section */}
                <div className="mb-12">
                    <Button variant="ghost" asChild className="mb-6 hover:bg-transparent p-0">
                        <Link to="/" className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Home</span>
                        </Link>
                    </Button>

                    <div className="flex items-center space-x-4 mb-6">
                        <div className="h-16 w-16 gradient-primary rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
                            <Chrome className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                                Chrome Extension
                            </h1>
                            <p className="text-xl text-muted-foreground mt-2">
                                Real-time audio translation directly in your browser
                            </p>
                        </div>
                    </div>
                </div>

                {/* Technical Architecture Section */}
                <div className="grid md:grid-cols-2 gap-8 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Laptop className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle className="text-2xl">Client (Browser Extension)</CardTitle>
                            </div>
                            <CardDescription>
                                Handles audio capture and playback within the browser environment
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-4">
                                {[
                                    "Captures audio via chrome.tabCapture or navigator.mediaDevices",
                                    "Uses an Offscreen Document (Web Audio API / AudioWorklet) to process raw PCM data",
                                    "Streams audio chunks via Wi-Fi/Localhost to the Python backend (WebSocket/REST)",
                                    "Receives and plays back the translated audio and displays text"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start space-x-3">
                                        <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                        <span className="text-foreground/80">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="p-2 bg-accent/10 rounded-lg">
                                    <Server className="h-6 w-6 text-accent" />
                                </div>
                                <CardTitle className="text-2xl">Server (Python Flask)</CardTitle>
                            </div>
                            <CardDescription>
                                Processes audio streams and manages AI models
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-4">
                                <li className="flex items-start space-x-3">
                                    <ChevronRight className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-semibold block">API Gateway</span>
                                        <span className="text-foreground/80">Flask application handling REST (/transcribe_translate) and WebSocket (/stream_audio) requests.</span>
                                    </div>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <ChevronRight className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-semibold block">Model Manager</span>
                                        <span className="text-foreground/80">Lazy-loading system for heavy AI models to optimize VRAM usage.</span>
                                    </div>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <ChevronRight className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-semibold block">GPU Lock</span>
                                        <span className="text-foreground/80">Thread-safe management of CUDA resources (threading.Lock) to prevent concurrent execution crashes.</span>
                                    </div>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* User Manual Section */}
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    <div className="flex items-center space-x-3 mb-6">
                        <BookOpen className="h-8 w-8 text-primary" />
                        <h2 className="text-3xl font-bold">User Manual</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {manualSteps.map((step, idx) => (
                            <Card key={idx} className="overflow-hidden border-border/50 hover:border-primary/50 transition-colors duration-300 group">
                                <div className="relative aspect-video bg-muted overflow-hidden">
                                    <img
                                        src={step.image}
                                        alt={step.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-3">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                                            {idx + 1}
                                        </span>
                                        <span>{step.title}</span>
                                    </CardTitle>
                                    <CardDescription className="text-base">
                                        {step.description}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
