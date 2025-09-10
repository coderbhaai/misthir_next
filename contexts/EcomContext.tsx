// context/EcomContext.tsx
import { apiRequest, clo, hitToastr } from '@amitkk/basic/utils/utils';
import { createContext, ReactNode, useContext, useState } from 'react';

type EcomContextType = {
  cartId?: string;
  cartItemCount: number;
  sendAction: (action: string, payload?: any) => void;
};

const EcomContext = createContext<EcomContextType>({
  cartItemCount: 0,
  sendAction: () => {},
});

export function EcomProvider({ children }: { children: ReactNode }) {
  const [cartId, setCartId] = useState<string | undefined>(undefined);
  const [cartItemCount, setCartItemCount] = useState<number>(0);

  const sendAction = async (action: string, payload?: any) => {
    try{
      console.log('Global Action Triggered:', action, payload);
  
      if (action === 'ADD_TO_CART') {
        payload.function = 'add_to_cart';
        const res = await apiRequest("post", `ecom/ecom`, payload);
        hitToastr(res?.status? 'success' : 'error', res?.message);

        await fetchCartItemCount();  
      }
    }catch (error) { clo( error ); }
  };

  const fetchCartItemCount = async () => {
    try {
      
      const res = await apiRequest('get', 'ecom/cart-item-count');
      if (res?.status && typeof res.count === 'number') {
        setCartItemCount(res.count);
      }
    } catch (error) { clo(error); }
  };

  return (
    <EcomContext.Provider value={{ cartId, cartItemCount, sendAction }}>
      {children}
    </EcomContext.Provider>
  );
}

export function useEcom() {
  return useContext(EcomContext);
}