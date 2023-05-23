export * from "./colors";
export * from "./units";
export * from "./shadow";

export const getPokemonId = (url: string) => {
  const urlSplit = url.split("/");
  if (urlSplit?.length) return urlSplit[urlSplit.length - 2];

  return "";
};
