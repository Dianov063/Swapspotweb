import { Search, Star, Users } from "lucide-react";

const helpers = [
  { initials: "MR", tag: "Maria · $45", bg: "#E6F0E9", color: "#1B6B45", left: "26%", top: "44%", active: true },
  { initials: "JC", tag: "$50", bg: "#EAEFF6", color: "#3A5A8C", left: "64%", top: "30%" },
  { initials: "AL", tag: "$28", bg: "#F3E7EE", color: "#8C3A66", left: "46%", top: "62%" },
  { initials: "DT", tag: "$35", bg: "#F7EAD2", color: "#8A5B12", left: "77%", top: "66%" },
];

/**
 * Pure-CSS phone + map mockup. No real images (per brief — no stock photos).
 * Reused on the homepage hero; lift into /helpers or city pages as needed.
 */
export default function PhoneMockup() {
  return (
    <div className="relative aspect-[300/620] w-[clamp(264px,84%,314px)] rounded-[46px] bg-[#1E2A24] p-[11px] shadow-[0_40px_80px_-30px_rgba(20,42,30,.5),0_8px_24px_rgba(20,42,30,.18)]">
      <div className="absolute left-1/2 top-5 z-[8] h-6 w-[90px] -translate-x-1/2 rounded-b-2xl bg-[#1E2A24]" />
      <div className="relative h-full w-full overflow-hidden rounded-[36px] bg-[#E6E4DC]">
        {/* map base */}
        <div className="absolute -right-[12%] top-0 h-[40%] w-[62%] rounded-bl-[46px] bg-[#CFE0EA]" />
        <div className="absolute bottom-[30%] -left-[10%] h-[30%] w-[52%] rounded-r-[34px] bg-[#D4E7CD]" />
        {/* roads */}
        <div className="absolute -left-[6%] -right-[6%] top-[45%] h-[15px] bg-[#FCFCFA]" />
        <div className="absolute -bottom-[34%] left-[36%] top-[-6%] w-[15px] bg-[#FCFCFA]" />
        <div className="absolute -left-[6%] -right-[6%] top-[67%] h-[11px] bg-[#FCFCFA]" />
        <div className="absolute -bottom-[6%] left-[70%] top-[8%] w-[11px] bg-[#FCFCFA]" />

        {/* search bar */}
        <div className="absolute left-3.5 right-3.5 top-[52px] flex items-center gap-2.5 rounded-[14px] bg-white px-3.5 py-[11px] shadow-[0_6px_18px_rgba(20,42,30,.12)]">
          <Search className="h-[17px] w-[17px] text-green" />
          <span className="text-[12.5px] font-semibold text-[#7A857E]">
            Services near Oak Street
          </span>
          <span className="ml-auto h-2 w-2 rounded-full bg-gold" />
        </div>

        {/* live count */}
        <div className="absolute left-3.5 top-[90px] z-[6] inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-green px-[11px] py-1.5 text-[11px] font-bold text-white shadow-[0_4px_12px_rgba(20,42,30,.25)]">
          <Users className="h-[13px] w-[13px]" />
          12 helpers nearby
        </div>

        {/* helper markers */}
        {helpers.map((h) => (
          <div
            key={h.initials}
            className={`absolute flex -translate-x-1/2 -translate-y-full flex-col items-center ${
              h.active ? "z-[7]" : "z-[5]"
            }`}
            style={{ left: h.left, top: h.top }}
          >
            <span
              className={`grid place-items-center rounded-full border-[3px] font-extrabold ${
                h.active
                  ? "h-11 w-11 border-green text-[12.5px] shadow-[0_7px_18px_rgba(27,107,69,.45)]"
                  : "h-[38px] w-[38px] border-white text-[12.5px] shadow-[0_5px_14px_rgba(20,42,30,.3)]"
              }`}
              style={{ background: h.bg, color: h.color }}
            >
              {h.initials}
            </span>
            <span
              className={`-mt-[7px] whitespace-nowrap rounded-full px-2 py-0.5 text-[10.5px] font-extrabold shadow-[0_3px_8px_rgba(20,42,30,.2)] ${
                h.active ? "bg-green text-white" : "bg-white text-ink"
              }`}
            >
              {h.tag}
            </span>
          </div>
        ))}

        {/* bottom sheet */}
        <div className="absolute inset-x-0 bottom-0 rounded-t-[22px] bg-white px-4 pb-[18px] pt-3 shadow-[0_-8px_24px_rgba(20,42,30,.1)]">
          <div className="mx-auto mb-3 h-1 w-[38px] rounded-full bg-[#E3E1D9]" />
          <div className="flex items-center gap-[11px]">
            <span className="grid h-[46px] w-[46px] place-items-center rounded-[14px] bg-green-soft text-[15px] font-extrabold text-green">
              MR
            </span>
            <div className="min-w-0 flex-1 leading-[1.25]">
              <div className="text-[14.5px] font-extrabold text-ink">
                Maria&apos;s Cleaning
              </div>
              <div className="flex items-center gap-1 text-[12px] font-semibold text-[#7A857E]">
                <Star className="h-3 w-3 text-gold" fill="currentColor" />
                4.9 (128) · 0.6 mi
              </div>
            </div>
            <div className="text-[15px] font-extrabold text-ink">
              $45<span className="text-[11px] font-semibold text-[#7A857E]">/hr</span>
            </div>
          </div>
          <button
            type="button"
            className="mt-3 w-full rounded-[13px] bg-green py-3 text-[14px] font-extrabold text-white"
          >
            Book now
          </button>
        </div>
      </div>
    </div>
  );
}
