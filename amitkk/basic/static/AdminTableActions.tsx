"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@amitkk/components/button/button";
import { useAuth } from "contexts/AuthContext";

type AdminTableActionsProps = {
  admin: any;
  module: string | null;
  pageKey?: string;
};

export function AdminTableActions({ admin, module = null, pageKey }: AdminTableActionsProps) {
  const newLabel = module ? `New ${module}` : "New";
  const importPermission = module ? `Import ${module}` : null;
  const exportPermission = module ? `Export ${module}` : null;
  const { can } = useAuth();

  const router = useRouter();
  return (
    <>
      <div className="flex items-center">
        { admin?.handleAddNew && <Button onClick={admin?.handleAddNew} className="mr-3">{newLabel}</Button> }
      </div>
    </>
  );
}