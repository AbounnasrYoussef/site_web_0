-- =============================================================
-- 31_seed_testdb.sql -- extra data merged from uploaded test.db (SQLite)
-- Rows that collide with 02_seed_repo.sql business-unique values
-- (category name, job title, diploma code, university abbreviation,
-- user email) -- and anything referencing them -- are skipped.
-- =============================================================

-- ---- categories (5 rows) ----
INSERT INTO categories (id, created_at, updated_at, name) VALUES
  ('de1fb30b62ba44a196ac28850266746b', '2026-08-13 14:51:48.984939', '2026-08-13 14:51:48.984924', 'Computer Science & Software Engineering'),
  ('0da6e63234834b6288f250f4527f0949', '2026-08-13 14:51:49.001335', '2026-08-13 14:51:49.001322', 'Cybersecurity & Information Assurance'),
  ('1bf40f2d971144e4a9f2e638fcf2459f', '2026-08-13 14:51:49.015977', '2026-08-13 14:51:49.015962', 'Artificial Intelligence & Data Science'),
  ('5754577048ce47bfb824e448c86bc35e', '2026-08-13 14:51:49.030618', '2026-08-13 14:51:49.030605', 'Network & Telecommunications Engineering'),
  ('04466df01d8548d9aa3b53c582c1452e', '2026-08-13 14:51:49.047679', '2026-08-13 14:51:49.047664', 'Business & IT Systems Management')
ON CONFLICT DO NOTHING;

-- ---- job_titles (6 rows) (1 skipped as duplicates) ----
INSERT INTO job_titles (id, created_at, updated_at, title, salary) VALUES
  ('7edd9db4f46c4fe69e56a748bc0d17a9', '2026-08-13 14:51:49.258263', '2026-08-13 14:51:49.258251', 'DevOps & Cloud Engineer', 18000),
  ('e1d91d4d0f0a4f5c83b495b6c4a8433c', '2026-08-13 14:51:49.277079', '2026-08-13 14:51:49.277066', 'Data Scientist & AI Specialist', 19000),
  ('c086972ce11548c59d6900a15f9c0586', '2026-08-13 14:51:49.295647', '2026-08-13 14:51:49.295633', 'AI Researcher (PhD)', 22000),
  ('6e2918f0ebd44fafb1e27a031eb2a51e', '2026-08-13 14:51:49.312779', '2026-08-13 14:51:49.312766', 'Cybersecurity Analyst & Pentester', 20000),
  ('158ebdebef9c47ee8e4ee9bc6d9fd609', '2026-08-13 14:51:49.328000', '2026-08-13 14:51:49.327988', 'Network & Telecom Engineer', 15000),
  ('3c59a91a71eb4a1ca613d428a81bd7cd', '2026-08-13 14:51:49.347837', '2026-08-13 14:51:49.347822', 'IT Project Manager / Scrum Master', 21000)
ON CONFLICT DO NOTHING;

-- ---- diplomas (6 rows) (9 skipped as duplicates) ----
INSERT INTO diplomas (id, created_at, code, diploma_group, rank) VALUES
  ('ed71c0bc8e484ef69e1fa371eeadf36a', '2026-08-13 14:51:49.979443', 'TRONC_COMMUN_SC', 'HIGH_SCHOOL', 10),
  ('a34bcd54e0364680a2366eca4b889e64', '2026-08-13 14:51:50.025434', 'BAC_ECO', 'HIGH_SCHOOL', 12),
  ('c8857b2b1f6541f2b606ee765495819e', '2026-08-13 14:51:50.039026', 'CPGE_MP', 'BAC+2', 14),
  ('7fe1ed96e0f54b9892bdb79a97bf0ff7', '2026-08-13 14:51:50.082435', 'TS_DEV', 'BAC+2', 14),
  ('307ef78a9a634d669137460f5ab21f0b', '2026-08-13 14:51:50.097283', 'TS_RES', 'BAC+2', 14),
  ('ce1ac7769130470b8e30eccea8b1b0e7', '2026-08-13 14:51:50.168547', 'MASTER_MANAGEMENT', 'BAC+5', 17)
ON CONFLICT DO NOTHING;

-- ---- universities (11 rows) (1 skipped as duplicates) ----
INSERT INTO universities (id, created_at, updated_at, type, is_approved, internat_available, bourse_available, abreviation) VALUES
  ('6fc8ebd4d15042bf93cbcd5afbfc9f76', '2026-08-13 14:51:49.388280', '2026-08-13 14:51:49.388267', 'PUBLIC', true, false, false, 'LYCEE'),
  ('004ab937ef6e44fba82dfb46b0ac0df6', '2026-08-13 14:51:49.403783', '2026-08-13 14:51:49.403769', 'PUBLIC', true, false, false, 'CPGE'),
  ('89aac73540224506a2249f4f9fcb6dff', '2026-08-13 14:51:49.421199', '2026-08-13 14:51:49.421185', 'PUBLIC', true, false, false, 'OFPPT'),
  ('22da313497d547f0ba31bbf279013885', '2026-08-13 14:51:49.436378', '2026-08-13 14:51:49.436366', 'PUBLIC', true, false, false, 'FS'),
  ('830edf002dca49279fbee027d019dd51', '2026-08-13 14:51:49.451260', '2026-08-13 14:51:49.451249', 'PUBLIC', true, false, false, 'FST'),
  ('0e1a20f0abc1424e9bd18304f3b90bf3', '2026-08-13 14:51:49.467406', '2026-08-13 14:51:49.467393', 'PUBLIC', true, false, false, 'EST'),
  ('b651384731dd45418cbf517c31e26eb4', '2026-08-13 14:51:49.496175', '2026-08-13 14:51:49.496165', 'PUBLIC', true, false, false, 'ENSIAS'),
  ('f53a646a7bef4a3f99615292f812102a', '2026-08-13 14:51:49.512126', '2026-08-13 14:51:49.512115', 'PUBLIC', true, false, false, 'INPT'),
  ('a71876150d504ede922f6ebcc903c7fc', '2026-08-13 14:51:49.528071', '2026-08-13 14:51:49.528056', 'PUBLIC', true, false, false, 'EMI'),
  ('c24f38f921e3458a84c533470c1072a8', '2026-08-13 14:51:49.542630', '2026-08-13 14:51:49.542617', 'PUBLIC', true, false, false, 'ENCG'),
  ('c7248dc1852541c580752e63688318da', '2026-08-13 14:51:49.556933', '2026-08-13 14:51:49.556921', 'PUBLIC', true, false, false, '1337')
ON CONFLICT DO NOTHING;

-- ---- category_translations (10 rows) ----
INSERT INTO category_translations (id, category_id, locale, name) VALUES
  ('0c9ee8238b214e2992ee99366f366303', 'de1fb30b62ba44a196ac28850266746b', 'FR', 'Informatique et Ingénierie Logicielle'),
  ('1ef48cfda19b4e35a2361b7a1ce32dc9', 'de1fb30b62ba44a196ac28850266746b', 'EN', 'Computer Science & Software Engineering'),
  ('1a9fd670008646c292190e631b8f5e3c', '0da6e63234834b6288f250f4527f0949', 'FR', 'Cybersécurité et Confiance Numérique'),
  ('a881808a06584ba486ea1167de94805f', '0da6e63234834b6288f250f4527f0949', 'EN', 'Cybersecurity & Information Assurance'),
  ('6f297f85661247cb88f9abc400ab1cd9', '1bf40f2d971144e4a9f2e638fcf2459f', 'FR', 'Intelligence Artificielle et Science des Données'),
  ('10749e4e7d864ff1b9d6cd1a6dbe78da', '1bf40f2d971144e4a9f2e638fcf2459f', 'EN', 'Artificial Intelligence & Data Science'),
  ('e830774012aa4452a74a81d94e96b516', '5754577048ce47bfb824e448c86bc35e', 'FR', 'Réseaux et Ingénierie des Télécommunications'),
  ('c55113df1a6c4744a948a23148e029b0', '5754577048ce47bfb824e448c86bc35e', 'EN', 'Network & Telecommunications Engineering'),
  ('93614558fe4e41f28271784efc0f98e8', '04466df01d8548d9aa3b53c582c1452e', 'FR', 'Management IT et Systèmes d''Information'),
  ('2758f7c22d8043ffa172e16b9227eeed', '04466df01d8548d9aa3b53c582c1452e', 'EN', 'Business & IT Systems Management')
ON CONFLICT DO NOTHING;

-- ---- diploma_translations (12 rows) (18 skipped as duplicates) ----
INSERT INTO diploma_translations (id, diploma_id, name, locale) VALUES
  ('0dbe6304bad448a6875dece6315736ca', 'ed71c0bc8e484ef69e1fa371eeadf36a', 'Tronc Commun Scientifique', 'FR'),
  ('fe14337b83854872ab92e7e7c5fb7e38', 'ed71c0bc8e484ef69e1fa371eeadf36a', 'Scientific Common Core', 'EN'),
  ('98e34acef02848dbbdad8f04da4e8839', 'a34bcd54e0364680a2366eca4b889e64', 'Baccalauréat Sciences Économiques', 'FR'),
  ('19880e3b4bb34c868da550510e4b6f97', 'a34bcd54e0364680a2366eca4b889e64', 'High School Diploma - Economics', 'EN'),
  ('c511431f3ff74b57853159fbd3b97c77', 'c8857b2b1f6541f2b606ee765495819e', 'CPGE Maths-Physique (MP)', 'FR'),
  ('1d4a5f6275794217b3a2f9fd3586c1d0', 'c8857b2b1f6541f2b606ee765495819e', 'Preparatory Classes - Math & Physics', 'EN'),
  ('a114cce717f84ce7a2a37376ddb433dc', '7fe1ed96e0f54b9892bdb79a97bf0ff7', 'TS Développement Digital', 'FR'),
  ('c6032feaa7d0437eb456e9da7cb74272', '7fe1ed96e0f54b9892bdb79a97bf0ff7', 'Specialized Technician in Development', 'EN'),
  ('c6266d1972754abcbd033eb19cd336bb', '307ef78a9a634d669137460f5ab21f0b', 'TS Réseaux & Systèmes', 'FR'),
  ('6cfe56c65d654e84b0f7efd6b9f52814', '307ef78a9a634d669137460f5ab21f0b', 'Specialized Technician in Networks', 'EN'),
  ('c8a130a438e243ee985c0e25286e0ab6', 'ce1ac7769130470b8e30eccea8b1b0e7', 'Master Management des SI', 'FR'),
  ('6266638cf1da49e687b2529fb850aeb4', 'ce1ac7769130470b8e30eccea8b1b0e7', 'Master in IT Management', 'EN')
ON CONFLICT DO NOTHING;

-- ---- university_translations (22 rows) (2 skipped as duplicates) ----
INSERT INTO university_translations (id, university_id, locale, name, description) VALUES
  ('ec96fae5b85f4c728515b014db1549c7', '6fc8ebd4d15042bf93cbcd5afbfc9f76', 'FR', 'Lycée Qualifiant / Technique', NULL),
  ('007ae0d22b9a43b39cdc772861bb158d', '6fc8ebd4d15042bf93cbcd5afbfc9f76', 'EN', 'Technical High School', NULL),
  ('100f6f27f13a422f99dc4b863a21c5d0', '004ab937ef6e44fba82dfb46b0ac0df6', 'FR', 'Classes Préparatoires aux Grandes Écoles', NULL),
  ('7e1d5562162d4989a2ad3bb678ea271e', '004ab937ef6e44fba82dfb46b0ac0df6', 'EN', 'Preparatory Classes (CPGE)', NULL),
  ('d3e907a485ba410680a07f3c4aa7ddb5', '89aac73540224506a2249f4f9fcb6dff', 'FR', 'OFPPT - Office de la Formation Professionnelle', NULL),
  ('9e187e82924c4c498fec779a2a155075', '89aac73540224506a2249f4f9fcb6dff', 'EN', 'OFPPT - Vocational Training Institute', NULL),
  ('3626ee26eeaa47558a61c6eba05980eb', '22da313497d547f0ba31bbf279013885', 'FR', 'Faculté des Sciences', NULL),
  ('ac768576cea542af95cf2d1bceb7dac3', '22da313497d547f0ba31bbf279013885', 'EN', 'Faculty of Sciences', NULL),
  ('95332cdb78af482381189390cbdf9de7', '830edf002dca49279fbee027d019dd51', 'FR', 'Faculté des Sciences et Techniques', NULL),
  ('f59ee70e477a4c079c790d20165247bb', '830edf002dca49279fbee027d019dd51', 'EN', 'Faculty of Sciences and Technology', NULL),
  ('a95f27edd92d42f2b6405372f503b207', '0e1a20f0abc1424e9bd18304f3b90bf3', 'FR', 'École Supérieure de Technologie', NULL),
  ('450f611b381648eab81705774a824eb2', '0e1a20f0abc1424e9bd18304f3b90bf3', 'EN', 'Higher School of Technology', NULL),
  ('e3ec69ab39dd4139b4e5e3bc76dd11d1', 'b651384731dd45418cbf517c31e26eb4', 'FR', 'École Nationale Supérieure d''Informatique et d''Analyse des Systèmes', NULL),
  ('ade0821a75964ccc880c41401972eedf', 'b651384731dd45418cbf517c31e26eb4', 'EN', 'National Higher School for Computer Science and Systems Analysis', NULL),
  ('0671f0172f4b45fb9793b85f3d490980', 'f53a646a7bef4a3f99615292f812102a', 'FR', 'Institut National des Postes et Télécommunications', NULL),
  ('944b610d7d4148a9b65c20ad2fe758d9', 'f53a646a7bef4a3f99615292f812102a', 'EN', 'National Institute of Posts and Telecommunications', NULL),
  ('0fa7d02fdf8b4f14bda1ba488ed54700', 'a71876150d504ede922f6ebcc903c7fc', 'FR', 'École Mohammadia d''Ingénieurs', NULL),
  ('be17259211e54d1cb54130179e628eda', 'a71876150d504ede922f6ebcc903c7fc', 'EN', 'Mohammadia School of Engineers', NULL),
  ('021a834546d14743bf9464084bbed67a', 'c24f38f921e3458a84c533470c1072a8', 'FR', 'École Nationale de Commerce et de Gestion', NULL),
  ('51732e0b37474ec0a59e66e6d380aa13', 'c24f38f921e3458a84c533470c1072a8', 'EN', 'National School of Business and Management', NULL),
  ('00100d04d69545dd99216290c25cd801', 'c7248dc1852541c580752e63688318da', 'FR', '1337 Coding School', NULL),
  ('bac6dbfbac1546069c2d1a2f1c382822', 'c7248dc1852541c580752e63688318da', 'EN', '1337 Coding School', NULL)
ON CONFLICT DO NOTHING;

-- ---- programs (6 rows) (16 skipped as duplicates) ----
INSERT INTO programs (id, created_at, updated_at, university_id, category_id, output_diploma_id, title, years_of_study, monthly_subscription, max_age, has_concours, diploma_recognition_abroad_status, diploma_recognition_morocco_status, is_approved) VALUES
  ('5506058352504fe3bfb54dcd53819113', '2026-08-13 14:51:50.664926', '2026-08-13 14:51:50.664917', '6fc8ebd4d15042bf93cbcd5afbfc9f76', 'de1fb30b62ba44a196ac28850266746b', 'ed71c0bc8e484ef69e1fa371eeadf36a', 'Tronc Commun Scientifique', 1, NULL, NULL, false, NULL, NULL, true),
  ('6a383ca1a9094f47afcade8b9d53eba4', '2026-08-13 14:51:50.713071', '2026-08-13 14:51:50.713063', '6fc8ebd4d15042bf93cbcd5afbfc9f76', '04466df01d8548d9aa3b53c582c1452e', 'a34bcd54e0364680a2366eca4b889e64', 'Baccalauréat Sciences Économiques', 2, NULL, NULL, false, NULL, NULL, true),
  ('d6bbaab9d0174dc6b5b4782a25ebcbb2', '2026-08-13 14:51:50.728473', '2026-08-13 14:51:50.728464', '004ab937ef6e44fba82dfb46b0ac0df6', 'de1fb30b62ba44a196ac28850266746b', 'c8857b2b1f6541f2b606ee765495819e', 'Classes Préparatoires Maths-Physique (MP)', 2, NULL, NULL, false, NULL, NULL, true),
  ('10063493441a4ead919dfd14cdd1614a', '2026-08-13 14:51:50.773895', '2026-08-13 14:51:50.773888', '89aac73540224506a2249f4f9fcb6dff', 'de1fb30b62ba44a196ac28850266746b', '7fe1ed96e0f54b9892bdb79a97bf0ff7', 'TS Développement Digital & Fullstack', 2, NULL, NULL, false, NULL, NULL, true),
  ('735c7ed10ddf44d8a91c171d770e706f', '2026-08-13 14:51:50.788035', '2026-08-13 14:51:50.788024', '89aac73540224506a2249f4f9fcb6dff', '5754577048ce47bfb824e448c86bc35e', '307ef78a9a634d669137460f5ab21f0b', 'TS Administration Réseaux & Systèmes', 2, NULL, NULL, false, NULL, NULL, true),
  ('87731ed3397b4247b2269f4a9c74d6e2', '2026-08-13 14:51:50.967278', '2026-08-13 14:51:50.967268', 'c24f38f921e3458a84c533470c1072a8', '04466df01d8548d9aa3b53c582c1452e', 'ce1ac7769130470b8e30eccea8b1b0e7', 'Master Management et Audit des SI', 3, NULL, NULL, false, NULL, NULL, true)
ON CONFLICT DO NOTHING;

-- ---- program_translations (12 rows) (32 skipped as duplicates) ----
INSERT INTO program_translations (id, program_id, locale, name) VALUES
  ('e04ecc03583f4d84b3ef7561ec5ef73c', '5506058352504fe3bfb54dcd53819113', 'FR', 'Tronc Commun Scientifique'),
  ('d46a484c280246c7a0c90173a011920a', '5506058352504fe3bfb54dcd53819113', 'EN', 'Scientific Common Core'),
  ('378387aefd7345d691066f8146944693', '6a383ca1a9094f47afcade8b9d53eba4', 'FR', 'Baccalauréat Sciences Économiques'),
  ('d16fb51910a640b5b95f9750303bae76', '6a383ca1a9094f47afcade8b9d53eba4', 'EN', 'High School Diploma in Economics'),
  ('6211933927e543a09766310dea1fb34b', 'd6bbaab9d0174dc6b5b4782a25ebcbb2', 'FR', 'CPGE Maths-Physique (MP)'),
  ('ea21e8ac91a147ec83ac0a337e1e45c2', 'd6bbaab9d0174dc6b5b4782a25ebcbb2', 'EN', 'Preparatory Classes - Math & Physics'),
  ('a9e693868d424019a12a1aa7fe99dc6c', '10063493441a4ead919dfd14cdd1614a', 'FR', 'TS Développement Digital & Fullstack'),
  ('b3cfb09aac9d407b97d9ccca0c125b51', '10063493441a4ead919dfd14cdd1614a', 'EN', 'Specialized Tech in Digital Dev & Fullstack'),
  ('1b2eac7cc7684440a029a13f4a4072f6', '735c7ed10ddf44d8a91c171d770e706f', 'FR', 'TS Administration Réseaux & Systèmes'),
  ('80384a5ff7aa4675af15023b9a421e6b', '735c7ed10ddf44d8a91c171d770e706f', 'EN', 'Specialized Tech in Network & Systems Admin'),
  ('218b35f6cdba4ed9bf471a491509cc4b', '87731ed3397b4247b2269f4a9c74d6e2', 'FR', 'Master Management et Audit des SI'),
  ('f75309acb31147fa9020a6a6f8fef324', '87731ed3397b4247b2269f4a9c74d6e2', 'EN', 'Master in IT Management and Audit')
ON CONFLICT DO NOTHING;

-- ---- program_job_titles (2 rows) (13 skipped as duplicates) ----
INSERT INTO program_job_titles (id, created_at, updated_at, program_id, job_title_id) VALUES
  ('75343acb2458499bbd21eb13209991dc', '2026-08-13 14:51:52.411508', '2026-08-13 14:51:52.411497', '735c7ed10ddf44d8a91c171d770e706f', '158ebdebef9c47ee8e4ee9bc6d9fd609'),
  ('f6c21afa1cb24fc4b483e7e6185b8feb', '2026-08-13 14:51:52.441150', '2026-08-13 14:51:52.441137', '87731ed3397b4247b2269f4a9c74d6e2', '3c59a91a71eb4a1ca613d428a81bd7cd')
ON CONFLICT DO NOTHING;

-- ---- program_requirements (2 rows) (32 skipped as duplicates) ----
INSERT INTO program_requirements (id, created_at, updated_at, program_id, required_diploma_id, min_grade, max_years_since_graduation, requirement_group) VALUES
  ('7e43bbdecaa04f7198b63e92a1f51a7c', '2026-08-13 14:51:51.701500', '2026-08-13 14:51:51.701491', '6a383ca1a9094f47afcade8b9d53eba4', 'ed71c0bc8e484ef69e1fa371eeadf36a', NULL, NULL, 1),
  ('c7420fb18f7144b18a4aa210280fc837', '2026-08-13 14:51:52.149104', '2026-08-13 14:51:52.149093', '87731ed3397b4247b2269f4a9c74d6e2', 'a34bcd54e0364680a2366eca4b889e64', NULL, NULL, 1)
ON CONFLICT DO NOTHING;
