-- ============================================================
-- QUESTION BANK SEED v2
-- Source: vai-question-bank.pdf, Version 1.2, June 2026
--
-- Run AFTER schema.sql AND migrations/001_add_response_options.sql
--
-- Uses UPDATE (not INSERT) — questions rows already exist from
-- seed-questions.sql. This replaces all placeholder text and
-- adds exact response_options from the live application.
--
-- Dollar-quoting ($json$...$json$) is used for jsonb values
-- to avoid apostrophe escaping issues.
-- Scored options use numeric values 0–4 (1st option = 0).
-- Categorical options use string slug values.
-- ============================================================

-- ============================================================
-- SECTION A — Business Profile
-- ============================================================

update questions set
  question_text   = 'What is your name?',
  response_options = null
where question_key = 'A001';

update questions set
  question_text   = 'What is your business or team name?',
  response_options = null
where question_key = 'A002';

update questions set
  question_text   = 'What is your primary business model?',
  response_options = $json$[
    {"value": "solo_agent",        "label": "Solo agent"},
    {"value": "team_lead_support", "label": "Team lead with support staff"},
    {"value": "team_lead_agents",  "label": "Team lead with buyer/listing agents"},
    {"value": "brokerage_owner",   "label": "Brokerage owner / team of teams"},
    {"value": "other",             "label": "Other"}
  ]$json$::jsonb
where question_key = 'A003';

update questions set
  question_text   = 'How many transactions did your team close in the last 12 months?',
  response_options = $json$[
    {"value": "under_25",    "label": "Fewer than 25"},
    {"value": "25_to_49",   "label": "25–49"},
    {"value": "50_to_99",   "label": "50–99"},
    {"value": "100_to_199", "label": "100–199"},
    {"value": "200_plus",   "label": "200 or more"}
  ]$json$::jsonb
where question_key = 'A004';

update questions set
  question_text   = 'What is your primary side focus?',
  response_options = $json$[
    {"value": "primarily_listings",    "label": "Primarily listings (seller-side)"},
    {"value": "primarily_buyer",       "label": "Primarily buyer-side"},
    {"value": "balanced",              "label": "Balanced — roughly equal buyer and seller"},
    {"value": "investment_commercial", "label": "Investment / commercial focus"},
    {"value": "other",                 "label": "Other"}
  ]$json$::jsonb
where question_key = 'A005';

update questions set
  question_text   = 'How many people are currently on your support team (TCs, LCs, coordinators, assistants)?',
  response_options = $json$[
    {"value": "just_me",   "label": "Just me"},
    {"value": "2_people",  "label": "2 people"},
    {"value": "3_to_4",   "label": "3–4 people"},
    {"value": "5_to_7",   "label": "5–7 people"},
    {"value": "8_plus",   "label": "8 or more"}
  ]$json$::jsonb
where question_key = 'A006';

-- ============================================================
-- SECTION B — Named Owners
-- ============================================================

update questions set
  question_text   = 'Who is the named owner of the Listing Launch workflow? (From signed listing agreement to active MLS)',
  response_options = $json$[
    {"value": "team_leader",         "label": "Team Leader (me)"},
    {"value": "tc",                  "label": "Transaction Coordinator (TC)"},
    {"value": "listing_coordinator", "label": "Listing Coordinator"},
    {"value": "operations_manager",  "label": "Operations Manager"},
    {"value": "shared",              "label": "Shared / No clear owner"}
  ]$json$::jsonb
where question_key = 'B001';

update questions set
  question_text   = 'Who is the named owner of the Seller Communication workflow? (Weekly updates, feedback, and price review prep)',
  response_options = $json$[
    {"value": "team_leader",         "label": "Team Leader (me)"},
    {"value": "tc",                  "label": "Transaction Coordinator (TC)"},
    {"value": "listing_coordinator", "label": "Listing Coordinator"},
    {"value": "operations_manager",  "label": "Operations Manager"},
    {"value": "shared",              "label": "Shared / No clear owner"}
  ]$json$::jsonb
where question_key = 'B002';

update questions set
  question_text   = 'Who is the named owner of the File Opening workflow? (From executed contract to critical date calendar)',
  response_options = $json$[
    {"value": "team_leader",         "label": "Team Leader (me)"},
    {"value": "tc",                  "label": "Transaction Coordinator (TC)"},
    {"value": "listing_coordinator", "label": "Listing Coordinator"},
    {"value": "operations_manager",  "label": "Operations Manager"},
    {"value": "shared",              "label": "Shared / No clear owner"}
  ]$json$::jsonb
where question_key = 'B003';

update questions set
  question_text   = 'Who is the named owner of the Lender Tracking workflow? (Appraisal, underwriting, CTC, and closing coordination)',
  response_options = $json$[
    {"value": "team_leader",         "label": "Team Leader (me)"},
    {"value": "tc",                  "label": "Transaction Coordinator (TC)"},
    {"value": "listing_coordinator", "label": "Listing Coordinator"},
    {"value": "operations_manager",  "label": "Operations Manager"},
    {"value": "shared",              "label": "Shared / No clear owner"}
  ]$json$::jsonb
where question_key = 'B004';

-- ============================================================
-- SECTIONS C–F — MODE B OQI (Q001–Q072)
-- 18 questions × 4 workflows. Options repeat per position
-- across workflows; question_text uses the specific workflow name.
-- Stored values: 0 (worst/least independent) → 4 (best/fully independent)
-- ============================================================

-- ── Shared option sets referenced across all 4 sections ──────
-- (Defined inline per question below for clarity)

-- ── SECTION C — Listing Launch (Q001–Q018) ───────────────────

update questions set
  question_text = 'Does your named owner have the authority to make decisions within the Listing Launch workflow without checking with you first?',
  response_options = $json$[
    {"value": 0, "label": "No — all decisions come to me first"},
    {"value": 1, "label": "They can handle obvious next steps, but judgment calls come to me"},
    {"value": 2, "label": "They can decide most routine items, but anything unusual requires my approval"},
    {"value": 3, "label": "Yes, with a few defined exceptions"},
    {"value": 4, "label": "Yes — full authority within the workflow"}
  ]$json$::jsonb
where question_key = 'Q001';

update questions set
  question_text = 'Can your named owner send final communications to clients, vendors, lenders, or title on Listing Launch matters without your review or approval?',
  response_options = $json$[
    {"value": 0, "label": "No — I review all final communications"},
    {"value": 1, "label": "Rarely"},
    {"value": 2, "label": "Sometimes"},
    {"value": 3, "label": "Usually"},
    {"value": 4, "label": "Yes — they send without my review"}
  ]$json$::jsonb
where question_key = 'Q002';

update questions set
  question_text = 'If your named owner makes a mistake on a Listing Launch decision, are they responsible for resolving it — or does it come back to you?',
  response_options = $json$[
    {"value": 0, "label": "It always comes back to me to resolve"},
    {"value": 1, "label": "Usually comes back to me"},
    {"value": 2, "label": "About half and half"},
    {"value": 3, "label": "Usually they handle it"},
    {"value": 4, "label": "They own the resolution fully"}
  ]$json$::jsonb
where question_key = 'Q003';

update questions set
  question_text = 'In the last 30 days, how often did your named owner make a Listing Launch decision and act on it without consulting you first?',
  response_options = $json$[
    {"value": 0, "label": "Never"},
    {"value": 1, "label": "Once or twice"},
    {"value": 2, "label": "Sometimes"},
    {"value": 3, "label": "Often"},
    {"value": 4, "label": "Consistently — they act independently"}
  ]$json$::jsonb
where question_key = 'Q004';

update questions set
  question_text = 'When something unexpected happens inside the Listing Launch workflow, who takes the first action?',
  response_options = $json$[
    {"value": 0, "label": "Always me"},
    {"value": 1, "label": "Usually me"},
    {"value": 2, "label": "About equally split between us"},
    {"value": 3, "label": "Usually them"},
    {"value": 4, "label": "Always them — they own the first response"}
  ]$json$::jsonb
where question_key = 'Q005';

update questions set
  question_text = 'When your named owner encounters a Listing Launch problem, do they typically bring you a recommended solution or ask you what to do?',
  response_options = $json$[
    {"value": 0, "label": "They bring me the problem and ask me what to do"},
    {"value": 1, "label": "Occasionally bring a suggestion but mostly wait for direction"},
    {"value": 2, "label": "Sometimes bring a recommendation, sometimes ask"},
    {"value": 3, "label": "Usually bring a recommended solution"},
    {"value": 4, "label": "Always bring a solution — I just approve or adjust"}
  ]$json$::jsonb
where question_key = 'Q006';

update questions set
  question_text = 'Is there a current, documented SOP for the Listing Launch workflow that your named owner follows step by step?',
  response_options = $json$[
    {"value": 0, "label": "No SOP exists for this workflow"},
    {"value": 1, "label": "Something written but it's outdated or incomplete"},
    {"value": 2, "label": "An SOP exists but it's not consistently followed"},
    {"value": 3, "label": "A current SOP exists and is mostly followed"},
    {"value": 4, "label": "A current, complete SOP is followed consistently"}
  ]$json$::jsonb
where question_key = 'Q007';

update questions set
  question_text = 'Are the routine communications inside Listing Launch — client updates, confirmations, reminders — templated so your named owner doesn''t write them from scratch?',
  response_options = $json$[
    {"value": 0, "label": "No templates — all communications are written from scratch"},
    {"value": 1, "label": "A few templates but most communications are improvised"},
    {"value": 2, "label": "Some templates, partial coverage"},
    {"value": 3, "label": "Most communications are templated"},
    {"value": 4, "label": "All routine communications are fully templated"}
  ]$json$::jsonb
where question_key = 'Q008';

update questions set
  question_text = 'If your named owner hits an unusual situation inside Listing Launch, do they have documentation or a decision guide — or do they call you?',
  response_options = $json$[
    {"value": 0, "label": "They always call me when something unusual happens"},
    {"value": 1, "label": "Usually call me for anything outside the routine"},
    {"value": 2, "label": "Sometimes have guidance, sometimes need me"},
    {"value": 3, "label": "Usually have documentation to reference"},
    {"value": 4, "label": "Full decision guide exists — they rarely need me"}
  ]$json$::jsonb
where question_key = 'Q009';

update questions set
  question_text = 'Does your named owner know exactly which Listing Launch situations they should handle independently versus bring to you?',
  response_options = $json$[
    {"value": 0, "label": "No — nothing is defined"},
    {"value": 1, "label": "Vague general understanding, nothing documented"},
    {"value": 2, "label": "Some situations are clear, many are gray areas"},
    {"value": 3, "label": "Most situations are clear, a few edge cases remain"},
    {"value": 4, "label": "Yes — fully documented and understood"}
  ]$json$::jsonb
where question_key = 'Q010';

update questions set
  question_text = 'In the last 60 days, did your named owner escalate a Listing Launch issue to you that they should have handled within their own authority?',
  response_options = $json$[
    {"value": 0, "label": "Constantly"},
    {"value": 1, "label": "Often"},
    {"value": 2, "label": "Sometimes"},
    {"value": 3, "label": "Rarely"},
    {"value": 4, "label": "Never — they handle what's within their authority"}
  ]$json$::jsonb
where question_key = 'Q011';

update questions set
  question_text = 'If your named owner were out for a full day, is there a backup person who knows the Listing Launch escalation thresholds well enough to keep it moving?',
  response_options = $json$[
    {"value": 0, "label": "No backup exists at all"},
    {"value": 1, "label": "A backup exists but has no idea where the thresholds are"},
    {"value": 2, "label": "Backup knows the basics but not the edge cases"},
    {"value": 3, "label": "Backup is reasonably capable"},
    {"value": 4, "label": "Backup is fully capable of maintaining continuity"}
  ]$json$::jsonb
where question_key = 'Q012';

update questions set
  question_text = 'When something goes wrong inside Listing Launch — a missed deadline, a client issue, a dropped step — who is accountable to you for the outcome?',
  response_options = $json$[
    {"value": 0, "label": "I'm still accountable — it always comes back to me"},
    {"value": 1, "label": "Mostly me but they feel some responsibility"},
    {"value": 2, "label": "Shared accountability"},
    {"value": 3, "label": "Mostly them — I'm a backstop"},
    {"value": 4, "label": "Fully them — they own outcomes"}
  ]$json$::jsonb
where question_key = 'Q013';

update questions set
  question_text = 'Does your named owner have a clear, measurable standard they''re held to for Listing Launch results — not just ''did you do the steps'' but ''did it go well''?',
  response_options = $json$[
    {"value": 0, "label": "No — no standards exist"},
    {"value": 1, "label": "Vague expectations, nothing measurable"},
    {"value": 2, "label": "Some standards exist but aren't consistently reviewed"},
    {"value": 3, "label": "Clear standards exist and are periodically reviewed"},
    {"value": 4, "label": "Clear, measurable standards reviewed regularly"}
  ]$json$::jsonb
where question_key = 'Q014';

update questions set
  question_text = 'If your named owner consistently underperforms on Listing Launch, is there a documented structure for coaching, correction, or responsibility reassignment?',
  response_options = $json$[
    {"value": 0, "label": "No — no accountability structure exists"},
    {"value": 1, "label": "Informal"},
    {"value": 2, "label": "Some accountability structure but not consistently applied"},
    {"value": 3, "label": "A documented structure exists and is mostly followed"},
    {"value": 4, "label": "Fully documented and consistently applied"}
  ]$json$::jsonb
where question_key = 'Q015';

update questions set
  question_text = 'How confident are you that your named owner has the skills and knowledge to run Listing Launch reliably without your involvement?',
  response_options = $json$[
    {"value": 0, "label": "Not confident"},
    {"value": 1, "label": "Low confidence"},
    {"value": 2, "label": "Moderate confidence"},
    {"value": 3, "label": "High confidence"},
    {"value": 4, "label": "Fully confident — they run it better than I would"}
  ]$json$::jsonb
where question_key = 'Q016';

update questions set
  question_text = 'Based on your named owner''s behavior — not just their words — how confident do they seem in managing Listing Launch independently?',
  response_options = $json$[
    {"value": 0, "label": "Clearly not confident — they seem uncertain or anxious"},
    {"value": 1, "label": "Low self-confidence"},
    {"value": 2, "label": "Moderate — capable but still defers frequently"},
    {"value": 3, "label": "High self-confidence"},
    {"value": 4, "label": "Fully confident — they own it without hesitation"}
  ]$json$::jsonb
where question_key = 'Q017';

update questions set
  question_text = 'Has your named owner successfully managed Listing Launch independently, with outcomes at or above your standard, for at least 90 days?',
  response_options = $json$[
    {"value": 0, "label": "No — they haven't managed it independently"},
    {"value": 1, "label": "Less than 30 days independently"},
    {"value": 2, "label": "30–60 days with decent results"},
    {"value": 3, "label": "60–90 days with good results"},
    {"value": 4, "label": "90+ days consistently at or above standard"}
  ]$json$::jsonb
where question_key = 'Q018';

-- ── SECTION D — Seller Communication (Q019–Q036) ─────────────

update questions set
  question_text = 'Does your named owner have the authority to make decisions within the Seller Communication workflow without checking with you first?',
  response_options = $json$[
    {"value": 0, "label": "No — all decisions come to me first"},
    {"value": 1, "label": "They can handle obvious next steps, but judgment calls come to me"},
    {"value": 2, "label": "They can decide most routine items, but anything unusual requires my approval"},
    {"value": 3, "label": "Yes, with a few defined exceptions"},
    {"value": 4, "label": "Yes — full authority within the workflow"}
  ]$json$::jsonb
where question_key = 'Q019';

update questions set
  question_text = 'Can your named owner send final communications to clients, vendors, lenders, or title on Seller Communication matters without your review or approval?',
  response_options = $json$[
    {"value": 0, "label": "No — I review all final communications"},
    {"value": 1, "label": "Rarely"},
    {"value": 2, "label": "Sometimes"},
    {"value": 3, "label": "Usually"},
    {"value": 4, "label": "Yes — they send without my review"}
  ]$json$::jsonb
where question_key = 'Q020';

update questions set
  question_text = 'If your named owner makes a mistake on a Seller Communication decision, are they responsible for resolving it — or does it come back to you?',
  response_options = $json$[
    {"value": 0, "label": "It always comes back to me to resolve"},
    {"value": 1, "label": "Usually comes back to me"},
    {"value": 2, "label": "About half and half"},
    {"value": 3, "label": "Usually they handle it"},
    {"value": 4, "label": "They own the resolution fully"}
  ]$json$::jsonb
where question_key = 'Q021';

update questions set
  question_text = 'In the last 30 days, how often did your named owner make a Seller Communication decision and act on it without consulting you first?',
  response_options = $json$[
    {"value": 0, "label": "Never"},
    {"value": 1, "label": "Once or twice"},
    {"value": 2, "label": "Sometimes"},
    {"value": 3, "label": "Often"},
    {"value": 4, "label": "Consistently — they act independently"}
  ]$json$::jsonb
where question_key = 'Q022';

update questions set
  question_text = 'When something unexpected happens inside the Seller Communication workflow, who takes the first action?',
  response_options = $json$[
    {"value": 0, "label": "Always me"},
    {"value": 1, "label": "Usually me"},
    {"value": 2, "label": "About equally split between us"},
    {"value": 3, "label": "Usually them"},
    {"value": 4, "label": "Always them — they own the first response"}
  ]$json$::jsonb
where question_key = 'Q023';

update questions set
  question_text = 'When your named owner encounters a Seller Communication problem, do they typically bring you a recommended solution or ask you what to do?',
  response_options = $json$[
    {"value": 0, "label": "They bring me the problem and ask me what to do"},
    {"value": 1, "label": "Occasionally bring a suggestion but mostly wait for direction"},
    {"value": 2, "label": "Sometimes bring a recommendation, sometimes ask"},
    {"value": 3, "label": "Usually bring a recommended solution"},
    {"value": 4, "label": "Always bring a solution — I just approve or adjust"}
  ]$json$::jsonb
where question_key = 'Q024';

update questions set
  question_text = 'Is there a current, documented SOP for the Seller Communication workflow that your named owner follows step by step?',
  response_options = $json$[
    {"value": 0, "label": "No SOP exists for this workflow"},
    {"value": 1, "label": "Something written but it's outdated or incomplete"},
    {"value": 2, "label": "An SOP exists but it's not consistently followed"},
    {"value": 3, "label": "A current SOP exists and is mostly followed"},
    {"value": 4, "label": "A current, complete SOP is followed consistently"}
  ]$json$::jsonb
where question_key = 'Q025';

update questions set
  question_text = 'Are the routine communications inside Seller Communication — client updates, confirmations, reminders — templated so your named owner doesn''t write them from scratch?',
  response_options = $json$[
    {"value": 0, "label": "No templates — all communications are written from scratch"},
    {"value": 1, "label": "A few templates but most communications are improvised"},
    {"value": 2, "label": "Some templates, partial coverage"},
    {"value": 3, "label": "Most communications are templated"},
    {"value": 4, "label": "All routine communications are fully templated"}
  ]$json$::jsonb
where question_key = 'Q026';

update questions set
  question_text = 'If your named owner hits an unusual situation inside Seller Communication, do they have documentation or a decision guide — or do they call you?',
  response_options = $json$[
    {"value": 0, "label": "They always call me when something unusual happens"},
    {"value": 1, "label": "Usually call me for anything outside the routine"},
    {"value": 2, "label": "Sometimes have guidance, sometimes need me"},
    {"value": 3, "label": "Usually have documentation to reference"},
    {"value": 4, "label": "Full decision guide exists — they rarely need me"}
  ]$json$::jsonb
where question_key = 'Q027';

update questions set
  question_text = 'Does your named owner know exactly which Seller Communication situations they should handle independently versus bring to you?',
  response_options = $json$[
    {"value": 0, "label": "No — nothing is defined"},
    {"value": 1, "label": "Vague general understanding, nothing documented"},
    {"value": 2, "label": "Some situations are clear, many are gray areas"},
    {"value": 3, "label": "Most situations are clear, a few edge cases remain"},
    {"value": 4, "label": "Yes — fully documented and understood"}
  ]$json$::jsonb
where question_key = 'Q028';

update questions set
  question_text = 'In the last 60 days, did your named owner escalate a Seller Communication issue to you that they should have handled within their own authority?',
  response_options = $json$[
    {"value": 0, "label": "Constantly"},
    {"value": 1, "label": "Often"},
    {"value": 2, "label": "Sometimes"},
    {"value": 3, "label": "Rarely"},
    {"value": 4, "label": "Never — they handle what's within their authority"}
  ]$json$::jsonb
where question_key = 'Q029';

update questions set
  question_text = 'If your named owner were out for a full day, is there a backup person who knows the Seller Communication escalation thresholds well enough to keep it moving?',
  response_options = $json$[
    {"value": 0, "label": "No backup exists at all"},
    {"value": 1, "label": "A backup exists but has no idea where the thresholds are"},
    {"value": 2, "label": "Backup knows the basics but not the edge cases"},
    {"value": 3, "label": "Backup is reasonably capable"},
    {"value": 4, "label": "Backup is fully capable of maintaining continuity"}
  ]$json$::jsonb
where question_key = 'Q030';

update questions set
  question_text = 'When something goes wrong inside Seller Communication — a missed deadline, a client issue, a dropped step — who is accountable to you for the outcome?',
  response_options = $json$[
    {"value": 0, "label": "I'm still accountable — it always comes back to me"},
    {"value": 1, "label": "Mostly me but they feel some responsibility"},
    {"value": 2, "label": "Shared accountability"},
    {"value": 3, "label": "Mostly them — I'm a backstop"},
    {"value": 4, "label": "Fully them — they own outcomes"}
  ]$json$::jsonb
where question_key = 'Q031';

update questions set
  question_text = 'Does your named owner have a clear, measurable standard they''re held to for Seller Communication results — not just ''did you do the steps'' but ''did it go well''?',
  response_options = $json$[
    {"value": 0, "label": "No — no standards exist"},
    {"value": 1, "label": "Vague expectations, nothing measurable"},
    {"value": 2, "label": "Some standards exist but aren't consistently reviewed"},
    {"value": 3, "label": "Clear standards exist and are periodically reviewed"},
    {"value": 4, "label": "Clear, measurable standards reviewed regularly"}
  ]$json$::jsonb
where question_key = 'Q032';

update questions set
  question_text = 'If your named owner consistently underperforms on Seller Communication, is there a documented structure for coaching, correction, or responsibility reassignment?',
  response_options = $json$[
    {"value": 0, "label": "No — no accountability structure exists"},
    {"value": 1, "label": "Informal"},
    {"value": 2, "label": "Some accountability structure but not consistently applied"},
    {"value": 3, "label": "A documented structure exists and is mostly followed"},
    {"value": 4, "label": "Fully documented and consistently applied"}
  ]$json$::jsonb
where question_key = 'Q033';

update questions set
  question_text = 'How confident are you that your named owner has the skills and knowledge to run Seller Communication reliably without your involvement?',
  response_options = $json$[
    {"value": 0, "label": "Not confident"},
    {"value": 1, "label": "Low confidence"},
    {"value": 2, "label": "Moderate confidence"},
    {"value": 3, "label": "High confidence"},
    {"value": 4, "label": "Fully confident — they run it better than I would"}
  ]$json$::jsonb
where question_key = 'Q034';

update questions set
  question_text = 'Based on your named owner''s behavior — not just their words — how confident do they seem in managing Seller Communication independently?',
  response_options = $json$[
    {"value": 0, "label": "Clearly not confident — they seem uncertain or anxious"},
    {"value": 1, "label": "Low self-confidence"},
    {"value": 2, "label": "Moderate — capable but still defers frequently"},
    {"value": 3, "label": "High self-confidence"},
    {"value": 4, "label": "Fully confident — they own it without hesitation"}
  ]$json$::jsonb
where question_key = 'Q035';

update questions set
  question_text = 'Has your named owner successfully managed Seller Communication independently, with outcomes at or above your standard, for at least 90 days?',
  response_options = $json$[
    {"value": 0, "label": "No — they haven't managed it independently"},
    {"value": 1, "label": "Less than 30 days independently"},
    {"value": 2, "label": "30–60 days with decent results"},
    {"value": 3, "label": "60–90 days with good results"},
    {"value": 4, "label": "90+ days consistently at or above standard"}
  ]$json$::jsonb
where question_key = 'Q036';

-- ── SECTION E — File Opening (Q037–Q054) ─────────────────────

update questions set
  question_text = 'Does your named owner have the authority to make decisions within the File Opening workflow without checking with you first?',
  response_options = $json$[
    {"value": 0, "label": "No — all decisions come to me first"},
    {"value": 1, "label": "They can handle obvious next steps, but judgment calls come to me"},
    {"value": 2, "label": "They can decide most routine items, but anything unusual requires my approval"},
    {"value": 3, "label": "Yes, with a few defined exceptions"},
    {"value": 4, "label": "Yes — full authority within the workflow"}
  ]$json$::jsonb
where question_key = 'Q037';

update questions set
  question_text = 'Can your named owner send final communications to clients, vendors, lenders, or title on File Opening matters without your review or approval?',
  response_options = $json$[
    {"value": 0, "label": "No — I review all final communications"},
    {"value": 1, "label": "Rarely"},
    {"value": 2, "label": "Sometimes"},
    {"value": 3, "label": "Usually"},
    {"value": 4, "label": "Yes — they send without my review"}
  ]$json$::jsonb
where question_key = 'Q038';

update questions set
  question_text = 'If your named owner makes a mistake on a File Opening decision, are they responsible for resolving it — or does it come back to you?',
  response_options = $json$[
    {"value": 0, "label": "It always comes back to me to resolve"},
    {"value": 1, "label": "Usually comes back to me"},
    {"value": 2, "label": "About half and half"},
    {"value": 3, "label": "Usually they handle it"},
    {"value": 4, "label": "They own the resolution fully"}
  ]$json$::jsonb
where question_key = 'Q039';

update questions set
  question_text = 'In the last 30 days, how often did your named owner make a File Opening decision and act on it without consulting you first?',
  response_options = $json$[
    {"value": 0, "label": "Never"},
    {"value": 1, "label": "Once or twice"},
    {"value": 2, "label": "Sometimes"},
    {"value": 3, "label": "Often"},
    {"value": 4, "label": "Consistently — they act independently"}
  ]$json$::jsonb
where question_key = 'Q040';

update questions set
  question_text = 'When something unexpected happens inside the File Opening workflow, who takes the first action?',
  response_options = $json$[
    {"value": 0, "label": "Always me"},
    {"value": 1, "label": "Usually me"},
    {"value": 2, "label": "About equally split between us"},
    {"value": 3, "label": "Usually them"},
    {"value": 4, "label": "Always them — they own the first response"}
  ]$json$::jsonb
where question_key = 'Q041';

update questions set
  question_text = 'When your named owner encounters a File Opening problem, do they typically bring you a recommended solution or ask you what to do?',
  response_options = $json$[
    {"value": 0, "label": "They bring me the problem and ask me what to do"},
    {"value": 1, "label": "Occasionally bring a suggestion but mostly wait for direction"},
    {"value": 2, "label": "Sometimes bring a recommendation, sometimes ask"},
    {"value": 3, "label": "Usually bring a recommended solution"},
    {"value": 4, "label": "Always bring a solution — I just approve or adjust"}
  ]$json$::jsonb
where question_key = 'Q042';

update questions set
  question_text = 'Is there a current, documented SOP for the File Opening workflow that your named owner follows step by step?',
  response_options = $json$[
    {"value": 0, "label": "No SOP exists for this workflow"},
    {"value": 1, "label": "Something written but it's outdated or incomplete"},
    {"value": 2, "label": "An SOP exists but it's not consistently followed"},
    {"value": 3, "label": "A current SOP exists and is mostly followed"},
    {"value": 4, "label": "A current, complete SOP is followed consistently"}
  ]$json$::jsonb
where question_key = 'Q043';

update questions set
  question_text = 'Are the routine communications inside File Opening — client updates, confirmations, reminders — templated so your named owner doesn''t write them from scratch?',
  response_options = $json$[
    {"value": 0, "label": "No templates — all communications are written from scratch"},
    {"value": 1, "label": "A few templates but most communications are improvised"},
    {"value": 2, "label": "Some templates, partial coverage"},
    {"value": 3, "label": "Most communications are templated"},
    {"value": 4, "label": "All routine communications are fully templated"}
  ]$json$::jsonb
where question_key = 'Q044';

update questions set
  question_text = 'If your named owner hits an unusual situation inside File Opening, do they have documentation or a decision guide — or do they call you?',
  response_options = $json$[
    {"value": 0, "label": "They always call me when something unusual happens"},
    {"value": 1, "label": "Usually call me for anything outside the routine"},
    {"value": 2, "label": "Sometimes have guidance, sometimes need me"},
    {"value": 3, "label": "Usually have documentation to reference"},
    {"value": 4, "label": "Full decision guide exists — they rarely need me"}
  ]$json$::jsonb
where question_key = 'Q045';

update questions set
  question_text = 'Does your named owner know exactly which File Opening situations they should handle independently versus bring to you?',
  response_options = $json$[
    {"value": 0, "label": "No — nothing is defined"},
    {"value": 1, "label": "Vague general understanding, nothing documented"},
    {"value": 2, "label": "Some situations are clear, many are gray areas"},
    {"value": 3, "label": "Most situations are clear, a few edge cases remain"},
    {"value": 4, "label": "Yes — fully documented and understood"}
  ]$json$::jsonb
where question_key = 'Q046';

update questions set
  question_text = 'In the last 60 days, did your named owner escalate a File Opening issue to you that they should have handled within their own authority?',
  response_options = $json$[
    {"value": 0, "label": "Constantly"},
    {"value": 1, "label": "Often"},
    {"value": 2, "label": "Sometimes"},
    {"value": 3, "label": "Rarely"},
    {"value": 4, "label": "Never — they handle what's within their authority"}
  ]$json$::jsonb
where question_key = 'Q047';

update questions set
  question_text = 'If your named owner were out for a full day, is there a backup person who knows the File Opening escalation thresholds well enough to keep it moving?',
  response_options = $json$[
    {"value": 0, "label": "No backup exists at all"},
    {"value": 1, "label": "A backup exists but has no idea where the thresholds are"},
    {"value": 2, "label": "Backup knows the basics but not the edge cases"},
    {"value": 3, "label": "Backup is reasonably capable"},
    {"value": 4, "label": "Backup is fully capable of maintaining continuity"}
  ]$json$::jsonb
where question_key = 'Q048';

update questions set
  question_text = 'When something goes wrong inside File Opening — a missed deadline, a client issue, a dropped step — who is accountable to you for the outcome?',
  response_options = $json$[
    {"value": 0, "label": "I'm still accountable — it always comes back to me"},
    {"value": 1, "label": "Mostly me but they feel some responsibility"},
    {"value": 2, "label": "Shared accountability"},
    {"value": 3, "label": "Mostly them — I'm a backstop"},
    {"value": 4, "label": "Fully them — they own outcomes"}
  ]$json$::jsonb
where question_key = 'Q049';

update questions set
  question_text = 'Does your named owner have a clear, measurable standard they''re held to for File Opening results — not just ''did you do the steps'' but ''did it go well''?',
  response_options = $json$[
    {"value": 0, "label": "No — no standards exist"},
    {"value": 1, "label": "Vague expectations, nothing measurable"},
    {"value": 2, "label": "Some standards exist but aren't consistently reviewed"},
    {"value": 3, "label": "Clear standards exist and are periodically reviewed"},
    {"value": 4, "label": "Clear, measurable standards reviewed regularly"}
  ]$json$::jsonb
where question_key = 'Q050';

update questions set
  question_text = 'If your named owner consistently underperforms on File Opening, is there a documented structure for coaching, correction, or responsibility reassignment?',
  response_options = $json$[
    {"value": 0, "label": "No — no accountability structure exists"},
    {"value": 1, "label": "Informal"},
    {"value": 2, "label": "Some accountability structure but not consistently applied"},
    {"value": 3, "label": "A documented structure exists and is mostly followed"},
    {"value": 4, "label": "Fully documented and consistently applied"}
  ]$json$::jsonb
where question_key = 'Q051';

update questions set
  question_text = 'How confident are you that your named owner has the skills and knowledge to run File Opening reliably without your involvement?',
  response_options = $json$[
    {"value": 0, "label": "Not confident"},
    {"value": 1, "label": "Low confidence"},
    {"value": 2, "label": "Moderate confidence"},
    {"value": 3, "label": "High confidence"},
    {"value": 4, "label": "Fully confident — they run it better than I would"}
  ]$json$::jsonb
where question_key = 'Q052';

update questions set
  question_text = 'Based on your named owner''s behavior — not just their words — how confident do they seem in managing File Opening independently?',
  response_options = $json$[
    {"value": 0, "label": "Clearly not confident — they seem uncertain or anxious"},
    {"value": 1, "label": "Low self-confidence"},
    {"value": 2, "label": "Moderate — capable but still defers frequently"},
    {"value": 3, "label": "High self-confidence"},
    {"value": 4, "label": "Fully confident — they own it without hesitation"}
  ]$json$::jsonb
where question_key = 'Q053';

update questions set
  question_text = 'Has your named owner successfully managed File Opening independently, with outcomes at or above your standard, for at least 90 days?',
  response_options = $json$[
    {"value": 0, "label": "No — they haven't managed it independently"},
    {"value": 1, "label": "Less than 30 days independently"},
    {"value": 2, "label": "30–60 days with decent results"},
    {"value": 3, "label": "60–90 days with good results"},
    {"value": 4, "label": "90+ days consistently at or above standard"}
  ]$json$::jsonb
where question_key = 'Q054';

-- ── SECTION F — Lender Tracking (Q055–Q072) ──────────────────

update questions set
  question_text = 'Does your named owner have the authority to make decisions within the Lender Tracking workflow without checking with you first?',
  response_options = $json$[
    {"value": 0, "label": "No — all decisions come to me first"},
    {"value": 1, "label": "They can handle obvious next steps, but judgment calls come to me"},
    {"value": 2, "label": "They can decide most routine items, but anything unusual requires my approval"},
    {"value": 3, "label": "Yes, with a few defined exceptions"},
    {"value": 4, "label": "Yes — full authority within the workflow"}
  ]$json$::jsonb
where question_key = 'Q055';

update questions set
  question_text = 'Can your named owner send final communications to clients, vendors, lenders, or title on Lender Tracking matters without your review or approval?',
  response_options = $json$[
    {"value": 0, "label": "No — I review all final communications"},
    {"value": 1, "label": "Rarely"},
    {"value": 2, "label": "Sometimes"},
    {"value": 3, "label": "Usually"},
    {"value": 4, "label": "Yes — they send without my review"}
  ]$json$::jsonb
where question_key = 'Q056';

update questions set
  question_text = 'If your named owner makes a mistake on a Lender Tracking decision, are they responsible for resolving it — or does it come back to you?',
  response_options = $json$[
    {"value": 0, "label": "It always comes back to me to resolve"},
    {"value": 1, "label": "Usually comes back to me"},
    {"value": 2, "label": "About half and half"},
    {"value": 3, "label": "Usually they handle it"},
    {"value": 4, "label": "They own the resolution fully"}
  ]$json$::jsonb
where question_key = 'Q057';

update questions set
  question_text = 'In the last 30 days, how often did your named owner make a Lender Tracking decision and act on it without consulting you first?',
  response_options = $json$[
    {"value": 0, "label": "Never"},
    {"value": 1, "label": "Once or twice"},
    {"value": 2, "label": "Sometimes"},
    {"value": 3, "label": "Often"},
    {"value": 4, "label": "Consistently — they act independently"}
  ]$json$::jsonb
where question_key = 'Q058';

update questions set
  question_text = 'When something unexpected happens inside the Lender Tracking workflow, who takes the first action?',
  response_options = $json$[
    {"value": 0, "label": "Always me"},
    {"value": 1, "label": "Usually me"},
    {"value": 2, "label": "About equally split between us"},
    {"value": 3, "label": "Usually them"},
    {"value": 4, "label": "Always them — they own the first response"}
  ]$json$::jsonb
where question_key = 'Q059';

update questions set
  question_text = 'When your named owner encounters a Lender Tracking problem, do they typically bring you a recommended solution or ask you what to do?',
  response_options = $json$[
    {"value": 0, "label": "They bring me the problem and ask me what to do"},
    {"value": 1, "label": "Occasionally bring a suggestion but mostly wait for direction"},
    {"value": 2, "label": "Sometimes bring a recommendation, sometimes ask"},
    {"value": 3, "label": "Usually bring a recommended solution"},
    {"value": 4, "label": "Always bring a solution — I just approve or adjust"}
  ]$json$::jsonb
where question_key = 'Q060';

update questions set
  question_text = 'Is there a current, documented SOP for the Lender Tracking workflow that your named owner follows step by step?',
  response_options = $json$[
    {"value": 0, "label": "No SOP exists for this workflow"},
    {"value": 1, "label": "Something written but it's outdated or incomplete"},
    {"value": 2, "label": "An SOP exists but it's not consistently followed"},
    {"value": 3, "label": "A current SOP exists and is mostly followed"},
    {"value": 4, "label": "A current, complete SOP is followed consistently"}
  ]$json$::jsonb
where question_key = 'Q061';

update questions set
  question_text = 'Are the routine communications inside Lender Tracking — client updates, confirmations, reminders — templated so your named owner doesn''t write them from scratch?',
  response_options = $json$[
    {"value": 0, "label": "No templates — all communications are written from scratch"},
    {"value": 1, "label": "A few templates but most communications are improvised"},
    {"value": 2, "label": "Some templates, partial coverage"},
    {"value": 3, "label": "Most communications are templated"},
    {"value": 4, "label": "All routine communications are fully templated"}
  ]$json$::jsonb
where question_key = 'Q062';

update questions set
  question_text = 'If your named owner hits an unusual situation inside Lender Tracking, do they have documentation or a decision guide — or do they call you?',
  response_options = $json$[
    {"value": 0, "label": "They always call me when something unusual happens"},
    {"value": 1, "label": "Usually call me for anything outside the routine"},
    {"value": 2, "label": "Sometimes have guidance, sometimes need me"},
    {"value": 3, "label": "Usually have documentation to reference"},
    {"value": 4, "label": "Full decision guide exists — they rarely need me"}
  ]$json$::jsonb
where question_key = 'Q063';

update questions set
  question_text = 'Does your named owner know exactly which Lender Tracking situations they should handle independently versus bring to you?',
  response_options = $json$[
    {"value": 0, "label": "No — nothing is defined"},
    {"value": 1, "label": "Vague general understanding, nothing documented"},
    {"value": 2, "label": "Some situations are clear, many are gray areas"},
    {"value": 3, "label": "Most situations are clear, a few edge cases remain"},
    {"value": 4, "label": "Yes — fully documented and understood"}
  ]$json$::jsonb
where question_key = 'Q064';

update questions set
  question_text = 'In the last 60 days, did your named owner escalate a Lender Tracking issue to you that they should have handled within their own authority?',
  response_options = $json$[
    {"value": 0, "label": "Constantly"},
    {"value": 1, "label": "Often"},
    {"value": 2, "label": "Sometimes"},
    {"value": 3, "label": "Rarely"},
    {"value": 4, "label": "Never — they handle what's within their authority"}
  ]$json$::jsonb
where question_key = 'Q065';

update questions set
  question_text = 'If your named owner were out for a full day, is there a backup person who knows the Lender Tracking escalation thresholds well enough to keep it moving?',
  response_options = $json$[
    {"value": 0, "label": "No backup exists at all"},
    {"value": 1, "label": "A backup exists but has no idea where the thresholds are"},
    {"value": 2, "label": "Backup knows the basics but not the edge cases"},
    {"value": 3, "label": "Backup is reasonably capable"},
    {"value": 4, "label": "Backup is fully capable of maintaining continuity"}
  ]$json$::jsonb
where question_key = 'Q066';

update questions set
  question_text = 'When something goes wrong inside Lender Tracking — a missed deadline, a client issue, a dropped step — who is accountable to you for the outcome?',
  response_options = $json$[
    {"value": 0, "label": "I'm still accountable — it always comes back to me"},
    {"value": 1, "label": "Mostly me but they feel some responsibility"},
    {"value": 2, "label": "Shared accountability"},
    {"value": 3, "label": "Mostly them — I'm a backstop"},
    {"value": 4, "label": "Fully them — they own outcomes"}
  ]$json$::jsonb
where question_key = 'Q067';

update questions set
  question_text = 'Does your named owner have a clear, measurable standard they''re held to for Lender Tracking results — not just ''did you do the steps'' but ''did it go well''?',
  response_options = $json$[
    {"value": 0, "label": "No — no standards exist"},
    {"value": 1, "label": "Vague expectations, nothing measurable"},
    {"value": 2, "label": "Some standards exist but aren't consistently reviewed"},
    {"value": 3, "label": "Clear standards exist and are periodically reviewed"},
    {"value": 4, "label": "Clear, measurable standards reviewed regularly"}
  ]$json$::jsonb
where question_key = 'Q068';

update questions set
  question_text = 'If your named owner consistently underperforms on Lender Tracking, is there a documented structure for coaching, correction, or responsibility reassignment?',
  response_options = $json$[
    {"value": 0, "label": "No — no accountability structure exists"},
    {"value": 1, "label": "Informal"},
    {"value": 2, "label": "Some accountability structure but not consistently applied"},
    {"value": 3, "label": "A documented structure exists and is mostly followed"},
    {"value": 4, "label": "Fully documented and consistently applied"}
  ]$json$::jsonb
where question_key = 'Q069';

update questions set
  question_text = 'How confident are you that your named owner has the skills and knowledge to run Lender Tracking reliably without your involvement?',
  response_options = $json$[
    {"value": 0, "label": "Not confident"},
    {"value": 1, "label": "Low confidence"},
    {"value": 2, "label": "Moderate confidence"},
    {"value": 3, "label": "High confidence"},
    {"value": 4, "label": "Fully confident — they run it better than I would"}
  ]$json$::jsonb
where question_key = 'Q070';

update questions set
  question_text = 'Based on your named owner''s behavior — not just their words — how confident do they seem in managing Lender Tracking independently?',
  response_options = $json$[
    {"value": 0, "label": "Clearly not confident — they seem uncertain or anxious"},
    {"value": 1, "label": "Low self-confidence"},
    {"value": 2, "label": "Moderate — capable but still defers frequently"},
    {"value": 3, "label": "High self-confidence"},
    {"value": 4, "label": "Fully confident — they own it without hesitation"}
  ]$json$::jsonb
where question_key = 'Q071';

update questions set
  question_text = 'Has your named owner successfully managed Lender Tracking independently, with outcomes at or above your standard, for at least 90 days?',
  response_options = $json$[
    {"value": 0, "label": "No — they haven't managed it independently"},
    {"value": 1, "label": "Less than 30 days independently"},
    {"value": 2, "label": "30–60 days with decent results"},
    {"value": 3, "label": "60–90 days with good results"},
    {"value": 4, "label": "90+ days consistently at or above standard"}
  ]$json$::jsonb
where question_key = 'Q072';

-- ============================================================
-- SECTIONS C–F — MODE A (Transfer Barrier)
-- "undefined" replaced with the specific workflow name per key.
-- TBx1/TBx2: categorical_radio  TBx3: free_text  TBx4/TBx5: scored_radio
-- ============================================================

-- TBC1–TBC5 (Listing Launch)
update questions set
  question_text   = 'How many hours per week do you personally spend on Listing Launch tasks?',
  response_options = $json$[
    {"value": "under_1", "label": "Less than 1 hr"},
    {"value": "1_to_2",  "label": "1–2 hrs"},
    {"value": "2_to_4",  "label": "2–4 hrs"},
    {"value": "4_to_8",  "label": "4–8 hrs"},
    {"value": "over_8",  "label": "More than 8 hrs"}
  ]$json$::jsonb
where question_key = 'TBC1';

update questions set
  question_text   = 'What is the primary reason the Listing Launch workflow hasn''t transferred to someone else yet?',
  response_options = $json$[
    {"value": "no_skills",          "label": "No one on my team has the skills yet"},
    {"value": "not_documented",     "label": "I haven't documented how it works"},
    {"value": "keeps_coming_back",  "label": "I've tried to transfer it but it keeps coming back"},
    {"value": "not_ready",          "label": "I'm not sure I'm ready to let go of it"},
    {"value": "not_priority",       "label": "I haven't made it a priority yet"}
  ]$json$::jsonb
where question_key = 'TBC2';

update questions set
  question_text   = 'If you had to transfer the Listing Launch workflow in the next 90 days, what''s the biggest obstacle?',
  response_options = null
where question_key = 'TBC3';

update questions set
  question_text   = 'Does a documented process exist for the Listing Launch workflow that someone else could follow?',
  response_options = $json$[
    {"value": 0, "label": "No documentation at all"},
    {"value": 1, "label": "Some notes but not a real SOP"},
    {"value": 2, "label": "A partial SOP exists"},
    {"value": 3, "label": "A mostly complete SOP exists"},
    {"value": 4, "label": "Yes — a full SOP exists and is current"}
  ]$json$::jsonb
where question_key = 'TBC4';

update questions set
  question_text   = 'Is there someone on your team right now who could own the Listing Launch workflow with the right training and authority?',
  response_options = $json$[
    {"value": 0, "label": "No — I'd need to hire someone"},
    {"value": 1, "label": "Maybe, but they're not close"},
    {"value": 2, "label": "Possibly with significant training"},
    {"value": 3, "label": "Yes, with some preparation"},
    {"value": 4, "label": "Yes — they're ready now, I just haven't transferred it"}
  ]$json$::jsonb
where question_key = 'TBC5';

-- TBD1–TBD5 (Seller Communication)
update questions set
  question_text   = 'How many hours per week do you personally spend on Seller Communication tasks?',
  response_options = $json$[
    {"value": "under_1", "label": "Less than 1 hr"},
    {"value": "1_to_2",  "label": "1–2 hrs"},
    {"value": "2_to_4",  "label": "2–4 hrs"},
    {"value": "4_to_8",  "label": "4–8 hrs"},
    {"value": "over_8",  "label": "More than 8 hrs"}
  ]$json$::jsonb
where question_key = 'TBD1';

update questions set
  question_text   = 'What is the primary reason the Seller Communication workflow hasn''t transferred to someone else yet?',
  response_options = $json$[
    {"value": "no_skills",         "label": "No one on my team has the skills yet"},
    {"value": "not_documented",    "label": "I haven't documented how it works"},
    {"value": "keeps_coming_back", "label": "I've tried to transfer it but it keeps coming back"},
    {"value": "not_ready",         "label": "I'm not sure I'm ready to let go of it"},
    {"value": "not_priority",      "label": "I haven't made it a priority yet"}
  ]$json$::jsonb
where question_key = 'TBD2';

update questions set
  question_text   = 'If you had to transfer the Seller Communication workflow in the next 90 days, what''s the biggest obstacle?',
  response_options = null
where question_key = 'TBD3';

update questions set
  question_text   = 'Does a documented process exist for the Seller Communication workflow that someone else could follow?',
  response_options = $json$[
    {"value": 0, "label": "No documentation at all"},
    {"value": 1, "label": "Some notes but not a real SOP"},
    {"value": 2, "label": "A partial SOP exists"},
    {"value": 3, "label": "A mostly complete SOP exists"},
    {"value": 4, "label": "Yes — a full SOP exists and is current"}
  ]$json$::jsonb
where question_key = 'TBD4';

update questions set
  question_text   = 'Is there someone on your team right now who could own the Seller Communication workflow with the right training and authority?',
  response_options = $json$[
    {"value": 0, "label": "No — I'd need to hire someone"},
    {"value": 1, "label": "Maybe, but they're not close"},
    {"value": 2, "label": "Possibly with significant training"},
    {"value": 3, "label": "Yes, with some preparation"},
    {"value": 4, "label": "Yes — they're ready now, I just haven't transferred it"}
  ]$json$::jsonb
where question_key = 'TBD5';

-- TBE1–TBE5 (File Opening)
update questions set
  question_text   = 'How many hours per week do you personally spend on File Opening tasks?',
  response_options = $json$[
    {"value": "under_1", "label": "Less than 1 hr"},
    {"value": "1_to_2",  "label": "1–2 hrs"},
    {"value": "2_to_4",  "label": "2–4 hrs"},
    {"value": "4_to_8",  "label": "4–8 hrs"},
    {"value": "over_8",  "label": "More than 8 hrs"}
  ]$json$::jsonb
where question_key = 'TBE1';

update questions set
  question_text   = 'What is the primary reason the File Opening workflow hasn''t transferred to someone else yet?',
  response_options = $json$[
    {"value": "no_skills",         "label": "No one on my team has the skills yet"},
    {"value": "not_documented",    "label": "I haven't documented how it works"},
    {"value": "keeps_coming_back", "label": "I've tried to transfer it but it keeps coming back"},
    {"value": "not_ready",         "label": "I'm not sure I'm ready to let go of it"},
    {"value": "not_priority",      "label": "I haven't made it a priority yet"}
  ]$json$::jsonb
where question_key = 'TBE2';

update questions set
  question_text   = 'If you had to transfer the File Opening workflow in the next 90 days, what''s the biggest obstacle?',
  response_options = null
where question_key = 'TBE3';

update questions set
  question_text   = 'Does a documented process exist for the File Opening workflow that someone else could follow?',
  response_options = $json$[
    {"value": 0, "label": "No documentation at all"},
    {"value": 1, "label": "Some notes but not a real SOP"},
    {"value": 2, "label": "A partial SOP exists"},
    {"value": 3, "label": "A mostly complete SOP exists"},
    {"value": 4, "label": "Yes — a full SOP exists and is current"}
  ]$json$::jsonb
where question_key = 'TBE4';

update questions set
  question_text   = 'Is there someone on your team right now who could own the File Opening workflow with the right training and authority?',
  response_options = $json$[
    {"value": 0, "label": "No — I'd need to hire someone"},
    {"value": 1, "label": "Maybe, but they're not close"},
    {"value": 2, "label": "Possibly with significant training"},
    {"value": 3, "label": "Yes, with some preparation"},
    {"value": 4, "label": "Yes — they're ready now, I just haven't transferred it"}
  ]$json$::jsonb
where question_key = 'TBE5';

-- TBF1–TBF5 (Lender Tracking)
update questions set
  question_text   = 'How many hours per week do you personally spend on Lender Tracking tasks?',
  response_options = $json$[
    {"value": "under_1", "label": "Less than 1 hr"},
    {"value": "1_to_2",  "label": "1–2 hrs"},
    {"value": "2_to_4",  "label": "2–4 hrs"},
    {"value": "4_to_8",  "label": "4–8 hrs"},
    {"value": "over_8",  "label": "More than 8 hrs"}
  ]$json$::jsonb
where question_key = 'TBF1';

update questions set
  question_text   = 'What is the primary reason the Lender Tracking workflow hasn''t transferred to someone else yet?',
  response_options = $json$[
    {"value": "no_skills",         "label": "No one on my team has the skills yet"},
    {"value": "not_documented",    "label": "I haven't documented how it works"},
    {"value": "keeps_coming_back", "label": "I've tried to transfer it but it keeps coming back"},
    {"value": "not_ready",         "label": "I'm not sure I'm ready to let go of it"},
    {"value": "not_priority",      "label": "I haven't made it a priority yet"}
  ]$json$::jsonb
where question_key = 'TBF2';

update questions set
  question_text   = 'If you had to transfer the Lender Tracking workflow in the next 90 days, what''s the biggest obstacle?',
  response_options = null
where question_key = 'TBF3';

update questions set
  question_text   = 'Does a documented process exist for the Lender Tracking workflow that someone else could follow?',
  response_options = $json$[
    {"value": 0, "label": "No documentation at all"},
    {"value": 1, "label": "Some notes but not a real SOP"},
    {"value": 2, "label": "A partial SOP exists"},
    {"value": 3, "label": "A mostly complete SOP exists"},
    {"value": 4, "label": "Yes — a full SOP exists and is current"}
  ]$json$::jsonb
where question_key = 'TBF4';

update questions set
  question_text   = 'Is there someone on your team right now who could own the Lender Tracking workflow with the right training and authority?',
  response_options = $json$[
    {"value": 0, "label": "No — I'd need to hire someone"},
    {"value": 1, "label": "Maybe, but they're not close"},
    {"value": 2, "label": "Possibly with significant training"},
    {"value": 3, "label": "Yes, with some preparation"},
    {"value": 4, "label": "Yes — they're ready now, I just haven't transferred it"}
  ]$json$::jsonb
where question_key = 'TBF5';

-- ============================================================
-- SECTIONS C–F — MODE C (Role Clarity)
-- RCx1: categorical  RCx2: scored (capacity)  RCx3: scored (fallthrough)
-- RCx3 rc3≥3 triggers +12.5 ODS penalty — "Often" and "Constantly" = values 3,4
-- ============================================================

-- Listing Launch (RCC)
update questions set
  question_text   = 'Why doesn''t the Listing Launch workflow have a single named owner?',
  response_options = $json$[
    {"value": "between_roles",     "label": "It genuinely falls between roles"},
    {"value": "never_assigned",    "label": "We've never assigned it formally"},
    {"value": "tried_and_failed",  "label": "We tried but the person didn't stick"},
    {"value": "not_sure",          "label": "I'm not sure who should own it"},
    {"value": "whoever_has_time",  "label": "It defaults to whoever has time"}
  ]$json$::jsonb
where question_key = 'RCC1';

update questions set
  question_text   = 'Is anyone on your team capable of owning the Listing Launch workflow if it were formally assigned to them?',
  response_options = $json$[
    {"value": 0, "label": "No"},
    {"value": 1, "label": "Possibly with help"},
    {"value": 2, "label": "Yes, with training"},
    {"value": 3, "label": "Yes, with authority documentation"},
    {"value": 4, "label": "Yes — it just hasn't been assigned"}
  ]$json$::jsonb
where question_key = 'RCC2';

update questions set
  question_text   = 'How often does something fall through the cracks in the Listing Launch workflow because of unclear ownership?',
  response_options = $json$[
    {"value": 0, "label": "Never"},
    {"value": 1, "label": "Rarely"},
    {"value": 2, "label": "Sometimes"},
    {"value": 3, "label": "Often"},
    {"value": 4, "label": "Constantly"}
  ]$json$::jsonb
where question_key = 'RCC3';

-- Seller Communication (RCD)
update questions set
  question_text   = 'Why doesn''t the Seller Communication workflow have a single named owner?',
  response_options = $json$[
    {"value": "between_roles",     "label": "It genuinely falls between roles"},
    {"value": "never_assigned",    "label": "We've never assigned it formally"},
    {"value": "tried_and_failed",  "label": "We tried but the person didn't stick"},
    {"value": "not_sure",          "label": "I'm not sure who should own it"},
    {"value": "whoever_has_time",  "label": "It defaults to whoever has time"}
  ]$json$::jsonb
where question_key = 'RCD1';

update questions set
  question_text   = 'Is anyone on your team capable of owning the Seller Communication workflow if it were formally assigned to them?',
  response_options = $json$[
    {"value": 0, "label": "No"},
    {"value": 1, "label": "Possibly with help"},
    {"value": 2, "label": "Yes, with training"},
    {"value": 3, "label": "Yes, with authority documentation"},
    {"value": 4, "label": "Yes — it just hasn't been assigned"}
  ]$json$::jsonb
where question_key = 'RCD2';

update questions set
  question_text   = 'How often does something fall through the cracks in the Seller Communication workflow because of unclear ownership?',
  response_options = $json$[
    {"value": 0, "label": "Never"},
    {"value": 1, "label": "Rarely"},
    {"value": 2, "label": "Sometimes"},
    {"value": 3, "label": "Often"},
    {"value": 4, "label": "Constantly"}
  ]$json$::jsonb
where question_key = 'RCD3';

-- File Opening (RCE)
update questions set
  question_text   = 'Why doesn''t the File Opening workflow have a single named owner?',
  response_options = $json$[
    {"value": "between_roles",     "label": "It genuinely falls between roles"},
    {"value": "never_assigned",    "label": "We've never assigned it formally"},
    {"value": "tried_and_failed",  "label": "We tried but the person didn't stick"},
    {"value": "not_sure",          "label": "I'm not sure who should own it"},
    {"value": "whoever_has_time",  "label": "It defaults to whoever has time"}
  ]$json$::jsonb
where question_key = 'RCE1';

update questions set
  question_text   = 'Is anyone on your team capable of owning the File Opening workflow if it were formally assigned to them?',
  response_options = $json$[
    {"value": 0, "label": "No"},
    {"value": 1, "label": "Possibly with help"},
    {"value": 2, "label": "Yes, with training"},
    {"value": 3, "label": "Yes, with authority documentation"},
    {"value": 4, "label": "Yes — it just hasn't been assigned"}
  ]$json$::jsonb
where question_key = 'RCE2';

update questions set
  question_text   = 'How often does something fall through the cracks in the File Opening workflow because of unclear ownership?',
  response_options = $json$[
    {"value": 0, "label": "Never"},
    {"value": 1, "label": "Rarely"},
    {"value": 2, "label": "Sometimes"},
    {"value": 3, "label": "Often"},
    {"value": 4, "label": "Constantly"}
  ]$json$::jsonb
where question_key = 'RCE3';

-- Lender Tracking (RCF)
update questions set
  question_text   = 'Why doesn''t the Lender Tracking workflow have a single named owner?',
  response_options = $json$[
    {"value": "between_roles",     "label": "It genuinely falls between roles"},
    {"value": "never_assigned",    "label": "We've never assigned it formally"},
    {"value": "tried_and_failed",  "label": "We tried but the person didn't stick"},
    {"value": "not_sure",          "label": "I'm not sure who should own it"},
    {"value": "whoever_has_time",  "label": "It defaults to whoever has time"}
  ]$json$::jsonb
where question_key = 'RCF1';

update questions set
  question_text   = 'Is anyone on your team capable of owning the Lender Tracking workflow if it were formally assigned to them?',
  response_options = $json$[
    {"value": 0, "label": "No"},
    {"value": 1, "label": "Possibly with help"},
    {"value": 2, "label": "Yes, with training"},
    {"value": 3, "label": "Yes, with authority documentation"},
    {"value": 4, "label": "Yes — it just hasn't been assigned"}
  ]$json$::jsonb
where question_key = 'RCF2';

update questions set
  question_text   = 'How often does something fall through the cracks in the Lender Tracking workflow because of unclear ownership?',
  response_options = $json$[
    {"value": 0, "label": "Never"},
    {"value": 1, "label": "Rarely"},
    {"value": 2, "label": "Sometimes"},
    {"value": 3, "label": "Often"},
    {"value": 4, "label": "Constantly"}
  ]$json$::jsonb
where question_key = 'RCF3';

-- ============================================================
-- SECTION G — TEAM PROFILE (Q073–Q086)
-- ============================================================

update questions set
  question_text   = 'Are you willing to let a team member be fully accountable for a workflow outcome — including owning the fix when something goes wrong — without stepping in yourself?',
  response_options = $json$[
    {"value": 0, "label": "No — I always need to be involved when things go wrong"},
    {"value": 1, "label": "Rarely — it's hard for me to stay out"},
    {"value": 2, "label": "Sometimes — depends on the situation"},
    {"value": 3, "label": "Usually — I can hold back in most cases"},
    {"value": 4, "label": "Yes — I let them own it fully, including the fix"}
  ]$json$::jsonb
where question_key = 'Q073';

update questions set
  question_text   = 'In the last 90 days, have you voluntarily moved any responsibility off your plate to a team member and kept it there without taking it back?',
  response_options = $json$[
    {"value": 0, "label": "No — nothing has moved off my plate"},
    {"value": 1, "label": "I tried but ended up taking it back"},
    {"value": 2, "label": "Yes, one or two things, but I still check in frequently"},
    {"value": 3, "label": "Yes, several things, with occasional check-ins"},
    {"value": 4, "label": "Yes — multiple responsibilities moved and staying moved"}
  ]$json$::jsonb
where question_key = 'Q074';

update questions set
  question_text   = 'When a team member handles something differently than you would — but the outcome is still good — how do you typically respond?',
  response_options = $json$[
    {"value": 0, "label": "I correct them and show them the right way"},
    {"value": 1, "label": "I usually say something even if the result was fine"},
    {"value": 2, "label": "I notice it but try to let it go"},
    {"value": 3, "label": "I usually let it go if the outcome was good"},
    {"value": 4, "label": "I celebrate it — different approaches are fine if outcomes are met"}
  ]$json$::jsonb
where question_key = 'Q075';

update questions set
  question_text   = 'How much of your reluctance to delegate is about the other person''s readiness versus your own comfort with releasing control?',
  response_options = $json$[
    {"value": 0, "label": "Almost entirely about their readiness — they're not ready"},
    {"value": 1, "label": "Mostly about their readiness, some about me"},
    {"value": 2, "label": "About equal — both factors are real"},
    {"value": 3, "label": "Mostly about my own comfort with releasing control"},
    {"value": 4, "label": "Almost entirely about my own comfort — they're ready, I need to let go"}
  ]$json$::jsonb
where question_key = 'Q076';

update questions set
  question_text   = 'When you hand off a responsibility, how do you typically do it?',
  response_options = $json$[
    {"value": 0, "label": "Verbally, in the moment — 'can you handle this?'"},
    {"value": 1, "label": "Brief verbal explanation, no documentation"},
    {"value": 2, "label": "Some explanation with basic written notes"},
    {"value": 3, "label": "Structured handoff with context and expectations"},
    {"value": 4, "label": "Full documented handoff with SOP, standards, and authority transfer"}
  ]$json$::jsonb
where question_key = 'Q077';

update questions set
  question_text   = 'When you delegate, how often do you explicitly define what ''done'' looks like — not just the task, but the standard the outcome should meet?',
  response_options = $json$[
    {"value": 0, "label": "Never — I assume they know what good looks like"},
    {"value": 1, "label": "Rarely"},
    {"value": 2, "label": "Sometimes"},
    {"value": 3, "label": "Usually"},
    {"value": 4, "label": "Always — I define the standard before I hand it off"}
  ]$json$::jsonb
where question_key = 'Q078';

update questions set
  question_text   = 'When you delegate a responsibility, do you also transfer the authority to make decisions within that responsibility — or do decisions still need your approval?',
  response_options = $json$[
    {"value": 0, "label": "Decisions always still need my approval"},
    {"value": 1, "label": "Most decisions still come to me"},
    {"value": 2, "label": "Some decisions are theirs, most still come to me"},
    {"value": 3, "label": "Most decisions are theirs with a few exceptions"},
    {"value": 4, "label": "Full authority transfer — they decide within the scope"}
  ]$json$::jsonb
where question_key = 'Q079';

update questions set
  question_text   = 'Do your current support staff have the capacity — time and bandwidth — to absorb additional ownership without being overloaded?',
  response_options = $json$[
    {"value": 0, "label": "No — everyone is at or over capacity"},
    {"value": 1, "label": "Unlikely — they're stretched thin"},
    {"value": 2, "label": "Possibly — some capacity exists but it's limited"},
    {"value": 3, "label": "Probably — there's reasonable capacity"},
    {"value": 4, "label": "Yes — clear capacity to absorb more ownership"}
  ]$json$::jsonb
where question_key = 'Q080';

update questions set
  question_text   = 'On average, how many active files does your TC or primary coordinator manage at one time?',
  response_options = $json$[
    {"value": 0, "label": "30 or more — they're overloaded"},
    {"value": 1, "label": "20–29"},
    {"value": 2, "label": "15–19"},
    {"value": 3, "label": "10–14"},
    {"value": 4, "label": "Fewer than 10 — manageable load"}
  ]$json$::jsonb
where question_key = 'Q081';

update questions set
  question_text   = 'How long has your primary support person (TC/LC/coordinator) been in their current role?',
  response_options = $json$[
    {"value": 0, "label": "Less than 3 months"},
    {"value": 1, "label": "3–6 months"},
    {"value": 2, "label": "6–12 months"},
    {"value": 3, "label": "1–2 years"},
    {"value": 4, "label": "More than 2 years"}
  ]$json$::jsonb
where question_key = 'Q082';

update questions set
  question_text   = 'Do new support staff learn your workflows primarily from documented SOPs or primarily by asking you and shadowing you?',
  response_options = $json$[
    {"value": 0, "label": "Entirely by asking me and shadowing — nothing is documented"},
    {"value": 1, "label": "Mostly by asking me, with minimal documentation"},
    {"value": 2, "label": "Mix of both — some docs, some direct instruction"},
    {"value": 3, "label": "Mostly from SOPs with some direct instruction"},
    {"value": 4, "label": "Entirely from documented SOPs — I'm rarely needed for onboarding"}
  ]$json$::jsonb
where question_key = 'Q083';

update questions set
  question_text   = 'Do your team members have clear, documented guardrails showing what they can decide independently versus what requires your involvement?',
  response_options = $json$[
    {"value": 0, "label": "No — nothing is documented"},
    {"value": 1, "label": "Vague verbal understanding, nothing written"},
    {"value": 2, "label": "Some documentation, but incomplete"},
    {"value": 3, "label": "Mostly documented with a few gaps"},
    {"value": 4, "label": "Fully documented and understood by the team"}
  ]$json$::jsonb
where question_key = 'Q084';

update questions set
  question_text   = 'Do you have escalation thresholds documented so your staff knows exactly when to handle something and when to bring it to you?',
  response_options = $json$[
    {"value": 0, "label": "No — they guess or always ask me"},
    {"value": 1, "label": "Informal understanding, nothing written"},
    {"value": 2, "label": "Partially documented"},
    {"value": 3, "label": "Mostly documented"},
    {"value": 4, "label": "Fully documented and consistently applied"}
  ]$json$::jsonb
where question_key = 'Q085';

update questions set
  question_text   = 'How often does work stop or slow down because someone on your team needs your approval before moving forward on something they probably could have handled?',
  response_options = $json$[
    {"value": 0, "label": "Daily — constant bottleneck"},
    {"value": 1, "label": "Several times a week"},
    {"value": 2, "label": "A few times a week"},
    {"value": 3, "label": "Occasionally — once or twice a week"},
    {"value": 4, "label": "Rarely or never — the team moves without me"}
  ]$json$::jsonb
where question_key = 'Q086';

-- ============================================================
-- SECTION G — SOLO PROFILE (SDQ1–3, SHR1–4, SSM1–3)
-- ============================================================

update questions set
  question_text   = 'If you had to hand off one of your workflows to someone you hired tomorrow, do you know exactly what you''d give them — their responsibilities, their authority, and what ''done well'' looks like?',
  response_options = $json$[
    {"value": 0, "label": "No — I haven't thought about it at that level of detail"},
    {"value": 1, "label": "Vague idea but nothing documented or decided"},
    {"value": 2, "label": "I've thought about it but haven't written anything down"},
    {"value": 3, "label": "I have a clear picture for most major workflows"},
    {"value": 4, "label": "Yes — I know exactly what I'd hand off and could document it this week"}
  ]$json$::jsonb
where question_key = 'SDQ1';

update questions set
  question_text   = 'Do you currently run your business in a way that could be handed to someone else — meaning you follow consistent processes rather than figuring it out differently each time?',
  response_options = $json$[
    {"value": 0, "label": "No — I do things differently each time, mostly in my head"},
    {"value": 1, "label": "Some consistency but mostly informal"},
    {"value": 2, "label": "Fairly consistent but not documented"},
    {"value": 3, "label": "Mostly consistent with some documentation"},
    {"value": 4, "label": "Yes — I follow documented processes someone else could learn and replicate"}
  ]$json$::jsonb
where question_key = 'SDQ2';

update questions set
  question_text   = 'If you hired a TC or coordinator tomorrow, how quickly could you get them operational on your most critical workflow?',
  response_options = $json$[
    {"value": 0, "label": "Months — everything would need to be taught from scratch"},
    {"value": 1, "label": "6 to 8 weeks with heavy involvement from me"},
    {"value": 2, "label": "3 to 4 weeks with an SOP to follow"},
    {"value": 3, "label": "1 to 2 weeks with a solid SOP and checklist"},
    {"value": 4, "label": "Within a week — documentation exists and is current"}
  ]$json$::jsonb
where question_key = 'SDQ3';

update questions set
  question_text   = 'Do you have a clear picture of what your first support hire would own — the specific workflows, responsibilities, and authority they''d have from day one?',
  response_options = $json$[
    {"value": 0, "label": "No — I haven't defined this at all"},
    {"value": 1, "label": "Vague idea of what I'd need help with"},
    {"value": 2, "label": "I know the general role but not the specific responsibilities"},
    {"value": 3, "label": "I have a clear role concept but haven't written a job description"},
    {"value": 4, "label": "Yes — I know exactly what they'd own and could write the job description today"}
  ]$json$::jsonb
where question_key = 'SHR1';

update questions set
  question_text   = 'Is your current transaction volume and revenue at a level where bringing on a support person would be financially viable?',
  response_options = $json$[
    {"value": 0, "label": "No — volume is too low to support a hire right now"},
    {"value": 1, "label": "Getting close but not quite there"},
    {"value": 2, "label": "Financially possible but tight"},
    {"value": 3, "label": "Yes — the numbers work"},
    {"value": 4, "label": "Comfortably viable — I could hire today if I had the right person"}
  ]$json$::jsonb
where question_key = 'SHR2';

update questions set
  question_text   = 'How much of your current workflow knowledge lives only in your head versus in documented systems?',
  response_options = $json$[
    {"value": 0, "label": "Almost entirely in my head — minimal documentation exists"},
    {"value": 1, "label": "Mostly in my head with some rough notes"},
    {"value": 2, "label": "About half documented, half informal"},
    {"value": 3, "label": "Mostly documented with some gaps"},
    {"value": 4, "label": "Well documented — someone could follow my systems without me explaining them"}
  ]$json$::jsonb
where question_key = 'SHR3';

update questions set
  question_text   = 'Have you set a specific target — a timeline or transaction volume — for when you plan to make your first support hire?',
  response_options = $json$[
    {"value": 0, "label": "No — I haven't set any target"},
    {"value": 1, "label": "Vague intention but no real timeline"},
    {"value": 2, "label": "I know roughly when but haven't committed to it"},
    {"value": 3, "label": "I have a target but haven't taken steps toward it"},
    {"value": 4, "label": "Yes — I have a specific target and I'm actively working toward it"}
  ]$json$::jsonb
where question_key = 'SHR4';

update questions set
  question_text   = 'When you solve a recurring problem in your business, do you build a process so it stays solved — or do you solve it in the moment and move on?',
  response_options = $json$[
    {"value": 0, "label": "I solve it in the moment and move on — no process gets built"},
    {"value": 1, "label": "Occasionally I document something but mostly in-the-moment solving"},
    {"value": 2, "label": "About half and half"},
    {"value": 3, "label": "I usually build a process but not always"},
    {"value": 4, "label": "Always — every recurring problem becomes a documented system"}
  ]$json$::jsonb
where question_key = 'SSM1';

update questions set
  question_text   = 'If you were unreachable for a full week right now, what would happen to your active transactions?',
  response_options = $json$[
    {"value": 0, "label": "They would stall or fail — everything depends on me personally"},
    {"value": 1, "label": "Significant problems — clients and deadlines would suffer"},
    {"value": 2, "label": "Some things would hold but critical items would fall apart"},
    {"value": 3, "label": "Most things would be fine with some hiccups"},
    {"value": 4, "label": "Everything would run — my systems and contacts are documented"}
  ]$json$::jsonb
where question_key = 'SSM2';

update questions set
  question_text   = 'Are you actively building your business to be less dependent on you — or is systematizing something you plan to focus on later?',
  response_options = $json$[
    {"value": 0, "label": "Later — production is the priority right now, systems can wait"},
    {"value": 1, "label": "I know it matters but I haven't made it a priority yet"},
    {"value": 2, "label": "I'm working on it but inconsistently"},
    {"value": 3, "label": "Actively building — I make time for systems work regularly"},
    {"value": 4, "label": "It's embedded — systematizing is how I approach every part of my business"}
  ]$json$::jsonb
where question_key = 'SSM3';

-- ============================================================
-- SECTION H — Context and Priorities
-- ============================================================

update questions set
  question_text   = 'On a scale of 1–5, how urgent is it for you to reduce your personal involvement in day-to-day operations over the next 90 days?',
  response_options = $json$[
    {"value": 1, "label": "1 — Not urgent at all"},
    {"value": 2, "label": "2 — Somewhat low priority"},
    {"value": 3, "label": "3 — Moderate priority"},
    {"value": 4, "label": "4 — High priority"},
    {"value": 5, "label": "5 — Critical — I need this now"}
  ]$json$::jsonb
where question_key = 'Q087';

update questions set
  question_text   = 'Which of the following best describes your primary goal for this assessment?',
  response_options = $json$[
    {"value": "understand_bottleneck",      "label": "Understand where I'm holding my team back"},
    {"value": "identify_first_delegation",  "label": "Identify which workflow to delegate first"},
    {"value": "build_case",                 "label": "Build a case for hiring or restructuring"},
    {"value": "prepare_growth",             "label": "Prepare for a growth phase or team expansion"},
    {"value": "reduce_workload",            "label": "Reduce my personal workload and reclaim time"}
  ]$json$::jsonb
where question_key = 'Q088';

update questions set
  question_text   = 'Is there anything specific about your business situation that you''d like your consultant to know before reviewing your results? (Optional)',
  response_options = null
where question_key = 'Q089';

update questions set
  question_text   = 'What does success look like for you 90 days from now? (Optional)',
  response_options = null
where question_key = 'Q090';
