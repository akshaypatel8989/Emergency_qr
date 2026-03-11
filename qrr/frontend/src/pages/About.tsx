import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Shield, Target, Heart, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const About = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 py-12 lg:py-20">
      <div className="container max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-4xl font-bold text-foreground mb-4">ABOUT US</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Emergency Safety QRR was founded with one mission — to make roads safer for every vehicle owner in India.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 mb-12">
            {[
              { icon: Target, title: "Our Mission", text: "To provide every vehicle owner with an affordable, effective emergency identification system that can save lives during road accidents." },
              { icon: Heart,  title: "Our Vision",  text: "A future where no accident victim remains unidentified, and every family can be reached instantly in times of crisis." },
              { icon: Shield, title: "Our Product", text: "A QR code sticker for your vehicle that gives bystanders and first responders immediate access to your emergency contacts and medical info." },
              { icon: Users,  title: "Our Impact",  text: "Thousands of vehicles across India are now protected. Every day, our QR codes help families stay connected during emergencies." },
            ].map(item => (
              <Card key={item.title} className="border-0 shadow-card">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center mb-3">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="prose max-w-none text-muted-foreground leading-relaxed">
            <p>Emergency Safety QRR is a product designed and developed in India for Indian vehicle owners. We understand the challenges faced during road accidents — identifying the vehicle owner, contacting their family, and providing critical medical information to first responders.</p>
            <p className="mt-4">Our QR codes are designed to be durable, weatherproof (for physical stickers), and instantly readable by any smartphone. No app is needed — just a simple scan.</p>
            <p className="mt-4">We believe safety shouldn't be expensive. That's why we offer plans starting at just ₹50, making emergency protection accessible to every vehicle owner.</p>
          </div>
        </motion.div>
      </div>
    </main>
    <Footer />
  </div>
);

export default About;
