import { useQuery } from '@tanstack/react-query'

import { fetchServerUp } from '../api/health'

/** 임시 홈. 실제 홈(오늘 쓸 수 있는 돈)은 홈 API 작업 때 만든다 */
export function HomePage() {
  const { data: serverUp, isPending } = useQuery({
    queryKey: ['server-health'],
    queryFn: ({ signal }) => fetchServerUp(signal),
  })

  return (
    <section style={{ padding: 24 }}>
      <h1>moneyflow</h1>
      <p>
        서버 연결:{' '}
        <strong>{isPending ? '확인 중…' : serverUp ? '정상' : '연결 안 됨'}</strong>
      </p>
    </section>
  )
}
