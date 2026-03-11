import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Message Sent!", description: "We'll get back to you within 24 hours." });
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 lg:py-20 gradient-hero">
        <div className="container max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-12">
              <h1 className="font-display text-4xl font-bold text-foreground mb-4">CONTACT US</h1>
              <p className="text-lg text-muted-foreground">Have questions? We're here to help.</p>
            </div>
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="space-y-4">
                {[
                  { icon: Phone, title: "Phone",   info: "+91 98765 43210", sub: "Mon–Sat 9AM–6PM" },
                  { icon: Mail,  title: "Email",   info: "support@emergencysafetyqrr.in", sub: "Reply within 24 hrs" },
                  { icon: MapPin,title: "Address", info: "Maharashtra, India", sub: "Pan India delivery" },
                ].map(c => (
                  <Card key={c.title} className="border-0 shadow-card">
                    <CardContent className="p-4 flex gap-3 items-start">
                      <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                        <c.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground font-display text-sm">{c.title}</p>
                        <p className="text-sm text-foreground">{c.info}</p>
                        <p className="text-xs text-muted-foreground">{c.sub}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-elevated">
                  <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" required />
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Subject</Label>
                        <Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="How can we help?" required />
                      </div>
                      <div className="space-y-2">
                        <Label>Message</Label>
                        <Textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Describe your issue or question..." className="min-h-[120px]" required />
                      </div>
                      <Button type="submit" variant="hero" className="gap-2 w-full">
                        <Send className="w-4 h-4" /> Send Message
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
