import HomePage from "@/components/HomePage";
import { dictionaries, defaultLocale } from "@/lib/i18n";

export default function Page() {
  return <HomePage locale={defaultLocale} dictionary={dictionaries[defaultLocale]} />;
}
