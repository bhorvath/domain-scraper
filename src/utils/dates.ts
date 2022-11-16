import { parse, startOfDay } from "date-fns";

export const parseListingDate = (date: string): Date =>
  parse(date, "yyyy-MM-dd'T'HH:mm:ss.SSS", startOfDay(new Date()));
