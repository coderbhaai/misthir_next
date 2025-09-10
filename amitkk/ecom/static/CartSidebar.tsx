"use client";
import { useEffect, useState } from "react";
import { Drawer, Box, Typography, List, ListItem, Button, Card, CardMedia, IconButton, Badge, TextField } from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useEcom } from "contexts/EcomContext";
import Image from 'next/image';
import ImageWithFallback from "@amitkk/basic/static/ImageWithFallback";
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { hitToastr } from "@amitkk/basic/utils/utils";
import Link from "next/link";

export default function CartSidebar() {
  const { sendAction, cart, cartItemCount, relatedProducts } = useEcom();
  const [open, setOpen] = useState(false);
  const [counts, setCounts] = useState([1, 1]);

  const handleIncrease = (id: any) => {    
    sendAction('increment_cart', {
      action: 'increment_cart',
      cart_sku_id: id,
    });
  };

  const handleDecrease = (id: any) => {
    sendAction('decrement_cart', {
      action: 'decrement_cart',
      cart_sku_id: id,
    });
  }

  const [showNoteBox, setShowNoteBox] = useState(false);
  const [orderNote, setOrderNote] = useState("");

useEffect(() => {
  if (cart?.user_remarks) {
    setOrderNote(cart.user_remarks);
  }
}, [cart]);

  const handleAddOrderToCart = () => {
    if (!orderNote.trim()) { hitToastr('error', 'Please enter a note before saving.'); return; }

    sendAction('update_user_remarks', {
      action: 'update_user_remarks',
      user_remarks : orderNote
    });
    setShowNoteBox(false);
  };

  return (
    <>
      {cartItemCount > 0 && (
        <Box sx={{ position: 'fixed', bottom: 20, left: 16, zIndex: 1000, }}>
          <IconButton onClick={() => setOpen(true)} sx={{ backgroundColor: '#5a3825', color: '#fff', width: 56, height: 56, '&:hover': { backgroundColor: '#7a5230' }, borderRadius: '50%', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', }}>
            <Badge badgeContent={cartItemCount} color="error" anchorOrigin={{ vertical: 'top', horizontal: 'right' }} sx={{ '& .MuiBadge-badge': { transform: 'translate(90%, -90%)', fontSize: '0.75rem', minWidth: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', }}}><ShoppingCartIcon/></Badge>
          </IconButton>
        </Box>
      )}

      <Box sx={{ display: 'flex', position: "relative" }}>
        {open && (
          <Box sx={{
            width: 200,
            height: '100vh',
            overflowY: 'auto',
            borderRight: '1px solid #ccc',
            position: 'fixed',
            top: 0,
            right: 400,
            backgroundColor: '#fff',
            zIndex: 1500,
          }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2, backgroundColor: "#d6d6d6" }}>
              <Typography variant="h6" sx={{ color: "#000" }}>Other Products</Typography>
            </Box>

            <List sx={{ p: 2 }}>
              {relatedProducts?.map((product: any) => (
                <ListItem key={product._id} disablePadding sx={{ mb: 3 }}>
                  <Link href={`/product/${product.url}`} passHref style={{ textDecoration: 'none', width: '100%' }}>
                    <Card sx={{ width: '100%', display: 'flex', flexDirection: 'column', p: 1 }}>
                      <ImageWithFallback img={product.medias?.[0]} height={80} />
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="subtitle2" textAlign="center">{product.name}</Typography>
                      </Box>
                    </Card>
                  </Link>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Drawer anchor="right" open={open} slotProps={{ paper: { sx: { width: 400, height: '100vh', display: 'flex', flexDirection: 'column' } } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2, backgroundColor: "#d6d6d6" }}>
              <Typography variant="h6">My Cart</Typography>
              <IconButton sx={{ p: 0 }} onClick={() => setOpen(false)}><CloseIcon/></IconButton>
            </Box>
        
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
              {cart && (
                <List>
                  {cart.cartSkus.map((item: any) => (
                    <ListItem key={item._id} disablePadding sx={{ mb: 2 }}>
                      <Card sx={{ display: 'flex', width: '100%', p: 1, alignItems: 'center' }}>
                        <ImageWithFallback img={item.product_id?.medias?.[0]} width={80} height={80}/>

                        <Box sx={{ flex: 1, ml: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <Typography variant="subtitle1">{item.sku_id.name}</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'start' }}>
                            <IconButton onClick={() => handleDecrease(item._id)} size="small" sx={{ border: '1px solid #ccc', width: 24, height: 24, p: 0.3, mr:3 }}>
                              <Remove fontSize="small" />
                            </IconButton>
                            <Typography variant="body1">{item.quantity}</Typography>
                            <IconButton onClick={() => handleIncrease(item._id)} size="small" sx={{ border: '1px solid #ccc', width: 24, height: 24, p: 0.3 , ml:3 }}>
                              <Add fontSize="small" />
                            </IconButton>
                          </Box>
                          <Typography variant="body2" sx={{ mt: 1 }}>₹{item.sku_id.price * item.quantity}</Typography>
                        </Box>
                      </Card>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
              
            <Box sx={{ p: 2, borderTop: '1px solid #ccc', backgroundColor: '#fff' }}>
              {showNoteBox && (
                <Box sx={{ mb: 2 }}>
                  <TextField label="Add a note" fullWidth size="small" multiline minRows={3} value={orderNote} onChange={(e) => setOrderNote(e.target.value)}/>
                  <Box sx={{ display: 'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <Button variant="contained" size="small" sx={{ mt: 1 }} onClick={handleAddOrderToCart}>Save</Button>
                    <Button variant="contained" size="small" sx={{ mt: 1 }} onClick={()=> setShowNoteBox(false) }>Camcel</Button>
                  </Box>
                </Box>
              )}

              <Button variant="contained" fullWidth startIcon={<AddShoppingCartIcon />} onClick={() => setShowNoteBox(true)}>Add Order to Cart</Button>

              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2">Delivery available at <b>122003</b></Typography>
                <Typography variant="caption" color="text.secondary">All orders received post 10 AM Friday to 10 AM Monday will be shipped on Monday.</Typography>
              </Box>

              <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Checkout - MRP ₹1,350</Button>
            </Box>
          </Box>
        </Drawer>
      </Box>
    </>
  );
}
