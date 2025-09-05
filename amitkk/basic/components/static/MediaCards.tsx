// components/MediaCards.tsx
import { Box, Card } from "@mui/material";
import { MediaProps } from "lib/models/types";

interface MediaCardsProps {
  items?: (MediaProps | null)[] | null; // accepts [], null, or undefined
  height?: number;
  width?: number;
}

export function MediaCards({ items, height = 100, width = 150 }: MediaCardsProps) {
  if (!items?.length) return null; // nothing to render

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
      {items
        .filter((m): m is MediaProps => !!m?.path) // removes null/invalid
        .map((media) => (
          <Card
            key={media._id.toString()}
            sx={{
              width,
              height,
              borderRadius: 2,
              overflow: "hidden",
              boxShadow: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box sx={{ width: "100%", height: "100%" }}>
              <img
                src={media.path}
                alt={media.alt ?? "Product image"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>
          </Card>
        ))}
    </Box>
  );
}
