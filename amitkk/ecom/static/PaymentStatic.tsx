"use client";

import { CreditCard, Wallet, ShieldCheck, Smartphone } from "lucide-react";

export default function PaymentStatic() {
  return (
    <div className="col-span-12">
      <div className="p-4 bg-[#d6d6d6] border border-black rounded-t-[15px] text-zinc-900">
        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold">PhonePe Secure (UPI, Cards, Wallets, NetBanking)</p>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            <Smartphone className="w-5 h-5" />
            <Wallet className="w-5 h-5" />
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
        
        <div className="mt-6 text-center flex flex-col items-center w-full">
          <p className="text-xs text-zinc-700 max-w-md">After clicking “Pay now”, you will be redirected to PhonePe Secure (UPI, Cards, Wallets, NetBanking) to complete your purchase securely.</p>
        </div>
      </div>
    </div>
  );
}