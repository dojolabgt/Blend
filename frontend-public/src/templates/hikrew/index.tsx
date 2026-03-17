import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { HowItWorks } from "./components/HowItWorks";
import { Pricing } from "./components/Pricing";
import { CtaBanner } from "./components/CtaBanner";
import { Footer } from "./components/Footer";

export function HiKrewLanding() {
    return (
        <div className="flex flex-col min-h-screen font-sans">
            <Header />
            <main className="flex-1">
                <Hero />
                <Features />
                <HowItWorks />
                <Pricing />
                <CtaBanner />
            </main>
            <Footer />
        </div>
    );
}
