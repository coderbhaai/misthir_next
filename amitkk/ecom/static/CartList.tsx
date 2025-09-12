import ImageWithFallback from "@amitkk/basic/static/ImageWithFallback";
import { Box, List, ListItem, Card, Typography, Button, Divider } from "@mui/material";
import { useEcom } from "contexts/EcomContext";

export default function CartList() {
    const { sendAction, cart, cartItemCount } = useEcom();
    
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

    return (
        <Box sx={{ borderRadius: 2, p: 2, position: "sticky", top: 20 }}>
            <Box sx={{ flex: 1, overflowY: 'auto', width: '100%' }}>
                {cart && (
                    <List>
                        {cart.cartSkus.map((item: any) => (
                            <ListItem key={item._id} disablePadding sx={{ mb: 2 }}>
                                <Card sx={{width: '100%', p: 1, alignItems: 'center'}} elevation={0}>
                                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                        <ImageWithFallback img={item.product_id?.medias?.[0]} width={80} height={80}/>
                                        <Box sx={{ flexGrow: 1, ml: 2 }}>
                                        <Typography fontWeight="bold">{item.product_id?.name}</Typography>
                                        </Box>
                                        <Typography fontWeight="bold">₹{item.sku_id.price}</Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                        <Button variant="outlined" size="small" onClick={() => handleDecrease(item._id)}>-</Button>
                                        <Typography sx={{ mx: 2 }}>{item.quantity}</Typography>
                                        <Button variant="outlined" size="small" onClick={() => handleIncrease(item._id)}>+</Button>
                                        <Box sx={{ flexGrow: 1 }} />
                                        <Typography fontWeight="bold">₹{item.quantity * item.sku_id.price}</Typography>
                                    </Box>
                                </Card>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>
            
            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography>Subtotal · {cartItemCount} Items</Typography>
                <Typography>₹{cart?.total?.$numberDecimal}</Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography>Shipping Charges (Inc)</Typography>
                <Typography>₹150.00</Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6">Payable</Typography>
                <Typography variant="h6">₹{cart?.payable_amount?.$numberDecimal}</Typography>
            </Box>
        </Box>
    )
}