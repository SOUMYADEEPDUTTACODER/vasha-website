import { useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Progress } from "@/components/ui/progress"
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
  const [mtProgress, setMtProgress] = useState<number | null>(null)

  const handleTranslate = async () => {
    if (!transcription) return
    setLoading(true)
    setMtProgress(0)
    let mtInterval: any = null
    mtInterval = window.setInterval(() => {
      setMtProgress((p) => {
        if (p === null) return 1
        const next = p + Math.floor(Math.random() * 8) + 3
        return next >= 90 ? 90 : next
      })
    }, 300)
    setError(null)
    try {
      const res = await mtService.translate(transcription, srcLang, tgtLang, model)
      setResult(res.translation)
    } catch (e: any) {
      setError(e?.message || 'Translation failed')
    } finally {
      // complete progress
      setMtProgress(100)
      setTimeout(() => setMtProgress(null), 700)
      if (mtInterval) clearInterval(mtInterval)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-sky-900 text-slate-100">
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
            <div className="p-4 rounded-lg border border-border/40 bg-card/60 flex flex-col gap-3 backdrop-blur-sm">
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
                  <span className="text-sm text-muted-foreground mr-2">Model:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setModel('indictrans')}
                      className={`px-3 py-1 rounded-full text-sm font-semibold transition-transform ${model==='indictrans' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-2xl scale-105' : 'bg-background/20 text-slate-200'}`}
                    >
                      IndicTrans
                    </button>
                    <button
                      onClick={() => setModel('google')}
                      className={`px-3 py-1 rounded-full text-sm font-semibold transition-transform ${model==='google' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-2xl scale-105' : 'bg-background/20 text-slate-200'}`}
                    >
                      Google
                    </button>
                    <button
                      onClick={() => setModel('nllb')}
                      className={`px-3 py-1 rounded-full text-sm font-semibold transition-transform ${model==='nllb' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-2xl scale-105' : 'bg-background/20 text-slate-200'}`}
                    >
                      Meta NLLB
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={handleTranslate} disabled={loading} className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold shadow-[0_14px_40px_rgba(139,92,246,0.18)] hover:scale-105 transform transition-all duration-300">
                  {loading ? 'Translating...' : 'Translate'}
                </Button>
                <Button variant="outline" onClick={() => navigate(-1)} className="text-slate-100 border-border/40">Back</Button>
              </div>
              {mtProgress !== null && (
                <div className="mt-3 w-full">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Translation progress</span>
                    <span className="font-medium">{Math.min(mtProgress,100)}%</span>
                  </div>
                  <Progress value={Math.min(mtProgress,100)} />
                </div>
              )}
              {error && <div className="text-sm text-red-500">{error}</div>}
            </div>
            {result && (
              <div className="p-4 rounded-lg border border-border/40 bg-card space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-muted-foreground">Translation ({languages[tgtLang as keyof typeof languages] || tgtLang}):</div>
                  <Button size="sm" variant="outline" onClick={handleCopy} className="text-slate-100 border-border/40">{copied ? 'Copied' : 'Copy'}</Button>
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
                    className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold shadow-[0_12px_30px_rgba(99,102,241,0.18)] hover:scale-105 transform transition-all duration-300 rounded-xl"
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


