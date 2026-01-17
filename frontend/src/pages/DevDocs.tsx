import { Link } from "react-router-dom"
import { Code, ArrowLeft, ExternalLink, Github, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DevDocs() {
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
              <Code className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Developer Documentation</h1>
              <p className="text-xl text-muted-foreground mt-2">
                Build with Bhasha AI - comprehensive guides and API reference
              </p>
            </div>
          </div>
        </div>

        {/* Developer Profiles */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Soumyadeep Dutta */}
          <Card className="shadow-card border-border/40 hover:shadow-glow transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl">SOUMYADEEP DUTTA</CardTitle>
              <CardDescription>I’m an AI Engineer passionate about building intelligent systems that push the boundaries of what technology can achieve. My experience spans across Machine Learning, Deep Learning, Generative Adversarial Networks (GANs), and Large Language Models (LLMs) — using both PyTorch and TensorFlow to bring innovative ideas to life. I’ve worked on developing AI agents, creating generative models, and fine-tuning language models for real-world applications. My goal is to work on cutting-edge technologies that will shape the future of AI and redefine how humans and machines collaborate. Always eager to explore emerging trends in Generative AI, Reinforcement Learning, Multimodal AI, and Autonomous Systems — and to contribute to projects that make a meaningful global impact.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button asChild variant="outline" className="gap-2">
                  <a href="https://github.com/SOUMYADEEPDUTTACODER" target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4" /> GitHub
                  </a>
                </Button>
                <Button asChild variant="outline" className="gap-2">
                  <a href="https://www.linkedin.com/in/soumyadeep-dutta-01a1592b9" target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4" /> LinkedIn
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Deep Habiswashi */}
          <Card className="shadow-card border-border/40 hover:shadow-glow transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl">DEEP HABISWASHI</CardTitle>
              <CardDescription>I am a 4th-year Electronics & Computer Science Engineering student at KIIT University, currently residing in Bhubaneswar, Odisha. I have a strong foundation in data science, machine learning, and statistical analysis. My passion lies in transforming raw data into actionable insights and building intelligent systems that address real-world challenges. I am skilled in developing end-to-end data pipelines, creating predictive models, and deploying scalable AI solutions..</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button asChild variant="outline" className="gap-2">
                  <a href="https://github.com/DeepHabiswashi" target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4" /> GitHub
                  </a>
                </Button>
                <Button asChild variant="outline" className="gap-2">
                  <a href="https://www.linkedin.com/in/deephabiswashi/" target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4" /> LinkedIn
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resources (optional) */}
        <Card className="shadow-card border-border/40">
          <CardHeader>
            <CardTitle>Additional Resources</CardTitle>
            <CardDescription>More tools and resources to help you build amazing applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <Button asChild variant="outline" className="justify-between hover:shadow-card transition-shadow duration-300">
                <a href="https://github.com/SOUMYADEEPDUTTACODER" target="_blank" rel="noopener noreferrer">
                  <span>Soumyadeep on GitHub</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" className="justify-between hover:shadow-card transition-shadow duration-300">
                <a href="https://www.linkedin.com/in/soumyadeep-dutta-01a1592b9" target="_blank" rel="noopener noreferrer">
                  <span>Soumyadeep on LinkedIn</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" className="justify-between hover:shadow-card transition-shadow duration-300">
                <a href="https://github.com/DeepHabiswashi" target="_blank" rel="noopener noreferrer">
                  <span>Deep on GitHub</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" className="justify-between hover:shadow-card transition-shadow duration-300">
                <a href="https://www.linkedin.com/in/deephabiswashi/" target="_blank" rel="noopener noreferrer">
                  <span>Deep on LinkedIn</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}