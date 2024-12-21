import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAuth() {
  let mtp;
  try {
    mtp = JSON.parse(localStorage.getItem("medtechpatient") as string);
  } catch (e) {
    mtp = {};
  }

  const toSend = {
    token: localStorage.getItem("medtechtoken"),
    userid: localStorage.getItem("medtechuserid"),
    patient: mtp,
  };

  if (!toSend.token || !toSend.userid) {
    return { token: "", userid: "", patient: {} };
  }

  return toSend;
}

export function setAuth(uid: number, utoken: string, upatient: object | null) {
  localStorage.setItem("medtechtoken", utoken);
  localStorage.setItem("medtechuserid", uid.toString());
  if (upatient)
    localStorage.setItem("medtechpatient", JSON.stringify(upatient));
}
