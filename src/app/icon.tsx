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
          color: "#c0caf5",
          background: "#1a1b26",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px solid #f7768e",
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
