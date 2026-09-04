-- ==============================================================================
-- BuildCost Connect - Development Seed Data
-- Pakistan Construction Cost Intelligence Platform
-- NOTE: Sample rates are marked as is_demo_sample = true
-- ==============================================================================

-- 1. CITIES
INSERT INTO cities (id, name, urdu_name, province, default_marla_sqft, is_active) VALUES
('isb', 'Islamabad', 'اسلام آباد', 'Federal', 225, true),
('rwp', 'Rawalpindi', 'راولپنڈی', 'Punjab', 225, true),
('lhe', 'Lahore', 'لاہور', 'Punjab', 225, true),
('khi', 'Karachi', 'کراچی', 'Sindh', 225, true),
('pew', 'Peshawar', 'پشاور', 'KPK', 225, true),
('fsd', 'Faisalabad', 'فیصل آباد', 'Punjab', 272.25, true),
('mux', 'Multan', 'ملتان', 'Punjab', 272.25, true),
('grw', 'Gujranwala', 'گوجرانوالہ', 'Punjab', 225, true),
('skt', 'Sialkot', 'سیالکوٹ', 'Punjab', 225, true),
('qta', 'Quetta', 'کوئٹہ', 'Balochistan', 225, true),
('hyd', 'Hyderabad', 'حیدرآباد', 'Sindh', 225, true),
('atd', 'Abbottabad', 'ایبٹ آباد', 'KPK', 225, true),
('mre', 'Murree', 'مری', 'Punjab', 225, true)
ON CONFLICT (id) DO NOTHING;

-- 2. MARLA STANDARDS
INSERT INTO marla_standards (id, name, sqft, description, is_default) VALUES
('marla_225', '225 Sq Ft (Modern Urban / CDA / LDA / DHA)', 225, 'Standard adopted by modern urban housing authorities including CDA, LDA, DHA, and Bahria Town.', true),
('marla_250', '250 Sq Ft (Commercial / Selected Societies)', 250, 'Used in selected commercial developments and designated modern housing projects in Punjab.', false),
('marla_272_25', '272.25 Sq Ft (Traditional Revenue / Punjab Standard)', 272.25, 'Traditional revenue standard (1 Karam = 5.5 ft, 1 Sarsahi = 30.25 sqft, 9 Sarsahi = 272.25 sqft). Common in Multan, Faisalabad, and rural land records.', false)
ON CONFLICT (id) DO NOTHING;

-- 3. MATERIAL CATEGORIES
INSERT INTO material_categories (id, key, name, description, sort_order) VALUES
('cat_civil', 'civil', 'Civil & Foundation', 'Cement, Sand, Aggregates, and Concrete compounds', 1),
('cat_structural', 'structural', 'Structural Steel', 'Deformed rebar, wire mesh, and structural sections', 2),
('cat_masonry', 'masonry', 'Bricks & Masonry', 'Red clay bricks, solid concrete blocks, and AAC blocks', 3),
('cat_plaster', 'plaster', 'Plaster & Screed', 'Plastering sands, adhesives, and finishing plasters', 4),
('cat_flooring', 'flooring', 'Flooring & Tiles', 'Porcelain tiles, ceramic tiles, and bond adhesives', 5),
('cat_paint', 'paint', 'Paints & Finishes', 'Primers, wall putty, emulsions, and exterior weather-coat', 6)
ON CONFLICT (id) DO NOTHING;

-- 4. MATERIALS
INSERT INTO materials (id, category_id, name, code, specification, brand, unit, default_wastage_percent, is_active) VALUES
('mat_cement', 'cat_civil', 'Portland Cement (50kg Bag)', 'CEMENT_OPC', 'Ordinary Portland Cement (ASTM C150 Type 1)', 'Bestway / Fauji / Lucky', 'bag', 5, true),
('mat_steel_g60', 'cat_structural', 'Deformed Steel Bar Grade 60', 'STEEL_G60', 'ASTM A615 Grade 60 Deformed Billet Rebar', 'Mughal / Amreli / Ittehad', 'kg', 4, true),
('mat_brick_awwal', 'cat_masonry', 'Red Clay Bricks (Awwal / A-Grade)', 'BRICK_A', 'Kiln fired standard 9x4.5x3 inch red bricks', 'Local Kiln Verified', 'piece', 5, true),
('mat_sand_chenab', 'cat_civil', 'Chenab / Ravi River Sand', 'SAND_RIVER', 'Medium-coarse washed river sand for masonry and concrete', 'River Bed Excavation', 'cft', 5, true),
('mat_crush_margalla', 'cat_civil', 'Margalla / Sargodha Crush (Bajri)', 'CRUSH_BAJRI', 'Graded angular limestone crushed aggregate 1/2" to 3/4"', 'Margalla Quarry', 'cft', 5, true),
('mat_tiles_porcelain', 'cat_flooring', 'Porcelain Floor Tiles 60x60 cm', 'TILE_PORCELAIN', 'Full body porcelain polished tiles (24x24 in)', 'Master / Shabbir / RAK', 'sqft', 7, true),
('mat_paint_matt', 'cat_paint', 'Interior Matt Enamel / Emulsion', 'PAINT_EMULSION', 'Washable acrylic interior emulsion', 'Dulux / Berger / Brighto', 'litre', 5, true)
ON CONFLICT (id) DO NOTHING;

-- 5. RATE SOURCES
INSERT INTO rate_sources (id, name, source_type, website_url, reliability_score, notes) VALUES
('src_market_isb', 'Islamabad I-9 & Rawalpindi Mandi Survey', 'market_survey', NULL, 4, 'Direct dealer quotes collected from I-9 Industrial Area and Rawalpindi Gunj Mandi.'),
('src_market_lhe', 'Lahore Badami Bagh & Daroghwala Steel Market', 'market_survey', NULL, 4, 'Verified market surveys from Lahore wholesale distributors.'),
('src_market_khi', 'Karachi Shershah & Lyari Construction Market', 'market_survey', NULL, 4, 'Aggregated wholesale distributor prices.'),
('src_demo_default', 'BuildCost Verified Baseline (Demo / Sample)', 'demo_sample', NULL, 5, 'Baseline demo reference data for test calculations.')
ON CONFLICT (id) DO NOTHING;

-- 6. MATERIAL RATES (Sample rates with explicit demo flag)
INSERT INTO material_rates (material_id, city_id, brand, grade, unit, base_rate, transport_rate, loading_rate, unloading_rate, delivered_rate, currency, source_id, source_name, source_type, verified_at, confidence_score, status, trend_percentage, is_demo_sample) VALUES
('mat_cement', 'isb', 'Bestway Cement', 'OPC 50kg', 'bag', 1420, 20, 5, 5, 1450, 'PKR', 'src_market_isb', 'Islamabad Market Survey', 'market_survey', NOW(), 'HIGH', 'verified', 2.5, true),
('mat_cement', 'lhe', 'Lucky Cement', 'OPC 50kg', 'bag', 1390, 20, 5, 5, 1420, 'PKR', 'src_market_lhe', 'Lahore Wholesale Distributors', 'market_survey', NOW(), 'HIGH', 'verified', 1.8, true),
('mat_cement', 'khi', 'Falcon Cement', 'OPC 50kg', 'bag', 1370, 20, 5, 5, 1400, 'PKR', 'src_market_khi', 'Karachi Shershah Market', 'market_survey', NOW(), 'HIGH', 'verified', 0.5, true),

('mat_steel_g60', 'isb', 'Mughal Steel', 'Grade 60 Billet', 'kg', 255, 3, 1, 1, 260, 'PKR', 'src_market_isb', 'Islamabad Market Survey', 'market_survey', NOW(), 'HIGH', 'verified', -1.1, true),
('mat_steel_g60', 'lhe', 'Ittehad Steel', 'Grade 60 Billet', 'kg', 252, 3, 1, 1, 257, 'PKR', 'src_market_lhe', 'Lahore Wholesale Distributors', 'market_survey', NOW(), 'HIGH', 'verified', -0.8, true),
('mat_steel_g60', 'khi', 'Amreli Steels', 'Grade 60 Billet', 'kg', 256, 2, 1, 1, 260, 'PKR', 'src_market_khi', 'Karachi Shershah Market', 'market_survey', NOW(), 'HIGH', 'verified', 0.0, true),

('mat_brick_awwal', 'isb', 'Rawat Bhatta', 'A-Grade', 'piece', 13.5, 0.4, 0.05, 0.05, 14.0, 'PKR', 'src_market_isb', 'Islamabad Market Survey', 'market_survey', NOW(), 'HIGH', 'verified', 1.8, true),
('mat_brick_awwal', 'lhe', 'Multan Road Bhatta', 'A-Grade', 'piece', 12.8, 0.4, 0.05, 0.05, 13.3, 'PKR', 'src_market_lhe', 'Lahore Wholesale Distributors', 'market_survey', NOW(), 'HIGH', 'verified', 1.5, true),

('mat_sand_chenab', 'isb', 'Chenab River Sand', 'Medium Graded', 'cft', 42, 2, 0.5, 0.5, 45, 'PKR', 'src_market_isb', 'Islamabad Market Survey', 'market_survey', NOW(), 'MEDIUM', 'verified', 0.5, true),
('mat_sand_chenab', 'lhe', 'Ravi River Sand', 'Washed', 'cft', 38, 2, 0.5, 0.5, 41, 'PKR', 'src_market_lhe', 'Lahore Wholesale Distributors', 'market_survey', NOW(), 'MEDIUM', 'verified', 0.0, true),

('mat_crush_margalla', 'isb', 'Margalla Crush', '1/2" Graded', 'cft', 62, 2, 0.5, 0.5, 65, 'PKR', 'src_market_isb', 'Islamabad Market Survey', 'market_survey', NOW(), 'HIGH', 'verified', 0.0, true),
('mat_crush_margalla', 'lhe', 'Sargodha Crush', '1/2" Graded', 'cft', 60, 3, 0.5, 0.5, 64, 'PKR', 'src_market_lhe', 'Lahore Wholesale Distributors', 'market_survey', NOW(), 'HIGH', 'verified', -0.5, true),

('mat_tiles_porcelain', 'isb', 'Master Ceramics', '60x60cm Polished', 'sqft', 175, 3, 1, 1, 180, 'PKR', 'src_market_isb', 'Islamabad Tile Market', 'supplier', NOW(), 'HIGH', 'verified', 1.2, true),
('mat_paint_matt', 'isb', 'Dulux Velvet Touch', 'Interior Emulsion', 'litre', 830, 10, 5, 5, 850, 'PKR', 'src_market_isb', 'Islamabad Paint Dealers', 'supplier', NOW(), 'HIGH', 'verified', 2.0, true)
ON CONFLICT (material_id, city_id) DO UPDATE SET delivered_rate = EXCLUDED.delivered_rate, updated_at = NOW();

-- 7. LABOUR RATES
INSERT INTO labour_rates (role, role_urdu, city_id, skill_level, pricing_type, rate, currency, source_name, verified_at, notes) VALUES
('Head Mason (Raj Mistry)', 'راج مستری', 'isb', 'supervisor', 'per_day', 2800, 'PKR', 'Local Labour Chowk Survey', NOW(), 'Experienced residential supervisor'),
('Mason (Raj Mazdoor)', 'مستری', 'isb', 'skilled', 'per_day', 2400, 'PKR', 'Local Labour Chowk Survey', NOW(), 'Standard brickwork and plastering craftsman'),
('Labourer / Helper (Mazdoor)', 'مزدور', 'isb', 'helper', 'per_day', 1500, 'PKR', 'Local Labour Chowk Survey', NOW(), 'General material handling and concrete mixing'),
('Steel Fixer (Bar Bender)', 'سریا باندھنے والا', 'isb', 'skilled', 'per_day', 2500, 'PKR', 'Local Labour Chowk Survey', NOW(), 'Rebar bending and tying'),
('Plumber', 'پلمبر', 'isb', 'skilled', 'per_day', 2400, 'PKR', 'Local Labour Chowk Survey', NOW(), 'PPRC and PVC sanitary piping'),
('Electrician', 'الیکٹریشن', 'isb', 'skilled', 'per_day', 2400, 'PKR', 'Local Labour Chowk Survey', NOW(), 'Wiring and conduit layout'),
('Tile Worker (Mistri)', 'ٹائل مستری', 'isb', 'skilled', 'per_sqft', 45, 'PKR', 'Local Labour Chowk Survey', NOW(), 'Floor and bathroom tile fixing'),
('Painter', 'پینٹر', 'isb', 'skilled', 'per_sqft', 20, 'PKR', 'Local Labour Chowk Survey', NOW(), 'Two coats paint + primer + putty')
ON CONFLICT DO NOTHING;

-- 8. SOCIETY RULES
INSERT INTO society_rules (authority_name, society_name, city_id, plot_size_category, max_ground_coverage_percent, max_far, front_setback_ft, rear_setback_ft, side_setback_ft, max_height_ft, max_floors, notes, effective_date, verification_date) VALUES
('CDA', 'Capital Development Authority (Sectors)', 'isb', '5 Marla (25x45)', 70, 1.4, 5, 5, 0, 35, 3, 'Basement allowed subject to structural stability certificate.', '2024-01-01', '2026-01-01'),
('CDA', 'Capital Development Authority (Sectors)', 'isb', '10 Marla (35x70)', 65, 1.3, 10, 7, 5, 35, 3, 'Dual side setbacks required for corner plots.', '2024-01-01', '2026-01-01'),
('LDA', 'Lahore Development Authority', 'lhe', '5 Marla (25x45)', 75, 1.5, 5, 4, 0, 38, 3, 'LDA residential building regulations 2023.', '2023-06-01', '2026-01-01'),
('DHA', 'Defence Housing Authority (Phase 5/6)', 'isb', '10 Marla (35x70)', 65, 1.3, 10, 8, 5, 35, 3, 'Strict architectural guidelines and elevation approval mandatory.', '2024-01-01', '2026-01-01')
ON CONFLICT DO NOTHING;
