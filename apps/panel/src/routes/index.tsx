import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  return (
    <main className="grid min-h-dvh place-items-center p-4">
      <h1 className="text-xl font-semibold">Tu agenda está por acá</h1>
    </main>
  );
}
