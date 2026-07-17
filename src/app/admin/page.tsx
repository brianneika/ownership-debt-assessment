import Link from 'next/link';
import { fetchCompletedSessions } from '@/lib/admin';

// Always fetch live data — never statically prerender
export const dynamic = 'force-dynamic';

const BAND_CLASSES: Record<string, string> = {
  '#22c55e': 'bg-green-50 text-green-700 border-green-200',
  '#eab308': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  '#f97316': 'bg-orange-50 text-orange-700 border-orange-200',
  '#ef4444': 'bg-red-50 text-red-700 border-red-200',
};

function bandClass(hex: string | null) {
  return BAND_CLASSES[hex ?? ''] ?? 'bg-gray-50 text-gray-600 border-gray-200';
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default async function AdminDashboard() {
  const sessions = await fetchCompletedSessions();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Ownership Assessment — Admin</h1>
            <p className="text-xs text-gray-400 mt-0.5">{sessions.length} completed assessment{sessions.length === 1 ? '' : 's'}</p>
          </div>
          <form method="POST" action="/api/auth/logout">
            <button
              type="submit"
              className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"
            >
              Log out
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {sessions.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-gray-400 text-sm">No completed assessments yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left font-semibold text-gray-500 px-5 py-3 text-xs uppercase tracking-wider">Respondent</th>
                  <th className="text-left font-semibold text-gray-500 px-5 py-3 text-xs uppercase tracking-wider">Business</th>
                  <th className="text-left font-semibold text-gray-500 px-5 py-3 text-xs uppercase tracking-wider">Completed</th>
                  <th className="text-left font-semibold text-gray-500 px-5 py-3 text-xs uppercase tracking-wider">ODS</th>
                  <th className="text-left font-semibold text-gray-500 px-5 py-3 text-xs uppercase tracking-wider">DRS</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.sessionId} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <Link href={`/admin/sessions/${s.sessionId}`} className="block">
                        <span className="font-medium text-gray-900">{s.name}</span>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/admin/sessions/${s.sessionId}`} className="block text-gray-600">
                        {s.businessName}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/admin/sessions/${s.sessionId}`} className="block text-gray-500">
                        {formatDate(s.completedAt)}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/admin/sessions/${s.sessionId}`} className="flex items-center gap-2">
                        {s.ods ? (
                          <>
                            <span className="font-semibold text-gray-900 tabular-nums">{s.ods.score.toFixed(0)}</span>
                            {s.ods.bandLabel && (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${bandClass(s.ods.bandColor)}`}>
                                {s.ods.bandLabel}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/admin/sessions/${s.sessionId}`} className="flex items-center gap-2">
                        {s.drs ? (
                          <>
                            <span className="font-semibold text-gray-900 tabular-nums">{s.drs.score.toFixed(0)}</span>
                            {s.drs.bandLabel && (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${bandClass(s.drs.bandColor)}`}>
                                {s.drs.bandLabel}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
