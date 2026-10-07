import { useState, useEffect } from "react";
import SuggestProducts from "@amitkk/product/static/suggest-products";
import SuggestBlogs from "@amitkk/blog/static/suggest-blog";
import ShareMe from "@amitkk/basic/static/ShareMe";
import QuantitySelector from "@amitkk/product/static/QuantitySelector";
import { useEcom } from "contexts/EcomContext";
import BulkOrderModal from "@amitkk/ecom/static/BulkOrderModal";
import SuggestTestimonial from "@amitkk/basic/admin/testimonial/suggest-testimonial";
import FaqPanel from "@amitkk/basic/admin/faq/FaqPanel";
import { RelatedContent, ReviewProps } from "@amitkk/basic/types";
import { Button } from "@amitkk/components/button/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@amitkk/components/ui/badge";
import ReviewPanel from "@amitkk/basic/admin/review/ReviewPanel";
import { SingleProductItemProps, SkuProps } from "../types";
import { getProp } from "@amitkk/basic/utils/my-utils/shared-utils";
import ProductImageGallery from "@amitkk/basic/admin/media/ProductImageGallery";
import ContentRenderer from "@amitkk/basic/static/ContentRenderer";
import { MetaRow } from "@amitkk/components/admin/MetaRow";
import { filterAndExtractFeatures } from "@amitkk/basic/utils/my-utils/ecom-utils";
import { useWishlist } from "contexts/WishlistContext";
import OrderGuideModal from "@amitkk/wishlist/static/OrderGuideModal";
import { useAuth } from "contexts/AuthContext";
import { apiRequest, hitToastr } from "@amitkk/basic/utils/my-utils/admin-utils";

interface ProductPageProps {
  product: SingleProductItemProps;
  relatedContent: RelatedContent;
  reviews: ReviewProps[];
}

const getFeatureId = (feature: any): string => {
  if (!feature) return "";
  if (typeof feature === "string") return feature;
  return String(feature._id || feature.productFeature_id?._id || "");
};

const getFeatureName = (feature: any, fallback: string = "Option"): string => {
  if (!feature) return fallback;
  if (typeof feature === "string") return feature;
  return feature?.productFeature_id?.name || feature?.name || fallback;
};

export default function SingleProductPage({ product, relatedContent, reviews }: ProductPageProps) {
  const { isLoggedIn, hasRole } = useAuth();
  const { sendAction, cart } = useEcom() as { sendAction: Function; cart?: { items?: Array<{ sku_id: string; flavor_id?: string; color_id?: string }> } };
  const { sendWishlistAction, isInWishlist } = useWishlist();
  const handleAddToWishlist = () => sendWishlistAction("add_to_wishlist", { action: "add_to_wishlist", product_id: product._id, sku_id: selectedSku?._id, quantity });

  const [aboutOpen, setAboutOpen] = useState(true);
  const [openBulkModal, setOpenBulkModal] = useState(false);
  const [mounted, setMounted] = useState(false);  
  const images = Array.isArray(product?.mediaHubs) ? product.mediaHubs : [];
  const skus = Array.isArray(product?.sku) ? product.sku : [];  
  const [selectedSku, setSelectedSku] = useState<SkuProps | null>(null);
  const [selectedFlavour, setSelectedFlavour] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  useEffect(() => {
    setMounted(true);
    if (skus.length > 0) {
      const firstSku = typeof skus[0] === "object" ? skus[0] : null;
      if (firstSku) {
        setSelectedSku(firstSku);
        const flavors = filterAndExtractFeatures(
          firstSku?.flavors?.length ? firstSku.flavors : firstSku?.features,
          "Flavor",
          (f) => f
        );
        if (flavors.length > 0) {
          setSelectedFlavour(getFeatureId(flavors[0]));
        }
        const colors = filterAndExtractFeatures(
          firstSku?.colors?.length ? firstSku.colors : firstSku?.features,
          "Color",
          (f) => f
        );
        if (colors.length > 0) {
          setSelectedColor(getFeatureId(colors[0]));
        }
      }
    }
  }, [product]);

  useEffect(() => {
    if (selectedSku) {
      const flavors = filterAndExtractFeatures(
        selectedSku?.flavors?.length ? selectedSku.flavors : selectedSku?.features,
        "Flavor",
        (f) => f
      );
      setSelectedFlavour(flavors.length > 0 ? getFeatureId(flavors[0]) : "");

      const colors = filterAndExtractFeatures(
        selectedSku?.colors?.length ? selectedSku.colors : selectedSku?.features,
        "Color",
        (f) => f
      );
      setSelectedColor(colors.length > 0 ? getFeatureId(colors[0]) : "");
    }
  }, [selectedSku]);

  const [quantity, setQuantity] = useState(1);
  useEffect(() => { setQuantity(1); }, [selectedSku]);

  const isAlreadyInCart = cart?.items?.some(
    (item) => item.sku_id === selectedSku?._id && (!selectedFlavour || item.flavor_id === selectedFlavour) && (!selectedColor || item.color_id === selectedColor)
  );

  const handleAddToCart = () => {
    sendAction('add_to_cart', {
      action: 'add_to_cart',
      sku_id: selectedSku?._id,
      quantity,
      flavor_id: selectedFlavour,
      color_id: selectedColor
    });
  };

  if (!product) { return <p>Product not found</p>; }

  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const handleAddToOrderGuideClick = () => {
      if (!isLoggedIn) { return; }
      setGuideModalOpen(true);
  };

  const handleSelectGuide = async (guideId: string) => {
    try {
        const formData = new FormData();
        formData.append("function", "add_to_order_guide");
        formData.append("order_guide_id", guideId);
        formData.append("product_id", product?._id);
        formData.append("sku_id", selectedSku?._id ?? "");
        formData.append("quantity", quantity.toString());

        const res = await apiRequest("POST", "ecom/wishlist", formData);

        if (res?.data || res?.status === 200) {
          hitToastr("success", res?.message || "Item added to Order Guide successfully!");
          setGuideModalOpen(false);
        }
    } catch (error) {
      console.error("Error adding item to order guide:", error);
      hitToastr("error", "Failed to add item to order guide.");
    }
  };

  return (
    <>
      <div className="container py-5 md:py-12">
        <div className="row">
          <div className="col-span-12 md:col-span-4 space-y-4">
            <ProductImageGallery images={images} productName={product.name}/>
          </div>

          <div className="col-span-12 md:col-span-8 space-y-4 md:pl-5">
            <h1 className="text-xl md:text-3xl font-bold">{product.name}</h1>

            {selectedSku && (
              <div className="flex flex-wrap gap-2 py-2 z-10">
                {selectedSku.eggless_id && ( <Badge>{getProp(selectedSku.eggless_id, "name")}</Badge> )}
                {selectedSku.sugarfree_id && ( <Badge>{getProp(selectedSku.sugarfree_id, "name")}</Badge> )}
                {selectedSku.gluttenfree_id && ( <Badge>{getProp(selectedSku.gluttenfree_id, "name")}</Badge> )}
              </div>
            )}
            {["Storage"].map((module) => ( <MetaRow key={module} label={module} items={product.features?.filter((m) => m.module === module)} basePath="/products/feature"/> ))}
            <MetaRow label="Ingridients" items={product.ingridients}/>

            <ShareMe />

            <ContentRenderer content={product.short_desc || ""}/>

            {skus.length > 0 && (
              <div className="w-full space-y-4">
                <div className="flex flex-wrap gap-3">
                  {skus.map((skuItem: any, index: number) => {
                    const skuId = typeof skuItem === "object" ? skuItem._id : skuItem;
                    const skuName = typeof skuItem === "object" ? skuItem.name : `SKU ${index + 1}`;
                    const isSelected = selectedSku?._id?.toString() === skuId?.toString();

                    return (
                      <label key={skuId?.toString() || index} className={`flex items-center gap-2 border mb-3 rounded-lg px-4 py-2 cursor-pointer transition-all ${isSelected ? "border-[#ec407a] bg-pink-100 text-pink-900" : "border-gray-300 bg-transparent hover:bg-pink-50"}`}>
                        <input type="radio" name="sku-selection" value={skuId} checked={isSelected} className="accent-[#ec407a]"onChange={() => { setSelectedSku(skuItem); }}/>
                        <span className="font-medium text-sm">{skuName}</span>
                      </label>
                    );
                  })}
                </div>

                {selectedSku && filterAndExtractFeatures( selectedSku?.flavors?.length ? selectedSku.flavors : selectedSku?.features, "Flavor", (f) => f ).length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Select Flavour</h3>
                    <div className="flex flex-wrap gap-2">
                      {filterAndExtractFeatures( selectedSku?.flavors?.length ? selectedSku.flavors : selectedSku?.features, "Flavor", (f) => f ).map((flavorItem: any) => {
                        const featureId = getFeatureId(flavorItem);
                        const featureName = getFeatureName(flavorItem, "Flavour");
                        const isSelected = selectedFlavour === featureId;
                        
                        return (
                          <Button key={featureId} type="button"variant={isSelected ? "default" : "outline"} onClick={() => setSelectedFlavour(featureId)} className={isSelected ? "bg-[#ec407a] hover:bg-[#f06292]" : "hover:bg-pink-100"}>{featureName}</Button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedSku && filterAndExtractFeatures(selectedSku?.colors?.length ? selectedSku.colors : selectedSku?.features, "Color", (f) => f ).length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Select Color</h3>
                    <div className="flex flex-wrap gap-2">
                      {filterAndExtractFeatures( selectedSku?.colors?.length ? selectedSku.colors : selectedSku?.features, "Color", (f) => f).map((colorItem: any) => {
                        const featureId = getFeatureId(colorItem);
                        const featureName = getFeatureName(colorItem, "Color");
                        const isSelected = selectedColor === featureId;
                        
                        return (
                          <Button key={featureId} type="button"variant={isSelected ? "default" : "outline"} onClick={() => setSelectedColor(featureId)} className={isSelected ? "bg-[#ec407a] hover:bg-[#f06292]" : "hover:bg-pink-100"}>{featureName}</Button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedSku && ( <h3 className="text-2xl font-bold">INR {Number(selectedSku.price || 0).toFixed(2)}</h3> )}

                <div className="flex flex-wrap items-center gap-4">
                  <QuantitySelector value={quantity} minQuantity={1} onChange={setQuantity} />
                  <Button onClick={handleAddToCart} className="bg-gradient-to-r from-[#f48fb1] to-[#ec407a] text-white rounded-xl px-6 py-2 text-base hover:from-[#ec407a] hover:to-[#f06292]">
                    {isAlreadyInCart ? "Update Cart / Add More" : "Add to Cart"}
                  </Button>
                  <Button className="bg-gradient-to-r from-[#f48fb1] to-[#ec407a] text-white rounded-xl px-6 py-2 text-base hover:from-[#ec407a] hover:to-[#f06292]">Buy now</Button>
                  {isLoggedIn && selectedSku?._id && ( 
                    <button onClick={handleAddToOrderGuideClick} className="h-[52px] rounded-lg border border-neutral-300 px-6 font-medium text-neutral-700 transition-all hover:bg-neutral-100">Add to Order Guide</button>
                  )}
                  {selectedSku?._id && !isInWishlist(product._id.toString(), selectedSku._id.toString()) && ( 
                      <button onClick={handleAddToWishlist} className="h-[52px] rounded-lg border border-neutral-300 px-6 font-medium text-neutral-700 transition-all hover:bg-neutral-100">Add to Wishlist</button> 
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="col-span-12 space-y-4 mt-6">
            <Button onClick={() => setOpenBulkModal(true)} className="bg-gradient-to-r from-[#f48fb1] to-[#ec407a] text-white rounded-xl px-6 py-2 text-base hover:from-[#ec407a] hover:to-[#f06292]">Bulk Order</Button>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-medium text-foreground">About {product.name}</h3>
              <Button variant="outline" size="icon" onClick={() => setAboutOpen(!aboutOpen)} className="rounded-full border-[#ec407a] w-8 h-8 p-0">
                {aboutOpen ? <ChevronUp className="h-4 w-4 text-[#ec407a]" /> : <ChevronDown className="h-4 w-4 text-[#ec407a]" />}
              </Button>
            </div>

            {aboutOpen && product.long_desc && ( <div className="text-muted-foreground mt-2" dangerouslySetInnerHTML={{ __html: product.long_desc }} /> )}
          </div>
        </div>
      </div>

      <FaqPanel faq={relatedContent.faq} />
      <SuggestTestimonial testimonials={relatedContent.testimonials} />

      <ReviewPanel reviews={reviews} module="Product" module_id={product?._id} />
      <SuggestProducts data={relatedContent.products} />
      <SuggestBlogs data={relatedContent.blogs} />

      <BulkOrderModal isOpen={openBulkModal} onClose={() => setOpenBulkModal(false)} product_id={product?._id as string || ""} sku_id={selectedSku?._id as string || ""} seller_id={product?.seller_id as unknown as string || ""}/>
      <OrderGuideModal open={guideModalOpen} handleClose={() => setGuideModalOpen(false)} onSelectGuide={handleSelectGuide}/>
    </>
  );
}