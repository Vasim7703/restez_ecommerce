import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#047857', // emerald-700
          color: '#FBBF24',      // gold/amber
          fontSize: '24px',
          fontWeight: 'bold',
          borderRadius: '4px',
        }}
      >
        R
      </div>
    ),
    { ...size }
  )
}
