import { ImageResponse } from "next/og"

export const size = {
  width: 32,
  height: 32,
}
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 18,
          fontWeight: 800,
          color: "#fcea0e",
          background: "#0e121a",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px solid #e60026",
          borderRadius: 6,
        }}
      >
        F
      </div>
    ),
    {
      ...size,
    }
  )
}
