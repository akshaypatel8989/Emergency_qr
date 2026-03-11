import { Link } from "react-router-dom";
import { Shield, Phone, Mail, MapPin } from "lucide-react";

const Footer = () => (
  <footer className="bg-gray-950 text-gray-300 pt-14 pb-8">
    <div className="container">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 mb-12">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white font-display tracking-wider leading-none">EMERGENCY SAFETY</p>
              <p className="text-xs text-primary font-bold tracking-widest">QRR</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            Protecting vehicles across India with emergency QR codes. Scan to save lives.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-bold font-display tracking-wider text-sm mb-4 uppercase">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            {[["/"        ,"Home"],["register","Buy QRR"],["about","About Us"],["contact","Contact"]].map(([to, l]) => (
              <li key={to}><Link to={`/${to === "/" ? "" : to}`} className="hover:text-white transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-white font-bold font-display tracking-wider text-sm mb-4 uppercase">Legal</h4>
          <ul className="space-y-2 text-sm">
            {[["privacy","Privacy Policy"],["terms","Terms & Conditions"],["refund","Refund Policy"]].map(([to, l]) => (
              <li key={to}><Link to={`/${to}`} className="hover:text-white transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-bold font-display tracking-wider text-sm mb-4 uppercase">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary shrink-0" /><span>+91 98765 43210</span></li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary shrink-0" /><span>support@emergencysafetyqrr.in</span></li>
            <li className="flex items-start gap-2"><MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" /><span>Maharashtra, India</span></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <p>© {new Date().getFullYear()} Emergency Safety QRR. All rights reserved.</p>
        <p>Made with ❤️ in India</p>
      </div>
    </div>
  </footer>
);

export default Footer;
