'use client';

import { useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { trackMetaEvent } from '@/lib/meta-pixel';
import { requestBlueprint, type BlueprintFormState } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="avai-btn-primary w-full py-3.5 text-[15px] font-semibold mt-1 disabled:opacity-60"
      style={{ borderRadius: 'var(--avai-radius-control)' }}
    >
      {pending ? 'Getting your Blueprint…' : 'Get the Blueprint →'}
    </button>
  );
}

const labelClass = 'block text-sm font-semibold mb-1.5';

export function BlueprintForm() {
  const [state, formAction] = useActionState<BlueprintFormState, FormData>(requestBlueprint, null);
  const eventIdRef = useRef<HTMLInputElement>(null);

  function handleSubmit() {
    // One eventID per attempt, stored with the lead so a future server-side
    // (Conversions API) Lead can de-duplicate against this browser event.
    const id = `blueprint-${crypto.randomUUID()}`;
    if (eventIdRef.current) eventIdRef.current.value = id;
    trackMetaEvent('Lead', id);
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="mt-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
      <input ref={eventIdRef} type="hidden" name="meta_event_id" defaultValue="" />

      <div>
        <label htmlFor="bp_first_name" className={labelClass} style={{ color: 'var(--avai-ink)' }}>
          First name
        </label>
        <input id="bp_first_name" name="first_name" type="text" required autoComplete="given-name" placeholder="Jane" className="avai-text-input" />
      </div>

      <div>
        <label htmlFor="bp_email" className={labelClass} style={{ color: 'var(--avai-ink)' }}>
          Email
        </label>
        <input id="bp_email" name="email" type="email" required autoComplete="email" placeholder="jane@smithgroup.com" className="avai-text-input" />
      </div>

      <div>
        <label htmlFor="bp_phone" className={labelClass} style={{ color: 'var(--avai-ink)' }}>
          Phone
        </label>
        <input
          id="bp_phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          inputMode="tel"
          placeholder="(555) 555-0123"
          aria-describedby="bp_phone_help"
          className="avai-text-input"
        />
        <p id="bp_phone_help" className="text-[13px] mt-1.5" style={{ color: 'var(--avai-ink-muted)' }}>
          Brianne calls everyone who downloads it to hear what you found.
        </p>
      </div>

      {state?.error && (
        <p role="alert" className="text-sm font-medium" style={{ color: '#b42318' }}>
          {state.error}
        </p>
      )}

      <SubmitButton />

      <p className="text-[13px] text-center" style={{ color: 'var(--avai-ink-muted)' }}>
        Your download starts on the next page.{' '}
        <a href="https://www.vaileverage.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">
          Privacy Policy
        </a>
      </p>
    </form>
  );
}
