// config/amitkk.ts

const amitkk = {
  socialLinks: [
    { name: "Facebook", icon: "facebook.svg", url: "https://www.facebook.com/Amitkk-110578507216727" },
    { name: "Instagram", icon: "instagram.svg", url: "https://www.instagram.com/_amitkk_/" },
    { name: "LinkedIn", icon: "linkedin.svg", url: "https://www.linkedin.com/in/amitkhare588/" },
    { name: "WhatsApp", icon: "whatsapp.svg", url: "https://api.whatsapp.com/send?phone=919311924733&text=%20Hi,%C2%A0I%C2%A0got%C2%A0your%C2%A0whatsapp%C2%A0Number%C2%A0from%C2%A0AMITKKAE%C2%A0%20Website." },
    // { name: "Twitter", icon: "twitter.svg", url: "https://www.linkedin.com/company/india-enigma/" },
    // { name: "YouTube", icon: "youtube.svg", url: "https://youtube.com/yourchannel" },
  ]
};

export default amitkk;


export const config = (key?: string, defaultValue?: any) => {
  if (!key) return amitkk;

  const keys = key.split('.');
  let value: any = amitkk;

  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) return defaultValue;
  }

  return value;
};