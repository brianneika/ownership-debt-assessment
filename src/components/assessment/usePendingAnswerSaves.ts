'use client';

import { useCallback, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { saveRadioAnswer } from '@/app/assessment/actions';

// Radio answers autosave the moment they're selected. The section advances via a
// separate <form action={serverAction}> submit that redirects. Without this hook,
// a save still in flight when "Next" is clicked gets abandoned by the navigation —
// which is exactly how the last question in a section (e.g. TBx5) silently went
// missing. This hook dispatches each save immediately and makes "Next" wait for
// every in-flight save to land before the form action runs.
export function usePendingAnswerSaves(sessionId: string) {
  const pending = useRef<Set<Promise<void>>>(new Set());
  const readyToSubmit = useRef(false);
  const [savedAt, setSavedAt] = useState(0);
  const [flushing, setFlushing] = useState(false);

  const handleRadioChange = useCallback(
    (
      questionId: number,
      answerType: 'scored_radio' | 'categorical_radio',
      value: string,
    ) => {
      setSavedAt(Date.now()); // optimistic saved indicator
      // Fire the save right away so the request is dispatched on selection, and
      // record it so a pending "Next" can await it.
      const p = saveRadioAnswer(sessionId, questionId, answerType, value)
        .catch((err) => {
          console.error('[usePendingAnswerSaves] save failed', err);
        })
        .finally(() => {
          pending.current.delete(p);
        });
      pending.current.add(p);
    },
    [sessionId],
  );

  // Attach to the form's onSubmit. If saves are in flight, hold the submit until
  // they resolve, then re-submit so the server action (and its redirect) only
  // runs once every answer is persisted.
  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    // Second pass, triggered by requestSubmit() below — let it through.
    if (readyToSubmit.current) {
      readyToSubmit.current = false;
      return;
    }
    if (pending.current.size === 0) return; // nothing pending, submit normally

    e.preventDefault();
    const form = e.currentTarget;
    setFlushing(true);
    Promise.allSettled([...pending.current]).finally(() => {
      setFlushing(false);
      readyToSubmit.current = true;
      form.requestSubmit();
    });
  }, []);

  return { savedAt, flushing, handleRadioChange, handleSubmit };
}
