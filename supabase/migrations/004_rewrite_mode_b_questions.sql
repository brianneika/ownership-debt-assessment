-- Migration 004: Rewrite all 72 Mode B question texts
-- Source: docs/listing-launch-rewrite.md, docs/remaining-workflows-rewrite.md,
--         docs/licensing-safe-rewrites.md (supersedes 12 specific questions)
-- Dimension assignments (FA/RA/SC/ET/OA/CC) and weights are unchanged.

-- ─── Section C — Listing Launch ───────────────────────────────────────────────

update questions set question_text = 'From getting the listing agreement signed to the property going live on MLS, can they make the calls on things like vendor selection, staging decisions, and listing details without checking with you first?' where question_key = 'Q001';

update questions set question_text = 'When they need to send status updates, marketing plans, or MLS confirmations to your seller, do they send those directly, or do you review everything before it goes out?' where question_key = 'Q002';

update questions set question_text = 'If the MLS listing goes live with an error, like a wrong price, a missing disclosure, or bad photos, do they catch and fix it themselves, or does it land back on your desk?' where question_key = 'Q003';

update questions set question_text = 'In the last 30 days, how often did they make a call on something like staging, timeline, or listing details and just move forward with it?' where question_key = 'Q004';

update questions set question_text = 'When a seller calls with a last-minute change, like new photos needed or a showing conflict, who fields that call first?' where question_key = 'Q005';

update questions set question_text = 'When something comes up mid-launch, like a delayed photographer or a seller who wants changes, do they bring you a plan, or do they bring you the problem?' where question_key = 'Q006';

update questions set question_text = 'Is there a written, step-by-step process for taking a listing from signed agreement to live on MLS that they actually follow?' where question_key = 'Q007';

update questions set question_text = 'Are the emails and updates that go out during a listing launch, like confirmations, seller updates, and marketing recaps, already templated, or written fresh each time?' where question_key = 'Q008';

update questions set question_text = 'If something unusual comes up, like a title issue, a seller pushing back on staging choices, or a vendor falling through, do they have something to reference, or do they call you?' where question_key = 'Q009';

update questions set question_text = 'Do they know exactly which listing launch decisions are theirs to make versus which ones need your sign-off?' where question_key = 'Q010';

update questions set question_text = 'In the last 60 days, did they bring you something about a listing launch that was actually within their own call to make?' where question_key = 'Q011';

update questions set question_text = 'If they were out for a day mid-launch, is there someone else who knows enough to keep the listing moving toward MLS?' where question_key = 'Q012';

update questions set question_text = 'When a listing launch goes sideways, like a missed MLS deadline, an upset seller, or a listing error, who''s actually accountable to you for fixing it?' where question_key = 'Q013';

update questions set question_text = 'Do they have a real standard they''re held to for how a listing launch goes? Not just whether the steps got done, but whether it actually went well for the seller.' where question_key = 'Q014';

update questions set question_text = 'If listing launches under their watch keep falling short, is there an actual process for correcting that, or does it just get absorbed?' where question_key = 'Q015';

update questions set question_text = 'How confident are you, honestly, that they could run a listing launch start to finish without you checking in?' where question_key = 'Q016';

update questions set question_text = 'Watching how they operate, not just what they say, how sure do they seem when handling a listing launch on their own?' where question_key = 'Q017';

update questions set question_text = 'Have they actually run listing launches independently, at your standard, for 90 days or more?' where question_key = 'Q018';

-- ─── Section D — Seller Communication ────────────────────────────────────────

update questions set question_text = 'When a seller pushes back on feedback or has a question that''s outside their lane, can they navigate that moment and get to the right next step, whether that means handling it directly or routing it to you, without you having to manage it personally?' where question_key = 'Q019';

update questions set question_text = 'Do they send the weekly update straight to the seller, or does it come across your desk for review first?' where question_key = 'Q020';

update questions set question_text = 'If a seller gets upset about a scheduling issue or a communication gap, do they smooth that over directly, or does it end up needing your involvement?' where question_key = 'Q021';

update questions set question_text = 'In the last 30 days, how often did they handle a tough seller conversation on their own, like a stalled showing schedule or a seller frustrated about turnaround time?' where question_key = 'Q022';

update questions set question_text = 'When a seller reaches out with a concern between updates, who responds first?' where question_key = 'Q023';

update questions set question_text = 'When a seller starts asking why there''s been no activity after weeks on market, do they bring you a plan for addressing it, like refreshed marketing or updated photos, or do they ask you how to handle it?' where question_key = 'Q024';

update questions set question_text = 'Is there a set process for the weekly seller update, like when it goes out and what it covers, that they actually follow?' where question_key = 'Q025';

update questions set question_text = 'Are the weekly update and feedback summary templated, or written from scratch each time?' where question_key = 'Q026';

update questions set question_text = 'If a seller conversation gets difficult, like frustration over a lack of showings, do they have talking points or a guide to work from, or do they call you first?' where question_key = 'Q027';

update questions set question_text = 'Do they know which seller conversations are theirs to handle versus which ones need you on the call?' where question_key = 'Q028';

update questions set question_text = 'In the last 60 days, did they bring you a seller conversation that they could have handled themselves?' where question_key = 'Q029';

update questions set question_text = 'If they were unavailable for a few days, is there someone who could step in on seller communication without the seller noticing a gap?' where question_key = 'Q030';

update questions set question_text = 'If a seller relationship sours, whether from poor communication or unmet expectations, who''s accountable to you for that?' where question_key = 'Q031';

update questions set question_text = 'Do they have a real standard for seller communication, not just "did the update go out" but "does the seller feel informed and confident"?' where question_key = 'Q032';

update questions set question_text = 'If seller satisfaction keeps coming up short under their watch, is there an actual process for addressing that?' where question_key = 'Q033';

update questions set question_text = 'How confident are you that they can manage the full day-to-day seller relationship, including tense moments about scheduling or communication gaps, without you?' where question_key = 'Q034';

update questions set question_text = 'Based on how they actually handle sellers, not just what they report back, how confident do they seem?' where question_key = 'Q035';

update questions set question_text = 'Have they been running seller communication independently, at your standard, for 90 days or more?' where question_key = 'Q036';

-- ─── Section E — File Opening ─────────────────────────────────────────────────

update questions set question_text = 'From the contract being executed to the critical date calendar being built, can they set it up and move forward without you signing off first?' where question_key = 'Q037';

update questions set question_text = 'When the file needs to go to title, escrow, or the other agent with key dates and terms, do they send that directly?' where question_key = 'Q038';

update questions set question_text = 'If a critical date gets entered wrong or a document is missing at file opening, do they catch and fix it, or does it surface later as your problem?' where question_key = 'Q039';

update questions set question_text = 'In the last 30 days, how often did they open a file and build out the critical dates without checking with you first?' where question_key = 'Q040';

update questions set question_text = 'When something''s off with a new file, like a missing signature or an unclear deadline, who catches it first?' where question_key = 'Q041';

update questions set question_text = 'When a file opening issue comes up, like a document discrepancy, do they bring you a fix, or do they bring you the problem?' where question_key = 'Q042';

update questions set question_text = 'Is there a documented checklist for opening a file and building the critical date calendar that they actually use?' where question_key = 'Q043';

update questions set question_text = 'Are the file opening confirmations and critical date notices templated, or written fresh each time?' where question_key = 'Q044';

update questions set question_text = 'If a file has something unusual, like extra documentation needed for a nonstandard contingency, do they know how to flag it and gather what''s needed, or do they call you?' where question_key = 'Q045';

update questions set question_text = 'Do they know which file opening decisions are theirs versus which ones need your review?' where question_key = 'Q046';

update questions set question_text = 'In the last 60 days, did they escalate a file opening question to you that was within their own authority to answer?' where question_key = 'Q047';

update questions set question_text = 'If they were out for a day, could someone else pick up file opening without dates slipping?' where question_key = 'Q048';

update questions set question_text = 'If a critical date gets missed because a file wasn''t opened correctly, who''s accountable to you for that?' where question_key = 'Q049';

update questions set question_text = 'Do they have a clear standard for file opening, not just "was it opened" but "was every date and detail correct"?' where question_key = 'Q050';

update questions set question_text = 'If file opening errors keep happening under their watch, is there a real process for correcting that?' where question_key = 'Q051';

update questions set question_text = 'How confident are you that they can open a file and build a critical date calendar correctly without your review?' where question_key = 'Q052';

update questions set question_text = 'Based on their actual track record, not just their explanations, how confident do they seem handling file opening on their own?' where question_key = 'Q053';

update questions set question_text = 'Have they been opening files independently, error-free at your standard, for 90 days or more?' where question_key = 'Q054';

-- ─── Section F — Lender Tracking ─────────────────────────────────────────────

update questions set question_text = 'From the appraisal being ordered through clear-to-close and coordinating the actual closing, can they manage that without checking in with you at each step?' where question_key = 'Q055';

update questions set question_text = 'When lender updates need to go out, like an appraisal result or a CTC confirmation, do they send those directly to the parties involved?' where question_key = 'Q056';

update questions set question_text = 'If something gets missed in lender tracking, like a stale underwriting update or a closing detail, do they catch and resolve it themselves?' where question_key = 'Q057';

update questions set question_text = 'In the last 30 days, how often did they follow up with the lender and move a file forward without you asking them to?' where question_key = 'Q058';

update questions set question_text = 'When a lender issue comes up, like a delayed appraisal or a stalled underwriting file, who follows up first?' where question_key = 'Q059';

update questions set question_text = 'When a lending delay threatens the closing date, do they bring you options for rescheduling logistics, like updated timing with title and the other side''s office, or do they ask you what to do?' where question_key = 'Q060';

update questions set question_text = 'Is there a documented process for tracking a file from appraisal through closing that they actually follow?' where question_key = 'Q061';

update questions set question_text = 'Are lender status updates and closing confirmations templated, or written fresh each time?' where question_key = 'Q062';

update questions set question_text = 'If a lending issue is unusual, like a delayed underwriting condition, do they have a playbook for gathering what''s needed and notifying the right people, or do they call you?' where question_key = 'Q063';

update questions set question_text = 'Do they know which lender or closing issues are theirs to resolve versus which ones need you involved?' where question_key = 'Q064';

update questions set question_text = 'In the last 60 days, did they escalate a lender tracking issue to you that they could have resolved on their own?' where question_key = 'Q065';

update questions set question_text = 'If they were unavailable for a day near closing, could someone else keep the file moving with the lender?' where question_key = 'Q066';

update questions set question_text = 'If a closing gets delayed or falls through due to a lender tracking miss, who''s accountable to you for that?' where question_key = 'Q067';

update questions set question_text = 'Do they have a real standard for lender tracking, not just "did they follow up" but "did the file actually close on time"?' where question_key = 'Q068';

update questions set question_text = 'If closing delays keep happening under their watch, is there a real process for correcting that?' where question_key = 'Q069';

update questions set question_text = 'How confident are you that they can manage a file from appraisal to closing without your involvement?' where question_key = 'Q070';

update questions set question_text = 'Based on how they''ve actually handled lender tracking, not just what they tell you, how confident do they seem?' where question_key = 'Q071';

update questions set question_text = 'Have they been managing lender tracking and closings independently, at your standard, for 90 days or more?' where question_key = 'Q072';
