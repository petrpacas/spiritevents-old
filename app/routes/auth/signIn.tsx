import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import {
  data,
  redirect,
  Form,
  useNavigate,
  useNavigation,
  useLoaderData,
} from "react-router";
import {
  authenticator,
  commitSession,
  getSession,
} from "~/services/auth.server";

export const meta: MetaFunction = () => {
  return [{ title: "Sign in ~ SpiritEvents.cz" }];
};

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("cookie"));
  const requestUrl = new URL(request.url);
  const originRoute = requestUrl.searchParams.get("originRoute");

  try {
    const user = await authenticator.authenticate("FormStrategy", request);
    session.set("user", user);
    return redirect(originRoute || "/", {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  } catch (error: any) {
    session.flash("authError", error.message || "Authentication failed");
    const signInPath = originRoute
      ? `/sign-in?originRoute=${originRoute}`
      : "/sign-in";
    return redirect(signInPath, {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("cookie"));
  if (session.has("user")) {
    throw redirect("/");
  }
  const authError = session.get("authError");
  session.unset("authError");
  return data(
    { authError },
    { headers: { "Set-Cookie": await commitSession(session) } },
  );
}

export default function SignIn() {
  const { authError } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const navigation = useNavigation();

  return (
    <div className="grid mx-auto px-4 sm:px-8 py-8 w-full max-w-7xl">
      <Form
        replace
        method="post"
        className="w-full max-w-80 text-center place-self-center"
      >
        <fieldset className="gap-8 grid" disabled={navigation.state !== "idle"}>
          <h1 className="font-bold text-xl sm:text-2xl leading-snug sm:leading-snug">
            Sign in
          </h1>
          <div className="gap-4 grid">
            <label className="gap-2 grid">
              Email
              <input
                autoComplete="off"
                type="email"
                name="email"
                required
                className="border-stone-300 bg-white dark:bg-stone-950 shadow-sm hover:shadow-md active:shadow px-4 py-2 border rounded w-full"
              />
            </label>
            <label className="gap-2 grid">
              Password
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                className="border-stone-300 bg-white dark:bg-stone-950 shadow-sm hover:shadow-md active:shadow px-4 py-2 border rounded w-full"
              />
            </label>
            {authError && <p className="text-red-600">{authError}</p>}
          </div>
          <div className="gap-4 grid">
            <button
              type="submit"
              className="bg-emerald-600 disabled:opacity-50 shadow-sm hover:shadow-md active:shadow px-4 py-2 border border-transparent rounded text-white"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="border-emerald-600 dark:border-white disabled:opacity-50 shadow-sm hover:shadow-md active:shadow px-4 py-2 border rounded text-emerald-600 dark:text-white"
            >
              Back
            </button>
          </div>
        </fieldset>
      </Form>
    </div>
  );
}
