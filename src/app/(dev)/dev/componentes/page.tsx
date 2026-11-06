import { CalendarPlus, Check, Clock, Plus, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ToastDemo } from "./toast-demo";

export const metadata: Metadata = { title: "Componentes · Agenditas" };

// Página interna para revisar el tematizado de src/components/ui. No existe en producción.
export default function ComponentesPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <TooltipProvider>
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <h1 className="font-semibold text-2xl tracking-[-0.01em]">
          Componentes · Calma operativa
        </h1>
        <p className="mt-1 text-foreground-2">
          Las primitivas de{" "}
          <code className="font-mono text-sm">src/components/ui</code> con el
          tema del sistema, forzado a oscuro y con el acento de otro negocio.
        </p>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Panel title="Tema del sistema">
            <Showcase />
          </Panel>
          <Panel title="Oscuro" theme="dark">
            <Showcase />
          </Panel>
          <Panel
            title="Acento del negocio (#8A3B9C)"
            style={{ "--primary": "#8A3B9C" } as CSSProperties}
          >
            <Showcase />
          </Panel>
        </div>
      </main>
      <Toaster />
    </TooltipProvider>
  );
}

function Panel({
  title,
  theme,
  style,
  children,
}: {
  title: string;
  theme?: "dark";
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <section
      data-theme={theme}
      style={style}
      className="rounded-lg border border-border bg-background p-5 text-foreground"
    >
      <h2 className="mb-5 font-semibold text-lg">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="font-medium text-muted-foreground text-xs">{label}</h3>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

function Showcase() {
  return (
    <div className="space-y-6">
      <Row label="Botón · variantes">
        <Button>
          <Plus /> Nuevo turno
        </Button>
        <Button variant="outline">Reprogramar</Button>
        <Button variant="ghost">Cancelar</Button>
        <Button variant="destructive">No vino</Button>
        <Button variant="link">Ver cliente</Button>
      </Row>
      <Row label="Botón · tamaños 32 / 40 / 44 / 52 y deshabilitado">
        <Button size="sm">Chico</Button>
        <Button>Normal</Button>
        <Button size="lg">Grande</Button>
        <Button size="xl">Reservar turno</Button>
        <Button disabled>Deshabilitado</Button>
        <Button
          size="icon"
          variant="outline"
          aria-label="Agregar al calendario"
        >
          <CalendarPlus />
        </Button>
      </Row>

      <div className="grid gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="nombre">Nombre y apellido</Label>
          <Input id="nombre" placeholder="Martina López" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="wa">WhatsApp</Label>
          <Input
            id="wa"
            aria-invalid
            defaultValue="15 1234"
            aria-describedby="wa-error"
            className="font-mono tabular-nums"
          />
          <p id="wa-error" className="text-destructive text-sm">
            Revisá el número: código de área y número, sin el 0 ni el 15.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="notas">Notas</Label>
          <Textarea id="notas" placeholder="Algo que tengamos que saber" />
        </div>
        <div className="space-y-1.5">
          <Label>Servicio</Label>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Elegí un servicio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="corte">Corte · 30 min</SelectItem>
              <SelectItem value="corte-barba">
                Corte + barba · 45 min
              </SelectItem>
              <SelectItem value="color">Color completo · 1 h 30 min</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Row label="Selección">
        <div className="flex items-center gap-2">
          <Checkbox id="aviso" defaultChecked />
          <Label htmlFor="aviso">Avisar al cliente</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="online" defaultChecked />
          <Label htmlFor="online">Reservas online</Label>
        </div>
      </Row>
      <RadioGroup defaultValue="cualquiera" className="flex gap-4">
        {["cualquiera", "nico", "lucas"].map((v) => (
          <div key={v} className="flex items-center gap-2">
            <RadioGroupItem value={v} id={`pro-${v}`} />
            <Label htmlFor={`pro-${v}`} className="capitalize">
              {v}
            </Label>
          </div>
        ))}
      </RadioGroup>
      <Row label="Segmentado">
        <ToggleGroup type="single" defaultValue="dia" variant="segmented">
          <ToggleGroupItem value="dia">Día</ToggleGroupItem>
          <ToggleGroupItem value="semana">Semana</ToggleGroupItem>
          <ToggleGroupItem value="mes">Mes</ToggleGroupItem>
          <ToggleGroupItem value="lista">Lista</ToggleGroupItem>
        </ToggleGroup>
      </Row>

      <Row label="Estados y personas">
        <Badge>
          <Check /> Confirmado
        </Badge>
        <Badge variant="warning">
          <Clock /> Seña pendiente
        </Badge>
        <Badge variant="outline">Atendido</Badge>
        <Badge variant="destructive">No vino</Badge>
        <Avatar>
          <AvatarFallback>N</AvatarFallback>
        </Avatar>
      </Row>

      <Alert variant="warning">
        <TriangleAlert />
        <AlertTitle>Ese horario se ocupó recién</AlertTitle>
        <AlertDescription>Elegí otro.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <TriangleAlert />
        <AlertTitle>No pudimos guardar el turno</AlertTitle>
        <AlertDescription>Probá de nuevo en unos segundos.</AlertDescription>
      </Alert>

      <Row label="Cargando">
        <Skeleton className="h-10 w-full" />
      </Row>
      <Separator />

      <Row label="Lo que flota">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Tooltip</Button>
          </TooltipTrigger>
          <TooltipContent>Atajo: N</TooltipContent>
        </Tooltip>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Popover</Button>
          </PopoverTrigger>
          <PopoverContent>Libre 15 min · visible en tu página</PopoverContent>
        </Popover>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Menú</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Marcar atendido</DropdownMenuItem>
            <DropdownMenuItem>Reprogramar</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              Cancelar turno
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Diálogo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Cancelar el turno de Diego?</DialogTitle>
              <DialogDescription>
                Le avisamos por WhatsApp y se le devuelve la seña.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Volver</Button>
              </DialogClose>
              <Button variant="destructive">Cancelar turno</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Panel lateral</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Diego A. · 11:15</SheetTitle>
              <SheetDescription>Corte + barba con Nico</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
        <ToastDemo />
      </Row>

      <Command className="border border-border">
        <CommandInput placeholder="Buscar cliente o turno…" />
        <CommandList>
          <CommandEmpty>Sin resultados.</CommandEmpty>
          <CommandGroup heading="Clientes">
            <CommandItem>Martina López</CommandItem>
            <CommandItem>Diego Álvarez</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
