import React, { useEffect, useState } from "react";
import CustomModal from "@amitkk/basic/static/CustomModal";
import { apiRequest, clo, hitToastr } from "@amitkk/basic/utils/my-utils/admin-utils";
import { TextField } from "@amitkk/components/basic/TextField";
import { Button } from "@amitkk/components/button/button";

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

      const res = await apiRequest("POST", "ecom/ecom", payload);
      if( res?.status){
        handleClose();
      }
    } catch (error) { clo(error); }
  };

  return (
    <CustomModal open={open} handleClose={handleClose} title="Give Additional Discount">
      <form onSubmit={handleSubmit} className="space-y-4">
          <TextField label={`Discount (Limit - ${limit})`} type="number" value={formData.additional_discount} name="additional_discount" onChange={handleChange} required/>
          <div className="flex gap-2">
            <TextField label="Validity" type="number" value={formData.admin_discount_validity_value} name="admin_discount_validity_value" onChange={handleChange} required/>
            {/* <TextField select label="Unit" value={formData.admin_discount_unit} name="admin_discount_unit" onChange={handleChange}
              required>
              <MenuItem value="hours">Hours</MenuItem>
              <MenuItem value="days">Days</MenuItem>
            </TextField> */}
          </div>
          <Button type="submit" color="primary">Save Discount</Button>
      </form>
    </CustomModal>
  );
}
