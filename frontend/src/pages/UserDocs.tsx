import { Link } from "react-router-dom"
import { Book, MessageCircle, Shield, Sparkles, ArrowLeft, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function UserDocs() {
  const guides = [
    {
      icon: MessageCircle,
      title: "Getting Started with Chat",
      description: "Learn how to effectively communicate with Vasha AI",
      content: [
        "Start a conversation with clear, specific questions",
        "Use natural language - no special syntax required",
        "Break complex requests into smaller parts",
        "Provide context for better responses"
      ]
    },
    {
      icon: Sparkles,
      title: "Best Practices",
      description: "Tips to get the most out of Vasha AI",
      content: [
        "Be specific about what you need",
        "Ask follow-up questions for clarification",
        "Use examples to illustrate your requests",
        "Iterate and refine your prompts"
      ]
    },
    {
      icon: Shield,
      title: "Privacy & Safety",
      description: "How we protect your data and ensure safe interactions",
      content: [
        "Conversations are encrypted in transit",
        "No personal data stored permanently",
        "Content filtering for safety",
        "Report inappropriate responses"
      ]
    }
  ]

  const faqs = [
    {
      question: "How accurate are Vasha AI's responses?",
      answer: "Vasha AI provides highly accurate responses based on its training data. However, always verify important information from authoritative sources."
    },
    {
      question: "Can I use Vasha AI for commercial purposes?",
      answer: "Yes, Vasha AI can be used for commercial applications. Check our pricing page for enterprise plans and API access."
    },
    {
      question: "What languages does Vasha AI support?",
      answer: "Vasha AI supports multiple languages including English, Spanish, French, German, Chinese, Japanese, and many more."
    },
    {
      question: "Is there a limit to conversation length?",
      answer: "Free users have a daily message limit. Premium users enjoy unlimited conversations with priority response times."
    }
  ]

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
              <h1 className="text-4xl font-bold">User Documentation</h1>
              <p className="text-xl text-muted-foreground mt-2">
                Everything you need to know about using Vasha AI effectively
              </p>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <Card className="mb-8 shadow-card border-border/40">
          <CardHeader>
            <CardTitle>Welcome to Vasha AI</CardTitle>
            <CardDescription>
              Vasha AI is your intelligent conversation partner, ready to help with a wide range of tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-primary">What can Vasha AI help with?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center space-x-2">
                    <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                    <span>Answer questions and provide explanations</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                    <span>Help with writing and editing</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                    <span>Assist with analysis and research</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                    <span>Creative projects and brainstorming</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-primary">Quick Start Tips</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center space-x-2">
                    <div className="h-1.5 w-1.5 bg-accent rounded-full" />
                    <span>Start with "Hello" to begin a conversation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="h-1.5 w-1.5 bg-accent rounded-full" />
                    <span>Ask specific questions for better answers</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="h-1.5 w-1.5 bg-accent rounded-full" />
                    <span>Feel free to ask for clarification</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="h-1.5 w-1.5 bg-accent rounded-full" />
                    <span>Try different conversation styles</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6">
              <Button asChild className="gradient-primary text-primary-foreground">
                <Link to="/chat">Start Chatting Now</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Guides Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {guides.map((guide, index) => (
            <Card key={index} className="shadow-card border-border/40 hover:shadow-glow transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <guide.icon className="h-5 w-5 text-primary" />
                  <span>{guide.title}</span>
                </CardTitle>
                <CardDescription>{guide.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {guide.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-sm text-muted-foreground flex items-center space-x-2">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <Card className="shadow-card border-border/40">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>
              Common questions about using Vasha AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-border/40 last:border-b-0 pb-4 last:pb-0">
                  <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="flex items-center space-x-2 hover:shadow-card transition-shadow duration-300">
                <ExternalLink className="h-4 w-4" />
                <span>Contact Support</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2 hover:shadow-card transition-shadow duration-300">
                <MessageCircle className="h-4 w-4" />
                <span>Community Forum</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}