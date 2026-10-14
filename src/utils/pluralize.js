const pluralRules = new Intl.PluralRules("fr-FR");

/** pluralize(1, "article") → « 1 article » ; pluralize(3, "article") → « 3 articles ». */
export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${pluralRules.select(count) === "one" ? singular : plural}`;
}
