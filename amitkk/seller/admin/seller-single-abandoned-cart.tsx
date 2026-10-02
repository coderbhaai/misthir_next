"use client";

import { useEffect, useState } from "react";
import { apiRequest, clo } from "@amitkk/basic/utils/my-utils/admin-utils";
import ImageWithFallback from "@amitkk/basic/static/ImageWithFallback";
import { CartProps, CartSkuProps } from '@amitkk/ecom/types';
import PaymentStatic from "@amitkk/ecom/static/PaymentStatic";
import { semiAddress } from "@amitkk/address/utils/addressUtils";
import CartCharges from "@amitkk/ecom/static/CartCharges";
import VendorDiscountModal from "@amitkk/seller/admin/VendorDiscountModal";
import dayjs from "dayjs";
import { TextField } from "@amitkk/components/basic/TextField";
import { Button } from "@amitkk/components/button/button";
import { Checkbox } from "@amitkk/components/basic/checkbox";
import { Textarea } from "@amitkk/components/basic/textarea";
import { Separator } from "@amitkk/components/ui/separator";
import { Card } from "@amitkk/components/ui/card";
import { Percent } from "lucide-react";

interface DataFormProps {
    dataId?: string;
} 

export const SellerSingleAbandonedCart: React.FC<DataFormProps> = ({ dataId = "" }) => {
  const [cart, setCart] = useState<CartProps | null>(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [openDiscountModal, setOpenDiscountModal] = useState(false);
  
  const fetchSingleEntry = async () => {
    if (!dataId) return;

    try {
      const res = await apiRequest("GET", `ecom/ecom?function=get_single_abdandoned_cart&id=${dataId}`);
      if (res?.data) {
        const cartData = res.data as CartProps;
        setCart(cartData);

        const itemCount = (cartData.cartSkus || []).reduce(
          (sum, sku: any) => sum + (sku?.quantity || 0),
          0
        );
        setCartItemCount(itemCount);
      }
    } catch (error) { clo(error); }
  };

  useEffect(() => { fetchSingleEntry(); }, [dataId]);

  const [selectedSku, setSelectedSku] = useState<CartSkuProps | null>(null);

  if( !cart ){ return null; }
   return (
    <div className="row py-6">
      {/* Left Column: Contact, Addresses, and Payment */}
      <div className="col-span-12 md:col-span-7 space-y-6">
        <div>
          <h3 className="font-semibold text-lg mb-4">Contact</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <TextField name="email" value="XXXXXXXX" disabled />
              </div>
              <div className="flex items-center space-x-2 pt-1">
                <Checkbox id="email-news" checked={Boolean(cart?.email)} disabled />
                <label htmlFor="email-news" className="text-xs text-muted-foreground">
                  Email me with news and offers
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">WhatsApp</label>
                <TextField name="whatsapp" value="XXXXXXXX" disabled />
              </div>
              <div className="flex items-center space-x-2 pt-1">
                <Checkbox id="whatsapp-news" checked={Boolean(cart?.whatsapp)} disabled />
                <label htmlFor="whatsapp-news" className="text-xs text-muted-foreground">
                  Whatsapp me with news and offers
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Button variant="outline" className="w-full sm:w-auto">
            Create Shipping Address
          </Button>
          <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">{semiAddress(cart.shipping_address_id)}</p>
        </div>

        <div className="space-y-6 pt-4 border-t border-border">
          <PaymentStatic />

          <div className="space-y-2">
            <Button variant="outline" className="w-full sm:w-auto">
              Create Billing Address
            </Button>
            <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">{semiAddress(cart.billing_address_id)}</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Add a Note</label>
              <Textarea rows={3} value={cart?.user_remarks || ""} disabled />
            </div>

            <div className="text-sm">
              <strong className="text-foreground">Payment Method:</strong> {cart?.paymode}
            </div>

            <Button className="w-full bg-black text-white hover:bg-black/90 py-6">
              Pay Now
            </Button>
          </div>
        </div>
      </div>

      {/* Vertical Divider */}
      <div className="hidden md:block md:col-span-1 flex justify-center">
        <Separator orientation="vertical" className="h-full" />
      </div>

      {/* Right Column: Cart Items Sidebar & Charges */}
      <div className="col-span-12 md:col-span-4">
        <div className="rounded-2xl p-4 border border-border bg-card sticky top-5 space-y-4 shadow-sm">
          <div className="max-h-[400px] overflow-y-auto space-y-3 pr-1">
            {cart && cart?.cartSkus?.map((item) => {
              const vendorDiscount = item.vendor_discount != null ? Number(item.vendor_discount) : null;
              const hasVendorDiscount = vendorDiscount !== null && !Number.isNaN(vendorDiscount);
              const validityDate = item.vendor_discount_validity ? new Date(item.vendor_discount_validity) : null;
              const validityValue = item.vendor_discount_validity_value;
              const validityUnit = item.vendor_discount_unit;
              const now = new Date();
              const isExpired = validityDate ? validityDate.getTime() < now.getTime() : false;

              return (
                <Card key={item._id?.toString()} className="p-3 shadow-none border border-border space-y-3">
                  <div className="flex items-center gap-3">
                    <ImageWithFallback
                      img={item.product_id?.medias?.[0]}
                      width={80}
                      height={80}
                      className="rounded-md object-cover"
                    />
                    <div className="flex-grow">
                      <p className="text-sm font-semibold">{item.sku_id?.name}</p>
                    </div>
                    <p className="text-sm font-bold">₹{item.sku_id?.price}</p>
                  </div>

                  <div className="flex items-center justify-between bg-muted/40 p-2 rounded-md">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-7 w-7">-</Button>
                      <span className="text-sm font-medium">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-7 w-7">+</Button>
                    </div>
                    <p className="text-sm font-bold">
                      ₹{item.quantity * Number(item.sku_id?.price ?? 0)}
                    </p>
                  </div>

                  <Button
                    variant="secondary"
                    className="w-full flex flex-col items-center py-2 h-auto text-xs font-normal"
                    onClick={() => setSelectedSku(item)}
                  >
                    <div className="flex items-center gap-1 font-medium">
                      <Percent className="w-3.5 h-3.5" />
                      <span>Set Discount</span>
                    </div>

                    {hasVendorDiscount && (
                      <span className="text-[11px] text-muted-foreground mt-0.5">
                        ₹{vendorDiscount}{" "}
                        {validityDate ? (
                          <span>Per Unit (till {dayjs(validityDate).format("DD MMM YYYY HH:mm")})</span>
                        ) : validityValue ? (
                          <span>(for {validityValue} {validityUnit})</span>
                        ) : null}
                        {isExpired && <span> — expired</span>}
                      </span>
                    )}
                  </Button>
                </Card>
              );
            })}
          </div>

          <CartCharges
            itemCount={cart?.cartSkus?.length || 0}
            cartCharges={cart?.cartCharges}
          />

          <Button
            className="w-full bg-black text-white hover:bg-black/90 py-5"
            onClick={() => setOpenDiscountModal(true)}
          >
            Give Additional Discount
          </Button>
        </div>
      </div>

      {selectedSku && (
        <VendorDiscountModal
          open={Boolean(selectedSku)}
          handleClose={() => setSelectedSku(null)}
          cartSku={selectedSku}
          limit={Number(selectedSku.sku_id?.price ?? 0)}
          refreshCart={fetchSingleEntry}
        />
      )}
    </div>
  );
}

export default SellerSingleAbandonedCart;