import { dictionaries, locales } from "../lib/i18n";

const intentionallySharedPaths = new Set(["waitlist.placeholder"]);

function findEnglishFallbacks(
  source: unknown,
  localized: unknown,
  path = "",
): string[] {
  if (typeof source === "string") {
    return source === localized && !intentionallySharedPaths.has(path) ? [path] : [];
  }

  if (Array.isArray(source)) {
    return source.flatMap((value, index) =>
      findEnglishFallbacks(
        value,
        Array.isArray(localized) ? localized[index] : undefined,
        `${path}[${index}]`,
      ),
    );
  }

  if (source && typeof source === "object") {
    return Object.entries(source).flatMap(([key, value]) =>
      findEnglishFallbacks(
        value,
        localized && typeof localized === "object"
          ? (localized as Record<string, unknown>)[key]
          : undefined,
        path ? `${path}.${key}` : key,
      ),
    );
  }

  return [];
}

let failed = false;
for (const locale of locales) {
  if (locale === "en") continue;
  const fallbacks = findEnglishFallbacks(dictionaries.en, dictionaries[locale]);
  console.log(`${locale}: ${fallbacks.length} English fallbacks`);
  if (fallbacks.length > 0) {
    failed = true;
    fallbacks.forEach((path) => console.log(`  - ${path}`));
  }
}

if (failed) process.exitCode = 1;
