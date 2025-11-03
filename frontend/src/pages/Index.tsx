import { Header } from "@/components/layout/header"
import { Hero } from "@/components/sections/hero"
import { useEffect } from "react"

const Index = () => {
  useEffect(() => {
    console.log("Index component mounted");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
      </main>
    </div>
  );
};

export default Index;
