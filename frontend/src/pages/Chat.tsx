import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Bot, User, Loader2, LinkIcon, Send, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Header } from "@/components/layout/header"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Import custom components
import { AudioRecorder } from "@/components/chat/AudioRecorder"
import { FileUpload } from "@/components/chat/FileUpload"
import { LinkInput } from "@/components/chat/LinkInput"
import { LanguageSelector, languages } from "@/components/chat/LanguageSelector"
import { ModelSelector } from "@/components/chat/ModelSelector"
import { LIDModelSelector } from "@/components/chat/LIDModelSelector"
import { ChatHistory, ChatResponse } from "@/components/chat/ChatHistory"
import { AudioPlayer } from "@/components/chat/AudioPlayer"

// Import ASR service
import { asrService, ASRResponse } from "@/services/asrService"

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
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  
  // Model selection
  const [selectedModel, setSelectedModel] = useState<string>("whisper")
  const [selectedWhisperSize, setSelectedWhisperSize] = useState<string>("base")
  const [selectedDecoding, setSelectedDecoding] = useState<string>("ctc")
  
  // LID model selection
  const [selectedLIDModel, setSelectedLIDModel] = useState<string>("whisper")
  
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

      setIsProcessingASR(true)
      
      try {
        let asrResponse: ASRResponse
        
        if (audioBlob) {
          // Process microphone recording
          asrResponse = await asrService.processMicrophoneAudio(
            audioBlob,
            selectedModel,
            selectedWhisperSize,
            selectedDecoding,
            5,
            selectedLIDModel
          )
        } else if (audioFile) {
          // Process uploaded file
          asrResponse = await asrService.processFileUpload(
            audioFile,
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
            } catch {}
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
        setIsProcessingASR(false)
        return
      } finally {
        setIsProcessingASR(false)
      }
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
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
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
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-end p-4">
            <ChatHistory responses={responses} />
          </div>
        </div>

        {/* Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
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
                  className={`max-w-[85%] sm:max-w-[70%] px-4 py-3 rounded-2xl shadow-card ${
                    message.role === "user"
                      ? "gradient-primary text-primary-foreground ml-auto"
                      : "bg-card border border-border/40"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  
                  {message.audioUrl && message.role === "assistant" && (
                    <div className="mt-3">
                      <AudioPlayer audioUrl={message.audioUrl} />
                    </div>
                  )}
                  
                  <span className={`text-xs mt-2 block ${
                    message.role === "user" 
                      ? "text-primary-foreground/70" 
                      : "text-muted-foreground"
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
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
              <div className="flex items-center space-x-2 p-3 bg-background/50 rounded-lg border border-border/40">
                <AudioRecorder onAudioReady={handleAudioReady} />
                <Separator orientation="vertical" className="h-6" />
                <FileUpload onFileSelected={handleFileSelected} />
                <Separator orientation="vertical" className="h-6" />
                <LinkInput onLinkSubmit={handleLinkSubmit} />
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
                <ModelSelector
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                  selectedWhisperSize={selectedWhisperSize}
                  onWhisperSizeChange={setSelectedWhisperSize}
                  selectedDecoding={selectedDecoding}
                  onDecodingChange={setSelectedDecoding}
                />
              </div>
              
              <div className="p-3 bg-background/50 rounded-lg border border-border/40">
                <LIDModelSelector
                  selectedLIDModel={selectedLIDModel}
                  onLIDModelChange={setSelectedLIDModel}
                />
              </div>
              
              <Button
                onClick={handleSend}
                disabled={(
                  (!audioBlob && !audioFile && !mediaLink) || 
                  isLoading ||
                  isProcessingASR
                )}
                className="gradient-primary text-primary-foreground hover:shadow-glow transition-all duration-300 flex items-center space-x-2 px-6 py-3"
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