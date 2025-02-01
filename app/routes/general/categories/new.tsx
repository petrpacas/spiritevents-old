import { FormEvent } from "react";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import {
  Form,
  useActionData,
  useNavigate,
  useNavigation,
  useSubmit,
} from "react-router";
import { dataWithError, redirectWithSuccess } from "remix-toast";
import { CategoryFormFields } from "~/components";
import { prisma, requireUserSession } from "~/services";
import { categoryFormSchema } from "~/validations";

export const meta: MetaFunction = () => {
  return [{ title: "Add a new category ~ SpiritEvents.cz" }];
};

export async function action({ request }: ActionFunctionArgs) {
  await requireUserSession(request);
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const result = await categoryFormSchema.safeParseAsync(data);
  if (!result.success) {
    return dataWithError(result.error.flatten(), "Please fix the errors");
  }
  await prisma.category.create({
    data: result.data,
  });
  return redirectWithSuccess("/categories", "Category saved");
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserSession(request);
  return null;
}

export default function CategoryNew() {
  const errors = useActionData<typeof action>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const submit = useSubmit();
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const $form = e.currentTarget;
    const formData = new FormData($form);
    submit(formData, { method: "POST" });
  };
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
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          <span>Add a new category</span>
        </h1>
        <Form onSubmit={handleSubmit}>
          <fieldset
            className="gap-4 grid"
            disabled={navigation.state !== "idle"}
          >
            <CategoryFormFields errors={errors} />
            <div className="flex justify-end gap-4">
              <button
                type="submit"
                className="bg-emerald-600 disabled:opacity-50 shadow-sm hover:shadow-md active:shadow px-4 py-2 border border-transparent rounded text-white"
              >
                Save
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
    </div>
  );
}
