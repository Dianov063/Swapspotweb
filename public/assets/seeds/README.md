# Regional demo portraits

Generated with the built-in image generation tool on 2026-09-15. Fictional adults;
not photographs of customers or service providers. No source people were scraped.
Render only one portrait rectangle at a time. The database `avatar_rect` stores
normalized [x, y, width, height]; generated grids are not exactly the requested
10×15 layout, so the generator uses the observed cell boundaries instead.

- `do-portraits-20260915.png`: Dominican fictional adult avatar atlas.
- `th-portraits-20260915.png`: Thai fictional adult avatar atlas.
- Each country assigns 150 distinct portrait rectangles to 150 demo profiles.
- Another 150 profiles per country use initials, with no photo URL.

Prompts used:

**Dominican atlas:** Use case: photorealistic-natural. Create a single production avatar sprite sheet for 150 fictional adult Dominican Republic demo helper profiles. EXACT layout: 10 columns and 15 rows, 150 equally sized SQUARE portrait tiles, no margins, no gutters, no borders, no text, no numbering. Canvas portrait aspect ratio 2:3, preferably 2048x3072 or larger. Each tile an independent natural photographic headshot, face centered and fully inside its own tile, shoulders visible, neutral softly blurred warm background, realistic everyday clothing. Diverse fictional Dominican adults reflecting the country's varied Afro-Caribbean and mixed Latin American appearances, ages 24–65. Alternate woman then man in reading order across every row. Every one of the 150 faces distinct, varied hair, skin tones, clothes, no duplicated faces. Friendly understated expressions and authentic skin texture, no beauty retouching. These are clearly designated synthetic demo avatars in the consuming product, no real people, celebrities, business logos, uniforms or credentials. Strict perfect regular 10-by-15 square-cell image atlas, edge to edge.

**Thai atlas:** Use case: photorealistic-natural. A single production photographic avatar contact sheet for fictional adult Thai demo helper profiles. A perfectly regular edge-to-edge matrix with 10 columns and 15 rows of SQUARE portrait cells, total 150 portraits. Canvas 2:3 portrait aspect ratio. No outer margins, no gutters, no borders, no labels. Every cell contains exactly ONE independent, different head-and-shoulders portrait of a fictional Thai adult aged 24–65, 75 women and 75 men alternating, varied faces, varied hairstyles, varied everyday clothing. Thai people with diverse appearances and ages, realistic natural skin texture and subtle friendly expressions. Face always centered within its own cell, shoulders visible, enough room above the head. Soft neutral cream/green backgrounds with natural lighting, photographic realism. Each fictional person visually different, no repeats, no celebrities, no logos, no credentials. The image will be used as an atlas of explicitly labeled synthetic demo avatars. Strictly aligned regular 10 columns by 15 rows.
