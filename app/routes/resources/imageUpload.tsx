import type { ActionFunctionArgs } from "react-router";
import { useFetcher } from "react-router";
import { blurhashToCssGradientString } from "@unpic/placeholder";
import { Image } from "@unpic/react";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { dataWithError, dataWithSuccess } from "remix-toast";
import sharp from "sharp";
import { requireUserSession } from "~/services";
import { deleteFileFromB2, uploadFileToB2 } from "~/utils/b2s3Functions.server";
import { generateBlurHash } from "~/utils/imageFunctions.server";

type Props = {
  disabled?: boolean;
  eventId?: string;
  imageBlurHash?: string;
  imageId?: string;
  imageKey?: string;
  onBlurHashChange?: Dispatch<SetStateAction<string>>;
  onFileChange: Dispatch<SetStateAction<boolean>>;
  onIdChange?: Dispatch<SetStateAction<string>>;
  onKeyChange?: Dispatch<SetStateAction<string>>;
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const eventId = formData.get("eventId")?.toString();
  if (eventId) {
    await requireUserSession(request);
  }
  switch (intent) {
    case "upload":
      return handleUpload(formData, eventId);
    case "delete":
      return handleDelete(formData, eventId);
    default:
      return dataWithError(null, "Unknown action", { status: 400 });
  }
}

async function handleUpload(formData: FormData, eventId?: string) {
  const image = formData.get("image") as File | null;
  if (!image || image.size === 0) {
    return dataWithError(null, "No file selected", { status: 400 });
  }
  if (!image.type.startsWith("image/")) {
    return dataWithError(null, "File isn't an image", { status: 400 });
  }
  if (image.size > 10485760) {
    return dataWithError(null, "File size is too large (max. 10 MB)", {
      status: 400,
    });
  }
  const imageBuffer = Buffer.from(await image.arrayBuffer());
  const processedImageBuffer = await sharp(imageBuffer)
    .rotate()
    .resize(1280)
    .toFormat("jpeg", { mozjpeg: true })
    .toBuffer();
  const blurHash = await generateBlurHash(processedImageBuffer);
  const response = await uploadFileToB2(
    processedImageBuffer,
    eventId,
    blurHash,
  );
  if (blurHash && response?.id && response?.key) {
    return dataWithSuccess(
      {
        imageBlurHash: blurHash,
        imageId: response.id,
        imageKey: response.key,
      },
      "Image uploaded successfully!",
      { status: 200 },
    );
  }
  return dataWithError(null, "Upload was unsuccessful", { status: 500 });
}

async function handleDelete(formData: FormData, eventId?: string) {
  const imageId = formData.get("imageId")?.toString();
  const imageKey = formData.get("imageKey")?.toString();
  if (!imageKey) {
    return dataWithError(null, "No key present", { status: 400 });
  }
  await deleteFileFromB2(
    `${eventId ? "events" : "temp"}/${imageKey}`,
    `${imageId}`,
    eventId,
  );
  return dataWithSuccess(
    { imageBlurHash: "", imageId: "", imageKey: "" },
    "Image deleted!",
  );
}

export const ImageUpload = ({
  disabled,
  eventId,
  imageBlurHash,
  imageId,
  imageKey,
  onBlurHashChange,
  onFileChange,
  onIdChange,
  onKeyChange,
}: Props) => {
  type ActionData = {
    imageBlurHash?: string;
    imageId?: string;
    imageKey?: string;
  };
  const fetcher = useFetcher<ActionData>();
  const formRef = useRef<HTMLFormElement>(null);
  const [imageBlurHashState, setImageBlurHashState] = useState(
    imageBlurHash || "",
  );
  const [imageIdState, setImageIdState] = useState(imageId || "");
  const [imageKeyState, setImageKeyState] = useState(imageKey || "");
  useEffect(() => {
    if (fetcher.data) {
      setImageBlurHashState(fetcher.data.imageBlurHash ?? "");
      setImageIdState(fetcher.data.imageId ?? "");
      setImageKeyState(fetcher.data.imageKey ?? "");
      onBlurHashChange?.(fetcher.data.imageBlurHash ?? "");
      onIdChange?.(fetcher.data.imageId ?? "");
      onKeyChange?.(fetcher.data.imageKey ?? "");
      formRef.current?.reset();
      onFileChange(false);
    }
  }, [fetcher.data, onBlurHashChange, onFileChange, onIdChange, onKeyChange]);
  const imageUrl = imageKeyState
    ? `${import.meta.env.VITE_B2_CDN_ALIAS}/${eventId ? "events" : "temp"}/${imageKeyState}`
    : "";
  const imagePlaceholder = imageBlurHashState
    ? blurhashToCssGradientString(imageBlurHashState)
    : undefined;
  const isWorking = disabled || fetcher.state !== "idle";
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    onFileChange((e.target.files && e.target.files.length > 0) || false);
  };
  return (
    <div className="gap-2 grid">
      <span>
        Cover image{" "}
        {!imageKeyState && <span className="text-amber-600">(max. 10 MB)</span>}
      </span>
      <fetcher.Form
        action="/resources/image-upload"
        encType="multipart/form-data"
        method="post"
        ref={formRef}
        className="gap-4 border-emerald-600 grid bg-white dark:bg-stone-950 p-4 border rounded-lg"
        onSubmit={
          imageKeyState
            ? (e) => {
                const response = confirm(
                  "Do you really want to delete the image?",
                );
                if (!response) {
                  e.preventDefault();
                }
              }
            : undefined
        }
      >
        {eventId && <input type="hidden" name="eventId" value={eventId} />}
        <input type="hidden" name="imageBlurHash" value={imageBlurHashState} />
        <input type="hidden" name="imageId" value={imageIdState} />
        <input type="hidden" name="imageKey" value={imageKeyState} />
        <div className="md:flex gap-4 grid">
          {imageKeyState ? (
            <>
              <Image
                src={imageUrl}
                alt=""
                className="border-stone-300 mx-auto border rounded w-full max-w-96 max-h-96"
                layout="fullWidth"
                background={imagePlaceholder}
              />
              <button
                disabled={isWorking}
                type="submit"
                name="intent"
                value="delete"
                className="bg-red-600 disabled:opacity-50 shadow-sm hover:shadow-md active:shadow px-4 py-2 border border-transparent rounded text-white"
              >
                Remove image
              </button>
            </>
          ) : (
            <>
              <input
                required
                onChange={handleFileChange}
                id="fileInput"
                type="file"
                name="image"
                accept="image/*"
                className="sm:flex-1 border-stone-300 file:border-0 dark:bg-stone-950 file:bg-stone-300 shadow-sm hover:shadow-md active:shadow m-0 file:m-0 file:mr-3 file:px-3 p-0 file:p-0 pr-3 border rounded file:rounded-l-sm file:rounded-r-none w-full file:h-[42px] dark:invalid:text-stone-500 file:text-base file:text-stone-950 invalid:text-stone-400 cursor-pointer file:cursor-pointer dark:[color-scheme:dark]"
              />
              <button
                id="imageUploadButton"
                disabled={isWorking}
                type="submit"
                name="intent"
                value="upload"
                className="bg-emerald-600 disabled:opacity-50 shadow-sm hover:shadow-md active:shadow px-4 py-2 border border-transparent rounded text-white"
              >
                Upload image
              </button>
              <button
                disabled={isWorking}
                type="button"
                className="border-emerald-600 dark:border-white bg-transparent disabled:opacity-50 shadow-sm hover:shadow-md active:shadow px-4 py-2 border rounded text-emerald-600 dark:text-white"
                onClick={() => {
                  const el = document.getElementById("fileInput");
                  if (el && el instanceof HTMLInputElement) {
                    el.value = "";
                    onFileChange(false);
                  }
                }}
              >
                Clear
              </button>
            </>
          )}
        </div>
      </fetcher.Form>
    </div>
  );
};
