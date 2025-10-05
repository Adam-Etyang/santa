import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gift, Users, List, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-gifts.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative container mx-auto px-4 py-24 text-center">
          <div className="inline-block mb-6 p-4 rounded-full bg-primary/10">
            <Gift className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Secret Santa Made Simple
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The easiest way to organize gift exchanges with friends and family. Create groups, share wishlists, and spread holiday joy!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8 py-6">
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="text-lg px-8 py-6">
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to perfect gift giving
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-2xl bg-card border-2 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="inline-block p-4 rounded-full bg-primary/10 mb-4">
              <Users className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Create Your Group</h3>
            <p className="text-muted-foreground">
              Invite friends and family to join your Secret Santa exchange. Kids can join too - they'll receive gifts without giving!
            </p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-card border-2 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="inline-block p-4 rounded-full bg-secondary/10 mb-4">
              <List className="h-12 w-12 text-secondary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Build Your Wishlist</h3>
            <p className="text-muted-foreground">
              Add items with descriptions, prices, sizes, and links. Make it easy for your Secret Santa to find the perfect gift!
            </p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-card border-2 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="inline-block p-4 rounded-full bg-accent/10 mb-4">
              <Sparkles className="h-12 w-12 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-3">Get Matched</h3>
            <p className="text-muted-foreground">
              Our smart algorithm creates fair assignments. View who you're buying for and browse their wishlist privately!
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-12 text-center border-2 border-primary/20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Gifting?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of happy gift givers making the holidays more joyful and less stressful.
          </p>
          <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8 py-6">
            <Gift className="h-5 w-5 mr-2" />
            Create Your First Group
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 Secret Santa. Making gift giving magical.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
