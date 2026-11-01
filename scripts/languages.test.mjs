// Language registry, gating of routes/hreflang, parent fallback, direction and the translation
// checks (docs/swapspot-africa.md §3-5). Run with `npm run test:languages`.
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  canonicalTag,
  fallbackChain,
  loadLanguages,
  matchLanguage,
  parseLanguagesPayload,
  siteLanguages,
  urlSegment,
} from "../lib/languagesCore.ts";
import { hreflangAlternates, languageTag, localeNames, locales, textDirection } from "../lib/locales.ts";
import { checkLocalePack, isBrandOnly, scriptMatches } from "./i18n/locale-checks.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const snapshot = JSON.parse(readFileSync(join(root, "lib/languagesSnapshot.json"), "utf8"));
const webSource = JSON.parse(readFileSync(join(root, "i18n-source/web.json"), "utf8"));
const registry = parseLanguagesPayload(snapshot).languages;

/** Registry copy with some languages changed: { code: { public, status } }. */
function withChanges(changes) {
  return registry.map((language) => (changes[language.code] ? { ...language, ...changes[language.code] } : language));
}

function site(languages, bundled = []) {
  return siteLanguages({ registry: languages, shipped: locales, shippedNames: localeNames, isBundled: (code) => bundled.includes(code) });
}

// ---------------------------------------------------------------- registry

test("the bundled snapshot: 46 languages, only the 16 shipped ones public", () => {
  assert.equal(snapshot.format, 1);
  assert.equal(registry.length, 46);
  const publicCodes = registry.filter((language) => language.public).map((language) => language.code).sort();
  assert.deepEqual(publicCodes, locales.map((locale) => (locale === "zh" ? "zh-Hans" : locale)).sort());
  for (const code of ["ar-EG", "pt-AO", "sw-KE"]) assert.ok(registry.find((language) => language.code === code).parent, code);
  assert.equal(registry.find((language) => language.code === "ary").parent, "ar");
  assert.equal(registry.find((language) => language.code === "zgh").script, "Tfng");
});

test("parsing ignores unknown fields and invalid entries; format and en are required", () => {
  const parsed = parseLanguagesPayload({
    format: 1,
    extra: true,
    languages: [
      { code: "en", english_name: "English", native_name: "English", status: "production", public: true, new_field: 1 },
      { code: "sw", status: "machine", public: true, script: "Latn" },
      { code: "ar-EG", status: "draft", public: false, script: "Arab", parent: "ar" },
      { code: "SW", status: "machine" },
      { code: "xx", status: "unknown" },
      { code: "ha" },
      "garbage",
    ],
  });
  assert.deepEqual(parsed.languages.map((language) => language.code), ["en", "sw", "ar-EG"]);
  assert.equal(parsed.languages[2].dir, "rtl", "dir derived from the Arabic script when absent");
  assert.equal(parsed.languages[1].nativeName, "sw");
  assert.equal("new_field" in parsed.languages[0], false);
  assert.equal(parseLanguagesPayload({ format: 2, languages: snapshot.languages }), null);
  assert.equal(parseLanguagesPayload({ format: 1, languages: [{ code: "sw", status: "machine" }] }), null);
  assert.equal(parseLanguagesPayload(null), null);
});

const response = (body, ok = true) => async () => ({ ok, json: async () => body });

test("registry response wins; every failure falls back to the bundled snapshot", async () => {
  const remote = { format: 1, languages: [...snapshot.languages.slice(0, 16), { ...snapshot.languages[16], public: true, status: "machine" }] };
  const ok = await loadLanguages({ url: "https://platform.test/languages", snapshot, fetchImpl: response(remote) });
  assert.equal(ok.source, "registry");
  assert.equal(ok.languages.length, 17);

  const errors = [];
  for (const [name, options] of [
    ["not configured", { url: null, fetchImpl: response(remote) }],
    ["HTTP error", { url: "u", fetchImpl: response(remote, false) }],
    ["network error", { url: "u", fetchImpl: async () => { throw new Error("ECONNREFUSED"); } }],
    ["higher format", { url: "u", fetchImpl: response({ format: 2, languages: [] }) }],
    ["bad body", { url: "u", fetchImpl: async () => ({ ok: true, json: async () => { throw new SyntaxError("bad"); } }) }],
  ]) {
    const result = await loadLanguages({ snapshot, onError: (reason) => errors.push(reason), ...options });
    assert.equal(result.source, "snapshot", name);
    assert.equal(result.languages.length, 46, name);
  }
  assert.equal(errors.length, 4);

  let seen;
  await loadLanguages({
    url: "https://platform.test/v1/apps/swapspot/swapspot/languages",
    snapshot,
    init: { next: { revalidate: 3600 } },
    fetchImpl: async (url, init) => {
      seen = { url, init };
      return { ok: true, json: async () => snapshot };
    },
  });
  assert.deepEqual(seen.init.next, { revalidate: 3600 });
  assert.ok(seen.init.signal instanceof AbortSignal);
});

// ---------------------------------------------------------------- routes and hreflang

test("today: exactly the 16 shipped languages have routes, even with every pack bundled", () => {
  const all = registry.map((language) => language.code);
  const languages = site(registry, all);
  assert.deepEqual(languages.map((language) => language.segment), [...locales]);
  const alternates = hreflangAlternates("/services", "en", languages);
  assert.equal(Object.keys(alternates.languages).length, 17);
  assert.equal(alternates.languages["zh-Hans"], "/zh/services");
  for (const hidden of ["sw", "am", "ar-EG", "zgh"]) assert.equal(alternates.languages[hidden], undefined, hidden);
});

test("a registry language needs public + machine/reviewed + a bundled pack", () => {
  const cases = [
    [{ sw: { public: true, status: "machine" } }, ["sw"], true],
    [{ sw: { public: true, status: "reviewed" } }, ["sw"], true],
    [{ sw: { public: true, status: "draft" } }, ["sw"], false],
    [{ sw: { public: false, status: "machine" } }, ["sw"], false],
    [{ sw: { public: true, status: "machine" } }, [], false],
  ];
  for (const [changes, bundled, expected] of cases) {
    const segments = site(withChanges(changes), bundled).map((language) => language.segment);
    assert.equal(segments.includes("sw"), expected, JSON.stringify({ changes, bundled }));
    assert.equal(segments.length, expected ? 17 : 16);
  }
});

test("URL segments are lower-case BCP 47; hreflang uses the registry code; regional parents must be ready", () => {
  const changes = {
    "sw-KE": { public: true, status: "machine" },
    "ar-EG": { public: true, status: "reviewed" },
    "pt-AO": { public: true, status: "machine" },
    ary: { public: true, status: "machine" },
    zgh: { public: true, status: "machine" },
    sw: { public: false, status: "machine" },
  };
  const bundled = ["sw", "sw-KE", "ar-EG", "pt-AO", "ary", "zgh"];
  const languages = site(withChanges(changes), bundled);
  const extra = languages.filter((language) => !language.shipped);
  assert.deepEqual(extra.map((language) => language.segment).sort(), ["ar-eg", "ary", "pt-ao", "sw-ke", "zgh"]);
  const byCode = Object.fromEntries(extra.map((language) => [language.code, language]));
  assert.deepEqual(byCode["sw-KE"].chain, ["sw-KE", "sw"]);
  assert.deepEqual(byCode["ar-EG"].chain, ["ar-EG", "ar"]);
  assert.deepEqual(byCode["pt-AO"].chain, ["pt-AO", "pt"]);
  assert.deepEqual(byCode.ary.chain, ["ary", "ar"]);

  const alternates = hreflangAlternates("/", "sw-ke", languages);
  assert.equal(alternates.canonical, "/sw-ke");
  assert.equal(alternates.languages["sw-KE"], "/sw-ke");
  assert.equal(alternates.languages["ar-EG"], "/ar-eg");
  assert.equal(alternates.languages.zgh, "/zgh");
  assert.equal(alternates.languages.sw, undefined, "a non-public parent gets no hreflang");

  // The parent of a public regional variant must be bundled and complete.
  const draftParent = site(withChanges({ ...changes, sw: { public: false, status: "draft" } }), bundled);
  assert.equal(draftParent.some((language) => language.code === "sw-KE"), false);
  const missingParent = site(withChanges(changes), bundled.filter((code) => code !== "sw"));
  assert.equal(missingParent.some((language) => language.code === "sw-KE"), false);
});

test("fallback chain: exact -> parent -> (en implied)", () => {
  assert.deepEqual(fallbackChain("sw-KE", registry), ["sw-KE", "sw"]);
  assert.deepEqual(fallbackChain("ary", registry), ["ary", "ar"]);
  assert.deepEqual(fallbackChain("am", registry), ["am"]);
  assert.deepEqual(fallbackChain("en", registry), []);
  const cyclic = [
    { code: "en", parent: null },
    { code: "aa", parent: "bb" },
    { code: "bb", parent: "aa" },
  ];
  assert.deepEqual(fallbackChain("aa", cyclic), ["aa", "bb"]);
});

test("direction and tags: rtl for ar, ar-EG and ary from the registry; BCP 47 casing", () => {
  const languages = site(withChanges({ ary: { public: true, status: "machine" }, "ar-EG": { public: true, status: "machine" } }), ["ary", "ar-EG"]);
  for (const segment of ["ar", "ar-eg", "ary"]) assert.equal(textDirection(segment, languages), "rtl", segment);
  for (const segment of ["en", "sw-ke", "zgh", "am"]) assert.equal(textDirection(segment, languages), "ltr", segment);
  assert.equal(textDirection("ary"), "rtl", "without a list: derived from the language");
  assert.equal(languageTag("zh"), "zh-Hans");
  assert.equal(languageTag("ar-eg"), "ar-EG");
  assert.equal(languageTag("pt-ao"), "pt-AO");
  assert.equal(canonicalTag("zh-hans"), "zh-Hans");
  assert.equal(urlSegment("zh-Hans"), "zh");
  assert.equal(urlSegment("sw-KE"), "sw-ke");
});

test("browser language: exact, then language part; ar-MA never becomes ary", () => {
  const segments = [...locales, "sw", "sw-ke", "ary"];
  assert.equal(matchLanguage(["ar-MA"], segments), "ar");
  assert.equal(matchLanguage(["ary"], segments), "ary");
  assert.equal(matchLanguage(["sw-KE"], segments), "sw-ke");
  assert.equal(matchLanguage(["sw-TZ"], segments), "sw");
  assert.equal(matchLanguage(["sw-TZ"], [...locales]), null);
  assert.equal(matchLanguage(["zh-TW", "en"], segments), "zh");
  assert.equal(matchLanguage(["tl-PH"], segments), "fil");
  assert.equal(matchLanguage(["xx", "de-AT"], segments), "de");
});

test("reset page language: registry languages only when the page received them", async () => {
  const { resetLocale } = await import("../lib/resetStrings.ts");
  assert.equal(resetLocale("?lang=sw-KE", []), "en");
  assert.equal(resetLocale("?lang=sw-KE", [], ["sw", "sw-ke"]), "sw-ke");
  assert.equal(resetLocale("?lang=sw-TZ", [], ["sw"]), "sw");
  assert.equal(resetLocale("", ["ar-MA"], ["ary"]), "ar");
  assert.equal(resetLocale("?lang=zh-Hans", []), "zh");
});

// ---------------------------------------------------------------- strings: parent merge

test("registry language strings: exact -> parent -> English, regional packs only override", async () => {
  const { resolveExtraTables, shippedFlatStrings, englishSource } = await import("../lib/stringTables.ts");
  const { registerExtraLocale } = await import("../lib/extraLocales.ts");
  const { getDictionary, textDirection: dir, languageTag: tag } = await import("../lib/i18n.ts");
  const { directoryStrings } = await import("../lib/directoryStrings/index.ts");
  const { priceWords, intlLocales } = await import("../lib/priceFormat.ts");
  const { pricingCopy } = await import("../lib/pricingCopy.ts");
  const { categoryName } = await import("../lib/categoryNames.ts");
  const { staticPagesCopy } = await import("../lib/copy/staticPages.ts");

  // ar-EG: one override, everything else from the shipped Arabic tables.
  const arEG = resolveExtraTables([{ "site.nav.how": "إزاي بيشتغل" }, shippedFlatStrings("ar")], {
    code: "ar-EG", tag: "ar-EG", dir: "rtl", script: "Arab", intl: ["ar-EG", "ar", "en"],
  });
  registerExtraLocale("ar-eg", arEG);
  const ar = getDictionary("ar");
  assert.equal(getDictionary("ar-eg").nav.how, "إزاي بيشتغل");
  assert.equal(getDictionary("ar-eg").nav.clients, ar.nav.clients);
  assert.deepEqual(getDictionary("ar-eg").steps, ar.steps);
  assert.equal(directoryStrings("ar-eg").pairTitle, directoryStrings("ar").pairTitle);
  assert.equal(categoryName("cleaning", "ar-eg"), categoryName("cleaning", "ar"));
  assert.equal(dir("ar-eg"), "rtl");
  assert.equal(tag("ar-eg"), "ar-EG");
  assert.deepEqual(intlLocales("ar-eg"), ["ar-EG", "ar", "en"]);

  // sw-KE over sw: missing in both -> English, never the key.
  const sw = { "site.nav.how": "Jinsi inavyofanya kazi", "priceWords.from": "Kuanzia {price}", "categories.cleaning": "Usafi", "site.waitlist.placeholder": "x" };
  const swKE = resolveExtraTables([{ "site.nav.how": "Inavyofanya kazi" }, sw], {
    code: "sw-KE", tag: "sw-KE", dir: "ltr", script: "Latn", intl: ["sw-KE", "sw", "en"],
  });
  registerExtraLocale("sw-ke", swKE);
  assert.equal(getDictionary("sw-ke").nav.how, "Inavyofanya kazi");
  assert.equal(priceWords("sw-ke").from, "Kuanzia {price}");
  assert.equal(categoryName("cleaning", "sw-ke"), "Usafi");
  assert.equal(getDictionary("sw-ke").nav.clients, getDictionary("en").nav.clients);
  assert.equal(getDictionary("sw-ke").waitlist.placeholder, "you@email.com", "untranslated keys stay English");
  assert.equal(pricingCopy("sw-ke").plans.length, 2);
  assert.equal(staticPagesCopy("sw-ke").titles.privacy, "Privacy Policy");

  // Every English source key resolves to a string in the rebuilt tables.
  const keys = englishSource().map((item) => item.key);
  assert.ok(keys.length > 300);
  assert.equal(new Set(keys).size, keys.length, "keys are unique");
  // Unregistered locales fall back to English.
  assert.equal(getDictionary("zz").nav.how, getDictionary("en").nav.how);
});

test("the source pack i18n-source/web.json is up to date", () => {
  const result = spawnSync(
    process.execPath,
    ["--import", "./scripts/i18n/register-ts.mjs", "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", "scripts/i18n/export-source.mjs", "--check"],
    { cwd: root, encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.ok(webSource.strings.every((item) => item.key && item.text && item.context && Array.isArray(item.placeholders) && item.hash));
  assert.deepEqual(webSource.untranslated, ["site.waitlist.placeholder"]);
});

// ---------------------------------------------------------------- checker

const source = {
  strings: [
    { key: "site.nav.how", text: "How it works", placeholders: [], max_length: 24, hash: "h1" },
    { key: "directory.pairTitle", text: "{category} helpers in {market}", placeholders: ["{category}", "{market}"], max_length: 60, hash: "h2" },
    { key: "pricing.plans.1.name", text: "Client Pro", placeholders: [], max_length: 20, hash: "h3" },
  ],
  untranslated: ["site.waitlist.placeholder"],
};
const lang = (code, script, parent = null) => ({ code, script, parent });
const check = (code, pack, language) => checkLocalePack({ code, text: typeof pack === "string" ? pack : JSON.stringify(pack), source, language });

test("checker: a complete, correct pack passes", () => {
  const result = check("sw", { "site.nav.how": "Jinsi inavyofanya kazi", "directory.pairTitle": "Wasaidizi wa {categoryLower} huko {market}", "pricing.plans.1.name": "Client Pro" }, lang("sw", "Latn"));
  assert.deepEqual(result.errors, []);
});

test("checker catches missing, unknown, empty, placeholder, English-copy and JSON errors", () => {
  const sw = lang("sw", "Latn");
  const errors = (pack, language = sw, code = "sw") => check(code, pack, language).errors.join("\n");
  assert.match(errors({ "site.nav.how": "Jinsi" }), /missing directory\.pairTitle/);
  assert.match(errors({ "site.nav.how": "Jinsi", "directory.pairTitle": "{category} {market}", "pricing.plans.1.name": "Client Pro", "site.nav.typo": "x" }), /unknown key site\.nav\.typo/);
  assert.match(errors({ "site.nav.how": " ", "directory.pairTitle": "{category} {market}", "pricing.plans.1.name": "Client Pro" }), /site\.nav\.how is empty/);
  assert.match(errors({ "site.nav.how": "Jinsi", "directory.pairTitle": "Wasaidizi wa {category}", "pricing.plans.1.name": "Client Pro" }), /directory\.pairTitle placeholders/);
  assert.match(errors({ "site.nav.how": "How it works", "directory.pairTitle": "{category} {market}", "pricing.plans.1.name": "Client Pro" }), /site\.nav\.how is a copy of the English text/);
  assert.match(errors({ "site.nav.how": { nested: "x" } }), /must be a string/);
  assert.match(errors({ "site.waitlist.placeholder": "x" }), /not translated/);
  assert.match(errors("{ not json"), /invalid JSON/);
  assert.match(errors("[]"), /flat JSON object/);
  assert.match(errors({}, null, "xx"), /not in the language registry/);
});

test("checker: script sanity for Ethiopic, Tifinagh, Arabic and Latin", () => {
  const pack = (how) => ({ "site.nav.how": how, "directory.pairTitle": "{category} — {market}", "pricing.plans.1.name": "Client Pro" });
  assert.deepEqual(check("am", pack("እንዴት እንደሚሰራ"), lang("am", "Ethi")).errors, []);
  assert.match(check("am", pack("Indet yiseral"), lang("am", "Ethi")).errors.join(), /not written in the Ethi script/);
  assert.deepEqual(check("zgh", pack("ⵎⴰⵎⴽ ⵉⵙⵡⵓⵔⵉ"), lang("zgh", "Tfng")).errors, []);
  assert.match(check("zgh", pack("Mamek iswuri"), lang("zgh", "Tfng")).errors.join(), /Tfng script/);
  assert.match(check("sw", pack("كيف يعمل"), lang("sw", "Latn")).errors.join(), /Latn script/);
  assert.equal(scriptMatches("SwapSpot · App Store", "Ethi"), true, "brand names alone are not checked");
  assert.equal(isBrandOnly("Client Pro"), true);
  assert.equal(isBrandOnly("Get Client Pro"), false);
});

test("checker: regional variants contain only overrides", () => {
  assert.deepEqual(check("ar-EG", { "site.nav.how": "إزاي بيشتغل" }, lang("ar-EG", "Arab", "ar")).errors, []);
  assert.match(check("ar-EG", { "site.nav.how": "How it works" }, lang("ar-EG", "Arab", "ar")).errors.join(), /copy of the English/);
  assert.deepEqual(check("ary", { "site.nav.how": "كيفاش خدام" }, lang("ary", "Arab", "ar")).errors.length > 0, true, "ary is a full language");
});

test("check-locales CLI: exit 1 on errors, 0 on a valid pack, case-sensitive file names", () => {
  const dir = mkdtempSync(join(tmpdir(), "swapspot-locales-"));
  try {
    const locales = join(dir, "locales");
    mkdirSync(locales);
    writeFileSync(join(dir, "web.json"), JSON.stringify(source));
    writeFileSync(join(dir, "registry.json"), JSON.stringify({ format: 1, languages: [lang("sw", "Latn"), lang("am", "Ethi"), lang("en", "Latn")] }));
    writeFileSync(join(locales, "sw.json"), JSON.stringify({ "site.nav.how": "Jinsi", "directory.pairTitle": "{category} {market}", "pricing.plans.1.name": "Client Pro" }));
    writeFileSync(join(locales, "am.json"), JSON.stringify({ "site.nav.how": "How it works" }));
    const run = (...codes) =>
      spawnSync(process.execPath, ["scripts/i18n/check-locales.mjs", "--source", join(dir, "web.json"), "--registry", join(dir, "registry.json"), "--dir", locales, ...codes], { cwd: root, encoding: "utf8" });
    assert.equal(run("sw").status, 0);
    const bad = run("am");
    assert.equal(bad.status, 1);
    assert.match(bad.stderr, /copy of the English text/);
    assert.match(bad.stderr, /missing directory\.pairTitle/);
    assert.equal(run().status, 1, "without codes every pack is checked");
    assert.match(run("SW").stderr, /does not exist/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------- snapshot generator

test("the languages snapshot generator converts the registry and --check detects drift", () => {
  const dir = mkdtempSync(join(tmpdir(), "swapspot-languages-"));
  try {
    const input = {
      format: 1,
      statuses: {},
      languages: [
        { code: "en", english_name: "English", native_name: "English", script: "Latn", dir: "ltr", parent: null, wave: 0, status: "production", public: true, notes: null },
        { code: "sw-KE", english_name: "Swahili (Kenya)", native_name: "Kiswahili (Kenya)", script: "Latn", dir: "ltr", parent: "en", wave: 1, status: "draft", public: false, notes: "x" },
      ],
    };
    writeFileSync(join(dir, "languages.json"), JSON.stringify(input));
    const out = join(dir, "out.json");
    const script = join(root, "scripts/sync-languages-snapshot.mjs");
    execFileSync(process.execPath, [script, join(dir, "languages.json"), out]);
    const generated = JSON.parse(readFileSync(out, "utf8"));
    assert.equal(generated.format, 1);
    assert.equal("notes" in generated.languages[1], false);
    assert.equal(parseLanguagesPayload(generated).languages.length, 2);
    assert.equal(spawnSync(process.execPath, [script, join(dir, "languages.json"), out, "--check"]).status, 0);
    input.languages[1].public = true;
    writeFileSync(join(dir, "languages.json"), JSON.stringify(input));
    assert.equal(spawnSync(process.execPath, [script, join(dir, "languages.json"), out, "--check"]).status, 1);
    input.languages[1].dir = "sideways";
    writeFileSync(join(dir, "languages.json"), JSON.stringify(input));
    assert.notEqual(spawnSync(process.execPath, [script, join(dir, "languages.json"), out]).status, 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// Set SWAPSPOT_LANGUAGES_REGISTRY=<path to services/api/platform_app/swapspot_languages.json> to check
// that lib/languagesSnapshot.json matches the server registry.
test("lib/languagesSnapshot.json matches the server registry (when SWAPSPOT_LANGUAGES_REGISTRY is set)", (t) => {
  const registryPath = process.env.SWAPSPOT_LANGUAGES_REGISTRY;
  if (!registryPath) return t.skip("SWAPSPOT_LANGUAGES_REGISTRY not set");
  const result = spawnSync(process.execPath, [join(root, "scripts/sync-languages-snapshot.mjs"), registryPath, "--check"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
});
