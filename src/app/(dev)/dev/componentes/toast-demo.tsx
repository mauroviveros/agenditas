"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ToastDemo() {
  return (
    <Button
      variant="outline"
      onClick={() =>
        toast("Turno movido a las 16:30", {
          action: { label: "Deshacer", onClick: () => {} },
        })
      }
    >
      Mostrar aviso
    </Button>
  );
}
