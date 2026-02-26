-- Add parent_id column for hierarchical categories
ALTER TABLE service_categories 
ADD COLUMN parent_id uuid REFERENCES service_categories(id) ON DELETE CASCADE;

-- Add index for faster parent lookups
CREATE INDEX idx_service_categories_parent_id ON service_categories(parent_id);

-- Insert main categories (parent categories with no parent_id)
INSERT INTO service_categories (name, icon) VALUES
('Home DIY and Renovation', 'home'),
('Commercial Renovations and Services', 'building'),
('Events and Catering', 'party-popper'),
('Health and Fitness', 'heart-pulse'),
('Agriculture, Moving and Transport', 'truck'),
('Pets Services', 'paw-print'),
('Business Services', 'briefcase'),
('IT Services', 'code'),
('Legal Services', 'scale'),
('Lessons', 'graduation-cap')
ON CONFLICT (name) DO UPDATE SET icon = EXCLUDED.icon;