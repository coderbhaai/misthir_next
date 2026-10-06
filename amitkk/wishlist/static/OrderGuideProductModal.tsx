import { useState, useEffect, KeyboardEvent, useMemo } from "react";
import CustomModal from "@amitkk/basic/static/CustomModal";
import { apiRequest, clo, hitToastr } from "@amitkk/basic/utils/my-utils/admin-utils";
import { getProp, resolvePopulated } from "@amitkk/basic/utils/my-utils/shared-utils";
import { Input } from "@amitkk/components/basic/input";
import { Search, Plus, Check, Loader2, X, Minus } from "lucide-react";
import { SingleProductItemProps } from "@amitkk/product/types";
import ResponsiveImage from "@amitkk/components/ui/ResponsiveImage";

interface OrderGuideProductModalProps { 
  open: boolean; 
  orderGuideId: string; 
  handleClose: () => void; 
  onSelectGuide: () => void; 
  byPassUser: boolean; 
}

const normalizeId = (id: any): string => { if (!id) return ""; if (typeof id === "string") return id.trim().toLowerCase(); if (typeof id === "object") { if (id._id) return normalizeId(id._id); if (id.$oid) return normalizeId(id.$oid); if (typeof id.toString === "function") return id.toString().trim().toLowerCase(); } return String(id).trim().toLowerCase(); };

export default function OrderGuideProductModal({ open, orderGuideId, handleClose, onSelectGuide, byPassUser=false }: OrderGuideProductModalProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [products, setProducts] = useState<SingleProductItemProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [fetchedExistingIds, setFetchedExistingIds] = useState<string[]>([]);
  const [locallyAddedIds, setLocallyAddedIds] = useState<Record<string, boolean>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => { if (open && orderGuideId) { fetchExistingGuideItems(); } else if (!open) { setFetchedExistingIds([]); setLocallyAddedIds({}); setProducts([]); setSearch(""); } }, [open, orderGuideId]);

  const fetchExistingGuideItems = async () => {
    try {
      const res = await apiRequest("POST", "ecom/wishlist", { 
        function: "get_single_order_guide",
        id: orderGuideId,
        byPassUser
      });
      const guideData = Array.isArray(res?.data) ? res.data[0] : res?.data;
      const productsArray = guideData?.products || guideData?.skus || [];
      if (!Array.isArray(productsArray)) { setFetchedExistingIds([]); return; }

      const ids: string[] = [];
      productsArray.forEach((item: any) => {
        const prodId = normalizeId(item?.product_id?._id || item?.product_id || item?._id);
        const skuId = normalizeId(item?.sku_id?._id || item?.sku_id);
        if (prodId) ids.push(prodId);
        if (skuId) ids.push(skuId);
      });
      setFetchedExistingIds(ids);
    } catch (error) { clo(error); }
  };

  const addedItemsMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    Object.keys(locallyAddedIds).forEach((id) => { const clean = normalizeId(id); if (clean) map[clean] = true; });
    fetchedExistingIds.forEach((id) => { const clean = normalizeId(id); if (clean) map[clean] = true; });
    return map;
  }, [fetchedExistingIds, locallyAddedIds]);

  useEffect(() => { const timer = setTimeout(() => setDebouncedSearch(search), 400); return () => clearTimeout(timer); }, [search]);
  useEffect(() => { if (debouncedSearch.trim() && open) { fetchProducts(); } else { setProducts([]); } }, [debouncedSearch, open]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await apiRequest("POST", "product/product", { function: "get_products", search: debouncedSearch, limit: 20 });
      if (res?.data) setProducts(res.data);
    } catch (error) { clo(error); } finally { setLoading(false); }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter" && debouncedSearch.trim()) fetchProducts(); };

  const handleQuantityChange = (itemKey: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[itemKey] || 1;
      return { ...prev, [itemKey]: Math.max(1, current + delta) };
    });
  };

  const handleAddProductToGuide = async (product: any, skuId?: string) => {
    if (!orderGuideId) { hitToastr("error", "No active Order Guide selected"); return; }
    const cleanProductId = normalizeId(product._id);
    const cleanSkuId = skuId ? normalizeId(skuId) : undefined;
    const itemKey = cleanSkuId || cleanProductId;
    const qtyToAdd = quantities[itemKey] || 1;
    setAddingId(itemKey);

    try {
      const formData = new FormData();
      formData.append("function", "add_to_order_guide");
      formData.append("order_guide_id", orderGuideId);
      formData.append("product_id", cleanProductId);
      if (cleanSkuId) formData.append("sku_id", cleanSkuId);
      formData.append("action", "increment");
      formData.append("quantity", qtyToAdd.toString());

      const res = await apiRequest("POST", "ecom/wishlist", formData);
      if (res?.status || res?.data) {
        hitToastr("success", res?.message || "Added to guide");
        setLocallyAddedIds((prev) => ({ ...prev, [cleanProductId]: true, ...(cleanSkuId ? { [cleanSkuId]: true } : {}) }));
        fetchExistingGuideItems();
        onSelectGuide();
      }
    } catch (error) { clo(error); } finally { setAddingId(null); }
  };

  return (
    <CustomModal open={open} handleClose={handleClose} title="Search for Item" width="40">
      <div className="h-full space-y-4">
        <div className="relative flex items-center w-full rounded-full border border-gray-300 bg-white px-3 py-1.5 focus-within:border-gray-500 focus-within:ring-1 focus-within:ring-gray-500">
          <Search className="h-5 w-5 text-gray-400 mr-2" />
          <Input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={handleKeyDown} className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-8 p-0 bg-transparent"/>
          {search && (<button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600 p-1"><X className="h-4 w-4" /></button>)}
        </div>

        <div className="min-h-[220px] overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-gray-500"><Loader2 className="h-6 w-6 animate-spin text-primary mr-2" /><span>Searching...</span></div>
          ) : products.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-gray-400">{debouncedSearch ? "No items found." : "Type above to search products"}</div>
          ) : (
            products.map((product: any) => {
              const cleanProductId = normalizeId(product._id);
              const sku = product?.skus?.[0];
              const cleanSkuId = sku?._id ? normalizeId(sku._id) : undefined;
              const itemKey = cleanSkuId || cleanProductId;
              const isAdded = !!addedItemsMap[cleanProductId] || (cleanSkuId ? !!addedItemsMap[cleanSkuId] : false);
              const firstMedia = product.mediaHubs?.[0] ? resolvePopulated(product.mediaHubs[0], "media_id") : null;
              const image = getProp(firstMedia, "path", "/images/static/default.jpg");
              const altText = getProp(firstMedia, "alt", product.name || "Product");
              const isAddingThis = addingId === itemKey;
              const currentQty = quantities[itemKey] || 1;

              return (
                <div key={cleanProductId} className="row py-3 border-b border-gray-100 last:border-0 gap-3">
                  <div className="col-span-12 md:col-span-9 flex items-center gap-3">
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border border-gray-100">
                      <ResponsiveImage path={image} alt={altText} className="object-cover rounded-md"/>
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-semibold text-gray-900 leading-tight line-clamp-1">{product.name}</h4>
                      <div className="text-xs text-gray-500 font-medium"><span className="mx-1 font-bold text-gray-300">•</span></div>
                    </div>
                  </div>

                  <div className="col-span-12 md:col-span-3 flex items-center justify-center gap-2">
                    {!isAdded && (
                      <div className="flex items-center overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                        <button type="button" onClick={() => handleQuantityChange(itemKey, -1)} className="flex h-8 w-8 items-center justify-center bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"><Minus className="h-3.5 w-3.5" /></button>
                        <span className="flex h-8 w-8 items-center justify-center text-xs font-bold text-gray-800">{currentQty}</span>
                        <button type="button" onClick={() => handleQuantityChange(itemKey, 1)} className="flex h-8 w-8 items-center justify-center bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"><Plus className="h-3.5 w-3.5" /></button>
                      </div>
                    )}

                    <div>
                      {isAdded ? (
                        <button disabled className="flex items-center gap-1.5 rounded-lg bg-[#0F4C75] px-4 py-2 text-xs font-semibold text-white cursor-default"><Check className="h-3.5 w-3.5"/> Added</button>
                      ) : (
                        <button type="button" onClick={() => handleAddProductToGuide(product, sku?._id)} disabled={isAddingThis} className="flex items-center gap-1.5 rounded-md border border-[#800020] px-3 py-1.5 text-xs font-semibold text-[#800020] transition-colors hover:bg-[#800020] hover:text-white disabled:opacity-50">
                          {isAddingThis ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                          Add to Guide
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="fixed bottom-0 w-full py-3 pr-6 flex items-center justify-between border-t bg-white">
          <button type="button" className="flex items-center gap-1 rounded-md bg-[#800020] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"><Search className="h-3.5 w-3.5" /> View More</button>
          <button type="button" onClick={handleClose} className="rounded-md bg-[#800020] px-5 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90">Close</button>
        </div>
      </div>
    </CustomModal>
  );
}