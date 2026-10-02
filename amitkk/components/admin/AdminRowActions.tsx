// AdminRowActions.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Iconify } from "@amitkk/basic/utils/my-utils/admin-utils";
import { Popover, PopoverAnchor, PopoverContent } from "@amitkk/components/ui/popover";
import { Button } from "@amitkk/components/button/button";
import { createPortal } from "react-dom";

export interface RowAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: string;
  target?: string;
  disabled?: boolean;
}

interface Props {
  id: string;
  actions: RowAction[];
}

const EVENT_NAME = "admin-row-actions-open";

export function openAdminRowActions(id: string, event: React.MouseEvent<HTMLButtonElement>) {
  window.dispatchEvent( 
    new CustomEvent(EVENT_NAME, { detail: { id, anchorEl: event.currentTarget } })
  );
}

export default function AdminRowActions({id, actions}: Props) {
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => { setMounted(true); }, []);

  const [open, setOpen] = useState(false);  

  useEffect(() => {
    const listener = (event: Event) => {
      const customEvent = event as CustomEvent;

      if (customEvent.detail?.id === id) {
        triggerRef.current = customEvent.detail.anchorEl;
        setOpen(true);
      }
    };

    window.addEventListener(EVENT_NAME, listener);
    return () => {
      window.removeEventListener(EVENT_NAME, listener);
    };
  }, [id]);

  const handleClose =() => {setOpen(false); };

  const handleActionClick = (action: RowAction) => {
    action.onClick?.();
    handleClose();
  };

  useEffect(() => {
    if (!open) return;

    const handleScroll = () => { setOpen(false); };
    window.addEventListener("scroll", handleScroll, true);
    return () => { window.removeEventListener("scroll", handleScroll, true); };
  }, [open]);

  if (!mounted) { return null; }

  return createPortal(
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div ref={(el) => {
            if (el && triggerRef.current) {
              const rect = triggerRef.current.getBoundingClientRect();
              el.style.position = "fixed";
              el.style.left = `${rect.left}px`;
              el.style.top = `${rect.top}px`;
              el.style.width = "1px";
              el.style.height = "1px";
            }
          }}/>
      </PopoverAnchor>

      <PopoverContent align="end" side="bottom" className="w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
        <span className="flex flex-col gap-1">
          {actions.map((action, idx) => {
            const icon = action.icon || "Edit";

              if (action.href) {
                return (
                  <Button key={idx} variant="ghost" disabled={action.disabled} className="w-full justify-start gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-all duration-150 hover:bg-indigo-600 hover:text-white [&_svg]:text-current" asChild onClick={handleClose}>
                    <Link href={action.href} target={action.target || "_blank"}><Iconify icon="Edit" className="h-4 w-4 shrink-0" />{action.label}</Link>
                  </Button>
                );
              }

              return (
                <Button key={idx} variant="ghost" disabled={action.disabled} className="w-full justify-start gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-all duration-150 hover:bg-indigo-600 hover:text-white [&_svg]:text-current" onClick={() => handleActionClick(action)}>
                  <Iconify icon="Edit" className="h-4 w-4 shrink-0" />{action.label}
                </Button>
              );
            }
          )}

        </span>
      </PopoverContent>
    </Popover>, document.body
  );
}