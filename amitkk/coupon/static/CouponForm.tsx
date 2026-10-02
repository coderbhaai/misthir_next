"use client";

import { apiRequest, clo, hitToastr } from "@amitkk/basic/utils/my-utils/admin-utils";
import { TextField } from "@amitkk/components/basic/TextField";
import { Button } from "@amitkk/components/button/button";
import { useEcom } from "contexts/EcomContext";
import { useFormHandler } from "hooks/useFormHandler";
import React from "react";
import { useState } from "react";

type CouponFormProps = {
  function?: string;
  coupon_code?: string | null;
}

export default function CouponForm({ coupon_code }: CouponFormProps) {
  const { fetchCart } = useEcom();
  
  const initialFormData: CouponFormProps = {
    function: 'apply_coupon',
    coupon_code: '',
  };
  const [formData, setFormData] = React.useState<CouponFormProps>(initialFormData);

  React.useEffect(() => {
    setFormData((prev) => ({ ...prev, coupon_code: coupon_code || '' }));
  }, [coupon_code]);

  const [loading, setLoading] = useState(false);

  const handleChange = useFormHandler(setFormData);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();  
      try {
        setLoading(true);

        const res = await apiRequest("POST", `ecom/ecom`, formData);
  
        if( res ){
          await fetchCart();
          hitToastr('success', res?.message);
        }
        
        setLoading(false);
      } catch (error) { clo( error ); }
    };

  return (
    <form onSubmit={handleSubmit}>
        <TextField label='Coupon' value={formData.coupon_code} name='coupon_code' onChange={handleChange} required/>
        <Button type='submit' className="btn w-full mt-5">Apply Coupon</Button>
    </form>
  );
}
