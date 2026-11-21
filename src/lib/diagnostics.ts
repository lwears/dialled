function probe(style: string, read: (element: HTMLElement) => string): string {
  const element = document.createElement('div')
  element.style.cssText = `position:fixed;left:0;top:0;width:1px;visibility:hidden;pointer-events:none;${style}`
  document.body.append(element)
  const value = read(element)
  element.remove()
  return value
}

const height = (unit: string) => probe(`height:${unit}`, (element) => `${element.getBoundingClientRect().height}`)

export function measureScreen(): Array<[string, string]> {
  const insets = probe(
    'padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
    (element) => {
      const style = getComputedStyle(element)
      return `t ${style.paddingTop} r ${style.paddingRight} b ${style.paddingBottom} l ${style.paddingLeft}`
    },
  )
  const tabbar = document.querySelector('.tabbar')?.getBoundingClientRect()
  const viewport = window.visualViewport
  const standalone = 'standalone' in navigator ? String(navigator.standalone) : 'n/a'

  return [
    ['display-mode standalone', String(window.matchMedia('(display-mode: standalone)').matches)],
    ['navigator.standalone', standalone],
    ['screen', `${screen.width} × ${screen.height}`],
    ['inner', `${window.innerWidth} × ${window.innerHeight}`],
    ['outer', `${window.outerWidth} × ${window.outerHeight}`],
    ['documentElement.clientHeight', String(document.documentElement.clientHeight)],
    ['visualViewport', viewport ? `${viewport.height} (offsetTop ${viewport.offsetTop})` : 'n/a'],
    ['100vh / dvh / svh / lvh', ['100vh', '100dvh', '100svh', '100lvh'].map(height).join(' / ')],
    ['safe-area insets', insets],
    ['tab bar top → bottom', tabbar ? `${tabbar.top} → ${tabbar.bottom}` : 'n/a'],
    ['devicePixelRatio', String(window.devicePixelRatio)],
    ['user agent', navigator.userAgent],
  ]
}
