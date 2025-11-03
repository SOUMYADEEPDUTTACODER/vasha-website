import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ModelInfo {
  name: string
  description: string
  features: string[]
  githubUrl: string
  badge?: "default" | "secondary" | "outline" | "destructive"
}

interface ModelDetailsModalProps {
  type: "asr" | "mt" | "tts"
  open: boolean
  onOpenChange: (open: boolean) => void
}

const modelData: Record<string, ModelInfo[]> = {
  asr: [
    {
      name: "Whisper",
      description:
        "Whisper is OpenAI's general-purpose speech recognition model trained on diverse audio. A multitasking Transformer sequence-to-sequence model that performs multilingual speech recognition, speech translation, and language identification.",
      features: [
        "Multilingual support across 99+ languages",
        "Automatic language detection and translation",
        "Robust to accents, background noise, and technical language",
        "Six model sizes: tiny (39M) to large (1550M parameters)",
        "Open-source with MIT license",
        "High accuracy on diverse audio conditions"
      ],
      githubUrl: "https://github.com/openai/whisper",
      badge: "default"
    },
    {
      name: "Indic Conformer",
      description:
        "AI4Bharat's IndicConformerASR is a specialized ASR model optimized for 22 Indic languages. Based on the Conformer architecture, it delivers excellent performance for Indian languages including Hindi, Bengali, Tamil, Telugu, and more.",
      features: [
        "Specialized for 22 Indic languages",
        "Built on Conformer architecture for efficiency",
        "State-of-the-art performance on Indic speech",
        "Handles code-mixed speech between Indic languages",
        "Fine-tuned on large Indic audio datasets",
        "Lower latency than generic multilingual models"
      ],
      githubUrl: "https://github.com/AI4Bharat/IndicConformerASR",
      badge: "secondary"
    }
  ],
  mt: [
    {
      name: "Meta NLLB",
      description:
        "Meta's No Language Left Behind (NLLB) is a state-of-the-art multilingual translation model supporting 200+ languages. Built with advanced neural network architecture, it provides high-quality translations across global languages.",
      features: [
        "Supports 200+ languages globally",
        "Direct translation between any language pair",
        "Advanced NMT architecture for accuracy",
        "Multiple model sizes for speed-accuracy tradeoffs",
        "Handles diverse linguistic phenomena",
        "Optimized for both high- and low-resource languages"
      ],
      githubUrl: "https://github.com/gordicaleksa/Open-NLLB",
      badge: "default"
    },
    {
      name: "IndicTrans",
      description:
        "AI4Bharat's IndicTrans is a specialized machine translation model for 23 Indic languages, enabling accurate translations between English and Indic languages as well as between different Indic languages.",
      features: [
        "Specialized for 23 Indic languages",
        "Bilingual and multilingual translation modes",
        "State-of-the-art performance on Indic language pairs",
        "Handles script diversity (Devanagari, Tamil, etc.)",
        "Efficient inference with optimized architecture",
        "Trained on parallel corpora of Indic languages"
      ],
      githubUrl: "https://github.com/AI4Bharat/indicTrans",
      badge: "secondary"
    }
  ],
  tts: [
    {
      name: "Coqui TTS",
      description:
        "Coqui TTS is an advanced, production-ready neural text-to-speech library supporting multiple languages and voices. Built with PyTorch, it provides high-quality, natural-sounding speech synthesis.",
      features: [
        "Production-ready TTS library",
        "Multiple voice cloning and synthesis models",
        "Support for 17+ languages",
        "Zero-shot multi-speaker TTS",
        "Python API and CLI interface",
        "Customizable voice characteristics"
      ],
      githubUrl: "https://github.com/coqui-ai/TTS",
      badge: "default"
    },
    {
      name: "Indic Parler TTS",
      description:
        "AI4Bharat's Indic Parler TTS is a specialized text-to-speech system for Indic languages, providing natural and expressive speech synthesis for 22+ Indic languages with authentic pronunciations and prosody.",
      features: [
        "Specialized for 22+ Indic languages",
        "Multiple speaker voices per language",
        "High-quality neural vocoder",
        "Handles complex Indic scripts",
        "Natural intonation and stress patterns",
        "Gender-balanced voice options"
      ],
      githubUrl: "https://github.com/AI4Bharat/Indic-TTS",
      badge: "secondary"
    }
  ]
}

export default function ModelDetailsModal({ type, open, onOpenChange }: ModelDetailsModalProps) {
  const models = modelData[type]
  const titles: Record<string, string> = {
    asr: "ASR Models",
    mt: "Machine Translation Models",
    tts: "Text-to-Speech Models"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{titles[type]}</DialogTitle>
          <DialogDescription>
            Our platform uses state-of-the-art models to deliver exceptional results across {type === "asr" ? "speech recognition" : type === "mt" ? "machine translation" : "text-to-speech"} tasks
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {models.map((model, index) => (
            <div key={index} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-3 mb-2">
                    {model.name}
                    <Badge variant={model.badge}>{model.badge === "secondary" ? "Indic" : "Global"}</Badge>
                  </h3>
                  <p className="text-muted-foreground">{model.description}</p>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold mb-3">Features:</h4>
                <ul className="space-y-2">
                  {model.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full mt-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                  <a href={model.githubUrl} target="_blank" rel="noopener noreferrer">
                    View on GitHub
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
