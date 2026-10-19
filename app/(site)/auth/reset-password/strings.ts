import { isLocale, type Locale } from "@/lib/i18n";

// Texts of the password reset page in the 16 site languages. The e-mailed link carries
// ?lang=<locale> (App Platform and rollback e-mails); otherwise the browser language is used.
export type ResetStrings = {
  eyebrow: string;
  title: string;
  intro: string;
  newPassword: string;
  repeatPassword: string;
  save: string;
  saving: string;
  tooShort: string;
  mismatch: string;
  done: string;
  invalid: string;
  openLink: string;
  unavailable: string;
};

export const resetStrings: Record<Locale, ResetStrings> = {
  en: {
    eyebrow: "Account", title: "Reset your password",
    intro: "Choose a new password, then sign in to the SwapSpot app with your e-mail and the new password.",
    newPassword: "New password", repeatPassword: "Repeat the new password", save: "Save new password", saving: "Saving…",
    tooShort: "Use at least 8 characters.", mismatch: "The passwords do not match.",
    done: "Your password has been changed. Open the SwapSpot app and sign in.",
    invalid: "This reset link is invalid or has expired. Request a new one from the app.",
    openLink: "Open the reset link from your e-mail to continue.", unavailable: "Password reset is not available on this site yet.",
  },
  es: {
    eyebrow: "Cuenta", title: "Restablece tu contraseña",
    intro: "Elige una nueva contraseña y luego inicia sesión en la app de SwapSpot con tu correo y la nueva contraseña.",
    newPassword: "Nueva contraseña", repeatPassword: "Repite la nueva contraseña", save: "Guardar nueva contraseña", saving: "Guardando…",
    tooShort: "Usa al menos 8 caracteres.", mismatch: "Las contraseñas no coinciden.",
    done: "Tu contraseña se ha cambiado. Abre la app de SwapSpot e inicia sesión.",
    invalid: "Este enlace no es válido o ha caducado. Pide uno nuevo desde la app.",
    openLink: "Abre el enlace del correo para continuar.", unavailable: "El restablecimiento de contraseña aún no está disponible en este sitio.",
  },
  zh: {
    eyebrow: "账户", title: "重置密码",
    intro: "请设置新密码，然后使用您的邮箱和新密码登录 SwapSpot 应用。",
    newPassword: "新密码", repeatPassword: "再次输入新密码", save: "保存新密码", saving: "正在保存…",
    tooShort: "密码至少需要 8 个字符。", mismatch: "两次输入的密码不一致。",
    done: "您的密码已更改。请打开 SwapSpot 应用并登录。",
    invalid: "此重置链接无效或已过期。请在应用中重新申请。",
    openLink: "请打开邮件中的重置链接以继续。", unavailable: "本网站暂不支持重置密码。",
  },
  fr: {
    eyebrow: "Compte", title: "Réinitialisez votre mot de passe",
    intro: "Choisissez un nouveau mot de passe, puis connectez-vous à l’app SwapSpot avec votre e-mail et ce nouveau mot de passe.",
    newPassword: "Nouveau mot de passe", repeatPassword: "Répétez le nouveau mot de passe", save: "Enregistrer le mot de passe", saving: "Enregistrement…",
    tooShort: "Utilisez au moins 8 caractères.", mismatch: "Les mots de passe ne correspondent pas.",
    done: "Votre mot de passe a été modifié. Ouvrez l’app SwapSpot et connectez-vous.",
    invalid: "Ce lien n’est pas valide ou a expiré. Demandez-en un nouveau dans l’app.",
    openLink: "Ouvrez le lien reçu par e-mail pour continuer.", unavailable: "La réinitialisation du mot de passe n’est pas encore disponible sur ce site.",
  },
  ru: {
    eyebrow: "Аккаунт", title: "Сброс пароля",
    intro: "Задайте новый пароль, затем войдите в приложение SwapSpot со своим email и новым паролем.",
    newPassword: "Новый пароль", repeatPassword: "Повторите новый пароль", save: "Сохранить новый пароль", saving: "Сохраняем…",
    tooShort: "Используйте не меньше 8 символов.", mismatch: "Пароли не совпадают.",
    done: "Пароль изменён. Откройте приложение SwapSpot и войдите.",
    invalid: "Ссылка недействительна или устарела. Запросите новую в приложении.",
    openLink: "Чтобы продолжить, откройте ссылку из письма.", unavailable: "Сброс пароля на этом сайте пока недоступен.",
  },
  ar: {
    eyebrow: "الحساب", title: "إعادة تعيين كلمة المرور",
    intro: "اختر كلمة مرور جديدة، ثم سجّل الدخول إلى تطبيق SwapSpot ببريدك الإلكتروني وكلمة المرور الجديدة.",
    newPassword: "كلمة المرور الجديدة", repeatPassword: "أعد إدخال كلمة المرور الجديدة", save: "حفظ كلمة المرور الجديدة", saving: "جارٍ الحفظ…",
    tooShort: "استخدم 8 أحرف على الأقل.", mismatch: "كلمتا المرور غير متطابقتين.",
    done: "تم تغيير كلمة المرور. افتح تطبيق SwapSpot وسجّل الدخول.",
    invalid: "رابط إعادة التعيين غير صالح أو منتهي الصلاحية. اطلب رابطًا جديدًا من التطبيق.",
    openLink: "افتح رابط إعادة التعيين من بريدك الإلكتروني للمتابعة.", unavailable: "إعادة تعيين كلمة المرور غير متاحة على هذا الموقع بعد.",
  },
  pt: {
    eyebrow: "Conta", title: "Redefina sua senha",
    intro: "Escolha uma nova senha e depois entre no app SwapSpot com seu e-mail e a nova senha.",
    newPassword: "Nova senha", repeatPassword: "Repita a nova senha", save: "Salvar nova senha", saving: "Salvando…",
    tooShort: "Use pelo menos 8 caracteres.", mismatch: "As senhas não coincidem.",
    done: "Sua senha foi alterada. Abra o app SwapSpot e entre.",
    invalid: "Este link é inválido ou expirou. Peça um novo pelo app.",
    openLink: "Abra o link do e-mail para continuar.", unavailable: "A redefinição de senha ainda não está disponível neste site.",
  },
  ht: {
    eyebrow: "Kont", title: "Chanje modpas ou",
    intro: "Chwazi yon nouvo modpas, apre sa konekte nan aplikasyon SwapSpot la ak imèl ou ak nouvo modpas la.",
    newPassword: "Nouvo modpas", repeatPassword: "Antre nouvo modpas la ankò", save: "Anrejistre nouvo modpas la", saving: "N ap anrejistre…",
    tooShort: "Sèvi ak omwen 8 karaktè.", mismatch: "Modpas yo pa menm.",
    done: "Modpas ou chanje. Louvri aplikasyon SwapSpot la epi konekte.",
    invalid: "Lyen sa a pa valab oswa li ekspire. Mande yon lòt nan aplikasyon an.",
    openLink: "Louvri lyen ki nan imèl ou a pou kontinye.", unavailable: "Chanjman modpas poko disponib sou sit sa a.",
  },
  de: {
    eyebrow: "Konto", title: "Passwort zurücksetzen",
    intro: "Wähle ein neues Passwort und melde dich dann mit deiner E-Mail-Adresse und dem neuen Passwort in der SwapSpot-App an.",
    newPassword: "Neues Passwort", repeatPassword: "Neues Passwort wiederholen", save: "Neues Passwort speichern", saving: "Wird gespeichert…",
    tooShort: "Verwende mindestens 8 Zeichen.", mismatch: "Die Passwörter stimmen nicht überein.",
    done: "Dein Passwort wurde geändert. Öffne die SwapSpot-App und melde dich an.",
    invalid: "Dieser Link ist ungültig oder abgelaufen. Fordere in der App einen neuen an.",
    openLink: "Öffne den Link aus deiner E-Mail, um fortzufahren.", unavailable: "Das Zurücksetzen des Passworts ist auf dieser Website noch nicht verfügbar.",
  },
  fil: {
    eyebrow: "Account", title: "I-reset ang iyong password",
    intro: "Pumili ng bagong password, pagkatapos ay mag-sign in sa SwapSpot app gamit ang iyong email at ang bagong password.",
    newPassword: "Bagong password", repeatPassword: "Ulitin ang bagong password", save: "I-save ang bagong password", saving: "Sine-save…",
    tooShort: "Gumamit ng hindi bababa sa 8 character.", mismatch: "Hindi magkatugma ang mga password.",
    done: "Napalitan na ang iyong password. Buksan ang SwapSpot app at mag-sign in.",
    invalid: "Hindi wasto o expired na ang link na ito. Humingi ng bago mula sa app.",
    openLink: "Buksan ang reset link mula sa iyong email para magpatuloy.", unavailable: "Hindi pa available ang pag-reset ng password sa site na ito.",
  },
  hi: {
    eyebrow: "खाता", title: "अपना पासवर्ड रीसेट करें",
    intro: "नया पासवर्ड चुनें, फिर अपने ईमेल और नए पासवर्ड से SwapSpot ऐप में साइन इन करें।",
    newPassword: "नया पासवर्ड", repeatPassword: "नया पासवर्ड दोबारा लिखें", save: "नया पासवर्ड सेव करें", saving: "सेव हो रहा है…",
    tooShort: "कम से कम 8 अक्षर इस्तेमाल करें।", mismatch: "पासवर्ड मेल नहीं खाते।",
    done: "आपका पासवर्ड बदल दिया गया है। SwapSpot ऐप खोलें और साइन इन करें।",
    invalid: "यह रीसेट लिंक अमान्य है या समाप्त हो गया है। ऐप से नया लिंक मंगाएँ।",
    openLink: "जारी रखने के लिए अपने ईमेल का रीसेट लिंक खोलें।", unavailable: "इस साइट पर अभी पासवर्ड रीसेट उपलब्ध नहीं है।",
  },
  bn: {
    eyebrow: "অ্যাকাউন্ট", title: "আপনার পাসওয়ার্ড রিসেট করুন",
    intro: "একটি নতুন পাসওয়ার্ড বেছে নিন, তারপর আপনার ইমেল ও নতুন পাসওয়ার্ড দিয়ে SwapSpot অ্যাপে সাইন ইন করুন।",
    newPassword: "নতুন পাসওয়ার্ড", repeatPassword: "নতুন পাসওয়ার্ড আবার লিখুন", save: "নতুন পাসওয়ার্ড সংরক্ষণ করুন", saving: "সংরক্ষণ করা হচ্ছে…",
    tooShort: "অন্তত ৮টি অক্ষর ব্যবহার করুন।", mismatch: "পাসওয়ার্ড দুটি মিলছে না।",
    done: "আপনার পাসওয়ার্ড পরিবর্তন হয়েছে। SwapSpot অ্যাপ খুলে সাইন ইন করুন।",
    invalid: "এই রিসেট লিঙ্কটি অবৈধ বা মেয়াদোত্তীর্ণ। অ্যাপ থেকে নতুন লিঙ্ক চেয়ে নিন।",
    openLink: "চালিয়ে যেতে আপনার ইমেলের রিসেট লিঙ্কটি খুলুন।", unavailable: "এই সাইটে এখনও পাসওয়ার্ড রিসেট উপলব্ধ নয়।",
  },
  te: {
    eyebrow: "ఖాతా", title: "మీ పాస్‌వర్డ్‌ను రీసెట్ చేయండి",
    intro: "కొత్త పాస్‌వర్డ్‌ను ఎంచుకుని, మీ ఇమెయిల్ మరియు కొత్త పాస్‌వర్డ్‌తో SwapSpot యాప్‌లో సైన్ ఇన్ చేయండి.",
    newPassword: "కొత్త పాస్‌వర్డ్", repeatPassword: "కొత్త పాస్‌వర్డ్‌ను మళ్లీ నమోదు చేయండి", save: "కొత్త పాస్‌వర్డ్‌ను సేవ్ చేయండి", saving: "సేవ్ అవుతోంది…",
    tooShort: "కనీసం 8 అక్షరాలు ఉపయోగించండి.", mismatch: "పాస్‌వర్డ్‌లు సరిపోలలేదు.",
    done: "మీ పాస్‌వర్డ్ మార్చబడింది. SwapSpot యాప్‌ను తెరిచి సైన్ ఇన్ చేయండి.",
    invalid: "ఈ రీసెట్ లింక్ చెల్లదు లేదా గడువు ముగిసింది. యాప్ నుండి కొత్తది అభ్యర్థించండి.",
    openLink: "కొనసాగడానికి మీ ఇమెయిల్‌లోని రీసెట్ లింక్‌ను తెరవండి.", unavailable: "ఈ సైట్‌లో పాస్‌వర్డ్ రీసెట్ ఇంకా అందుబాటులో లేదు.",
  },
  ta: {
    eyebrow: "கணக்கு", title: "உங்கள் கடவுச்சொல்லை மீட்டமைக்கவும்",
    intro: "புதிய கடவுச்சொல்லைத் தேர்வுசெய்து, உங்கள் மின்னஞ்சல் மற்றும் புதிய கடவுச்சொல்லுடன் SwapSpot செயலியில் உள்நுழையவும்.",
    newPassword: "புதிய கடவுச்சொல்", repeatPassword: "புதிய கடவுச்சொல்லை மீண்டும் உள்ளிடவும்", save: "புதிய கடவுச்சொல்லைச் சேமிக்கவும்", saving: "சேமிக்கப்படுகிறது…",
    tooShort: "குறைந்தது 8 எழுத்துகளைப் பயன்படுத்தவும்.", mismatch: "கடவுச்சொற்கள் பொருந்தவில்லை.",
    done: "உங்கள் கடவுச்சொல் மாற்றப்பட்டது. SwapSpot செயலியைத் திறந்து உள்நுழையவும்.",
    invalid: "இந்த மீட்டமைப்பு இணைப்பு செல்லாதது அல்லது காலாவதியானது. செயலியிலிருந்து புதியதைக் கோரவும்.",
    openLink: "தொடர உங்கள் மின்னஞ்சலில் உள்ள மீட்டமைப்பு இணைப்பைத் திறக்கவும்.", unavailable: "இந்தத் தளத்தில் கடவுச்சொல் மீட்டமைப்பு இன்னும் கிடைக்கவில்லை.",
  },
  vi: {
    eyebrow: "Tài khoản", title: "Đặt lại mật khẩu",
    intro: "Chọn mật khẩu mới, sau đó đăng nhập ứng dụng SwapSpot bằng email và mật khẩu mới.",
    newPassword: "Mật khẩu mới", repeatPassword: "Nhập lại mật khẩu mới", save: "Lưu mật khẩu mới", saving: "Đang lưu…",
    tooShort: "Dùng ít nhất 8 ký tự.", mismatch: "Mật khẩu không khớp.",
    done: "Mật khẩu của bạn đã được thay đổi. Hãy mở ứng dụng SwapSpot và đăng nhập.",
    invalid: "Liên kết đặt lại không hợp lệ hoặc đã hết hạn. Hãy yêu cầu liên kết mới trong ứng dụng.",
    openLink: "Mở liên kết đặt lại trong email của bạn để tiếp tục.", unavailable: "Trang này chưa hỗ trợ đặt lại mật khẩu.",
  },
  th: {
    eyebrow: "บัญชี", title: "รีเซ็ตรหัสผ่านของคุณ",
    intro: "เลือกรหัสผ่านใหม่ แล้วเข้าสู่ระบบแอป SwapSpot ด้วยอีเมลและรหัสผ่านใหม่ของคุณ",
    newPassword: "รหัสผ่านใหม่", repeatPassword: "กรอกรหัสผ่านใหม่อีกครั้ง", save: "บันทึกรหัสผ่านใหม่", saving: "กำลังบันทึก…",
    tooShort: "ใช้อย่างน้อย 8 ตัวอักษร", mismatch: "รหัสผ่านไม่ตรงกัน",
    done: "เปลี่ยนรหัสผ่านแล้ว เปิดแอป SwapSpot แล้วเข้าสู่ระบบ",
    invalid: "ลิงก์รีเซ็ตนี้ไม่ถูกต้องหรือหมดอายุแล้ว โปรดขอลิงก์ใหม่จากแอป",
    openLink: "เปิดลิงก์รีเซ็ตจากอีเมลของคุณเพื่อดำเนินการต่อ", unavailable: "เว็บไซต์นี้ยังไม่รองรับการรีเซ็ตรหัสผ่าน",
  },
};

/** ?lang= from the e-mail (platform/SwapSpot codes like zh-Hans, pt-BR), then the browser languages. */
export function resetLocale(search: string, browser: readonly string[]): Locale {
  const candidates = [new URLSearchParams(search).get("lang") || "", ...browser];
  for (const raw of candidates) {
    const code = raw.trim().toLowerCase().replace("_", "-");
    if (!code) continue;
    if (code.startsWith("zh")) return "zh";
    const base = code.split("-")[0];
    if (isLocale(code)) return code;
    if (isLocale(base)) return base;
  }
  return "en";
}
