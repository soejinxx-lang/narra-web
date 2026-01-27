
import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const size = {
    width: 32,
    height: 32,
};
export const contentType = "image/png";

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 20, // Reduced slightly to ensure it looks centered visually
                    background: "#faf9f6", // var(--background)
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#243A6E", // var(--narra-blue)
                    borderRadius: "50%",
                    fontWeight: 600, // Make it a bit bolder like the logo
                }}
            >
                N
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    );
}
