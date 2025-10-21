-- Create user_metrics table
-- This table stores user metrics with Row Level Security enabled
-- Each metric has a category, value (1-5), name, and description

CREATE TABLE IF NOT EXISTS public.user_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value INTEGER NOT NULL CHECK (metric_value >= 1 AND metric_value <= 5),
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_user_metrics_user_id ON public.user_metrics(user_id);

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_user_metrics_category ON public.user_metrics(category);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_user_metrics_created_at ON public.user_metrics(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.user_metrics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view their own metrics" ON public.user_metrics;
DROP POLICY IF EXISTS "Users can insert their own metrics" ON public.user_metrics;
DROP POLICY IF EXISTS "Users can update their own metrics" ON public.user_metrics;
DROP POLICY IF EXISTS "Users can delete their own metrics" ON public.user_metrics;

-- RLS Policy: Users can only view their own metrics
CREATE POLICY "Users can view their own metrics"
  ON public.user_metrics
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own metrics
CREATE POLICY "Users can insert their own metrics"
  ON public.user_metrics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own metrics
CREATE POLICY "Users can update their own metrics"
  ON public.user_metrics
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own metrics
CREATE POLICY "Users can delete their own metrics"
  ON public.user_metrics
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.user_metrics;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.user_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_metrics TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE public.user_metrics IS 'Stores user metrics with categories and values (1-5 scale)';
COMMENT ON COLUMN public.user_metrics.user_id IS 'Foreign key to auth.users, identifies the metric owner';
COMMENT ON COLUMN public.user_metrics.metric_name IS 'Name/title of the metric';
COMMENT ON COLUMN public.user_metrics.metric_value IS 'Numeric value between 1-5 representing the metric score';
COMMENT ON COLUMN public.user_metrics.category IS 'Category grouping for the metric (e.g., Performance, Quality, Efficiency)';
COMMENT ON COLUMN public.user_metrics.description IS 'Optional detailed description of the metric';
