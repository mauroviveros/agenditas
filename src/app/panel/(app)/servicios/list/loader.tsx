import { getMyServices } from "@/lib/services/queries";
import { ServicesFailed } from "./failed";
import { ServicesView } from "./view";

// Lee los servicios y elige qué mostrar: la lista (o el vacío, que decide la vista) o, si
// falla la lectura, el aviso con «Probá de nuevo». El detalle del error queda en el log.
export async function ServicesLoader() {
  try {
    return <ServicesView services={await getMyServices()} />;
  } catch (error) {
    console.error(error);
    return <ServicesFailed />;
  }
}
