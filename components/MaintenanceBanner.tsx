"use client";

import { usePathname } from "next/navigation";

// Shown only while SwapSpot moves to its new backend. Turned on by setting
// NEXT_PUBLIC_SITE_MAINTENANCE_BANNER=on in Vercel and redeploying; any other
// value (or none) renders nothing.
const enabled = process.env.NEXT_PUBLIC_SITE_MAINTENANCE_BANNER === "on";

const copy = {
  en: "SwapSpot is moving to new servers. For about an hour, signing in, password reset and account changes may not work. Please try again a little later.",
  es: "SwapSpot se está mudando a nuevos servidores. Durante aproximadamente una hora, es posible que no funcionen el inicio de sesión, el restablecimiento de contraseña ni los cambios de cuenta. Inténtalo de nuevo un poco más tarde.",
  zh: "SwapSpot 正在迁移到新服务器。在大约一小时内，登录、重置密码和账户更改可能无法使用。请稍后再试。",
  fr: "SwapSpot migre vers de nouveaux serveurs. Pendant environ une heure, la connexion, la réinitialisation du mot de passe et les modifications du compte peuvent ne pas fonctionner. Veuillez réessayer un peu plus tard.",
  ru: "SwapSpot переезжает на новые серверы. Примерно в течение часа вход, сброс пароля и изменения аккаунта могут не работать. Пожалуйста, попробуйте чуть позже.",
  ar: "ينتقل SwapSpot إلى خوادم جديدة. لمدة ساعة تقريبًا قد لا يعمل تسجيل الدخول وإعادة تعيين كلمة المرور وتغييرات الحساب. يرجى المحاولة مرة أخرى بعد قليل.",
  pt: "O SwapSpot está mudando para novos servidores. Por cerca de uma hora, o login, a redefinição de senha e as alterações de conta podem não funcionar. Tente novamente um pouco mais tarde.",
  ht: "SwapSpot ap deplase sou nouvo sèvè. Pandan apeprè inèdtan, konekte, reyinisyalize modpas ak chanjman kont ka pa mache. Tanpri eseye ankò yon ti tan pita.",
  de: "SwapSpot zieht auf neue Server um. Etwa eine Stunde lang funktionieren Anmeldung, Passwort-Zurücksetzen und Kontoänderungen möglicherweise nicht. Bitte versuche es etwas später erneut.",
  fil: "Lumilipat ang SwapSpot sa mga bagong server. Sa loob ng humigit-kumulang isang oras, maaaring hindi gumana ang pag-sign in, pag-reset ng password at mga pagbabago sa account. Pakisubukang muli mamaya.",
  hi: "SwapSpot नए सर्वरों पर जा रहा है। लगभग एक घंटे तक साइन इन, पासवर्ड रीसेट और खाते में बदलाव काम नहीं कर सकते। कृपया थोड़ी देर बाद फिर से कोशिश करें।",
  bn: "SwapSpot নতুন সার্ভারে স্থানান্তরিত হচ্ছে। প্রায় এক ঘণ্টা সাইন ইন, পাসওয়ার্ড রিসেট এবং অ্যাকাউন্ট পরিবর্তন কাজ নাও করতে পারে। অনুগ্রহ করে একটু পরে আবার চেষ্টা করুন।",
  te: "SwapSpot కొత్త సర్వర్లకు మారుతోంది. సుమారు ఒక గంట పాటు సైన్ ఇన్, పాస్‌వర్డ్ రీసెట్ మరియు ఖాతా మార్పులు పని చేయకపోవచ్చు. దయచేసి కొద్దిసేపటి తర్వాత మళ్లీ ప్రయత్నించండి.",
  ta: "SwapSpot புதிய சர்வர்களுக்கு மாறுகிறது. சுமார் ஒரு மணி நேரம் உள்நுழைவு, கடவுச்சொல் மீட்டமைப்பு மற்றும் கணக்கு மாற்றங்கள் வேலை செய்யாமல் போகலாம். சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.",
  vi: "SwapSpot đang chuyển sang máy chủ mới. Trong khoảng một giờ, đăng nhập, đặt lại mật khẩu và thay đổi tài khoản có thể không hoạt động. Vui lòng thử lại sau ít phút.",
  th: "SwapSpot กำลังย้ายไปยังเซิร์ฟเวอร์ใหม่ ประมาณหนึ่งชั่วโมง การเข้าสู่ระบบ การรีเซ็ตรหัสผ่าน และการเปลี่ยนแปลงบัญชีอาจใช้งานไม่ได้ โปรดลองอีกครั้งในภายหลัง",
} as const;

type SupportedLocale = keyof typeof copy;

function getLocale(pathname: string): SupportedLocale {
  const segment = pathname.split("/").filter(Boolean)[0];
  return segment && segment in copy ? (segment as SupportedLocale) : "en";
}

export default function MaintenanceBanner() {
  const pathname = usePathname() ?? "/";
  if (!enabled) return null;
  const locale = getLocale(pathname);
  return (
    <div
      role="status"
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="bg-amber-100 px-4 py-3 text-center text-sm font-medium text-amber-900"
    >
      {copy[locale]}
    </div>
  );
}
