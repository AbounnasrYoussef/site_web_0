import Hero from "@/components/(yabounna)/Hero";
import Trajectories from "@/components/(yabounna)/Trajectories";
import About from "@/components/(yabounna)/About";
import Contact from "@/components/(yabounna)/Contact";
import Footer from "@/components/footer";

export default function Page() {
  return (
    <main className="min-h-screen text-(--color-text) squared-bg">
        
        <Hero />
        <Trajectories />
        <About />
        <Contact/>
        <Footer/>
        
    </main>
  );
}