-- Create villages table
CREATE TABLE public.villages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  block TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  population INTEGER NOT NULL DEFAULT 0,
  households INTEGER NOT NULL DEFAULT 0,
  lat DECIMAL(10, 6) NOT NULL,
  lng DECIMAL(10, 6) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create assets table
CREATE TABLE public.assets (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  village_id TEXT REFERENCES public.villages(id) ON DELETE CASCADE,
  condition TEXT NOT NULL DEFAULT 'Good',
  last_inspection DATE,
  lat DECIMAL(10, 6),
  lng DECIMAL(10, 6),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create work_orders table
CREATE TABLE public.work_orders (
  id TEXT PRIMARY KEY,
  village_id TEXT REFERENCES public.villages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Draft',
  workers_needed INTEGER DEFAULT 0,
  estimated_budget DECIMAL(12, 2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create incidents table for citizen reports
CREATE TABLE public.incidents (
  id TEXT PRIMARY KEY,
  village_id TEXT REFERENCES public.villages(id) ON DELETE CASCADE,
  asset_id TEXT REFERENCES public.assets(id) ON DELETE SET NULL,
  asset_type TEXT,
  severity TEXT NOT NULL DEFAULT 'Medium',
  description TEXT,
  photo_url TEXT,
  lat DECIMAL(10, 6),
  lng DECIMAL(10, 6),
  reported_by_name TEXT,
  reported_by_mobile TEXT,
  status TEXT NOT NULL DEFAULT 'Received',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create forecasts table
CREATE TABLE public.forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  village_id TEXT REFERENCES public.villages(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  workers_needed INTEGER NOT NULL DEFAULT 0,
  confidence DECIMAL(3, 2) NOT NULL DEFAULT 0.5,
  recommended_work_types TEXT[],
  estimated_budget DECIMAL(12, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecasts ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow read for all authenticated users, write for specific roles)
CREATE POLICY "Anyone can view villages" ON public.villages FOR SELECT USING (true);
CREATE POLICY "Anyone can view assets" ON public.assets FOR SELECT USING (true);
CREATE POLICY "Anyone can view work orders" ON public.work_orders FOR SELECT USING (true);
CREATE POLICY "Anyone can view incidents" ON public.incidents FOR SELECT USING (true);
CREATE POLICY "Anyone can view forecasts" ON public.forecasts FOR SELECT USING (true);

-- Citizens can create incidents
CREATE POLICY "Anyone can create incidents" ON public.incidents FOR INSERT WITH CHECK (true);

-- Authenticated users can create work orders
CREATE POLICY "Authenticated users can create work orders" ON public.work_orders FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update work orders" ON public.work_orders FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Insert mock data
INSERT INTO public.villages (id, name, block, district, state, population, households, lat, lng) VALUES
('V001', 'Bhavapur', 'Sukha', 'Sita', 'Madhya Bharat', 2450, 520, 24.560, 78.120),
('V002', 'Nirmal Nagar', 'Sukha', 'Sita', 'Madhya Bharat', 1120, 260, 24.572, 78.135),
('V003', 'Haritgaon', 'Ramgarh', 'Sita', 'Madhya Bharat', 3890, 780, 24.598, 78.180);

INSERT INTO public.assets (id, type, name, village_id, condition, last_inspection, lat, lng) VALUES
('A1001', 'Rural Road', 'Bhavapur - main lane', 'V001', 'Poor', '2025-08-10', 24.561, 78.121),
('A1002', 'Community Well', 'Nirmal Nagar Well', 'V002', 'Fair', '2025-05-23', 24.572, 78.136),
('A1003', 'Anganwadi Center', 'Haritgaon Primary Center', 'V003', 'Good', '2025-10-15', 24.599, 78.181),
('A1004', 'Pond', 'Bhavapur Community Pond', 'V001', 'Poor', '2025-07-20', 24.562, 78.122);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_villages_updated_at BEFORE UPDATE ON public.villages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON public.work_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();