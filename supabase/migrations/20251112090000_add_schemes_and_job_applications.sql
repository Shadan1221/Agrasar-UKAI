-- Create schemes table for rural development schemes
CREATE TABLE IF NOT EXISTS public.schemes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  eligibility_criteria TEXT,
  benefits TEXT,
  application_process TEXT,
  contact_info TEXT,
  website_url TEXT,
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create job_applications table for MGNREGA job applications
CREATE TABLE IF NOT EXISTS public.job_applications (
  id TEXT PRIMARY KEY,
  work_order_id TEXT REFERENCES public.work_orders(id) ON DELETE SET NULL,
  village_id TEXT REFERENCES public.villages(id) ON DELETE CASCADE,
  applicant_name TEXT NOT NULL,
  applicant_mobile TEXT NOT NULL,
  applicant_age INTEGER,
  applicant_gender TEXT,
  preferred_work_type TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view schemes" ON public.schemes FOR SELECT USING (true);
CREATE POLICY "Anyone can create job applications" ON public.job_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view job applications" ON public.job_applications FOR SELECT USING (true);

-- Insert mock schemes data
INSERT INTO public.schemes (id, name, description, category, eligibility_criteria, benefits, application_process, contact_info, status) VALUES
('S001', 'Pradhan Mantri Awas Yojana (Gramin)', 'Housing scheme for rural areas', 'Housing', 'Below Poverty Line families, SC/ST, Minorities', 'Financial assistance up to ₹1,20,000 for house construction', 'Apply through Gram Panchayat or online portal', 'Toll-free: 1800-11-3377', 'Active'),
('S002', 'Pradhan Mantri Krishi Sinchai Yojana', 'Irrigation scheme for farmers', 'Agriculture', 'Farmers with agricultural land', 'Subsidy for irrigation equipment and water conservation', 'Apply through agriculture department', 'Toll-free: 1800-180-1551', 'Active'),
('S003', 'Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)', 'Guaranteed employment for rural households', 'Employment', 'Adult members of rural households willing to do unskilled manual work', '100 days of guaranteed wage employment per household per year', 'Register at Gram Panchayat or Block Office', 'Toll-free: 1800-345-6515', 'Active'),
('S004', 'Pradhan Mantri Gram Sadak Yojana', 'Rural road connectivity scheme', 'Infrastructure', 'Villages with population above 500', 'All-weather road connectivity to villages', 'Apply through District Rural Development Agency', 'Toll-free: 1800-180-1551', 'Active'),
('S005', 'National Rural Livelihoods Mission', 'Self-employment and skill development', 'Livelihood', 'Rural poor, especially women', 'Financial assistance, skill training, and market linkages', 'Join Self Help Groups through Gram Panchayat', 'Toll-free: 1800-345-6515', 'Active'),
('S006', 'Swachh Bharat Mission (Gramin)', 'Rural sanitation and cleanliness', 'Sanitation', 'Rural households without toilets', 'Financial assistance for toilet construction', 'Apply through Gram Panchayat', 'Toll-free: 1800-11-3377', 'Active'),
('S007', 'Pradhan Mantri Ujjwala Yojana', 'LPG connection for BPL families', 'Energy', 'Below Poverty Line families', 'Free LPG connection and stove', 'Apply through LPG distributors or online', 'Toll-free: 1800-266-6696', 'Active'),
('S008', 'Pradhan Mantri Fasal Bima Yojana', 'Crop insurance for farmers', 'Agriculture', 'Farmers growing notified crops', 'Premium subsidy and crop loss compensation', 'Apply through banks or insurance companies', 'Toll-free: 1800-180-1551', 'Active');

-- Insert mock work orders (MGNREGA jobs)
INSERT INTO public.work_orders (id, village_id, title, description, status, workers_needed, estimated_budget, start_date, end_date) VALUES
('WO001', 'V001', 'Road Construction - Bhavapur to Main Highway', 'Construction of 2 km rural road connecting village to main highway', 'Open', 25, 500000, '2025-01-15', '2025-03-15'),
('WO002', 'V002', 'Pond Renovation - Nirmal Nagar', 'Deepening and cleaning of community pond for water storage', 'Open', 15, 300000, '2025-01-20', '2025-02-20'),
('WO003', 'V003', 'Anganwadi Building Construction', 'Construction of new Anganwadi center building', 'Open', 20, 400000, '2025-02-01', '2025-04-01'),
('WO004', 'V001', 'Water Harvesting Structure', 'Construction of check dams and water harvesting structures', 'Open', 18, 350000, '2025-02-10', '2025-03-10'),
('WO005', 'V002', 'Plantation Drive', 'Tree plantation and maintenance in village common areas', 'Open', 12, 150000, '2025-01-25', '2025-02-25');

-- Create updated_at trigger for new tables
CREATE TRIGGER update_schemes_updated_at BEFORE UPDATE ON public.schemes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON public.job_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

