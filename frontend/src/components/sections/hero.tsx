import { Link } from "react-router-dom"
import { ArrowRight, Sparkles, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import LanguageSupportTable from "@/components/sections/LanguageSupportTable"
import ModelDetailsModal from "@/components/sections/ModelDetailsModal"
import React, { useState } from "react"

export function Hero() {
  const [hoverLeft, setHoverLeft] = useState(false)
  const [hoverRight, setHoverRight] = useState(false)
  const [modalOpen, setModalOpen] = useState<"asr" | "mt" | "tts" | null>(null)

  // Move images down to align with "Experience Vasha AI"
  const imgLeftStyle: React.CSSProperties = {
    position: "absolute",
    left: 0,
    top: "160px", // Adjust this value as needed for your layout
    transform: hoverLeft
      ? "translateY(0%) perspective(800px) rotateY(28deg) scale(1.12)"
      : "translateY(0%) perspective(800px) rotateY(18deg) scale(1.08)",
    width: "320px",
    maxWidth: "20vw",
    filter: hoverLeft
      ? "drop-shadow(0 0 60px #646cff)"
      : "drop-shadow(0 0 40px #646cffaa)",
    transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1), filter 0.3s",
    zIndex: 2,
    cursor: "pointer"
  }

  const imgRightStyle: React.CSSProperties = {
    position: "absolute",
    right: 0,
    top: "160px", // Adjust this value as needed for your layout
    transform: hoverRight
      ? "translateY(0%) perspective(800px) rotateY(-28deg) scale(1.12)"
      : "translateY(0%) perspective(800px) rotateY(-18deg) scale(1.08)",
    width: "320px",
    maxWidth: "20vw",
    filter: hoverRight
      ? "drop-shadow(0 0 60px #646cff)"
      : "drop-shadow(0 0 40px #646cffaa)",
    transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1), filter 0.3s",
    zIndex: 2,
    cursor: "pointer"
  }

  return (
    <section className="relative overflow-hidden py-20 sm:py-32">
      {/* 3D Images beside Experience Vasha AI */}
      <img
        src="/mainimage.png"
        alt="Left 3D"
        style={imgLeftStyle}
        onMouseEnter={() => setHoverLeft(true)}
        onMouseLeave={() => setHoverLeft(false)}
      />
      <img
        src="/mainimage2.png"
        alt="Right 3D"
        style={imgRightStyle}
        onMouseEnter={() => setHoverRight(true)}
        onMouseLeave={() => setHoverRight(false)}
      />

      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8 border border-primary/20">
            <Sparkles className="h-4 w-4" />
            <span>Powered by Advanced AI Technology</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 relative z-10">
            <span className="block">Experience</span>
            <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse">
              Vasha AI
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Chat with our cutting-edge AI model now! Experience the future of artificial intelligence with seamless conversations and intelligent responses.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              asChild 
              size="lg" 
              className="gradient-primary text-primary-foreground hover:shadow-glow transition-all duration-300 group text-lg px-8 py-6 w-full sm:w-auto"
            >
              <Link to="/chat" className="flex items-center space-x-2">
                <Zap className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                <span>Use Our Model</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 mt-20 pt-12 border-t border-border/40">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">22+</div>
              <div className="text-sm text-muted-foreground">Languages</div>
            </div>
            <div className="text-center col-span-2 sm:col-span-1">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">Real-time</div>
              <div className="text-sm text-muted-foreground">Responses</div>
            </div>
          </div>
        </div>

        {/* Three Model Cards Section */}
        <div className="mt-24 grid grid-cols-1 gap-8 ml-0">
          {/* ASR Model */}
          <div
            className="flex flex-col items-start bg-card rounded-xl shadow-lg p-8 animate-pop-fade model-card-hover"
            style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}
          >
            <div className="text-2xl font-bold text-primary mb-2">ASR</div>
            <div className="text-muted-foreground mb-4">Convert audio to text</div>
            <div className="flex flex-row items-center w-full gap-6">
              <div className="w-38 h-38 bg-muted rounded-xl flex items-center justify-start mb-2 overflow-hidden shadow-lg">
                <video src="/asrvid.mp4" autoPlay loop muted className="w-38 h-38 object-contain model-img-fade" />
              </div>
              <div className="flex-1">
                <div
                  className="text-base font-medium text-gray-800 mb-3"
                  style={{
                    fontFamily: `'Segoe UI', 'Inter', 'Roboto', 'Helvetica Neue', Arial, 'sans-serif'`,
                    letterSpacing: '0.01em',
                    lineHeight: '1.7',
                  }}
                >
                  <span className="block text-lg font-semibold text-primary mb-1" style={{ letterSpacing: '0.03em' }}>
                    Automatic Speech Recognition (ASR)
                  </span>
                  <span className="block text-gray-600">
                    Our ASR model accurately converts spoken audio into text across multiple Indian and global languages.
                    Leveraging advanced deep learning, it supports various dialects and noisy environments, enabling seamless transcription for applications like voice assistants, subtitles, and accessibility tools.
                  </span>
                </div>
                <Button size="sm" className="mt-2 rounded-full px-5 py-2 font-semibold tracking-wide shadow transition-all hover:bg-primary/90" onClick={() => setModalOpen("asr")}>
                  LEARN MORE
                </Button>
              </div>
            </div>
          </div>
          {/* MT Model */}
          <div
            className="flex flex-col items-start bg-card rounded-xl shadow-lg p-8 animate-pop-fade model-card-hover"
            style={{ animationDelay: "0.3s", animationFillMode: "backwards" }}
          >
            <div className="text-2xl font-bold text-primary mb-2">MT</div>
            <div className="text-muted-foreground mb-4">Convert text to text</div>
            <div className="flex flex-row items-center w-full gap-6">
              <div className="w-38 h-38 bg-muted rounded-xl flex items-center justify-start mb-2 overflow-hidden shadow-lg">
                <video src="/mtvid.mp4" autoPlay loop muted className="w-38 h-38 object-contain model-img-fade" />
              </div>
              <div className="flex-1">
                <div
                  className="text-base font-medium text-gray-800 mb-3"
                  style={{
                    fontFamily: `'Segoe UI', 'Inter', 'Roboto', 'Helvetica Neue', Arial, 'sans-serif'`,
                    letterSpacing: '0.01em',
                    lineHeight: '1.7',
                  }}
                >
                  <span className="block text-lg font-semibold text-primary mb-1" style={{ letterSpacing: '0.03em' }}>
                    Machine Translation (MT)
                  </span>
                  <span className="block text-gray-600">
                    Our Machine Translation (MT) model enables fast and accurate translation between English and multiple Indian languages. Powered by state-of-the-art neural networks, it supports diverse language pairs and delivers high-quality translations for documents, websites, and real-time communication.
                  </span>
                </div>
                <Button size="sm" className="mt-2 rounded-full px-5 py-2 font-semibold tracking-wide shadow transition-all hover:bg-primary/90" onClick={() => setModalOpen("mt")}>
                  LEARN MORE
                </Button>
              </div>
            </div>
          </div>
          {/* TTS Model */}
          <div
            className="flex flex-col items-start bg-card rounded-xl shadow-lg p-8 animate-pop-fade model-card-hover"
            style={{ animationDelay: "0.5s", animationFillMode: "backwards" }}
          >
            <div className="text-2xl font-bold text-primary mb-2">TTS</div>
            <div className="text-muted-foreground mb-4">Text to speech</div>
            <div className="flex flex-row items-center w-full gap-6">
              <div className="w-38 h-38 bg-muted rounded-xl flex items-center justify-start mb-2 overflow-hidden shadow-lg">
                <video src="/ttsvid.mp4" autoPlay loop muted className="w-38 h-38 object-contain model-img-fade" />
              </div>
              <div className="flex-1">
                <div
                  className="text-base font-medium text-gray-800 mb-3"
                  style={{
                    fontFamily: `'Segoe UI', 'Inter', 'Roboto', 'Helvetica Neue', Arial, 'sans-serif'`,
                    letterSpacing: '0.01em',
                    lineHeight: '1.7',
                  }}
                >
                  <span className="block text-lg font-semibold text-primary mb-1" style={{ letterSpacing: '0.03em' }}>
                    Text To Speech (TTS)
                  </span>
                  <span className="block text-gray-600">
                    Our Text to Speech (TTS) model transforms written text into natural-sounding speech in multiple Indian languages and English. Utilizing advanced neural voice synthesis, it delivers expressive, clear, and human-like audio for use cases such as accessibility, virtual assistants, and content creation.
                  </span>
                </div>
                <Button size="sm" className="mt-2 rounded-full px-5 py-2 font-semibold tracking-wide shadow transition-all hover:bg-primary/90" onClick={() => setModalOpen("tts")}>
                  LEARN MORE
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Language Support Table */}
        <div className="mt-10">
          <LanguageSupportTable />
        </div>
      </div>
      
      {/* Model Details Modals */}
      {modalOpen && (
        <ModelDetailsModal
          type={modalOpen}
          open={true}
          onOpenChange={(open) => !open && setModalOpen(null)}
        />
      )}
    </section>
  )
}