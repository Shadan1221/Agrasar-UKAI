import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users, MapPin, TrendingUp, Languages } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type LanguageCode } from "@/lib/translations";

const Landing = () => {
  const navigate = useNavigate();
  // Initialize language from localStorage or default to 'en'
  const [language, setLanguage] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('preferredLanguage');
    return (saved as LanguageCode) || 'en';
  });

  const languages = [
    { code: "en" as LanguageCode, name: "English" },
    { code: "hi" as LanguageCode, name: "हिन्दी (Hindi)" },
    { code: "gar" as LanguageCode, name: "गढ़वाली (Garhwali)" },
    { code: "kum" as LanguageCode, name: "कुमाऊँनी (Kumaoni)" },
    { code: "as" as LanguageCode, name: "অসমীয়া (Assamese)" },
    { code: "bn" as LanguageCode, name: "বাংলা (Bengali)" },
    { code: "brx" as LanguageCode, name: "बड़ो (Bodo)" },
    { code: "doi" as LanguageCode, name: "डोगरी (Dogri)" },
    { code: "gu" as LanguageCode, name: "ગુજરાતી (Gujarati)" },
    { code: "kn" as LanguageCode, name: "ಕನ್ನಡ (Kannada)" },
    { code: "ks" as LanguageCode, name: "कॉशुर (Kashmiri)" },
    { code: "kok" as LanguageCode, name: "कोंकणी (Konkani)" },
    { code: "mai" as LanguageCode, name: "मैथिली (Maithili)" },
    { code: "ml" as LanguageCode, name: "മലയാളം (Malayalam)" },
    { code: "mr" as LanguageCode, name: "मराठी (Marathi)" },
    { code: "mni" as LanguageCode, name: "মৈতৈলোন্ (Meitei)" },
    { code: "ne" as LanguageCode, name: "नेपाली (Nepali)" },
    { code: "or" as LanguageCode, name: "ଓଡ଼ିଆ (Odia)" },
    { code: "pa" as LanguageCode, name: "ਪੰਜਾਬੀ (Punjabi)" },
    { code: "sa" as LanguageCode, name: "संस्कृतम् (Sanskrit)" },
    { code: "sat" as LanguageCode, name: "ᱥᱟᱱᱛᱟᱲᱤ (Santali)" },
    { code: "sd" as LanguageCode, name: "سنڌي (Sindhi)" },
    { code: "ta" as LanguageCode, name: "தமிழ் (Tamil)" },
    { code: "te" as LanguageCode, name: "తెలుగు (Telugu)" },
    { code: "ur" as LanguageCode, name: "اردو (Urdu)" }
  ];

  const handleLanguageChange = (newLanguage: LanguageCode) => {
    setLanguage(newLanguage);
    // Store language preference in localStorage
    localStorage.setItem('preferredLanguage', newLanguage);
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Language Dropdown - Top Right */}
      <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10">
        <Select value={language} onValueChange={(value) => handleLanguageChange(value as LanguageCode)}>
          <SelectTrigger className="w-[140px] md:w-[180px] bg-card/90 backdrop-blur-sm border-border/60 hover:border-primary/40 shadow-sm text-xs md:text-sm">
            <Languages className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2" />
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border max-h-[400px] z-50">
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code} className="cursor-pointer text-sm">
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-6 md:py-8">
        <div className="text-center max-w-2xl mx-auto mb-6 md:mb-8">
          {/* Agrasar Logo - Above the sky/background */}
          <div className="flex justify-center mb-4 md:mb-5">
            <img 
              src="/agrasar-logo.svg" 
              alt="Agrasar Logo" 
              className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-lg"
            />
          </div>
          {/* Agrasar Title - Rustic, textured style */}
          <h1 className="text-5xl md:text-6xl font-bold mb-2" style={{
            color: '#5A381F',
            fontFamily: 'serif',
            letterSpacing: '0.05em',
            textShadow: '1px 1px 2px rgba(90, 56, 31, 0.2), -1px -1px 1px rgba(90, 56, 31, 0.1)',
            fontWeight: 700,
            textTransform: 'none'
          }}>
            Agrasar
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            AI-powered platform for MGNREGA planning, village infrastructure, and citizen engagement
          </p>
        </div>

        {/* Role Selection Cards - Vertical Stacking - Compact Size */}
        <div className="flex flex-col gap-4 md:gap-5 max-w-xl mx-auto">
          {/* Government Portal Card - Compact */}
          <Card 
            className="border-2 border-secondary/30 hover:border-secondary/50 transition-all duration-300 hover:shadow-card cursor-pointer group rounded-2xl"
            onClick={() => navigate('/government')}
          >
            <CardContent className="p-4 md:p-5">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/15 transition-colors">
                  <Building2 className="h-6 w-6 text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">Government Portal</h3>
                  <p className="text-muted-foreground mb-3 text-xs md:text-sm leading-relaxed">
                    Access forecasting, planning tools, asset monitoring, and administrative dashboards
                  </p>
                  <ul className="space-y-1.5 text-xs text-muted-foreground mb-4">
                    <li className="flex items-center gap-2">
                      <TrendingUp className="h-3.5 w-3.5 text-secondary flex-shrink-0" />
                      <span>Demand Forecasting & Analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-secondary flex-shrink-0" />
                      <span>Village Infrastructure Planning</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-secondary flex-shrink-0" />
                      <span>Asset Monitoring & Management</span>
                    </li>
                  </ul>
                </div>
              </div>
              <Button 
                className="w-full h-11 md:h-12 rounded-[14px] bg-secondary hover:bg-secondary/90 text-secondary-foreground font-medium text-sm md:text-base transition-colors shadow-sm" 
                size="lg"
              >
                Enter Government Portal
              </Button>
            </CardContent>
          </Card>

          {/* Citizen Portal Card - Compact */}
          <Card 
            className="border-2 border-primary/30 hover:border-primary/50 transition-all duration-300 hover:shadow-card cursor-pointer group rounded-2xl"
            onClick={() => navigate('/citizen')}
          >
            <CardContent className="p-4 md:p-5">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">Citizen Portal</h3>
                  <p className="text-muted-foreground mb-3 text-xs md:text-sm leading-relaxed">
                    Chat with GramSathi, apply for jobs, report issues, and track your requests
                  </p>
                  <ul className="space-y-1.5 text-xs text-muted-foreground mb-4">
                    <li className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      <span>Talk to GramSathi AI Assistant</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingUp className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      <span>Apply for MGNREGA Jobs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      <span>Report Infrastructure Issues</span>
                    </li>
                  </ul>
                </div>
              </div>
              <Button 
                className="w-full h-11 md:h-12 rounded-[14px] bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm md:text-base transition-colors shadow-sm" 
                size="lg"
              >
                Enter Citizen Portal
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section - Hidden on mobile to save space */}
        <div className="mt-8 md:mt-12 grid md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto hidden md:grid">
          <Card className="bg-card/80 backdrop-blur-sm border-border/40 rounded-xl">
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

          <Card className="bg-card/80 backdrop-blur-sm border-border/40 rounded-xl">
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

          <Card className="bg-card/80 backdrop-blur-sm border-border/40 rounded-xl">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-primary" />
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
      <footer className="border-t border-border/40 bg-card/50 backdrop-blur-sm py-4 md:py-6 mt-6 md:mt-8">
        <div className="container mx-auto px-4 text-center text-xs md:text-sm text-muted-foreground">
          <p>© 2025 Agrasar. Empowering rural communities through technology.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
