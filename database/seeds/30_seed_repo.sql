-- =============================================================
-- 30_seed_repo.sql -- original hand-written seed data (from seeds/)
-- =============================================================

-- ---- seed: categories ----
INSERT INTO categories (name) VALUES
  ('SCIENCE_TECHNOLOGY_ENGINEERING'),
  ('EDUCATION_TEACHING'),
  ('MEDICAL_PARAMEDICAL'),
  ('ISLAMIC_SCIENCES'),
  ('LANGUAGES_CULTURE_ARTS_SOCIAL'),
  ('SPORTS_PHYSICAL_EDUCATION'),
  ('AGRICULTURE_ENVIRONMENT_SUSTAINABLE'),
  ('TOURISM_HOSPITALITY'),
  ('ECONOMICS_TRADE_MANAGEMENT'),
  ('URBAN_PLANNING_PUBLIC_WORKS_LOGISTICS'),
  ('MARITIME'),
  ('DEFENSE_SECURITY')
ON CONFLICT (id) DO NOTHING;
-- ---- seed: cities ----
INSERT INTO cities (id) VALUES
  ('30000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000002'),
  ('30000000-0000-0000-0000-000000000003'),
  ('30000000-0000-0000-0000-000000000004'),
  ('30000000-0000-0000-0000-000000000005'),
  ('30000000-0000-0000-0000-000000000006'),
  ('30000000-0000-0000-0000-000000000007'),
  ('30000000-0000-0000-0000-000000000008'),
  ('30000000-0000-0000-0000-000000000009'),
  ('30000000-0000-0000-0000-000000000010'),
  ('30000000-0000-0000-0000-000000000011'),
  ('30000000-0000-0000-0000-000000000012'),
  ('30000000-0000-0000-0000-000000000013'),
  ('30000000-0000-0000-0000-000000000014'),
  ('30000000-0000-0000-0000-000000000015'),
  ('30000000-0000-0000-0000-000000000016'),
  ('30000000-0000-0000-0000-000000000017'),
  ('30000000-0000-0000-0000-000000000018'),
  ('30000000-0000-0000-0000-000000000019'),
  ('30000000-0000-0000-0000-000000000020'),
  ('30000000-0000-0000-0000-000000000021'),
  ('30000000-0000-0000-0000-000000000022'),
  ('30000000-0000-0000-0000-000000000023'),
  ('30000000-0000-0000-0000-000000000024'),
  ('30000000-0000-0000-0000-000000000025'),
  ('30000000-0000-0000-0000-000000000026'),
  ('30000000-0000-0000-0000-000000000027'),
  ('30000000-0000-0000-0000-000000000028'),
  ('30000000-0000-0000-0000-000000000029'),
  ('30000000-0000-0000-0000-000000000030'),
  ('30000000-0000-0000-0000-000000000031')
ON CONFLICT (id) DO NOTHING;

-- ---- seed: fields ----
INSERT INTO fields (id) VALUES
  ('91000000-0000-0000-0000-000000000001'),
  ('91000000-0000-0000-0000-000000000002'),
  ('91000000-0000-0000-0000-000000000003'),
  ('91000000-0000-0000-0000-000000000004')
ON CONFLICT (id) DO NOTHING;
-- ---- seed: job_titles ----
INSERT INTO job_titles (id, title, salary) VALUES
  (
    'a1000000-0000-0000-0000-000000000001',
    'Software Engineer',
    12000
  ),
  (
    'a1000000-0000-0000-0000-000000000002',
    'Data Scientist',
    14000
  ),
  (
    'a1000000-0000-0000-0000-000000000003',
    'Civil Engineer',
    11000
  )
ON CONFLICT (id) DO NOTHING;
-- ---- seed: diplomas ----
INSERT INTO diplomas (code, diploma_group, rank) VALUES
  ('BAC_SC_MATH_A', 'BAC', 12),
  ('BAC_SC_MATH_B', 'BAC', 12),
  ('BAC_SC_PHY', 'BAC', 12),
  ('BAC_SVT', 'BAC', 12),
  ('BAC_SC_ECO', 'BAC', 12),
  ('BAC_TGC', 'BAC', 12),
  ('BAC_STE', 'BAC', 12),
  ('BAC_STM', 'BAC', 12),
  ('BAC_LETTRES', 'BAC', 12),
  ('BAC_SC_HUMAINES', 'BAC', 12),
  ('BAC_AGRO', 'BAC', 12),
  ('BAC_ARTS', 'BAC', 12),
  ('BAC_PRO', 'BAC', 12),
  ('BAC_LIBRE_SC_MATH', 'BAC', 12),
  ('BAC_LIBRE_SC_PHY', 'BAC', 12),
  ('BAC_LIBRE_SVT', 'BAC', 12),
  ('BAC_LIBRE_SC_ECO', 'BAC', 12),
  ('BAC_LIBRE_LETTRES', 'BAC', 12),
  ('BAC_LIBRE_SC_HUMAINES', 'BAC', 12),

  ('DEUG_SMP', 'BAC+2', 14),
  ('DEUG_SMC', 'BAC+2', 14),
  ('DEUG_SMA', 'BAC+2', 14),
  ('DEUG_SMI', 'BAC+2', 14),
  ('DEUG_SVI', 'BAC+2', 14),
  ('DEUG_ECO', 'BAC+2', 14),
  ('DEUG_DROIT_FR', 'BAC+2', 14),
  ('DEUG_DROIT_AR', 'BAC+2', 14),

  ('DEUST_MIP', 'BAC+2', 14),
  ('DEUST_MIPC', 'BAC+2', 14),
  ('DEUST_BCG', 'BAC+2', 14),
  ('DEUST_GEGM', 'BAC+2', 14),

  ('DUT_INFO', 'BAC+2', 14),
  ('DUT_GE', 'BAC+2', 14),
  ('DUT_TM', 'BAC+2', 14),
  ('DUT_GEII', 'BAC+2', 14),
  ('DUT_GMP', 'BAC+2', 14),

  ('BTS_DSI', 'BAC+2', 14),
  ('BTS_CG', 'BAC+2', 14),
  ('BTS_MCO', 'BAC+2', 14),
  ('BTS_SE', 'BAC+2', 14),

  ('LICENCE_FONDAMENTALE', 'BAC+3', 15),
  ('LICENCE_PRO', 'BAC+3', 15),
  ('LICENCE_EDUCATION', 'BAC+3', 15),

  ('MASTER_RECHERCHE', 'BAC+5', 17),
  ('MASTER_SPECIALISE', 'BAC+5', 17),
  ('INGENIEUR_ETAT', 'BAC+5', 17),
  ('DENCG', 'BAC+5', 17),

  ('DOCTORAT', 'DOCTORAT', 20),
  ('DOCTORAT_MEDECINE', 'DOCTORAT', 20),
  ('DOCTORAT_PHARMACIE', 'DOCTORAT', 20),
  ('DOCTORAT_MEDECINE_DENTAIRE', 'DOCTORAT', 20)
ON CONFLICT (code) DO NOTHING;
-- ---- seed: universities ----
INSERT INTO universities ( id, type, is_approved, internat_available, bourse_available, abreviation ) VALUES
  ('40000000-0000-0000-0000-000000000001', 'PUBLIC', true, true, true, 'ENSA'),
  ('40000000-0000-0000-0000-000000000002', 'PRIVATE', true, false, false, 'UIR'),
  ('40000000-0000-0000-0000-000000000003', 'SEMI_PUBLIC', true, true, true, 'UM6P')
ON CONFLICT (id) DO NOTHING;
-- ---- seed: users ----
INSERT INTO users (
  id, first_name, last_name, role, email, password_hash, auth_provider, google_id, year_of_birth, is_dropout, is_2fa_enabled
) VALUES
  (
    '70000000-0000-0000-0000-000000000004',
    'Karim', 'El Mansouri', 'SUPERADMIN',
    'requiredanne-marie@web-library.net',
    '$2b$10$5apXnGTweR1Zb3J0gFnEwOUECp9tBMt./zkCIfdYuf3TAieKI8q3a', 
    'LOCAL', NULL, 1995,
    false, true
  ),
  (
    '70000000-0000-0000-0000-000000000001', 'Yassine', 'Benali', 'ADMIN',
    'admin@admin.com', '$2b$10$5apXnGTweR1Zb3J0gFnEwOUECp9tBMt./zkCIfdYuf3TAieKI8q3a', 'LOCAL', NULL, 2001,
    false, true
  ),
  (
    '70000000-0000-0000-0000-000000000002', 'Salma', 'El Amrani', 'USER',
    'salma.elamrani@example.com', NULL, 'GOOGLE', 'google-oauth-id-98765', 2006,
    false, false
  ),
  (
    '70000000-0000-0000-0000-000000000003', 'Omar', 'Chraibi', 'USER',
    'zguellouch@gmail.com', '$2b$10$5apXnGTweR1Zb3J0gFnEwOUECp9tBMt./zkCIfdYuf3TAieKI8q3a', 'LOCAL', NULL, 2004,
    true, false
  )
ON CONFLICT (id) DO NOTHING;
-- ---- seed: category_translations ----
INSERT INTO category_translations (category_id, locale, name)
SELECT id, 'FR'::locale_type, 'Sciences, Technologie et Ingénierie'
FROM categories WHERE name = 'SCIENCE_TECHNOLOGY_ENGINEERING'
UNION ALL
SELECT id, 'EN'::locale_type, 'Science, Technology and Engineering'
FROM categories WHERE name = 'SCIENCE_TECHNOLOGY_ENGINEERING'
UNION ALL
SELECT id, 'AR'::locale_type, 'مجال العلوم والتكنولوجيا والهندسة'
FROM categories WHERE name = 'SCIENCE_TECHNOLOGY_ENGINEERING'

UNION ALL
SELECT id, 'FR'::locale_type, 'Éducation et Enseignement'
FROM categories WHERE name = 'EDUCATION_TEACHING'
UNION ALL
SELECT id, 'EN'::locale_type, 'Education and Teaching'
FROM categories WHERE name = 'EDUCATION_TEACHING'
UNION ALL
SELECT id, 'AR'::locale_type, 'مجال التربية والتعليم'
FROM categories WHERE name = 'EDUCATION_TEACHING'

UNION ALL
SELECT id, 'FR'::locale_type, 'Médical et Paramédical'
FROM categories WHERE name = 'MEDICAL_PARAMEDICAL'
UNION ALL
SELECT id, 'EN'::locale_type, 'Medical and Paramedical'
FROM categories WHERE name = 'MEDICAL_PARAMEDICAL'
UNION ALL
SELECT id, 'AR'::locale_type, 'المجال الطبي وشبه الطبي'
FROM categories WHERE name = 'MEDICAL_PARAMEDICAL'

UNION ALL
SELECT id, 'FR'::locale_type, 'Sciences Islamiques'
FROM categories WHERE name = 'ISLAMIC_SCIENCES'
UNION ALL
SELECT id, 'EN'::locale_type, 'Islamic Sciences'
FROM categories WHERE name = 'ISLAMIC_SCIENCES'
UNION ALL
SELECT id, 'AR'::locale_type, 'مجال العلوم الإسلامية'
FROM categories WHERE name = 'ISLAMIC_SCIENCES'

UNION ALL
SELECT id, 'FR'::locale_type, 'Langues, Cultures, Communication, Arts et Sciences Sociales'
FROM categories WHERE name = 'LANGUAGES_CULTURE_ARTS_SOCIAL'
UNION ALL
SELECT id, 'EN'::locale_type, 'Languages, Cultures, Communication, Arts and Social Sciences'
FROM categories WHERE name = 'LANGUAGES_CULTURE_ARTS_SOCIAL'
UNION ALL
SELECT id, 'AR'::locale_type, 'مجال اللغات والثقافات والتواصل والفنون والعلوم الاجتماعية'
FROM categories WHERE name = 'LANGUAGES_CULTURE_ARTS_SOCIAL'

UNION ALL
SELECT id, 'FR'::locale_type, 'Sport et Éducation Physique'
FROM categories WHERE name = 'SPORTS_PHYSICAL_EDUCATION'
UNION ALL
SELECT id, 'EN'::locale_type, 'Sports and Physical Education'
FROM categories WHERE name = 'SPORTS_PHYSICAL_EDUCATION'
UNION ALL
SELECT id, 'AR'::locale_type, 'مجال الرياضة والتربية البدنية'
FROM categories WHERE name = 'SPORTS_PHYSICAL_EDUCATION'

UNION ALL
SELECT id, 'FR'::locale_type, 'Agriculture, Environnement et Développement Durable'
FROM categories WHERE name = 'AGRICULTURE_ENVIRONMENT_SUSTAINABLE'
UNION ALL
SELECT id, 'EN'::locale_type, 'Agriculture, Environment and Sustainable Development'
FROM categories WHERE name = 'AGRICULTURE_ENVIRONMENT_SUSTAINABLE'
UNION ALL
SELECT id, 'AR'::locale_type, 'المجال الفلاحي والبيئي والتنمية المستدامة'
FROM categories WHERE name = 'AGRICULTURE_ENVIRONMENT_SUSTAINABLE'

UNION ALL
SELECT id, 'FR'::locale_type, 'Tourisme et Hôtellerie'
FROM categories WHERE name = 'TOURISM_HOSPITALITY'
UNION ALL
SELECT id, 'EN'::locale_type, 'Tourism and Hospitality'
FROM categories WHERE name = 'TOURISM_HOSPITALITY'
UNION ALL
SELECT id, 'AR'::locale_type, 'المجال السياحي والفندقي'
FROM categories WHERE name = 'TOURISM_HOSPITALITY'

UNION ALL
SELECT id, 'FR'::locale_type, 'Économie, Commerce et Gestion'
FROM categories WHERE name = 'ECONOMICS_TRADE_MANAGEMENT'
UNION ALL
SELECT id, 'EN'::locale_type, 'Economics, Trade and Management'
FROM categories WHERE name = 'ECONOMICS_TRADE_MANAGEMENT'
UNION ALL
SELECT id, 'AR'::locale_type, 'مجال الاقتصاد والتجارة والتسيير'
FROM categories WHERE name = 'ECONOMICS_TRADE_MANAGEMENT'

UNION ALL
SELECT id, 'FR'::locale_type, 'Urbanisme, Travaux Publics et Logistique'
FROM categories WHERE name = 'URBAN_PLANNING_PUBLIC_WORKS_LOGISTICS'
UNION ALL
SELECT id, 'EN'::locale_type, 'Urban Planning, Public Works and Logistics'
FROM categories WHERE name = 'URBAN_PLANNING_PUBLIC_WORKS_LOGISTICS'
UNION ALL
SELECT id, 'AR'::locale_type, 'مجال التعمير، الأشغال العمومية واللوجستيك'
FROM categories WHERE name = 'URBAN_PLANNING_PUBLIC_WORKS_LOGISTICS'

UNION ALL
SELECT id, 'FR'::locale_type, 'Domaine Maritime'
FROM categories WHERE name = 'MARITIME'
UNION ALL
SELECT id, 'EN'::locale_type, 'Maritime Field'
FROM categories WHERE name = 'MARITIME'
UNION ALL
SELECT id, 'AR'::locale_type, 'المجال البحري'
FROM categories WHERE name = 'MARITIME'

UNION ALL
SELECT id, 'FR'::locale_type, 'Défense et Sécurité'
FROM categories WHERE name = 'DEFENSE_SECURITY'
UNION ALL
SELECT id, 'EN'::locale_type, 'Defense and Security'
FROM categories WHERE name = 'DEFENSE_SECURITY'
UNION ALL
SELECT id, 'AR'::locale_type, 'مجال الدفاع والأمن'
FROM categories WHERE name = 'DEFENSE_SECURITY'

ON CONFLICT (category_id, locale) DO NOTHING;
-- ---- seed: city_translations ----
INSERT INTO city_translations (city_id, locale, name, region) VALUES
  ('30000000-0000-0000-0000-000000000001', 'FR', 'Casablanca', 'Casablanca-Settat'),
  ('30000000-0000-0000-0000-000000000001', 'EN', 'Casablanca', 'Casablanca-Settat'),
  ('30000000-0000-0000-0000-000000000001', 'AR', 'الدار البيضاء', 'الدار البيضاء سطات'),

  ('30000000-0000-0000-0000-000000000002', 'FR', 'Rabat', 'Rabat-Salé-Kénitra'),
  ('30000000-0000-0000-0000-000000000002', 'EN', 'Rabat', 'Rabat-Sale-Kenitra'),
  ('30000000-0000-0000-0000-000000000002', 'AR', 'الرباط', 'الرباط سلا القنيطرة'),

  ('30000000-0000-0000-0000-000000000003', 'FR', 'Marrakech', 'Marrakech-Safi'),
  ('30000000-0000-0000-0000-000000000003', 'EN', 'Marrakech', 'Marrakech-Safi'),
  ('30000000-0000-0000-0000-000000000003', 'AR', 'مراكش', 'مراكش آسفي'),

-- Tanger
('30000000-0000-0000-0000-000000000004', 'FR', 'Tanger', 'Tanger-Tétouan-Al Hoceïma'),
('30000000-0000-0000-0000-000000000004', 'EN', 'Tangier', 'Tangier-Tetouan-Al Hoceima'),
('30000000-0000-0000-0000-000000000004', 'AR', 'طنجة', 'طنجة تطوان الحسيمة'),

-- Fès
('30000000-0000-0000-0000-000000000005', 'FR', 'Fès', 'Fès-Meknès'),
('30000000-0000-0000-0000-000000000005', 'EN', 'Fez', 'Fes-Meknes'),
('30000000-0000-0000-0000-000000000005', 'AR', 'فاس', 'فاس مكناس'),

-- Meknès
('30000000-0000-0000-0000-000000000006', 'FR', 'Meknès', 'Fès-Meknès'),
('30000000-0000-0000-0000-000000000006', 'EN', 'Meknes', 'Fes-Meknes'),
('30000000-0000-0000-0000-000000000006', 'AR', 'مكناس', 'فاس مكناس'),

-- Agadir
('30000000-0000-0000-0000-000000000007', 'FR', 'Agadir', 'Souss-Massa'),
('30000000-0000-0000-0000-000000000007', 'EN', 'Agadir', 'Souss-Massa'),
('30000000-0000-0000-0000-000000000007', 'AR', 'أكادير', 'سوس ماسة'),

-- Oujda
('30000000-0000-0000-0000-000000000008', 'FR', 'Oujda', 'Oriental'),
('30000000-0000-0000-0000-000000000008', 'EN', 'Oujda', 'Oriental'),
('30000000-0000-0000-0000-000000000008', 'AR', 'وجدة', 'الشرق'),

-- Kénitra
('30000000-0000-0000-0000-000000000009', 'FR', 'Kénitra', 'Rabat-Salé-Kénitra'),
('30000000-0000-0000-0000-000000000009', 'EN', 'Kenitra', 'Rabat-Sale-Kenitra'),
('30000000-0000-0000-0000-000000000009', 'AR', 'القنيطرة', 'الرباط سلا القنيطرة'),

-- Salé
('30000000-0000-0000-0000-000000000010', 'FR', 'Salé', 'Rabat-Salé-Kénitra'),
('30000000-0000-0000-0000-000000000010', 'EN', 'Salé', 'Rabat-Sale-Kenitra'),
('30000000-0000-0000-0000-000000000010', 'AR', 'سلا', 'الرباط سلا القنيطرة'),

-- Tétouan
('30000000-0000-0000-0000-000000000011', 'FR', 'Tétouan', 'Tanger-Tétouan-Al Hoceïma'),
('30000000-0000-0000-0000-000000000011', 'EN', 'Tetouan', 'Tangier-Tetouan-Al Hoceima'),
('30000000-0000-0000-0000-000000000011', 'AR', 'تطوان', 'طنجة تطوان الحسيمة'),

-- Béni Mellal
('30000000-0000-0000-0000-000000000012', 'FR', 'Béni Mellal', 'Béni Mellal-Khénifra'),
('30000000-0000-0000-0000-000000000012', 'EN', 'Beni Mellal', 'Beni Mellal-Khenifra'),
('30000000-0000-0000-0000-000000000012', 'AR', 'بني ملال', 'بني ملال خنيفرة'),

-- Ouarzazate
('30000000-0000-0000-0000-000000000013', 'FR', 'Ouarzazate', 'Drâa-Tafilalet'),
('30000000-0000-0000-0000-000000000013', 'EN', 'Ouarzazate', 'Draa-Tafilalet'),
('30000000-0000-0000-0000-000000000013', 'AR', 'ورزازات', 'درعة تافيلالت'),

-- Laâyoune
('30000000-0000-0000-0000-000000000014', 'FR', 'Laâyoune', 'Laâyoune-Sakia El Hamra'),
('30000000-0000-0000-0000-000000000014', 'EN', 'Laayoune', 'Laayoune-Sakia El Hamra'),
('30000000-0000-0000-0000-000000000014', 'AR', 'العيون', 'العيون الساقية الحمراء'),

-- Dakhla
('30000000-0000-0000-0000-000000000015', 'FR', 'Dakhla', 'Dakhla-Oued Ed-Dahab'),
('30000000-0000-0000-0000-000000000015', 'EN', 'Dakhla', 'Dakhla-Oued Ed-Dahab'),
('30000000-0000-0000-0000-000000000015', 'AR', 'الداخلة', 'الداخلة وادي الذهب'),

-- Guelmim
('30000000-0000-0000-0000-000000000016', 'FR', 'Guelmim', 'Guelmim-Oued Noun'),
('30000000-0000-0000-0000-000000000016', 'EN', 'Guelmim', 'Guelmim-Oued Noun'),
('30000000-0000-0000-0000-000000000016', 'AR', 'كلميم', 'كلميم واد نون'),

-- Settat
('30000000-0000-0000-0000-000000000017', 'FR', 'Settat', 'Casablanca-Settat'),
('30000000-0000-0000-0000-000000000017', 'EN', 'Settat', 'Casablanca-Settat'),
('30000000-0000-0000-0000-000000000017', 'AR', 'سطات', 'الدار البيضاء سطات'),

-- El Jadida
('30000000-0000-0000-0000-000000000018', 'FR', 'El Jadida', 'Casablanca-Settat'),
('30000000-0000-0000-0000-000000000018', 'EN', 'El Jadida', 'Casablanca-Settat'),
('30000000-0000-0000-0000-000000000018', 'AR', 'الجديدة', 'الدار البيضاء سطات'),

-- Essaouira
('30000000-0000-0000-0000-000000000019', 'FR', 'Essaouira', 'Marrakech-Safi'),
('30000000-0000-0000-0000-000000000019', 'EN', 'Essaouira', 'Marrakech-Safi'),
('30000000-0000-0000-0000-000000000019', 'AR', 'الصويرة', 'مراكش آسفي'),

-- Safi
('30000000-0000-0000-0000-000000000020', 'FR', 'Safi', 'Marrakech-Safi'),
('30000000-0000-0000-0000-000000000020', 'EN', 'Safi', 'Marrakech-Safi'),
('30000000-0000-0000-0000-000000000020', 'AR', 'آسفي', 'مراكش آسفي'),

-- Nador
('30000000-0000-0000-0000-000000000021', 'FR', 'Nador', 'Oriental'),
('30000000-0000-0000-0000-000000000021', 'EN', 'Nador', 'Oriental'),
('30000000-0000-0000-0000-000000000021', 'AR', 'الناظور', 'الشرق'),

-- Taza
('30000000-0000-0000-0000-000000000022', 'FR', 'Taza', 'Fès-Meknès'),
('30000000-0000-0000-0000-000000000022', 'EN', 'Taza', 'Fes-Meknes'),
('30000000-0000-0000-0000-000000000022', 'AR', 'تازة', 'فاس مكناس'),

-- Khouribga
('30000000-0000-0000-0000-000000000023', 'FR', 'Khouribga', 'Béni Mellal-Khénifra'),
('30000000-0000-0000-0000-000000000023', 'EN', 'Khouribga', 'Beni Mellal-Khenifra'),
('30000000-0000-0000-0000-000000000023', 'AR', 'خريبكة', 'بني ملال خنيفرة'),

-- Khénifra
('30000000-0000-0000-0000-000000000024', 'FR', 'Khénifra', 'Béni Mellal-Khénifra'),
('30000000-0000-0000-0000-000000000024', 'EN', 'Khenifra', 'Beni Mellal-Khenifra'),
('30000000-0000-0000-0000-000000000024', 'AR', 'خنيفرة', 'بني ملال خنيفرة'),

-- Al Hoceima
('30000000-0000-0000-0000-000000000025', 'FR', 'Al Hoceïma', 'Tanger-Tétouan-Al Hoceïma'),
('30000000-0000-0000-0000-000000000025', 'EN', 'Al Hoceima', 'Tangier-Tetouan-Al Hoceima'),
('30000000-0000-0000-0000-000000000025', 'AR', 'الحسيمة', 'طنجة تطوان الحسيمة'),

-- Chefchaouen
('30000000-0000-0000-0000-000000000026', 'FR', 'Chefchaouen', 'Tanger-Tétouan-Al Hoceïma'),
('30000000-0000-0000-0000-000000000026', 'EN', 'Chefchaouen', 'Tangier-Tetouan-Al Hoceima'),
('30000000-0000-0000-0000-000000000026', 'AR', 'شفشاون', 'طنجة تطوان الحسيمة'),

-- Errachidia
('30000000-0000-0000-0000-000000000027', 'FR', 'Errachidia', 'Drâa-Tafilalet'),
('30000000-0000-0000-0000-000000000027', 'EN', 'Errachidia', 'Draa-Tafilalet'),
('30000000-0000-0000-0000-000000000027', 'AR', 'الرشيدية', 'درعة تافيلالت'),

-- Zagora
('30000000-0000-0000-0000-000000000028', 'FR', 'Zagora', 'Drâa-Tafilalet'),
('30000000-0000-0000-0000-000000000028', 'EN', 'Zagora', 'Draa-Tafilalet'),
('30000000-0000-0000-0000-000000000028', 'AR', 'زاكورة', 'درعة تافيلالت'),

-- Tan-Tan
('30000000-0000-0000-0000-000000000029', 'FR', 'Tan-Tan', 'Guelmim-Oued Noun'),
('30000000-0000-0000-0000-000000000029', 'EN', 'Tan-Tan', 'Guelmim-Oued Noun'),
('30000000-0000-0000-0000-000000000029', 'AR', 'طانطان', 'كلميم واد نون'),

-- Boujdour
('30000000-0000-0000-0000-000000000030', 'FR', 'Boujdour', 'Laâyoune-Sakia El Hamra'),
('30000000-0000-0000-0000-000000000030', 'EN', 'Boujdour', 'Laayoune-Sakia El Hamra'),
('30000000-0000-0000-0000-000000000030', 'AR', 'بوجدور', 'العيون الساقية الحمراء'),

 ('30000000-0000-0000-0000-000000000031', 'FR', 'Drarga', 'Souss-Massa'),
  ('30000000-0000-0000-0000-000000000031', 'EN', 'Drarga', 'Souss-Massa'),
  ('30000000-0000-0000-0000-000000000031', 'AR', 'دراركة', 'سوس ماسة')
ON CONFLICT (city_id, locale) DO NOTHING;

-- ---- seed: field_translations ----
INSERT INTO field_translations (field_id, locale, name) VALUES
  ('91000000-0000-0000-0000-000000000001', 'EN', 'Regional exam note'),
  ('91000000-0000-0000-0000-000000000001', 'FR', 'Note régionale'),
  ('91000000-0000-0000-0000-000000000001', 'AR', 'نقطة الامتحان الجهوي'),

  ('91000000-0000-0000-0000-000000000002', 'EN', 'National exam note'),
  ('91000000-0000-0000-0000-000000000002', 'FR', 'Note nationale'),
  ('91000000-0000-0000-0000-000000000002', 'AR', 'نقطة الامتحان الوطني'),

  ('91000000-0000-0000-0000-000000000003', 'EN', 'Continuous assessment note'),
  ('91000000-0000-0000-0000-000000000003', 'FR', 'Note de contrôle continu'),
  ('91000000-0000-0000-0000-000000000003', 'AR', 'نقطة المراقبة المستمرة'),

  ('91000000-0000-0000-0000-000000000004', 'EN', 'Class rank'),
  ('91000000-0000-0000-0000-000000000004', 'FR', 'Classement'),
  ('91000000-0000-0000-0000-000000000004', 'AR', 'الترتيب')
ON CONFLICT (field_id, locale) DO NOTHING;

-- ---- seed: diploma_translations ----
INSERT INTO diploma_translations (diploma_id, locale, name)
SELECT id, 'FR'::locale_type, 'Baccalauréat Sciences Mathématiques A' FROM diplomas WHERE code = 'BAC_SC_MATH_A' UNION ALL
SELECT id, 'EN'::locale_type, 'Baccalaureate Mathematics A' FROM diplomas WHERE code = 'BAC_SC_MATH_A' UNION ALL
SELECT id, 'AR'::locale_type, 'بكالوريا علوم رياضية أ' FROM diplomas WHERE code = 'BAC_SC_MATH_A' UNION ALL

SELECT id, 'FR'::locale_type, 'Baccalauréat Sciences Mathématiques B' FROM diplomas WHERE code = 'BAC_SC_MATH_B' UNION ALL
SELECT id, 'EN'::locale_type, 'Baccalaureate Mathematics B' FROM diplomas WHERE code = 'BAC_SC_MATH_B' UNION ALL
SELECT id, 'AR'::locale_type, 'بكالوريا علوم رياضية ب' FROM diplomas WHERE code = 'BAC_SC_MATH_B' UNION ALL

SELECT id, 'FR'::locale_type, 'Baccalauréat Sciences Physiques' FROM diplomas WHERE code = 'BAC_SC_PHY' UNION ALL
SELECT id, 'EN'::locale_type, 'Baccalaureate Physical Sciences' FROM diplomas WHERE code = 'BAC_SC_PHY' UNION ALL
SELECT id, 'AR'::locale_type, 'بكالوريا علوم فيزيائية' FROM diplomas WHERE code = 'BAC_SC_PHY' UNION ALL

SELECT id, 'FR'::locale_type, 'Baccalauréat Sciences de la Vie et de la Terre' FROM diplomas WHERE code = 'BAC_SVT' UNION ALL
SELECT id, 'EN'::locale_type, 'Baccalaureate Life and Earth Sciences' FROM diplomas WHERE code = 'BAC_SVT' UNION ALL
SELECT id, 'AR'::locale_type, 'بكالوريا علوم الحياة والأرض' FROM diplomas WHERE code = 'BAC_SVT' UNION ALL

SELECT id, 'FR'::locale_type, 'Baccalauréat Sciences Économiques' FROM diplomas WHERE code = 'BAC_SC_ECO' UNION ALL
SELECT id, 'EN'::locale_type, 'Baccalaureate Economic Sciences' FROM diplomas WHERE code = 'BAC_SC_ECO' UNION ALL
SELECT id, 'AR'::locale_type, 'بكالوريا علوم اقتصادية' FROM diplomas WHERE code = 'BAC_SC_ECO' UNION ALL

SELECT id, 'FR'::locale_type, 'Baccalauréat Techniques de Gestion et Comptabilité' FROM diplomas WHERE code = 'BAC_TGC' UNION ALL
SELECT id, 'EN'::locale_type, 'Baccalaureate Management and Accounting Techniques' FROM diplomas WHERE code = 'BAC_TGC' UNION ALL
SELECT id, 'AR'::locale_type, 'بكالوريا تقنيات التسيير والمحاسبة' FROM diplomas WHERE code = 'BAC_TGC' UNION ALL

SELECT id, 'FR'::locale_type, 'Baccalauréat Sciences et Technologies Électriques' FROM diplomas WHERE code = 'BAC_STE' UNION ALL
SELECT id, 'EN'::locale_type, 'Baccalaureate Electrical Sciences and Technologies' FROM diplomas WHERE code = 'BAC_STE' UNION ALL
SELECT id, 'AR'::locale_type, 'بكالوريا علوم وتقنيات الكهرباء' FROM diplomas WHERE code = 'BAC_STE' UNION ALL

SELECT id, 'FR'::locale_type, 'Baccalauréat Sciences et Technologies Mécaniques' FROM diplomas WHERE code = 'BAC_STM' UNION ALL
SELECT id, 'EN'::locale_type, 'Baccalaureate Mechanical Sciences and Technologies' FROM diplomas WHERE code = 'BAC_STM' UNION ALL
SELECT id, 'AR'::locale_type, 'بكالوريا علوم وتقنيات الميكانيك' FROM diplomas WHERE code = 'BAC_STM' UNION ALL

SELECT id, 'FR'::locale_type, 'Baccalauréat Lettres' FROM diplomas WHERE code = 'BAC_LETTRES' UNION ALL
SELECT id, 'EN'::locale_type, 'Baccalaureate Literature' FROM diplomas WHERE code = 'BAC_LETTRES' UNION ALL
SELECT id, 'AR'::locale_type, 'بكالوريا آداب' FROM diplomas WHERE code = 'BAC_LETTRES' UNION ALL

SELECT id, 'FR'::locale_type, 'Baccalauréat Sciences Humaines' FROM diplomas WHERE code = 'BAC_SC_HUMAINES' UNION ALL
SELECT id, 'EN'::locale_type, 'Baccalaureate Humanities' FROM diplomas WHERE code = 'BAC_SC_HUMAINES' UNION ALL
SELECT id, 'AR'::locale_type, 'بكالوريا علوم إنسانية' FROM diplomas WHERE code = 'BAC_SC_HUMAINES' UNION ALL

SELECT id, 'FR'::locale_type, 'Baccalauréat Sciences Agronomiques' FROM diplomas WHERE code = 'BAC_AGRO' UNION ALL
SELECT id, 'EN'::locale_type, 'Baccalaureate Agronomic Sciences' FROM diplomas WHERE code = 'BAC_AGRO' UNION ALL
SELECT id, 'AR'::locale_type, 'بكالوريا علوم فلاحية' FROM diplomas WHERE code = 'BAC_AGRO' UNION ALL

SELECT id, 'FR'::locale_type, 'Baccalauréat Arts Appliqués' FROM diplomas WHERE code = 'BAC_ARTS' UNION ALL
SELECT id, 'EN'::locale_type, 'Baccalaureate Applied Arts' FROM diplomas WHERE code = 'BAC_ARTS' UNION ALL
SELECT id, 'AR'::locale_type, 'بكالوريا فنون تطبيقية' FROM diplomas WHERE code = 'BAC_ARTS' UNION ALL

SELECT id, 'FR'::locale_type, 'Baccalauréat Professionnel' FROM diplomas WHERE code = 'BAC_PRO' UNION ALL
SELECT id, 'EN'::locale_type, 'Professional Baccalaureate' FROM diplomas WHERE code = 'BAC_PRO' UNION ALL
SELECT id, 'AR'::locale_type, 'بكالوريا مهنية' FROM diplomas WHERE code = 'BAC_PRO' UNION ALL

SELECT id, 'FR'::locale_type, 'Bac Libre Sciences Mathématiques' FROM diplomas WHERE code = 'BAC_LIBRE_SC_MATH' UNION ALL
SELECT id, 'EN'::locale_type, 'Free Baccalaureate Mathematics' FROM diplomas WHERE code = 'BAC_LIBRE_SC_MATH' UNION ALL
SELECT id, 'AR'::locale_type, 'بكالوريا حرة علوم رياضية' FROM diplomas WHERE code = 'BAC_LIBRE_SC_MATH' UNION ALL

SELECT id, 'FR'::locale_type, 'Bac Libre Sciences Physiques' FROM diplomas WHERE code = 'BAC_LIBRE_SC_PHY' UNION ALL
SELECT id, 'EN'::locale_type, 'Free Baccalaureate Physical Sciences' FROM diplomas WHERE code = 'BAC_LIBRE_SC_PHY' UNION ALL
SELECT id, 'AR'::locale_type, 'بكالوريا حرة علوم فيزيائية' FROM diplomas WHERE code = 'BAC_LIBRE_SC_PHY' UNION ALL

SELECT id, 'FR'::locale_type, 'Bac Libre Sciences de la Vie et de la Terre' FROM diplomas WHERE code = 'BAC_LIBRE_SVT' UNION ALL
SELECT id, 'EN'::locale_type, 'Free Baccalaureate Life and Earth Sciences' FROM diplomas WHERE code = 'BAC_LIBRE_SVT' UNION ALL
SELECT id, 'AR'::locale_type, 'بكالوريا حرة علوم الحياة والأرض' FROM diplomas WHERE code = 'BAC_LIBRE_SVT' UNION ALL

SELECT id, 'FR'::locale_type, 'Bac Libre Sciences Économiques' FROM diplomas WHERE code = 'BAC_LIBRE_SC_ECO' UNION ALL
SELECT id, 'EN'::locale_type, 'Free Baccalaureate Economic Sciences' FROM diplomas WHERE code = 'BAC_LIBRE_SC_ECO' UNION ALL
SELECT id, 'AR'::locale_type, 'بكالوريا حرة علوم اقتصادية' FROM diplomas WHERE code = 'BAC_LIBRE_SC_ECO' UNION ALL

SELECT id, 'FR'::locale_type, 'Bac Libre Lettres' FROM diplomas WHERE code = 'BAC_LIBRE_LETTRES' UNION ALL
SELECT id, 'EN'::locale_type, 'Free Baccalaureate Literature' FROM diplomas WHERE code = 'BAC_LIBRE_LETTRES' UNION ALL
SELECT id, 'AR'::locale_type, 'بكالوريا حرة آداب' FROM diplomas WHERE code = 'BAC_LIBRE_LETTRES' UNION ALL

SELECT id, 'FR'::locale_type, 'Bac Libre Sciences Humaines' FROM diplomas WHERE code = 'BAC_LIBRE_SC_HUMAINES' UNION ALL
SELECT id, 'EN'::locale_type, 'Free Baccalaureate Humanities' FROM diplomas WHERE code = 'BAC_LIBRE_SC_HUMAINES' UNION ALL
SELECT id, 'AR'::locale_type, 'بكالوريا حرة علوم إنسانية' FROM diplomas WHERE code = 'BAC_LIBRE_SC_HUMAINES' UNION ALL

SELECT id, 'FR'::locale_type, 'DEUG Sciences de la Matière Physique (SMP)' FROM diplomas WHERE code = 'DEUG_SMP' UNION ALL
SELECT id, 'EN'::locale_type, 'DEUG Physical Matter Sciences (SMP)' FROM diplomas WHERE code = 'DEUG_SMP' UNION ALL
SELECT id, 'AR'::locale_type, 'DEUG علوم المادة الفيزيائية' FROM diplomas WHERE code = 'DEUG_SMP' UNION ALL

SELECT id, 'FR'::locale_type, 'DEUG Sciences de la Matière Chimie (SMC)' FROM diplomas WHERE code = 'DEUG_SMC' UNION ALL
SELECT id, 'EN'::locale_type, 'DEUG Chemistry Matter Sciences (SMC)' FROM diplomas WHERE code = 'DEUG_SMC' UNION ALL
SELECT id, 'AR'::locale_type, 'DEUG علوم المادة الكيمياء' FROM diplomas WHERE code = 'DEUG_SMC' UNION ALL

SELECT id, 'FR'::locale_type, 'DEUG Sciences Mathématiques et Applications (SMA)' FROM diplomas WHERE code = 'DEUG_SMA' UNION ALL
SELECT id, 'EN'::locale_type, 'DEUG Mathematics and Applications (SMA)' FROM diplomas WHERE code = 'DEUG_SMA' UNION ALL
SELECT id, 'AR'::locale_type, 'DEUG علوم الرياضيات والتطبيقات' FROM diplomas WHERE code = 'DEUG_SMA' UNION ALL

SELECT id, 'FR'::locale_type, 'DEUG Sciences Mathématiques et Informatique (SMI)' FROM diplomas WHERE code = 'DEUG_SMI' UNION ALL
SELECT id, 'EN'::locale_type, 'DEUG Mathematics and Computer Science (SMI)' FROM diplomas WHERE code = 'DEUG_SMI' UNION ALL
SELECT id, 'AR'::locale_type, 'DEUG علوم الرياضيات والمعلوماتية' FROM diplomas WHERE code = 'DEUG_SMI' UNION ALL

SELECT id, 'FR'::locale_type, 'DEUG Sciences de la Vie et de la Terre (SVI/STU)' FROM diplomas WHERE code = 'DEUG_SVI' UNION ALL
SELECT id, 'EN'::locale_type, 'DEUG Life and Earth Sciences (SVI/STU)' FROM diplomas WHERE code = 'DEUG_SVI' UNION ALL
SELECT id, 'AR'::locale_type, 'DEUG علوم الحياة والأرض' FROM diplomas WHERE code = 'DEUG_SVI' UNION ALL

SELECT id, 'FR'::locale_type, 'DEUG Économie et Gestion' FROM diplomas WHERE code = 'DEUG_ECO' UNION ALL
SELECT id, 'EN'::locale_type, 'DEUG Economics and Management' FROM diplomas WHERE code = 'DEUG_ECO' UNION ALL
SELECT id, 'AR'::locale_type, 'DEUG الاقتصاد والتسيير' FROM diplomas WHERE code = 'DEUG_ECO' UNION ALL

SELECT id, 'FR'::locale_type, 'DEUG Droit en Français' FROM diplomas WHERE code = 'DEUG_DROIT_FR' UNION ALL
SELECT id, 'EN'::locale_type, 'DEUG Law (French)' FROM diplomas WHERE code = 'DEUG_DROIT_FR' UNION ALL
SELECT id, 'AR'::locale_type, 'DEUG القانون بالفرنسية' FROM diplomas WHERE code = 'DEUG_DROIT_FR' UNION ALL

SELECT id, 'FR'::locale_type, 'DEUG Droit en Arabe' FROM diplomas WHERE code = 'DEUG_DROIT_AR' UNION ALL
SELECT id, 'EN'::locale_type, 'DEUG Law (Arabic)' FROM diplomas WHERE code = 'DEUG_DROIT_AR' UNION ALL
SELECT id, 'AR'::locale_type, 'DEUG القانون بالعربية' FROM diplomas WHERE code = 'DEUG_DROIT_AR' UNION ALL

SELECT id, 'FR'::locale_type, 'DEUST Mathématiques, Informatique, Physique' FROM diplomas WHERE code = 'DEUST_MIP' UNION ALL
SELECT id, 'EN'::locale_type, 'DEUST Mathematics, Computer Science, Physics' FROM diplomas WHERE code = 'DEUST_MIP' UNION ALL
SELECT id, 'AR'::locale_type, 'DEUST الرياضيات، المعلوماتية، الفيزياء' FROM diplomas WHERE code = 'DEUST_MIP' UNION ALL

SELECT id, 'FR'::locale_type, 'DEUST Mathématiques, Informatique, Physique, Chimie' FROM diplomas WHERE code = 'DEUST_MIPC' UNION ALL
SELECT id, 'EN'::locale_type, 'DEUST Mathematics, Computer Science, Physics, Chemistry' FROM diplomas WHERE code = 'DEUST_MIPC' UNION ALL
SELECT id, 'AR'::locale_type, 'DEUST الرياضيات، المعلوماتية، الفيزياء، الكيمياء' FROM diplomas WHERE code = 'DEUST_MIPC' UNION ALL

SELECT id, 'FR'::locale_type, 'DEUST Biologie, Chimie, Géologie' FROM diplomas WHERE code = 'DEUST_BCG' UNION ALL
SELECT id, 'EN'::locale_type, 'DEUST Biology, Chemistry, Geology' FROM diplomas WHERE code = 'DEUST_BCG' UNION ALL
SELECT id, 'AR'::locale_type, 'DEUST البيولوجيا، الكيمياء، الجيولوجيا' FROM diplomas WHERE code = 'DEUST_BCG' UNION ALL

SELECT id, 'FR'::locale_type, 'DEUST Génie Électrique et Génie Mécanique' FROM diplomas WHERE code = 'DEUST_GEGM' UNION ALL
SELECT id, 'EN'::locale_type, 'DEUST Electrical Engineering and Mechanical Engineering' FROM diplomas WHERE code = 'DEUST_GEGM' UNION ALL
SELECT id, 'AR'::locale_type, 'DEUST الهندسة الكهربائية والهندسة الميكانيكية' FROM diplomas WHERE code = 'DEUST_GEGM' UNION ALL

SELECT id, 'FR'::locale_type, 'DUT Informatique' FROM diplomas WHERE code = 'DUT_INFO' UNION ALL
SELECT id, 'EN'::locale_type, 'DUT Computer Science' FROM diplomas WHERE code = 'DUT_INFO' UNION ALL
SELECT id, 'AR'::locale_type, 'DUT المعلوماتية' FROM diplomas WHERE code = 'DUT_INFO' UNION ALL

SELECT id, 'FR'::locale_type, 'DUT Gestion des Entreprises' FROM diplomas WHERE code = 'DUT_GE' UNION ALL
SELECT id, 'EN'::locale_type, 'DUT Business Management' FROM diplomas WHERE code = 'DUT_GE' UNION ALL
SELECT id, 'AR'::locale_type, 'DUT تسيير المقاولات' FROM diplomas WHERE code = 'DUT_GE' UNION ALL

SELECT id, 'FR'::locale_type, 'DUT Techniques de Management' FROM diplomas WHERE code = 'DUT_TM' UNION ALL
SELECT id, 'EN'::locale_type, 'DUT Management Techniques' FROM diplomas WHERE code = 'DUT_TM' UNION ALL
SELECT id, 'AR'::locale_type, 'DUT تقنيات التسيير' FROM diplomas WHERE code = 'DUT_TM' UNION ALL

SELECT id, 'FR'::locale_type, 'DUT Génie Électrique et Informatique Industrielle' FROM diplomas WHERE code = 'DUT_GEII' UNION ALL
SELECT id, 'EN'::locale_type, 'DUT Electrical Engineering and Industrial IT' FROM diplomas WHERE code = 'DUT_GEII' UNION ALL
SELECT id, 'AR'::locale_type, 'DUT الهندسة الكهربائية والمعلوماتية الصناعية' FROM diplomas WHERE code = 'DUT_GEII' UNION ALL

SELECT id, 'FR'::locale_type, 'DUT Génie Mécanique et Productique' FROM diplomas WHERE code = 'DUT_GMP' UNION ALL
SELECT id, 'EN'::locale_type, 'DUT Mechanical Engineering and Production' FROM diplomas WHERE code = 'DUT_GMP' UNION ALL
SELECT id, 'AR'::locale_type, 'DUT الهندسة الميكانيكية والإنتاجية' FROM diplomas WHERE code = 'DUT_GMP' UNION ALL

SELECT id, 'FR'::locale_type, 'BTS Développement des Systèmes d''Information' FROM diplomas WHERE code = 'BTS_DSI' UNION ALL
SELECT id, 'EN'::locale_type, 'BTS Information Systems Development' FROM diplomas WHERE code = 'BTS_DSI' UNION ALL
SELECT id, 'AR'::locale_type, 'BTS تطوير أنظمة المعلومات' FROM diplomas WHERE code = 'BTS_DSI' UNION ALL

SELECT id, 'FR'::locale_type, 'BTS Comptabilité et Gestion' FROM diplomas WHERE code = 'BTS_CG' UNION ALL
SELECT id, 'EN'::locale_type, 'BTS Accounting and Management' FROM diplomas WHERE code = 'BTS_CG' UNION ALL
SELECT id, 'AR'::locale_type, 'BTS المحاسبة والتسيير' FROM diplomas WHERE code = 'BTS_CG' UNION ALL

SELECT id, 'FR'::locale_type, 'BTS Management Commercial Opérationnel' FROM diplomas WHERE code = 'BTS_MCO' UNION ALL
SELECT id, 'EN'::locale_type, 'BTS Operational Commercial Management' FROM diplomas WHERE code = 'BTS_MCO' UNION ALL
SELECT id, 'AR'::locale_type, 'BTS التسيير التجاري العملياتي' FROM diplomas WHERE code = 'BTS_MCO' UNION ALL

SELECT id, 'FR'::locale_type, 'BTS Systèmes Électroniques' FROM diplomas WHERE code = 'BTS_SE' UNION ALL
SELECT id, 'EN'::locale_type, 'BTS Electronic Systems' FROM diplomas WHERE code = 'BTS_SE' UNION ALL
SELECT id, 'AR'::locale_type, 'BTS الأنظمة الإلكترونية' FROM diplomas WHERE code = 'BTS_SE' UNION ALL

SELECT id, 'FR'::locale_type, 'Licence Fondamentale' FROM diplomas WHERE code = 'LICENCE_FONDAMENTALE' UNION ALL
SELECT id, 'EN'::locale_type, 'Fundamental Bachelor''s Degree' FROM diplomas WHERE code = 'LICENCE_FONDAMENTALE' UNION ALL
SELECT id, 'AR'::locale_type, 'إجازة أساسية' FROM diplomas WHERE code = 'LICENCE_FONDAMENTALE' UNION ALL

SELECT id, 'FR'::locale_type, 'Licence Professionnelle' FROM diplomas WHERE code = 'LICENCE_PRO' UNION ALL
SELECT id, 'EN'::locale_type, 'Professional Bachelor''s Degree' FROM diplomas WHERE code = 'LICENCE_PRO' UNION ALL
SELECT id, 'AR'::locale_type, 'إجازة مهنية' FROM diplomas WHERE code = 'LICENCE_PRO' UNION ALL

SELECT id, 'FR'::locale_type, 'Licence en Éducation' FROM diplomas WHERE code = 'LICENCE_EDUCATION' UNION ALL
SELECT id, 'EN'::locale_type, 'Bachelor''s Degree in Education' FROM diplomas WHERE code = 'LICENCE_EDUCATION' UNION ALL
SELECT id, 'AR'::locale_type, 'إجازة في التربية' FROM diplomas WHERE code = 'LICENCE_EDUCATION' UNION ALL

SELECT id, 'FR'::locale_type, 'Master Fondamental / Recherche' FROM diplomas WHERE code = 'MASTER_RECHERCHE' UNION ALL
SELECT id, 'EN'::locale_type, 'Research Master''s Degree' FROM diplomas WHERE code = 'MASTER_RECHERCHE' UNION ALL
SELECT id, 'AR'::locale_type, 'ماستر بحث' FROM diplomas WHERE code = 'MASTER_RECHERCHE' UNION ALL

SELECT id, 'FR'::locale_type, 'Master Spécialisé' FROM diplomas WHERE code = 'MASTER_SPECIALISE' UNION ALL
SELECT id, 'EN'::locale_type, 'Specialized Master''s Degree' FROM diplomas WHERE code = 'MASTER_SPECIALISE' UNION ALL
SELECT id, 'AR'::locale_type, 'ماستر متخصص' FROM diplomas WHERE code = 'MASTER_SPECIALISE' UNION ALL

SELECT id, 'FR'::locale_type, 'Diplôme d''Ingénieur d''État' FROM diplomas WHERE code = 'INGENIEUR_ETAT' UNION ALL
SELECT id, 'EN'::locale_type, 'State Engineering Degree' FROM diplomas WHERE code = 'INGENIEUR_ETAT' UNION ALL
SELECT id, 'AR'::locale_type, 'مهندس دولة' FROM diplomas WHERE code = 'INGENIEUR_ETAT' UNION ALL

SELECT id, 'FR'::locale_type, 'Diplôme de l''ENCG' FROM diplomas WHERE code = 'DENCG' UNION ALL
SELECT id, 'EN'::locale_type, 'ENCG Diploma' FROM diplomas WHERE code = 'DENCG' UNION ALL
SELECT id, 'AR'::locale_type, 'شهادة ENCG' FROM diplomas WHERE code = 'DENCG' UNION ALL

SELECT id, 'FR'::locale_type, 'Doctorat (PhD)' FROM diplomas WHERE code = 'DOCTORAT' UNION ALL
SELECT id, 'EN'::locale_type, 'Doctorate (PhD)' FROM diplomas WHERE code = 'DOCTORAT' UNION ALL
SELECT id, 'AR'::locale_type, 'دكتوراه' FROM diplomas WHERE code = 'DOCTORAT' UNION ALL

SELECT id, 'FR'::locale_type, 'Doctorat en Médecine' FROM diplomas WHERE code = 'DOCTORAT_MEDECINE' UNION ALL
SELECT id, 'EN'::locale_type, 'Doctor of Medicine' FROM diplomas WHERE code = 'DOCTORAT_MEDECINE' UNION ALL
SELECT id, 'AR'::locale_type, 'دكتوراه في الطب' FROM diplomas WHERE code = 'DOCTORAT_MEDECINE' UNION ALL

SELECT id, 'FR'::locale_type, 'Doctorat en Pharmacie' FROM diplomas WHERE code = 'DOCTORAT_PHARMACIE' UNION ALL
SELECT id, 'EN'::locale_type, 'Doctor of Pharmacy' FROM diplomas WHERE code = 'DOCTORAT_PHARMACIE' UNION ALL
SELECT id, 'AR'::locale_type, 'دكتوراه في الصيدلة' FROM diplomas WHERE code = 'DOCTORAT_PHARMACIE' UNION ALL

SELECT id, 'FR'::locale_type, 'Doctorat en Médecine Dentaire' FROM diplomas WHERE code = 'DOCTORAT_MEDECINE_DENTAIRE' UNION ALL
SELECT id, 'EN'::locale_type, 'Doctor of Dental Medicine' FROM diplomas WHERE code = 'DOCTORAT_MEDECINE_DENTAIRE' UNION ALL
SELECT id, 'AR'::locale_type, 'دكتوراه في طب الأسنان' FROM diplomas WHERE code = 'DOCTORAT_MEDECINE_DENTAIRE'
ON CONFLICT (diploma_id, locale) DO NOTHING;
-- ---- seed: diploma_fields ----
INSERT INTO diploma_fields (diploma_id, field_id)
SELECT d.id, f.id
FROM diplomas d
CROSS JOIN (
  VALUES
    ('91000000-0000-0000-0000-000000000001'::uuid),
    ('91000000-0000-0000-0000-000000000002'::uuid),
    ('91000000-0000-0000-0000-000000000003'::uuid)
) AS f(id)
WHERE d.diploma_group = 'BAC'
ON CONFLICT (diploma_id, field_id) DO NOTHING;

INSERT INTO diploma_fields (diploma_id, field_id)
SELECT d.id, '91000000-0000-0000-0000-000000000004'::uuid
FROM diplomas d
WHERE d.diploma_group = 'DOCTORAT'
ON CONFLICT (diploma_id, field_id) DO NOTHING;
-- ---- seed: university_translations ----
INSERT INTO university_translations (university_id, locale, name, description) VALUES
  ('40000000-0000-0000-0000-000000000001', 'FR', 'École Nationale des Sciences Appliquées', 'Grande école publique d''ingénierie.'),
  ('40000000-0000-0000-0000-000000000001', 'EN', 'National School of Applied Sciences', 'Public engineering graduate school.'),
  ('40000000-0000-0000-0000-000000000001', 'AR', 'المدرسة الوطنية للعلوم التطبيقية', 'مدرسة عمومية للهندسة.'),

  ('40000000-0000-0000-0000-000000000002', 'FR', 'Université Internationale de Rabat', 'Université privée pluridisciplinaire.'),
  ('40000000-0000-0000-0000-000000000002', 'EN', 'International University of Rabat', 'Private multidisciplinary university.'),
  ('40000000-0000-0000-0000-000000000002', 'AR', 'الجامعة الدولية بالرباط', 'جامعة خاصة متعددة التخصصات.'),

  ('40000000-0000-0000-0000-000000000003', 'FR', 'Université Mohammed VI Polytechnique', 'Université semi-publique orientée recherche.'),
  ('40000000-0000-0000-0000-000000000003', 'EN', 'Mohammed VI Polytechnic University', 'Semi-public research-oriented university.'),
  ('40000000-0000-0000-0000-000000000003', 'AR', 'جامعة محمد السادس متعددة التقنيات', 'جامعة شبه عمومية موجهة نحو البحث.')
ON CONFLICT (university_id, locale) DO NOTHING;

-- ---- seed: university_locations ----
INSERT INTO university_locations (id, university_id, city_id, address, website, longitude, latitude, image_url) VALUES
  ('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Km 7, Route El Jadida, Casablanca', 'https://ensam-casablanca.ma', -7.650000, 33.550000, 'https://example.com/img/ensa-casa.jpg'),
  ('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'Technopolis, Rabat-Shore', 'https://uir.ac.ma', -6.860000, 34.010000, 'https://example.com/img/uir.jpg'),
  ('50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', 'Lot 660, Hay Moulay Rachid, Ben Guerir', 'https://um6p.ma', -7.950000, 32.230000, 'https://example.com/img/um6p.jpg')
ON CONFLICT (id) DO NOTHING;

-- ---- seed: user_interested_categories ----
INSERT INTO user_interested_categories (user_id, category_id) VALUES
  ('70000000-0000-0000-0000-000000000001', (SELECT id FROM categories WHERE name = 'SCIENCE_TECHNOLOGY_ENGINEERING')),
  ('70000000-0000-0000-0000-000000000002', (SELECT id FROM categories WHERE name = 'EDUCATION_TEACHING')),
  ('70000000-0000-0000-0000-000000000003', (SELECT id FROM categories WHERE name = 'MEDICAL_PARAMEDICAL')),
  ('70000000-0000-0000-0000-000000000003', (SELECT id FROM categories WHERE name = 'SCIENCE_TECHNOLOGY_ENGINEERING'))
ON CONFLICT (user_id, category_id) DO NOTHING;
-- ---- seed: favoris ----
INSERT INTO favoris (user_id, university_id) VALUES
  ('70000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001'),
  ('70000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002'),
  ('70000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003'),
  ('70000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000001')
ON CONFLICT (user_id, university_id) DO NOTHING;

-- ---- seed: programs ----
INSERT INTO programs (
  id,
  university_id,
  category_id,
  output_diploma_id,
  title,
  years_of_study,
  monthly_subscription,
  max_age,
  has_concours,
  diploma_recognition_abroad_status,
  diploma_recognition_morocco_status,
  is_approved
) VALUES
(
  '60000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000001',
  (SELECT id FROM categories WHERE name = 'SCIENCE_TECHNOLOGY_ENGINEERING'),
  (SELECT id FROM diplomas WHERE code = 'INGENIEUR_ETAT'),
  'Computer Engineering',
  5,
  0,
  22,
  true,
  'RECOGNIZED',
  'RECOGNIZED',
  true
),
(
  '60000000-0000-0000-0000-000000000002',
  '40000000-0000-0000-0000-000000000002',
  (SELECT id FROM categories WHERE name = 'ECONOMICS_TRADE_MANAGEMENT'),
  (SELECT id FROM diplomas WHERE code = 'MASTER_RECHERCHE'),
  'Finance and Markets',
  2,
  3500.00,
  NULL,
  false,
  'RECOGNIZED',
  'RECOGNIZED',
  true
),
(
  '60000000-0000-0000-0000-000000000003',
  '40000000-0000-0000-0000-000000000003',
  (SELECT id FROM categories WHERE name = 'SCIENCE_TECHNOLOGY_ENGINEERING'),
  (SELECT id FROM diplomas WHERE code = 'DOCTORAT'),
  'Life Sciences',
  3,
  0,
  NULL,
  true,
  'RECOGNIZED',
  'RECOGNIZED',
  true
)
ON CONFLICT (id) DO NOTHING;
-- ---- seed: notifications ----
INSERT INTO notifications (receiver_id, sender_id, category, title, message, action_url)
VALUES
  ('70000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000002', 'USER_REPORT_ISSUE', 'User report issue', 'Salma has reported an issue concerning ENSA Casablanca.', '/admin/issue/40000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;
-- ---- seed: program_translations ----
INSERT INTO program_translations (program_id, locale, name) VALUES
  (
    '60000000-0000-0000-0000-000000000001',
    'FR',
    'Cycle Ingénieur Génie Informatique'
  ),
  (
    '60000000-0000-0000-0000-000000000001',
    'EN',
    'Computer Engineering Program'
  ),
  (
    '60000000-0000-0000-0000-000000000001',
    'AR',
    'شعبة هندسة المعلوميات'
  ),

  (
    '60000000-0000-0000-0000-000000000002',
    'FR',
    'Master en Finance et Marchés'
  ),
  (
    '60000000-0000-0000-0000-000000000002',
    'EN',
    'Master in Finance and Markets'
  ),
  (
    '60000000-0000-0000-0000-000000000002',
    'AR',
    'ماستر في المالية والأسواق'
  ),

  (
    '60000000-0000-0000-0000-000000000003',
    'FR',
    'Doctorat en Sciences de la Vie'
  ),
  (
    '60000000-0000-0000-0000-000000000003',
    'EN',
    'PhD in Life Sciences'
  ),
  (
    '60000000-0000-0000-0000-000000000003',
    'AR',
    'دكتوراه في علوم الحياة'
  )
ON CONFLICT (program_id, locale) DO NOTHING;
-- ---- seed: program_job_titles ----
INSERT INTO program_job_titles ( program_id, job_title_id ) VALUES
  (
    '60000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001'
  ),
  (
    '60000000-0000-0000-0000-000000000002',
    'a1000000-0000-0000-0000-000000000002'
  ),
  (
    '60000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000003'
  )
ON CONFLICT (program_id, job_title_id) DO NOTHING;
-- ---- seed: program_requirements ----
INSERT INTO program_requirements (
  program_id,
  required_diploma_id,
  min_grade,
  max_years_since_graduation,
  requirement_group
) VALUES
  (
    '60000000-0000-0000-0000-000000000001',
    (SELECT id FROM diplomas WHERE code = 'BAC_SC_MATH_A'),
    14.00,
    2,
    1
  ),
  (
    '60000000-0000-0000-0000-000000000002',
    (SELECT id FROM diplomas WHERE code = 'LICENCE_FONDAMENTALE'),
    12.00,
    NULL,
    1
  ),
  (
    '60000000-0000-0000-0000-000000000003',
    (SELECT id FROM diplomas WHERE code = 'MASTER_RECHERCHE'),
    15.00,
    NULL,
    1
  )
ON CONFLICT (program_id, required_diploma_id) DO NOTHING;
-- ---- seed: user_diplomas ----
INSERT INTO user_diplomas (id, user_id, diploma_id, general_grade, obtained_year) VALUES
  ('a0000001-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000004', (SELECT id FROM diplomas WHERE code = 'BAC_SC_MATH_A'), 18.00, 2015),
  ('a0000002-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', (SELECT id FROM diplomas WHERE code = 'BAC_SC_MATH_A'), 16.50, 2023),
  ('a0000003-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000002', (SELECT id FROM diplomas WHERE code = 'BAC_SC_MATH_A'), 14.20, 2024),
  ('a0000004-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000003', (SELECT id FROM diplomas WHERE code = 'LICENCE_FONDAMENTALE'), 12.80, 2022)
ON CONFLICT (id) DO NOTHING;
-- ---- seed: user_diploma_fields ----
INSERT INTO user_diploma_fields (user_diploma_id, field_id, value) VALUES
  ('a0000001-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000001', 17.50),
  ('a0000001-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000002', 18.00),
  ('a0000001-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000003', 18.50),

  ('a0000002-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000001', 15.80),
  ('a0000002-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000002', 16.20),

  ('a0000003-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000001', 13.90),
  ('a0000003-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000002', 14.10),
  ('a0000003-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000003', 14.50),

  ('a0000004-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000001', 12.50),
  ('a0000004-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000002', 12.90),
  ('a0000004-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000003', 13.00)
ON CONFLICT (user_diploma_id, field_id) DO NOTHING;
