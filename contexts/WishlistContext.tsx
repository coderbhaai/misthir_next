"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { apiRequest, clo, hitToastr } from "@amitkk/basic/utils/my-utils/admin-utils";
import { WishlistCartProps } from "@amitkk/wishlist/types";

type WishlistContextType = {
  wishlistId?: string;
  wishlist: WishlistCartProps[];
  wishlistCount: number;
  fetchWishlist: () => Promise<void>;
  sendWishlistAction: (action: string, payload?: any) => Promise<void>;
  isInWishlist: (productId: string, skuId?: string) => boolean;
};

const WishlistContext = createContext<WishlistContextType>({
  wishlist: [],
  wishlistCount: 0,
  fetchWishlist: async () => {},
  sendWishlistAction: async () => {},
  isInWishlist: () => false,
});

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistCartProps[]>([]);
  const [wishlistId, setWishlistId] = useState<string | undefined>();
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const id = Cookies.get("wishlist_id");
    if (id) setWishlistId(id);
    fetchWishlist();
  }, []);

  const sendWishlistAction = async (action: string, payload: any = {}) => {
    try {
      payload.function = action;
      if (wishlistId && wishlistId !== "undefined") {
        payload.wishlist_id = wishlistId;
      }

      const res = await apiRequest("POST", "ecom/wishlist", payload);

      if( res?.data?.wishlist_id ){
        Cookies.set('wishlist_id', res?.data?.wishlist_id, { expires: 7, path: '/', sameSite: "lax" });
        setWishlistId(res?.data?.wishlist_id);
      }

      if (res?.status) {
        await fetchWishlist();
        if (res.message) {
          hitToastr("success", res.message);
        }
      }
    } catch (error) { clo(error); }
  };

  const fetchWishlist = async () => {
    try {
      const res = await apiRequest("POST", "ecom/wishlist", {
        function: "get_user_wishlist",
        wishlist_id: wishlistId
      });

      const items = res?.data?.wishlistItems ?? [];
      setWishlist(items);
      const totalCount = res?.data?.wishlistCount ?? items.reduce((sum: number, item: any) => sum + (Number(item.quantity) || 0), 0);
      setWishlistCount(totalCount);
      
      if (res?.data?.wishlist_id) {
        Cookies.set("wishlist_id", res.data.wishlist_id, { expires: 7, path: "/", sameSite: "lax" });
        setWishlistId(res?.data?.wishlist_id);
      }
    } catch (error) { clo(error); }
  };
  
  const isInWishlist = (productId: string, skuId?: string) => {
    if (!Array.isArray(wishlist)) return false;

    return wishlist.some((item) => {
      const productIdValue = typeof item.product_id === "object" ? item.product_id._id : item.product_id;
      const skuIdValue = typeof item.sku_id === "object" ? item.sku_id._id : item.sku_id;

      return productIdValue === productId && (!skuId || skuIdValue === skuId);
    });
  };
  
  useEffect(() => { fetchWishlist(); }, []);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistId,
        wishlistCount,
        fetchWishlist,
        sendWishlistAction,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}