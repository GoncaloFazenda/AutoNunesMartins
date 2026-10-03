# Public vehicle structured data

Implemented 2026-10-03. Real published vehicle detail pages render one JSON-LD block in the SSR head. Both detail templates use the same helper and canonical URL function. Demo pages have no publicVehicle and emit no commercial schema.

- Types: Product and Car, with stable `#vehicle` id, name, brand, model and canonical URL.
- Optional facts: approved description/photos, fuel, transmission, mileage (`QuantitativeValue`, KMT), doors, seats, color/category and public equipment.
- The CRM field “Ano” is a PropertyValue; it does not prove manufacture date, first registration or model release. Power and displacement retain the displayed units cv and cm³.
- Offer requires a positive decimal price string, EUR and a known state. AVAILABLE maps to InStock; RESERVED maps conservatively to OutOfStock, not SoldOut or PreOrder. Null/invalid price means no Offer, never zero.
- Missing/invalid properties are omitted independently. Legitimate mileage zero is retained. Missing brand/model/valid slug or invalid origin suppresses the whole script. An incomplete Car/Product description is not claimed to qualify for Google enhancements.
- Public parser remains the stricter upstream boundary; the helper also accepts unknown input to fail safely. No private identifiers, example seller/contact details, reviews, guarantees or dates are invented.
- Serialization escapes `<`, `>`, `&`, U+2028/U+2029 before inserting into a script raw-text node. No advertiser-controlled string can terminate the JSON-LD script.

Canonical and image URLs use the same request origin as existing SEO. Configure the real public domain/proxy correctly for production; localhost checks deliberately retain localhost. No domain was invented.

Validation: 41 new unit cases (minimal identity, absent/null/blank/malformed options, invalid price/mileage/units/state/origin, zero mileage, reservation, approved image paths, secret-field omission and hostile script text). SSR HTTP check of Jogger produced exactly one parseable block with EUR 17141.78 and 83491 KMT; Porsche demo produced none. Website suite: 197 tests passed at this stage. No live CRM data was changed.

Sources consulted:
- https://schema.org/Car
- https://schema.org/mileageFromOdometer
- https://schema.org/ItemAvailability
- https://developers.google.com/search/docs/appearance/structured-data/product-snippet
- https://developers.google.com/search/blog/2025/06/simplifying-search-results

Google retired the special Vehicle Listing search feature. This implements current semantic markup, not that retired feature. Rich results, indexing and rankings are not guaranteed. Live Search Console/Rich Results validation after deployment remains separate.
