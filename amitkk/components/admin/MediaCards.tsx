import type { MediaHubProps, MediaProps } from "@amitkk/basic/types/media";
import { Card, CardContent } from "@amitkk/components/ui/card";

interface MediaCardsProps {
  items?: MediaHubProps[];
  height?: number;
  width?: number;
}

export function MediaCards({items = [], height = 100, width = 150}: MediaCardsProps) {
  const populatedItems = items.filter(
    (hub): hub is MediaHubProps & { media_id: MediaProps } => typeof hub.media_id !== "string"
  );

  if (!populatedItems.length) return null;

  return (
    <div className="flex flex-wrap gap-4">
      {populatedItems.map((hub) => (
        <Card key={hub._id} className="overflow-hidden shadow-md rounded-xl p-0" style={{ width, height }}>
          <CardContent className="p-0 w-full h-full">
            <img src={hub.media_id.path} alt={hub.media_id.alt ?? "Image"} className="w-full h-full object-cover"/>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}