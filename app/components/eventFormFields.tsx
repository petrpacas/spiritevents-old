import type { MDXEditorMethods } from "@mdxeditor/editor";
import type { Category, Prisma } from "@prisma/client";
import type { ChangeEvent, RefObject } from "react";
import { useState } from "react";
import { ClientOnly } from "remix-utils/client-only";
import slugify from "slugify";
import { z } from "zod";
import { EventStatus, regions } from "~/utils";
import { eventFormSchema } from "~/validations";
import { DescriptionEditor } from "./descriptionEditor";
import { Select } from "./select";

slugify.extend({
  "&": "",
  "|": "",
  "<": "",
  ">": "",
});

type EventWithCategories = Prisma.EventGetPayload<{
  include: { categories: true };
}>;
type Props = {
  errors?: z.inferFlattenedErrors<typeof eventFormSchema>;
  event?: EventWithCategories;
  categories?: Category[];
  isSuggesting?: boolean;
  mdxEditorRef: RefObject<MDXEditorMethods>;
};

export const EventFormFields = ({
  categories,
  errors,
  event,
  isSuggesting,
  mdxEditorRef,
}: Props) => {
  const [slugModified, setSlugModified] = useState(false);
  const [dateStartState, setDateStart] = useState(event?.dateStart ?? "");
  const [dateEndState, setDateEnd] = useState(event?.dateEnd ?? "");
  const [timeStartState, setTimeStart] = useState(event?.timeStart ?? "");
  const [timeEndState, setTimeEnd] = useState(event?.timeEnd ?? "");
  const [slug, setSlug] = useState(event?.slug ?? "");
  const [title, setTitle] = useState(event?.title ?? "");
  const isSlugFreelyModifiable =
    !isSuggesting &&
    event?.status !== EventStatus.DRAFT &&
    event?.status !== EventStatus.PUBLISHED;
  const handleSlugFocus = () => {
    if (event?.status !== EventStatus.SUGGESTED || slugModified) {
      return;
    }
    setSlugModified(true);
    setSlug(
      slugify(title, {
        lower: true,
        strict: true,
      }),
    );
  };
  const handleSlugChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSlugModified(true);
    setSlug(
      slugify(e.currentTarget.value, {
        lower: true,
        strict: true,
        trim: false,
      }),
    );
  };
  const handleSlugBlur = () => {
    setSlug((prevSlug) =>
      slugify(prevSlug, {
        lower: true,
        strict: true,
      }),
    );
  };
  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.currentTarget.value);
    if (isSlugFreelyModifiable) {
      handleSlugChange(e);
    }
  };
  const handleTitleBlur = () => {
    setTitle((prevTitle) => prevTitle.trim().replace(/\s+/g, " "));
    handleSlugBlur();
  };
  return (
    <div className="md:items-start gap-4 grid md:grid-cols-2">
      <label className={`grid gap-2 ${isSuggesting ? "md:col-span-2" : ""}`}>
        <span>
          Title <span className="text-amber-600">(required)</span>
        </span>
        <input
          required
          autoComplete="off"
          type="text"
          name="title"
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
          value={title}
          className="border-stone-300 dark:bg-stone-950 shadow-sm hover:shadow-md active:shadow rounded"
        />
        {errors?.fieldErrors.title && (
          <p className="text-red-600">{errors.fieldErrors.title.join(", ")}</p>
        )}
      </label>
      {!isSuggesting && (
        <label className="gap-2 grid">
          <span>
            URL slug{" "}
            <span className="text-amber-600">
              (required) ~{" "}
              {isSlugFreelyModifiable
                ? "should be permament"
                : "change with caution"}
            </span>
          </span>
          <input
            required
            autoComplete="off"
            type="text"
            name="slug"
            onFocus={handleSlugFocus}
            onChange={handleSlugChange}
            onBlur={handleSlugBlur}
            value={slug}
            placeholder="e.g. example-event"
            className={`rounded border-stone-300 placeholder-stone-400 dark:placeholder-stone-500 ${isSlugFreelyModifiable ? (event?.status === EventStatus.SUGGESTED && !slugModified ? "text-stone-400" : undefined) : "text-amber-600"} shadow-sm hover:shadow-md active:shadow dark:bg-stone-950`}
          />
          {errors?.fieldErrors.slug && (
            <p className="text-red-600">{errors.fieldErrors.slug.join(", ")}</p>
          )}
        </label>
      )}
      <label className="gap-2 grid md:col-span-1">
        <span>
          Region <span className="text-amber-600">(required)</span>
        </span>
        <Select
          required
          options={regions}
          emptyOption={event?.region ? undefined : "— select a region —"}
          defaultValue={event?.region || ""}
          name="region"
          className="border-stone-300 dark:bg-stone-950 shadow-sm hover:shadow-md active:shadow custom-caret-color rounded w-full dark:invalid:text-stone-500 invalid:text-stone-400 cursor-pointer"
        />
        {errors?.fieldErrors.region && (
          <p className="text-red-600">{errors.fieldErrors.region.join(", ")}</p>
        )}
      </label>
      <label className="gap-2 grid">
        <span>
          Location <span className="text-amber-600">(required)</span>
        </span>
        <input
          required
          autoComplete="off"
          type="text"
          name="location"
          defaultValue={event?.location}
          placeholder="venue, city, general area, etc."
          className="border-stone-300 dark:bg-stone-950 shadow-sm hover:shadow-md active:shadow rounded placeholder-stone-400 dark:placeholder-stone-500"
        />
        {errors?.fieldErrors.location && (
          <p className="text-red-600">
            {errors.fieldErrors.location.join(", ")}
          </p>
        )}
      </label>
      {categories && categories.length > 0 && (
        <div className="gap-2 grid md:col-span-2">
          Categories
          <div className="flex flex-wrap gap-4 border-stone-300 bg-white dark:bg-stone-950 p-4 border rounded-lg">
            {categories.map((category) => (
              <label
                className="flex items-center gap-2 border-stone-300 dark:bg-stone-950 shadow-sm hover:shadow-md active:shadow px-4 py-2 border rounded cursor-pointer"
                key={category.id}
              >
                <input
                  autoComplete="off"
                  type="checkbox"
                  name="category"
                  value={category.id}
                  defaultChecked={Boolean(
                    event?.categories.find(
                      (eventCategory) => eventCategory.id === category.id,
                    ),
                  )}
                  className="border-stone-300 hover:checked:bg-amber-600 focus:checked:bg-amber-600 dark:bg-stone-950 checked:bg-amber-600 border rounded"
                />
                {category.name}
              </label>
            ))}
          </div>
          {errors?.fieldErrors.categories && (
            <p className="text-red-600">
              {errors.fieldErrors.categories.join(", ")}
            </p>
          )}
        </div>
      )}
      <label className="gap-2 grid md:col-span-1">
        Start date
        <div className="flex">
          <input
            autoComplete="off"
            type="date"
            name="dateStart"
            placeholder="yyyy-mm-dd"
            className={`flex-grow ${dateStartState ? "rounded-l" : "rounded"} border-stone-300 placeholder-stone-400 shadow-sm hover:shadow-md active:shadow dark:bg-stone-950 dark:placeholder-stone-500 dark:[color-scheme:dark]`}
            value={dateStartState}
            onChange={(e) => setDateStart(e.target.value)}
            onBlur={(e) => {
              if (
                dateStartState !== "" &&
                (dateStartState > dateEndState || dateEndState === "")
              ) {
                setDateEnd(e.target.value);
              }
            }}
          />
          {dateStartState && (
            <button
              type="button"
              className="border-stone-300 bg-white dark:bg-stone-950 px-2 border border-l-0 rounded-r"
              onClick={(e) => {
                e.preventDefault();
                setDateStart("");
              }}
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
          )}
        </div>
        {errors?.fieldErrors.dateStart && (
          <p className="text-red-600">
            {errors.fieldErrors.dateStart.join(", ")}
          </p>
        )}
      </label>
      <label className="gap-2 grid md:col-span-1">
        End date
        <div className="flex">
          <input
            autoComplete="off"
            type="date"
            name="dateEnd"
            placeholder="yyyy-mm-dd"
            className={`flex-grow ${dateEndState ? "rounded-l" : "rounded"} border-stone-300 placeholder-stone-400 shadow-sm hover:shadow-md active:shadow dark:bg-stone-950 dark:placeholder-stone-500 dark:[color-scheme:dark]`}
            value={dateEndState}
            onChange={(e) => setDateEnd(e.target.value)}
            onBlur={(e) => {
              if (
                dateEndState !== "" &&
                (dateStartState > dateEndState || dateStartState === "")
              ) {
                setDateStart(e.target.value);
              }
            }}
          />
          {dateEndState && (
            <button
              type="button"
              className="border-stone-300 bg-white dark:bg-stone-950 px-2 border border-l-0 rounded-r"
              onClick={(e) => {
                e.preventDefault();
                setDateEnd("");
              }}
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
          )}
        </div>
        {errors?.fieldErrors.dateEnd && (
          <p className="text-red-600">
            {errors.fieldErrors.dateEnd.join(", ")}
          </p>
        )}
      </label>
      <label className="gap-2 grid">
        Start time
        <div className="flex">
          <input
            autoComplete="off"
            type="time"
            name="timeStart"
            placeholder="hh:mm"
            className={`flex-grow ${timeStartState ? "rounded-l" : "rounded"} border-stone-300 placeholder-stone-400 shadow-sm hover:shadow-md active:shadow dark:bg-stone-950 dark:placeholder-stone-500 dark:[color-scheme:dark]`}
            value={timeStartState}
            onChange={(e) => setTimeStart(e.target.value)}
            onFocus={() => {
              if (timeStartState === "" && timeEndState !== "") {
                setTimeStart(timeEndState);
              }
            }}
            onBlur={(e) => {
              if (
                timeStartState !== "" &&
                timeEndState !== "" &&
                (dateStartState === "" ||
                  dateEndState === "" ||
                  dateStartState === dateEndState) &&
                timeStartState > timeEndState
              ) {
                setTimeEnd(e.target.value);
              }
            }}
          />
          {timeStartState && (
            <button
              type="button"
              className="border-stone-300 bg-white dark:bg-stone-950 px-2 border border-l-0 rounded-r"
              onClick={(e) => {
                e.preventDefault();
                setTimeStart("");
              }}
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
          )}
        </div>
        {errors?.fieldErrors.timeStart && (
          <p className="text-red-600">
            {errors.fieldErrors.timeStart.join(", ")}
          </p>
        )}
      </label>
      <label className="gap-2 grid">
        End time
        <div className="flex">
          <input
            autoComplete="off"
            type="time"
            name="timeEnd"
            placeholder="hh:mm"
            className={`flex-grow ${timeEndState ? "rounded-l" : "rounded"} border-stone-300 placeholder-stone-400 shadow-sm hover:shadow-md active:shadow dark:bg-stone-950 dark:placeholder-stone-500 dark:[color-scheme:dark]`}
            value={timeEndState}
            onChange={(e) => setTimeEnd(e.target.value)}
            onFocus={() => {
              if (timeEndState === "" && timeStartState !== "") {
                setTimeEnd(timeStartState);
              }
            }}
            onBlur={(e) => {
              if (
                timeStartState !== "" &&
                timeEndState !== "" &&
                (dateStartState === "" ||
                  dateEndState === "" ||
                  dateStartState === dateEndState) &&
                timeStartState > timeEndState
              ) {
                setTimeStart(e.target.value);
              }
            }}
          />
          {timeEndState && (
            <button
              type="button"
              className="border-stone-300 bg-white dark:bg-stone-950 px-2 border border-l-0 rounded-r"
              onClick={(e) => {
                e.preventDefault();
                setTimeEnd("");
              }}
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
          )}
        </div>
        {errors?.fieldErrors.timeEnd && (
          <p className="text-red-600">
            {errors.fieldErrors.timeEnd.join(", ")}
          </p>
        )}
      </label>
      <label className="gap-2 grid">
        Website link
        <input
          autoComplete="off"
          type="text"
          name="linkWebsite"
          defaultValue={event?.linkWebsite}
          className="border-stone-300 dark:bg-stone-950 shadow-sm hover:shadow-md active:shadow rounded"
        />
        {errors?.fieldErrors.linkWebsite && (
          <p className="text-red-600">
            {errors.fieldErrors.linkWebsite.join(", ")}
          </p>
        )}
      </label>
      <label className="gap-2 grid">
        Tickets link
        <input
          autoComplete="off"
          type="text"
          name="linkTickets"
          defaultValue={event?.linkTickets}
          className="border-stone-300 dark:bg-stone-950 shadow-sm hover:shadow-md active:shadow rounded"
        />
        {errors?.fieldErrors.linkTickets && (
          <p className="text-red-600">
            {errors.fieldErrors.linkTickets.join(", ")}
          </p>
        )}
      </label>
      <label className="gap-2 grid">
        FB event link
        <input
          autoComplete="off"
          type="text"
          name="linkFbEvent"
          defaultValue={event?.linkFbEvent}
          className="border-stone-300 dark:bg-stone-950 shadow-sm hover:shadow-md active:shadow rounded"
        />
        {errors?.fieldErrors.linkFbEvent && (
          <p className="text-red-600">
            {errors.fieldErrors.linkFbEvent.join(", ")}
          </p>
        )}
      </label>
      <label className="gap-2 grid">
        Location link
        <input
          autoComplete="off"
          type="text"
          name="linkLocation"
          defaultValue={event?.linkLocation}
          className="border-stone-300 dark:bg-stone-950 shadow-sm hover:shadow-md active:shadow rounded"
        />
        {errors?.fieldErrors.linkLocation && (
          <p className="text-red-600">
            {errors.fieldErrors.linkLocation.join(", ")}
          </p>
        )}
      </label>
      <ClientOnly
        fallback={
          <label className="gap-2 grid md:col-span-2">
            <div>
              Description{" "}
              <span className="text-amber-600">~ loading editor&hellip;</span>
            </div>
            <textarea
              name="description"
              readOnly
              defaultValue={event?.description}
              className="border-stone-300 dark:read-only:bg-stone-700 read-only:bg-stone-300 shadow-sm hover:shadow-md active:shadow rounded min-h-20"
            />
            {errors?.fieldErrors.description && (
              <p className="text-red-600">
                {errors.fieldErrors.description.join(", ")}
              </p>
            )}
          </label>
        }
      >
        {() => (
          <div className="gap-2 grid md:col-span-2">
            Description
            <DescriptionEditor
              ref={mdxEditorRef}
              className="border-stone-300 bg-white dark:bg-stone-950 shadow-sm hover:shadow-md active:shadow border rounded overflow-x-auto"
              markdown={event?.description}
            />
            {errors?.fieldErrors.description && (
              <p className="text-red-600">
                {errors.fieldErrors.description.join(", ")}
              </p>
            )}
          </div>
        )}
      </ClientOnly>
    </div>
  );
};
