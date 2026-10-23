# Figma fidelity review

Build compared against Figma file `fpm3gDDOUwOaMu07QbTH3b`, page "houseofmenzura.com" (`140:2`), using `docs/figma-spec.md` and the reference renders in `design/figma-ref/`.

- Captures: `node scripts/capture.mjs <url> <dir>` (1440 and 390 wide: full page, each section, the three tabs, checkbox and Yes/No states, every role dialog and sheet, the confirmation).
- Side-by-side sheets (Figma | before | after): `python3 scripts/compare.py` writes them to `design/compare/`.

Status key: **fixed**, **as drawn** (built exactly as Figma, though it may be unintended; question for the designer), **deliberate** (differs from Figma for a reason given), **browser** (cannot be reproduced exactly in a browser).

## 1. Differences found in the first build, and what was done

### Layout
| Difference | Status |
| --- | --- |
| The whole build used the old dark theme (Ink, Bone and Indigo section backgrounds). Figma is one white page in the "houseofmenzura · light" theme. | fixed |
| The pinned header overlapped every section top. Sections now sit below it, and anchors are offset by the header height. | fixed |
| Hero top padding was 160; Figma has 240 (140 on mobile). Doors started 80 below the hero text; Figma has 120 (48 on mobile). | fixed |
| Hero illustration (400×500) and the Back the house illustration (420×420) were missing from the layout. | fixed |
| Form fields sat straight on the section. Figma puts them in a frosted panel 640 wide, padding 48 (mobile: 342 wide, padding 28 20). | fixed |
| The desktop "How it works" column showed an illustration. Figma's 420×315 slot is empty on desktop; the knocker shows only on mobile. | fixed (as drawn) |
| Section heights were off by 2 to 30px because of fractional line heights and a top border that added height. Every section is now within 1px of Figma at 1440 and 390, except Leave your name (see section 2). | fixed |
| Door and role cards were 2px short. Figma includes their 1px stroke in the layout, so the cards use a real border. The section rules don't count toward height in Figma, so those are drawn inset. | fixed |
| Footer was 157 tall instead of 135, because its links' 44px touch targets added height. They keep 44px targets, with negative margins. | fixed |

### Spacing
| Difference | Status |
| --- | --- |
| Group gaps, field gaps and the tab row height were taken from the dark build. They now follow Figma: groups 32 (mobile 24), fields 8, tabs 54 (mobile 74 with two-line labels), panel gap 48 (mobile 40). | fixed |
| The mobile role-card and door-card paddings were 32. Figma has 24. | fixed |
| Role overlay padding was 40 all round. Figma has 40 56 56 56, with gap 32 and an apply block with 8 top padding and a gap of 16. | fixed |

### Type
| Difference | Status |
| --- | --- |
| Line heights were unitless ratios, which gave fractional pixels. Figma rounds every line box to a whole pixel (for example 19 × 1.6 is 30, not 30.4), so all of them are now set in px to match. | fixed |
| Tabs were 13px Regular. Figma uses Small/Strong (14 Medium) on desktop and mobile. | fixed |
| Textarea labels, the drop zone title, "Choose file", the Back the house lead and the "Everything the house does" paragraph were muted. Figma sets these in Ink. | fixed |
| Small font rendering (hinting and antialiasing of Inter at 11 to 14px) differs slightly from Figma's renderer. | browser |

### Colour
| Difference | Status |
| --- | --- |
| Labels, step numbers and the "RECEIVED" eyebrow were Brass. Brass now appears only on the active tab rule and the bullet dots; all small labels are Ink Muted `#5f594f`. | fixed |
| Error messages were Brass Light (from the dark theme). Figma has no light error state, so errors are Ink, Medium weight, with a 2px underline on the field (see question 8). | deliberate |
| No colour fields. There are now six: hero indigo and brass, roles brass and indigo, form brass and indigo, with mobile variants. Each has Figma's exact size and position, Brass at 10% and Indigo at 6%, and Figma's layer blur. | fixed |

### Borders and radius
| Difference | Status |
| --- | --- |
| Card radius was 4. Figma has 12; card images 6; overlay and sheet images 8; form panel 16 (mobile 14); overlay panel 16; buttons, textarea and drop zone 2. | fixed |
| Card stroke was Ink at 12%. Page instances in Figma use `#000` at 10%, so that is used (the component master says Ink at 12%; see question 6). | fixed (as drawn) |
| Text inputs were underlined in Ink. Figma underlines inputs in Ink Muted and selects in Ink. | fixed |
| The selected radio had a filled dot. Figma uses a 6px inner Ink stroke, which reads as a thick ring around a white centre. | fixed |
| The mobile drop zone is drawn with a solid stroke in Figma, and the desktop one is dashed. Both are built dashed, matching desktop and the brief ("dashed resume drop zone"). | deliberate (question 4) |

### Effects (glass, blur, shadow)
| Difference | Status |
| --- | --- |
| No glass. Header, cards, form panel and overlay are now `hom/glass` with Figma's background blur. CSS blur is half Figma's value: 24 → 12px, 20 → 10px, 32 → 16px, backdrop 14 → 7px. | fixed |
| `hom/glass` is #fff at 100% in Figma, so the glass is opaque and its blur can't show. Built as drawn, so the header is solid white rather than the translucent header the brief describes (question 1). | as drawn |
| Shadows: cards 0 12 40 Ink 6%; form 0 16 48 6% (mobile 0 12 32 6%); overlay 0 24 64 16%. | fixed |
| Overlay backdrop now matches Figma: #000 at 45% with a background blur (solid white behind the mobile sheet). | fixed |
| `prefers-reduced-transparency` falls back to solid white with no blur. | fixed |
| The colour fields were first drawn with `filter: blur()` (σ up to 152px), which cost about 1.8s of render delay on mobile (Lighthouse performance 75). They are now radial gradients with the exact profile of a Gaussian-blurred disc. Measured against the blurred version they differ by at most 3 of 255 levels, and performance is back to 97 to 98. | fixed |
| Figma's drop shadows look flatter beneath cards than CSS box-shadow with the same values, because Figma's render includes the colour field under the card. Same values used. | browser |

### Images
| Difference | Status |
| --- | --- |
| Every illustration slot was an empty placeholder. All 16 light illustrations are exported from the Figma image fills (frame `169:1107`) at native resolution (2× or more for every slot), as WebP in `public/illustrations/`. They use `object-fit: cover` with the frame's aspect ratio and `mix-blend-mode: multiply`. | fixed |
| A stacking context (`z-index` on the section content) cut the multiply blend off from the colour fields, so the hero door showed as a white box. Removed. | fixed |
| `download_assets` and direct image URLs couldn't be reached from the build container (the network policy blocks figma.com). So each image fill was rendered at native size on a temporary off-canvas node, exported through the Figma MCP screenshot tool, and the temporary nodes were deleted. Pixels are the same; only the route differs. | deliberate |

### Copy
| Difference | Status |
| --- | --- |
| Checked every string in `docs/figma-spec.md` section 5 against the build. They match word for word, including line breaks. Neither Figma nor the build has an em dash. | fixed |
| The wordmark was Bone (`#F2EDE4`). It is now Ink. | fixed |
| Earliest start date showed the browser's native date control ("mm/dd/yyyy" and a calendar icon). It is now a plain underlined field with Figma's "DD / MM / YYYY" hint. It accepts day, month and year separated by slashes, dots or dashes, checks that the date is real, and stores it as ISO. | fixed |
| The vacancy line ("This is a current vacancy...") above the Work in the house submit button isn't in Figma's form. The brief requires it there. | deliberate |
| In the consent line, "privacy notice" is a link (underlined). In Figma it is plain text. It has to be a working link to the privacy page. | deliberate |

### Interaction
| Difference | Status |
| --- | --- |
| Close and upload icons were text glyphs. They now use Figma's vector paths (24px close with a 12px cross at 1.5 stroke; 20px upload icon; 16px chevron at 1.5 stroke). | fixed |
| Checkbox checked: an Ink box with Figma's tick, which Figma draws in `#000` on Ink, so it is almost invisible (question 2). | as drawn |
| Outline button hover: Figma fills Ink and keeps an Ink label, which hides the label. The build fills Ink with a white label (question 3). Solid button hover is the same as its default, as drawn. | deliberate |
| Focus outline: 2px Ink with a 3px offset on everything focusable. Figma has no focus state; this is needed for WCAG 2.1 AA. | deliberate |

## 2. What remains, and why

| Item | Reason |
| --- | --- |
| Leave your name is 64px taller on desktop (3341 vs 3277) and 104px on mobile, all from the vacancy line above the submit button. | The brief requires the compliance line there and Figma doesn't have it. |
| Other sections are within 1px of Figma's frame heights. | Figma rounds each text box separately; the browser lays out sub-pixel line positions. |
| Figma's overlay backdrop is flat grey. In the build it shows the page through the blur. | The Figma overlay frames are drawn over an empty frame, not over the page. |
| The Figma confirmation frame (`145:458`) is plain white. In the build, the confirmation replaces the form in place, so the section's brass field shows faintly behind it. | The page keeps its colour fields; the confirmation isn't a separate page. |
| Small differences in text rendering and in the shadow beneath cards. | Different rasterisers. |

## 3. Questions for the designer

1. **Glass opacity.** `hom/glass` is #fff at 100%, so the header, cards and panels are opaque and the blur has no effect. Should it be translucent (for example 72%)? The brief asked for a translucent header.
2. **Checkbox tick.** The tick is `#000` on an Ink fill, so it can barely be seen. Should it be white?
3. **Outline button hover.** It fills Ink and keeps an Ink label. The build uses a white label. Is that right? And should solid buttons have a hover state?
4. **Drop zone on mobile.** It is drawn with a solid stroke, and its 130-wide text column clips "Drop your resume here". The build uses dashed, like desktop, with the text column filling the space. Is that right?
5. **Desktop Leave your name illustration.** The 420×315 slot is empty. Should the knocker show on desktop too?
6. **Card stroke.** The page uses `#000` at 10% and the component master uses Ink at 12%. Which is the source?
7. **Footer.** The desktop page frame cuts the footer off after 31px. The build shows it in full, 135 tall as the frame is sized. Is the drawn footer content final?
8. **Error state.** There is no light-theme error style. The build uses Ink Medium text and a 2px underline. Would you like a drawn version?
