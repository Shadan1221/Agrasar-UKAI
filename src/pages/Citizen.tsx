import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, MessageSquare, FileText, Camera, Send, Mic, Languages, Search, Building2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getTranslation, translations, type LanguageCode } from "@/lib/translations";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const Citizen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: getTranslation('chat.welcome', 'en'),
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);
  const [isSchemesDialogOpen, setIsSchemesDialogOpen] = useState(false);
  const [schemeSearch, setSchemeSearch] = useState('');

  // Job application form
  const [jobForm, setJobForm] = useState({
    village_id: '',
    applicant_name: '',
    applicant_mobile: '',
    applicant_age: '',
    applicant_gender: '',
    preferred_work_type: '',
    work_order_id: ''
  });

  // Issue report form
  const [issueForm, setIssueForm] = useState({
    village_id: '',
    asset_type: '',
    description: '',
    severity: 'Medium',
    reported_by_name: '',
    reported_by_mobile: ''
  });

  // Fetch data
  const { data: villages } = useQuery({
    queryKey: ['villages'],
    queryFn: async () => {
      const { data, error } = await supabase.from('villages').select('*');
      if (error) throw error;
      return data;
    }
  });

  const { data: workOrders } = useQuery({
    queryKey: ['work_orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_orders')
        .select('*, villages(*)')
        .eq('status', 'Open')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: schemes } = useQuery({
    queryKey: ['schemes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schemes')
        .select('*')
        .eq('status', 'Active')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const filteredSchemes = schemes?.filter(scheme =>
    scheme.name?.toLowerCase().includes(schemeSearch.toLowerCase()) ||
    scheme.description?.toLowerCase().includes(schemeSearch.toLowerCase()) ||
    scheme.category?.toLowerCase().includes(schemeSearch.toLowerCase())
  );

  // Mutations
  const jobApplicationMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('job_applications')
        .insert({
          id: `JA${Date.now()}`,
          work_order_id: data.work_order_id || null,
          village_id: data.village_id,
          applicant_name: data.applicant_name,
          applicant_mobile: data.applicant_mobile,
          applicant_age: parseInt(data.applicant_age) || null,
          applicant_gender: data.applicant_gender || null,
          preferred_work_type: data.preferred_work_type || null,
          status: 'Pending'
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: getTranslation('job.success', language),
        description: getTranslation('job.success', language),
      });
      setIsJobDialogOpen(false);
      setJobForm({
        village_id: '',
        applicant_name: '',
        applicant_mobile: '',
        applicant_age: '',
        applicant_gender: '',
        preferred_work_type: '',
        work_order_id: ''
      });
    },
    onError: (error: Error) => {
      toast({
        title: getTranslation('job.error', language),
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const issueReportMutation = useMutation({
    mutationFn: async (data: any) => {
      const village = villages?.find(v => v.id === data.village_id);
      const { error } = await supabase
        .from('incidents')
        .insert({
          id: `INC${Date.now()}`,
          village_id: data.village_id,
          asset_type: data.asset_type,
          description: data.description,
          severity: data.severity,
          reported_by_name: data.reported_by_name,
          reported_by_mobile: data.reported_by_mobile,
          lat: village?.lat || null,
          lng: village?.lng || null,
          status: 'Received'
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: getTranslation('issue.success', language),
        description: getTranslation('issue.success', language),
      });
      setIsIssueDialogOpen(false);
      setIssueForm({
        village_id: '',
        asset_type: '',
        description: '',
        severity: 'Medium',
        reported_by_name: '',
        reported_by_mobile: ''
      });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
    onError: (error: Error) => {
      toast({
        title: getTranslation('issue.error', language),
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gramsathi-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          })).concat([{ role: 'user', content: currentInput }]),
          language: language
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from GramSathi');
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error calling GramSathi:', error);
      toast({
        title: "Error",
        description: "Failed to connect to GramSathi. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleJobSubmit = () => {
    if (!jobForm.village_id || !jobForm.applicant_name || !jobForm.applicant_mobile) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    jobApplicationMutation.mutate(jobForm);
  };

  const handleIssueSubmit = () => {
    if (!issueForm.village_id || !issueForm.description || !issueForm.reported_by_name) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    issueReportMutation.mutate(issueForm);
  };

  const handleLanguageChange = (newLanguage: LanguageCode) => {
    setLanguage(newLanguage);
    // Update welcome message
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: getTranslation('chat.welcome', newLanguage),
        timestamp: new Date()
      }
    ]);
  };

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header - Mobile-friendly */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-start">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-xl font-bold text-foreground">{getTranslation('header.title', language)}</h1>
              <p className="text-xs text-muted-foreground">{getTranslation('header.subtitle', language)}</p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto justify-center md:justify-end">
            <Select value={language} onValueChange={(value) => handleLanguageChange(value as LanguageCode)}>
              <SelectTrigger className="w-full md:w-[200px] bg-background">
                <Languages className="h-4 w-4 mr-2" />
                <SelectValue placeholder={getTranslation('header.selectLanguage', language)} />
              </SelectTrigger>
              <SelectContent className="bg-background border-border max-h-[300px] z-50">
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code} className="cursor-pointer">
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => navigate('/')} className="w-full md:w-auto">
              {getTranslation('header.backToHome', language)}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Mobile-friendly centered layout */}
      <div className="flex-1 container mx-auto px-4 py-6 flex flex-col gap-6 max-w-4xl">
        {/* Quick Actions - Mobile responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer hover:shadow-card transition-shadow w-full">
                <CardContent className="p-4 text-center">
                  <FileText className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">{getTranslation('actions.applyForJob', language)}</p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{getTranslation('job.title', language)}</DialogTitle>
                <DialogDescription>
                  Apply for MGNREGA work opportunities in your area
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="village">{getTranslation('job.village', language)} *</Label>
                  <Select value={jobForm.village_id} onValueChange={(value) => setJobForm({ ...jobForm, village_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select village" />
                    </SelectTrigger>
                    <SelectContent>
                      {villages?.map((village) => (
                        <SelectItem key={village.id} value={village.id}>
                          {village.name} - {village.block}, {village.district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {jobForm.village_id && workOrders && workOrders.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="work_order">Select Work Order (Optional)</Label>
                    <Select value={jobForm.work_order_id} onValueChange={(value) => setJobForm({ ...jobForm, work_order_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select work order" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any Available Work</SelectItem>
                        {workOrders
                          .filter(wo => wo.village_id === jobForm.village_id)
                          .map((workOrder) => (
                            <SelectItem key={workOrder.id} value={workOrder.id}>
                              {workOrder.title} - {workOrder.workers_needed} workers needed
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="name">{getTranslation('job.name', language)} *</Label>
                  <Input
                    id="name"
                    value={jobForm.applicant_name}
                    onChange={(e) => setJobForm({ ...jobForm, applicant_name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">{getTranslation('job.mobile', language)} *</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    value={jobForm.applicant_mobile}
                    onChange={(e) => setJobForm({ ...jobForm, applicant_mobile: e.target.value })}
                    placeholder="Enter your mobile number"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">{getTranslation('job.age', language)}</Label>
                    <Input
                      id="age"
                      type="number"
                      value={jobForm.applicant_age}
                      onChange={(e) => setJobForm({ ...jobForm, applicant_age: e.target.value })}
                      placeholder="Age"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">{getTranslation('job.gender', language)}</Label>
                    <Select value={jobForm.applicant_gender} onValueChange={(value) => setJobForm({ ...jobForm, applicant_gender: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="work_type">{getTranslation('job.preferredWork', language)}</Label>
                  <Select value={jobForm.preferred_work_type} onValueChange={(value) => setJobForm({ ...jobForm, preferred_work_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select work type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Road Construction">Road Construction</SelectItem>
                      <SelectItem value="Water Harvesting">Water Harvesting</SelectItem>
                      <SelectItem value="Pond Renovation">Pond Renovation</SelectItem>
                      <SelectItem value="Building Construction">Building Construction</SelectItem>
                      <SelectItem value="Plantation">Plantation</SelectItem>
                      <SelectItem value="Any">Any</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleJobSubmit} disabled={jobApplicationMutation.isPending} className="w-full">
                  {jobApplicationMutation.isPending ? 'Submitting...' : getTranslation('job.submit', language)}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isIssueDialogOpen} onOpenChange={setIsIssueDialogOpen}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer hover:shadow-card transition-shadow w-full">
                <CardContent className="p-4 text-center">
                  <Camera className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">{getTranslation('actions.reportIssue', language)}</p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{getTranslation('issue.title', language)}</DialogTitle>
                <DialogDescription>
                  Report infrastructure issues or problems in your village
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="issue_village">Village *</Label>
                  <Select value={issueForm.village_id} onValueChange={(value) => setIssueForm({ ...issueForm, village_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select village" />
                    </SelectTrigger>
                    <SelectContent>
                      {villages?.map((village) => (
                        <SelectItem key={village.id} value={village.id}>
                          {village.name} - {village.block}, {village.district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="asset_type">{getTranslation('issue.assetType', language)}</Label>
                  <Select value={issueForm.asset_type} onValueChange={(value) => setIssueForm({ ...issueForm, asset_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select asset type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Rural Road">Rural Road</SelectItem>
                      <SelectItem value="Community Well">Community Well</SelectItem>
                      <SelectItem value="Pond">Pond</SelectItem>
                      <SelectItem value="Anganwadi Center">Anganwadi Center</SelectItem>
                      <SelectItem value="School Building">School Building</SelectItem>
                      <SelectItem value="Water Supply">Water Supply</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="severity">{getTranslation('issue.severity', language)}</Label>
                  <Select value={issueForm.severity} onValueChange={(value) => setIssueForm({ ...issueForm, severity: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{getTranslation('issue.description', language)} *</Label>
                  <Textarea
                    id="description"
                    value={issueForm.description}
                    onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
                    placeholder="Describe the issue in detail"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issue_name">{getTranslation('issue.name', language)} *</Label>
                  <Input
                    id="issue_name"
                    value={issueForm.reported_by_name}
                    onChange={(e) => setIssueForm({ ...issueForm, reported_by_name: e.target.value })}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issue_mobile">{getTranslation('issue.mobile', language)}</Label>
                  <Input
                    id="issue_mobile"
                    type="tel"
                    value={issueForm.reported_by_mobile}
                    onChange={(e) => setIssueForm({ ...issueForm, reported_by_mobile: e.target.value })}
                    placeholder="Enter your mobile number"
                  />
                </div>
                <Button onClick={handleIssueSubmit} disabled={issueReportMutation.isPending} className="w-full">
                  {issueReportMutation.isPending ? 'Submitting...' : getTranslation('issue.submit', language)}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isSchemesDialogOpen} onOpenChange={setIsSchemesDialogOpen}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer hover:shadow-card transition-shadow w-full">
                <CardContent className="p-4 text-center">
                  <MapPin className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">{getTranslation('actions.findSchemes', language)}</p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{getTranslation('schemes.title', language)}</DialogTitle>
                <DialogDescription>
                  Browse available rural development schemes and government programs
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={getTranslation('schemes.search', language)}
                    value={schemeSearch}
                    onChange={(e) => setSchemeSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {filteredSchemes && filteredSchemes.length > 0 ? (
                      filteredSchemes.map((scheme) => (
                        <Card key={scheme.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg">{scheme.name}</CardTitle>
                                <Badge variant="outline" className="mt-2">
                                  {scheme.category}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {scheme.description && (
                              <p className="text-sm text-muted-foreground">{scheme.description}</p>
                            )}
                            {scheme.eligibility_criteria && (
                              <div>
                                <Label className="text-sm font-semibold">{getTranslation('schemes.eligibility', language)}:</Label>
                                <p className="text-sm text-muted-foreground">{scheme.eligibility_criteria}</p>
                              </div>
                            )}
                            {scheme.benefits && (
                              <div>
                                <Label className="text-sm font-semibold">{getTranslation('schemes.benefits', language)}:</Label>
                                <p className="text-sm text-muted-foreground">{scheme.benefits}</p>
                              </div>
                            )}
                            {scheme.application_process && (
                              <div>
                                <Label className="text-sm font-semibold">Application Process:</Label>
                                <p className="text-sm text-muted-foreground">{scheme.application_process}</p>
                              </div>
                            )}
                            {scheme.contact_info && (
                              <div>
                                <Label className="text-sm font-semibold">Contact:</Label>
                                <p className="text-sm text-muted-foreground">{scheme.contact_info}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No schemes found</p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Chat Interface - Mobile-friendly */}
        <Card className="flex-1 flex flex-col shadow-card rounded-xl">
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-2 justify-center md:justify-start text-center md:text-left">
              <MessageSquare className="h-5 w-5 text-primary" />
              {getTranslation('chat.title', language)}
            </CardTitle>
          </CardHeader>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t border-border p-4">
            <div className="flex gap-2 items-center">
              <Button variant="outline" size="icon" className="flex-shrink-0">
                <Camera className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="flex-shrink-0">
                <Mic className="h-4 w-4" />
              </Button>
              <Input
                placeholder={getTranslation('chat.placeholder', language)}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 min-w-0"
              />
              <Button onClick={handleSendMessage} className="bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Info Section - Mobile-friendly */}
        <Card className="bg-primary/5 border-primary/20 rounded-xl">
          <CardContent className="p-4 text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              <strong>{getTranslation('info.availableIn', language)}:</strong> हिंदी, English, Garhwali, Kumaoni, and 20+ Indian languages
              <br />
              <strong>{getTranslation('info.features', language)}:</strong> Job applications, issue reporting, scheme information, status tracking
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Citizen;
