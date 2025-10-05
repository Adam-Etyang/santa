import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Trash2, CheckCircle2, Circle } from "lucide-react";

interface WishlistItem {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  link: string | null;
  size: string | null;
  priority: string | null;
  purchased: boolean;
}

interface WishlistItemCardProps {
  item: WishlistItem;
  isOwnWishlist: boolean;
  onDelete: (id: string) => void;
  onTogglePurchased: (id: string, purchased: boolean) => void;
}

const WishlistItemCard = ({
  item,
  isOwnWishlist,
  onDelete,
  onTogglePurchased,
}: WishlistItemCardProps) => {
  const priorityColors = {
    high: "bg-destructive text-destructive-foreground",
    medium: "bg-accent text-accent-foreground",
    low: "bg-muted text-muted-foreground",
  };

  return (
    <Card className={item.purchased ? "opacity-60" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl">{item.title}</CardTitle>
          {item.priority && (
            <Badge className={priorityColors[item.priority as keyof typeof priorityColors]}>
              {item.priority}
            </Badge>
          )}
        </div>
        {item.description && (
          <CardDescription>{item.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2 text-sm">
          {item.price && (
            <Badge variant="outline">${item.price.toFixed(2)}</Badge>
          )}
          {item.size && (
            <Badge variant="outline">Size: {item.size}</Badge>
          )}
          {item.purchased && (
            <Badge className="bg-secondary text-secondary-foreground">
              ✓ Purchased
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          {item.link && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => window.open(item.link!, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Item
            </Button>
          )}
          
          {!isOwnWishlist && (
            <Button
              size="sm"
              variant={item.purchased ? "outline" : "default"}
              onClick={() => onTogglePurchased(item.id, item.purchased)}
              className="flex-1"
            >
              {item.purchased ? (
                <>
                  <Circle className="h-4 w-4 mr-2" />
                  Not Purchased
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark Purchased
                </>
              )}
            </Button>
          )}

          {isOwnWishlist && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WishlistItemCard;
