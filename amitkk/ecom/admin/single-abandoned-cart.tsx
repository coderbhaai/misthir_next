"use client";

import { Grid, Box, Typography, RadioGroup, Paper, Radio, TextField, FormControl, Checkbox, FormControlLabel, Button, Divider, Card, List, ListItem } from "@mui/material";
import { useEffect, useState } from "react";
import { apiRequest, clo } from "@amitkk/basic/utils/utils";
import ImageWithFallback from "@amitkk/basic/static/ImageWithFallback";
import { CartProps } from '@amitkk/ecom/types/ecom';
import PaymentStatic from "@amitkk/ecom/static/PaymentStatic";
import { ProductProps, SkuProps } from "@amitkk/product/types/product";
import { ImageObject } from "@amitkk/basic/types/page";
import { fullAddress } from "@amitkk/address/utils/addressUtils";
import CartCharges from "@amitkk/ecom/static/CartCharges";
import AdminAdditionalDiscountModal from "@amitkk/ecom/admin/admin-additional-discount-modal";

interface DataFormProps {
    dataId?: string;
} 

export const SingleAbandoneCart: React.FC<DataFormProps> = ({ dataId = "" }) => {
  const [cart, setCart] = useState<CartProps | null>(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [openDiscountModal, setOpenDiscountModal] = useState(false);
  
  const fetchSingleEntry = async () => {
    if (!dataId) return;

    try {
      const res = await apiRequest("get", `ecom/ecom?function=get_single_abdandoned_cart&id=${dataId}`);
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

  if( !cart ){ return null; }

  return (
    <Grid container spacing={4}>
      <Grid size={7}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>Contact</Typography>

          <Box sx={{ display:'flex', alignItems: 'center'}}>
            <Box sx={{ mr: 3}}>
              <TextField fullWidth label="Email" sx={{ mb: 2 }} name="email" value={cart.email} disabled/>
              <FormControlLabel control={<Checkbox checked={Boolean(cart?.email)} disabled/>} label="Email me with news and offers" />
            </Box>
            <Box>
              <TextField fullWidth label="WhatsApp" sx={{ mb: 2 }} name="whatsapp" value={cart.whatsapp} disabled/>
              <FormControlLabel control={<Checkbox checked={Boolean(cart?.whatsapp)} disabled />} label="Whatsapp me with news and offers" />
            </Box>
          </Box>

          <Button variant="contained" color="primary" sx={{ my: 3}}>Create Shipping Address</Button>
          {cart?.shipping_address_id && "first_name" in cart.shipping_address_id && (
            <Typography variant="body2">{fullAddress(cart.shipping_address_id)}</Typography>
          )}

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <PaymentStatic/>

            <Button variant="contained" color="primary" sx={{ my: 3}}>Create Billing Address</Button>
            {cart?.billing_address_id && "first_name" in cart.billing_address_id && (
              <Typography variant="body2">{fullAddress(cart.billing_address_id)}</Typography>
            )}

            <Grid size={12}>
              <TextField label="Add a Note" fullWidth size="small" multiline minRows={3} value={cart?.user_remarks} disabled/>
              <Box sx={{ my: 3}}><strong>Payment Method:</strong> {cart.paymode}</Box>
              <Button variant="contained" fullWidth sx={{ backgroundColor: "black", color: "white", py:3, my:3 }}>Pay Now</Button>
            </Grid>
          </Grid>
        </Grid>

        <Divider orientation="vertical" flexItem />

        <Grid size={4}>
            <Box sx={{ borderRadius: 2, p: 2, position: "sticky", top: 20 }}>
              <Box sx={{ flex: 1, overflowY: 'auto', width: '100%' }}>
                  {cart && (
                      <List>
                          {cart?.cartSkus?.map((item) => (
                            <ListItem key={item._id?.toString()} disablePadding sx={{ mb: 2 }}>
                              <Card sx={{ width: "100%", p: 1, alignItems: "center" }} elevation={0}>
                                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                  <ImageWithFallback img={(item.product_id as ProductProps & { medias?: ImageObject[] })?.medias?.[0]} width={80} height={80}/>
                                  <Box sx={{ flexGrow: 1, ml: 2 }}>
                                    <Typography fontWeight="bold">{(item.sku_id as SkuProps)?.name}</Typography>
                                  </Box>
                                  <Typography fontWeight="bold">₹{(item.sku_id as SkuProps)?.price}</Typography>
                                </Box>

                                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                  <Button variant="outlined" size="small">-</Button>
                                  <Typography sx={{ mx: 2 }}>{item.quantity}</Typography>
                                  <Button variant="outlined" size="small">+</Button>
                                  <Box sx={{ flexGrow: 1 }} />
                                  <Typography fontWeight="bold">
                                    ₹{item.quantity * Number((item.sku_id as SkuProps)?.price ?? 0)}
                                  </Typography>
                                </Box>
                              </Card>
                            </ListItem>
                          ))}
                      </List>
                  )}
              </Box>

              <CartCharges itemCount={cartItemCount} total={cart?.total?.$numberDecimal || 0} payableAmount={cart?.payable_amount?.$numberDecimal || 0} cartCharges={cart?.cartCharges}/>

              <Button variant="contained" fullWidth sx={{ backgroundColor: "black", color: "white", py:3, my:3 }} onClick={() => setOpenDiscountModal(true)}>Give Additional Discount</Button>
          </Box>
        </Grid>

        <AdminAdditionalDiscountModal open={openDiscountModal} handleClose={() => { setOpenDiscountModal(false); fetchSingleEntry(); }} cart_id={cart._id as string} limit={ Number( cart?.total?.$numberDecimal || 0 )} cartCharges={cart?.cartCharges}/>
    </Grid>
  );
}

export default SingleAbandoneCart;