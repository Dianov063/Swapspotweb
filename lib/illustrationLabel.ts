// Marketing mockups are examples, never live ratings, prices or earnings.
const labels: Record<string, string> = {
  en: 'Illustrative example', es: 'Ejemplo ilustrativo', fr: 'Exemple illustratif',
  de: 'Beispielansicht', it: 'Esempio illustrativo', nl: 'Voorbeeldweergave',
  pl: 'Widok demonstracyjny', pt: 'Exemplo ilustrativo', ru: 'Демонстрационный пример',
  cs: 'Ukázkový náhled', sk: 'Ukážkový náhľad',
  hu: 'Szemléltető példa', ro: 'Exemplu ilustrativ', bg: 'Илюстративен пример',
  el: 'Ενδεικτικό παράδειγμα', hr: 'Ogledni primjer', sl: 'Ponazoritveni primer',
  da: 'Illustrativt eksempel', sv: 'Illustrativt exempel', fi: 'Havainnollistava esimerkki',
  et: 'Näidisvaade', lv: 'Ilustratīvs piemērs', lt: 'Iliustracinis pavyzdys',
  nb: 'Illustrerende eksempel', is: 'Dæmi til skýringar', sq: 'Shembull ilustrues',
  bs: 'Ilustrativni primjer', 'sr-latn': 'Ilustrativni primer', 'sr-Latn': 'Ilustrativni primer',
  mk: 'Илустративен пример', uk: 'Ілюстративний приклад', tr: 'Örnek görünüm',
  ka: 'საილუსტრაციო მაგალითი', hy: 'Ցուցադրական օրինակ', az: 'Nümunə görünüş', ca: 'Exemple il·lustratiu',
  zh: '演示示例', ar: 'مثال توضيحي', ht: 'Egzanp demonstrasyon', fil: 'Halimbawang demonstrasyon',
  hi: 'उदाहरण दृश्य', bn: 'উদাহরণ দৃশ্য', te: 'నమూనా దృశ్యం', ta: 'விளக்க உதாரணம்',
  vi: 'Ví dụ minh họa', th: 'ตัวอย่างประกอบ',
};
export function illustrationLabel(locale: string) {
  return labels[locale] ?? labels[locale.split('-')[0]] ?? 'Demo · SwapSpot';
}
