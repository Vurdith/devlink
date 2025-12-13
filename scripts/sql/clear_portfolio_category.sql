-- One-time cleanup: categories are deprecated for portfolio items.
-- Skills are used as the category instead.

UPDATE "PortfolioItem"
SET "category" = NULL
WHERE "category" IS NOT NULL AND "category" <> '';


