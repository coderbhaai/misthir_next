import React from 'react';
import { Minus, Plus } from "lucide-react";
import { Button } from '@amitkk/components/button/button';

type QuantitySelectorProps = {
  value: number;
  minQuantity?: number;
  onChange: (quantity: number) => void;
};

const QuantitySelector: React.FC<QuantitySelectorProps> = ({ value, minQuantity = 1, onChange }) => {
  const increment = () => onChange(value + 1);
  const decrement = () => onChange(Math.max(minQuantity, value - 1));

  return (
    <div className="flex items-center border border-border rounded-lg bg-background overflow-hidden w-fit">
      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none disabled:opacity-30" onClick={decrement} disabled={value <= minQuantity}>
        <Minus className="h-3.5 w-3.5" />
        <span className="sr-only">Decrease quantity</span>
      </Button>

      <span className="w-10 text-center text-sm font-medium">{value}</span>

      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={increment}>
        <Plus className="h-3.5 w-3.5" />
        <span className="sr-only">Increase quantity</span>
      </Button>
    </div>
  );
};

export default QuantitySelector;