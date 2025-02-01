import type { LoaderFunctionArgs } from "react-router";
import { Outlet, useLoaderData, useLocation } from "react-router";
import { Header } from "~/components";
import { authenticate } from "~/services";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticate(request);
  return { isAuthenticated: Boolean(user) };
}

export default function AuthLayout() {
  const { isAuthenticated } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();
  return (
    <div className="grid grid-rows-[auto_1fr_auto] bg-emerald-50 dark:bg-emerald-950 min-h-lvh">
      <Header isAuthenticated={isAuthenticated} key={pathname} />
      <main>
        <Outlet />
      </main>
      <footer className="px-4 sm:px-8 py-8 text-4xl text-center">👋</footer>
    </div>
  );
}
