import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Users, Shield, Star } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function LandingPage() {
  const navigate = useNavigate();

  const goToDashboard = () => {
  const token = localStorage.getItem("token");
  if (!token) navigate("/login");
  else navigate("/dashboard");
};

const goToMyGroups = () => {
  const token = localStorage.getItem("token");
  if (!token) navigate("/login");
  else navigate("/my-groups");
};



  return (
    <div className="min-h-screen bg-background font-body">
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-heading font-bold text-primary">Chalboo</h1>
          <div className="flex gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/login')}
              data-testid="nav-login-btn"
            >
              Login
            </Button>
            <Button
              onClick={() => navigate('/signup')}
              data-testid="nav-signup-btn"
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 font-bold shadow-[4px_4px_0px_0px_#0F172A] hover:translate-y-[-2px] transition-all"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>
      {/* HERO SECTION
<div className="pt-24 px-6 max-w-7xl mx-auto">
  <img
    src="/images/pic1.jpg"
    alt="Travel Together"
    className="w-full h-[400px] object-cover rounded-2xl shadow-lg"
  />
</div> */}


      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-extrabold text-foreground leading-tight tracking-tight">
              Find Your Perfect
              <span className="text-primary"> Travel </span>
              Companions
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground mt-6 leading-relaxed">
              Join travelers heading your way. Share journeys, split costs, and create unforgettable memories together.
            </p>
            <Button
              onClick={() => navigate('/signup')}
              data-testid="hero-cta-btn"
              size="lg"
              className="mt-8 bg-primary hover:bg-primary/90 text-white rounded-full px-12 py-7 text-lg font-bold shadow-[6px_6px_0px_0px_#0F172A] hover:translate-y-[-4px] transition-all"
            >
              Start Exploring
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <img
              src="https://images.pexels.com/photos/697244/pexels-photo-697244.jpeg"
              alt="Travelers on adventure"
              className="rounded-3xl shadow-2xl w-full h-[500px] object-cover border-4 border-foreground"
            />
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-4xl font-heading font-bold text-center mb-16">How It Works</h3>
          <div className="grid md:grid-cols-4 gap-8">
           {[
  { icon: MapPin, title: 'Search Routes', desc: 'Find groups traveling your route', action: goToDashboard },
  { icon: Users, title: 'Join Groups', desc: 'Request to join travel companions', action: goToDashboard },
  { icon: Shield, title: 'Admin Approval', desc: 'Group admins verify members', action: goToDashboard },
  { icon: Star, title: 'Rate Experience', desc: 'Share feedback after trips', action: goToMyGroups },
].map((step, idx) => (

              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={step.action}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && step.action()}
                className="bg-card rounded-xl p-8 border-2 border-border text-center hover:border-primary transition-all cursor-pointer hover:shadow-lg hover:-translate-y-1"

              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <h4 className="font-heading font-bold text-xl mb-2">{step.title}</h4>
                <p className="text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-4xl font-heading font-bold mb-6">Ready to start your journey?</h3>
          <p className="text-xl text-muted-foreground mb-10">
            Join thousands of travelers finding their perfect companions
          </p>
          <Button
            onClick={() => navigate('/signup')}
            data-testid="footer-cta-btn"
            size="lg"
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full px-12 py-7 text-lg font-bold shadow-[6px_6px_0px_0px_#0F172A] hover:translate-y-[-4px] transition-all"
          >
            Create Account
          </Button>
        </div>
      </section>

      <footer className="py-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 text-center text-muted-foreground">
          <p>&copy; 2025 Chalboo. Travel smarter, together.</p>
        </div>
      </footer>
    </div>
  );
}