import { motion } from "framer-motion";
import Navbar from "../components/layout/Navbar.jsx";
import Footer from "../components/layout/Footer.jsx";
import Hero from "../components/landing/Hero.jsx";
import Statistics from "../components/landing/Statistics.jsx";
import Features from "../components/landing/Features.jsx";
import InteractiveShowcase from "../components/landing/InteractiveShowcase.jsx";
import HowItWorks from "../components/landing/HowItWorks.jsx";
import Departments from "../components/landing/Departments.jsx";
import Testimonials from "../components/landing/Testimonials.jsx";
import CTA from "../components/landing/CTA.jsx";

export default function LandingPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Navbar />
      <main>
        <Hero />
        <Statistics />
        <Features />
        <InteractiveShowcase />
        <HowItWorks />
        <Departments />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </motion.div>
  );
}
