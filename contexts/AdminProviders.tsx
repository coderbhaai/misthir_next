"use client";

import type { ReactNode } from "react";
import { GlobalModalProvider } from "./GlobalModalContext";
import GlobalModalRenderer from "@amitkk/basic/static/GlobalModalRenderer";
import { MenuProvider } from "./MenuContext";
import { AuthProvider } from "./AuthContext";
import { FilterProvider } from "./FilterContext";

interface Props {
  children: ReactNode;
}

export default function AdminProviders({
  children,
}: Props) {
  return (
    <AuthProvider>
      <FilterProvider>
          <MenuProvider>
            <GlobalModalProvider>
              {children}
              <GlobalModalRenderer />
            </GlobalModalProvider>
          </MenuProvider>
      </FilterProvider>
    </AuthProvider>
  );
}