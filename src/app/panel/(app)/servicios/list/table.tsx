"use client";

import {
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, SearchIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Service } from "@/lib/services/queries";
import { formatDuration, formatPrice } from "@/lib/services/schema";
import { matchesQuery } from "@/lib/services/search";
import { TableFooter } from "./footer";

// Fuera del componente: TanStack pide que features y columnas sean estables.
const features = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
});
const PAGE_SIZE = 10;
const initialState = { pagination: { pageIndex: 0, pageSize: PAGE_SIZE } };
const column = createColumnHelper<typeof features, Service>();

// Con acentos y mayúsculas, como se ordena una lista en castellano.
const nameCollator = new Intl.Collator("es-AR");

const columns = column.columns([
  column.accessor("name", {
    header: "Servicio",
    sortFn: (a, b, id) => nameCollator.compare(a.getValue<string>(id), b.getValue<string>(id)),
  }),
  column.accessor("duration_minutes", { header: "Duración" }),
  column.accessor("price_cents", { header: "Precio" }),
]);

const ARIA_SORT = { asc: "ascending", desc: "descending", none: "none" } as const;

const FOCUS_RING = "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  const Icon = sorted === "asc" ? ArrowUpIcon : sorted === "desc" ? ArrowDownIcon : ArrowUpDownIcon;
  return <Icon aria-hidden className="size-3.5" />;
}

interface ServicesTableProps {
  services: Service[];
  /** El servicio que se está editando; su fila queda resaltada. */
  selectedId: string | null;
  onSelect: (service: Service) => void;
}

// Los servicios: búsqueda por nombre, tabla ordenable en escritorio, lista de filas planas en
// celu y pie con la paginación. La pantalla elige tabla o lista con el ancho, no con JavaScript.
export function ServicesTable({ services, selectedId, onSelect }: ServicesTableProps) {
  const [query, setQuery] = useState("");
  // Estable entre renders: la tabla recalcula (y vuelve a la página 1) solo si cambian los datos.
  const visible = useMemo(
    () => services.filter(({ name }) => matchesQuery(name, query)),
    [services, query],
  );
  // La página se conserva al guardar o borrar; solo vuelve a la primera al buscar.
  const table = useTable({ features, columns, data: visible, initialState, autoResetPageIndex: false });
  const rows = table.getRowModel().rows;
  const { pageIndex, pageSize } = table.state.pagination;
  const lastPageIndex = Math.max(table.getPageCount() - 1, 0);

  // Si se borra lo último de la última página, se vuelve a la anterior en vez de quedar vacío.
  useEffect(() => {
    if (pageIndex > lastPageIndex) {
      table.setPageIndex(lastPageIndex);
    }
  }, [pageIndex, lastPageIndex, table]);

  function search(value: string) {
    setQuery(value);
    table.setPageIndex(0);
  }

  return (
    <div className="flex flex-col gap-4">
      <InputGroup className="md:max-w-sm">
        <InputGroupAddon>
          <SearchIcon aria-hidden />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          value={query}
          onChange={(event) => search(event.target.value)}
          placeholder="Buscar servicio…"
          aria-label="Buscar servicio"
          autoComplete="off"
        />
      </InputGroup>

      {rows.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-xl border bg-card p-4">
          <p className="font-medium">No encontramos servicios con «{query.trim()}»</p>
          <Button variant="outline" onClick={() => search("")}>
            Borrar la búsqueda
          </Button>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="hidden md:block">
            <Table>
              <TableCaption className="sr-only">Tus servicios, con su duración y su precio</TableCaption>
              <TableHeader>
                {table.getHeaderGroups().map((group) => (
                  <TableRow key={group.id} className="hover:bg-transparent">
                    {group.headers.map((header) => {
                      const sorted = header.column.getIsSorted();
                      const isPrice = header.column.id === "price_cents";
                      return (
                        <TableHead
                          key={header.id}
                          aria-sort={ARIA_SORT[sorted || "none"]}
                          className={cn("px-6 text-muted-foreground", isPrice && "text-right")}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn("-mx-2.5", isPrice && "flex-row-reverse")}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <table.FlexRender header={header} />
                            <SortIcon sorted={sorted} />
                          </Button>
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {rows.map(({ id, original: service }) => (
                  <TableRow
                    key={id}
                    className="h-14"
                    data-state={service.id === selectedId ? "selected" : undefined}
                  >
                    <TableCell className="w-full max-w-0 px-6 py-3">
                      <button
                        type="button"
                        onClick={() => onSelect(service)}
                        className={cn("block max-w-full truncate rounded-sm text-left font-medium", FOCUS_RING)}
                      >
                        {service.name}
                      </button>
                    </TableCell>
                    <TableCell className="px-6 py-3 tabular-nums text-muted-foreground">
                      {formatDuration(service.duration_minutes)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "px-6 py-3 text-right tabular-nums",
                        service.price_cents === 0 && "text-muted-foreground",
                      )}
                    >
                      {formatPrice(service.price_cents)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>

            <ItemGroup className="gap-0 divide-y md:hidden">
              {rows.map(({ id, original: service }) => (
                <div key={id} role="listitem">
                  <Item
                    size="sm"
                    render={<button type="button" onClick={() => onSelect(service)} />}
                    data-state={service.id === selectedId ? "selected" : undefined}
                    className={cn(
                      "min-h-16 flex-nowrap justify-between rounded-none px-6 text-left data-[state=selected]:bg-muted",
                      FOCUS_RING,
                    )}
                  >
                    <ItemContent className="min-w-0 gap-0">
                      <ItemTitle className="max-w-full">{service.name}</ItemTitle>
                      <ItemDescription className="tabular-nums">
                        {formatDuration(service.duration_minutes)}
                      </ItemDescription>
                    </ItemContent>
                    <ItemActions
                      className={cn(
                        "shrink-0 tabular-nums",
                        service.price_cents === 0 && "text-muted-foreground",
                      )}
                    >
                      {formatPrice(service.price_cents)}
                    </ItemActions>
                  </Item>
                </div>
              ))}
            </ItemGroup>
          </div>

          <TableFooter
            total={table.getRowCount()}
            pageIndex={pageIndex}
            pageSize={pageSize}
            pageCount={table.getPageCount()}
            canPrevious={table.getCanPreviousPage()}
            canNext={table.getCanNextPage()}
            onPrevious={() => table.previousPage()}
            onNext={() => table.nextPage()}
          />
        </>
      )}
    </div>
  );
}
