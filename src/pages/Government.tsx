import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, TrendingUp, AlertCircle, CheckCircle, Clock, Users, Building2, Loader2, Plus, Eye, BarChart3, PieChart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Map from "@/components/Map";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

const Government = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [mapView, setMapView] = useState<'all' | 'villages' | 'assets' | 'incidents'>('all');
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [isForecastDialogOpen, setIsForecastDialogOpen] = useState(false);
  const [forecastVillage, setForecastVillage] = useState('');
  const [forecastStartDate, setForecastStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [migrationAdjustment, setMigrationAdjustment] = useState('0');

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

  const { data: forecasts } = useQuery({
    queryKey: ['forecasts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forecasts')
        .select('*, villages(*)')
        .order('created_at', { ascending: false });
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
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const generateForecastMutation = useMutation({
    mutationFn: async ({ villageId, startDate, migrationAdjustment }: { villageId: string; startDate: string; migrationAdjustment: number }) => {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-forecast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({
          village_id: villageId,
          start_date: startDate,
          migration_adjustment: migrationAdjustment
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate forecast');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecasts'] });
      setIsForecastDialogOpen(false);
      toast({
        title: "Success",
        description: "Forecast generated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateIncidentStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('incidents')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      setSelectedIncident(null);
      toast({
        title: "Success",
        description: "Incident status updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleGenerateForecast = () => {
    if (!forecastVillage || !forecastStartDate) {
      toast({
        title: "Error",
        description: "Please select a village and start date",
        variant: "destructive",
      });
      return;
    }

    generateForecastMutation.mutate({
      villageId: forecastVillage,
      startDate: forecastStartDate,
      migrationAdjustment: parseInt(migrationAdjustment) || 0
    });
  };

  const poorAssets = assets?.filter(a => a.condition === 'Poor').length || 0;
  const pendingIncidents = incidents?.filter(i => i.status === 'Received').length || 0;

  // Chart data preparation
  const assetConditionData = [
    { name: 'Good', value: assets?.filter(a => a.condition === 'Good').length || 0, color: 'hsl(142, 76%, 36%)' },
    { name: 'Fair', value: assets?.filter(a => a.condition === 'Fair').length || 0, color: 'hsl(38, 92%, 50%)' },
    { name: 'Poor', value: assets?.filter(a => a.condition === 'Poor').length || 0, color: 'hsl(0, 84.2%, 60.2%)' },
  ];

  const incidentStatusData = [
    { name: 'Received', value: incidents?.filter(i => i.status === 'Received').length || 0, color: 'hsl(243, 75%, 40%)' },
    { name: 'In Progress', value: incidents?.filter(i => i.status === 'In Progress').length || 0, color: 'hsl(38, 92%, 50%)' },
    { name: 'Resolved', value: incidents?.filter(i => i.status === 'Resolved').length || 0, color: 'hsl(142, 76%, 36%)' },
  ];

  const villagePopulationData = villages?.map(v => ({
    name: v.name,
    population: v.population,
    households: v.households,
  })) || [];

  const workOrdersStatusData = [
    { name: 'Open', value: workOrders?.filter(wo => wo.status === 'Open').length || 0 },
    { name: 'In Progress', value: workOrders?.filter(wo => wo.status === 'In Progress').length || 0 },
    { name: 'Completed', value: workOrders?.filter(wo => wo.status === 'Completed').length || 0 },
    { name: 'Draft', value: workOrders?.filter(wo => wo.status === 'Draft').length || 0 },
  ];

  const forecastData = forecasts?.map(f => ({
    village: f.villages?.name || 'Unknown',
    workers: f.workers_needed,
    budget: f.estimated_budget || 0,
    confidence: (f.confidence * 100).toFixed(0),
    period: `${new Date(f.period_start).toLocaleDateString('en-US', { month: 'short' })} - ${new Date(f.period_end).toLocaleDateString('en-US', { month: 'short' })}`,
  })) || [];

  const budgetAllocationData = workOrders?.map(wo => ({
    name: wo.title.length > 20 ? wo.title.substring(0, 20) + '...' : wo.title,
    budget: wo.estimated_budget || 0,
    workers: wo.workers_needed || 0,
  })) || [];

  const workerDemandData = forecasts?.map((f, index) => ({
    period: `Forecast ${index + 1}`,
    workers: f.workers_needed,
    village: f.villages?.name || 'Unknown',
  })) || [];

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
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
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

          <TabsContent value="analytics">
            <div className="space-y-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    MGNREGA & Rural Development Analytics
                  </CardTitle>
                  <CardDescription>Comprehensive analysis of MGNREGA work, assets, and rural schemes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Asset Condition Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer config={{ value: { label: "Assets" } }} className="h-[300px]">
                          <RechartsPieChart>
                            <Pie data={assetConditionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                              {assetConditionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                          </RechartsPieChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Incident Status Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer config={{ value: { label: "Incidents" } }} className="h-[300px]">
                          <RechartsPieChart>
                            <Pie data={incidentStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                              {incidentStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                          </RechartsPieChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Village Population & Households</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer config={{ population: { label: "Population", color: "hsl(var(--primary))" }, households: { label: "Households", color: "hsl(var(--accent))" } }} className="h-[300px]">
                          <BarChart data={villagePopulationData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar dataKey="population" fill="hsl(var(--primary))" />
                            <Bar dataKey="households" fill="hsl(var(--accent))" />
                          </BarChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Work Orders by Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer config={{ value: { label: "Work Orders" } }} className="h-[300px]">
                          <BarChart data={workOrdersStatusData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="value" fill="hsl(var(--primary))" />
                          </BarChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    {workerDemandData.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Worker Demand Forecast</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ChartContainer config={{ workers: { label: "Workers Needed", color: "hsl(var(--primary))" } }} className="h-[300px]">
                            <LineChart data={workerDemandData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="period" />
                              <YAxis />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Legend />
                              <Line type="monotone" dataKey="workers" stroke="hsl(var(--primary))" strokeWidth={2} />
                            </LineChart>
                          </ChartContainer>
                        </CardContent>
                      </Card>
                    )}

                    {budgetAllocationData.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Budget Allocation by Work Order</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ChartContainer config={{ budget: { label: "Budget (₹)", color: "hsl(var(--accent))" }, workers: { label: "Workers", color: "hsl(var(--primary))" } }} className="h-[300px]">
                            <BarChart data={budgetAllocationData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                              <YAxis yAxisId="left" orientation="left" />
                              <YAxis yAxisId="right" orientation="right" />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Legend />
                              <Bar yAxisId="left" dataKey="budget" fill="hsl(var(--accent))" />
                              <Bar yAxisId="right" dataKey="workers" fill="hsl(var(--primary))" />
                            </BarChart>
                          </ChartContainer>
                        </CardContent>
                      </Card>
                    )}

                    {forecastData.length > 0 && (
                      <>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Forecast Confidence Levels</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ChartContainer config={{ confidence: { label: "Confidence (%)", color: "hsl(var(--primary))" }, workers: { label: "Workers", color: "hsl(var(--accent))" } }} className="h-[300px]">
                              <AreaChart data={forecastData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="village" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Legend />
                                <Area yAxisId="left" type="monotone" dataKey="confidence" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                                <Area yAxisId="right" type="monotone" dataKey="workers" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.2} />
                              </AreaChart>
                            </ChartContainer>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Forecast Budget Analysis</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ChartContainer config={{ budget: { label: "Budget (₹)", color: "hsl(var(--accent))" } }} className="h-[300px]">
                              <BarChart data={forecastData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="village" angle={-45} textAnchor="end" height={100} />
                                <YAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="budget" fill="hsl(var(--accent))" />
                              </BarChart>
                            </ChartContainer>
                          </CardContent>
                        </Card>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="map">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Interactive Map View</CardTitle>
                <CardDescription>View villages, assets, and incidents on OpenStreetMap</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={mapView === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMapView('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={mapView === 'villages' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMapView('villages')}
                  >
                    Villages
                  </Button>
                  <Button
                    variant={mapView === 'assets' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMapView('assets')}
                  >
                    Assets
                  </Button>
                  <Button
                    variant={mapView === 'incidents' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMapView('incidents')}
                  >
                    Incidents
                  </Button>
                </div>
                <Map
                  villages={villages || []}
                  assets={assets || []}
                  incidents={incidents || []}
                  showVillages={mapView === 'all' || mapView === 'villages'}
                  showAssets={mapView === 'all' || mapView === 'assets'}
                  showIncidents={mapView === 'all' || mapView === 'incidents'}
                  height="600px"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forecasts">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>MGNREGA Demand Forecasts</CardTitle>
                    <CardDescription>AI-powered forecasting for labor demand and budget estimation</CardDescription>
                  </div>
                  <Dialog open={isForecastDialogOpen} onOpenChange={setIsForecastDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Generate Forecast
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Generate New Forecast</DialogTitle>
                        <DialogDescription>
                          Create an AI-powered forecast for MGNREGA labor demand
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="village">Village</Label>
                          <Select value={forecastVillage} onValueChange={setForecastVillage}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a village" />
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
                          <Label htmlFor="startDate">Start Date</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={forecastStartDate}
                            onChange={(e) => setForecastStartDate(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="migration">Migration Adjustment (%)</Label>
                          <Input
                            id="migration"
                            type="number"
                            value={migrationAdjustment}
                            onChange={(e) => setMigrationAdjustment(e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        <Button
                          onClick={handleGenerateForecast}
                          disabled={generateForecastMutation.isPending}
                          className="w-full"
                        >
                          {generateForecastMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            'Generate Forecast'
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {forecasts && forecasts.length > 0 ? (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Village</TableHead>
                          <TableHead>Period</TableHead>
                          <TableHead>Workers Needed</TableHead>
                          <TableHead>Estimated Budget</TableHead>
                          <TableHead>Confidence</TableHead>
                          <TableHead>Work Types</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {forecasts.map((forecast: any) => (
                          <TableRow key={forecast.id}>
                            <TableCell className="font-medium">
                              {forecast.villages?.name || 'N/A'}
                            </TableCell>
                            <TableCell>
                              {new Date(forecast.period_start).toLocaleDateString()} - {new Date(forecast.period_end).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{forecast.workers_needed}</TableCell>
                            <TableCell>₹{forecast.estimated_budget?.toLocaleString('en-IN') || '0'}</TableCell>
                            <TableCell>
                              <Badge variant={forecast.confidence > 0.7 ? 'default' : forecast.confidence > 0.5 ? 'secondary' : 'outline'}>
                                {(forecast.confidence * 100).toFixed(0)}%
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {forecast.recommended_work_types?.slice(0, 2).map((type: string, idx: number) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {type}
                                  </Badge>
                                ))}
                                {forecast.recommended_work_types?.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{forecast.recommended_work_types.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No forecasts generated yet</p>
                    <Button onClick={() => setIsForecastDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Generate First Forecast
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assets">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Asset Registry</CardTitle>
                  <CardDescription>Manage and monitor rural infrastructure assets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {assets && assets.length > 0 ? (
                      assets.map((asset) => {
                        const village = villages?.find(v => v.id === asset.village_id);
                        return (
                          <div key={asset.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <p className="font-medium text-foreground">{asset.name}</p>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{asset.type}</p>
                              {village && (
                                <p className="text-xs text-muted-foreground mt-1">{village.name}</p>
                              )}
                              {asset.last_inspection && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Last inspection: {new Date(asset.last_inspection).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge
                                variant={asset.condition === 'Good' ? 'default' : asset.condition === 'Fair' ? 'secondary' : 'destructive'}
                                className="text-xs"
                              >
                                {asset.condition}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedAsset(asset)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No assets found</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Asset Map View</CardTitle>
                  <CardDescription>View asset locations on the map</CardDescription>
                </CardHeader>
                <CardContent>
                  <Map
                    villages={villages || []}
                    assets={assets || []}
                    incidents={[]}
                    showVillages={false}
                    showAssets={true}
                    showIncidents={false}
                    height="600px"
                  />
                </CardContent>
              </Card>
            </div>
            <Dialog open={!!selectedAsset} onOpenChange={(open) => !open && setSelectedAsset(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{selectedAsset?.name}</DialogTitle>
                  <DialogDescription>Asset Details</DialogDescription>
                </DialogHeader>
                {selectedAsset && (
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Type</Label>
                      <p className="text-sm font-medium">{selectedAsset.type}</p>
                    </div>
                    <div>
                      <Label>Condition</Label>
                      <div className="mt-1">
                        <Badge
                          variant={selectedAsset.condition === 'Good' ? 'default' : selectedAsset.condition === 'Fair' ? 'secondary' : 'destructive'}
                        >
                          {selectedAsset.condition}
                        </Badge>
                      </div>
                    </div>
                    {selectedAsset.last_inspection && (
                      <div>
                        <Label>Last Inspection</Label>
                        <p className="text-sm font-medium">
                          {new Date(selectedAsset.last_inspection).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {selectedAsset.lat && selectedAsset.lng && (
                      <div>
                        <Label>Location</Label>
                        <p className="text-sm font-medium">
                          {selectedAsset.lat.toFixed(6)}, {selectedAsset.lng.toFixed(6)}
                        </p>
                      </div>
                    )}
                    {villages?.find(v => v.id === selectedAsset.village_id) && (
                      <div>
                        <Label>Village</Label>
                        <p className="text-sm font-medium">
                          {villages.find(v => v.id === selectedAsset.village_id)?.name}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="incidents">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Citizen Reports</CardTitle>
                  <CardDescription>Manage and respond to citizen incident reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {incidents && incidents.length > 0 ? (
                      incidents.map((incident) => {
                        const village = villages?.find(v => v.id === incident.village_id);
                        return (
                          <div key={incident.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-destructive" />
                                <p className="font-medium text-foreground">{incident.asset_type || 'General Issue'}</p>
                              </div>
                              {incident.description && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {incident.description}
                                </p>
                              )}
                              {village && (
                                <p className="text-xs text-muted-foreground mt-1">{village.name}</p>
                              )}
                              {incident.reported_by_name && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Reported by: {incident.reported_by_name}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(incident.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <div className="flex gap-2">
                                <Badge
                                  variant={incident.status === 'Resolved' ? 'default' : incident.status === 'In Progress' ? 'secondary' : 'outline'}
                                  className="text-xs"
                                >
                                  {incident.status}
                                </Badge>
                                <Badge
                                  variant={incident.severity === 'High' ? 'destructive' : 'secondary'}
                                  className="text-xs"
                                >
                                  {incident.severity}
                                </Badge>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedIncident(incident)}
                              >
                                Review
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No incidents reported yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Incidents Map View</CardTitle>
                  <CardDescription>View incident locations on the map</CardDescription>
                </CardHeader>
                <CardContent>
                  <Map
                    villages={villages || []}
                    assets={[]}
                    incidents={incidents || []}
                    showVillages={false}
                    showAssets={false}
                    showIncidents={true}
                    height="600px"
                  />
                </CardContent>
              </Card>
            </div>
            <Dialog open={!!selectedIncident} onOpenChange={(open) => !open && setSelectedIncident(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{selectedIncident?.asset_type || 'General Issue'}</DialogTitle>
                  <DialogDescription>Incident Details</DialogDescription>
                </DialogHeader>
                {selectedIncident && (
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Description</Label>
                      <p className="text-sm font-medium mt-1">
                        {selectedIncident.description || 'No description provided'}
                      </p>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <div className="mt-1">
                        <Badge
                          variant={selectedIncident.status === 'Resolved' ? 'default' : selectedIncident.status === 'In Progress' ? 'secondary' : 'outline'}
                        >
                          {selectedIncident.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label>Severity</Label>
                      <div className="mt-1">
                        <Badge
                          variant={selectedIncident.severity === 'High' ? 'destructive' : 'secondary'}
                        >
                          {selectedIncident.severity}
                        </Badge>
                      </div>
                    </div>
                    {selectedIncident.lat && selectedIncident.lng && (
                      <div>
                        <Label>Location</Label>
                        <p className="text-sm font-medium">
                          {selectedIncident.lat.toFixed(6)}, {selectedIncident.lng.toFixed(6)}
                        </p>
                      </div>
                    )}
                    {villages?.find(v => v.id === selectedIncident.village_id) && (
                      <div>
                        <Label>Village</Label>
                        <p className="text-sm font-medium">
                          {villages.find(v => v.id === selectedIncident.village_id)?.name}
                        </p>
                      </div>
                    )}
                    {selectedIncident.reported_by_name && (
                      <div>
                        <Label>Reported By</Label>
                        <p className="text-sm font-medium">{selectedIncident.reported_by_name}</p>
                        {selectedIncident.reported_by_mobile && (
                          <p className="text-sm text-muted-foreground">{selectedIncident.reported_by_mobile}</p>
                        )}
                      </div>
                    )}
                    <div>
                      <Label>Reported On</Label>
                      <p className="text-sm font-medium">
                        {new Date(selectedIncident.created_at).toLocaleString()}
                      </p>
                    </div>
                    {selectedIncident.status !== 'Resolved' && (
                      <div className="space-y-2 pt-4 border-t">
                        <Label>Update Status</Label>
                        <div className="flex gap-2">
                          <Select
                            value={selectedIncident.status}
                            onValueChange={(value) => {
                              updateIncidentStatusMutation.mutate({
                                id: selectedIncident.id,
                                status: value
                              });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Received">Received</SelectItem>
                              <SelectItem value="In Progress">In Progress</SelectItem>
                              <SelectItem value="Resolved">Resolved</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Government;
