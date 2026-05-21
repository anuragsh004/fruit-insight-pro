import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Brain, Camera, FileDown, Leaf, ShieldCheck, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import hero from "@/assets/hero-fruits.jpg";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "FruitSense AI — AI Fruit Freshness & Quality Detection" },
      { name: "description", content: "Instantly detect fruit type, freshness, ripeness, quality and consumption safety with AI computer vision." },
    ],
  }),
});

function Landing() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="container mx-auto grid gap-12 px-4 py-16 md:grid-cols-2 md:items-center md:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs text-accent">
            <Leaf className="h-3.5 w-3.5" /> AI-powered agriculture
          </span>
          <h1 className="mt-5 font-display text-5xl leading-[1.05] md:text-6xl">
            See your fruit's <span className="text-gradient-fresh">freshness</span> in seconds.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted-foreground">
            Upload a photo of a Mango, Banana, Apple, Orange, or Guava — our vision AI returns freshness category,
            ripeness, quality scores, and a safe-to-eat recommendation, with explainable highlights.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/signup"><Button size="lg" className="gap-2">Try it free <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link to="/login"><Button size="lg" variant="outline">Sign in</Button></Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent" /> 5 supported fruits</div>
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-accent" /> Explainable AI</div>
            <div className="flex items-center gap-2"><FileDown className="h-4 w-4 text-accent" /> PDF reports</div>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-accent/20 to-transparent blur-2xl" />
          <img src={hero} alt="Fresh fruits arranged on a sage table" width={1600} height={1100}
            className="rounded-[2rem] shadow-[var(--shadow-lift)]" />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl">A complete vision pipeline</h2>
          <p className="mt-3 text-muted-foreground">Identification, classification, scoring, and recommendation in a single tap.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { icon: Brain, title: "Fruit identification", text: "Detects Mango, Banana, Apple, Orange or Guava with confidence percentage." },
            { icon: Sparkles, title: "Freshness classification", text: "Categorizes as Fresh, Ripe, Overripe, Damaged, or Rotten." },
            { icon: ShieldCheck, title: "Consumption safety", text: "Gives a clear recommendation — safe to eat, eat soon, or avoid." },
            { icon: Camera, title: "Camera & upload", text: "Capture from your phone or drop a JPG/PNG up to 10MB." },
            { icon: Leaf, title: "Explainable AI", text: "Bounding boxes highlight bruises, spots, mold and uneven ripening." },
            { icon: FileDown, title: "PDF reports & history", text: "Download a polished report or revisit past scans anytime." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="glass-card rounded-2xl p-6">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent/15 text-accent"><Icon className="h-5 w-5" /></div>
              <h3 className="mt-4 font-display text-xl">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How */}
      <section id="how" className="container mx-auto px-4 py-20">
        <div className="grid gap-10 md:grid-cols-3">
          {[
            { n: "01", icon: Upload, title: "Upload", text: "Drop a photo or snap one with your camera." },
            { n: "02", icon: Brain, title: "Analyze", text: "Vision AI scores freshness, quality, ripeness and damage." },
            { n: "03", icon: FileDown, title: "Decide", text: "Read the recommendation and save a PDF report." },
          ].map(({ n, icon: Icon, title, text }) => (
            <div key={n} className="rounded-2xl border bg-card p-6">
              <div className="flex items-center justify-between">
                <span className="font-display text-3xl text-muted-foreground">{n}</span>
                <Icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="mt-4 font-display text-xl">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="container mx-auto px-4 py-20">
        <div className="glass-card mx-auto max-w-3xl rounded-3xl p-10 text-center">
          <h2 className="font-display text-3xl">Built for agriculture, students, and curious eaters.</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            A final-year-grade vision system that demonstrates real, deployable AI for fruit quality control.
          </p>
          <Link to="/signup" className="mt-6 inline-block"><Button size="lg">Get started — free</Button></Link>
        </div>
      </section>

      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} FruitSense AI · Powered by Lovable Cloud
      </footer>
    </div>
  );
}
