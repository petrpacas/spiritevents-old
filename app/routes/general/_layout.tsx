import type { LoaderFunctionArgs } from "react-router";
import { Outlet, useLoaderData, useLocation } from "react-router";
import { Footer, Header } from "~/components";
import { authenticate } from "~/services";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticate(request);
  return { isAuthenticated: Boolean(user) };
}

export default function GeneralLayout() {
  const { isAuthenticated } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();
  return (
    <div className="grid grid-rows-[auto_1fr_auto] bg-emerald-50 dark:bg-emerald-950 min-h-lvh">
      <Header
        isAuthenticated={isAuthenticated}
        isLanding={pathname === "/"}
        key={pathname}
      />
      <main>
        <Outlet />
      </main>
      <Footer isAuthenticated={isAuthenticated} />
    </div>
  );
}
