'use client';

// Two print-to-PDF buttons for the session report. Each sets a print mode on
// <body> so the @media print CSS (globals.css) can decide what's visible:
//   - internal → the full report, exactly as on screen (answer detail expanded)
//   - client   → scores + "what your scores mean" only; internal sections stripped
// The mode is cleared on `afterprint` (which also fires on cancel), so the
// on-screen view is never left in a stripped state.

type PrintMode = 'internal' | 'client';

export default function PrintControls() {
  function printReport(mode: PrintMode) {
    document.body.dataset.printMode = mode;

    const reset = () => {
      delete document.body.dataset.printMode;
      window.removeEventListener('afterprint', reset);
    };
    window.addEventListener('afterprint', reset);

    window.print();
  }

  return (
    <div className="no-print flex items-center gap-2">
      <button
        type="button"
        onClick={() => printReport('internal')}
        className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors flex items-center gap-1.5"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        PDF (internal)
      </button>
      <button
        type="button"
        onClick={() => printReport('client')}
        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors flex items-center gap-1.5"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        PDF (client)
      </button>
    </div>
  );
}
