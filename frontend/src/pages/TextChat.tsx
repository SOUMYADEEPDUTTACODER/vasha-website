import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Header } from "@/components/layout/header"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { LanguageSelector, languages, isGlobal, isIndic } from "@/components/chat/LanguageSelector"
import { mtService } from "@/services/mtService"
import { ttsService } from "@/services/ttsService"
import { lidService } from "@/services/lidService"
import { AudioPlayer } from "@/components/chat/AudioPlayer"
import { chatService } from "@/services/chatService"
import { Download, Languages, Sparkles, Volume2, ArrowRight } from "lucide-react"

export default function TextChat() {
    const navigate = useNavigate()

    // Flow State
    const [step, setStep] = useState<1 | 2 | 3>(1) // 1: Input/Detect, 2: MT, 3: TTS

    // Data State
    const [inputText, setInputText] = useState("")
    const [detectedLang, setDetectedLang] = useState<string>("en")
    const [detectedLangName, setDetectedLangName] = useState<string>("")

    // MT State
    const [tgtLang, setTgtLang] = useState<string>("hi")
    const [mtModel, setMtModel] = useState<'google' | 'indictrans' | 'nllb'>("indictrans")
    const [mtResult, setMtResult] = useState<string | null>(null)

    // TTS State
    const [ttsModel, setTtsModel] = useState<'xtts' | 'gtts' | 'indic' | 'auto'>('auto')
    const [audioUrl, setAudioUrl] = useState<string | null>(null)

    // UI State
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [progress, setProgress] = useState<number | null>(null)
    const [copied, setCopied] = useState(false)

    // Handle auto-model selection adjustment when tgtLang changes
    useEffect(() => {
        if (isGlobal(tgtLang) && mtModel === 'indictrans') {
            setMtModel('google')
        } else if (isIndic(tgtLang) && mtModel === 'nllb') {
            setMtModel('indictrans')
        }
    }, [tgtLang])

    // Handle auto-model selection adjustment for TTS
    useEffect(() => {
        if (isGlobal(tgtLang)) {
            if (ttsModel === 'indic') setTtsModel('xtts')
        } else if (isIndic(tgtLang)) {
            if (ttsModel === 'xtts' || ttsModel === 'gtts') setTtsModel('indic')
        }
    }, [tgtLang])

    const startProgress = () => {
        setProgress(0)
        const interval = window.setInterval(() => {
            setProgress((p) => {
                if (p === null) return 1
                const next = p + Math.floor(Math.random() * 8) + 2
                return next >= 90 ? 90 : next
            })
        }, 300)
        return interval
    }

    const stopProgress = (interval: number) => {
        setProgress(100)
        setTimeout(() => setProgress(null), 700)
        if (interval) clearInterval(interval)
    }

    const handleDetect = async () => {
        if (!inputText.trim()) return
        setLoading(true)
        setError(null)
        const interval = startProgress()

        try {
            const res = await lidService.detectTextLanguage(inputText)
            if (res.success) {
                setDetectedLang(res.top_language)
                setDetectedLangName(res.language_name)
                setStep(2)
            } else {
                throw new Error(res.error || "Language detection failed")
            }
        } catch (e: any) {
            setError(e?.message || 'Detection failed')
        } finally {
            stopProgress(interval)
            setLoading(false)
        }
    }

    const handleTranslate = async () => {
        if (!inputText) return
        setLoading(true)
        setError(null)
        const interval = startProgress()

        try {
            const res = await mtService.translate(inputText, detectedLang, tgtLang, mtModel)
            setMtResult(res.translation)

            // Persist to backend
            try {
                const token = localStorage.getItem("access_token")
                if (token) await chatService.saveChat(res.translation)
            } catch (e) { console.warn(e) }

        } catch (e: any) {
            setError(e?.message || 'Translation failed')
        } finally {
            stopProgress(interval)
            setLoading(false)
        }
    }

    const handleGenerateSpeech = async () => {
        if (!mtResult) return
        setLoading(true)
        setError(null)
        setAudioUrl(null)
        const interval = startProgress()

        try {
            const res = await ttsService.generateSpeech(mtResult, tgtLang, ttsModel)
            const url = ttsService.getAudioUrl(res.audio_path)
            setAudioUrl(url)
        } catch (e: any) {
            setError(e?.message || 'TTS generation failed')
        } finally {
            stopProgress(interval)
            setLoading(false)
        }
    }

    const handleCopy = async () => {
        if (!mtResult) return
        try {
            await navigator.clipboard.writeText(mtResult)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        } catch { }
    }

    const handleDownload = () => {
        if (!audioUrl) return
        const link = document.createElement('a')
        link.href = audioUrl
        link.download = `vasha_tts_${Date.now()}.wav`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-sky-900 text-slate-100">
            <Header />
            <div className="container mx-auto p-6 max-w-4xl">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 rounded-2xl bg-primary/20 text-primary">
                        <Sparkles className="h-6 w-6" />
                    </div>
                    <h1 className="text-3xl font-bold">Text AI Interface</h1>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center justify-between mb-12 px-4">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex flex-col items-center gap-2 relative">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${step >= s ? 'bg-primary text-white shadow-glow' : 'bg-slate-800 text-slate-500'}`}>
                                {s === 1 && <Languages className="h-5 w-5" />}
                                {s === 2 && <ArrowRight className="h-5 w-5" />}
                                {s === 3 && <Volume2 className="h-5 w-5" />}
                            </div>
                            <span className={`text-xs font-medium ${step >= s ? 'text-primary' : 'text-slate-500'}`}>
                                {s === 1 ? 'Detection' : s === 2 ? 'Translation' : 'Speech'}
                            </span>
                            {s < 3 && (
                                <div className={`absolute left-12 top-5 h-0.5 w-[calc(100%-1rem)] sm:w-48 -z-10 transition-all duration-500 ${step > s ? 'bg-primary' : 'bg-slate-800'}`} />
                            )}
                        </div>
                    ))}
                </div>

                <div className="space-y-6">
                    {/* Step 1: Input & Detection */}
                    <div className={`transition-all duration-500 ${step === 1 ? 'opacity-100 scale-100' : 'opacity-40 scale-95 pointer-events-none hidden'}`}>
                        <div className="p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-semibold text-slate-400">Enter Text for Detection</label>
                                <div className="px-3 py-1 rounded-full bg-slate-800/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">FastText LID</div>
                            </div>
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Type or paste your text here..."
                                className="w-full min-h-[150px] p-4 rounded-2xl bg-slate-950/50 border border-white/10 focus:ring-2 focus:ring-primary/50 transition-all text-lg leading-relaxed placeholder:text-slate-600"
                            />
                            <Button
                                onClick={handleDetect}
                                disabled={loading || !inputText.trim()}
                                className="w-full h-14 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-lg rounded-2xl shadow-glow hover:scale-[1.01] transition-all"
                            >
                                {loading ? 'Detecting Language...' : 'Detect Language & Continue'}
                            </Button>
                        </div>
                    </div>

                    {/* Step 2: MT Options */}
                    {step >= 2 && (
                        <div className={`transition-all duration-500 ${step === 2 ? 'opacity-100' : 'opacity-40 scale-95 pointer-events-none'}`}>
                            <div className="p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl space-y-6">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="px-4 py-2 rounded-xl bg-primary/20 border border-primary/30">
                                            <span className="text-sm font-bold text-primary">Source: {detectedLangName || detectedLang}</span>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-slate-500" />
                                        <div className="flex items-center gap-3 p-1 rounded-xl bg-slate-900/50 border border-white/5">
                                            <span className="text-sm font-semibold text-slate-400 ml-2">Target:</span>
                                            <LanguageSelector selectedLanguage={tgtLang} onLanguageChange={setTgtLang} />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900/50 border border-white/5">
                                        {[
                                            { id: 'indictrans', label: 'IndicTrans', disable: isGlobal(tgtLang) },
                                            { id: 'google', label: 'Global', disable: false },
                                            { id: 'nllb', label: 'Meta NLLB', disable: isIndic(tgtLang) }
                                        ].map((m) => (
                                            <button
                                                key={m.id}
                                                disabled={m.disable as boolean}
                                                onClick={() => setMtModel(m.id as any)}
                                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mtModel === m.id ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'} ${m.disable ? 'opacity-20 cursor-not-allowed' : ''}`}
                                            >
                                                {m.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-slate-950/30 border border-white/5">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Input Content</div>
                                        <p className="text-sm text-slate-300 line-clamp-4">{inputText}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                                        <div className="text-[10px] font-bold text-indigo-400 uppercase mb-2">Translated Result</div>
                                        {mtResult ? (
                                            <p className="text-sm text-slate-300 line-clamp-4">{mtResult}</p>
                                        ) : (
                                            <div className="flex items-center justify-center h-20 text-slate-600 italic text-sm">Waiting for translation...</div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <Button
                                        onClick={handleTranslate}
                                        disabled={loading}
                                        className="flex-1 h-12 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/10"
                                    >
                                        {loading ? 'Translating...' : mtResult ? 'Retranslate' : 'Run Translation'}
                                    </Button>
                                    {mtResult && (
                                        <Button
                                            onClick={() => setStep(3)}
                                            className="flex-1 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl shadow-glow"
                                        >
                                            Continue to TTS →
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: TTS Options */}
                    {step === 3 && (
                        <div className="transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
                            <div className="p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl space-y-6">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <Volume2 className="h-5 w-5 text-primary" />
                                        <span className="font-bold">Speech Synthesis Settings</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900/50 border border-white/5">
                                        {[
                                            { id: 'auto', label: 'Auto' },
                                            { id: 'xtts', label: 'Coqui', disable: isIndic(tgtLang) },
                                            { id: 'gtts', label: 'Global' },
                                            { id: 'indic', label: 'Indic', disable: isGlobal(tgtLang) }
                                        ].map((m) => (
                                            <button
                                                key={m.id}
                                                disabled={m.disable as boolean}
                                                onClick={() => setTtsModel(m.id as any)}
                                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${ttsModel === m.id ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'} ${m.disable ? 'opacity-20 cursor-not-allowed' : ''}`}
                                            >
                                                {m.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-5 rounded-2xl bg-slate-950/50 border border-white/10">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm font-bold text-slate-400">Generated Synthesis</span>
                                        {audioUrl && (
                                            <Button size="sm" variant="ghost" onClick={handleDownload} className="text-primary hover:text-primary/80">
                                                <Download className="h-4 w-4 mr-2" />
                                                Download WAV
                                            </Button>
                                        )}
                                    </div>

                                    {audioUrl ? (
                                        <AudioPlayer audioUrl={audioUrl} />
                                    ) : (
                                        <div className="bg-slate-900/50 p-8 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-4">
                                            <Volume2 className="h-12 w-12 text-slate-700" />
                                            <div className="text-center">
                                                <p className="text-slate-400 font-medium">Ready to synthesize speech</p>
                                                <p className="text-xs text-slate-600 mt-1">Select your preferred model above and click generate</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-4">
                                    <Button variant="outline" onClick={() => setStep(2)} className="w-32 h-12 rounded-xl text-slate-400">Back</Button>
                                    <Button
                                        onClick={handleGenerateSpeech}
                                        disabled={loading}
                                        className="flex-1 h-12 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold rounded-xl shadow-glow"
                                    >
                                        {loading ? 'Synthesizing Audio...' : 'Generate Speech'}
                                    </Button>
                                    {audioUrl && (
                                        <Button
                                            onClick={() => {
                                                setStep(1);
                                                setInputText("");
                                                setMtResult(null);
                                                setAudioUrl(null);
                                                setDetectedLang("en");
                                                setDetectedLangName("");
                                            }}
                                            className="h-12 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl px-6"
                                        >
                                            Return to Chat
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {progress !== null && (
                        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-50">
                            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-glow space-y-2">
                                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-primary">
                                    <span>Processing...</span>
                                    <span>{Math.min(progress, 100)}%</span>
                                </div>
                                <Progress value={Math.min(progress, 100)} className="h-1.5" />
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
