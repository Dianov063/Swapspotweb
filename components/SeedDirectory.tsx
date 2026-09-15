'use client';

import { useEffect, useState } from 'react';

type SeedService = { service_key: string; category_id: string; category_name: string; name: string; description: string; price: number | null; price_max?: number | null; price_type: string; price_unit: string; currency_code?: string; source_url?: string; source_title?: string; source_region?: string; price_note?: string; researched_at?: string; is_active: boolean };
type SeedProfile = { seed_key: string; country_code: string; currency_code: string; language_code: string; full_name: string; city: string; bio: string; avatar_url: string | null; avatar_rect: [number, number, number, number] | null; is_active: boolean; source_kind: string; services: SeedService[] };
type Directory = { profiles: SeedProfile[]; total: number; countries: { country_code: string; profiles: number; with_photo: number; active_profiles: number; services: number }[]; categories: { id: string; name: string }[]; page: number; pageSize: number };
const countries: Record<string, string> = { DO: 'Доминикана', TH: 'Таиланд', US: 'США', PR: 'Пуэрто-Рико' };
const fieldClass = 'h-11 rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus:border-green';

function price(service: SeedService, currency: string) {
  if (service.price_type === 'quote_only' || service.price == null) return 'По запросу';
  const amount = new Intl.NumberFormat('ru', { style: 'currency', currency: service.currency_code || currency, maximumFractionDigits: 2 }).format(service.price);
  if (service.price_max != null) return `${amount} – ${new Intl.NumberFormat('ru', { style: 'currency', currency: service.currency_code || currency, maximumFractionDigits: 2 }).format(service.price_max)}`;
  return `${service.price_type === 'starting_at' ? 'от ' : ''}${amount}${service.price_type === 'hourly' ? ' / ч' : ''}`;
}

function Avatar({ profile }: { profile: SeedProfile }) {
  const rect = profile.avatar_rect;
  if (profile.avatar_url) return <span role="img" aria-label={`Портрет: ${profile.full_name}${profile.source_kind === 'regional' ? ' (сгенерирован)' : ''}`} className="block h-14 w-14 shrink-0 rounded-2xl bg-sand" style={{
    backgroundImage: `url("${profile.avatar_url}")`,
    backgroundSize: rect ? `${100 / rect[2]}% ${100 / rect[3]}%` : 'cover',
    backgroundPosition: rect ? `${rect[0] / (1 - rect[2]) * 100}% ${rect[1] / (1 - rect[3]) * 100}%` : 'center',
    backgroundRepeat: 'no-repeat',
  }} />;
  return <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-soft text-lg font-bold text-green" aria-label="Без фото">{profile.full_name.split(' ').slice(0, 2).map(n => n[0]).join('')}</span>;
}

export default function SeedDirectory() {
  const [country, setCountry] = useState('DO');
  const [category, setCategory] = useState('');
  const [photo, setPhoto] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [data, setData] = useState<Directory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { const timer = setTimeout(() => { setQuery(search); setPage(1); }, 300); return () => clearTimeout(timer); }, [search]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    const params = new URLSearchParams({ country, category, photo, search: query, page: String(page) });
    void fetch(`/api/admin/seeds?${params}`, { cache: 'no-store', signal: controller.signal })
      .then(async response => { const payload = await response.json(); if (!response.ok) throw new Error(response.status === 401 ? 'Сессия истекла. Войдите в админку заново.' : payload.error); return payload as Directory; })
      .then(payload => { if (!controller.signal.aborted) setData(payload); })
      .catch(reason => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'Ошибка загрузки'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [country, category, photo, query, page, reload]);
  const totalPages = Math.max(1, Math.ceil((data?.total || 0) / 25));
  return <section className="mx-auto max-w-[1500px] px-5 py-7" lang="ru">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h2 className="font-head text-3xl font-bold text-ink">Сиды</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-ink-soft">Демонстрационные профили и каталог услуг по странам. Новые сиды — вымышленные пользователи без бронирования и переписки. Цены ориентировочные; источник и регион указаны у каждой услуги.</p></div>
      <button type="button" disabled={loading} className={`${fieldClass} font-bold disabled:opacity-50`} onClick={() => setReload(n => n + 1)}>Обновить</button>
    </div>
    {data && <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{data.countries.map(c => <button type="button" key={c.country_code} aria-pressed={country === c.country_code} onClick={() => { setCountry(c.country_code); setPage(1); }} className={`rounded-2xl border p-5 text-left ${country === c.country_code ? 'border-green bg-green-soft' : 'border-line bg-white'}`}>
      <span className="text-sm font-bold text-ink-soft">{countries[c.country_code] || c.country_code} · {c.country_code}</span><strong className="mt-2 block text-3xl text-ink">{c.profiles} <span className="text-sm font-medium">профилей</span></strong><span className="mt-2 block text-sm text-ink-soft">{c.services} услуг · {c.with_photo} с фото · {c.profiles - c.with_photo} без</span><span className="mt-1 block text-xs text-ink-soft">Активных профилей: {c.active_profiles}</span>
    </button>)}</div>}
    <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-[180px_1fr_180px_2fr]">
      <label className="grid gap-1 text-xs font-bold text-ink-soft">Страна<select className={fieldClass} value={country} onChange={e => { setCountry(e.target.value); setPage(1); }}><option value="">Все страны</option>{Object.entries(countries).map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></label>
      <label className="grid gap-1 text-xs font-bold text-ink-soft">Категория<select className={fieldClass} value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}><option value="">Все категории</option>{data?.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label className="grid gap-1 text-xs font-bold text-ink-soft">Фото<select className={fieldClass} value={photo} onChange={e => { setPhoto(e.target.value); setPage(1); }}><option value="">Все профили</option><option value="with">С фото</option><option value="without">Без фото</option></select></label>
      <label className="grid gap-1 text-xs font-bold text-ink-soft">Поиск<input className={fieldClass} value={search} onChange={e => setSearch(e.target.value)} placeholder="Имя, ID, город или услуга" maxLength={200} /></label>
    </div>
    <div className="mt-5 min-h-6 text-sm text-ink-soft" aria-live="polite">{loading ? 'Загрузка каталога…' : error ? <span role="alert" className="text-red-700">{error}</span> : `Найдено профилей: ${data?.total || 0}`}</div>
    {!loading && !error && data?.total === 0 && <p className="mt-6 rounded-2xl border border-line bg-white p-8 text-center text-ink-soft">По выбранным фильтрам сиды не найдены.</p>}
    {!error && <div className={`mt-4 space-y-4 ${loading ? 'pointer-events-none opacity-50' : ''}`} aria-busy={loading}>{data?.profiles.map(profile => <article key={profile.seed_key} className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="flex flex-wrap items-center gap-4 border-b border-line px-5 py-4"><Avatar profile={profile} /><div className="min-w-0 flex-1"><h3 className="text-lg font-bold text-ink" lang={profile.language_code}>{profile.full_name}</h3><p className="text-sm text-ink-soft">{profile.seed_key} · {profile.city} · {profile.currency_code} · {profile.language_code}</p></div><span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold">{profile.source_kind === 'regional' ? 'Сид · вся страна' : 'Прежний источник сидов'} · {profile.is_active ? 'активен' : 'выключен'}</span></div>
      <p className="px-5 pt-4 text-sm leading-6 text-ink-soft" lang={profile.language_code}>{profile.bio}</p>
      <div className="grid gap-3 p-5 lg:grid-cols-2">{profile.services.filter(s => !category || s.category_id === category).map(service => <div key={service.service_key} className="rounded-xl border border-line bg-cream p-4"><div className="flex flex-wrap justify-between gap-2"><div><p className="text-xs text-ink-soft">{service.category_name} · {service.is_active ? 'размещена' : 'выключена'}</p><h4 className="mt-1 font-bold text-ink" lang={profile.language_code}>{service.name}</h4></div><strong className="text-lg text-green">{price(service, profile.currency_code)}</strong></div><p className="mt-1 text-xs font-semibold text-ink-soft" lang={profile.language_code}>{service.price_unit}</p>
        <details className="mt-3 text-sm"><summary className="cursor-pointer font-semibold text-green">Описание и источник цены</summary><p className="mt-3 leading-6 text-ink-soft" lang={profile.language_code}>{service.description}</p>{service.source_url ? <><p className="mt-2 text-ink-soft" lang={profile.language_code}>{service.price_note}</p><p className="mt-2 text-xs text-ink-soft">Регион источника: {service.source_region} · Проверено: {service.researched_at}</p><a href={service.source_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-green underline">{service.source_title}</a></> : <p className="mt-2 text-ink-soft">У прежнего каталога источник цены не записан.</p>}</details>
      </div>)}</div>
    </article>)}</div>}
    <div className="mt-6 flex items-center justify-between gap-4"><button type="button" disabled={loading || page <= 1} className={`${fieldClass} disabled:opacity-40`} onClick={() => setPage(p => p - 1)}>← Назад</button><span className="text-sm text-ink-soft">Страница {page} из {totalPages}</span><button type="button" disabled={loading || page >= totalPages} className={`${fieldClass} disabled:opacity-40`} onClick={() => setPage(p => p + 1)}>Далее →</button></div>
  </section>;
}
