import React from 'react';

interface DiscountDisplayProps {
  type: string;
  value?: number;
}

export const DiscountDisplay: React.FC<DiscountDisplayProps> = ({ type, value }) => {
  const isPercent = type === "Percent Based";
  return ( <span>Discount - {isPercent ? `${value}%` : `₹${value}`}</span> );
};