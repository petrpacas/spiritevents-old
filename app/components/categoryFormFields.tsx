import type { Category } from "@prisma/client";
import { ChangeEvent, useState } from "react";
import slugify from "slugify";
import { z } from "zod";
import { categoryFormSchema } from "~/validations";

slugify.extend({
  "&": "",
  "|": "",
  "<": "",
  ">": "",
});

type Props = {
  errors?: z.inferFlattenedErrors<typeof categoryFormSchema>;
  category?: Category;
};

export const CategoryFormFields = ({ errors, category }: Props) => {
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const handleSlugChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSlug(
      slugify(e.currentTarget.value, {
        lower: true,
        strict: true,
        trim: false,
      }),
    );
  };
  const handleSlugBlur = () => {
    setSlug((value) =>
      slugify(value, {
        lower: true,
        strict: true,
      }),
    );
  };
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.currentTarget.value);
    handleSlugChange(e);
  };
  const handleNameBlur = () => {
    setName((value) => value.trim().replace(/\s+/g, " "));
    handleSlugBlur();
  };
  return (
    <div className="md:items-start gap-4 grid md:grid-cols-2">
      <label className={`grid gap-2`}>
        <div>
          Name <span className="text-amber-600">(required)</span>
        </div>
        <input
          required
          autoComplete="off"
          type="text"
          name="name"
          onChange={handleNameChange}
          onBlur={handleNameBlur}
          value={name}
          className="border-stone-300 dark:bg-stone-950 shadow-sm hover:shadow-md active:shadow rounded"
        />
        {errors?.fieldErrors.name && (
          <p className="text-red-600">{errors.fieldErrors.name.join(", ")}</p>
        )}
      </label>
      <label className="gap-2 grid">
        <div>
          URL slug <span className="text-amber-600">(required)</span>
        </div>
        <input
          required
          autoComplete="off"
          type="text"
          name="slug"
          onChange={handleSlugChange}
          onBlur={handleSlugBlur}
          value={slug}
          placeholder="e.g. example-category"
          className="border-stone-300 dark:bg-stone-950 shadow-sm hover:shadow-md active:shadow rounded text-amber-600 placeholder-stone-400 dark:placeholder-stone-500"
        />
        {errors?.fieldErrors.slug && (
          <p className="text-red-600">{errors.fieldErrors.slug.join(", ")}</p>
        )}
      </label>
    </div>
  );
};
