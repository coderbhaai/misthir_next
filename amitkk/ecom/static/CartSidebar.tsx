"use client";
import { useEffect, useState } from "react";
import { useEcom } from "contexts/EcomContext";
import ImageWithFallback from "@amitkk/basic/static/ImageWithFallback";
import Link from "next/link";
import CartList from "./CartList";
import { hitToastr } from "@amitkk/basic/utils/my-utils/admin-utils";
import { Button } from "@amitkk/components/button/button";
import { Plus, ShoppingCart, X } from "lucide-react";
import { Card } from "@amitkk/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@amitkk/components/ui/sheet";
import { Textarea } from "@amitkk/components/basic/textarea";

export default function CartSidebar() {
  const { sendAction, cart, cartItemCount, relatedProducts } = useEcom();
  const [open, setOpen] = useState(false);
  const [showNoteBox, setShowNoteBox] = useState(false);
  const [orderNote, setOrderNote] = useState("");

  useEffect(() => {
  if (cart?.user_remarks) {
    setOrderNote(cart.user_remarks);
  }
}, [cart]);

  const handleAddOrderToCart = () => {
    if (!orderNote.trim()) { hitToastr('error', 'Please enter a note before saving.'); return; }

    sendAction('update_user_remarks', {
      action: 'update_user_remarks',
      user_remarks : orderNote
    });
    setShowNoteBox(false);
  };

  return (
    <>
      <div className="border-b border-border mb-4" />
      {cartItemCount > 0 && (
        <div className="fixed bottom-5 left-4 z-[1000]">
          <Button
            size="icon"
            onClick={() => setOpen(true)}
            className="relative bg-[#5a3825] hover:bg-[#7a5230] text-white w-14 h-14 rounded-full shadow-lg"
          >
            <ShoppingCart className="h-6 w-6" />
            <span className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground text-xs font-bold min-w-6 h-6 px-1 rounded-full flex items-center justify-center shadow-md">
              {cartItemCount}
            </span>
          </Button>
        </div>
      )}

      {/* Main Drawer Layout Wrapper */}
      <div className="flex relative">
        {/* Related Products Sidebar (Appears on the left side of the right drawer) */}
        {open && (
          <div className="w-[200px] h-screen overflow-y-auto border-r border-border fixed top-0 right-[400px] bg-background z-[1500] shadow-lg">
            <div className="flex justify-between items-center p-4 bg-[#d6d6d6] text-zinc-900 font-semibold text-sm">
              <p>Other Products</p>
            </div>

            <div className="p-4 space-y-3">
              {relatedProducts?.map((product: any) => (
                <div key={product._id} className="w-full">
                  <Link href={`/${product.url}`} className="block no-underline w-full">
                    <Card className="w-full flex flex-col p-2 shadow-none hover:bg-muted/50 transition-colors">
                      <ImageWithFallback img={product.medias?.[0]} height={80} />
                      <div className="mt-2">
                        <p className="text-center text-xs font-medium line-clamp-2">{product.name}</p>
                      </div>
                    </Card>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shadcn Sheet (Drawer) */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="right" className="w-[400px] sm:max-w-[400px] flex flex-col p-0 z-[1500]">
            <SheetHeader className="flex flex-row justify-between items-center p-4 bg-[#d6d6d6] text-zinc-900 space-y-0">
              <SheetTitle className="text-base font-semibold m-0 text-zinc-900">My Cart</SheetTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto">
              <CartList />
            </div>

            <div className="p-4 border-t border-border bg-background space-y-4">
              {showNoteBox && (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add a note"
                    rows={3}
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                  />
                  <div className="flex items-center justify-between">
                    <Button size="sm" onClick={handleAddOrderToCart}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowNoteBox(false)}>Cancel</Button>
                  </div>
                </div>
              )}

              {!showNoteBox && (
                <Button variant="outline" className="w-full" onClick={() => setShowNoteBox(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Order to Cart
                </Button>
              )}

              <div className="text-center text-xs text-muted-foreground space-y-1">
                <p>Delivery available at <strong className="text-foreground">122003</strong></p>
                <p>All orders received post 10 AM Friday to 10 AM Monday will be shipped on Monday.</p>
              </div>

              {cart?.total && (
                <Button asChild className="w-full bg-primary text-primary-foreground">
                  <Link href="/cart">
                    Checkout - ₹{cart?.total}
                  </Link>
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
