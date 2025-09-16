import React from "react";
import { ChargesItem } from "../types/ecom";

interface ChargesDetailsProps {
  charges?: ChargesItem;
}

const ChargesDetails: React.FC<ChargesDetailsProps> = ({ charges }) => {
  if (!charges) return null;

  const chargesList = [
    { label: "Shipping Charges", value: charges.shipping_charges },
    { label: "Shipping Chargeable Value", value: charges.shipping_chargeable_value },
    { label: "Sales Discount", value: charges.sales_discount },
    { label: "Admin Discount", value: charges.admin_discount },
    { label: "Vendor Discount", value: charges.total_vendor_discount },
    { label: "COD Charges", value: charges.cod_charges },
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

export default ChargesDetails;