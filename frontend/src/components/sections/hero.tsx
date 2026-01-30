import { Link } from "react-router-dom"
import { ArrowRight, Sparkles, Zap, Play, Maximize, Mic, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import LanguageSupportTable from "@/components/sections/LanguageSupportTable"
import ModelDetailsModal from "@/components/sections/ModelDetailsModal"
import React, { useState, useRef } from "react"
import { FeedbackButton } from "@/components/chat/FeedbackButton"

export function Hero() {
  const [hoverLeft, setHoverLeft] = useState(false)
  const [hoverRight, setHoverRight] = useState(false)
  const [modalOpen, setModalOpen] = useState<"asr" | "mt" | "tts" | null>(null)
  const [videoPlaying, setVideoPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const toggleVideo = () => {
    if (videoRef.current) {
      if (videoPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setVideoPlaying(!videoPlaying)
    }
  }

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      } else if ((videoRef.current as any).webkitRequestFullscreen) {
        ; (videoRef.current as any).webkitRequestFullscreen()
      } else if ((videoRef.current as any).msRequestFullscreen) {
        ; (videoRef.current as any).msRequestFullscreen()
      }
    }
  }

  const imgLeftStyle: React.CSSProperties = {
    position: "absolute",
    left: 0,
    top: "160px",
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
    top: "160px",
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
      <FeedbackButton />
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

      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8 border border-primary/20">
            <Sparkles className="h-4 w-4" />
            <span>Powered by Advanced AI Technology</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 relative z-10">
            <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse">
              VASHA AI
            </span>
            <span className="block text-2xl sm:text-2xl lg:text-3xl">
              Versatile AI-based Speech & Human Adaptation
            </span>
          </h1>



          <p className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Our Model supports real time Audio,Video and Text Translation
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="gradient-primary text-primary-foreground hover:shadow-glow transition-all duration-300 group text-lg px-8 py-6 w-full sm:w-auto"
            >
              <Link to="/chat" className="flex items-center space-x-2">
                <Zap className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                <span>Use Voice Model</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary/20 hover:border-primary/50 text-slate-200 hover:text-white transition-all duration-300 group text-lg px-8 py-6 w-full sm:w-auto backdrop-blur-sm"
            >
              <Link to="/text-chat" className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300 text-primary" />
                <span>Use Text Model</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300 opacity-0 group-hover:opacity-100" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mt-20 pt-12 border-t border-border/40">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">22 Indian</div>
              <div className="text-sm text-muted-foreground">Languages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">14 Global</div>
              <div className="text-sm text-muted-foreground">Languages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">Real-time</div>
              <div className="text-sm text-muted-foreground">Content-Translation</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">Automated</div>
              <div className="text-sm text-muted-foreground">Video Dubbing</div>
            </div>
          </div>
        </div>

        <div className="mt-24 text-center">
          <div className="inline-flex items-center space-x-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-8 border border-accent/20">
            <Zap className="h-4 w-4" />
            <span>Process Showcase</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            How This Works
          </h2>
          <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
            See VASHA AI in action. Witness how our advanced ASR, MT, and TTS models work together seamlessly to bridge language barriers.
          </p>

          <div
            className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl group cursor-pointer border border-primary/20 bg-muted/30 backdrop-blur-sm"
            onClick={toggleVideo}
          >
            <video
              ref={videoRef}
              src="/demovideo.mp4"
              className="w-full h-auto"
              onPlay={() => setVideoPlaying(true)}
              onPause={() => setVideoPlaying(false)}
              onEnded={() => setVideoPlaying(false)}
            />

            {!videoPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/30 transition-all duration-300">
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(var(--primary),0.5)] transform group-hover:scale-110 transition-transform duration-300">
                  <Play className="h-10 w-10 fill-current ml-1" />
                </div>
              </div>
            )}

            <button
              onClick={handleFullscreen}
              className="absolute top-4 right-4 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
              title="Fullscreen"
            >
              <Maximize className="h-6 w-6" />
            </button>

            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 gap-8 ml-0">
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

        <div className="mt-10">
          <LanguageSupportTable />
        </div>

        <div className="mt-24 pt-16 border-t border-border/40">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
              Voice Translation Demos
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience how our model preserves the essence of influential voices while translating them across languages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-lg animate-pulse" />
                  <img
                    src="/ratantat.jpg"
                    alt="Ratan Tata"
                    className="relative w-24 h-24 object-cover rounded-2xl border-2 border-primary/20"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Ratan Tata</h3>
                  <p className="text-sm text-primary font-medium">Business Tycoon & Philanthropist</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <Mic className="h-4 w-4" />
                    <span>Source Voice (English)</span>
                  </div>
                  <audio controls className="w-full accent-primary">
                    <source src="/ratantata_input.wav" type="audio/wav" />
                  </audio>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <Volume2 className="h-4 w-4" />
                    <span>Translated Output (Hindi)</span>
                  </div>
                  <audio controls className="w-full h-10">
                    <source src="/ratantata_output.wav" type="audio/wav" />
                  </audio>
                </div>
              </div>
            </div>

            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/20 rounded-2xl blur-lg animate-pulse" />
                  <img
                    src="/apjphoto.jpg"
                    alt="APJ Abdul Kalam"
                    className="relative w-24 h-24 object-cover rounded-2xl border-2 border-accent/20"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">APJ Abdul Kalam</h3>
                  <p className="text-sm text-accent font-medium">Former President of India</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <Mic className="h-4 w-4" />
                    <span>Source Voice (English)</span>
                  </div>
                  <audio controls className="w-full accent-primary">
                    <source src="/apjinputaudio.wav" type="audio/wav" />
                  </audio>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-accent">
                    <Volume2 className="h-4 w-4" />
                    <span>Translated Output (Bengali)</span>
                  </div>
                  <audio controls className="w-full h-10">
                    <source src="/apjoutputaudio.wav" type="audio/wav" />
                  </audio>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto mt-12">
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-lg animate-pulse" />
                  <img
                    src="/sundarphoto.jpg"
                    alt="Sundar Pichai"
                    className="relative w-24 h-24 object-cover rounded-2xl border-2 border-primary/20"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Sundar Pichai</h3>
                  <p className="text-sm text-primary font-medium">CEO of Alphabet & Google</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <Mic className="h-4 w-4" />
                    <span>Source Voice (English)</span>
                  </div>
                  <audio controls className="w-full accent-primary">
                    <source src="/sundarinputaudio.wav" type="audio/wav" />
                  </audio>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <Volume2 className="h-4 w-4" />
                    <span>Translated Output (Hindi)</span>
                  </div>
                  <audio controls className="w-full h-10">
                    <source src="/sundaroutput.wav" type="audio/wav" />
                  </audio>
                </div>
              </div>
            </div>

            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/20 rounded-2xl blur-lg animate-pulse" />
                  <img
                    src="/naveenphoto.jpg"
                    alt="Naveen Patnaik"
                    className="relative w-24 h-24 object-cover rounded-2xl border-2 border-accent/20"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Naveen Patnaik</h3>
                  <p className="text-sm text-accent font-medium">Former Chief Minister of Odisha</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <Mic className="h-4 w-4" />
                    <span>Source Voice (English)</span>
                  </div>
                  <audio controls className="w-full accent-primary">
                    <source src="/naveeninput.wav" type="audio/wav" />
                  </audio>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-accent">
                    <Volume2 className="h-4 w-4" />
                    <span>Translated Output (Odiya)</span>
                  </div>
                  <audio controls className="w-full h-10">
                    <source src="/naveenoutput.wav" type="audio/wav" />
                  </audio>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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