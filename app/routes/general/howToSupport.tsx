import type { MetaFunction } from "react-router";
import { useNavigate } from "react-router";
import qrImage from "~/images/qr.png";

export const meta: MetaFunction = () => {
  return [{ title: "Support the project ~ SpiritEvents.cz" }];
};

export default function HowToSupport() {
  const navigate = useNavigate();
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
        <h2 className="font-bold text-2xl sm:text-3xl leading-snug sm:leading-snug">
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
        <div className="gap-4 grid text-center text-lg sm:text-xl">
          <div className="sm:flex justify-center gap-2 grid">
            <span>Bank account number (CZ):</span>
            <span className="font-bold">210866806/0300</span>
          </div>
          <div className="sm:flex justify-center gap-2 grid">
            <span>IBAN:</span>
            <span className="font-bold">CZ34 0300 0000 0002 1086 6806</span>
          </div>
          <div className="sm:flex justify-center gap-2 grid">
            <span>BIC (SWIFT):</span>
            <span className="font-bold">CEKOCZPP</span>
          </div>
        </div>
        <p className="text-center text-lg sm:text-xl">Thank you 🙏</p>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="border-emerald-600 dark:border-white disabled:opacity-50 shadow-sm hover:shadow-md active:shadow px-4 py-2 border rounded text-emerald-600 dark:text-white"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
