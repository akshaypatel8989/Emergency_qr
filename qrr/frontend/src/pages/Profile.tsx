import { useState } from "react";
import { motion } from "framer-motion";
import { User, Phone, Mail, Lock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";

const Profile = () => {
  const { user }  = useAuth();
  const { toast } = useToast();
  const [form, setForm]     = useState({ fullName: user?.fullName || "", phone: user?.phone || "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const handleProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const d = await api.put("/api/auth/profile", form);
    setSaving(false);
    if (d.success) toast({ title: "Profile updated!" });
    else toast({ title: d.message, variant: "destructive" });
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { toast({ title: "Passwords don't match", variant: "destructive" }); return; }
    setSavingPw(true);
    const d = await api.put("/api/auth/change-password", { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
    setSavingPw(false);
    if (d.success) { toast({ title: "Password changed!" }); setPwForm({ currentPassword: "", newPassword: "", confirm: "" }); }
    else toast({ title: d.message, variant: "destructive" });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8 lg:py-12 gradient-hero">
        <div className="container max-w-2xl space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white text-2xl font-bold font-display">
                {user.fullName[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground font-display">{user.fullName}</h1>
                <p className="text-muted-foreground text-sm">{user.email} · <span className="uppercase text-primary font-bold text-xs">{user.role}</span></p>
              </div>
            </div>

            <Card className="border-0 shadow-card mb-6">
              <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5" />Edit Profile</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><User className="w-4 h-4 text-muted-foreground" />Full Name</Label>
                    <Input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" />Phone</Label>
                    <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" />Email</Label>
                    <Input value={user.email} disabled className="h-11 bg-secondary" />
                  </div>
                  <Button type="submit" variant="hero" disabled={saving} className="gap-2">
                    <Save className="w-4 h-4" />{saving ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card">
              <CardHeader><CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5" />Change Password</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handlePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input type="password" value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input type="password" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} className="h-11" minLength={6} />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input type="password" value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} className="h-11" />
                  </div>
                  <Button type="submit" variant="outline" disabled={savingPw}>
                    {savingPw ? "Changing..." : "Change Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="mt-4 p-4 bg-secondary/50 rounded-xl text-sm">
              <p className="text-muted-foreground">Your referral code: <strong className="text-foreground font-mono">{user.referralCode}</strong></p>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
