import React, { useEffect, useState } from "react";
import { Box, Button, MenuItem, TextField } from "@mui/material";
import CustomModal from "@amitkk/basic/static/CustomModal";
import { apiRequest, clo, hitToastr } from "@amitkk/basic/utils/utils";
import { CartSkuProps } from "@amitkk/ecom/types/ecom";

type VendorDiscountModalProps = {
  open: boolean;
  handleClose: () => void;
  cartSku: any;
  limit: number;
  refreshCart: () => void; 
};

type FormData = {
  vendor_discount: number | "";
  vendor_discount_validity_value: number | "";
  vendor_discount_unit: "hours" | "days" | "";
};

export default function VendorDiscountModal({ open, handleClose, cartSku, limit, refreshCart }: VendorDiscountModalProps) {
  const [formData, setFormData] = useState<FormData>({
    vendor_discount: "",
    vendor_discount_validity_value: "",
    vendor_discount_unit: "hours",
  });

  useEffect(() => {
    if (open && cartSku) {
      setFormData({
        vendor_discount: cartSku.vendor_discount ?? "",
        vendor_discount_validity_value: cartSku.vendor_discount_validity_value ?? "",
        vendor_discount_unit: cartSku.vendor_discount_unit ?? "hours",
      });
    }
  }, [open, cartSku]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "vendor_discount") {
      const num = Number(value);
      if (num > limit) { hitToastr("error", `Discount cannot exceed ₹${limit}`); return; }
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(formData.vendor_discount) > limit) { hitToastr("error", `Discount cannot exceed ₹${limit}`); return; }
    if (Number(formData.vendor_discount) < 1) { hitToastr("error", `Discount cannot be below ₹1`); return; }
    if (Number(formData.vendor_discount_validity_value) < 1) { hitToastr("error", `Discount Time cannot be below ₹1`); return; }

    try {
      const payload = {
        function: "apply_vendor_discount",
        data: {
          cartSku_id: cartSku._id,
          vendor_discount: Number(formData.vendor_discount) || 0,
          vendor_discount_validity_value: Number(formData.vendor_discount_validity_value),
          vendor_discount_unit: formData.vendor_discount_unit,
        }
      };

      const res = await apiRequest("post", "ecom/ecom", payload);
      if (res?.status) {
        refreshCart();
        handleClose();
      }
    } catch (error) { clo(error); }
  };

  return (
    <CustomModal open={open} handleClose={handleClose} title="Give Discount">
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
          <TextField label={`Discount (Limit - ${limit})`} type="number" variant="outlined" value={formData.vendor_discount} name="vendor_discount" fullWidth onChange={handleChange} required slotProps={{ input: { inputProps: { min: 1 } } }}/>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField label="Validity" type="number" variant="outlined" value={formData.vendor_discount_validity_value} name="vendor_discount_validity_value" onChange={handleChange} fullWidth required slotProps={{ input: { inputProps: { min: 1 } } }}/>
            <TextField select label="Unit" variant="outlined" value={formData.vendor_discount_unit} name="vendor_discount_unit" onChange={handleChange} fullWidth required>
              <MenuItem value="hours">Hours</MenuItem>
              <MenuItem value="days">Days</MenuItem>
            </TextField>
          </Box>
          <Button type="submit" variant="contained" color="primary">Save Discount</Button>
        </Box>
      </form>
    </CustomModal>
  );
}
