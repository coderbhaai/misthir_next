import { apiRequest, clo } from "@amitkk/basic/utils/utils";
import { useEffect, useState } from "react";

interface UserAccess {
  roles: string[];
  permissions: string[];
  hasAnyRole: (checkRoles: string[]) => boolean;
  hasPermission: (checkPermission: string | string[]) => boolean;
}

export const useUserAccess = (): UserAccess => {
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchAccess = async () => {
      try {
        const res = await apiRequest("post", "basic/auth", { function: "check_user_access" });
        if (isMounted) {
          setRoles(res?.data?.roles ?? []);
          setPermissions(res?.data?.permissions ?? []);
        }
      } catch (error) {
        clo(error);
      }
    };

    fetchAccess();

    return () => {
      isMounted = false;
    };
  }, []);

  const hasAnyRole = (checkRoles: string[]) => roles.some((r) => checkRoles.includes(r));

  const hasPermission = (checkPermission: string | string[]) => {
    const checks = Array.isArray(checkPermission) ? checkPermission : [checkPermission];
    return checks.some((p) => permissions.includes(p));
  };

  return { roles, permissions, hasAnyRole, hasPermission };
};