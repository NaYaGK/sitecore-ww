/**
 * Dictionary mapping
 *
 * The key should be referenced in the rendering files,
 * and the value to should be the name of the dictionary item
 * in Sitecore.
 */

export const dictionaryKeys: Record<string, string> = {};

export const mockDictionary = (dictionary: Record<string, string>): Record<string, string> => {
  const overrides: Record<string, string> = {};
  const temp: Record<string, string> = {};
  Object.keys(dictionary).forEach((key) => {
    const dictionaryKey = dictionary[key];
    if (dictionaryKey) {
      temp[dictionaryKey] = overrides[dictionaryKey] || key;
    }
  });
  const withTokens = {};
  return Object.assign(temp, withTokens);
};
