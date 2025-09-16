"use client";

import { Grid, Box, Typography, RadioGroup, Paper, Radio, TextField, FormControl, Checkbox, FormControlLabel, Button, Divider, Card, List, ListItem, Container } from "@mui/material";
import { useEffect, useState } from "react";
import { apiRequest, clo } from "@amitkk/basic/utils/utils";
import ImageWithFallback from "@amitkk/basic/static/ImageWithFallback";
import { OrderProps } from '@amitkk/ecom/types/ecom';
import PaymentStatic from "@amitkk/ecom/static/PaymentStatic";
import { ProductProps, SkuProps } from "@amitkk/product/types/product";
import { ImageObject } from "@amitkk/basic/types/page";
import { fullAddress } from "@amitkk/address/utils/addressUtils";
import CartCharges from "@amitkk/ecom/static/CartCharges";
import SuggestBlogs from "@amitkk/blog/static/suggest-blog";
import products from "@amitkk/product/products";
import SuggestProducts from "@amitkk/product/static/suggest-products";
import blogs from "pages/blogs";
import { generateInvoice } from "@amitkk/payment/utils/utils";

interface DataFormProps {
    order_id?: string;
} 

export const UserSingleOrder: React.FC<DataFormProps> = ({ order_id }) => {
  const [data, setData] = useState<OrderProps | null>(null);
  const [blogs, setBlogs] = useState([]);
  const [products, setProducts] = useState([]);
  const [cartItemCount, setCartItemCount] = useState(0);
  
  const fetchSingleEntry = async () => {
    if (!order_id) return;

    try {
      const res = await apiRequest("post", `ecom/ecom`,{ function: "get_single_order", order_id});
      if (res?.data) {
        const orderData = res.data as OrderProps;
        setData(orderData);

        const itemCount = (orderData.orderSkus || []).reduce( (sum, sku: any) => sum + (sku?.quantity || 0), 0 ); 
        setCartItemCount(itemCount);
        setBlogs(res?.relatedContent?.blogs);
        setProducts(res?.relatedContent?.products);
      }
    } catch (error) { clo(error); }
  };

  useEffect(() => { fetchSingleEntry(); }, [order_id]);

  if( !data ){ return null; }

  return (
    <>
      <Container sx={{ py: 5}}>
        <Grid container spacing={4}>
          <Grid size={8}>          
            {data?.shipping_address_id && "first_name" in data.shipping_address_id && (
              <Typography variant="body2"><span style={{ fontWeight: 700}}>Shipping Address</span>{fullAddress(data.shipping_address_id)}</Typography>
            )}
            {data?.billing_address_id && "first_name" in data.billing_address_id && (
              <Typography variant="body2" sx={{ my:3 }}><span style={{ fontWeight: 700}}>Billing Address</span> - {fullAddress(data.billing_address_id)}</Typography>
            )}
            {data?.user_remarks && (
              <Typography variant="body2" sx={{ my:3 }}><span style={{ fontWeight: 700}}>Order Note</span> - {data?.user_remarks}</Typography>
            )}
            <Typography variant="body2" sx={{ my:3 }}><strong>Payment Method:</strong> {data.paymode}</Typography>

            <Button variant="contained" sx={{ mt: 2 }} onClick={() => { if (data) generateInvoice(data); }}>Download Invoice</Button>
          </Grid>

          <Grid size={4}>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ borderRadius: 2, p: 2, position: "sticky", top: 20 }}>
              <Box sx={{ flex: 1, overflowY: 'auto', width: '100%' }}>
                  {data && (
                    <List>
                        {data?.orderSkus?.map((item) => {
                          return (
                            <ListItem key={item._id?.toString()} disablePadding sx={{ mb: 2 }}>
                              <Card sx={{ width: "100%", p: 1, alignItems: "center" }} elevation={0}>
                                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                  <ImageWithFallback img={(item.product_id as ProductProps & { medias?: ImageObject[] })?.medias?.[0]} width={80} height={80}/>
                                  <Box sx={{ flexGrow: 1, ml: 2 }}>
                                    <Typography fontWeight="bold">{(item.sku_id as SkuProps)?.name}</Typography>
                                  </Box>
                                  <Typography fontWeight="bold">{item.quantity} @ ₹{(item.sku_id as SkuProps)?.price} = ₹{item.quantity * Number((item.sku_id as SkuProps)?.price ?? 0)}</Typography>
                                </Box>
                              </Card>
                            </ListItem>
                          );
                        })}
                    </List>
                  )}
              </Box>

              <CartCharges itemCount={cartItemCount} total={data?.total?.$numberDecimal || 0} payableAmount={data?.paid?.$numberDecimal || 0} cartCharges={data?.orderCharges} cart_status={false}/>
            </Box>
          </Grid>
        </Grid>
        
        <SuggestProducts products={products} />
        <SuggestBlogs blogs={blogs}/>
      </Container>

    </>
  );
}

export default UserSingleOrder;