// context/EcomContext.tsx
import { apiRequest, clo, hitToastr } from '@amitkk/basic/utils/my-utils/admin-utils';
import { CartProps } from '@amitkk/ecom/types';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type EcomContextType = {
  relatedProducts?:any;
  cartId?: string;
  cart?: CartProps;
  cartItemCount: number;
  fetchCart: () => Promise<void>; 
  sendAction: (action: string, payload?: any) => void;
};

const EcomContext = createContext<EcomContextType>({
  cartItemCount: 0,
  fetchCart: async () => {},
  sendAction: () => {},
});

export function EcomProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any>(null);
  const [cartId, setCartId] = useState<string | undefined>(undefined);
  const [cartItemCount, setCartItemCount] = useState<number>(0);

  const sendAction = async (action: string, payload?: any) => {
    try{
      console.log('Global Action Triggered:', action, payload);
  
      payload.function = payload.action;
      const res = await apiRequest("POST", `ecom/ecom`, payload);
      if (res?.status && res.message) {
        await fetchCart();
        hitToastr(res?.status? 'success' : 'error', res?.message);
      }

    }catch (error) { clo( error ); }
  };

  const fetchCart = async () => {
    try {
      const res = await apiRequest('GET', `ecom/ecom?function=get_cart_data`);
      if (res?.data) {
        setCart(res?.data);
        setRelatedProducts( res?.relatedProducts );
        const count = res?.data?.cartSkus.reduce( (sum: number, cartSku: any) => sum + (cartSku.quantity ?? 0), 0 );
        setCartItemCount(count);
      }

    } catch (error) { clo(error); }
  };

  useEffect(() => { fetchCart(); }, []);

  return (
    <EcomContext.Provider value={{ cartId, cart, cartItemCount, fetchCart, sendAction, relatedProducts }}>
      {children}
    </EcomContext.Provider>
  );
}

export function useEcom() { return useContext(EcomContext); }