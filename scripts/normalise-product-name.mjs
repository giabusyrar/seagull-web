/**
 * Compare product names the way a person would, because the stored rows and a
 * brand's catalogue write the same product differently: "Colorfit Quad Eye
 * Palette 01 Brunette Dawn" is the row for "Colorfit Quad Eye Palette Brunette
 * Dawn", and "Hyperblack Superstay Liner" for "… 1 g".
 *
 * Getting this wrong is not a cosmetic duplicate: the existing rows carry the
 * try-on shades, so a second row for the same product would appear in the
 * dashboard and in matching as an empty twin.
 */
export function normaliseName(name, brandName) {
  return String(name)
    .toLowerCase()
    .replace(new RegExp(`^${brandName.toLowerCase()}\\s+`), '')
    // size suffixes: 1 g, 12 g, 6ml, 42 ml
    .replace(/\b\d+(\.\d+)?\s*(g|gr|ml)\b/g, ' ')
    // palette index: a lone 01/02/03 between words
    .replace(/\b0\d\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
