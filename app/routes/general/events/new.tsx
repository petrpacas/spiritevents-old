import type { MDXEditorMethods } from "@mdxeditor/editor";
import type {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
  useSubmit,
} from "react-router";
import { FormEvent, useRef, useState } from "react";
import { dataWithError, redirectWithSuccess } from "remix-toast";
import {
  descriptionEditorStyles,
  EventFormFields,
  ImageUpload,
} from "~/components";
import { prisma, requireUserSession } from "~/services";
import { EventStatus } from "~/utils";
import { moveFileInB2 } from "~/utils/b2s3Functions.server";
import { eventFormSchema } from "~/validations";

export const meta: MetaFunction = () => {
  return [{ title: "Add a new event ~ SpiritEvents.cz" }];
};

export const links: LinksFunction = () => [...descriptionEditorStyles()];

export async function action({ request }: ActionFunctionArgs) {
  await requireUserSession(request);
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const result = eventFormSchema.safeParse(data);
  if (!result.success) {
    return dataWithError(result.error.flatten(), "Please fix the errors");
  }
  const categoryIds: string[] = result.data.categories;
  delete result.data.categories;
  const event = await prisma.event.create({
    data: {
      ...result.data,
      categories: { connect: categoryIds.map((id) => ({ id })) },
      status: EventStatus.DRAFT,
    },
  });
  if (
    result.data.imageKey &&
    result.data.imageKey !== "" &&
    result.data.imageId &&
    result.data.imageId !== ""
  ) {
    await moveFileInB2(result.data.imageKey, result.data.imageId);
  }
  return redirectWithSuccess(
    `/events/${event.id}-${event.slug}`,
    "Event saved as a draft",
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserSession(request);
  const categories = await prisma.category.findMany({
    orderBy: { slug: "asc" },
  });
  return { categories };
}

export default function EventNew() {
  const errors = useActionData<typeof action>();
  const { categories } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const mdxEditorRef = useRef<MDXEditorMethods>(null);
  const [fileSelected, setFileSelected] = useState(false);
  const [imageBlurHashState, setImageBlurHashState] = useState("");
  const [imageIdState, setImageIdState] = useState("");
  const [imageKeyState, setImageKeyState] = useState("");
  const submit = useSubmit();
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const $form = e.currentTarget;
    const formData = new FormData($form);
    const categories = formData.getAll("category");
    const dateEnd = formData.get("dateEnd");
    const dateStart = formData.get("dateStart");
    const description = mdxEditorRef.current?.getMarkdown();
    const timeEnd = formData.get("timeEnd");
    const timeStart = formData.get("timeStart");
    formData.delete("category");
    formData.set("categories", JSON.stringify(categories));
    if (dateStart !== null && dateStart !== "" && dateEnd === "") {
      formData.set("dateEnd", dateStart);
    }
    if (dateEnd !== null && dateEnd !== "" && dateStart === "") {
      formData.set("dateStart", dateEnd);
    }
    formData.set("description", description ?? "");
    if (timeEnd !== null && timeStart === "" && timeEnd !== "") {
      formData.set("timeEnd", "");
    }
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
          <span>Add a new event</span>
        </h1>
        <div className="gap-4 grid">
          <ImageUpload
            disabled={navigation.state !== "idle"}
            onBlurHashChange={setImageBlurHashState}
            onFileChange={setFileSelected}
            onIdChange={setImageIdState}
            onKeyChange={setImageKeyState}
          />
          <Form onSubmit={handleSubmit}>
            <fieldset
              className="gap-4 grid"
              disabled={navigation.state !== "idle"}
            >
              <input
                type="hidden"
                name="imageBlurHash"
                value={imageBlurHashState}
              />
              <input type="hidden" name="imageId" value={imageIdState} />
              <input type="hidden" name="imageKey" value={imageKeyState} />
              <EventFormFields
                categories={categories}
                errors={errors}
                mdxEditorRef={mdxEditorRef}
              />
              <div className="flex justify-end gap-4">
                {fileSelected ? (
                  <button
                    type="button"
                    className="border-emerald-600 bg-white disabled:opacity-50 shadow-sm hover:shadow-md active:shadow px-4 py-2 border rounded text-emerald-600"
                    onClick={() => {
                      const el = document.getElementById("imageUploadButton");
                      if (el) {
                        el.focus({ preventScroll: true });
                        el.scrollIntoView({
                          behavior: "auto",
                          block: "center",
                          inline: "center",
                        });
                      }
                    }}
                  >
                    Upload image first
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="bg-emerald-600 disabled:opacity-50 shadow-sm hover:shadow-md active:shadow px-4 py-2 border border-transparent rounded text-white"
                  >
                    Save as draft
                  </button>
                )}
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
    </div>
  );
}
