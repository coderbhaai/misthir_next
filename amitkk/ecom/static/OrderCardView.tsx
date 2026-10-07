import React from "react";
import { OrderProps } from '@amitkk/ecom/types';
import CartSkuDetails from '@amitkk/ecom/admin/CartSkuDetails';
import CartChargesDetails from '@amitkk/ecom/admin/CartChargesDetails';
import { Package, Calendar, CreditCard } from "lucide-react";

type Props = {
  row: OrderProps;
};

export function OrderCardView({ row }: Props) {
  return (
    <div className="col-span-12 md:col-span-4 card p-3">
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-xs text-gray-500">
          <div className="flex items-center gap-1.5 font-medium text-gray-700">
            <Package className="w-4 h-4 text-blue-600" />
            <span>Order ID: {row._id?.toString().slice(-6).toUpperCase()}</span>
          </div>
          {row.createdAt && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(row.createdAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Products</h5>
          <div className="text-sm text-gray-700 bg-gray-50/50 rounded-xl p-3 border border-gray-100">
            <CartSkuDetails skus={row.orderSkus} />
          </div>
        </div>

        {row.orderCharges && (
          <div className="space-y-2">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Charges Breakdown</h5>
            <div className="text-xs text-gray-600 bg-gray-50/30 rounded-xl p-3 border border-gray-100">
              <CartChargesDetails charges={row.orderCharges} />
            </div>
          </div>
        )}
      </div>
      
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-2">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <CreditCard className="w-4 h-4 text-gray-400" />
          <span>Paymode: <span className="font-medium text-gray-700">{row.paymode || "N/A"}</span></span>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-gray-900">Total: ₹{row.total ?? 0}</div>
          <div className="text-xs text-emerald-600 font-medium">Paid: ₹{row.paid ?? 0}</div>
        </div>
      </div>
    </div>
  );
}