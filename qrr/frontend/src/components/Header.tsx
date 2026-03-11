import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Menu, X, ChevronDown, LogOut, User, ShoppingCart, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate  = useNavigate();
  const [open, setOpen]       = useState(false);
  const [dropOpen, setDrop]   = useState(false);

  const handleSignOut = () => { signOut(); navigate("/"); setOpen(false); };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow pulse-emergency">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-foreground font-display tracking-wider leading-none">EMERGENCY SAFETY</p>
            <p className="text-xs text-primary font-bold tracking-widest">QRR</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/"        className="text-muted-foreground hover:text-foreground transition-colors font-medium">Home</Link>
          <Link to="/register" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Buy QRR</Link>
          <Link to="/about"   className="text-muted-foreground hover:text-foreground transition-colors font-medium">About</Link>
          <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Contact</Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {user ? (
            <div className="relative">
              <button onClick={() => setDrop(!dropOpen)}
                className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-secondary transition-colors">
                <div className="h-6 w-6 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                  {user.fullName[0].toUpperCase()}
                </div>
                <span className="hidden sm:block max-w-[100px] truncate">{user.fullName.split(" ")[0]}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
              {dropOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-background shadow-elevated z-50 py-1 overflow-hidden"
                  onMouseLeave={() => setDrop(false)}>
                  <Link to="/profile"   onClick={() => setDrop(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary"><User className="h-4 w-4" />Profile</Link>
                  <Link to="/my-orders" onClick={() => setDrop(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary"><ShoppingCart className="h-4 w-4" />My Orders</Link>
                  <Link to="/wallet"    onClick={() => setDrop(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary"><Wallet className="h-4 w-4" />Wallet</Link>
                  {(user.role === "dealer" || user.role === "admin") && (
                    <Link to="/dealer-dashboard" onClick={() => setDrop(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary text-green-700 font-medium">
                      <Shield className="h-4 w-4" />Dealer Panel
                    </Link>
                  )}
                  {user.role === "admin" && (
                    <Link to="/admin-dashboard" onClick={() => setDrop(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary text-primary font-medium">
                      <Shield className="h-4 w-4" />Admin Panel
                    </Link>
                  )}
                  <hr className="my-1 border-border" />
                  <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary w-full text-left text-destructive">
                    <LogOut className="h-4 w-4" />Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/auth"><Button variant="ghost" size="sm">Login</Button></Link>
              <Link to="/auth"><Button variant="hero" size="sm">Get QRR</Button></Link>
            </div>
          )}
          {/* Mobile menu */}
          <button className="md:hidden ml-1" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {open && (
        <div className="md:hidden border-t border-border bg-background py-4 px-4 space-y-1">
          {[["/"       ,"Home"],["register","Buy QRR"],["about","About"],["contact","Contact"],["my-orders","My Orders"],["wallet","Wallet"]].map(([to, label]) => (
            <Link key={to} to={`/${to === "/" ? "" : to}`} onClick={() => setOpen(false)}
              className="block rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-secondary">
              {label}
            </Link>
          ))}
          {user
            ? <button onClick={handleSignOut} className="block w-full text-left rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-secondary text-destructive">Sign Out</button>
            : <Link to="/auth" onClick={() => setOpen(false)} className="block rounded-lg px-4 py-2.5 text-sm font-medium bg-primary text-white text-center">Login / Signup</Link>
          }
        </div>
      )}
    </header>
  );
};

export default Header;
