-- Add single campus location to products (Okerenkoko or Kurutie)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS campus text DEFAULT 'Okerenkoko';

-- Update existing demo products to their respective campuses
UPDATE public.products
SET campus = 'Kurutie'
WHERE slug IN (
  'a2-engineering-drawing-board-tee-square',
  'rechargeable-12-inch-hostel-table-fan',
  'cadet-officer-parade-oxford-shoes-leather-belt-pack'
);
