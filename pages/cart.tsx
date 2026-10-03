"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiRequest, clo, hitToastr, isValidEmail } from "@amitkk/basic/utils/my-utils/admin-utils";
import { useAuth } from "contexts/AuthContext";
import CartList from "@amitkk/ecom/static/CartList";
import AddressSelectionDropdown from "@amitkk/address/static/AddressSelectionDropdown";
import SuggestProducts from "@amitkk/product/static/suggest-products";
import BlankCart from "@amitkk/ecom/static/BlankCart";
import router from "next/router";
import { useEcom } from "contexts/EcomContext";
import { AddressProps } from "@amitkk/address/types";
import { Textarea } from "@amitkk/components/basic/textarea";
import { SiteSettingProps } from "@amitkk/payment/types";
import { BooleanRadioGroup } from "@amitkk/components/basic/BooleanRadioGroup";
import BackOrdersList from "@amitkk/ecom/static/BackOrdersList";
import CreateUpdateAddressModal from "@amitkk/address/static/create-address-modal";
import ContactInfoSection from "@amitkk/ecom/static/ContactInfoSection";

export default function CheckoutPage() {
  const { fetchCart, sendAction, cart, relatedProducts } = useEcom();
  const { isLoggedIn, user } = useAuth();
  const [orderNote, setOrderNote] = useState("");
  const [same_as_shipping, setSameAsShipping] = useState(true);
  const [addressType, setAddressType] = useState<"shipping" | "billing">("shipping");
  const [shipping_address_id, setShippingAddressId] = useState("");
  const [billing_address_id, setBillingAddressId] = useState("");
  const [openAddressModal, setOpenAddressModal] = useState(false);
  const [selectedAddressToEdit, setSelectedAddressToEdit] = useState<string | number | null>(null);
  const [addressOptions, setAddressOptions] = useState<AddressProps[]>([]);
  const [paymode, setPaymode] = useState("Online");
  const [allowCod, setAllowCod] = useState(false);
  const [siteSetting, setSiteSetting] = useState<SiteSettingProps[]>([]);
  const isTogglingRef = useRef(false);

  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [emailConsent, setEmailConsent] = useState<boolean>(false);
  const [phoneConsent, setPhoneConsent] = useState<boolean>(false);

  const updateCartDetails = useCallback(
    (overrides: Partial<{
      paymode: string;
      shipping_address_id: string | null;
      billing_address_id: string | null;
      user_remarks: string;
      delivery_date: string;
      email: string;
      phone: string;
      emailConsent: boolean;
      phoneConsent: boolean;
    }> = {}) => {
      sendAction("update_cart_array", {
        action: "update_cart_array",
        update: {
          email, phone, 
          emailConsent: overrides.emailConsent ?? emailConsent,
          phoneConsent: overrides.phoneConsent ?? phoneConsent,
          paymode: overrides.paymode ?? paymode,
          shipping_address_id: overrides.shipping_address_id !== undefined ? overrides.shipping_address_id : (shipping_address_id || null),
          billing_address_id: overrides.billing_address_id !== undefined ? overrides.billing_address_id : (billing_address_id || null),
          user_remarks: overrides.user_remarks ?? orderNote,
        },
      });
    },

    [sendAction, paymode, shipping_address_id, billing_address_id, orderNote]
  );

  const fetchAddresses = useCallback(async () => {
    if (!isLoggedIn) return;

    try {
      const res = await apiRequest("POST", "address/address", {
        function: "get_my_addresses",
      });
      setAddressOptions(res?.data ?? []);
    } catch (error) { clo(error); }
  }, [isLoggedIn]);

  useEffect(() => { fetchAddresses(); }, [fetchAddresses]);

  function syncAddresses() {
    fetchAddresses();
    if (!cart) return;

    const shippingId = String(cart.shipping_address_id) ?? "";
    const billingId = String(cart.billing_address_id) ?? "";
    const isSame = Boolean(shippingId && billingId && shippingId === billingId);
    if (!isTogglingRef.current) {
      setSameAsShipping(isSame);
    }
    
    setShippingAddressId(shippingId);
    setBillingAddressId(isSame ? shippingId : billingId);
  }

  useEffect(() => {
    if (!cart) return;

    setOrderNote(cart.user_remarks ?? "");
    setPaymode(cart.paymode);
    syncAddresses();
  }, [cart]);

  function updateCartShippingAddress(addressId: string) {
    const value = addressId === "" ? null : addressId;
    updateCartDetails({ shipping_address_id: value });
    syncAddresses();
  }

  function updateCartBillingAddress(addressId: string) {
    const value = addressId === "" ? null : addressId;
    updateCartDetails({ billing_address_id: value });
    syncAddresses();
  }

  const handleCloseModal = () => {
    setOpenAddressModal(false);
    setSelectedAddressToEdit(null);
  };

  const syncAddressContactInfo = useCallback(async () => {
    if (!isLoggedIn) return;

    const targetAddressIds = Array.from(
      new Set([shipping_address_id, billing_address_id].filter(Boolean))
    );

    if (targetAddressIds.length === 0) return;

    const getId = (val: any) => {
      if (!val) return "";
      if (typeof val === "object" && val._id) return String(val._id);
      return String(val);
    };

    try {
      await Promise.all(
        targetAddressIds.map(async (addressId) => {
          const activeAddress = addressOptions.find(
            (addr: any) =>
              String(addr._id) === String(addressId) ||
              String(addr.id) === String(addressId)
          );

          if (!activeAddress) return;

          const formDataToSend = new FormData();
          formDataToSend.append("function", "create_update_address");
          formDataToSend.append("_id", String(addressId));
          formDataToSend.append("name", activeAddress.name || "N/A");
          formDataToSend.append("email", email);
          formDataToSend.append("phone", phone);
          formDataToSend.append("whatsapp", phone);

          formDataToSend.append("country_id", getId(activeAddress.country_id));
          formDataToSend.append("state_id", getId(activeAddress.state_id));
          formDataToSend.append("city_id", getId(activeAddress.city_id));

          formDataToSend.append("address1", activeAddress.address1 ?? "");
          formDataToSend.append("address2", activeAddress.address2 ?? "");
          formDataToSend.append("pin", activeAddress.pin ?? "");
          formDataToSend.append("landmark", activeAddress.landmark ?? "");
          formDataToSend.append("status", String(activeAddress.status ?? true));

          return apiRequest("POST", "address/address", formDataToSend);
        })
      );

      fetchAddresses();
    } catch (error) { clo(error); }
  }, [shipping_address_id, billing_address_id, isLoggedIn, addressOptions, email, phone, fetchAddresses]);

  const fetchSiteSetting = useCallback(async () => {
    try {
      const res = await apiRequest("GET", "payment/payment?function=get_site_settings");
      setSiteSetting(res?.data ?? []);
    } catch (error) { clo(error); }
  }, []);

  useEffect(() => { fetchSiteSetting(); }, [fetchSiteSetting]);

  useEffect(() => {
    const codSetting = siteSetting.find((s: any) => s.module === "Allow Cod" && s.status === true);
    setAllowCod(codSetting?.module_value === "1");
  }, [siteSetting]);

  const updatePaymode = (newPaymode: string) => {
    setPaymode(newPaymode);
    updateCartDetails({ paymode: newPaymode });
  };

  useEffect(() => {
    if (!shipping_address_id || addressOptions.length === 0) return;

    const selectedShippingAddress = addressOptions.find(
      (addr: any) => String(addr._id) === String(shipping_address_id) || String(addr.id) === String(shipping_address_id)
    );

    if (selectedShippingAddress) {
      setEmail(selectedShippingAddress.email ?? user?.email ?? "");
      setPhone(selectedShippingAddress.phone ?? user?.phone ?? "");
    }
  }, [shipping_address_id, addressOptions, user]);

  const validateContactInfo = (): boolean => {
    if (!email.trim() || !isValidEmail(email)) { hitToastr("error", "Please provide a valid Email before adding or choosing an address."); return false; }
    if (!phone.trim()) { hitToastr("error", "Please provide a valid Phone number before adding or choosing an address."); return false; }
    return true;
  };

  const handleOpenAddressModal = (type: "shipping" | "billing", editId: string | number | null = null) => {
    if (!validateContactInfo()) return;

    setAddressType(type);
    setSelectedAddressToEdit(editId);
    setOpenAddressModal(true);
  };

  async function placeOrder() {
    if (!shipping_address_id) { hitToastr("error", "Shipping address is required"); return; }
    if (!billing_address_id) { hitToastr("error", "Billing address is required"); return; }
    if (!paymode) { hitToastr("error", "Paymode is required"); return; }

    if (cart?.payable_amount !== 0) {
      try {
        const res = await apiRequest("POST", "ecom/ecom", {
          function: "place_order",
        });

        await fetchCart();
        if (res?.data?.status) {
          router.push(`/order/${res?.data?.order_id}`);
        }
      } catch (error) { clo(error); }
      return;
    }
  }

  useEffect(() => {
    const consent = cart?.cartConsent;
    if (consent && (consent.email || consent.phone)) {
      setEmail(consent.email ?? "");
      setPhone(consent.phone ?? "");
      setEmailConsent(Boolean(consent.emailConsent));
      setPhoneConsent(Boolean(consent.phoneConsent));
      return;
    }

    if (isLoggedIn && user && (user.email || user.phone)) {
      setEmail(user.email ?? "");
      setPhone(user.phone ?? "");
      return;
    }

    if (shipping_address_id && addressOptions.length > 0) {
      const selectedShippingAddress = addressOptions.find( (addr: any) => String(addr._id) === String(shipping_address_id) || String(addr.id) === String(shipping_address_id) );
      if (selectedShippingAddress) {
        setEmail(selectedShippingAddress.email ?? "");
        setPhone(selectedShippingAddress.phone ?? "");
      }
    }
  }, [cart, isLoggedIn, user, shipping_address_id, addressOptions]);

  useEffect(() => {
    if (!cart) return;
    setOrderNote(cart.user_remarks ?? "");
    setPaymode(cart.paymode);
    syncAddresses();
  }, [cart]);

  if ( !cart || !cart.cartSkus || !cart.cartSkus.length ) { return <BlankCart relatedProducts={relatedProducts} />; }

  return (
    <>
      <div className="container mx-auto px-2 py-8">
        <div className="row items-start">
          <div className="col-span-12 md:col-span-7 space-y-6">
            <div>
              <h1 className="text-lg font-bold mb-3 text-foreground">My Cart</h1>
              <ContactInfoSection email={email} setEmail={setEmail} phone={phone} setPhone={setPhone} emailConsent={emailConsent} phoneConsent={phoneConsent} onBlur={syncAddressContactInfo} setEmailConsent={(val) => { setEmailConsent(val); updateCartDetails({ emailConsent: val }); }} setPhoneConsent={(val) => { setPhoneConsent(val); updateCartDetails({ phoneConsent: val }); }}/>
            </div>

            <AddressSelectionDropdown label="Select Delivery Address" addressOptions={addressOptions} selectedAddressId={shipping_address_id} onSelect={(id) => { setShippingAddressId(id); updateCartShippingAddress(id); }} onEdit={(id) => handleOpenAddressModal("shipping", id)} onAddAddress={() => handleOpenAddressModal("shipping")} />

            <div className="pt-2">
              <div className="space-y-2">
                <BooleanRadioGroup name="billing_option" value={same_as_shipping} options={[ { label: "Same as shipping address", value: true }, { label: "Use a different billing address", value: false } ]}
                  onChange={(val) => {
                    isTogglingRef.current = true;
                    setSameAsShipping(val);

                    const targetBillingId = val ? shipping_address_id : billing_address_id;
                    if (val) { setBillingAddressId(shipping_address_id); }

                    sendAction("update_cart_array", {
                      action: "update_cart_array",
                      update: {
                        paymode: paymode,
                        shipping_address_id: shipping_address_id || null,
                        billing_address_id: targetBillingId || null,
                        user_remarks: orderNote,
                        email, phone, emailConsent, phoneConsent,
                      },
                    });

                    setTimeout(() => {
                      isTogglingRef.current = false;
                    }, 1000);
                  }}/>
              </div>

              {!same_as_shipping && (
                <div className="mt-4 pt-4 border-t border-border space-y-3">
                  <AddressSelectionDropdown label="Select Billing Address" addressOptions={addressOptions} selectedAddressId={billing_address_id} onSelect={(id) => { setBillingAddressId(id); updateCartBillingAddress(id); }} onEdit={(id) => handleOpenAddressModal("billing", id)} onAddAddress={() => handleOpenAddressModal("billing")}/>
                </div>
              )}
            </div>

            <div className="space-y-4 pt-2">
              <Textarea label="Delivery Instructions" value={orderNote} name="content" onChange={(e) => setOrderNote(e.target.value)} onBlur={() => updateCartDetails({ user_remarks: orderNote })} rows={2}/>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">Payment Method</label>
                <select value={paymode} onChange={(e) => updatePaymode(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="Online">Online</option>
                  {allowCod && <option value="COD">Cash on Delivery</option>}
                </select>
              </div>

              <div className="my-6 space-y-2">
                <button type="button" onClick={() => placeOrder()} className={`w-full py-3 rounded-md font-medium text-sm transition-colors bg-black text-white hover:bg-black/90`}>Place Order</button>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-5 border-t md:border-t-0 md:border-l border-border pt-6 md:pt-0 md:pl-8">
            <CartList/>
            {/* <BackOrdersList backOrders={cart.backOrders} /> */}
          </div>
        </div>
      </div>

      <SuggestProducts data={relatedProducts} />

      <CreateUpdateAddressModal open={openAddressModal} handleClose={handleCloseModal} selectedDataId={selectedAddressToEdit} email={email} phone={phone} handleUpdate={(addressId: string) => {
          if (addressType === "shipping") {
            updateCartShippingAddress(addressId);
          } else {
            updateCartBillingAddress(addressId);
          }
        }}
      />
    </>
  );
}