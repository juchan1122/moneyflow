import { Outlet } from 'react-router'

import { UpdatePrompt } from './UpdatePrompt'

export function RootLayout() {
  return (
    <>
      <main>
        <Outlet />
      </main>
      <UpdatePrompt />
    </>
  )
}
