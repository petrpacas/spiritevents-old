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
import { Bot } from "grammy";
import { FormEvent, useRef, useState } from "react";
import { dataWithError, redirectWithSuccess } from "remix-toast";
import slugify from "slugify";
import {
  descriptionEditorStyles,
  EventFormFields,
  ImageUpload,
} from "~/components";
import { authenticate, prisma } from "~/services";
import { EventStatus } from "~/utils";
import { moveFileInB2 } from "~/utils/b2s3Functions.server";
import { eventFormSchema } from "~/validations";

slugify.extend({
  "&": "",
  "|": "",
  "<": "",
  ">": "",
});

export const meta: MetaFunction = () => {
  return [{ title: "Suggest a new event ~ SpiritEvents.cz" }];
};

export const links: LinksFunction = () => [...descriptionEditorStyles()];

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const result = eventFormSchema.safeParse(data);
  if (!result.success) {
    return dataWithError(result.error.flatten(), "Please fix the errors");
  }
  const categoryIds: string[] = result.data.categories;
  delete result.data.categories;
  await prisma.event.create({
    data: {
      ...result.data,
      categories: { connect: categoryIds.map((id) => ({ id })) },
      status: EventStatus.SUGGESTED,
    },
  });
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);
    await bot.api.sendMessage(
      process.env.TELEGRAM_CHAT_ID,
      `New event suggestion: ${result.data.title} | ${result.data.location}`,
    );
  }
  if (
    result.data.imageKey &&
    result.data.imageKey !== "" &&
    result.data.imageId &&
    result.data.imageId !== ""
  ) {
    await moveFileInB2(result.data.imageKey, result.data.imageId);
  }
  return redirectWithSuccess("/events", "Much appreciated!");
}

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate(request, "/events/new");
  const categories = await prisma.category.findMany({
    orderBy: { slug: "asc" },
  });
  return { categories };
}

export default function EventSuggest() {
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
    const title = formData.get("title");
    formData.delete("category");
    formData.set("categories", JSON.stringify(categories));
    if (dateStart !== null && dateStart !== "" && dateEnd === "") {
      formData.set("dateEnd", dateStart);
    }
    if (dateEnd !== null && dateEnd !== "" && dateStart === "") {
      formData.set("dateStart", dateEnd);
    }
    formData.set("description", description ?? "");
    formData.set("slug", slugify(String(title), { lower: true, strict: true }));
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
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
            />
          </svg>
          <span>Suggest a new event</span>
        </h1>
        <p className="text-lg sm:text-xl">
          Do you know of any relevant event that deserves to be found by
          like-minded people?
        </p>
        <p className="text-amber-600 text-lg sm:text-xl">
          Suggesting it will not only support the event, but also all the other
          event seekers.
        </p>
        <p className="text-lg sm:text-xl">
          If you choose to send a suggestion, I&apos;d like to kindly ask you to
          fill the form below with at least the event title and the region and
          location it&apos;s happening in.
        </p>
        <p className="text-lg sm:text-xl">
          If you want to contribute but don&apos;t want to fiddle with the form,
          no worries, go ahead and just reach out through the contacts{" "}
          <button
            type="button"
            className="text-amber-600 underline"
            onClick={() => {
              const el = document.getElementById("contacts");
              if (el) {
                el.scrollIntoView({
                  behavior: "auto",
                  block: "center",
                  inline: "center",
                });
              }
            }}
          >
            in the footer
          </button>
          .
        </p>
        <div className="border-emerald-600 border-y sm:px-4 py-8 font-semibold text-center text-lg sm:text-xl">
          Let&apos;s make this place a true portal together 🌀
        </div>
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
                isSuggesting
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
                    Suggest
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
