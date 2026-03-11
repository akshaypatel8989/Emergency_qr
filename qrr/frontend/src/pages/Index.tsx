import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, QrCode, Phone, AlertTriangle, Heart, Clock, Star, ArrowRight, CheckCircle, Zap, Award, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/hooks/use-language";

const Index = () => {
  const { t } = useLanguage();

  const features = [
    { icon: Phone,         title: t("instantContact"),    desc: t("instantContactDesc") },
    { icon: AlertTriangle, title: t("accidentReporting"), desc: t("accidentReportingDesc") },
    { icon: Heart,         title: t("bloodGroup"),         desc: t("bloodGroupDesc") },
    { icon: Clock,         title: t("availability"),       desc: t("availabilityDesc") },
  ];

  const plans = [
    { icon: Zap,   color: "text-primary",    label: "GENERAL", subtitle: t("instantDelivery"),      price: 50,  features: [t("instantDelivery"), t("downloadablePng"), t("lifetimeValidity2")], getLabel: t("getGeneral") },
    { icon: Award, color: "text-gray-400",   label: "SILVER",  subtitle: t("weatherproofSticker"),  price: 199, features: [t("weatherproofSticker"), t("shippedToDoor"), t("trackedDelivery")],  getLabel: t("getSilver"), popular: true },
    { icon: Crown, color: "text-yellow-500", label: "GOLD",    subtitle: t("premiumSticker"),        price: 499, features: [t("premiumSticker"), t("priorityProcessing"), t("expressDelivery")], getLabel: t("getGold") },
  ];

  const steps = [
    { n: "01", title: t("step1"), desc: t("step1Desc") },
    { n: "02", title: t("step2"), desc: t("step2Desc") },
    { n: "03", title: t("step3"), desc: t("step3Desc") },
  ];

  return (
    <div>
    <main className="flex-1">

      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-32 gradient-hero">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-primary/8 blur-3xl" />
        </div>
        <div className="container relative">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-6 font-display tracking-wide">
                <Shield className="h-4 w-4" /> India's #1 Vehicle Emergency QR
              </div>
              <h1 className="font-display text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl mb-6 leading-none">
                PROTECT<br />
                YOUR<br />
                <span className="text-primary">VEHICLE</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
                One QR sticker on your vehicle — anyone who finds it can instantly contact your emergency contacts, see your blood group, and share your location during an accident.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/register">
                  <Button variant="hero" size="xl" className="w-full sm:w-auto gap-2">
                    Get Your QRR Tag <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button variant="outline" size="xl" className="w-full sm:w-auto">How It Works</Button>
                </a>
              </div>
              <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-600" />One-time payment</div>
                <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-600" />Lifetime validity</div>
                <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-600" />Starts ₹50</div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <div className="relative mx-auto max-w-sm">
                <div className="absolute inset-0 gradient-primary rounded-3xl blur-3xl opacity-15" />
                <Card className="relative shadow-elevated border-0 overflow-hidden">
                  <div className="h-2 gradient-primary w-full" />
                  <CardContent className="p-8 flex flex-col items-center text-center">
                    <p className="text-xs font-bold text-primary tracking-[0.2em] mb-3 font-display">EMERGENCY SAFETY QRR</p>
                    <div className="relative w-52 h-52 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 overflow-hidden qr-scanline">
                      <QrCode className="w-36 h-36 text-gray-800" />
                    </div>
                    <p className="text-xs font-bold text-muted-foreground tracking-widest mb-3 font-display">SCAN FOR EMERGENCY INFO</p>
                    <div className="w-full space-y-2">
                      <div className="flex justify-between text-xs bg-red-50 rounded-lg px-3 py-2">
                        <span className="text-muted-foreground">Emergency Contact</span>
                        <span className="text-primary font-bold">+91 98765 XXXXX</span>
                      </div>
                      <div className="flex justify-between text-xs bg-red-50 rounded-lg px-3 py-2">
                        <span className="text-muted-foreground">Blood Group</span>
                        <span className="font-bold text-red-700">B+</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <div className="absolute -bottom-3 -right-3 bg-green-500 text-white text-xs font-bold rounded-full px-3 py-1.5 shadow-lg">
                  SCAN ME!
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 lg:py-28">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-14">
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">WHY CHOOSE QRR?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">In an emergency, every second counts. Our QR code gives first responders and bystanders instant access to critical information.</p>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="h-full border-0 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                      <f.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-foreground mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 lg:py-28 bg-secondary/40">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">SIMPLE PRICING</h2>
            <p className="text-lg text-muted-foreground">One-time payment. Lifetime protection.</p>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            {plans.map((p, i) => (
              <motion.div key={p.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className={`h-full border-0 shadow-card relative ${p.popular ? "ring-2 ring-primary shadow-elevated" : ""}`}>
                  {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full font-display tracking-wide">MOST POPULAR</div>}
                  <CardContent className="p-6 text-center">
                    <p.icon className={`w-10 h-10 ${p.color} mx-auto mb-3`} />
                    <h3 className="font-display text-2xl font-bold text-foreground">{p.label}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{p.subtitle}</p>
                    <p className="text-4xl font-bold text-primary font-display mb-1">₹{p.price + Math.round(p.price * 0.18)}</p>
                    <p className="text-xs text-muted-foreground mb-6">₹{p.price} + 18% GST</p>
                    <ul className="space-y-2 mb-6">
                      {p.features.map(f => (
                        <li key={f} className="text-sm text-muted-foreground flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />{f}
                        </li>
                      ))}
                    </ul>
                    <Link to="/register"><Button variant={p.popular ? "hero" : "outline"} className="w-full">Get {p.label}</Button></Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-28">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">HOW IT WORKS</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Get protected in 3 simple steps</p>
          </motion.div>
          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {steps.map((s, i) => (
              <motion.div key={s.n} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="text-center">
                <div className="font-display text-7xl font-bold text-primary/15 mb-3">{s.n}</div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-secondary/40">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">TRUSTED BY THOUSANDS</h2>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            {[
              { name: "Rahul Sharma", loc: "Mumbai", text: "My bike met with an accident and a bystander immediately used the QR to call my family. Lifesaver!" },
              { name: "Priya Patel",  loc: "Pune",   text: "Love that my emergency contacts are just a scan away. Every vehicle owner should have this." },
              { name: "Amit Singh",   loc: "Delhi",  text: "Very professional sticker. Weatherproof and clearly visible. Great product, worth every rupee." },
            ].map((t) => (
              <Card key={t.name} className="border-0 shadow-card">
                <CardContent className="p-5">
                  <div className="flex gap-1 mb-3">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}</div>
                  <p className="text-sm text-muted-foreground mb-4 italic">"{t.text}"</p>
                  <div>
                    <p className="text-sm font-bold text-foreground font-display">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.loc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Card className="gradient-primary border-0 overflow-hidden shadow-elevated">
              <CardContent className="p-12 text-center">
                <h2 className="font-display text-4xl font-bold text-white sm:text-5xl mb-4">PROTECT YOUR VEHICLE TODAY</h2>
                <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">Join thousands of vehicle owners across India who trust Emergency Safety QRR for their family's safety.</p>
                <Link to="/register">
                  <Button size="xl" className="bg-white text-primary hover:bg-white/90 shadow-elevated gap-2 font-display tracking-wide">
                    Get Your QRR Now <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);
}
export default Index;
