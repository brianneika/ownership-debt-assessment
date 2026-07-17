-- Migration 001: add response_options column to questions
-- Run this BEFORE seed-questions-v2.sql

alter table questions
  add column if not exists response_options jsonb;
