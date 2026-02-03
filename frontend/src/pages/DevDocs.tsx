import { Link } from "react-router-dom"
import { Code, ArrowLeft, ExternalLink, Github, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"

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

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mt-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative aspect-auto max-w-[400px] overflow-hidden rounded-2xl border-2 border-border/50 bg-card">
                <img
                  src="/devloperphoto.jpg"
                  alt="Developer Team"
                  className="w-full h-full object-cover transform transition duration-500 group-hover:scale-105"
                />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
                <div className="h-12 w-12 gradient-primary rounded-lg flex items-center justify-center">
                  <Code className="h-6 w-6 text-primary-foreground" />
                </div>
                <h1 className="text-4xl font-bold">Developer Documentation</h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                Build with Vasha AI - comprehensive guides and API reference. Meet the engineers behind the technology that bridges language barriers worldwide.
              </p>
            </div>
          </div>
        </div>

        {/* Developer Profiles */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Soumyadeep Dutta */}
          <Card className="shadow-card border-border/40 hover:shadow-glow transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-6 mb-4">
                <Dialog>
                  <DialogTrigger>
                    <div className="relative h-60 w-60 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg cursor-pointer hover:scale-105 transition-transform duration-300">
                      <img
                        src="/soumyadeephoto.jpg"
                        alt="Soumyadeep Dutta"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-none shadow-none">
                    <img
                      src="/soumyadeephoto.jpg"
                      alt="Soumyadeep Dutta"
                      className="w-full h-auto rounded-lg shadow-2xl"
                    />
                  </DialogContent>
                </Dialog>
                <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">SOUMYADEEP DUTTA</CardTitle>
              </div>
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
              <div className="flex items-center gap-6 mb-4">
                <Dialog>
                  <DialogTrigger>
                    <div className="relative h-60 w-60 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg cursor-pointer hover:scale-105 transition-transform duration-300">
                      <img
                        src="/deepphoto.jpg"
                        alt="Deep Habiswashi"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-none shadow-none">
                    <img
                      src="/deepphoto.jpg"
                      alt="Deep Habiswashi"
                      className="w-full h-auto rounded-lg shadow-2xl"
                    />
                  </DialogContent>
                </Dialog>
                <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">DEEP HABISWASHI</CardTitle>
              </div>
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

          {/* Sudeshna Mohanty */}
          <Card className="shadow-card border-border/40 hover:shadow-glow transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-6 mb-4">
                <Dialog>
                  <DialogTrigger>
                    <div className="relative h-60 w-60 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg cursor-pointer hover:scale-105 transition-transform duration-300">
                      <img
                        src="/sudeshna.jpg"
                        alt="Sudeshna Mohanty"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-none shadow-none">
                    <img
                      src="/sudeshna.jpg"
                      alt="Sudeshna Mohanty"
                      className="w-full h-auto rounded-lg shadow-2xl"
                    />
                  </DialogContent>
                </Dialog>
                <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">SUDESHNA MOHANTY</CardTitle>
              </div>
              <CardDescription>I am an Electronics & Computer Science Engineering undergraduate, with an additional academic foundation in Data Science. My technical background spans Python, Java, and C++, with hands-on experience in machine learning, natural language processing, computer vision, real-time data processing, cloud based deployment, networking fundamentals, and IoT-driven hardware systems involving sensors and embedded architectures. Through extensive project-based development, I have worked on AI model design, data preprocessing, real-time inference pipelines, system integration, and performance optimization, often combining software, data, and system-level thinking.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button asChild variant="outline" className="gap-2">
                  <a href="https://GitHub.com/sudeshna1310" target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4" /> GitHub
                  </a>
                </Button>
                <Button asChild variant="outline" className="gap-2">
                  <a href="https://www.linkedin.com/in/sudeshna2003" target="_blank" rel="noopener noreferrer">
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
              <Button asChild variant="outline" className="justify-between hover:shadow-card transition-shadow duration-300">
                <a href="https://GitHub.com/sudeshna1310" target="_blank" rel="noopener noreferrer">
                  <span>Sudeshna on GitHub</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" className="justify-between hover:shadow-card transition-shadow duration-300">
                <a href="https://www.linkedin.com/in/sudeshna2003" target="_blank" rel="noopener noreferrer">
                  <span>Sudeshna on LinkedIn</span>
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