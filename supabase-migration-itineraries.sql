-- Create itineraries table for storing user search results
CREATE TABLE IF NOT EXISTS public.itineraries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Search parameters
  query TEXT NOT NULL,
  activities TEXT[] NOT NULL,
  budget INTEGER NOT NULL CHECK (budget >= 0 AND budget <= 4),
  num_pax TEXT NOT NULL,
  mbti TEXT,
  spicy INTEGER CHECK (spicy IS NULL OR (spicy >= 0 AND spicy <= 4)),
  start_date TEXT,
  end_date TEXT,
  
  -- Itinerary data (stored as JSONB for flexibility)
  itinerary_data JSONB NOT NULL
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_itineraries_user_id ON public.itineraries(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_itineraries_created_at ON public.itineraries(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only view their own itineraries
CREATE POLICY "Users can view their own itineraries"
  ON public.itineraries
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can only insert their own itineraries
CREATE POLICY "Users can insert their own itineraries"
  ON public.itineraries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can only update their own itineraries
CREATE POLICY "Users can update their own itineraries"
  ON public.itineraries
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can only delete their own itineraries
CREATE POLICY "Users can delete their own itineraries"
  ON public.itineraries
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add comment to table
COMMENT ON TABLE public.itineraries IS 'Stores user-generated itineraries with search parameters and complete itinerary data';

-- Add comments to columns
COMMENT ON COLUMN public.itineraries.itinerary_data IS 'Complete itinerary object containing title, summary, and activities array';
COMMENT ON COLUMN public.itineraries.budget IS 'Budget level: 0=Broke Student, 1=Budget-Friendly, 2=Moderate, 3=Comfortable, 4=Atas Boss';
COMMENT ON COLUMN public.itineraries.spicy IS 'Nightlife preference level: 0-4';

