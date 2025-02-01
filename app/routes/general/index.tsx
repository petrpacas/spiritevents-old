import type { MetaFunction } from "react-router";
import { Link, useLoaderData } from "react-router";
import { Image } from "@unpic/react";
import { EventListCard } from "~/components";
import bgImage from "~/images/bg-people.jpeg";
import { prisma } from "~/services";
import { getTodayDate, EventStatus } from "~/utils";

export const meta: MetaFunction = () => {
  return [
    { title: "SpiritEvents.cz ~ All the magic, all in one place" },
    {
      name: "description",
      content:
        "Reunite with your tribe and discover events in Czechia focused on healing and truly being",
    },
  ];
};

export async function loader() {
  const events = await prisma.event.findMany({
    orderBy: [{ dateStart: "asc" }, { timeStart: "asc" }, { title: "asc" }],
    select: {
      dateEnd: true,
      dateStart: true,
      id: true,
      imageBlurHash: true,
      imageKey: true,
      location: true,
      slug: true,
      timeEnd: true,
      timeStart: true,
      title: true,
      categories: { orderBy: { name: "asc" } },
    },
    take: 3,
    where: {
      dateEnd: { gte: getTodayDate() },
      status: EventStatus.PUBLISHED,
    },
  });
  return { events };
}

export default function Landing() {
  const { events } = useLoaderData<typeof loader>();
  const imagePlaceholder =
    "radial-gradient(at 0 0,#52341a,#00000000 50%),radial-gradient(at 33% 0,#503e19,#00000000 50%),radial-gradient(at 67% 0,#4f3c1f,#00000000 50%),radial-gradient(at 100% 0,#4b311a,#00000000 50%),radial-gradient(at 0 50%,#55412f,#00000000 50%),radial-gradient(at 33% 50%,#5e4f3b,#00000000 50%),radial-gradient(at 67% 50%,#5b4b35,#00000000 50%),radial-gradient(at 100% 50%,#543d2b,#00000000 50%),radial-gradient(at 0 100%,#604939,#00000000 50%),radial-gradient(at 33% 100%,#635544,#00000000 50%),radial-gradient(at 67% 100%,#60513f,#00000000 50%),radial-gradient(at 100% 100%,#594534,#00000000 50%)";
  return (
    <>
      <div className="relative grid">
        <Image
          src={bgImage}
          alt=""
          className="top-0 left-0 absolute w-full h-full object-cover"
          layout="fullWidth"
          background={imagePlaceholder}
        />
        <div className="relative justify-center items-center grid bg-emerald-50/75 dark:bg-emerald-950/75">
          <h2 className="px-4 sm:px-8 py-16 max-w-7xl font-bold text-[1.875rem] text-center md:text-5xl min-[375px]:text-[2rem] min-[414px]:text-4xl leading-relaxed md:leading-relaxed min-[375px]:leading-relaxed min-[414px]:leading-relaxed">
            Reunite with your{" "}
            <strong className="text-emerald-600">tribe</strong>{" "}
            <br className="max-lg:hidden" /> and discover{" "}
            <strong className="text-emerald-600">events in Czechia</strong>{" "}
            <br className="max-lg:hidden" /> focused on{" "}
            <strong className="text-emerald-600">healing</strong> and truly{" "}
            <strong className="text-emerald-600">being</strong>
          </h2>
        </div>
      </div>
      {events.length > 0 && (
        <div className="bg-transparent">
          <div className="gap-8 grid mx-auto px-4 sm:px-8 py-8 sm:py-16 w-full max-w-7xl">
            <h2 className="text-2xl sm:text-3xl leading-snug">
              ✨ Discover <strong>soulful events</strong> taking place in{" "}
              <strong>Czech Republic</strong>
            </h2>
            <div className="gap-4 grid">
              {events.map((event) => (
                <EventListCard
                  isLanding
                  key={event.id}
                  categories={event.categories}
                  location={event.location}
                  dateStart={event.dateStart}
                  dateEnd={event.dateEnd}
                  id={event.id}
                  imageBlurHash={event.imageBlurHash}
                  imageKey={event.imageKey}
                  slug={event.slug}
                  timeStart={event.timeStart}
                  timeEnd={event.timeEnd}
                  title={event.title}
                />
              ))}
            </div>
            <div className="sm:max-xl:flex sm:max-xl:justify-between items-center gap-8 xl:gap-16 grid xl:grid-cols-3">
              <p className="xl:col-span-2 text-lg md:text-xl">
                and many more&hellip;
              </p>
              <Link
                to="/events"
                className="flex justify-center sm:max-xl:justify-self-end items-center gap-3 sm:max-xl:col-start-3 bg-emerald-600 shadow-sm hover:shadow-md active:shadow px-4 sm:px-8 py-2 sm:py-4 border border-transparent rounded-lg text-lg text-white lg:self-center"
              >
                Discover events in Czechia
                <svg
                  className="max-[339px]:hidden w-6 h-6"
                  width="16px"
                  height="16px"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}
      <div className="grid">
        <div className="bg-emerald-100 dark:bg-emerald-900">
          <div className="gap-8 sm:gap-16 grid xl:grid-cols-2 mx-auto px-4 sm:px-8 py-8 sm:py-16 w-full max-w-7xl">
            <div className="gap-8 grid text-center">
              <div className="text-4xl">🧿</div>
              <h2 className="text-3xl sm:text-4xl leading-snug sm:leading-snug">
                All the <strong>magic</strong>,
                <br className="min-[490px]:hidden" /> all in{" "}
                <strong>one place</strong>
              </h2>
              <div className="gap-4 grid text-lg sm:text-xl italic leading-snug sm:leading-snug">
                <p>
                  The community, <br className="min-[490px]:hidden" />
                  the connections, <br className="min-[490px]:hidden" />
                  the people.
                </p>
                <p>
                  The arts, <br className="min-[490px]:hidden" />
                  the movement, <br className="min-[490px]:hidden" />
                  the experiences.
                </p>
                <p>
                  The wisdom, <br className="min-[490px]:hidden" />
                  the insights, <br className="min-[490px]:hidden" />
                  the growth.
                </p>
              </div>
              <div className="border-emerald-600 border-y -mx-4 sm:-mx-8 xl:-mx-0 px-4 sm:px-8 xl:px-0 py-4 sm:py-8 text-lg sm:text-xl italic leading-snug sm:leading-snug self-end">
                The ancient. <br className="min-[490px]:hidden" />
                The indigenous. <br className="min-[490px]:hidden" />
                The modern.
              </div>
            </div>
            <div className="gap-4 sm:gap-8 grid text-lg sm:text-xl">
              <p>
                We each have our own reasons why we love attending such events.
                We all come from different places, literally and figuratively.
                In these gatherings though we quickly realize that indeed{" "}
                <strong>we are all related</strong>.
              </p>
              <p>
                If you were to <em>search for your next opportunity</em> to{" "}
                <strong>gather with your tribe again</strong>, where would you
                look? The informations are scattered and hard to come by without
                having the right connections in real life or on social media.
              </p>
              <p>
                It&apos;s not easy to <strong>stay informed</strong> about{" "}
                what&apos;s happening where and when.
              </p>
              <p>
                <span className="font-bold">
                  <span className="text-emerald-600">Spirit</span>Events
                </span>{" "}
                aims to change it.
              </p>
            </div>
          </div>
        </div>
        <div className="bg-transparent">
          <div className="max-xl:gap-8 xl:gap-16 grid xl:grid-cols-3 mx-auto px-4 sm:px-8 py-8 sm:py-16 w-full max-w-7xl">
            <div className="gap-8 grid xl:col-span-2">
              <h3 className="text-2xl sm:text-3xl leading-snug sm:leading-snug">
                🌀 Let&apos;s make this place a true portal{" "}
                <strong>together</strong>
              </h3>
              <div className="gap-4 grid text-lg sm:text-xl">
                <p>
                  Do you know of any relevant event that deserves to be found by
                  like-minded people?
                </p>
                <p>
                  Suggesting it will not only support the event, but also all
                  the other event seekers.
                </p>
              </div>
            </div>
            <Link
              to="/events/suggest"
              className="flex justify-center sm:max-xl:justify-self-end items-center gap-3 border-emerald-600 dark:border-white bg-white shadow-sm hover:shadow-md active:shadow px-4 sm:px-8 py-2 sm:py-4 border rounded-lg text-emerald-600 text-lg xl:self-center"
            >
              Suggest a new event
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
                  d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                />
              </svg>
            </Link>
          </div>
        </div>
        <div className="bg-sky-100 dark:bg-sky-900">
          <div className="max-xl:gap-8 xl:gap-16 grid xl:grid-cols-3 mx-auto px-4 sm:px-8 py-8 sm:py-16 w-full max-w-7xl">
            <div className="gap-8 grid xl:col-span-2">
              <h3 className="text-2xl sm:text-3xl leading-snug sm:leading-snug">
                💫 Like what you see? Become a <strong>supporter</strong>
              </h3>
              <div className="gap-4 grid text-lg sm:text-xl">
                <p>
                  Does the idea of this portal resonate with you? Or does it
                  bring you value already? If so, consider supporting its
                  creation.
                </p>
                <p>
                  Developing the app and filling in the data is a very
                  time-consuming endeavour, and your contribution would be
                  immensely appreciated!
                </p>
              </div>
            </div>
            <Link
              to="/how-to-support"
              className="flex justify-center sm:max-xl:justify-self-end items-center gap-3 bg-sky-600 shadow-sm hover:shadow-md active:shadow px-4 sm:px-8 py-2 sm:py-4 border border-transparent rounded-lg text-lg text-white xl:self-center"
            >
              Support the project
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
                  d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
