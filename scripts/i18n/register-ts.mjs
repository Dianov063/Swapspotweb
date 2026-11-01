// Lets Node load the site's TypeScript modules (lib/**) the way the Next.js bundler does:
// extensionless relative imports (`./locales` -> `./locales.ts`), the `@/` path alias and JSON
// imports without import attributes. Type annotations are removed by Node's type stripping.
//
//   node --import ./scripts/i18n/register-ts.mjs some-script.mjs
import { existsSync, readFileSync, statSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = new URL("../../", import.meta.url);

function isFile(path) {
  return existsSync(path) && statSync(path).isFile();
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    let target = null;
    if (specifier.startsWith("@/")) target = new URL(specifier.slice(2), root);
    else if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL?.startsWith("file:")) {
      target = new URL(specifier, context.parentURL);
    }
    if (target) {
      const path = fileURLToPath(target);
      if (!isFile(path)) {
        const candidate = [`${path}.ts`, `${path}/index.ts`].find(isFile);
        if (candidate) return nextResolve(pathToFileURL(candidate).href, context);
      }
      return nextResolve(target.href, context);
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.startsWith("file:") && url.endsWith(".json")) {
      return { format: "module", source: `export default ${readFileSync(fileURLToPath(url), "utf8")};`, shortCircuit: true };
    }
    return nextLoad(url, context);
  },
});
