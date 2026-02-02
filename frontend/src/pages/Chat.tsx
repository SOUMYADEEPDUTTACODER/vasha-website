import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Bot, User, Loader2, LinkIcon, Send, AlertCircle, Copy, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Header } from "@/components/layout/header"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// Import custom components
import { AudioRecorder } from "@/components/chat/AudioRecorder"
import { FileUpload } from "@/components/chat/FileUpload"
import { LinkInput } from "@/components/chat/LinkInput"
import { LanguageSelector, languages } from "@/components/chat/LanguageSelector"
import { ModelSelector } from "@/components/chat/ModelSelector"
import { LIDModelSelector } from "@/components/chat/LIDModelSelector"
import { ChatHistory, ChatResponse } from "@/components/chat/ChatHistory"
import { AudioPlayer } from "@/components/chat/AudioPlayer"
import { FeedbackButton } from "@/components/chat/FeedbackButton"

// Import ASR service
import { asrService, ASRResponse } from "@/services/asrService"
import { chatService } from "@/services/chatService"
import { ffmpegService } from "@/services/ffmpegService"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  audioUrl?: string
}

export default function Chat() {
  const navigate = useNavigate()
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm Vasha AI. How can I help you today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessingASR, setIsProcessingASR] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [asrProgress, setAsrProgress] = useState<number | null>(null)
  const [conversionProgress, setConversionProgress] = useState<number>(0)
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Model selection
  const [selectedModel, setSelectedModel] = useState<string>("whisper")
  const [selectedWhisperSize, setSelectedWhisperSize] = useState<string>("base")
  const [selectedDecoding, setSelectedDecoding] = useState<string>("ctc")

  // LID model selection
  const [selectedLIDModel, setSelectedLIDModel] = useState<string>("whisper")

  // Automation state
  const [isAutomationEnabled, setIsAutomationEnabled] = useState<boolean>(false)
  const [targetLang, setTargetLang] = useState<string>("hi")

  // Detected language (from ASR response)
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null)

  // Media inputs
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [mediaLink, setMediaLink] = useState<string | null>(null)

  // Response history
  const [responses, setResponses] = useState<ChatResponse[]>([])

  // Post-ASR actions
  const [lastRecordingUrl, setLastRecordingUrl] = useState<string | null>(null)
  const [lastTranscription, setLastTranscription] = useState<string | null>(null)

  // Check backend availability on component mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const isAvailable = await asrService.checkBackendHealth()
        setBackendAvailable(isAvailable)
        if (!isAvailable) {
          toast({
            title: "Backend not available",
            description: "ASR features will not work. Please start the backend server.",
            variant: "destructive",
          })
        }
      } catch (error) {
        setBackendAvailable(false)
        console.error("Backend health check failed:", error)
      }
    }

    checkBackend()

      // Fetch persisted chat history for the logged-in user
      ; (async () => {
        try {
          const token = localStorage.getItem("access_token")
          if (!token) return
          const res = await chatService.getChats(50)
          if (res && res.messages) {
            const parsed = res.messages.map((m: any, idx: number) => ({
              id: `h-${idx}-${new Date(m.timestamp).getTime()}`,
              content: m.text,
              role: "assistant",
              timestamp: new Date(m.timestamp),
            }))
            // prepend fetched history to responses (most recent first is already reversed in API)
            setResponses((prev) => [...parsed.map((p: any) => ({ id: p.id, text: p.content, timestamp: p.timestamp, language: "unknown", audioUrl: undefined })), ...prev])
          }
        } catch (e) {
          console.warn("Failed to load chat history:", e)
        }
      })()
  }, [])

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if ((!input.trim() && !audioBlob && !audioFile && !mediaLink) || isLoading || isProcessingASR) return

    // Prepare user message content
    let content = input.trim()
    let transcription = ""

    // Process ASR if we have media inputs
    if (audioBlob || audioFile || mediaLink) {
      if (!backendAvailable) {
        toast({
          title: "Backend not available",
          description: "Cannot process audio/video. Please start the backend server.",
          variant: "destructive",
        })
        return
      }

      // start progress simulation for ASR
      setIsProcessingASR(true)
      setAsrProgress(0)
      let asrInterval: any = null
      asrInterval = window.setInterval(() => {
        setAsrProgress((p) => {
          if (p === null) return 1
          // increment slowly until 90%
          const next = p + Math.floor(Math.random() * 6) + 2
          return next >= 90 ? 90 : next
        })
      }, 300)

      try {
        let asrResponse: ASRResponse
        let fileToUpload: File | Blob | null = null;

        if (audioBlob) {
          fileToUpload = audioBlob;
        } else if (audioFile) {
          // Check if it's a video file that needs conversion
          if (audioFile.type.startsWith('video/')) {
            setIsConverting(true);
            setConversionProgress(0);
            try {
              toast({ title: "Converting video to audio...", description: "This might take a moment." });
              fileToUpload = await ffmpegService.convertToWav(audioFile, (progress) => {
                setConversionProgress(progress);
              });
              toast({ title: "Conversion complete!" });
            } catch (err) {
              console.error("Conversion failed:", err);
              toast({
                title: "Conversion failed",
                description: "Falling back to direct upload if possible.",
                variant: "destructive"
              });
              fileToUpload = audioFile;
            } finally {
              setIsConverting(false);
            }
          } else {
            fileToUpload = audioFile;
          }
        }

        if (audioBlob || (audioFile && fileToUpload)) {
          // Process microphone recording or file
          const fileToProcess = fileToUpload instanceof File
            ? fileToUpload
            : new File([fileToUpload!], "recording.webm", { type: 'audio/webm' });

          asrResponse = await asrService.processFileUpload(
            fileToProcess,
            selectedModel,
            selectedWhisperSize,
            selectedDecoding,
            selectedLIDModel
          )
        } else if (mediaLink) {
          // Process YouTube URL
          asrResponse = await asrService.processYouTubeAudio(
            mediaLink,
            selectedModel,
            selectedWhisperSize,
            selectedDecoding,
            selectedLIDModel
          )
        } else {
          throw new Error("No media input provided")
        }

        if (asrResponse.success) {
          transcription = asrResponse.transcription
          setDetectedLanguage(asrResponse.language)
          // keep latest recording/playback and download if mic was used
          if (audioBlob) {
            try {
              const url = URL.createObjectURL(audioBlob)
              setLastRecordingUrl(url)
            } catch { }
          }
          setLastTranscription(asrResponse.transcription)
          toast({
            title: "Transcription completed",
            description: `Detected: ${asrResponse.language_name} | Model: ${asrResponse.model_used}`,
          })
        } else {
          throw new Error(asrResponse.error || "ASR processing failed")
        }
      } catch (error) {
        console.error("ASR processing error:", error)
        toast({
          title: "ASR processing failed",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive",
        })
        // ensure progress completes on error
        setAsrProgress(100)
        setTimeout(() => setAsrProgress(null), 700)
        setIsProcessingASR(false)
        return
      } finally {
        // complete progress and clear interval
        setAsrProgress(100)
        setTimeout(() => setAsrProgress(null), 700)
        if (asrInterval) clearInterval(asrInterval)
        // small delay then reset
        setTimeout(() => setIsProcessingASR(false), 200)
      }
    }

    // Automation: If enabled, navigate directly to MT page with configuration
    if (isAutomationEnabled && transcription) {
      // Small delay to allow UI to update briefly (optional, mainly for UX)
      setTimeout(() => {
        navigate('/mt', {
          state: {
            transcription,
            language: detectedLanguage,
            audioUrl: audioBlob ? URL.createObjectURL(audioBlob) : (audioFile ? URL.createObjectURL(audioFile) : null), // Handle file URL if needed
            targetLanguage: targetLang,
            autoMode: true
          }
        })
      }, 500)
      return // Stop further processing in Chat page
    }

    // Combine text input with transcription
    if (transcription) {
      content = content
        ? `${content}\n\n[Transcription: ${transcription}]`
        : `[Transcription: ${transcription}]`
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content,
      role: "user",
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Clear media inputs
    setAudioBlob(null)
    setAudioFile(null)
    setMediaLink(null)

    // Simulate AI response with language info
    setTimeout(() => {
      const detectedLangName = detectedLanguage ? languages[detectedLanguage as keyof typeof languages] : "unknown"
      const responseText = `Thank you for your message${input.trim() ? `: "${input}"` : ""}${transcription ? `\n\nI heard: "${transcription}"` : ""}. This is an AI response from Vasha AI${detectedLanguage ? ` (detected language: ${detectedLangName})` : ""}. You can click on continue to run the machine tarnslation model.`

      // Generate a dummy audio URL for demo purposes (in real app, this would be from TTS API)
      const dummyAudioUrl = audioBlob
        ? URL.createObjectURL(audioBlob)
        : "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCIiIiIiIjAwMDAwMD4+Pj4+PklJSUlJSVdXV1dXV2ZmZmZmZnR0dHR0dIiIiIiIiJaWlpaWlqSkpKSkpLKysrKysr+/v7+/v87Ozs7OztbW1tbW1uTk5OTk5PH//wAAADlMYXZmNTguMTMuMTAyAAAAAAAAAAAkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseText,
        role: "assistant",
        timestamp: new Date(),
        audioUrl: dummyAudioUrl
      }

      setMessages(prev => [...prev, aiMessage])
      setIsLoading(false)

      // Add to response history
      const newResponse: ChatResponse = {
        id: aiMessage.id,
        text: responseText,
        timestamp: aiMessage.timestamp,
        language: detectedLanguage || "unknown",
        audioUrl: dummyAudioUrl
      }

      setResponses(prev => [newResponse, ...prev])

        // Persist assistant response to backend (if logged in)
        ; (async () => {
          try {
            const token = localStorage.getItem("access_token")
            if (!token) return
            await chatService.saveChat(newResponse.text)
          } catch (e) {
            console.warn("Failed to persist chat:", e)
          }
        })()
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ description: "Message copied to clipboard" })
  }

  const handleDownloadMessage = (text: string, id: string) => {
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `vasha-message-${id.substring(0, 8)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({ description: "Message downloaded" })
  }

  const handleAudioReady = (blob: Blob) => {
    setAudioBlob(blob)
    toast({
      description: "Audio recording ready",
    })
  }

  const handleFileSelected = (file: File) => {
    setAudioFile(file)
    toast({
      description: `File ${file.name} selected`,
    })
  }

  const handleLinkSubmit = (url: string) => {
    setMediaLink(url)
    toast({
      description: "Media link added",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-sky-900 text-slate-100">
      <Header />
      <FeedbackButton />
      <div className="container mx-auto h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-end p-4 space-x-3">
            <div className="flex flex-col items-end space-y-2">
              <ChatHistory responses={responses} />
              <button
                onClick={() => {
                  // Reset chat state and navigate to chat (refresh view)
                  setMessages([
                    {
                      id: "1",
                      content: "Hello! I'm Vasha AI. How can I help you today?",
                      role: "assistant",
                      timestamp: new Date(),
                    },
                  ])
                  setResponses([])
                  setDetectedLanguage(null)
                  setLastRecordingUrl(null)
                  setLastTranscription(null)
                  navigate('/chat')
                }}
                className="px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-sm font-semibold shadow-lg hover:scale-[1.02] transform transition-all duration-200"
              >
                New Chat
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8 gradient-primary">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[70%] px-4 py-3 rounded-2xl shadow-card ${message.role === "user"
                    ? "gradient-primary text-primary-foreground ml-auto"
                    : "bg-card border border-border/40"
                    }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>

                      {message.audioUrl && message.role === "assistant" && (
                        <div className="mt-3">
                          <AudioPlayer audioUrl={message.audioUrl} />
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0 flex flex-col items-end space-y-1">
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleCopyMessage(message.content)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleDownloadMessage(message.content, message.id)}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <span className={`text-xs ${message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                {message.role === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 gradient-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-card border border-border/40 px-4 py-3 rounded-2xl shadow-card">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Vasha AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Backend Status Alert */}
        {backendAvailable === false && (
          <div className="border-t border-border/40 bg-card/50 backdrop-blur-sm p-4">
            <div className="max-w-4xl mx-auto">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Backend server is not available. ASR features will not work. Please start the backend server on port 8000.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="border-t border-border/40 bg-card/50 backdrop-blur-sm p-4">
          <div className="max-w-4xl mx-auto">
            {/* Input row */}
            <div className="flex items-center gap-4 mb-3">
              <div className="flex-1">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a message or record/upload audio..."
                  className="w-full min-h-[56px] max-h-40 resize-y p-3 rounded-lg border border-border/40 bg-background/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div className="flex flex-col items-end space-y-2">
                <Button
                  onClick={handleSend}
                  disabled={(
                    (!audioBlob && !audioFile && !mediaLink && !input.trim()) ||
                    isLoading ||
                    isProcessingASR ||
                    isConverting
                  )}
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold shadow-[0_12px_30px_rgba(99,102,241,0.18)] hover:scale-105 transform transition-all duration-300 flex items-center space-x-2 px-4 py-2 rounded-xl"
                >
                  {isLoading || isProcessingASR || isConverting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span className="text-sm">
                    {isConverting ? `Converting ${conversionProgress}%` : isProcessingASR ? "Processing..." : "Send"}
                  </span>
                </Button>
                <div className="text-xs text-muted-foreground">Press Enter to send</div>
              </div>
            </div>
            {/* Post-ASR actions: Play, Download, Continue */}
            {lastTranscription && (
              <div className="mb-4 p-3 bg-background/50 rounded-lg border border-border/40 flex flex-col sm:flex-row items-center gap-3 justify-between">
                <div className="text-sm text-muted-foreground w-full sm:w-auto">
                  ASR ready. You can play, download, or continue to MT.
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {lastRecordingUrl && (
                    <div className="min-w-[200px]">
                      <AudioPlayer audioUrl={lastRecordingUrl} />
                    </div>
                  )}
                  {lastRecordingUrl && (
                    <a
                      href={lastRecordingUrl}
                      download="recording.webm"
                      className="px-3 py-2 text-sm rounded-md border border-border/40 hover:bg-accent"
                    >
                      Download
                    </a>
                  )}
                  <Button
                    onClick={() => navigate('/mt', { state: { transcription: lastTranscription, language: detectedLanguage, audioUrl: lastRecordingUrl } })}
                    className="gradient-primary text-primary-foreground"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2 p-3 bg-gradient-to-br from-white/5 to-white/3 rounded-xl border border-border/30 shadow-2xl transform-gpu hover:-translate-y-1 transition-transform">
                <div className="pr-2 border-r border-border/20 mr-2">
                  <span className="text-xs text-muted-foreground">ASR Upload</span>
                </div>
                <AudioRecorder onAudioReady={handleAudioReady} />
                <Separator orientation="vertical" className="h-6" />
                <FileUpload onFileSelected={handleFileSelected} />
                <Separator orientation="vertical" className="h-6" />
                <LinkInput onLinkSubmit={handleLinkSubmit} />
                {asrProgress !== null && (
                  <div className="w-64 ml-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Processing</span>
                      <span className="font-medium">{Math.min(asrProgress, 100)}%</span>
                    </div>
                    <Progress value={Math.min(asrProgress, 100)} />
                  </div>
                )}
              </div>

              {/* Language Detection Status */}
              {detectedLanguage && (
                <div className="p-3 bg-background/50 rounded-lg border border-border/40">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-muted-foreground">Detected:</span>
                    <span className="font-medium">{languages[detectedLanguage as keyof typeof languages]}</span>
                  </div>
                </div>
              )}

              <div className="p-3 bg-background/50 rounded-lg border border-border/40">
                <div className="font-medium text-sm tracking-tight">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">ASR Model</span>
                      <span className="px-2 py-0.5 text-[11px] rounded-full bg-primary/10 text-primary font-semibold">ASR</span>
                    </div>
                    <div className="h-1.5 w-20 rounded-full bg-gradient-to-r from-primary to-accent shadow-md transform rotate-1" />
                  </div>
                  <ModelSelector
                    selectedModel={selectedModel}
                    onModelChange={setSelectedModel}
                    selectedWhisperSize={selectedWhisperSize}
                    onWhisperSizeChange={setSelectedWhisperSize}
                    selectedDecoding={selectedDecoding}
                    onDecodingChange={setSelectedDecoding}
                  />
                </div>
              </div>

              <div className="p-3 bg-background/50 rounded-lg border border-border/40">
                <div className="font-medium text-sm tracking-tight">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">LID Model</span>
                      <span className="px-2 py-0.5 text-[11px] rounded-full bg-foreground/5 text-muted-foreground font-semibold">LID</span>
                    </div>
                    <div className="h-1.5 w-20 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-md transform -rotate-1" />
                  </div>
                  <LIDModelSelector
                    selectedLIDModel={selectedLIDModel}
                    onLIDModelChange={setSelectedLIDModel}
                  />
                </div>
              </div>

              {/* Automation Controls */}
              <div className="p-3 bg-background/50 rounded-lg border border-border/40">
                <div className="font-medium text-sm tracking-tight space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">Automation</span>
                      <span className="px-2 py-0.5 text-[11px] rounded-full bg-blue-500/10 text-blue-500 font-semibold">AUTO</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="automation-mode"
                      checked={isAutomationEnabled}
                      onCheckedChange={setIsAutomationEnabled}
                    />
                    <Label htmlFor="automation-mode" className="text-xs cursor-pointer">Enable Auto-Flow</Label>
                  </div>

                  {isAutomationEnabled && (
                    <div className="mt-2 space-y-1">
                      <span className="text-xs text-muted-foreground block">Target Language</span>
                      <LanguageSelector
                        selectedLanguage={targetLang}
                        onLanguageChange={setTargetLang}
                      />
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={handleSend}
                disabled={(
                  (!audioBlob && !audioFile && !mediaLink) ||
                  isLoading ||
                  isProcessingASR
                )}
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold shadow-[0_14px_40px_rgba(139,92,246,0.18)] hover:scale-105 transform transition-all duration-300 flex items-center space-x-2 px-6 py-3 rounded-2xl"
              >
                {isLoading || isProcessingASR ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>{isProcessingASR ? "Processing..." : "Send"}</span>
              </Button>
            </div>

            {/* Media indicators */}
            {(audioBlob || audioFile || mediaLink) && (
              <div className="flex flex-wrap gap-2 items-center justify-center px-4 py-3 mt-3 bg-background/50 rounded-lg border border-border/40">
                <span className="text-xs text-muted-foreground">Media:</span>
                {audioBlob && (
                  <div className="flex items-center space-x-2 rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1 text-xs text-green-700 dark:text-green-300">
                    <span>Audio recording</span>
                  </div>
                )}
                {audioFile && (
                  <div className="flex items-center space-x-2 rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs text-blue-700 dark:text-blue-300">
                    <span>{audioFile.name}</span>
                  </div>
                )}
                {mediaLink && (
                  <div className="flex items-center space-x-2 rounded-full bg-purple-100 dark:bg-purple-900/30 px-3 py-1 text-xs text-purple-700 dark:text-purple-300">
                    <LinkIcon className="h-3 w-3" />
                    <span className="truncate max-w-[100px]">{mediaLink}</span>
                  </div>
                )}
                {isProcessingASR && (
                  <div className="flex items-center space-x-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 text-xs text-yellow-700 dark:text-yellow-300">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Detecting language...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}