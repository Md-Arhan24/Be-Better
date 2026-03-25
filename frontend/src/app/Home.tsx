import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Rules } from "./components/Rules";
import { Benefits } from "./components/Benefits";
import { Footer } from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <Hero />
      <Rules />
      <Benefits />
      <Footer />
    </div>
  );
}
