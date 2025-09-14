import React, { useEffect, useState } from "react";
import { Box, Button, MenuItem, TextField } from "@mui/material";
import { apiRequest, clo, hitToastr } from "@amitkk/basic/utils/utils";
import CustomModal from "@amitkk/basic/static/CustomModal";

type AdminAdditionalDiscountModalProps = {
  open: boolean;
  handleClose: () => void;
  cart_id: string;
  limit: number;
  cartCharges?: {
    shipping_charges?: number | string;
    cod_charges?: number | string;
    sales_discount?: number | string;
    admin_discount?: number | string;
    admin_discount_validity_value?: number | string;
    admin_discount_unit?: number | string;
    vendor_discount?: number | string;
  };
};

type FormData = {
  additional_discount: number | "";
  admin_discount_validity_value: number | "";
  admin_discount_unit: "hours" | "days" | "";
};

export default function AdminAdditionalDiscountModal({ open, handleClose, cart_id, limit, cartCharges }: AdminAdditionalDiscountModalProps) {
  const [formData, setFormData] = useState<FormData>({
    additional_discount: "",
    admin_discount_validity_value: 1,
    admin_discount_unit: "hours",
  });

  useEffect(() => {
    if (open) {
      setFormData({
        additional_discount: Number( cartCharges?.admin_discount ) ?? "",
        admin_discount_validity_value: Number( cartCharges?.admin_discount_validity_value ) ?? "",
        admin_discount_unit: (cartCharges?.admin_discount_unit === "hours" || cartCharges?.admin_discount_unit === "days") ? cartCharges.admin_discount_unit : "hours",
      });
    }
  }, [open]);

  const handleChange = ( e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> ) => {
    const { name, value } = e.target;
    if (name === "additional_discount") {
      const num = Number(value);
      if (num > limit) {
        return;
      }
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(formData.additional_discount) > limit) { hitToastr('error', `Discount cannot exceed ₹${limit}`); return; }   
    if (Number(formData.additional_discount) < 1) { hitToastr("error", `Discount cannot be below ₹1`); return; }
    if (Number(formData.admin_discount_validity_value) < 1) { hitToastr("error", `Discount Time cannot be below ₹1`); return; } 
    
    try {
      const payload = {
        function: "apply_admin_discount",
        data: {
          cart_id,
          additional_discount: Number(formData.additional_discount) || 0,
          admin_discount_validity_value: Number(formData.admin_discount_validity_value), 
          admin_discount_unit: formData.admin_discount_unit,
        }
      };

      const res = await apiRequest("post", "ecom/ecom", payload);
      if( res?.status){
        handleClose();
      }
    } catch (error) { clo(error); }
  };

  return (
    <CustomModal open={open} handleClose={handleClose} title="Give Additional Discount">
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
          <TextField label={`Discount (Limit - ${limit})`} type="number" variant="outlined" value={formData.additional_discount} name="additional_discount" fullWidth onChange={handleChange} required slotProps={{ input: { inputProps: { min: 1 } } }}/>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField label="Validity" type="number" variant="outlined" value={formData.admin_discount_validity_value} name="admin_discount_validity_value" onChange={handleChange} fullWidth required slotProps={{ input: { inputProps: { min: 1 } } }}/>
            <TextField select label="Unit" variant="outlined" value={formData.admin_discount_unit} name="admin_discount_unit" onChange={handleChange}
              fullWidth required>
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
