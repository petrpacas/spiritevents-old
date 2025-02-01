import type { ActionFunctionArgs } from "react-router";
import {
  Form,
  Link,
  useFetcher,
  useLocation,
  useNavigation,
} from "react-router";
import { useEffect, useRef } from "react";
import { dataWithError, dataWithSuccess } from "remix-toast";
import { inferFlattenedErrors } from "zod";
import { prisma } from "~/services";
import { subscriberFormSchema } from "~/validations";

type Props = {
  isAuthenticated: boolean;
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const result = await subscriberFormSchema.safeParseAsync(data);
  if (!result.success) {
    return dataWithError(
      { errors: result.error.flatten() },
      "Please fix the errors",
    );
  }
  const { email, name } = result.data;
  await prisma.subscriber.upsert({
    create: { email, name },
    update: { name },
    where: { email },
  });
  return dataWithSuccess({ success: true }, "Welcome on board!");
}

export const Footer = ({ isAuthenticated }: Props) => {
  type ActionData = {
    errors?: inferFlattenedErrors<typeof subscriberFormSchema>;
    success: boolean;
  };
  const fetcher = useFetcher<ActionData>();
  const actionData = fetcher.data;
  const { pathname, search } = useLocation();
  const navigation = useNavigation();
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (actionData?.success) {
      formRef.current?.reset();
    }
  }, [actionData?.success]);
  let signInUrl = "";
  if (pathname === "/" || pathname === "/sign-in") {
    signInUrl = "/sign-in" + search;
  } else {
    signInUrl = "/sign-in?originRoute=" + pathname + search;
  }
  return (
    <footer className="bg-white dark:bg-stone-950">
      <div className="gap-16 grid mx-auto px-4 sm:px-8 py-8 sm:py-16 w-full max-w-7xl">
        <div className="items-start gap-16 grid xl:grid-cols-3">
          <div className="items-start gap-8 xl:gap-x-16 grid xl:grid-cols-2 xl:col-span-2">
            <h3 className="xl:col-span-2 text-2xl sm:text-3xl leading-snug sm:leading-snug">
              🤙 Stay in the <strong>loop</strong>
            </h3>
            <div className="gap-4 grid">
              <p className="text-lg sm:text-xl">
                Don&apos;t expect to get any email from me anytime soon, but if
                and when one goes out, it could be really{" "}
                <em>worth your while to be in the list</em>!
              </p>
              <p className="text-amber-600 sm:text-lg">
                (By joining you agree to receive the potential newsletter,
                legally speaking.)
              </p>
            </div>
            <fetcher.Form
              action="/resources/footer"
              method="post"
              ref={formRef}
            >
              <fieldset
                disabled={fetcher.state !== "idle"}
                className="gap-2 grid sm:max-[839px]:grid-cols-2 min-[840px]:max-xl:grid-cols-3 self-start"
              >
                <input
                  placeholder="Name (optional)"
                  autoComplete="on"
                  type="text"
                  name="name"
                  className="border-stone-300 dark:bg-stone-950 shadow-sm hover:shadow-md active:shadow py-2 sm:py-4 rounded-lg w-full text-lg placeholder-stone-400 dark:placeholder-stone-500"
                />
                <input
                  required
                  placeholder="Email"
                  autoComplete="on"
                  type="email"
                  name="email"
                  className="border-stone-300 dark:bg-stone-950 shadow-sm hover:shadow-md active:shadow py-2 sm:py-4 rounded-lg w-full text-lg placeholder-stone-400 dark:placeholder-stone-500"
                />
                {actionData?.errors?.fieldErrors.name && (
                  <p className="min-[840px]:max-xl:order-4 sm:max-[839px]:col-span-2 min-[840px]:max-xl:col-span-3 text-center text-red-600">
                    {actionData.errors.fieldErrors.name.join(", ")}
                  </p>
                )}
                {actionData?.errors?.fieldErrors.email && (
                  <p className="min-[840px]:max-xl:order-4 sm:max-[839px]:col-span-2 min-[840px]:max-xl:col-span-3 text-center text-red-600">
                    {actionData.errors.fieldErrors.email.join(", ")}
                  </p>
                )}
                <button
                  type="submit"
                  className="flex justify-center items-center gap-3 sm:max-[839px]:col-span-2 bg-emerald-600 disabled:opacity-50 shadow-sm hover:shadow-md active:shadow px-4 xl:px-8 py-2 sm:py-4 border border-transparent rounded-lg text-lg text-white"
                >
                  Join the mailing list
                  <svg
                    className="max-[339px]:hidden w-6 h-6"
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
                      d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                    />
                  </svg>
                </button>
              </fieldset>
            </fetcher.Form>
          </div>
          <div className="gap-8 grid text-center xl:text-left" id="contacts">
            <h3 className="font-bold text-2xl sm:text-3xl leading-snug sm:leading-snug">
              <span className="text-emerald-600">Spirit</span>Events 👋
            </h3>
            <div className="gap-4 grid">
              <div className="gap-2 grid">
                <div>
                  <a
                    href="mailto:info@spiritevents.cz"
                    className="text-amber-600 text-lg sm:text-xl underline break-all leading-snug sm:leading-snug"
                  >
                    info@spiritevents.cz
                  </a>
                </div>
                <div>
                  <a
                    href="https://instagram.com/spiritevents.cz"
                    className="text-amber-600 text-lg sm:text-xl underline leading-snug sm:leading-snug"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    instagram
                  </a>
                </div>
                <div>
                  <a
                    href="https://facebook.com/spiritevents.cz"
                    className="text-amber-600 text-lg sm:text-xl underline leading-snug sm:leading-snug"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    facebook
                  </a>
                </div>
              </div>
            </div>
            {isAuthenticated ? (
              <Form action="/sign-out" method="post">
                <button
                  disabled={navigation.state !== "idle"}
                  type="submit"
                  className="inline-flex justify-self-center xl:justify-self-start items-center gap-3 border-emerald-600 dark:border-white disabled:opacity-50 shadow-sm hover:shadow-md active:shadow px-4 py-2 border rounded text-emerald-600 text-sm dark:text-white"
                >
                  Admin sign out
                  <svg
                    className="w-5 h-5"
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
                      d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                    />
                  </svg>
                </button>
              </Form>
            ) : (
              <Link
                to={signInUrl}
                className="inline-flex justify-self-center xl:justify-self-start items-center gap-3 border-emerald-600 dark:border-white shadow-sm hover:shadow-md active:shadow px-4 py-2 border rounded text-emerald-600 text-sm dark:text-white"
              >
                Admin sign in
                <svg
                  className="w-5 h-5"
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
                    d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
                  ></path>
                </svg>
              </Link>
            )}
          </div>
        </div>
        <div className="justify-center items-center gap-8 grid text-center">
          <div className="max-[399px]:grid">
            Cover photo 📸 by{" "}
            <a
              href="https://www.soulfocus.media/"
              className="text-amber-600 underline"
            >
              Phoebe Montague
            </a>
          </div>
          <div className="max-[399px]:grid">
            Made with 💛 by{" "}
            <a
              href="https://petrpacas.cz/"
              className="text-amber-600 underline"
            >
              Petr Pacas
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
