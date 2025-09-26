"use client";

import { apiRequest, hitToastr, clo } from "@amitkk/basic/utils/utils";
import { TextField, Button, SelectChangeEvent } from "@mui/material";
import { useEcom } from "contexts/EcomContext";
import { Types } from "mongoose";
import React from "react";
import { useState } from "react";

type CouponFormProps = {
  function: string;
  coupon_code: string;
  // cart_id: string | Types.ObjectId;
}

export default function CouponForm() {
  const { fetchCart } = useEcom();
  
  const initialFormData: CouponFormProps = {
    function: 'apply_coupon',
    coupon_code: '',
  };
  const [formData, setFormData] = React.useState<CouponFormProps>(initialFormData);
  
  const [coupon, setCoupon] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: name === "status" ? value === "true" : value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();  
      try {
        const res = await apiRequest("post", `ecom/ecom`, formData);
  
        if( res ){
          await fetchCart();
          hitToastr('success', res?.message);
        }
      } catch (error) { clo( error ); }
    };

  return (
    <form onSubmit={handleSubmit}>
        <TextField label='Coupon' variant='outlined' value={formData.coupon_code} name='coupon_code' fullWidth onChange={handleChange} required/>
        <Button type='submit' variant='contained' color='primary'>Apply Coupon</Button>
    </form>
  );
}
