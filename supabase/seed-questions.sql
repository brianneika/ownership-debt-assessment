-- ============================================================
-- OWNERSHIP ASSESSMENT — QUESTION SEED
-- supabase/seed-questions.sql
--
-- Run AFTER schema.sql.
-- score_bands are already seeded by schema.sql; the section
-- at the bottom is commented out — uncomment only for a fresh
-- DB that did not run schema.sql.
--
-- question_text values marked [Placeholder] — replace with
-- final copy before launch.
--
-- weight column (numeric 4,2) stores rounded per-question
-- approximations for reference only. The scoring engine uses
-- hardcoded OQI_WEIGHTS and DRS weight constants.
-- ============================================================

-- ============================================================
-- SECTION A — Intake (A001–A006, orders 1–6)
-- A001–A002: free text
-- A003–A005: categorical radio
-- A006: categorical radio — drives drs_profile routing
-- ============================================================
insert into questions
  (question_key, question_text, question_order, section, answer_type, is_scored, dimension_id)
values
  ('A001', '[Placeholder] What is your full name?',                                              1, 'A', 'free_text',         false, null),
  ('A002', '[Placeholder] What is the name of your business?',                                  2, 'A', 'free_text',         false, null),
  ('A003', '[Placeholder] How long have you been in business?',                                 3, 'A', 'categorical_radio', false, null),
  ('A004', '[Placeholder] What industry are you in?',                                           4, 'A', 'categorical_radio', false, null),
  ('A005', '[Placeholder] What is your annual revenue range?',                                  5, 'A', 'categorical_radio', false, null),
  ('A006', '[Placeholder] How many people currently help run this business day-to-day?',        6, 'A', 'categorical_radio', false, null);

-- ============================================================
-- SECTION B — Workflow Identification (B001–B004, orders 7–10)
-- Answers drive wf_c_mode / wf_d_mode / wf_e_mode / wf_f_mode
-- ============================================================
insert into questions
  (question_key, question_text, question_order, section, answer_type, is_scored, dimension_id)
values
  ('B001', '[Placeholder] Who currently owns Workflow C (e.g. Sales / Client Delivery)?',     7,  'B', 'categorical_radio', false, null),
  ('B002', '[Placeholder] Who currently owns Workflow D (e.g. Operations / Fulfillment)?',    8,  'B', 'categorical_radio', false, null),
  ('B003', '[Placeholder] Who currently owns Workflow E (e.g. Finance / Admin)?',             9,  'B', 'categorical_radio', false, null),
  ('B004', '[Placeholder] Who currently owns Workflow F (e.g. Marketing / Lead Gen)?',        10, 'B', 'categorical_radio', false, null);

-- ============================================================
-- SECTION C — MODE B OQI (Q001–Q018, orders 11–28)
-- 6 OQI dimensions × 3 questions each
-- ============================================================
insert into questions
  (question_key, question_text, question_order, section, mode, answer_type,
   is_scored, oqi_dimension, reverse_scored, applies_to_profile, weight, dimension_id)
values
  -- FA — Financial Accountability (weight 0.20 ÷ 3 ≈ 0.07)
  ('Q001', '[Placeholder C-FA-1] Financial processes in this workflow are documented.',           11, 'C', 'B', 'scored_radio', true, 'FA', false, 'both', 0.07, (select id from dimensions where slug='oqi')),
  ('Q002', '[Placeholder C-FA-2] Financial handoffs happen without owner involvement.',           12, 'C', 'B', 'scored_radio', true, 'FA', false, 'both', 0.07, (select id from dimensions where slug='oqi')),
  ('Q003', '[Placeholder C-FA-3] Financial outcomes are tracked by someone other than you.',     13, 'C', 'B', 'scored_radio', true, 'FA', false, 'both', 0.07, (select id from dimensions where slug='oqi')),
  -- RA — Role Accountability (weight 0.22 ÷ 3 ≈ 0.07)
  ('Q004', '[Placeholder C-RA-1] Roles and responsibilities in this workflow are defined.',      14, 'C', 'B', 'scored_radio', true, 'RA', false, 'both', 0.07, (select id from dimensions where slug='oqi')),
  ('Q005', '[Placeholder C-RA-2] Team members execute this workflow without reminders.',         15, 'C', 'B', 'scored_radio', true, 'RA', false, 'both', 0.07, (select id from dimensions where slug='oqi')),
  ('Q006', '[Placeholder C-RA-3] Accountability for this workflow sits outside the owner.',      16, 'C', 'B', 'scored_radio', true, 'RA', false, 'both', 0.07, (select id from dimensions where slug='oqi')),
  -- SC — Systems & Checklists (weight 0.18 ÷ 3 = 0.06)
  ('Q007', '[Placeholder C-SC-1] Step-by-step SOPs exist for this workflow.',                   17, 'C', 'B', 'scored_radio', true, 'SC', false, 'both', 0.06, (select id from dimensions where slug='oqi')),
  ('Q008', '[Placeholder C-SC-2] Checklists are used consistently in this workflow.',           18, 'C', 'B', 'scored_radio', true, 'SC', false, 'both', 0.06, (select id from dimensions where slug='oqi')),
  ('Q009', '[Placeholder C-SC-3] New team members could learn this workflow from docs alone.',  19, 'C', 'B', 'scored_radio', true, 'SC', false, 'both', 0.06, (select id from dimensions where slug='oqi')),
  -- ET — Execution & Training (weight 0.15 ÷ 3 = 0.05)
  ('Q010', '[Placeholder C-ET-1] Team members have been trained on this workflow.',             20, 'C', 'B', 'scored_radio', true, 'ET', false, 'both', 0.05, (select id from dimensions where slug='oqi')),
  ('Q011', '[Placeholder C-ET-2] Training materials for this workflow are up to date.',         21, 'C', 'B', 'scored_radio', true, 'ET', false, 'both', 0.05, (select id from dimensions where slug='oqi')),
  ('Q012', '[Placeholder C-ET-3] Execution quality is consistent without owner oversight.',     22, 'C', 'B', 'scored_radio', true, 'ET', false, 'both', 0.05, (select id from dimensions where slug='oqi')),
  -- OA — Outcome Accountability (weight 0.15 ÷ 3 = 0.05)
  ('Q013', '[Placeholder C-OA-1] KPIs for this workflow are defined and tracked.',             23, 'C', 'B', 'scored_radio', true, 'OA', false, 'both', 0.05, (select id from dimensions where slug='oqi')),
  ('Q014', '[Placeholder C-OA-2] Someone other than you reviews workflow outcomes.',            24, 'C', 'B', 'scored_radio', true, 'OA', false, 'both', 0.05, (select id from dimensions where slug='oqi')),
  ('Q015', '[Placeholder C-OA-3] This workflow runs on schedule without owner input.',          25, 'C', 'B', 'scored_radio', true, 'OA', false, 'both', 0.05, (select id from dimensions where slug='oqi')),
  -- CC — Culture & Communication (weight 0.10 ÷ 3 ≈ 0.03)
  ('Q016', '[Placeholder C-CC-1] Communication norms in this workflow are established.',       26, 'C', 'B', 'scored_radio', true, 'CC', false, 'both', 0.03, (select id from dimensions where slug='oqi')),
  ('Q017', '[Placeholder C-CC-2] Escalation paths are clear and rarely reach the owner.',     27, 'C', 'B', 'scored_radio', true, 'CC', false, 'both', 0.03, (select id from dimensions where slug='oqi')),
  ('Q018', '[Placeholder C-CC-3] Team culture supports independent execution here.',           28, 'C', 'B', 'scored_radio', true, 'CC', false, 'both', 0.03, (select id from dimensions where slug='oqi'));

-- ============================================================
-- SECTION D — MODE B OQI (Q019–Q036, orders 29–46)
-- ============================================================
insert into questions
  (question_key, question_text, question_order, section, mode, answer_type,
   is_scored, oqi_dimension, reverse_scored, applies_to_profile, weight, dimension_id)
values
  ('Q019', '[Placeholder D-FA-1] Financial processes in this workflow are documented.',           29, 'D', 'B', 'scored_radio', true, 'FA', false, 'both', 0.07, (select id from dimensions where slug='oqi')),
  ('Q020', '[Placeholder D-FA-2] Financial handoffs happen without owner involvement.',           30, 'D', 'B', 'scored_radio', true, 'FA', false, 'both', 0.07, (select id from dimensions where slug='oqi')),
  ('Q021', '[Placeholder D-FA-3] Financial outcomes are tracked by someone other than you.',     31, 'D', 'B', 'scored_radio', true, 'FA', false, 'both', 0.07, (select id from dimensions where slug='oqi')),
  ('Q022', '[Placeholder D-RA-1] Roles and responsibilities in this workflow are defined.',      32, 'D', 'B', 'scored_radio', true, 'RA', false, 'both', 0.07, (select id from dimensions where slug='oqi')),
  ('Q023', '[Placeholder D-RA-2] Team members execute this workflow without reminders.',         33, 'D', 'B', 'scored_radio', true, 'RA', false, 'both', 0.07, (select id from dimensions where slug='oqi')),
  ('Q024', '[Placeholder D-RA-3] Accountability for this workflow sits outside the owner.',      34, 'D', 'B', 'scored_radio', true, 'RA', false, 'both', 0.07, (select id from dimensions where slug='oqi')),
  ('Q025', '[Placeholder D-SC-1] Step-by-step SOPs exist for this workflow.',                   35, 'D', 'B', 'scored_radio', true, 'SC', false, 'both', 0.06, (select id from dimensions where slug='oqi')),
  ('Q026', '[Placeholder D-SC-2] Checklists are used consistently in this workflow.',           36, 'D', 'B', 'scored_radio', true, 'SC', false, 'both', 0.06, (select id from dimensions where slug='oqi')),
  ('Q027', '[Placeholder D-SC-3] New team members could learn this workflow from docs alone.',  37, 'D', 'B', 'scored_radio', true, 'SC', false, 'both', 0.06, (select id from dimensions where slug='oqi')),
  ('Q028', '[Placeholder D-ET-1] Team members have been trained on this workflow.',             38, 'D', 'B', 'scored_radio', true, 'ET', false, 'both', 0.05, (select id from dimensions where slug='oqi')),
  ('Q029', '[Placeholder D-ET-2] Training materials for this workflow are up to date.',         39, 'D', 'B', 'scored_radio', true, 'ET', false, 'both', 0.05, (select id from dimensions where slug='oqi')),
  ('Q030', '[Placeholder D-ET-3] Execution quality is consistent without owner oversight.',     40, 'D', 'B', 'scored_radio', true, 'ET', false, 'both', 0.05, (select id from dimensions where slug='oqi')),
  ('Q031', '[Placeholder D-OA-1] KPIs for this workflow are defined and tracked.',             41, 'D', 'B', 'scored_radio', true, 'OA', false, 'both', 0.05, (select id from dimensions where slug='oqi')),
  ('Q032', '[Placeholder D-OA-2] Someone other than you reviews workflow outcomes.',            42, 'D', 'B', 'scored_radio', true, 'OA', false, 'both', 0.05, (select id from dimensions where slug='oqi')),
  ('Q033', '[Placeholder D-OA-3] This workflow runs on schedule without owner input.',          43, 'D', 'B', 'scored_radio', true, 'OA', false, 'both', 0.05, (select id from dimensions where slug='oqi')),
  ('Q034', '[Placeholder D-CC-1] Communication norms in this workflow are established.',       44, 'D', 'B', 'scored_radio', true, 'CC', false, 'both', 0.03, (select id from dimensions where slug='oqi')),
  ('Q035', '[Placeholder D-CC-2] Escalation paths are clear and rarely reach the owner.',     45, 'D', 'B', 'scored_radio', true, 'CC', false, 'both', 0.03, (select id from dimensions where slug='oqi')),
  ('Q036', '[Placeholder D-CC-3] Team culture supports independent execution here.',           46, 'D', 'B', 'scored_radio', true, 'CC', false, 'both', 0.03, (select id from dimensions where slug='oqi'));

-- ============================================================
-- SECTION E — MODE B OQI (Q037–Q054, orders 47–64)
-- ============================================================
insert into questions
  (question_key, question_text, question_order, section, mode, answer_type,
   is_scored, oqi_dimension, reverse_scored, applies_to_profile, weight, dimension_id)
values
  ('Q037', '[Placeholder E-FA-1] Financial processes in this workflow are documented.',           47, 'E', 'B', 'scored_radio', true, 'FA', false, 'both', 0.07, (select id from dimensions where slug='oqi')),
  ('Q038', '[Placeholder E-FA-2] Financial handoffs happen without owner involvement.',           48, 'E', 'B', 'scored_radio', true, 'FA', false, 'both', 0.07, (select id from dimensions where slug='oqi')),
  ('Q039', '[Placeholder E-FA-3] Financial outcomes are tracked by someone other than you.',     49, 'E', 'B', 'scored_radio', true, 'FA', false, 'both', 0.07, (select id from dimensions where slug='oqi')),
  ('Q040', '[Placeholder E-RA-1] Roles and responsibilities in this workflow are defined.',      50, 'E', 'B', 'scored_radio', true, 'RA', false, 'both', 0.07, (select id from dimensions where slug='oqi')),
  ('Q041', '[Placeholder E-RA-2] Team members execute this workflow without reminders.',         51, 'E', 'B', 'scored_radio', true, 'RA', false, 'both', 0.07, (select id from dimensions where slug='oqi')),
  ('Q042', '[Placeholder E-RA-3] Accountability for this workflow sits outside the owner.',      52, 'E', 'B', 'scored_radio', true, 'RA', false, 'both', 0.07, (select id from dimensions where slug='oqi')),
  ('Q043', '[Placeholder E-SC-1] Step-by-step SOPs exist for this workflow.',                   53, 'E', 'B', 'scored_radio', true, 'SC', false, 'both', 0.06, (select id from dimensions where slug='oqi')),
  ('Q044', '[Placeholder E-SC-2] Checklists are used consistently in this workflow.',           54, 'E', 'B', 'scored_radio', true, 'SC', false, 'both', 0.06, (select id from dimensions where slug='oqi')),
  ('Q045', '[Placeholder E-SC-3] New team members could learn this workflow from docs alone.',  55, 'E', 'B', 'scored_radio', true, 'SC', false, 'both', 0.06, (select id from dimensions where slug='oqi')),
  ('Q046', '[Placeholder E-ET-1] Team members have been trained on this workflow.',             56, 'E', 'B', 'scored_radio', true, 'ET', false, 'both', 0.05, (select id from dimensions where slug='oqi')),
  ('Q047', '[Placeholder E-ET-2] Training materials for this workflow are up to date.',         57, 'E', 'B', 'scored_radio', true, 'ET', false, 'both', 0.05, (select id from dimensions where slug='oqi')),
  ('Q048', '[Placeholder E-ET-3] Execution quality is consistent without owner oversight.',     58, 'E', 'B', 'scored_radio', true, 'ET', false, 'both', 0.05, (select id from dimensions where slug='oqi')),
  ('Q049', '[Placeholder E-OA-1] KPIs for this workflow are defined and tracked.',             59, 'E', 'B', 'scored_radio', true, 'OA', false, 'both', 0.05, (select id from dimensions where slug='oqi')),
  ('Q050', '[Placeholder E-OA-2] Someone other than you reviews workflow outcomes.',            60, 'E', 'B', 'scored_radio', true, 'OA', false, 'both', 0.05, (select id from dimensions where slug='oqi')),
  ('Q051', '[Placeholder E-OA-3] This workflow runs on schedule without owner input.',          61, 'E', 'B', 'scored_radio', true, 'OA', false, 'both', 0.05, (select id from dimensions where slug='oqi')),
  ('Q052', '[Placeholder E-CC-1] Communication norms in this workflow are established.',       62, 'E', 'B', 'scored_radio', true, 'CC', false, 'both', 0.03, (select id from dimensions where slug='oqi')),
  ('Q053', '[Placeholder E-CC-2] Escalation paths are clear and rarely reach the owner.',     63, 'E', 'B', 'scored_radio', true, 'CC', false, 'both', 0.03, (select id from dimensions where slug='oqi')),
  ('Q054', '[Placeholder E-CC-3] Team culture supports independent execution here.',           64, 'E', 'B', 'scored_radio', true, 'CC', false, 'both', 0.03, (select id from dimensions where slug='oqi'));

-- ============================================================
-- SECTION F — MODE B OQI (Q055–Q072, orders 65–82)
-- ============================================================
insert into questions
  (question_key, question_text, question_order, section, mode, answer_type,
   is_scored, oqi_dimension, reverse_scored, applies_to_profile, weight, dimension_id)
values
  ('Q055', '[Placeholder F-FA-1] Financial processes in this workflow are documented.',           65, 'F', 'B', 'scored_radio', true, 'FA', false, 'both', 0.07, (select id from dimensions where slug='oqi')),
  ('Q056', '[Placeholder F-FA-2] Financial handoffs happen without owner involvement.',           66, 'F', 'B', 'scored_radio', true, 'FA', false, 'both', 0.07, (select id from dimensions where slug='oqi')),
  ('Q057', '[Placeholder F-FA-3] Financial outcomes are tracked by someone other than you.',     67, 'F', 'B', 'scored_radio', true, 'FA', false, 'both', 0.07, (select id from dimensions where slug='oqi')),
  ('Q058', '[Placeholder F-RA-1] Roles and responsibilities in this workflow are defined.',      68, 'F', 'B', 'scored_radio', true, 'RA', false, 'both', 0.07, (select id from dimensions where slug='oqi')),
  ('Q059', '[Placeholder F-RA-2] Team members execute this workflow without reminders.',         69, 'F', 'B', 'scored_radio', true, 'RA', false, 'both', 0.07, (select id from dimensions where slug='oqi')),
  ('Q060', '[Placeholder F-RA-3] Accountability for this workflow sits outside the owner.',      70, 'F', 'B', 'scored_radio', true, 'RA', false, 'both', 0.07, (select id from dimensions where slug='oqi')),
  ('Q061', '[Placeholder F-SC-1] Step-by-step SOPs exist for this workflow.',                   71, 'F', 'B', 'scored_radio', true, 'SC', false, 'both', 0.06, (select id from dimensions where slug='oqi')),
  ('Q062', '[Placeholder F-SC-2] Checklists are used consistently in this workflow.',           72, 'F', 'B', 'scored_radio', true, 'SC', false, 'both', 0.06, (select id from dimensions where slug='oqi')),
  ('Q063', '[Placeholder F-SC-3] New team members could learn this workflow from docs alone.',  73, 'F', 'B', 'scored_radio', true, 'SC', false, 'both', 0.06, (select id from dimensions where slug='oqi')),
  ('Q064', '[Placeholder F-ET-1] Team members have been trained on this workflow.',             74, 'F', 'B', 'scored_radio', true, 'ET', false, 'both', 0.05, (select id from dimensions where slug='oqi')),
  ('Q065', '[Placeholder F-ET-2] Training materials for this workflow are up to date.',         75, 'F', 'B', 'scored_radio', true, 'ET', false, 'both', 0.05, (select id from dimensions where slug='oqi')),
  ('Q066', '[Placeholder F-ET-3] Execution quality is consistent without owner oversight.',     76, 'F', 'B', 'scored_radio', true, 'ET', false, 'both', 0.05, (select id from dimensions where slug='oqi')),
  ('Q067', '[Placeholder F-OA-1] KPIs for this workflow are defined and tracked.',             77, 'F', 'B', 'scored_radio', true, 'OA', false, 'both', 0.05, (select id from dimensions where slug='oqi')),
  ('Q068', '[Placeholder F-OA-2] Someone other than you reviews workflow outcomes.',            78, 'F', 'B', 'scored_radio', true, 'OA', false, 'both', 0.05, (select id from dimensions where slug='oqi')),
  ('Q069', '[Placeholder F-OA-3] This workflow runs on schedule without owner input.',          79, 'F', 'B', 'scored_radio', true, 'OA', false, 'both', 0.05, (select id from dimensions where slug='oqi')),
  ('Q070', '[Placeholder F-CC-1] Communication norms in this workflow are established.',       80, 'F', 'B', 'scored_radio', true, 'CC', false, 'both', 0.03, (select id from dimensions where slug='oqi')),
  ('Q071', '[Placeholder F-CC-2] Escalation paths are clear and rarely reach the owner.',     81, 'F', 'B', 'scored_radio', true, 'CC', false, 'both', 0.03, (select id from dimensions where slug='oqi')),
  ('Q072', '[Placeholder F-CC-3] Team culture supports independent execution here.',           82, 'F', 'B', 'scored_radio', true, 'CC', false, 'both', 0.03, (select id from dimensions where slug='oqi'));

-- ============================================================
-- SECTIONS C–F — MODE A (TBx1–TBx5, orders 83–102)
-- TBx1: hours spent on workflow — categorical, unscored
-- TBx2: barrier reason — categorical, unscored
-- TBx3: obstacle description — free text, unscored
-- TBx4: SOP coverage (0=none → 4=fully documented) — scored, weight 0.50
-- TBx5: team readiness (0=not capable → 4=fully capable) — scored, weight 0.50
-- High TBx4 + TBx5 = low ownership debt (formula: 100 − ((v4+v5)/8)×100)
-- ============================================================
insert into questions
  (question_key, question_text, question_order, section, mode, answer_type,
   is_scored, reverse_scored, applies_to_profile, weight, dimension_id)
values
  -- Workflow C
  ('TBC1', '[Placeholder] How many hours per week do you personally spend on Workflow C?',              83,  'C', 'A', 'categorical_radio', false, false, 'both', 1.00, null),
  ('TBC2', '[Placeholder] What is the primary reason you have not delegated Workflow C?',               84,  'C', 'A', 'categorical_radio', false, false, 'both', 1.00, null),
  ('TBC3', '[Placeholder] Describe the biggest obstacle to delegating Workflow C.',                     85,  'C', 'A', 'free_text',          false, false, 'both', 1.00, null),
  ('TBC4', '[Placeholder] How well-documented are the SOPs for Workflow C? (0=none, 4=fully)',         86,  'C', 'A', 'scored_radio',        true,  false, 'both', 0.50, (select id from dimensions where slug='ods')),
  ('TBC5', '[Placeholder] How capable is your team at executing Workflow C today? (0=not, 4=fully)',   87,  'C', 'A', 'scored_radio',        true,  false, 'both', 0.50, (select id from dimensions where slug='ods')),
  -- Workflow D
  ('TBD1', '[Placeholder] How many hours per week do you personally spend on Workflow D?',              88,  'D', 'A', 'categorical_radio', false, false, 'both', 1.00, null),
  ('TBD2', '[Placeholder] What is the primary reason you have not delegated Workflow D?',               89,  'D', 'A', 'categorical_radio', false, false, 'both', 1.00, null),
  ('TBD3', '[Placeholder] Describe the biggest obstacle to delegating Workflow D.',                     90,  'D', 'A', 'free_text',          false, false, 'both', 1.00, null),
  ('TBD4', '[Placeholder] How well-documented are the SOPs for Workflow D? (0=none, 4=fully)',         91,  'D', 'A', 'scored_radio',        true,  false, 'both', 0.50, (select id from dimensions where slug='ods')),
  ('TBD5', '[Placeholder] How capable is your team at executing Workflow D today? (0=not, 4=fully)',   92,  'D', 'A', 'scored_radio',        true,  false, 'both', 0.50, (select id from dimensions where slug='ods')),
  -- Workflow E
  ('TBE1', '[Placeholder] How many hours per week do you personally spend on Workflow E?',              93,  'E', 'A', 'categorical_radio', false, false, 'both', 1.00, null),
  ('TBE2', '[Placeholder] What is the primary reason you have not delegated Workflow E?',               94,  'E', 'A', 'categorical_radio', false, false, 'both', 1.00, null),
  ('TBE3', '[Placeholder] Describe the biggest obstacle to delegating Workflow E.',                     95,  'E', 'A', 'free_text',          false, false, 'both', 1.00, null),
  ('TBE4', '[Placeholder] How well-documented are the SOPs for Workflow E? (0=none, 4=fully)',         96,  'E', 'A', 'scored_radio',        true,  false, 'both', 0.50, (select id from dimensions where slug='ods')),
  ('TBE5', '[Placeholder] How capable is your team at executing Workflow E today? (0=not, 4=fully)',   97,  'E', 'A', 'scored_radio',        true,  false, 'both', 0.50, (select id from dimensions where slug='ods')),
  -- Workflow F
  ('TBF1', '[Placeholder] How many hours per week do you personally spend on Workflow F?',              98,  'F', 'A', 'categorical_radio', false, false, 'both', 1.00, null),
  ('TBF2', '[Placeholder] What is the primary reason you have not delegated Workflow F?',               99,  'F', 'A', 'categorical_radio', false, false, 'both', 1.00, null),
  ('TBF3', '[Placeholder] Describe the biggest obstacle to delegating Workflow F.',                     100, 'F', 'A', 'free_text',          false, false, 'both', 1.00, null),
  ('TBF4', '[Placeholder] How well-documented are the SOPs for Workflow F? (0=none, 4=fully)',         101, 'F', 'A', 'scored_radio',        true,  false, 'both', 0.50, (select id from dimensions where slug='ods')),
  ('TBF5', '[Placeholder] How capable is your team at executing Workflow F today? (0=not, 4=fully)',   102, 'F', 'A', 'scored_radio',        true,  false, 'both', 0.50, (select id from dimensions where slug='ods'));

-- ============================================================
-- SECTIONS C–F — MODE C (RCx1–RCx3, orders 103–114)
-- RCx1: reason workflow has no owner — categorical, unscored
-- RCx2: team capacity (0=not at all → 4=fully capable) — scored
--        HIGH rc2 = LOW debt: formula 100 − (rc2/4)×50
-- RCx3: fallthrough frequency (0=never → 4=always) — scored, reverse_scored=true
--        rc3 ≥ 3 adds 12.5 to workflow ODS (penalty for high fallthrough)
-- ============================================================
insert into questions
  (question_key, question_text, question_order, section, mode, answer_type,
   is_scored, reverse_scored, applies_to_profile, weight, dimension_id)
values
  -- Workflow C
  ('RCC1', '[Placeholder] Why does Workflow C currently have no single owner?',                                   103, 'C', 'C', 'categorical_radio', false, false, 'both', 1.00, null),
  ('RCC2', '[Placeholder] How capable is your team of handling Workflow C without you? (0=not at all, 4=fully)', 104, 'C', 'C', 'scored_radio',        true,  false, 'both', 1.00, (select id from dimensions where slug='ods')),
  ('RCC3', '[Placeholder] How often does Workflow C fall back to you when issues arise? (0=never, 4=always)',    105, 'C', 'C', 'scored_radio',        true,  true,  'both', 1.00, (select id from dimensions where slug='ods')),
  -- Workflow D
  ('RCD1', '[Placeholder] Why does Workflow D currently have no single owner?',                                   106, 'D', 'C', 'categorical_radio', false, false, 'both', 1.00, null),
  ('RCD2', '[Placeholder] How capable is your team of handling Workflow D without you? (0=not at all, 4=fully)', 107, 'D', 'C', 'scored_radio',        true,  false, 'both', 1.00, (select id from dimensions where slug='ods')),
  ('RCD3', '[Placeholder] How often does Workflow D fall back to you when issues arise? (0=never, 4=always)',    108, 'D', 'C', 'scored_radio',        true,  true,  'both', 1.00, (select id from dimensions where slug='ods')),
  -- Workflow E
  ('RCE1', '[Placeholder] Why does Workflow E currently have no single owner?',                                   109, 'E', 'C', 'categorical_radio', false, false, 'both', 1.00, null),
  ('RCE2', '[Placeholder] How capable is your team of handling Workflow E without you? (0=not at all, 4=fully)', 110, 'E', 'C', 'scored_radio',        true,  false, 'both', 1.00, (select id from dimensions where slug='ods')),
  ('RCE3', '[Placeholder] How often does Workflow E fall back to you when issues arise? (0=never, 4=always)',    111, 'E', 'C', 'scored_radio',        true,  true,  'both', 1.00, (select id from dimensions where slug='ods')),
  -- Workflow F
  ('RCF1', '[Placeholder] Why does Workflow F currently have no single owner?',                                   112, 'F', 'C', 'categorical_radio', false, false, 'both', 1.00, null),
  ('RCF2', '[Placeholder] How capable is your team of handling Workflow F without you? (0=not at all, 4=fully)', 113, 'F', 'C', 'scored_radio',        true,  false, 'both', 1.00, (select id from dimensions where slug='ods')),
  ('RCF3', '[Placeholder] How often does Workflow F fall back to you when issues arise? (0=never, 4=always)',    114, 'F', 'C', 'scored_radio',        true,  true,  'both', 1.00, (select id from dimensions where slug='ods'));

-- ============================================================
-- SECTION G — TEAM PROFILE (Q073–Q086, orders 115–128)
-- Q073–Q076: Willingness — applies_to_profile='both'
--             (Willingness is in BOTH Team and Solo DRS formulas)
-- Q077–Q079: Delegation Quality — team only
-- Q080–Q083: Team Capacity — team only
-- Q084–Q086: Authority Framework — team only
-- ============================================================
insert into questions
  (question_key, question_text, question_order, section, answer_type,
   is_scored, drs_category, reverse_scored, applies_to_profile, weight, dimension_id)
values
  -- Willingness (both) — weight 0.30 ÷ 4 = 0.08
  ('Q073', '[Placeholder G-W-1] I am genuinely willing to let others lead key workflows.',          115, 'G', 'scored_radio', true, 'Willingness', false, 'both', 0.08, (select id from dimensions where slug='drs')),
  ('Q074', '[Placeholder G-W-2] I trust others to make decisions without my input.',               116, 'G', 'scored_radio', true, 'Willingness', false, 'both', 0.08, (select id from dimensions where slug='drs')),
  ('Q075', '[Placeholder G-W-3] I have delegated meaningful responsibility in the past year.',     117, 'G', 'scored_radio', true, 'Willingness', false, 'both', 0.08, (select id from dimensions where slug='drs')),
  ('Q076', '[Placeholder G-W-4] I am ready to step back from day-to-day decisions.',              118, 'G', 'scored_radio', true, 'Willingness', false, 'both', 0.08, (select id from dimensions where slug='drs')),
  -- Delegation Quality (team only) — weight 0.25 ÷ 3 ≈ 0.08
  ('Q077', '[Placeholder G-DQ-1] When I delegate, I provide clear expectations and context.',      119, 'G', 'scored_radio', true, 'Delegation Quality', false, 'team', 0.08, (select id from dimensions where slug='drs')),
  ('Q078', '[Placeholder G-DQ-2] I follow up on delegated tasks without micromanaging.',           120, 'G', 'scored_radio', true, 'Delegation Quality', false, 'team', 0.08, (select id from dimensions where slug='drs')),
  ('Q079', '[Placeholder G-DQ-3] Team members complete delegated work to my standard.',            121, 'G', 'scored_radio', true, 'Delegation Quality', false, 'team', 0.08, (select id from dimensions where slug='drs')),
  -- Team Capacity (team only) — weight 0.25 ÷ 4 = 0.06
  ('Q080', '[Placeholder G-TC-1] My team has the skills to take on more responsibility.',          122, 'G', 'scored_radio', true, 'Team Capacity', false, 'team', 0.06, (select id from dimensions where slug='drs')),
  ('Q081', '[Placeholder G-TC-2] My team operates effectively when I am not available.',           123, 'G', 'scored_radio', true, 'Team Capacity', false, 'team', 0.06, (select id from dimensions where slug='drs')),
  ('Q082', '[Placeholder G-TC-3] My team proactively solves problems without escalating to me.',   124, 'G', 'scored_radio', true, 'Team Capacity', false, 'team', 0.06, (select id from dimensions where slug='drs')),
  ('Q083', '[Placeholder G-TC-4] I have a team member ready to step into a lead role.',            125, 'G', 'scored_radio', true, 'Team Capacity', false, 'team', 0.06, (select id from dimensions where slug='drs')),
  -- Authority Framework (team only) — weight 0.20 ÷ 3 ≈ 0.07
  ('Q084', '[Placeholder G-AF-1] Decision-making authority is clearly defined in my business.',    126, 'G', 'scored_radio', true, 'Authority Framework', false, 'team', 0.07, (select id from dimensions where slug='drs')),
  ('Q085', '[Placeholder G-AF-2] Team members know what decisions they can make independently.',   127, 'G', 'scored_radio', true, 'Authority Framework', false, 'team', 0.07, (select id from dimensions where slug='drs')),
  ('Q086', '[Placeholder G-AF-3] I have documented escalation paths for key decision types.',      128, 'G', 'scored_radio', true, 'Authority Framework', false, 'team', 0.07, (select id from dimensions where slug='drs'));

-- ============================================================
-- SECTION G — SOLO PROFILE (SDQ1–3, SHR1–4, SSM1–3, orders 129–138)
-- SDQ: Transfer Readiness — weight 0.25 ÷ 3 ≈ 0.08
-- SHR: Hiring Readiness   — weight 0.25 ÷ 4 = 0.06
-- SSM: Systems Mindset    — weight 0.20 ÷ 3 ≈ 0.07
-- ============================================================
insert into questions
  (question_key, question_text, question_order, section, answer_type,
   is_scored, drs_category, reverse_scored, applies_to_profile, weight, dimension_id)
values
  -- Transfer Readiness (solo only)
  ('SDQ1', '[Placeholder G-TR-1] I have documented the key steps for my most critical workflow.',   129, 'G', 'scored_radio', true, 'Transfer Readiness', false, 'solo', 0.08, (select id from dimensions where slug='drs')),
  ('SDQ2', '[Placeholder G-TR-2] I could hand off a core workflow to someone new within 30 days.',  130, 'G', 'scored_radio', true, 'Transfer Readiness', false, 'solo', 0.08, (select id from dimensions where slug='drs')),
  ('SDQ3', '[Placeholder G-TR-3] I have identified which workflows to transfer first.',             131, 'G', 'scored_radio', true, 'Transfer Readiness', false, 'solo', 0.08, (select id from dimensions where slug='drs')),
  -- Hiring Readiness (solo only)
  ('SHR1', '[Placeholder G-HR-1] I know exactly what role I need to hire first.',                  132, 'G', 'scored_radio', true, 'Hiring Readiness', false, 'solo', 0.06, (select id from dimensions where slug='drs')),
  ('SHR2', '[Placeholder G-HR-2] I have a budget or plan to bring on support within 90 days.',     133, 'G', 'scored_radio', true, 'Hiring Readiness', false, 'solo', 0.06, (select id from dimensions where slug='drs')),
  ('SHR3', '[Placeholder G-HR-3] I have hired or contracted help for my business before.',         134, 'G', 'scored_radio', true, 'Hiring Readiness', false, 'solo', 0.06, (select id from dimensions where slug='drs')),
  ('SHR4', '[Placeholder G-HR-4] I am confident I could onboard someone effectively.',             135, 'G', 'scored_radio', true, 'Hiring Readiness', false, 'solo', 0.06, (select id from dimensions where slug='drs')),
  -- Systems Mindset (solo only)
  ('SSM1', '[Placeholder G-SM-1] I default to building repeatable processes, not one-off fixes.',  136, 'G', 'scored_radio', true, 'Systems Mindset', false, 'solo', 0.07, (select id from dimensions where slug='drs')),
  ('SSM2', '[Placeholder G-SM-2] I document how I do things even when no one else will use it.',   137, 'G', 'scored_radio', true, 'Systems Mindset', false, 'solo', 0.07, (select id from dimensions where slug='drs')),
  ('SSM3', '[Placeholder G-SM-3] I see building systems as a core part of my role as owner.',     138, 'G', 'scored_radio', true, 'Systems Mindset', false, 'solo', 0.07, (select id from dimensions where slug='drs'));

-- ============================================================
-- SECTION H — Qualitative Close (Q087–Q090, orders 139–142)
-- None contribute to ODS, OQI, or DRS scores.
-- Q087: urgency 1–5 (is_scored=false; passed to LLM as context only)
-- Q088: goal selection (categorical)
-- Q089–Q090: open-ended text (passed to LLM)
-- ============================================================
insert into questions
  (question_key, question_text, question_order, section, answer_type, is_scored, dimension_id)
values
  ('Q087', '[Placeholder] How urgently do you feel you need to address your ownership debt? (1=not urgent, 5=critical)', 139, 'H', 'scored_radio',      false, null),
  ('Q088', '[Placeholder] What is your primary goal for the next 90 days?',                                               140, 'H', 'categorical_radio', false, null),
  ('Q089', '[Placeholder] What is the biggest thing holding you back from stepping out of the day-to-day?',               141, 'H', 'free_text',          false, null),
  ('Q090', '[Placeholder] What would it mean for your life if your business could run without you?',                      142, 'H', 'free_text',          false, null);

-- ============================================================
-- SCORE BANDS — commented out; already seeded by schema.sql.
-- Uncomment ONLY if running this file against a fresh DB that
-- did not execute schema.sql.
-- ============================================================
/*
insert into score_bands (dimension_id, min_score, max_score, label, color_hex) values
  ((select id from dimensions where slug='ods'),  0, 30,  'Optimized',    '#22c55e'),
  ((select id from dimensions where slug='ods'), 31, 50,  'Developing',   '#eab308'),
  ((select id from dimensions where slug='ods'), 51, 70,  'Elevated',     '#f97316'),
  ((select id from dimensions where slug='ods'), 71, 100, 'Critical',     '#ef4444'),
  ((select id from dimensions where slug='drs'),  0, 30,  'Not Ready',    '#ef4444'),
  ((select id from dimensions where slug='drs'), 31, 50,  'Developing',   '#f97316'),
  ((select id from dimensions where slug='drs'), 51, 70,  'Emerging',     '#eab308'),
  ((select id from dimensions where slug='drs'), 71, 100, 'Ready',        '#22c55e'),
  ((select id from dimensions where slug='oqi'),  0, 30,  'Undocumented', '#ef4444'),
  ((select id from dimensions where slug='oqi'), 31, 50,  'Fragile',      '#f97316'),
  ((select id from dimensions where slug='oqi'), 51, 70,  'Functional',   '#eab308'),
  ((select id from dimensions where slug='oqi'), 71, 100, 'Optimized',    '#22c55e');
*/
