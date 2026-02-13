import { Link } from "react-router-dom"
import { Book, MessageCircle, Shield, Sparkles, ArrowLeft, ExternalLink, Mic, Languages, FileAudio, Cpu, Settings, PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function UserDocs() {
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
              <h1 className="text-4xl font-bold">User Manual & Documentation</h1>
              <p className="text-xl text-muted-foreground mt-2">
                Comprehensive guide to Vasha AI for users and developers
              </p>
            </div>
          </div>
        </div>

        {/* Overview Section */}
        <Card className="mb-12 shadow-card border-border/40">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">How Vasha AI Works</CardTitle>
            <CardDescription>
              Vasha AI is an end-to-end Speech-to-Speech translation application. It processes your input audio,
              transcribes it to text, translates the text, and then generates new speech in the target language.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="p-4 rounded-xl bg-accent/20 border border-border/50">
                <Mic className="h-8 w-8 text-indigo-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-1">1. Audio Input</h3>
                <p className="text-sm text-muted-foreground">Record voice, upload files, or paste YouTube links.</p>
              </div>
              <div className="p-4 rounded-xl bg-accent/20 border border-border/50">
                <Languages className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-1">2. Translation</h3>
                <p className="text-sm text-muted-foreground">AI converts speech to text and translates it.</p>
              </div>
              <div className="p-4 rounded-xl bg-accent/20 border border-border/50">
                <PlayCircle className="h-8 w-8 text-pink-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-1">3. Synthesis</h3>
                <p className="text-sm text-muted-foreground">Generates natural-sounding speech in the new language.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Documentation Tabs */}
        <Tabs defaultValue="guide" className="space-y-8">
          <TabsList className="grid w-full sm:w-[400px] grid-cols-2 mx-auto">
            <TabsTrigger value="guide">User Guide</TabsTrigger>
            <TabsTrigger value="technical">Technical Docs</TabsTrigger>
          </TabsList>

          {/* User Guide Tab */}
          <TabsContent value="guide" className="space-y-12">

            {/* Step 1: Input & ASR */}
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-indigo-500">
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 font-bold">1</span>
                  <h2 className="text-2xl font-bold">Voice Input & Processing</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Start by providing audio input. You can use the <strong>microphone</strong> for real-time recording,
                  <strong>upload audio/video files</strong> directly from your device, or paste a <strong>YouTube URL</strong>.
                  <br /><br />
                  Once uploaded, select your preferred <strong>ASR (Speech Recognition) Model</strong> depending on the language.
                  Use <em>Whisper</em> for global languages and <em>AI4Bharat</em> for Indian languages.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground bg-accent/10 p-4 rounded-lg">
                  <li className="flex gap-2"><Mic className="h-4 w-4" /> Click "Record" to start speaking.</li>
                  <li className="flex gap-2"><FileAudio className="h-4 w-4" /> Upload .mp3, .wav, or .mp4 files.</li>
                  <li className="flex gap-2"><Settings className="h-4 w-4" /> Toggle "Auto-Flow" to skip manual steps.</li>
                </ul>
              </div>
              <div className="rounded-xl overflow-hidden border border-border/40 shadow-xl bg-card">
                <img
                  src="/assets/diagrams/Voice Translation.jpeg"
                  alt="Voice Translation Process"
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="p-2 text-center text-xs text-muted-foreground bg-accent/20">
                  Figure 1: Voice Translation & Input Processing Flow
                </div>
              </div>
            </div>

            {/* Step 2: Translation */}
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="order-2 lg:order-1 rounded-xl overflow-hidden border border-border/40 shadow-xl bg-card">
                <img
                  src="/assets/diagrams/Text Translation.jpeg"
                  alt="Text Translation Interface"
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="p-2 text-center text-xs text-muted-foreground bg-accent/20">
                  Figure 2: Text Translation & Editing Interface
                </div>
              </div>
              <div className="space-y-4 order-1 lg:order-2">
                <div className="flex items-center space-x-2 text-purple-500">
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 font-bold">2</span>
                  <h2 className="text-2xl font-bold">Text Translation</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  After transcription, you will see the detected text. Here you can <strong>edit the text</strong> if needed
                  to correct any recognition errors.
                  <br /><br />
                  Select your <strong>Target Language</strong> from the dropdown menu. Vasha AI supports a wide range of
                  Indian and Global languages. Click "Translate" to convert the text using high-accuracy models like <em>IndicTrans2</em>.
                </p>
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg text-sm text-yellow-700 dark:text-yellow-400">
                  <strong>Tip:</strong> Always review the transcription before translating to ensure the highest quality output.
                </div>
              </div>
            </div>

            {/* Step 3: Audio Generation */}
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-pink-500">
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-pink-100 dark:bg-pink-900 font-bold">3</span>
                  <h2 className="text-2xl font-bold">Audio Generation (TTS)</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  The final step is converting the translated text back into speech. Select a <strong>TTS (Text-to-Speech) Model</strong>.
                  <br /><br />
                  <strong>XTTS</strong> allows for voice cloning—it can use a sample of your own voice to generate the translated speech.
                  Alternatively, use standard models like <strong>Indic TTS</strong> for native-sounding Indian regional speech.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-accent text-xs">Voice Cloning</span>
                  <span className="px-3 py-1 rounded-full bg-accent text-xs">High Fidelity</span>
                  <span className="px-3 py-1 rounded-full bg-accent text-xs">Multi-Speaker</span>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden border border-border/40 shadow-xl bg-card">
                <img
                  src="/assets/diagrams/Audio Generation.jpeg"
                  alt="Audio Generation Workflow"
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="p-2 text-center text-xs text-muted-foreground bg-accent/20">
                  Figure 3: Audio Generation & TTS Pipeline
                </div>
              </div>
            </div>

          </TabsContent>

          {/* Technical Docs Tab */}
          <TabsContent value="technical">
            <Card className="shadow-card border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  System Architecture & Models
                </CardTitle>
                <CardDescription>Detailed overview of the underlying technologies.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">

                <section>
                  <h3 className="text-lg font-semibold mb-3 border-b border-border/50 pb-2">1. Automatic Speech Recognition (ASR)</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">OpenAI Whisper</h4>
                      <p className="text-sm text-muted-foreground">Used for robust multi-lingual transcription. Supports various model sizes (tiny to large-v3) depending on available VRAM and latency requirements.</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">AI4Bharat Conformer</h4>
                      <p className="text-sm text-muted-foreground">Specialized state-of-the-art model for Indian languages. Performs better on specific dialects of Hindi, Tamil, Bengali, etc.</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3 border-b border-border/50 pb-2">2. Language Identification (LID)</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">Whisper (Global)</h4>
                      <p className="text-sm text-muted-foreground">Utilizes Whisper's built-in language detection capabilities for accurate identification of global languages.</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">IndicLID (Local)</h4>
                      <p className="text-sm text-muted-foreground">A specialized model for distinguishing between various Indian languages and dialects with high precision.</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3 border-b border-border/50 pb-2">3. Machine Translation (MT)</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    The backend orchestrates translation services, falling back to different providers if one fails.
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                    <li><strong>IndicTrans2:</strong> Transformer-based models fine-tuned for Indian-to-Indian and Indian-to-English translation tasks.</li>
                    <li><strong>Facebook NLLB:</strong> "No Language Left Behind" model used for supporting 200+ global languages.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3 border-b border-border/50 pb-2">4. Text-to-Speech (TTS)</h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="xtts">
                      <AccordionTrigger>Coqui XTTS v2</AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        Supports zero-shot voice cloning. The system extracts speaker embeddings from the input audio (or first 6 seconds) and conditions the TTS model to replicate the speaker's timbre in the target language.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="parler">
                      <AccordionTrigger>Indic Parler-TTS</AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        High-quality natural sounding speech synthesis specifically tuned for Indian languages. Does not support voice cloning but offers superior prosody for regional languages.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3 border-b border-border/50 pb-2">Diagram References</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="border border-border/20 rounded p-2">
                      <img src="/assets/diagrams/Voice Translation.jpeg" alt="Arch Diagram 1" className="w-full h-auto rounded opacity-80 hover:opacity-100 transition-opacity" />
                      <p className="text-xs text-center mt-2 text-muted-foreground">Input & ASR Architecture</p>
                    </div>
                    <div className="border border-border/20 rounded p-2">
                      <img src="/assets/diagrams/Text Translation.jpeg" alt="Arch Diagram 2" className="w-full h-auto rounded opacity-80 hover:opacity-100 transition-opacity" />
                      <p className="text-xs text-center mt-2 text-muted-foreground">Translation Logic</p>
                    </div>
                    <div className="border border-border/20 rounded p-2">
                      <img src="/assets/diagrams/Audio Generation.jpeg" alt="Arch Diagram 3" className="w-full h-auto rounded opacity-80 hover:opacity-100 transition-opacity" />
                      <p className="text-xs text-center mt-2 text-muted-foreground">Synthesis Pipeline</p>
                    </div>
                  </div>
                </section>

              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Support Section */}
        <div className="mt-16 text-center space-y-4">
          <h3 className="text-xl font-semibold">Need more help?</h3>
          <div className="flex justify-center gap-4">
            <Button variant="outline" className="flex items-center space-x-2">
              <ExternalLink className="h-4 w-4" />
              <span>API Documentation</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4" />
              <span>Join Community</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
