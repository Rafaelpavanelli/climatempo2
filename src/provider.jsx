import {NextUIProvider} from '@nextui-org/react'

export function Providers({children}) {
  return (
    <NextUIProvider className='w-screen h-auto min-w-[70vw]'>
      {children}
    </NextUIProvider>
  )
}