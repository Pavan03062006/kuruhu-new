export type AiResult = {
  id: string; conversation_id: string; question: string; answer: string; sql: string
  parameters: Record<string, unknown>; tables: string[]; columns: string[]; filters: string[]
  row_count: number; execution_ms: number; rows: Record<string, unknown>[]
  fir_references: string[]; stations: string[]; districts: string[]; provenance: string; reason: string
  visualization: { type: 'empty' | 'table' | 'bar'; title: string; category?: string; value?: string; columns?: string[] }
  created_at: string
}
export type HistoryItem = { id: string; title: string; is_pinned: boolean; created_at: string; updated_at: string; query_count: number }
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '/backend-api'
const MOCK_API = process.env.NEXT_PUBLIC_MOCK_API === 'true'
const mockRows = [
  { district_name: 'Bengaluru Urban', fir_count: 1284 },
  { district_name: 'Mysuru', fir_count: 742 },
  { district_name: 'Belagavi', fir_count: 618 },
  { district_name: 'Dakshina Kannada', fir_count: 536 },
  { district_name: 'Ballari', fir_count: 481 },
]
const mockResult = (question: string, conversationId = 'mock-investigation-001'): AiResult => ({
  id: 'mock-query-001', conversation_id: conversationId, question,
  answer: 'The preview dataset shows Bengaluru Urban with the highest FIR volume (1,284), followed by Mysuru (742). This is mock design-review data and was not queried from the police database.',
  sql: 'SELECT district_name, COUNT(*) AS fir_count FROM firs GROUP BY district_name ORDER BY fir_count DESC LIMIT 5;',
  parameters: {}, tables: ['firs', 'districts'], columns: ['district_name', 'fir_count'], filters: [],
  row_count: mockRows.length, execution_ms: 84, rows: mockRows, fir_references: [], stations: [],
  districts: mockRows.map(row => row.district_name), provenance: 'PRAMAAN mock design-review dataset',
  reason: 'Offline mock response for reviewing the complete frontend without backend services.',
  visualization: { type: 'bar', title: 'FIR volume by district', category: 'district_name', value: 'fir_count' },
  created_at: new Date().toISOString(),
})
const mockHistory: HistoryItem[] = [
  { id: 'mock-query-001', title: 'FIR volume by district', is_pinned: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), query_count: 3 },
  { id: 'mock-query-002', title: 'Robbery trend overview', is_pinned: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), query_count: 1 },
]
function csrfToken() { return document.cookie.split('; ').find(item => item.startsWith('csrf_token='))?.split('=')[1] ?? '' }
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { ...init, credentials: 'include', headers: { 'Content-Type': 'application/json', ...(init.method && init.method !== 'GET' ? { 'X-CSRF-Token': csrfToken() } : {}), ...init.headers } })
  if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.detail ?? 'AI Investigator request failed') }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>
}
export async function streamChat(message: string, conversationId: string | null, handlers: { token: (text: string) => void; status: (stage: string) => void; result: (result: AiResult) => void }) {
  if (MOCK_API) {
    handlers.status('Understanding your question')
    await new Promise(resolve => setTimeout(resolve, 250))
    handlers.status('Reviewing FIR intelligence')
    await new Promise(resolve => setTimeout(resolve, 250))
    const result = mockResult(message, conversationId ?? 'mock-investigation-001')
    for (const chunk of result.answer.match(/.{1,45}(?:\s|$)/g) ?? [result.answer]) handlers.token(chunk)
    handlers.result(result)
    return
  }
  const response = await fetch(`${API_URL}/ai/chat`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken() }, body: JSON.stringify({ message, conversation_id: conversationId }) })
  if (!response.ok || !response.body) { const body = await response.json().catch(() => ({})); throw new Error(body.detail ?? 'AI Investigator request failed') }
  const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = ''
  while (true) {
    const { done, value } = await reader.read(); if (done) break
    buffer += decoder.decode(value, { stream: true }); const events = buffer.split('\n\n'); buffer = events.pop() ?? ''
    for (const block of events) {
      const event = block.match(/^event: (.+)$/m)?.[1]; const data = block.match(/^data: (.+)$/m)?.[1]; if (!event || !data) continue
      const parsed = JSON.parse(data); if (event === 'token') handlers.token(parsed.text); if (event === 'status') handlers.status(parsed.stage); if (event === 'result') handlers.result(parsed)
    }
  }
}
export const aiApi = {
  history: () => MOCK_API ? Promise.resolve(mockHistory) : request<HistoryItem[]>('/ai/history'),
  open: (id: string) => MOCK_API ? Promise.resolve(mockResult(mockHistory.find(item => item.id === id)?.title ?? 'Preview investigation')) : request<AiResult>(`/ai/history/${id}`),
  remove: (id: string) => MOCK_API ? Promise.resolve() : request<void>(`/ai/history/${id}`, { method: 'DELETE' }),
  pin: (id: string, is_pinned: boolean) => MOCK_API ? Promise.resolve() : request<void>(`/ai/history/${id}/pin`, { method: 'PATCH', body: JSON.stringify({ is_pinned }) }),
}
