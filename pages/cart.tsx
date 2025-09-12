"use client";
import { Grid, Box, Typography, RadioGroup, Paper, Radio, TextField, FormControl, Checkbox, FormControlLabel, MenuItem, Button, Divider } from "@mui/material";
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PaymentIcon from '@mui/icons-material/Payment';
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { apiRequest, clo } from "@amitkk/basic/utils/utils";
import { AddressProps } from "@amitkk/address/types/address";
import { useAuth } from "contexts/AuthContext";
import { useEcom } from "contexts/EcomContext";
import CartList from "@amitkk/ecom/static/CartList";
import AddressSelectionDropdown from "@amitkk/address/static/AddressSelectionDropdown";
import DataModal from "@amitkk/user/admin/user-address-modal";
import SuggestProducts from "@amitkk/product/static/suggest-products";

export default function CheckoutPage() {
  const { sendAction, cart, relatedProducts } = useEcom();
  const { isLoggedIn, user } = useAuth();
  const [same_as_shipping, setSameAsShipping] = useState(true);
  const [addressType, setAddressType] = useState<"shipping" | "billing">("shipping");
  const [shipping_address_id, setShippingAddressId] = useState("");
  const [billing_address_id, setBillingAddressId] = useState("");
  const [userId, setUserId] = useState<string | undefined>("");
  const [openAddressModal, setOpenAddressModal] = useState(false);
  const [selectedAddressToEdit, setSelectedAddressToEdit] = useState<string | number | null>(null);
  const [orderNote, setOrderNote] = useState("");

  useEffect(() => {
    if (cart?.user_remarks) {
      setOrderNote(cart.user_remarks);
    }
  }, [cart]);

  const [email, setEmail] = useState('');
  useEffect(() => {
    if (isLoggedIn && user) {
      setEmail(user.email ?? '');
      setUserId(user._id ?? '')
    }
  }, [isLoggedIn, user]);

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

  const handleCloseModal = () => {
    setOpenAddressModal(false);
    setSelectedAddressToEdit(null);
  };

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

  console.log('Address ID', shipping_address_id, billing_address_id)

  function placeOrder(){
    console.log('placeOrder Called')
  }

  return (
    <>
      <Grid container spacing={4} sx={{ px: 2, py: 4, width: "85vw", mx: "auto" }}>      
        <Grid size={7}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Contact</Typography>
          <TextField fullWidth label="Email" sx={{ mb: 2 }} name="email" value={email}/>
          <FormControlLabel control={<Checkbox defaultChecked />} label="Email me with news and offers" />

          <AddressSelectionDropdown label="Select Shipping Address" addressOptions={addressOptions} selectedAddressId={shipping_address_id} onSelect={(id) => { setShippingAddressId(id); updateCartShippingAddress(id); }} onEdit={(id) => { setSelectedAddressToEdit(id); setOpenAddressModal(true); }}/>

          <Button variant="contained" color="primary" onClick={() => { setAddressType("shipping");  setOpenAddressModal(true); }}>Create Shipping Address</Button>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid size={12}>
              <Paper sx={{ p: 2, bgcolor: "#d6d6d6", border: "1px solid black", borderRadius: "15px 15px 0 0" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2">PhonePe Secure (UPI, Cards, Wallets, NetBanking)</Typography>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <CreditCardIcon/>
                    <PaymentIcon/>
                    <PaymentIcon/>
                    <PaymentIcon/>
                  </Box>
                </Box>
                <Box sx={{ mt: 6, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                  {/* <Image src="/images/payment.svg" alt="Payment Methods" width={200} height={50} /> */}
                  <Typography sx={{ mt: 2 }} variant="body2">
                    After clicking “Pay now”, you will be redirected to PhonePe Secure (UPI, Cards, Wallets, NetBanking) to complete your purchase securely.
                  </Typography>
                </Box>
              </Paper>
            </Grid>

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
              <Button variant="contained" fullWidth sx={{ backgroundColor: "black", color: "white", py:3, my:3 }}
                onClick={() => { placeOrder() }}
              >Pay Now</Button>
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
    </>
  );
}