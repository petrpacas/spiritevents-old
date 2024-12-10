import type { MetaFunction } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import qrImage from "~/images/qr.png";

export const meta: MetaFunction = () => {
  return [{ title: "Support the project ~ SpiritEvents.cz" }];
};

export default function HowToSupport() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto grid w-full max-w-7xl px-4 pb-16 pt-8 sm:px-8">
      <div className="grid gap-8">
        <h1 className="flex items-center gap-2 text-3xl font-bold leading-snug sm:text-4xl sm:leading-snug">
          <svg
            className="h-8 w-8 shrink-0 text-amber-600 max-xl:hidden sm:h-10 sm:w-10"
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
          <span>Support the project</span>
        </h1>
        <p className="text-lg sm:text-xl">
          Does the idea of this portal resonate with you? Or does it bring you
          value already? If so, consider supporting its creation.
        </p>
        <p className="text-lg sm:text-xl">
          Developing the app and filling in the data is a very time-consuming
          endeavour, and your contribution would be immensely appreciated!
        </p>
        <h2 className="text-2xl font-bold leading-snug sm:text-3xl sm:leading-snug">
          How to support?
        </h2>
        <p className="text-lg sm:text-xl">
          The biggest help would be{" "}
          <span className="font-bold text-amber-600">to spread the word</span>{" "}
          to your fellow event-goers and the event organizers themselves.
        </p>
        <p className="text-lg sm:text-xl">
          But, if you feel called to contribute even more, a{" "}
          <span className="font-bold text-amber-600">monetary donation</span>{" "}
          would go a long way 💛
        </p>
        <div>
          <img className="mx-auto" src={qrImage} alt="QR code for donations" />
        </div>
        <div className="grid gap-4 text-center text-lg sm:text-xl">
          <div className="grid justify-center gap-2 sm:flex">
            <span>Bank account number (CZ):</span>
            <span className="font-bold">210866806/0300</span>
          </div>
          <div className="grid justify-center gap-2 sm:flex">
            <span>IBAN:</span>
            <span className="font-bold">CZ34 0300 0000 0002 1086 6806</span>
          </div>
          <div className="grid justify-center gap-2 sm:flex">
            <span>BIC (SWIFT):</span>
            <span className="font-bold">CEKOCZPP</span>
          </div>
        </div>
        <p className="text-center text-lg sm:text-xl">Thank you 🙏</p>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded border border-emerald-600 px-4 py-2 text-emerald-600 shadow-sm hover:shadow-md active:shadow disabled:opacity-50 dark:border-white dark:text-white"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
