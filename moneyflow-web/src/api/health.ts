/** 서버가 살아 있는지 (/actuator/health, 로그인 없이 열림) */
export async function fetchServerUp(signal?: AbortSignal): Promise<boolean> {
  try {
    const response = await fetch('/actuator/health', { signal })
    if (!response.ok) return false
    const body = (await response.json()) as { status?: string }
    return body.status === 'UP'
  } catch {
    return false
  }
}
