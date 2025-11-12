import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users, MapPin, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-hero flex items-center justify-center">
              <MapPin className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Agrasar</h1>
              <p className="text-xs text-muted-foreground">Rural Development Platform</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">हिंदी</Button>
            <Button variant="outline" size="sm">English</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Transforming Rural Development
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            AI-powered platform for MGNREGA planning, village infrastructure, and citizen engagement
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card 
            className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-card cursor-pointer group"
            onClick={() => navigate('/government')}
          >
            <CardContent className="p-8">
              <div className="h-16 w-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:bg-secondary/20 transition-colors">
                <Building2 className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Government Portal</h3>
              <p className="text-muted-foreground mb-6">
                Access forecasting, planning tools, asset monitoring, and administrative dashboards
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Demand Forecasting & Analytics
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Village Infrastructure Planning
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Asset Monitoring & Management
                </li>
              </ul>
              <Button className="w-full mt-6 bg-gradient-hero hover:opacity-90" size="lg">
                Enter Government Portal
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="border-2 hover:border-accent/50 transition-all duration-300 hover:shadow-card cursor-pointer group"
            onClick={() => navigate('/citizen')}
          >
            <CardContent className="p-8">
              <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                <Users className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Citizen Portal</h3>
              <p className="text-muted-foreground mb-6">
                Chat with GramSathi, apply for jobs, report issues, and track your requests
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-accent" />
                  Talk to GramSathi AI Assistant
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  Apply for MGNREGA Jobs
                </li>
                <li className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-accent" />
                  Report Infrastructure Issues
                </li>
              </ul>
              <Button className="w-full mt-6 bg-accent hover:bg-accent/90" size="lg">
                Enter Citizen Portal
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Smart Forecasting</h4>
              <p className="text-sm text-muted-foreground">
                AI-powered demand prediction for MGNREGA and rural schemes
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-secondary" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Map-First Planning</h4>
              <p className="text-sm text-muted-foreground">
                Interactive mapping for infrastructure proposals and asset tracking
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Citizen Engagement</h4>
              <p className="text-sm text-muted-foreground">
                Multilingual AI chatbot for seamless citizen-government interaction
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Agrasar. Empowering rural communities through technology.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
