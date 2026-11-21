"use client";

import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react";
import { useState } from "react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import { matchesQuery } from "@/lib/services/search";
import type { Service } from "@/lib/services/queries";
import { formatDuration } from "@/lib/services/schema";

// Con pocos servicios el buscador estorba; desde acá aparece.
const SEARCH_FROM = 6;

interface ServicePickerProps {
  services: Service[];
  value: string;
  onChange: (serviceId: string) => void;
  invalid: boolean;
  name: string;
}

// Elegir un servicio entre muchos sin ocupar la pantalla: cerrado es una línea con lo elegido;
// abierto, un buscador y una lista con scroll de 3 filas y media (la fila cortada avisa que hay más). Al elegir, se cierra.
export function ServicePicker({ services, value, onChange, invalid, name }: ServicePickerProps) {
  const [open, setOpen] = useState(value === "");
  const [query, setQuery] = useState("");
  const selected = services.find(({ id }) => id === value) ?? null;
  const shown = services.filter((service) => matchesQuery(service.name, query));

  function choose(id: string) {
    onChange(id);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="rounded-lg border border-input">
      <button
        type="button"
        aria-expanded={open}
        aria-invalid={invalid ? true : undefined}
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 text-left text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive md:min-h-8"
      >
        {selected ? (
          <span>
            <span className="font-semibold">{selected.name}</span>{" "}
            <span className="text-xs text-muted-foreground">
              {formatDuration(selected.duration_minutes)}
            </span>
          </span>
        ) : (
          <span className="text-muted-foreground">Elegí un servicio</span>
        )}
        <ChevronDownIcon
          aria-hidden
          className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div className="flex flex-col gap-2 border-t p-2">
          {services.length >= SEARCH_FROM ? (
            <InputGroup>
              <InputGroupAddon>
                <SearchIcon aria-hidden />
              </InputGroupAddon>
              <InputGroupInput
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar servicio"
                aria-label="Buscar servicio"
                autoComplete="off"
              />
            </InputGroup>
          ) : null}
          <div className="flex max-h-39 flex-col overflow-y-auto overscroll-contain md:max-h-28">
            {shown.length === 0 ? (
              <p className="px-2 py-3 text-sm text-muted-foreground">Ningún servicio coincide.</p>
            ) : (
              shown.map((service) => (
                <label key={service.id} className="cursor-pointer">
                  <input
                    type="radio"
                    name={name}
                    className="peer sr-only"
                    checked={value === service.id}
                    onChange={() => choose(service.id)}
                  />
                  <span className="flex min-h-11 items-center justify-between gap-2 rounded-md px-2 text-sm hover:bg-muted peer-checked:bg-secondary peer-checked:font-semibold peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50 md:min-h-8">
                    <span>{service.name}</span>
                    <span className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
                      {formatDuration(service.duration_minutes)}
                      {value === service.id ? <CheckIcon aria-hidden className="size-4" /> : null}
                    </span>
                  </span>
                </label>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
