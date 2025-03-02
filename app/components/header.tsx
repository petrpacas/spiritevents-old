import { Link, useNavigation } from "react-router";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ClientOnly } from "remix-utils/client-only";

type Props = {
  isAuthenticated: boolean;
  isLanding?: boolean;
};

export const Header = ({ isAuthenticated, isLanding }: Props) => {
  const navigation = useNavigation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isMenuOpen]);
  useEffect(() => {
    if (navigation.state === "idle") {
      setIsMenuOpen(false);
    }
  }, [navigation]);
  const brandName = (
    <div className="z-10 relative max-[319px]:grid font-bold max-[319px]:text-[1.3125rem] min-[320px]:text-[1.75rem] min-[374px]:text-[2.1815rem] min-[428px]:text-[2.625rem] leading-none">
      <span className="text-emerald-600">Spirit</span>
      <span>Events</span>
    </div>
  );
  return (
    <>
      <header className="bg-white dark:bg-stone-950">
        <div className="relative flex justify-between items-center mx-auto p-4 sm:px-8 w-full max-w-7xl">
          <Link to="/">{isLanding ? <h1>{brandName}</h1> : brandName}</Link>
          <button
            type="button"
            onClick={() => setIsMenuOpen((value) => !value)}
            className={`${isMenuOpen ? "rounded-b-none border-emerald-600 bg-white text-emerald-600 dark:bg-stone-950" : "border-transparent bg-emerald-600 text-white shadow-sm hover:shadow-md active:shadow"} relative z-40 flex items-center rounded border px-4 py-2 md:hidden`}
          >
            <span className="sr-only">Menu</span>
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
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
            <div
              className={`${isMenuOpen ? "" : "hidden"} absolute -bottom-[2px] left-0 right-0 h-[2px] bg-white dark:bg-stone-950`}
            />
          </button>
          <nav
            className={`${isMenuOpen ? "max-md:grid" : "max-md:hidden"} items-center max-md:absolute max-md:top-[3.625rem] max-md:z-30 max-md:gap-2 max-md:rounded-md max-md:rounded-tr-none max-md:border max-md:border-emerald-600 max-md:bg-white max-md:p-4 max-sm:right-4 sm:max-md:right-8 md:relative md:z-10 md:flex md:gap-4 dark:max-md:bg-stone-950`}
          >
            <Link
              to="/events"
              className="flex max-md:justify-center items-center gap-2 bg-emerald-600 shadow-sm hover:shadow-md active:shadow px-4 py-2 border border-emerald-600 rounded text-white"
            >
              <span>
                Discover
                <span className="md:max-lg:sr-only"> events</span>
              </span>
              <svg
                className="w-6 h-6"
                width="16px"
                height="16px"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
              </svg>
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/events/new"
                  className="flex max-md:justify-center items-center gap-2 bg-white shadow-sm hover:shadow-md active:shadow px-4 py-2 border border-emerald-600 dark:border-white rounded text-emerald-600"
                >
                  <span>
                    New
                    <span className="md:max-lg:sr-only"> event</span>
                  </span>
                  <svg
                    className="w-5 h-5"
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
                </Link>
                <Link
                  to="/events/scrape"
                  className="flex max-md:justify-center items-center gap-2 bg-white shadow-sm hover:shadow-md active:shadow px-4 py-2 border border-amber-600 dark:border-white rounded text-amber-600"
                >
                  <span>
                    Scrape
                    <span className="md:max-lg:sr-only"> event</span>
                  </span>
                  <svg
                    className="w-5 h-5"
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
                      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                    />
                  </svg>
                </Link>
                <Link
                  to="/categories"
                  className="flex max-md:justify-center items-center gap-2 bg-sky-600 shadow-sm hover:shadow-md active:shadow px-4 py-2 border border-sky-600 rounded text-white"
                >
                  <span>Categories</span>
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
                      d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 6h.008v.008H6V6Z"
                    />
                  </svg>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/events/suggest"
                  className="flex max-md:justify-center items-center gap-2 bg-white shadow-sm hover:shadow-md active:shadow px-4 py-2 border border-emerald-600 dark:border-white rounded text-emerald-600"
                >
                  <span>
                    Suggest
                    <span className="md:max-lg:sr-only"> event</span>
                  </span>
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
                      d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                    />
                  </svg>
                </Link>
                <Link
                  to="/how-to-support"
                  className="flex max-md:justify-center items-center gap-2 bg-sky-600 shadow-sm hover:shadow-md active:shadow px-4 py-2 border border-sky-600 rounded text-white"
                >
                  <span>
                    Support
                    <span className="md:max-lg:sr-only"> project</span>
                  </span>
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
                      d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
                    />
                  </svg>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <ClientOnly>
        {() =>
          createPortal(
            <button
              type="button"
              className={`${isMenuOpen ? "absolute" : "hidden"} bottom-0 left-0 right-0 top-0 z-20 bg-black/50 md:hidden dark:bg-white/50`}
              onClick={() => setIsMenuOpen(false)}
            />,
            document.body,
          )
        }
      </ClientOnly>
    </>
  );
};
