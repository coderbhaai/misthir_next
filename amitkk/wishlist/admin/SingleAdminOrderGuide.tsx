"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { apiRequest, clo, hitToastr } from "@amitkk/basic/utils/my-utils/admin-utils";
import { getProp, resolvePopulated } from "@amitkk/basic/utils/my-utils/shared-utils";
import { Minus, Plus, Trash2 } from "lucide-react";
// import OrderGuideModal from "@amitkk/ecom/static/OrderGuideModal";
// import OrderGuideProductModal from "@amitkk/ecom/static/OrderGuideProductModal";
// import { OrderGuideProps } from "@amitkk/buyer/types";
// import { FilterBar } from "@amitkk/basic/utils/layouts/FilterBar";
import { useFilterContext } from "contexts/FilterContext";
import { useRouter } from "next/router";
import { OrderGuideProps } from "../types";
import OrderGuideModal from "../static/OrderGuideModal";
import OrderGuideProductModal from "../static/OrderGuideProductModal";
import { FilterBar } from "@amitkk/basic/utils/layouts/FilterBar";

interface DataFormProps {
  dataId?: string;
}

export const SingleAdminOrderGuide: React.FC<DataFormProps> = ({ dataId = "" }) => {
    const router = useRouter();
    const [guides, setGuides] = useState<OrderGuideProps[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeGuide, setActiveGuide] = useState<OrderGuideProps | null>(null);
    const [selectedUnits, setSelectedUnits] = useState<Record<string, "Case" | "Piece">>({});
    const { filters } = useFilterContext();
    const searchTerm = filters?.search || filters?.search_term || "";

    const fetchGuides = async (isSilent = false) => {
      if (!isSilent) setLoading(true);
      try {
        const res = await apiRequest("POST", "ecom/wishlist", {
          function: "get_single_admin_order_guides",
          id: dataId,
          search: searchTerm,
        });
        const guideList: OrderGuideProps[] = res?.data ?? [];
        setGuides(guideList);
        const hasProducts = (g: any) => (g?.skus && g.skus.length > 0) || (g?.products && g.products.length > 0);

        let selected: OrderGuideProps | null = null;

        if (dataId) {
          const guides = guideList.filter((g) => String(g._id) === dataId);
          selected = guides.find(hasProducts) || guides[0] || null;
        }

        if (!selected && guideList.length > 0) {
          selected = guideList.find(hasProducts) || guideList[0];
        }

        setActiveGuide(selected);
      } catch (error) { clo(error); } finally { if (!isSilent) setLoading(false); }
    };

    useEffect(() => { fetchGuides(); }, [dataId, searchTerm]);

    const handleStepQuantity = async (productId: string, skuId: string, action: "increment" | "decrement" | "remove") => {
      try {
          const formData = new FormData();
          formData.append("function", "update_order_guide_item");
          formData.append("order_guide_id", dataId);
          formData.append("product_id", productId);
          if (skuId) formData.append("sku_id", skuId);
          formData.append("action", action);

          const res = await apiRequest("POST", "ecom/wishlist", formData);
          if (res?.status) {
              hitToastr("success", res?.message || "Updated successfully");
              await fetchGuides(true);
          }
      } catch (error) { clo(error); }
    };

    const [guideModalOpen, setGuideModalOpen] = useState(false);
    const handleSelectGuide = async () => {
        await fetchGuides(true);
        setGuideModalOpen(false);
    };

    const [guideProductModalOpen, setGuideProductModalOpen] = useState(false);
    const productAdded = async () => {
        await fetchGuides(true);
        setGuideModalOpen(false);
    };

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-12", },
    ] as const;

  return (
    <>
      <FilterBar filters={FILTER_CONFIG} />

      <div className="flex min-h-[calc(100vh-100px)] w-full gap-6 p-4 bg-gray-50/50">
        <aside className="w-1/4 min-w-[260px] rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Order Guides</h2>

          {loading ? (
            <div className="py-8 text-center text-sm text-gray-500">Loading guides...</div>
          ) : guides.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">No guides found.</div>
          ) : (
            <nav className="space-y-2">
              {guides.map((guide) => {
                const isActive = String(guide._id) === dataId;
                const itemCount = guide.products?.length ?? 0;

                return (
                  <Link key={String(guide._id)} href={`/admin/order-guide/${guide._id}`}
                    className={`block rounded-lg p-3 transition-colors ${
                      isActive
                        ? "border border-primary/20 bg-primary/10 font-semibold text-primary"
                        : "border border-transparent bg-gray-50 hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <div className="text-sm font-medium">{guide.name || "Untitled Guide"}</div>
                    <div className="mt-1 text-xs text-gray-500">
                      {itemCount} {itemCount === 1 ? "Item" : "Items"}
                    </div>
                  </Link>
                );
              })}

              <button onClick={() => setGuideModalOpen(true)} className="flex items-center justify-center gap-1 rounded-md bg-primary px-3 py-3 text-xs font-semibold text-white transition-all hover:bg-primary/90 w-full">
                  <Plus className="h-3.5 w-3.5" />New Guide
              </button>
            </nav>
          )}

          
        </aside>
        
        <main className="flex-1 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {loading ? (
            <div className="py-12 text-center text-gray-500">Loading guide details...</div>
          ) : !activeGuide ? (
            <div className="py-12 text-center text-gray-500">Select an order guide from the left sidebar to view products.</div>
          ) : (
            <div>
              <div className="mb-6 flex items-center justify-between border-b pb-4">
                  <div>
                      <h1 className="text-2xl font-bold text-gray-900">{activeGuide.name}</h1>
                      <p className="text-xs text-gray-500">{activeGuide.products?.length ?? 0} Products attached</p>
                  </div>
                  <button onClick={() => setGuideProductModalOpen(true)} className="flex items-center justify-center gap-1 rounded-md bg-primary px-3 py-3 text-xs font-semibold text-white transition-all hover:bg-primary/90">
                      <Plus className="h-3.5 w-3.5" />Add Items 
                  </button>
              </div>

              {!activeGuide.products || activeGuide.products.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-500">No products added to this order guide yet.</div>
              ) : (
                <div className="space-y-3">
                  {activeGuide?.products?.map((item: any, index: number) => {
                    const product = item.product_id;
                    const sku = item.sku_id;

                    const firstMedia = product?.mediaHubs?.[0] ? resolvePopulated(product.mediaHubs[0], "media_id") : null;
                    const image = getProp(firstMedia, "path", "/images/static/default.jpg");
                    const brandName = product?.brands?.[0]?.name || "Spoleto";
                    const itemCode = sku?.item_code || "GO135";
                    const unitDescription = sku?.unit || "4x3 Liter BC";
                    const price = sku?.price ? `$${sku.price}` : "$125.42";
                    const activeUnit = selectedUnits[item._id] || "Case";

                    return (
                      <div key={item._id} className="group flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:shadow-sm">
                        <div className="flex items-center gap-4">
                          <span className="w-5 text-center text-sm font-semibold text-gray-500">{index + 1}</span>

                          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                            <Image src={image} alt={product?.name || "Product"} fill className="object-contain"/>
                          </div>

                          <div className="space-y-0.5">
                            <h3 className="text-sm font-bold text-gray-900">{product?.name || "Extra Virgin Olive Oil"}</h3>
                            <div className="flex items-center space-x-2 text-xs text-sky-600 font-medium">
                              <span>{brandName}</span>
                              <span className="text-gray-300">•</span>
                              <span className="text-gray-600">{itemCode}</span>
                            </div>
                            <p className="text-xs text-gray-500">{unitDescription}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <span className="text-base font-bold text-gray-900">{price}</span>
                            <span className="text-xs text-gray-500 font-medium"> / {activeUnit}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                              <button onClick={() => handleStepQuantity(product?._id, sku?._id, "decrement")} className="flex h-9 w-9 items-center justify-center bg-gray-200 text-gray-600 transition-colors hover:bg-gray-300"aria-label="Decrease quantity">
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="flex h-9 w-10 items-center justify-center bg-gray-50 text-sm font-bold text-gray-800">{item.quantity || 0}</span>
                              <button onClick={() => handleStepQuantity(product?._id, sku?._id, "increment")} className="flex h-9 w-9 items-center justify-center bg-gray-200 text-gray-600 transition-colors hover:bg-gray-300" aria-label="Increase quantity">
                                  <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            <button onClick={() => handleStepQuantity(product?._id, sku?._id, "remove")} className="ml-1 rounded-md p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Remove item">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>

        <OrderGuideModal open={guideModalOpen} handleClose={() => setGuideModalOpen(false)} onSelectGuide={handleSelectGuide}/>
        <OrderGuideProductModal open={guideProductModalOpen} handleClose={() => setGuideProductModalOpen(false)} onSelectGuide={productAdded} orderGuideId={dataId} byPassUser={true}/>
      </div>
    </>    
  );
};

export default SingleAdminOrderGuide;