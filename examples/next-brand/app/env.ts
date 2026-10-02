/** Reads a required server environment variable; fails loudly when it is unset. */
export const env = (k: string): string => {
  const v = process.env[k];
  if (!v) throw new Error(`${k} is not set (see .env.example)`);
  return v;
};
