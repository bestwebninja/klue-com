-- Add unique constraint on service_categories name to prevent duplicates
ALTER TABLE service_categories ADD CONSTRAINT service_categories_name_unique UNIQUE (name);