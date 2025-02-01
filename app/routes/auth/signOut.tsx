import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { getSession, destroySession } from "~/services";

export async function action({ request }: ActionFunctionArgs) {
  let session = await getSession(request.headers.get("cookie"));
  return redirect("/", {
    headers: { "Set-Cookie": await destroySession(session) },
  });
}

export async function loader() {
  return redirect("/");
}
