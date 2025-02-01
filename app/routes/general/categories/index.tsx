import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import { Link, useFetcher, useLoaderData, useNavigate } from "react-router";
import { dataWithSuccess } from "remix-toast";
import { prisma, requireUserSession } from "~/services";

export const meta: MetaFunction = () => {
  return [{ title: "All categories ~ SpiritEvents.cz" }];
};

export async function action({ request }: ActionFunctionArgs) {
  await requireUserSession(request);
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const id = data.id;
  if (typeof id === "string") {
    await prisma.category.delete({ where: { id } });
    return dataWithSuccess("/categories", "Category deleted");
  }
  return null;
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserSession(request);
  const allCategories = await prisma.category.findMany({
    orderBy: { slug: "asc" },
    include: { _count: true },
  });
  return { allCategories };
}

export default function Categories() {
  const { allCategories } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const isWorking = fetcher.state !== "idle";
  return (
    <div className="grid mx-auto px-4 sm:px-8 pt-8 pb-16 w-full max-w-7xl">
      <div className="gap-8 grid">
        <h1 className="flex items-center gap-2 font-bold text-3xl sm:text-4xl leading-snug sm:leading-snug">
          <svg
            className="max-xl:hidden w-8 sm:w-10 h-8 sm:h-10 text-amber-600 shrink-0"
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
              d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 6h.008v.008H6V6Z"
            />
          </svg>
          <span>All categories</span>
        </h1>
        <div className="gap-4 grid">
          {allCategories.length > 0 ? (
            <div className="sm:flex sm:flex-wrap gap-4 grid">
              {allCategories.map((category) => (
                <div key={category.id} className="flex">
                  <Link
                    to={`/categories/${category.id}-${category.slug}/edit`}
                    className="flex flex-grow border-emerald-600 bg-white dark:bg-stone-950 shadow-sm hover:shadow-md active:shadow p-2 border border-r-0 rounded-l"
                  >
                    <div className="sm:flex sm:flex-grow gap-2 grid">
                      <span className="font-semibold">{category.name}</span>
                      <span className="text-amber-600">[{category.slug}]</span>{" "}
                      <span className="text-stone-400">
                        ({category._count.events}x)
                      </span>
                    </div>
                  </Link>
                  <fetcher.Form
                    className="flex"
                    method="post"
                    onSubmit={(e) => {
                      const response = confirm(
                        "Do you really want to delete the category?",
                      );
                      if (!response) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <button
                      disabled={isWorking}
                      type="submit"
                      name="id"
                      value={category.id}
                      className="bg-red-600 disabled:opacity-50 shadow-sm hover:shadow-md active:shadow px-2 border border-red-600 rounded-r text-white"
                    >
                      <svg
                        className="w-6 h-6"
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
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </fetcher.Form>
                </div>
              ))}
            </div>
          ) : (
            <p className="justify-self-center border-amber-600 border-y sm:px-4 py-4 sm:py-8 text-xl sm:text-2xl italic">
              No category yet&hellip;
            </p>
          )}
          <div className="flex justify-end gap-4">
            <Link
              to="/categories/new"
              className="border-emerald-600 bg-emerald-600 disabled:opacity-50 shadow-sm hover:shadow-md active:shadow px-4 py-2 border rounded text-white"
            >
              New
            </Link>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="border-emerald-600 dark:border-white disabled:opacity-50 shadow-sm hover:shadow-md active:shadow px-4 py-2 border rounded text-emerald-600 dark:text-white"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
