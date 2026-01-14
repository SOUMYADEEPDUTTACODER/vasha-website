import { Link } from "react-router-dom"
import { Book, MessageCircle, Shield, Sparkles, ArrowLeft, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function UserDocs() {
  const guides = [
    {
      icon: MessageCircle,
      title: "How to Use Vasha AI",
      description: "Step-by-step guide to using speech, translation, and voice features",
      content: [
        "Upload an audio file or provide a YouTube link",
        "Choose the ASR model (Whisper or AI4Bharat)",
        "Select a target language for translation",
        "Choose your preferred TTS engine",
        "Generate translated speech output"
      ]
    },
    {
      icon: Sparkles,
      title: "Model Selection Guide",
      description: "Choosing the best model for your language and use case",
      content: [
        "Whisper works best for global languages",
        "AI4Bharat ASR is optimized for Indian languages",
        "XTTS provides voice cloning and multilingual speech",
        "Indic TTS is recommended for Indian languages",
        "gTTS acts as a fallback for unsupported languages"
      ]
    },
    {
      icon: Shield,
      title: "Privacy & Data Handling",
      description: "How audio and text data are processed",
      content: [
        "Audio is processed only for inference",
        "No audio is stored after processing",
        "All processing happens securely on the server",
        "Evaluation data is anonymized",
        "No personal identity tracking"
      ]
    }
  ]

  const faqs = [
    {
      question: "Which languages are supported?",
      answer:
        "Vasha AI supports global languages via Whisper and XTTS, and Indian languages via AI4Bharat ASR, IndicTrans MT, and Indic TTS. Supported languages include Hindi, Bengali, Tamil, Assamese, English, French, German, Japanese, Chinese, and more."
    },
    {
      question: "Which ASR model should I use?",
      answer:
        "Use Whisper for global or mixed-language audio. Use AI4Bharat ASR for Indian languages such as Hindi, Bengali, Tamil, Assamese, and Marathi."
    },
    {
      question: "What TTS model gives the best quality?",
      answer:
        "XTTS provides high-quality multilingual speech and voice cloning. Indic TTS provides more natural output for Indian languages. gTTS is used as a fallback when other models are unavailable."
    },
    {
      question: "Can I use my own voice?",
      answer:
        "Yes. XTTS supports voice cloning using a short reference WAV file recorded in your own voice."
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <Button variant="outline" asChild className="mb-6">
            <Link to="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </Button>

          <div className="flex items-center space-x-3 mb-4">
            <div className="h-12 w-12 gradient-primary rounded-lg flex items-center justify-center">
              <Book className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">User Manual</h1>
              <p className="text-xl text-muted-foreground mt-2">
                Complete guide to using Vasha AI’s Speech, Translation, and Voice system
              </p>
            </div>
          </div>
        </div>

        {/* Overview */}
        <Card className="mb-8 shadow-card border-border/40">
          <CardHeader>
            <CardTitle>About Vasha AI</CardTitle>
            <CardDescription>
              End-to-end Speech → Translation → Speech pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-primary">Core Capabilities</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Automatic Speech Recognition (ASR)</li>
                  <li>Multilingual Machine Translation (MT)</li>
                  <li>Text-to-Speech with voice cloning (TTS)</li>
                  <li>Support for Indian and global languages</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-primary">Supported Models</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>ASR: Whisper, AI4Bharat Conformer</li>
                  <li>MT: IndicTrans2, Google Translate</li>
                  <li>TTS: XTTS, Indic Parler-TTS, gTTS</li>
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <Button asChild className="gradient-primary text-primary-foreground">
                <Link to="/chat">Start Using Vasha AI</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Guides */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {guides.map((guide, index) => (
            <Card
              key={index}
              className="shadow-card border-border/40 hover:shadow-glow transition-shadow duration-300"
            >
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <guide.icon className="h-5 w-5 text-primary" />
                  <span>{guide.title}</span>
                </CardTitle>
                <CardDescription>{guide.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {guide.content.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      className="text-sm text-muted-foreground flex items-center space-x-2"
                    >
                      <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <Card className="shadow-card border-border/40">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>
              Common questions about models, languages, and usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border-b border-border/40 last:border-b-0 pb-4 last:pb-0"
                >
                  <h3 className="font-semibold text-foreground mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4" />
                <span>Developer Docs</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>Community Support</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
