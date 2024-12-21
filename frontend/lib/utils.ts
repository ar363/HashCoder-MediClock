import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAuth(): {
  token: string;
  userid: string;
  patient: {
    name: string;
    breakfast_time: string;
    lunch_time: string;
    dinner_time: string;
    address: string;
  } | null;
} {
  let mtp;
  try {
    mtp = JSON.parse(localStorage.getItem("medtechpatient") as string);
  } catch (e) {
    mtp = null;
  }

  const toSend = {
    token: localStorage.getItem("medtechtoken"),
    userid: localStorage.getItem("medtechuserid"),
    patient: mtp,
  };

  if (!toSend.token || !toSend.userid) {
    return { token: "", userid: "", patient: null };
  }

  return toSend;
}

export function setAuth(uid: number, utoken: string, upatient: object | null) {
  localStorage.setItem("medtechtoken", utoken);
  localStorage.setItem("medtechuserid", uid.toString());
  if (upatient)
    localStorage.setItem("medtechpatient", JSON.stringify(upatient));
}

export function greeting(name: string | null) {
  var ndate = new Date();
  var hours = ndate.getHours();
  var message =
    hours < 12
      ? "Good Morning"
      : hours < 18
      ? "Good Afternoon"
      : "Good Evening";
  if (name === null) {
    return message + " !";
  }

  return `${message}, ${name} !`;
}
