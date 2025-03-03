import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import { ApifyClient } from "apify-client";
import { Form, useActionData, useNavigate, useNavigation } from "react-router";
import { dataWithError, redirectWithSuccess } from "remix-toast";
import slugify from "slugify";
import { z } from "zod";
import { authenticate, prisma, requireUserSession } from "~/services";
import { EventStatus } from "~/utils";
import { uploadFileToB2, moveFileInB2 } from "~/utils/b2s3Functions.server";
import { generateBlurHash } from "~/utils/imageFunctions.server";

export const meta: MetaFunction = () => {
  return [{ title: "Scrape a Facebook Event ~ SpiritEvents.cz" }];
};

// Extend slugify to handle special characters consistently
slugify.extend({
  "&": "",
  "|": "",
  "<": "",
  ">": "",
});

// Define types for the Facebook event data from pratikdani/facebook-event-scraper
interface FacebookEventData {
  event_id?: string;
  url?: string;
  title?: string;
  description?: {
    text?: string;
    hashtags?: {
      url?: string;
      value?: string;
    }[];
    links?: string[];
  };
  event_date?: string;
  duration?: {
    time?: number;
    time_units?: string;
  };
  main_image?: string;
  main_image_downloadable?: string;
  location?: {
    address?: string;
    url?: string | null;
  };
  event_by?: {
    name?: string;
    url?: string;
  }[];
  hosts?: {
    name?: string;
    url?: string;
    verified?: boolean;
  }[];
  people_responded?: number;
  tickets?: {
    currency?: string | null;
    max_price?: number | null;
    min_price?: number | null;
    provider?: string | null;
    url?: string | null;
  };
  suggested_events?: {
    date?: string;
    location?: string;
    name?: string;
    people_interested?: string;
    url?: string;
  }[];
  [key: string]: any;
}

const scrapeFormSchema = z.object({
  facebookEventUrl: z.string().url("Please provide a valid Facebook event URL"),
});

type ActionData = {
  error?: {
    message: string;
  };
  fields?: {
    facebookEventUrl?: string;
  };
};

export async function loader({ request }: LoaderFunctionArgs) {
  return await authenticate(request);
}

export async function action({ request }: ActionFunctionArgs) {
  await requireUserSession(request);

  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  const result = scrapeFormSchema.safeParse(data);
  if (!result.success) {
    return dataWithError(
      {
        fields: { facebookEventUrl: data.facebookEventUrl as string },
        error: { message: result.error.errors[0].message },
      },
      "Please fix the errors",
    );
  }

  try {
    const { facebookEventUrl } = result.data;

    // Initialize the Apify client
    const apifyClient = new ApifyClient({
      token: process.env.APIFY_API_TOKEN,
    });

    // Start the Facebook event scraper
    const input = {
      url: facebookEventUrl,
    };

    // Run the actor and wait for it to finish
    const run = await apifyClient
      .actor("pratikdani/facebook-event-scraper")
      .call(input);

    // Fetch results from the dataset
    const { items } = await apifyClient
      .dataset(run.defaultDatasetId)
      .listItems();

    if (!items || items.length === 0) {
      return dataWithError(
        {
          fields: { facebookEventUrl },
          error: {
            message: "No event data found. Please check the URL and try again.",
          },
        },
        "Scraping failed",
      );
    }

    console.log(
      "Facebook event data structure:",
      JSON.stringify(items[0], null, 2),
    );

    const eventData = items[0] as FacebookEventData;

    // Download the event image
    let imageBlurHash = "";
    let imageUploadResult = null;

    if (eventData.main_image_downloadable) {
      try {
        const imageResponse = await fetch(eventData.main_image_downloadable);
        const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

        // Generate blur hash for the image
        imageBlurHash = await generateBlurHash(imageBuffer);

        // Upload the image to Backblaze
        imageUploadResult = await uploadFileToB2(
          imageBuffer,
          undefined,
          imageBlurHash,
        );
      } catch (error) {
        console.error("Error downloading or processing image:", error);
      }
    }

    // Extract date and time information
    let dateStart = "";
    let dateEnd = "";
    let timeStart = "";
    let timeEnd = "";

    try {
      if (eventData.event_date) {
        // Parse the event date, which should be ISO formatted
        const eventDate = new Date(eventData.event_date);

        // Set the start date (YYYY-MM-DD)
        dateStart = eventDate.toISOString().split("T")[0];

        // Set start time (HH:MM)
        timeStart = eventDate.toISOString().split("T")[1].substring(0, 5);

        // If duration is available, calculate end date/time
        if (eventData.duration?.time && eventData.duration?.time_units) {
          let durationInMinutes = 0;

          // Convert duration to minutes
          if (eventData.duration.time_units === "min") {
            durationInMinutes = eventData.duration.time;
          } else if (eventData.duration.time_units === "hr") {
            durationInMinutes = eventData.duration.time * 60;
          }

          // Calculate end date/time
          const endDate = new Date(
            eventDate.getTime() + durationInMinutes * 60000,
          );
          dateEnd = endDate.toISOString().split("T")[0];
          timeEnd = endDate.toISOString().split("T")[1].substring(0, 5);
        } else {
          // If no duration, set end date/time same as start
          dateEnd = dateStart;
          timeEnd = timeStart;
        }
      }
    } catch (error) {
      console.error("Error parsing event date:", error);
      console.log("Event date string:", eventData.event_date);
    }

    // Generate a slug from the event title
    const slug = slugify(eventData.title || "facebook-event", {
      lower: true,
      strict: true,
    });

    // Create Google Maps link from location info
    let googleMapsLink = "";
    if (eventData.location?.address) {
      // Create a Google Maps search link using the address
      const searchQuery = encodeURIComponent(eventData.location.address);
      googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
    }

    // Determine region based on location data
    let eventRegion = "PHA"; // Default to Prague if no other information is available

    // Check if event is outside Czech Republic
    const isOutsideCzechRepublic = () => {
      // Check country information from various sources
      const countryFromPlace = eventData.location?.address
        ?.split(", ")
        ?.pop()
        ?.toLowerCase();

      // If country is explicitly specified and is not Czech Republic, mark as international
      if (
        countryFromPlace &&
        countryFromPlace !== "czech republic" &&
        countryFromPlace !== "česká republika" &&
        countryFromPlace !== "česko" &&
        countryFromPlace !== "czechia" &&
        countryFromPlace !== "cz" &&
        countryFromPlace !== "čr"
      ) {
        console.log(
          "Event detected as outside Czech Republic based on place country:",
          countryFromPlace,
        );
        return true;
      }

      return false;
    };

    if (isOutsideCzechRepublic()) {
      // Set region to "Mimo ČR" (outside Czech Republic)
      eventRegion = "***";
      console.log("Setting region to: Mimo ČR (international event)");
    } else {
      // Try to determine Czech region based on city
      const cityFromPlace = eventData.location?.address
        ?.split(", ")
        ?.pop()
        ?.toLowerCase();
      const city = cityFromPlace;

      // Map of major Czech cities to their regions
      const cityToRegionMap: Record<string, string> = {
        // Prague
        praha: "PHA",
        prague: "PHA",
        prag: "PHA",
        // South Moravian Region
        brno: "JHM",
        znojmo: "JHM",
        hodonín: "JHM",
        hodonin: "JHM",
        břeclav: "JHM",
        breclav: "JHM",
        // Moravian-Silesian Region
        ostrava: "MSK",
        opava: "MSK",
        havířov: "MSK",
        havirov: "MSK",
        karviná: "MSK",
        karvina: "MSK",
        // Olomouc Region
        olomouc: "OLK",
        prostějov: "OLK",
        prostejov: "OLK",
        přerov: "OLK",
        prerov: "OLK",
        // Zlín Region
        zlín: "ZLK",
        zlin: "ZLK",
        "uherské hradiště": "ZLK",
        "uherske hradiste": "ZLK",
        kroměříž: "ZLK",
        kromeriz: "ZLK",
        // South Bohemian Region
        "české budějovice": "JHC",
        "ceske budejovice": "JHC",
        tábor: "JHC",
        tabor: "JHC",
        písek: "JHC",
        pisek: "JHC",
        // Plzeň Region
        plzeň: "PLK",
        plzen: "PLK",
        klatovy: "PLK",
        tachov: "PLK",
        // Karlovy Vary Region
        "karlovy vary": "KVK",
        cheb: "KVK",
        sokolov: "KVK",
        // Ústí nad Labem Region
        "ústí nad labem": "ULK",
        "usti nad labem": "ULK",
        most: "ULK",
        teplice: "ULK",
        litoměřice: "ULK",
        litomerice: "ULK",
        // Liberec Region
        liberec: "LBK",
        "jablonec nad nisou": "LBK",
        "česká lípa": "LBK",
        "ceska lipa": "LBK",
        // Hradec Králové Region
        "hradec králové": "HKK",
        "hradec kralove": "HKK",
        trutnov: "HKK",
        jičín: "HKK",
        jicin: "HKK",
        // Pardubice Region
        pardubice: "PAK",
        chrudim: "PAK",
        svitavy: "PAK",
        // Vysočina Region
        jihlava: "VYS",
        "havlíčkův brod": "VYS",
        "havlickuv brod": "VYS",
        "žďár nad sázavou": "VYS",
        "zdar nad sazavou": "VYS",
        // Central Bohemian Region
        kladno: "STC",
        "mladá boleslav": "STC",
        "mlada boleslav": "STC",
        příbram: "STC",
        pribram: "STC",
        kolín: "STC",
        kolin: "STC",
      };

      if (city && cityToRegionMap[city]) {
        eventRegion = cityToRegionMap[city];
        console.log(`Setting region to: ${eventRegion} based on city: ${city}`);
      } else if (city) {
        // If the city isn't in our map, try to look it up online
        try {
          // Attempt to look up the region online
          const regionCode = await lookupCityRegionOnline(city);
          if (regionCode) {
            eventRegion = regionCode;
            console.log(
              `Setting region to: ${eventRegion} based on online lookup for city: ${city}`,
            );
          } else {
            // If we can't determine the region, keep Prague as default
            console.log(
              `Could not determine region from online lookup. Using default: PHA (Prague) for city: ${city}`,
            );
          }
        } catch (error) {
          console.error("Error looking up region online:", error);
          console.log(
            `Using default region: PHA (Prague) due to lookup error for city: ${city}`,
          );
        }
      } else {
        // If we can't determine the region, keep Prague as default
        console.log(
          `No city information available. Using default: PHA (Prague)`,
        );
      }
    }

    /**
     * Looks up a city name online to find its Czech region
     * Uses OpenStreetMap's Nominatim API which is free for light usage
     */
    async function lookupCityRegionOnline(
      cityName: string,
    ): Promise<string | null> {
      try {
        console.log(`Looking up region for city: ${cityName}`);

        // Format the query to focus on Czech Republic
        const query = encodeURIComponent(`${cityName}, Czech Republic`);

        // Use OpenStreetMap's Nominatim API to geocode the city
        const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&limit=1&countrycodes=cz`;

        // Add a small delay to respect rate limits (1 request per second is recommended)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Make the API call
        const response = await fetch(url, {
          headers: {
            // Adding a User-Agent is required by Nominatim's usage policy
            "User-Agent": "SpiritEvents/1.0 (spiritevents.cz)",
          },
        });

        if (!response.ok) {
          throw new Error(`Nominatim API returned ${response.status}`);
        }

        const data = await response.json();

        if (data && data.length > 0 && data[0].address) {
          const address = data[0].address;

          // Map from OSM admin levels/state to our region codes
          // The API might return different admin level keys
          const stateToRegionMap: Record<string, string> = {
            // Czech names
            "Hlavní město Praha": "PHA",
            Praha: "PHA",
            "Jihočeský kraj": "JHC",
            "Jihomoravský kraj": "JHM",
            "Karlovarský kraj": "KVK",
            "Kraj Vysočina": "VYS",
            Vysočina: "VYS",
            "Královéhradecký kraj": "HKK",
            "Liberecký kraj": "LBK",
            "Moravskoslezský kraj": "MSK",
            "Olomoucký kraj": "OLK",
            "Pardubický kraj": "PAK",
            "Plzeňský kraj": "PLK",
            "Středočeský kraj": "STC",
            "Ústecký kraj": "ULK",
            "Zlínský kraj": "ZLK",

            // English names if API returns them
            Prague: "PHA",
            "South Bohemian Region": "JHC",
            "South Moravian Region": "JHM",
            "Karlovy Vary Region": "KVK",
            "Vysočina Region": "VYS",
            "Hradec Králové Region": "HKK",
            "Liberec Region": "LBK",
            "Moravian-Silesian Region": "MSK",
            "Olomouc Region": "OLK",
            "Pardubice Region": "PAK",
            "Plzeň Region": "PLK",
            "Central Bohemian Region": "STC",
            "Ústí nad Labem Region": "ULK",
            "Zlín Region": "ZLK",
          };

          // Try to find the region from different possible address fields
          let state = address.state || address.county || address.region;

          if (state && stateToRegionMap[state]) {
            console.log(
              `Found region from online lookup: ${state} -> ${stateToRegionMap[state]}`,
            );
            return stateToRegionMap[state];
          }

          // Check if it's in Praha/Prague
          if (
            address.city === "Praha" ||
            address.city === "Prague" ||
            address.suburb?.includes("Praha") ||
            address.district?.includes("Praha")
          ) {
            console.log(`Detected as Prague from address details`);
            return "PHA";
          }

          console.log("Address details from API:", address);
        }

        console.log("No region information found from online lookup");
        return null;
      } catch (error) {
        console.error("Error in online region lookup:", error);
        return null;
      }
    }

    // Create the event in the database
    const event = await prisma.event.create({
      data: {
        title: eventData.title || "Unknown Event",
        description: eventData.description?.text,
        location: eventData.location?.address || "",
        region: eventRegion,
        dateStart,
        dateEnd,
        timeStart,
        timeEnd,
        slug,
        linkFbEvent: facebookEventUrl,
        linkLocation: googleMapsLink,
        linkWebsite: eventData.tickets?.url || "",
        status: EventStatus.DRAFT,
        imageBlurHash: imageBlurHash || "",
        imageId: imageUploadResult?.id || "",
        imageKey: imageUploadResult?.key || "",
      },
    });

    // Move image from temp folder to events folder if an image was uploaded
    if (imageUploadResult?.key && imageUploadResult?.id) {
      await moveFileInB2(imageUploadResult.key, imageUploadResult.id);
    }

    return redirectWithSuccess(
      `/events/${event.id}-${event.slug}`,
      "Event scraped successfully!",
    );
  } catch (error: any) {
    console.error("Error scraping event:", error);
    return dataWithError(
      {
        fields: { facebookEventUrl: result.data.facebookEventUrl },
        error: { message: error.message || "An unexpected error occurred" },
      },
      "Scraping failed",
    );
  }
}

export default function ScrapeFacebookEvent() {
  const actionData = useActionData<ActionData>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

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
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
            />
          </svg>
          <span>Scrape a Facebook Event</span>
        </h1>

        <div className="gap-4 grid">
          <Form method="post" className="space-y-6">
            <label htmlFor="facebookEventUrl" className="gap-2 grid">
              <span>
                Facebook Event URL{" "}
                <span className="text-amber-600">(required)</span>
              </span>
              <input
                required
                id="facebookEventUrl"
                name="facebookEventUrl"
                type="url"
                defaultValue={actionData?.fields?.facebookEventUrl || ""}
                className="dark:bg-stone-950 shadow-sm hover:shadow-md active:shadow px-3 py-2 border-stone-300 rounded w-full placeholder-stone-400 dark:placeholder-stone-500"
                placeholder="https://www.facebook.com/events/123456789/"
              />
              {actionData?.error?.message && (
                <p id="url-error" className="text-red-600">
                  {actionData.error.message}
                </p>
              )}
              <p className="text-stone-600 dark:text-stone-400">
                This tool will scrape event information from a Facebook event
                page and create a draft event in your database. After scraping,
                you can edit the event details before publishing.
              </p>
            </label>

            <div className="text-stone-600 dark:text-stone-400">
              <p className="font-medium">The system will extract:</p>
              <ul className="mt-1 pl-5 list-disc">
                <li>Event details (title, description, date/time)</li>
                <li>Location and regional information</li>
                <li>Event image (if available)</li>
              </ul>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 shadow-sm hover:shadow-md active:shadow px-4 py-2 border border-transparent rounded text-white"
              >
                {isSubmitting ? "Scraping..." : "Scrape Event"}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="disabled:opacity-50 shadow-sm hover:shadow-md active:shadow px-4 py-2 border border-amber-600 dark:border-white rounded text-amber-600 dark:text-white"
              >
                Back
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
