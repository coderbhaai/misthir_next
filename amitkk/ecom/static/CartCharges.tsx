import ImageWithFallback from "@amitkk/basic/static/ImageWithFallback";
import { Box, List, ListItem, Card, Typography, Button, Divider } from "@mui/material";
import { useEcom } from "contexts/EcomContext";

interface CartChargesProps {
  itemCount: number;
  total: number | string;
  payableAmount: number | string;
  cartCharges?: {
    shipping_charges?: number | string;
    cod_charges?: number | string;
    sales_discount?: number | string;
    admin_discount?: number | string;
    total_vendor_discount?: number | string;
  };
}

export default function CartCharges({ itemCount, total, payableAmount, cartCharges }: CartChargesProps) {
  return (
        <>
            
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography>Subtotal · {itemCount} Items</Typography>
                <Typography>₹{total}</Typography>
            </Box>            
            {cartCharges && (
                <>
                    { cartCharges?.shipping_charges && (
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                            <Typography>Shipping Charges (Inc)</Typography>
                            <Typography>₹{cartCharges?.shipping_charges}</Typography>
                        </Box>
                    )}
                    { cartCharges?.cod_charges && (
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                            <Typography>COD Charges (Inc)</Typography>
                            <Typography>₹{cartCharges?.cod_charges}</Typography>
                        </Box>
                    )}
                    { cartCharges?.sales_discount && (
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                            <Typography>Sales Discount</Typography>
                            <Typography>₹{cartCharges?.sales_discount}</Typography>
                        </Box>
                    )}
                    { (cartCharges?.admin_discount || cartCharges?.total_vendor_discount) && (
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                            <Typography>Additional Discount</Typography>
                            <Typography>₹{ (Number(cartCharges?.admin_discount) || 0) + (Number(cartCharges?.total_vendor_discount) || 0) }</Typography>
                        </Box>
                    )}
                </>
            )}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6">Payable</Typography>
                <Typography variant="h6">₹{payableAmount}</Typography>
            </Box>
        </>
    )
}