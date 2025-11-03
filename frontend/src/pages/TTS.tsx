import { useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import { Header } from "@/components/layout/header"
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

  const handleGenerateSpeech = async () => {
    if (!text) return
    setLoading(true)
    setError(null)
    setAudioUrl(null)
    
    try {
      const res = await ttsService.generateSpeech(text, selectedLang, selectedModel)
      const url = ttsService.getAudioUrl(res.audio_path)
      setAudioUrl(url)
    } catch (e: any) {
      setError(e?.message || 'TTS generation failed')
    } finally {
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
    <div className="min-h-screen bg-background">
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
            <div className="p-4 rounded-lg border border-border/40 bg-card">
              <div className="text-sm text-muted-foreground mb-2">Text to Convert ({langCode || 'unknown'}):</div>
              <p className="whitespace-pre-wrap leading-relaxed">{text}</p>
            </div>
            
            <div className="p-4 rounded-lg border border-border/40 bg-card flex flex-col gap-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Language:</span>
                  <LanguageSelector selectedLanguage={selectedLang} onLanguageChange={setSelectedLang} />
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="text-sm">TTS Model:</label>
                  <label className="text-sm flex items-center gap-1 cursor-pointer">
                    <input 
                      type="radio" 
                      name="tts-model" 
                      checked={selectedModel === 'auto'} 
                      onChange={() => setSelectedModel('auto')} 
                    />
                    Auto
                  </label>
                  <label className="text-sm flex items-center gap-1 cursor-pointer">
                    <input 
                      type="radio" 
                      name="tts-model" 
                      checked={selectedModel === 'xtts'} 
                      onChange={() => setSelectedModel('xtts')} 
                    />
                    Coqui TTS (XTTS)
                  </label>
                  <label className="text-sm flex items-center gap-1 cursor-pointer">
                    <input 
                      type="radio" 
                      name="tts-model" 
                      checked={selectedModel === 'gtts'} 
                      onChange={() => setSelectedModel('gtts')} 
                    />
                    Google TTS
                  </label>
                  <label className="text-sm flex items-center gap-1 cursor-pointer">
                    <input 
                      type="radio" 
                      name="tts-model" 
                      checked={selectedModel === 'indic'} 
                      onChange={() => setSelectedModel('indic')} 
                    />
                    Indic TTS
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={handleGenerateSpeech} disabled={loading}>
                  {loading ? 'Generating Speech...' : 'Generate Speech'}
                </Button>
                <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
              </div>
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
                      className="flex items-center gap-1"
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

