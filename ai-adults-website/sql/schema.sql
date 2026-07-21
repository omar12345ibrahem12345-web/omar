-- Prestige Realty HR - Supabase Database Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- EMPLOYEES
-- ============================================
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  department TEXT,
  position TEXT,
  start_date TEXT,
  salary NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Active',
  initials TEXT,
  deductions JSONB DEFAULT '{"income_tax": 0, "social_security": 0, "medicare": 0, "health_insurance": 0, "retirement_401k": 0, "custom": 0}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their employees" ON employees
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- COMPANY INFO
-- ============================================
CREATE TABLE IF NOT EXISTS company_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  total_employees NUMERIC DEFAULT 0,
  founded TEXT,
  address TEXT,
  phone TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE company_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their company info" ON company_info
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- SALARY ENTRIES
-- ============================================
CREATE TABLE IF NOT EXISTS salary_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period TEXT,
  employee_count NUMERIC DEFAULT 0,
  gross NUMERIC DEFAULT 0,
  deductions NUMERIC DEFAULT 0,
  net NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Processed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE salary_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their salary entries" ON salary_entries
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- BENEFIT PLANS
-- ============================================
CREATE TABLE IF NOT EXISTS benefit_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  cost NUMERIC DEFAULT 0,
  enrolled NUMERIC DEFAULT 0,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE benefit_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their benefit plans" ON benefit_plans
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- SENIORS
-- ============================================
CREATE TABLE IF NOT EXISTS seniors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  department TEXT,
  salary NUMERIC DEFAULT 0,
  initials TEXT,
  deductions JSONB DEFAULT '{"income_tax": 0, "social_security": 0, "medicare": 0, "health_insurance": 0, "retirement_401k": 0, "custom": 0}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE seniors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their seniors" ON seniors
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- APPLICANTS
-- ============================================
CREATE TABLE IF NOT EXISTS applicants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position TEXT,
  date TEXT,
  status TEXT DEFAULT 'New',
  initials TEXT,
  email TEXT,
  phone TEXT,
  experience NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their applicants" ON applicants
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- OPEN POSITIONS
-- ============================================
CREATE TABLE IF NOT EXISTS open_positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  department TEXT,
  type TEXT DEFAULT 'Full-time',
  posted TEXT,
  applicants NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE open_positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their open positions" ON open_positions
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- RECRUITING STATS
-- ============================================
CREATE TABLE IF NOT EXISTS recruiting_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  open_positions NUMERIC DEFAULT 0,
  total_applicants NUMERIC DEFAULT 0,
  interviews NUMERIC DEFAULT 0,
  offers_pending NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE recruiting_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their recruiting stats" ON recruiting_stats
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- JOB BUDGETS
-- ============================================
CREATE TABLE IF NOT EXISTS job_budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  department TEXT,
  headcount NUMERIC DEFAULT 0,
  allocated NUMERIC DEFAULT 0,
  spent NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE job_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their job budgets" ON job_budgets
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- PROJECT BUDGETS
-- ============================================
CREATE TABLE IF NOT EXISTS project_budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  budget NUMERIC DEFAULT 0,
  spent NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE project_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their project budgets" ON project_budgets
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- REPORT METRICS
-- ============================================
CREATE TABLE IF NOT EXISTS report_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric TEXT,
  value TEXT,
  change TEXT,
  direction TEXT DEFAULT 'up',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE report_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their report metrics" ON report_metrics
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- EMPLOYEE IDS (Photos & SSN)
-- ============================================
CREATE TABLE IF NOT EXISTS employee_ids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  department TEXT,
  ssn TEXT,
  date_of_birth TEXT,
  phone TEXT,
  photo TEXT,
  initials TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE employee_ids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their employee IDs" ON employee_ids
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- PROPERTIES
-- ============================================
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  type TEXT,
  status TEXT DEFAULT 'for-sale',
  price NUMERIC DEFAULT 0,
  bedrooms NUMERIC DEFAULT 0,
  bathrooms NUMERIC DEFAULT 0,
  sqft NUMERIC DEFAULT 0,
  agent TEXT,
  color TEXT DEFAULT '#1E3A5F',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their properties" ON properties
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- HIRING TRENDS
-- ============================================
CREATE TABLE IF NOT EXISTS hiring_trends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  hires NUMERIC DEFAULT 0,
  departments TEXT,
  status TEXT DEFAULT 'Completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hiring_trends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their hiring trends" ON hiring_trends
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- AGENT PERFORMANCE
-- ============================================
CREATE TABLE IF NOT EXISTS agent_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sales NUMERIC DEFAULT 0,
  revenue TEXT,
  status TEXT DEFAULT 'Good',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE agent_performance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their agent performance" ON agent_performance
  FOR ALL USING (auth.uid() = user_id);
