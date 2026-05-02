/** Strip Prisma Decimal/Date objects into plain JSON-safe values for client components */
export function serialize<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj, (_key, value) => {
    // Prisma Decimal → number
    if (value !== null && typeof value === "object" && typeof value.toNumber === "function") {
      return value.toNumber();
    }
    return value;
  }));
}
