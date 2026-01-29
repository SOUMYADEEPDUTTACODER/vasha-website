import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, ZoomIn, ZoomOut, BarChart3, ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/layout/header"

const evaluationData = [
    {
        title: "ASR & MT Evaluation",
        description: "Performance metrics for Speech Recognition and Machine Translation models",
        plots: [
            {
                url: "/asrcombined.png",
                name: "ASR Combined Metrics",
                description: "ASR combined evaluation metrics including WER (Word Error Rate) and CER (Character Error Rate)."
            },
            {
                url: "/mt_combined.png",
                name: "MT Combined Evaluation",
                description: "MT combined evaluation showing BLEU and chrF scores across various language pairs."
            }
        ]
    },
    {
        title: "TTS Evaluation",
        description: "Text-to-Speech naturalness and performance metrics",
        plots: [
            {
                url: "/tts_mos.png",
                name: "TTS MOS Results",
                description: "Mean Opinion Score (MOS) results for naturalness of synthesized speech."
            },
            {
                url: "/tts_rtf.png",
                name: "TTS RTF Measurements",
                description: "Real-Time Factor (RTF) measurements indicating synthesis speed."
            }
        ]
    },
    {
        title: "Indic LID Evaluation",
        description: "Evaluation of Language Identification across different acoustic features",
        plots: [
            {
                url: "/duration_distribution.png",
                name: "Duration Distribution",
                description: "Distribution of audio segment durations across different languages."
            },
            {
                url: "/rms_energy_boxplot.png",
                name: "RMS Energy Boxplot",
                description: "Root Mean Square energy variation across different language segments."
            },
            {
                url: "/output_length_violin.png",
                name: "Output Length Violin Plot",
                description: "Probability density of output lengths across different language categories."
            }
        ]
    }
]

export default function EvaluationPlots() {
    const [selectedPlot, setSelectedPlot] = useState<{ url: string; name: string; description: string } | null>(null)
    const [zoomed, setZoomed] = useState(false)

    const handleOpenPlot = (plot: { url: string; name: string; description: string }) => {
        setSelectedPlot(plot)
        setZoomed(false)
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto px-4 py-12">
                {/* Header Section */}
                <div className="mb-12">
                    <Button variant="outline" asChild className="mb-6">
                        <Link to="/" className="flex items-center space-x-2">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Home</span>
                        </Link>
                    </Button>

                    <div className="flex items-center space-x-3 mb-4">
                        <div className="h-12 w-12 gradient-primary rounded-lg flex items-center justify-center">
                            <BarChart3 className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold">Evaluation Plots</h1>
                            <p className="text-xl text-muted-foreground mt-2">
                                Detailed performance metrics and qualitative assessments for Vasha AI models
                            </p>
                        </div>
                    </div>
                </div>

                {/* Plots Grid */}
                <div className="space-y-12">
                    {evaluationData.map((section, sectionIdx) => (
                        <div key={sectionIdx} className="space-y-6">
                            <div className="border-b border-border/40 pb-4">
                                <h2 className="text-2xl font-bold text-primary">{section.title}</h2>
                                <p className="text-muted-foreground">{section.description}</p>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
                                {section.plots.map((plot, plotIdx) => (
                                    <Card key={plotIdx} className="overflow-hidden border-border/40 hover:shadow-glow transition-all duration-300">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-lg">{plot.name}</CardTitle>
                                            <CardDescription>{plot.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-0 border-t border-border/40">
                                            <div
                                                className="relative cursor-zoom-in group aspect-video bg-muted/30"
                                                onClick={() => handleOpenPlot(plot)}
                                            >
                                                <img
                                                    src={plot.url}
                                                    alt={plot.name}
                                                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                    <div className="bg-primary/90 text-primary-foreground p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform scale-75 group-hover:scale-100">
                                                        <ZoomIn className="h-6 w-6" />
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Lightbox / Modal */}
            {selectedPlot && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-in fade-in duration-300"
                    onClick={() => setSelectedPlot(null)}
                >
                    <div
                        className="relative max-w-7xl w-full max-h-[90vh] flex flex-col items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Controls */}
                        <div className="absolute -top-12 right-0 flex items-center space-x-4 text-white">
                            <button
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                onClick={() => setZoomed(!zoomed)}
                                title={zoomed ? "Zoom Out" : "Zoom In"}
                            >
                                {zoomed ? <ZoomOut className="h-6 w-6" /> : <ZoomIn className="h-6 w-6" />}
                            </button>
                            <button
                                className="p-2 hover:bg-white/10 rounded-full transition-colors font-bold"
                                onClick={() => setSelectedPlot(null)}
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className={`relative overflow-auto max-h-[80vh] w-full flex items-center justify-center transition-all duration-300 ${zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}>
                            <img
                                src={selectedPlot.url}
                                alt={selectedPlot.name}
                                onClick={() => setZoomed(!zoomed)}
                                className={`transition-all duration-300 ${zoomed ? 'scale-150 origin-center' : 'scale-100'} max-w-full h-auto object-contain rounded-lg shadow-2xl`}
                            />
                        </div>

                        <div className="mt-8 text-center text-white max-w-2xl">
                            <h3 className="text-xl font-bold mb-2">{selectedPlot.name}</h3>
                            <p className="text-gray-300">{selectedPlot.description}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
