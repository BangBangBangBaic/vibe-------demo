import QRCode from 'qrcode'

export async function toQrDataUrl(content: string): Promise<string> {
  return QRCode.toDataURL(content, {
    width: 280,
    margin: 2,
    color: {
      dark: '#153329',
      light: '#FFFFFF',
    },
  })
}

export function buildMobilePayLink(orderNo: string): string {
  const origin = window.location.origin
  return `${origin}/mobile-pay/${encodeURIComponent(orderNo)}`
}
