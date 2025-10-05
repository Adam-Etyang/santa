import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus } from "lucide-react";
import WishlistItemCard from "@/components/WishlistItemCard";
import AddWishlistItemDialog from "@/components/AddWishlistItemDialog";

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

const Wishlist = () => {
  const { groupId, userId } = useParams<{ groupId: string; userId: string }>();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [showAddItem, setShowAddItem] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const isOwnWishlist = currentUserId === userId;

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setCurrentUserId(session.user.id);
      fetchWishlist();
      fetchUserName();
    };
    checkUser();
  }, [groupId, userId, navigate]);

  const fetchUserName = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setUserName(data.full_name);
    }
  };

  const fetchWishlist = async () => {
    try {
      const { data, error } = await supabase
        .from("wishlist_items")
        .select("*")
        .eq("group_id", groupId)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading wishlist",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      toast({
        title: "Item removed",
        description: "The item has been removed from the wishlist.",
      });

      fetchWishlist();
    } catch (error: any) {
      toast({
        title: "Error removing item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleTogglePurchased = async (itemId: string, purchased: boolean) => {
    try {
      const { error } = await supabase
        .from("wishlist_items")
        .update({ purchased: !purchased })
        .eq("id", itemId);

      if (error) throw error;

      toast({
        title: purchased ? "Marked as not purchased" : "Marked as purchased",
      });

      fetchWishlist();
    } catch (error: any) {
      toast({
        title: "Error updating item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate(`/group/${groupId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Group
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {isOwnWishlist ? "My Wishlist" : `${userName}'s Wishlist`}
          </h1>
          <p className="text-muted-foreground">
            {isOwnWishlist
              ? "Add items you'd love to receive"
              : "Browse their wishlist and mark items as purchased"}
          </p>
        </div>

        {isOwnWishlist && (
          <Button onClick={() => setShowAddItem(true)} className="mb-6">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <WishlistItemCard
              key={item.id}
              item={item}
              isOwnWishlist={isOwnWishlist}
              onDelete={handleDelete}
              onTogglePurchased={handleTogglePurchased}
            />
          ))}
        </div>

        {items.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">
                {isOwnWishlist
                  ? "Your wishlist is empty. Start adding items!"
                  : "This wishlist is empty."}
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      <AddWishlistItemDialog
        open={showAddItem}
        onOpenChange={setShowAddItem}
        groupId={groupId!}
        userId={userId!}
        onItemAdded={fetchWishlist}
      />
    </div>
  );
};

export default Wishlist;
