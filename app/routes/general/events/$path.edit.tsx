import type { MDXEditorMethods } from "@mdxeditor/editor";
import type {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import { redirect } from "react-router";
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
import { eventFormSchema } from "~/validations";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `Editing ${data?.event?.title} ~ SpiritEvents.cz` }];
};

export const links: LinksFunction = () => [...descriptionEditorStyles()];

export async function action({ params, request }: ActionFunctionArgs) {
  await requireUserSession(request);
  const id = params.path?.slice(0, 8);
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const status = data.originStatus;
  const result = eventFormSchema.safeParse(data);
  if (!result.success) {
    return dataWithError(result.error.flatten(), "Please fix the errors");
  }
  const categoryIds: string[] = result.data.categories;
  delete result.data.categories;
  delete result.data.originStatus;
  const event = await prisma.event.update({
    data:
      status === EventStatus.SUGGESTED
        ? {
            ...result.data,
            categories: {
              set: categoryIds.map((id) => ({ id })),
            },
            status: EventStatus.DRAFT,
          }
        : {
            ...result.data,
            categories: {
              set: categoryIds.map((id) => ({ id })),
            },
          },
    where: { id },
  });
  return redirectWithSuccess(
    `/events/${event.id}-${event.slug}`,
    "Event saved",
  );
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUserSession(request);
  const id = params.path?.slice(0, 8);
  const dashAndSlug = params.path?.slice(8);
  const categories = await prisma.category.findMany({
    orderBy: { slug: "asc" },
  });
  const event = await prisma.event.findUnique({
    where: { id },
    include: { categories: true },
  });
  if (!event) {
    throw new Response("Not Found", { status: 404 });
  }
  if (`-${event.slug}` !== dashAndSlug) {
    throw redirect(`/events/${id}-${event.slug}/edit`, 301);
  }
  return { categories, event };
}

export default function EventEdit() {
  const errors = useActionData<typeof action>();
  const { categories, event } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const mdxEditorRef = useRef<MDXEditorMethods>(null);
  const [fileSelected, setFileSelected] = useState(false);
  const [imageBlurHashState, setImageBlurHashState] = useState(
    event.imageBlurHash,
  );
  const [imageIdState, setImageIdState] = useState(event.imageId);
  const [imageKeyState, setImageKeyState] = useState(event.imageKey);
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
    formData.set("originStatus", event.status);
    const updatedDateEnd = formData.get("dateEnd");
    const updatedDateStart = formData.get("dateStart");
    if (
      timeEnd !== null &&
      ((timeStart === "" && timeEnd !== "") ||
        (updatedDateEnd === updatedDateStart && timeEnd === timeStart))
    ) {
      formData.set("timeEnd", "");
    }
    submit(formData, { method: "POST", replace: true });
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
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
            />
          </svg>
          <span>Editing {event.title}</span>
        </h1>
        <div className="gap-4 grid">
          <ImageUpload
            disabled={navigation.state !== "idle"}
            eventId={event.id}
            imageBlurHash={event.imageBlurHash}
            imageId={event.imageId}
            imageKey={event.imageKey}
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
              <input
                type="hidden"
                name="imageKey"
                value={
                  imageKeyState || imageKeyState === ""
                    ? imageKeyState
                    : event.imageKey
                }
              />
              <EventFormFields
                categories={categories}
                event={event}
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
                        if (el) {
                          el.focus({ preventScroll: true });
                          el.scrollIntoView({
                            behavior: "auto",
                            block: "center",
                            inline: "center",
                          });
                        }
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
                    Save
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
