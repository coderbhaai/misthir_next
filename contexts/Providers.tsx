import type { ReactNode } from "react";
import { GlobalModalProvider } from "./GlobalModalContext";
import GlobalModalRenderer from "@amitkk/basic/static/GlobalModalRenderer";
import { MenuProvider } from "./MenuContext";
import { AuthProvider } from "./AuthContext";
import { EcomProvider } from "./EcomContext";
import { WishlistProvider } from "./WishlistContext";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({children}: ProvidersProps) {
  return (
    <AuthProvider>
      <EcomProvider>
      <WishlistProvider>
        <MenuProvider>
          <GlobalModalProvider>
            {children}
            <GlobalModalRenderer />
          </GlobalModalProvider>
        </MenuProvider>
      </WishlistProvider>
      </EcomProvider>
    </AuthProvider>
  );
}