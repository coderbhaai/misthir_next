"use client";
import { Grid, Box, Typography, RadioGroup, Radio, TextField, FormControl, Checkbox, FormControlLabel, MenuItem, Button, Divider, InputLabel, Select, SelectChangeEvent } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { apiRequest, clo, hitToastr, isValidEmail, isValidWhatsapp } from "@amitkk/basic/utils/utils";
import { AddressProps } from "@amitkk/address/types/address";
import { useAuth } from "contexts/AuthContext";
import { useEcom } from "contexts/EcomContext";
import CartList from "@amitkk/ecom/static/CartList";
import AddressSelectionDropdown from "@amitkk/address/static/AddressSelectionDropdown";
import DataModal from "@amitkk/user/admin/user-address-modal";
import SuggestProducts from "@amitkk/product/static/suggest-products";
import { SiteSetting } from "@amitkk/basic/types/page";
import PaymentStatic from "@amitkk/ecom/static/PaymentStatic";
import { makePayment } from "@amitkk/payment/utils/utils";
import Script from "next/script";

export default function CheckoutPage() {
  const { sendAction, cart, relatedProducts } = useEcom();
  const { isLoggedIn, user } = useAuth();
  const [userId, setUserId] = useState<string | undefined>("");
  const [orderNote, setOrderNote] = useState("");
  
  // Address
    const [same_as_shipping, setSameAsShipping] = useState(true);
    const [addressType, setAddressType] = useState<"shipping" | "billing">("shipping");
    const [shipping_address_id, setShippingAddressId] = useState("");
    const [billing_address_id, setBillingAddressId] = useState("");
    const [openAddressModal, setOpenAddressModal] = useState(false);
    const [selectedAddressToEdit, setSelectedAddressToEdit] = useState<string | number | null>(null);
    const [addressOptions, setAddressOptions] = useState<AddressProps[]>([]);
    const fetchAddresses = useCallback(async () => {
        if( !isLoggedIn ){ return; }

        try {
            const res = await apiRequest("get", "address/address?function=get_my_addresses");
            setAddressOptions(res?.data ?? []);
        } catch (error) { clo( error ); }
    }, [isLoggedIn]);

    useEffect(() => { fetchAddresses(); }, [fetchAddresses]);

    function syncAddresses() {
      fetchAddresses();
      if (!cart) return;

      const shippingId = cart.shipping_address_id ?? '';
      let billingId = cart.billing_address_id ?? '';

      if (same_as_shipping) {
        billingId = shippingId;
      }

      setShippingAddressId(shippingId);
      setBillingAddressId(billingId);

      if (shippingId && billingId && shippingId === billingId) {
        setSameAsShipping(true);
      } else if (shippingId && billingId && shippingId !== billingId) {
        setSameAsShipping(false);
      }
    }

    useEffect(() => { syncAddresses(); }, [cart]);

    function updateCartShippingAddress(addressId: string) {
      sendAction('update_cart_array', {
        action: 'update_cart_array',
        update: { shipping_address_id: addressId },
      });

      syncAddresses();
    }

    function updateCartBillingAddress(addressId: string) {
      sendAction('update_cart_array', {
        action: 'update_cart_array',
        update: { billing_address_id: addressId },
      });

      syncAddresses();
    }

    const handleCloseModal = () => {
      setOpenAddressModal(false);
      setSelectedAddressToEdit(null);
    };
  // Address

  // Paymode
      const [paymode, setPaymode] = useState("Online");
      const [allowCod, setAllowCod] = useState(false);
      const [siteSetting, setSiteSetting] = useState<SiteSetting[]>([]);
      const fetchSiteSetting = useCallback(async () => {      
          try {
              const res = await apiRequest("get", "basic/basic?function=get_site_settings");
              setSiteSetting(res?.data ?? []);
          } catch (error) { clo( error ); }
      }, []);

      useEffect(() => { fetchSiteSetting(); }, [fetchSiteSetting]);

      useEffect(() => {
        const codSetting = siteSetting.find( (s: any) => s.module === "Allow Cod" && s.status === true );
        setAllowCod(codSetting?.module_value === "1");
      }, [siteSetting]);

      const updatePaymode = (newPaymode: string) => {
        setPaymode(newPaymode);

        sendAction("update_cart_array", {
          action: "update_cart_array",
          update: { paymode: newPaymode },
        });
      };
  // Paymode

  // CART
      const [email, setEmail] = useState('');
      const [emailCheckbox, setEmailCheckbox] = useState(false);
      const [whatsapp, setWhatsapp] = useState('');
      const [whatsappCheckbox, setWhatsappCheckbox] = useState(false);

      useEffect(() => {
        if (!cart) { return; }

        setOrderNote(cart.user_remarks ?? '');
        setPaymode(cart.paymode ?? 'Online');
        setEmail(cart.email ?? '');
        setEmailCheckbox(cart.email ? true: false );
        setWhatsapp(cart.whatsapp ?? '');
        setWhatsappCheckbox(cart.email ? true: false );
      }, [cart]);

      useEffect(() => {
        if (isLoggedIn && user) {
          setEmail(user.email ?? '');
          setWhatsapp(user.phone ?? '');
          setUserId(user._id ?? '')
        }
      }, [isLoggedIn, user]);

      const updateEmailCheckbox = () => {
        if (!isValidEmail(email)) { return; }
        
        sendAction("update_cart_array", {
          action: "update_cart_array",
          update: { email, emailConsent: emailCheckbox },
        });
      };

      const updateWhatsappCheckbox = () => {
        if (!isValidWhatsapp(whatsapp)) { return; }

        sendAction("update_cart_array", {
          action: "update_cart_array",
          update: { whatsapp, whatsappConsent: whatsappCheckbox },
        });
      };
  // CART

  async function placeOrder(){
    if( !shipping_address_id ){ hitToastr('error', "Shipping address is required"); return; }
    if( !billing_address_id ){ hitToastr('error', "Billing address is required"); return; }
    if( !paymode ){ hitToastr('error', "Paymode is required"); return; }

    if( paymode == "Cod" && allowCod ){
      try {
        const res = await apiRequest("post", "ecom/ecom", { function: "place_order" });
        if( res?.status ){
          console.log("Redirect to ", res)
        }

      } catch (error) { clo( error ); }
    }
    makePayment({ module: "Cart", module_id: cart._id });
  }

  return (
    <>
      <Grid container spacing={4} sx={{ px: 2, py: 4, width: "85vw", mx: "auto" }}>      
        <Grid size={7}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Get Regular Offers</Typography>
          <Box sx={{ display:'flex', alignItems: 'center'}}>
            <Box sx={{ mr: 3}}>
              <TextField fullWidth label="Email" sx={{ mb: 2 }} name="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={updateEmailCheckbox}/>
              <FormControlLabel control={<Checkbox checked={emailCheckbox} onChange={(e) => { setEmailCheckbox(e.target.checked); updateEmailCheckbox(); }}/>} label="Email me with news and offers" />
            </Box>
            <Box>
              <TextField fullWidth label="WhatsApp" sx={{ mb: 2 }} name="whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} onBlur={updateWhatsappCheckbox}/>
              <FormControlLabel control={<Checkbox checked={whatsappCheckbox} onChange={(e) => { setWhatsappCheckbox(e.target.checked); updateWhatsappCheckbox(); }} />} label="Whatsapp me with news and offers" />
            </Box>
          </Box>

          <AddressSelectionDropdown label="Select Shipping Address" addressOptions={addressOptions} selectedAddressId={shipping_address_id} onSelect={(id) => { setShippingAddressId(id); updateCartShippingAddress(id); }} onEdit={(id) => { setSelectedAddressToEdit(id); setOpenAddressModal(true); }}/>

          <Button variant="contained" color="primary" onClick={() => { setAddressType("shipping");  setOpenAddressModal(true); }}>Create Shipping Address</Button>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <PaymentStatic/>

            <Grid size={12}>
              <Box>
                <FormControl>
                  <RadioGroup value={same_as_shipping} onChange={(e) => setSameAsShipping(e.target.value === "true")}>
                    <FormControlLabel value="true" control={<Radio />} label="Same as shipping address" />
                    <FormControlLabel value="false" control={<Radio />} label="Use a different billing address" />
                  </RadioGroup>
                </FormControl>

                {!same_as_shipping && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>Billing Address</Typography>

                    <Grid size={12}>
                    <AddressSelectionDropdown label="Select Billing Address" addressOptions={addressOptions} selectedAddressId={billing_address_id} onSelect={(id) => { setBillingAddressId(id); updateCartShippingAddress(id); }} onEdit={(id) => { setSelectedAddressToEdit(id); setOpenAddressModal(true); }}/>

                    <Button variant="contained" color="primary" onClick={() => { setAddressType("billing"); setOpenAddressModal(true); }}>Create Billing Address</Button>
                    </Grid>
                  </Box>
                )}
              </Box>
            </Grid>

            <Grid size={12}>
              <TextField label="Add a Note" fullWidth size="small" multiline minRows={3} value={orderNote} onChange={(e) => setOrderNote(e.target.value)}/>

              <Box sx={{ mt: 2 }}>
                {allowCod ? (
                  <FormControl fullWidth>
                    <InputLabel id="paymode-label">Payment Method</InputLabel>
                    <Select labelId="paymode-label" value={paymode} label="Payment Method" onChange={(e: SelectChangeEvent) => updatePaymode(e.target.value)}>
                      <MenuItem value="Online">Online</MenuItem>
                      <MenuItem value="Cod">Cash on Delivery</MenuItem>
                    </Select>
                  </FormControl>
                ) : (
                  <Box><strong>Payment Method:</strong> Online</Box>
                )}
              </Box>

              <Button variant="contained" fullWidth sx={{ backgroundColor: "black", color: "white", py:3, my:3 }}
                onClick={() => { placeOrder() }}>Pay Now</Button>
            </Grid>
          </Grid>
        </Grid>

        <Divider orientation="vertical" flexItem />
        <Grid size={4}>
            <CartList/>
        </Grid>

        {relatedProducts && relatedProducts.length && ( <SuggestProducts products={relatedProducts}/> )}
      </Grid>

      <DataModal open={openAddressModal} handleClose={handleCloseModal} selectedDataId={selectedAddressToEdit} userId={userId}
        onUpdate={(data: { _id: string }) => {
          if (addressType === "shipping") {
            updateCartShippingAddress(data._id);
          } else {
            updateCartBillingAddress(data._id);
          }
          handleCloseModal();
        }}/>

      {/* <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive"/> */}
    </>
  );
}