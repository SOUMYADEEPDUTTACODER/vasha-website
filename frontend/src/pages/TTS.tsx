import { useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { LanguageSelector, languages } from "@/components/chat/LanguageSelector"
import { ttsService } from "@/services/ttsService"
import { AudioPlayer } from "@/components/chat/AudioPlayer"
import { Download } from "lucide-react"

export default function TTS() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state as any) || {}
  const text: string | null = state.text || null
  const langCode: string | null = state.lang_code || null
  const srcText: string | null = state.src_text || null
  const srcLang: string | null = state.src_lang || null
  
  const [selectedModel, setSelectedModel] = useState<'xtts' | 'gtts' | 'indic' | 'auto'>('auto')
  const [selectedLang, setSelectedLang] = useState<string>(langCode || "hi")
  const [loading, setLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ttsProgress, setTtsProgress] = useState<number | null>(null)

  const handleGenerateSpeech = async () => {
    if (!text) return
    setLoading(true)
    setError(null)
    setAudioUrl(null)
    setTtsProgress(0)
    let ttsInterval: any = null
    ttsInterval = window.setInterval(() => {
      setTtsProgress((p) => {
        if (p === null) return 1
        const next = p + Math.floor(Math.random() * 8) + 2
        return next >= 90 ? 90 : next
      })
    }, 300)
    
    try {
      const res = await ttsService.generateSpeech(text, selectedLang, selectedModel)
      const url = ttsService.getAudioUrl(res.audio_path)
      setAudioUrl(url)
    } catch (e: any) {
      setError(e?.message || 'TTS generation failed')
    } finally {
      setTtsProgress(100)
      setTimeout(() => setTtsProgress(null), 700)
      if (ttsInterval) clearInterval(ttsInterval)
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!audioUrl) return
    const link = document.createElement('a')
    link.href = audioUrl
    // Extract original filename from URL or generate one
    const urlParts = audioUrl.split('/')
    const filename = urlParts[urlParts.length - 1] || `tts_${Date.now()}.${audioUrl.endsWith('.mp3') ? 'mp3' : 'wav'}`
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-sky-900 text-slate-100">
      <Header />
      <div className="container mx-auto p-6 max-w-3xl">
        <h1 className="text-2xl font-semibold mb-4">Text-to-Speech</h1>
        {text ? (
          <div className="space-y-4">
            {srcText && (
              <div className="p-4 rounded-lg border border-border/40 bg-card">
                <div className="text-sm text-muted-foreground mb-2">Original Text ({srcLang || 'unknown'}):</div>
                <p className="whitespace-pre-wrap leading-relaxed text-sm text-muted-foreground">{srcText}</p>
              </div>
            )}
            <div className="p-4 rounded-lg border border-border/40 bg-card/60 backdrop-blur-sm">
              <div className="text-sm text-muted-foreground mb-2">Text to Convert ({langCode || 'unknown'}):</div>
              <p className="whitespace-pre-wrap leading-relaxed">{text}</p>
            </div>
            
            <div className="p-4 rounded-lg border border-border/40 bg-card/60 flex flex-col gap-4 backdrop-blur-sm">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Language:</span>
                  <LanguageSelector selectedLanguage={selectedLang} onLanguageChange={setSelectedLang} />
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm text-muted-foreground mr-2">TTS Model:</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedModel('auto')} className={`px-3 py-1 rounded-full text-sm font-semibold transition-transform ${selectedModel==='auto' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-2xl scale-105' : 'bg-background/20 text-slate-200'}`}>Auto</button>
                    <button onClick={() => setSelectedModel('xtts')} className={`px-3 py-1 rounded-full text-sm font-semibold transition-transform ${selectedModel==='xtts' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-2xl scale-105' : 'bg-background/20 text-slate-200'}`}>Coqui TTS</button>
                    <button onClick={() => setSelectedModel('gtts')} className={`px-3 py-1 rounded-full text-sm font-semibold transition-transform ${selectedModel==='gtts' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-2xl scale-105' : 'bg-background/20 text-slate-200'}`}>Google TTS</button>
                    <button onClick={() => setSelectedModel('indic')} className={`px-3 py-1 rounded-full text-sm font-semibold transition-transform ${selectedModel==='indic' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-2xl scale-105' : 'bg-background/20 text-slate-200'}`}>Indic TTS</button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={handleGenerateSpeech} disabled={loading} className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold shadow-[0_14px_40px_rgba(139,92,246,0.18)] hover:scale-105 transform transition-all duration-300">{loading ? 'Generating Speech...' : 'Generate Speech'}</Button>
                <Button variant="outline" onClick={() => navigate(-1)} className="text-slate-100 border-border/40">Back</Button>
              </div>
              {ttsProgress !== null && (
                <div className="mt-3 w-full">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">TTS progress</span>
                    <span className="font-medium">{Math.min(ttsProgress,100)}%</span>
                  </div>
                  <Progress value={Math.min(ttsProgress,100)} />
                </div>
              )}
              {error && <div className="text-sm text-red-500">{error}</div>}
            </div>
            
            {audioUrl && (
              <div className="p-4 rounded-lg border border-border/40 bg-card space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-muted-foreground">Generated Audio:</div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleDownload}
                      className="flex items-center gap-1 text-slate-100 border-border/40 bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-2xl"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
                <AudioPlayer audioUrl={audioUrl} />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground">No text provided. Go back to MT and continue from translation.</p>
            <Button variant="outline" onClick={() => navigate('/mt')}>Go to MT</Button>
          </div>
        )}
      </div>
    </div>
  )
}

