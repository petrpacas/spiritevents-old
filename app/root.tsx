import type { LinksFunction, LoaderFunctionArgs } from "react-router";
import {
  data,
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  redirect,
  Scripts,
  ScrollRestoration,
  useFetchers,
  useLocation,
  useNavigate,
  useNavigation,
  useRouteError,
  useRouteLoaderData,
} from "react-router";
import NProgress from "nprogress";
import { ReactNode, useEffect, useMemo } from "react";
import { toast as showToast, Toaster } from "react-hot-toast";
import { getToast } from "remix-toast";
import { Footer, Header } from "./components";
import styles from "./tailwind.css?url";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { toast, headers } = await getToast(request);
  const { pathname, search } = new URL(request.url);
  if (pathname.endsWith("/") && pathname !== "/") {
    throw redirect(`${pathname.slice(0, -1)}${search}`, 301);
  }
  if (toast && headers) {
    return data({ toast }, { headers });
  } else {
    return null;
  }
};

export function Layout({ children }: { children: ReactNode }) {
  const fetchers = useFetchers();
  const navigation = useNavigation();
  const data = useRouteLoaderData<typeof loader>("root");
  const error = useRouteError();
  const state = useMemo<"idle" | "working">(
    function getGlobalState() {
      const states = [
        navigation.state,
        ...fetchers.map((fetcher) => fetcher.state),
      ];
      if (states.every((state) => state === "idle")) {
        return "idle";
      }
      return "working";
    },
    [navigation.state, fetchers],
  );
  useEffect(() => {
    if (state === "working") {
      NProgress.start();
    }
    if (state === "idle") {
      NProgress.done();
    }
  }, [state]);
  useEffect(() => {
    if (data?.toast) {
      switch (data.toast.type) {
        case "success":
          showToast.success(data.toast.message);
          break;
        case "error":
          showToast.error(data.toast.message);
          break;
        default:
          showToast(data.toast.message);
          break;
      }
    }
  }, [data?.toast]);
  return (
    <html lang="en">
      <head>
        {!!error && (
          <title>
            {`${
              isRouteErrorResponse(error)
                ? error.status === 404
                  ? "Page not found"
                  : error.statusText
                : error instanceof Error
                  ? "Error"
                  : "Unknown error"
            } ~ SpiritEvents.cz`}
          </title>
        )}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content="#ffffff"
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content="#0c0a09"
        />
        <meta
          name="msapplication-navbutton-color"
          media="(prefers-color-scheme: light)"
          content="#ffffff"
        />
        <meta
          name="msapplication-navbutton-color"
          media="(prefers-color-scheme: dark)"
          content="#0c0a09"
        />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          media="(prefers-color-scheme: light)"
          content="#ffffff"
        />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          media="(prefers-color-scheme: dark)"
          content="#0c0a09"
        />
        <meta name="robots" content="index, follow" />
        <Meta />
        <meta property="og:image" content="https://spiritevents.cz/logo.jpeg" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png?v=2024-08-08"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png?v=2024-08-08"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png?v=2024-08-08"
        />
        <link
          rel="shortcut icon"
          type="image/x-icon"
          href="/favicon.ico?v=2024-08-08"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        />
        <Links />
      </head>
      <body className="relative bg-white dark:bg-stone-950 text-stone-950 dark:text-white">
        {children}
        <Toaster
          toastOptions={{
            className:
              "!bg-stone-950 !text-white dark:!bg-white dark:!text-stone-950",
            duration: 3333,
            position: "bottom-center",
          }}
        />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const error = useRouteError();
  console.error(error);
  const hClassName =
    "flex items-center gap-2 text-3xl font-bold leading-snug sm:text-4xl sm:leading-snug";
  const icon = (
    <svg
      className={`h-8 w-8 shrink-0 ${isRouteErrorResponse(error) && error.status === 404 ? "text-orange-600" : "text-red-600"} max-xl:hidden sm:h-10 sm:w-10`}
      width="16px"
      height="16px"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
      />
    </svg>
  );
  return (
    <div className="grid grid-rows-[auto_1fr_auto] bg-emerald-50 dark:bg-emerald-950 min-h-lvh">
      <Header isAuthenticated={false} key={pathname} />
      <main
        className={`flex justify-center ${isRouteErrorResponse(error) && error.status === 404 ? "" : "bg-red-100 dark:bg-red-900"}`}
      >
        <div className="grid px-4 sm:px-8 pt-8 pb-16 w-full max-w-7xl">
          <div className="gap-8 grid">
            {isRouteErrorResponse(error) ? (
              error.status === 404 ? (
                <>
                  <h1 className={hClassName}>
                    {icon}
                    <span>Requested page was not found</span>
                  </h1>
                  <p className="text-lg sm:text-xl">
                    Not sure what happened there&hellip; Probably a bad link,
                    eh?
                  </p>
                </>
              ) : (
                <>
                  <h1 className={hClassName}>
                    {icon}
                    <span>
                      {error.statusText} ({error.status})
                    </span>
                  </h1>
                  {error.data && (
                    <p className="text-lg sm:text-xl">{error.data}</p>
                  )}
                </>
              )
            ) : error instanceof Error ? (
              <>
                <h1 className={hClassName}>
                  {icon}
                  <span>Error</span>
                </h1>
                {error.message && (
                  <p className="text-lg sm:text-xl">{error.message}</p>
                )}
                {error.stack && (
                  <pre className="overflow-x-auto">{error.stack}</pre>
                )}
              </>
            ) : (
              <>
                <h1 className={hClassName}>
                  {icon}
                  <span>Unknown error</span>
                </h1>
                <p className="text-lg sm:text-xl">
                  Sorry about that, please try again&hellip;
                </p>
              </>
            )}
            <div className="flex justify-end gap-4">
              <Link
                to="/"
                className="bg-emerald-600 shadow-sm hover:shadow-md active:shadow px-4 py-2 border border-transparent rounded text-white"
              >
                Go to homepage
              </Link>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="border-emerald-600 dark:border-white shadow-sm hover:shadow-md active:shadow px-4 py-2 border rounded text-emerald-600 dark:text-white"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer isAuthenticated={false} />
    </div>
  );
}
