import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import { LanguageProvider } from "@/hooks/use-language";
import { Toaster } from "@/components/ui/toast";

// Pages
import Index          from "@/pages/Index";
import Auth           from "@/pages/Auth";
import Register       from "@/pages/Register";
import Payment        from "@/pages/Payment";
import OrderSuccess   from "@/pages/OrderSuccess";
import MyOrders       from "@/pages/MyOrders";
import WalletDashboard from "@/pages/WalletDashboard";
import Scan           from "@/pages/Scan";
import Dealerlogin    from "@/pages/Dealerlogin";
import DealerDashboard from "@/pages/DealerDashboard";
import AdminDashboard  from "@/pages/AdminDashboard";
import Profile        from "@/pages/Profile";
import About          from "@/pages/About";
import Contact        from "@/pages/Contact";
import { Privacy, Terms, Refund, NotFound } from "@/pages/StaticPages";

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <Routes>
          <Route path="/"                  element={<Index />} />
          <Route path="/auth"              element={<Auth />} />
          <Route path="/register"          element={<Register />} />
          <Route path="/payment"           element={<Payment />} />
          <Route path="/order-success/:orderId" element={<OrderSuccess />} />
          <Route path="/my-orders"         element={<MyOrders />} />
          <Route path="/wallet"            element={<WalletDashboard />} />
          <Route path="/scan/:qrId"        element={<Scan />} />
          <Route path="/dealer-login"      element={<Dealerlogin />} />
          <Route path="/dealer-dashboard"  element={<DealerDashboard />} />
          <Route path="/admin-dashboard"   element={<AdminDashboard />} />
          <Route path="/profile"           element={<Profile />} />
          <Route path="/about"             element={<About />} />
          <Route path="/contact"           element={<Contact />} />
          <Route path="/privacy"           element={<Privacy />} />
          <Route path="/terms"             element={<Terms />} />
          <Route path="/refund"            element={<Refund />} />
          <Route path="*"                  element={<NotFound />} />
        </Routes>
          <Toaster />
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
