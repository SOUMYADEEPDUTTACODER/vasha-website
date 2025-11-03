import { useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { LanguageSelector, languages } from "@/components/chat/LanguageSelector"
import { mtService } from "@/services/mtService"
import { AudioPlayer } from "@/components/chat/AudioPlayer"

export default function MT() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state as any) || {}
  const transcription: string | null = state.transcription || null
  const language: string | null = state.language || null
  const audioUrl: string | null = state.audioUrl || null
  const [srcLang, setSrcLang] = useState<string>(language || "en")
  const [tgtLang, setTgtLang] = useState<string>("hi")
  const [model, setModel] = useState<'google' | 'indictrans' | 'nllb'>("indictrans")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<boolean>(false)

  const handleTranslate = async () => {
    if (!transcription) return
    setLoading(true)
    setError(null)
    try {
      const res = await mtService.translate(transcription, srcLang, tgtLang, model)
      setResult(res.translation)
    } catch (e: any) {
      setError(e?.message || 'Translation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 max-w-3xl">
        <h1 className="text-2xl font-semibold mb-4">Machine Translation</h1>
        {transcription ? (
          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-border/40 bg-card">
              <div className="text-sm text-muted-foreground mb-2">Source ({language || 'unknown'}):</div>
              <p className="whitespace-pre-wrap leading-relaxed">{transcription}</p>
              {audioUrl && (
                <div className="mt-3">
                  <AudioPlayer audioUrl={audioUrl} />
                </div>
              )}
            </div>
            <div className="p-4 rounded-lg border border-border/40 bg-card flex flex-col gap-3">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">From</span>
                  <LanguageSelector selectedLanguage={srcLang} onLanguageChange={setSrcLang} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">To</span>
                  <LanguageSelector selectedLanguage={tgtLang} onLanguageChange={setTgtLang} />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm">Model:</label>
                  <label className="text-sm flex items-center gap-1">
                    <input type="radio" name="mt-model" checked={model==='indictrans'} onChange={() => setModel('indictrans')} />
                    IndicTrans
                  </label>
                  <label className="text-sm flex items-center gap-1">
                    <input type="radio" name="mt-model" checked={model==='google'} onChange={() => setModel('google')} />
                    Google
                  </label>
                  <label className="text-sm flex items-center gap-1">
                    <input type="radio" name="mt-model" checked={model==='nllb'} onChange={() => setModel('nllb')} />
                    Meta NLLB
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={handleTranslate} disabled={loading}>
                  {loading ? 'Translating...' : 'Translate'}
                </Button>
                <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
              </div>
              {error && <div className="text-sm text-red-500">{error}</div>}
            </div>
            {result && (
              <div className="p-4 rounded-lg border border-border/40 bg-card space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-muted-foreground">Translation ({languages[tgtLang as keyof typeof languages] || tgtLang}):</div>
                  <Button size="sm" variant="outline" onClick={handleCopy}>{copied ? 'Copied' : 'Copy'}</Button>
                </div>
                <p className="whitespace-pre-wrap leading-relaxed">{result}</p>
                <div className="pt-2 border-t border-border/40">
                  <Button 
                    onClick={() => navigate('/tts', { 
                      state: { 
                        text: result, 
                        lang_code: tgtLang,
                        src_text: transcription,
                        src_lang: srcLang
                      } 
                    })}
                    className="w-full"
                  >
                    Continue to TTS →
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground">No transcription provided. Go back to ASR and try again.</p>
            <Button variant="outline" onClick={() => navigate('/chat')}>Go to Chat</Button>
          </div>
        )}
      </div>
    </div>
  )
}


