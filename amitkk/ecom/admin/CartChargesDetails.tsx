import React from "react";
import { CartChargesProps } from "@amitkk/ecom/types/ecom"; // adjust the import if needed

interface CartChargesDetailsProps {
  cartCharges?: CartChargesProps; // make it optional
}

const CartChargesDetails: React.FC<CartChargesDetailsProps> = ({ cartCharges }) => {
  if (!cartCharges) return null; // return nothing if undefined

  const chargesList = [
    { label: "Shipping Charges", value: cartCharges.shipping_charges },
    { label: "Shipping Chargeable Value", value: cartCharges.shipping_chargeable_value },
    { label: "Sales Discount", value: cartCharges.sales_discount },
    { label: "Admin Discount", value: cartCharges.admin_discount },
    { label: "Vendor Discount", value: cartCharges.total_vendor_discount },
    { label: "COD Charges", value: cartCharges.cod_charges },
  ];

  return (
    <div>
      {chargesList.map(
        (charge, index) =>
          Number(charge.value) > 0 && (
            <div key={index}>
              {charge.label} : {charge.value?.toString()}
            </div>
          )
      )}
    </div>
  );
};

export default CartChargesDetails;
