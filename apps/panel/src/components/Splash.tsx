export function Splash() {
  return (
    <output className="grid min-h-dvh place-items-center text-muted-foreground">
      Cargando…
    </output>
  );
}

export function ErrorScreen() {
  return (
    <main className="grid min-h-dvh place-items-center px-5 text-center">
      <div>
        <h1 className="text-xl font-semibold">Algo salió mal</h1>
        <p className="mt-2 text-muted-foreground">
          Recargá la página. Si sigue igual, probá de nuevo en un rato.
        </p>
      </div>
    </main>
  );
}
