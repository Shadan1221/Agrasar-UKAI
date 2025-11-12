import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, TrendingUp, AlertCircle, CheckCircle, Clock, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Government = () => {
  const navigate = useNavigate();

  const { data: villages } = useQuery({
    queryKey: ['villages'],
    queryFn: async () => {
      const { data, error } = await supabase.from('villages').select('*');
      if (error) throw error;
      return data;
    }
  });

  const { data: assets } = useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const { data, error } = await supabase.from('assets').select('*');
      if (error) throw error;
      return data;
    }
  });

  const { data: incidents } = useQuery({
    queryKey: ['incidents'],
    queryFn: async () => {
      const { data, error } = await supabase.from('incidents').select('*');
      if (error) throw error;
      return data;
    }
  });

  const poorAssets = assets?.filter(a => a.condition === 'Poor').length || 0;
  const pendingIncidents = incidents?.filter(i => i.status === 'Received').length || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-hero flex items-center justify-center">
              <MapPin className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Agrasar</h1>
              <p className="text-xs text-muted-foreground">Government Portal</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold text-foreground">{villages?.length || 0}</span>
              </div>
              <p className="text-sm text-muted-foreground">Total Villages</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold text-foreground">{assets?.length || 0}</span>
              </div>
              <p className="text-sm text-muted-foreground">Rural Assets</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-destructive/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <span className="text-2xl font-bold text-destructive">{poorAssets}</span>
              </div>
              <p className="text-sm text-muted-foreground">Assets Needing Repair</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold text-primary">{pendingIncidents}</span>
              </div>
              <p className="text-sm text-muted-foreground">Pending Reports</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Recent Villages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {villages?.slice(0, 5).map((village) => (
                      <div key={village.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium text-foreground">{village.name}</p>
                          <p className="text-sm text-muted-foreground">{village.block}, {village.district}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">{village.population}</p>
                          <p className="text-xs text-muted-foreground">Population</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    Assets Requiring Attention
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {assets?.filter(a => a.condition === 'Poor').slice(0, 5).map((asset) => (
                      <div key={asset.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium text-foreground">{asset.name}</p>
                          <p className="text-sm text-muted-foreground">{asset.type}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                          Poor
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="map">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Interactive Village Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[500px] bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Map will be integrated here with village markers</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forecasts">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>MGNREGA Demand Forecasts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">AI-powered forecasting module will be integrated here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assets">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Asset Registry</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assets?.map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                      <div>
                        <p className="font-medium text-foreground">{asset.name}</p>
                        <p className="text-sm text-muted-foreground">{asset.type}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          asset.condition === 'Good' ? 'bg-accent/10 text-accent' :
                          asset.condition === 'Fair' ? 'bg-primary/10 text-primary' :
                          'bg-destructive/10 text-destructive'
                        }`}>
                          {asset.condition}
                        </span>
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incidents">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Citizen Reports</CardTitle>
              </CardHeader>
              <CardContent>
                {incidents && incidents.length > 0 ? (
                  <div className="space-y-3">
                    {incidents.map((incident) => (
                      <div key={incident.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                        <div>
                          <p className="font-medium text-foreground">{incident.asset_type || 'General Issue'}</p>
                          <p className="text-sm text-muted-foreground">{incident.description}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {incident.status}
                          </span>
                          <Button variant="outline" size="sm">Review</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No incidents reported yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Government;
