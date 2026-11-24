import { useRegisterSW } from 'virtual:pwa-register/react'

import styles from './UpdatePrompt.module.css'

/** 새 버전이 배포되면 아래에 "업데이트" 알림을 띄운다. 누르면 새로고침 */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div role="status" className={styles.toast}>
      <span>새 버전이 있어요.</span>
      <button type="button" onClick={() => updateServiceWorker(true)}>
        업데이트
      </button>
      <button type="button" onClick={() => setNeedRefresh(false)}>
        나중에
      </button>
    </div>
  )
}
