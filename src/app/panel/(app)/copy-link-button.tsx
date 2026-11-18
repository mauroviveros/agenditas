"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type CopyState = "idle" | "copied" | "failed";

export function CopyLinkButton({ link }: { link: string }) {
  const [state, setState] = useState<CopyState>("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setState("copied");
    } catch {
      setState("failed");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <Button type="button" variant="secondary" size="xl" onClick={copy}>
        {state === "copied" ? <CheckIcon aria-hidden /> : <CopyIcon aria-hidden />}
        Copiar link
      </Button>
      <p aria-live="polite" className="text-sm font-semibold">
        {state === "copied" ? "Copiado" : null}
        {state === "failed" ? "No pudimos copiarlo. Copialo a mano." : null}
      </p>
    </div>
  );
}
