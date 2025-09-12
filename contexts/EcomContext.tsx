// context/EcomContext.tsx
import { apiRequest, clo, hitToastr } from '@amitkk/basic/utils/utils';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type EcomContextType = {
  relatedProducts?:any;
  cartId?: string;
  cart?: any;
  cartItemCount: number;
  sendAction: (action: string, payload?: any) => void;
};

const EcomContext = createContext<EcomContextType>({
  cartItemCount: 0,
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
  
      if (action === 'add_to_cart') {
        payload.function = 'add_to_cart';
      }

      if (action === 'increment_cart') {
        payload.function = 'increment_cart';
      }

      if (action === 'decrement_cart') {
        payload.function = 'decrement_cart';
      }

      if (action === 'update_user_remarks') {
        payload.function = 'update_user_remarks';
      }

      if (action === 'update_cart_array') {
        payload.function = 'update_cart_array';
      }

      const res = await apiRequest("post", `ecom/ecom`, payload);
      if (res?.status && res.message) {
        await fetchCart();
        hitToastr(res?.status? 'success' : 'error', res?.message);
      }

    }catch (error) { clo( error ); }
  };

  const fetchCart = async () => {
    try {
      const res = await apiRequest('get', `ecom/ecom?function=get_cart_data`);
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
    <EcomContext.Provider value={{ cartId, cart, cartItemCount, sendAction, relatedProducts }}>
      {children}
    </EcomContext.Provider>
  );
}

export function useEcom() { return useContext(EcomContext); }