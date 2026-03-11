import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PageShell = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 py-12">
      <div className="container max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-foreground mb-8">{title}</h1>
        <div className="prose max-w-none text-muted-foreground leading-relaxed space-y-4">{children}</div>
      </div>
    </main>
    <Footer />
  </div>
);

export const Privacy = () => (
  <PageShell title="PRIVACY POLICY">
    <p>Last updated: January 2025</p>
    <h2 className="font-display text-xl font-bold text-foreground mt-6">Information We Collect</h2>
    <p>We collect information you provide when registering: full name, email, phone number, and vehicle details. Emergency contact numbers and blood group information are stored securely to display on your QR scan page.</p>
    <h2 className="font-display text-xl font-bold text-foreground mt-6">How We Use Your Information</h2>
    <p>Your information is used to create your Emergency Safety QRR, process orders, and display emergency contact details when your QR code is scanned. We do not sell your personal data to third parties.</p>
    <h2 className="font-display text-xl font-bold text-foreground mt-6">Data Security</h2>
    <p>All data is encrypted and stored securely. Phone numbers shown on the scan page are masked for privacy. Only emergency contact numbers are visible when the QR is scanned — owner name and address are never shown publicly.</p>
    <h2 className="font-display text-xl font-bold text-foreground mt-6">Contact</h2>
    <p>For privacy concerns, email us at: privacy@emergencysafetyqrr.in</p>
  </PageShell>
);

export const Terms = () => (
  <PageShell title="TERMS & CONDITIONS">
    <p>By using Emergency Safety QRR, you agree to these terms.</p>
    <h2 className="font-display text-xl font-bold text-foreground mt-6">Service Description</h2>
    <p>Emergency Safety QRR provides a QR code-based emergency identification service for vehicles. The QR code links to a page displaying emergency contact information.</p>
    <h2 className="font-display text-xl font-bold text-foreground mt-6">Limitation of Liability</h2>
    <p>Emergency Safety QRR is not responsible for outcomes during emergencies. The service is a communication tool only. We are not liable for QR code not being scanned, network issues, or emergency response delays.</p>
    <h2 className="font-display text-xl font-bold text-foreground mt-6">Payment & Plans</h2>
    <p>All payments are one-time and non-recurring. Plans have lifetime validity. Physical sticker orders are subject to admin approval before shipping.</p>
    <h2 className="font-display text-xl font-bold text-foreground mt-6">Referral Program</h2>
    <p>Referral rewards are credited after the referred user completes a successful payment. Withdrawals are subject to a 20% platform fee and ₹100 minimum.</p>
  </PageShell>
);

export const Refund = () => (
  <PageShell title="REFUND POLICY">
    <p>We want you to be completely satisfied with your purchase.</p>
    <h2 className="font-display text-xl font-bold text-foreground mt-6">Digital Orders (General Plan)</h2>
    <p>Since digital QR codes are delivered instantly and are non-tangible products, refunds are not available after the QR code has been generated. If you face technical issues, please contact our support team.</p>
    <h2 className="font-display text-xl font-bold text-foreground mt-6">Physical Orders (Silver/Gold Plans)</h2>
    <p>Refunds are available if: (1) the order has not been shipped yet, or (2) the product arrives damaged. Raise a refund request within 7 days of delivery with photo evidence.</p>
    <h2 className="font-display text-xl font-bold text-foreground mt-6">Processing Time</h2>
    <p>Approved refunds are processed within 5–7 business days to the original payment method.</p>
    <h2 className="font-display text-xl font-bold text-foreground mt-6">Contact</h2>
    <p>For refund requests: support@emergencysafetyqrr.in</p>
  </PageShell>
);

export const NotFound = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <p className="font-display text-8xl font-bold text-primary/20">404</p>
        <h1 className="font-display text-3xl font-bold text-foreground mb-4">PAGE NOT FOUND</h1>
        <p className="text-muted-foreground mb-6">The page you're looking for doesn't exist.</p>
        <a href="/" className="text-primary font-semibold hover:underline">← Go back home</a>
      </div>
    </main>
    <Footer />
  </div>
);
