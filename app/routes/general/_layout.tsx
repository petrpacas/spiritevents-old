import type { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { Footer, Header } from "~/components";
import { authenticator } from "~/services";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);
  return { isAuthenticated: Boolean(user) };
}

export default function GeneralLayout() {
  const { isAuthenticated } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();
  return (
    <div className="grid min-h-lvh grid-rows-[auto_1fr_auto] bg-emerald-50 dark:bg-emerald-950">
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
