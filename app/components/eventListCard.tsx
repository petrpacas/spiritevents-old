import { Category } from "@prisma/client";
import { Link } from "react-router";
import { blurhashToCssGradientString } from "@unpic/placeholder";
import { Image } from "@unpic/react";
import React from "react";
import { EventStatus, getStatusColors } from "~/utils";

type Props = {
  categories: Category[];
  dateEnd: string;
  dateStart: string;
  id: string;
  imageBlurHash?: string;
  imageKey?: string;
  isLanding?: boolean;
  location: string;
  slug: string;
  status?: keyof typeof EventStatus;
  timeStart?: string;
  timeEnd?: string;
  title: string;
};

export const EventListCard = ({
  categories,
  dateEnd,
  dateStart,
  id,
  imageBlurHash,
  imageKey,
  isLanding,
  location,
  slug,
  status,
  timeStart,
  timeEnd,
  title,
}: Props) => {
  const [statusLetter, statusBg] = getStatusColors(status);
  const headingContent = (
    <>
      {statusLetter && (
        <>
          <span className="text-amber-600">{statusLetter}</span>{" "}
        </>
      )}
      {title}
    </>
  );
  const imagePlaceholder = imageBlurHash
    ? blurhashToCssGradientString(imageBlurHash)
    : undefined;
  return (
    <Link
      to={`/events/${id}-${slug}`}
      className={`${statusBg} ${imageKey ? "sm:relative sm:flex" : ""} group grid rounded-lg border border-emerald-600 shadow-sm hover:shadow-md active:shadow`}
    >
      {imageKey && (
        <div className="top-0 bottom-0 left-0 sm:absolute opacity-75 group-hover:opacity-100 group-focus:opacity-100 sm:w-[25%] lg:w-[20%] max-sm:h-32">
          <Image
            src={`${import.meta.env.VITE_B2_CDN_ALIAS}/events/${imageKey}`}
            alt=""
            className="max-sm:rounded-t-[0.4375rem] sm:rounded-l-[0.4375rem] w-full h-full object-cover"
            layout="fullWidth"
            background={imagePlaceholder}
          />
        </div>
      )}
      <div
        className={`${imageKey ? "flex-grow sm:ml-[25%] lg:ml-[20%]" : ""} grid gap-2 p-2 sm:p-4`}
      >
        {isLanding ? (
          <h3 className="font-medium text-xl sm:text-2xl leading-snug sm:leading-snug">
            {headingContent}
          </h3>
        ) : (
          <h4 className="font-medium text-xl sm:text-2xl leading-snug sm:leading-snug">
            {headingContent}
          </h4>
        )}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-x-2 sm:text-lg leading-snug sm:leading-snug">
            {categories.map((category, idx) => (
              <React.Fragment key={category.id}>
                {idx !== 0 && <span className="opacity-50">&amp;</span>}
                <span className="text-emerald-600">{category.name}</span>
              </React.Fragment>
            ))}
          </div>
        )}
        <div className="lg:flex lg:justify-between lg:items-end gap-2 lg:gap-4 grid sm:text-lg leading-snug sm:leading-snug">
          <div className="min-[400px]:flex min-[400px]:gap-2 grid">
            {dateStart ? (
              <>
                <div className="flex items-start gap-2">
                  <svg
                    className="w-5 sm:w-6 h-5 sm:h-6 text-amber-600"
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
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
                    />
                  </svg>
                  <span>{new Date(dateStart).toDateString()}</span>
                </div>
                {dateEnd && dateEnd !== dateStart ? (
                  <div className="flex items-start gap-2">
                    <svg
                      className="opacity-50 w-5 sm:w-6 h-5 sm:h-6 rotate-90"
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
                        d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                      />
                    </svg>
                    <span>{new Date(dateEnd).toDateString()}</span>
                  </div>
                ) : (
                  timeStart && (
                    <div className="flex items-start gap-2">
                      <svg
                        className="w-5 sm:w-6 h-5 sm:h-6 text-amber-600"
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
                          d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                      <span>{timeStart}</span>
                      {timeEnd && (
                        <>
                          <svg
                            className="opacity-50 w-5 sm:w-6 h-5 sm:h-6 rotate-90"
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
                              d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                            />
                          </svg>
                          <span>{timeEnd}</span>
                        </>
                      )}
                    </div>
                  )
                )}
              </>
            ) : (
              <span className="text-red-600">Missing date info</span>
            )}
          </div>
          {location && <div className="text-amber-600">{location}</div>}
        </div>
      </div>
    </Link>
  );
};
