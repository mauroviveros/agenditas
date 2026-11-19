import { Suspense } from "react";
import { ServicesLoader } from "./loader";
import { ServicesSkeleton } from "./skeleton";

// Los servicios con su esqueleto mientras cargan.
export function ServicesList() {
  return (
    <Suspense fallback={<ServicesSkeleton />}>
      <ServicesLoader />
    </Suspense>
  );
}
