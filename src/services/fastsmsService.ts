import { Template } from "../types";

export const validateMobileNumber = (number: Number) => {
  let expr = /^(0|91)?[6-9][0-9]{9}$/;
  if (expr.test(number.toString())) {
    return true;
  }
  return false;
};

export const formulateMessage = (template: Template, mobilePhone: number) => {
  const ENDPOINT = process.env.NEXT_PUBLIC_FASTSMS_AUTH_DOMAIN!;
  const APIKEY = process.env.NEXT_PUBLIC_FASTSMS_PUBLIC_API_KEY!;
  const message =
    ENDPOINT +
    APIKEY +
    "&message=" +
    template.message +
    "&language=english&route=v3&numbers=" +
    mobilePhone +
    "&flash=0";

    return message
};
