# houseofmenzura.com: Figma spec

Source: Figma file `fpm3gDDOUwOaMu07QbTH3b`, page "houseofmenzura.com" (`140:2`). Read on 2026-10-23 with `get_design_context`, `get_variable_defs`, `get_screenshot` and read-only Plugin API scripts (for exact fill and stroke opacity, effects, blend modes and auto layout, which the generated code drops). Reference renders are in `design/figma-ref/`.

This file is what the build is checked against. Values are Figma's, unrounded unless noted.

## 1. Tokens

Collection **houseofmenzura · light** (`VariableCollectionId:168:494`), mode Light:

| Variable | Value | Notes |
| --- | --- | --- |
| `hom/surface` | `#ffffff` | Page and every section background |
| `hom/surface-subtle` | `#f7f7f5` | Defined, not used on any frame |
| `hom/glass` | `#ffffff`, alpha **1** | Fill of every "glass" surface |
| `hom/text` | alias Ink `#111111` | Headings, body on white, inputs, buttons |
| `hom/text-muted` | alias Ink Muted `#5f594f` | Every small label, lead text, meta, nav |
| `hom/accent` | alias Brass `#a68a5b` | Active tab rule and bullet dots only |
| `hom/rule` | alias Ink `#111111` | Hairlines, at a paint opacity (below) |

Raw colours also used: Indigo `#1e2a44` (colour fields only), black `#000000` (card stroke, backdrop).

Spacing variables: `space/4 8 12 16 20 24 32 40 48 64`, `page/gutter-desktop` 130, `section/padding-y-desktop` 160, mobile gutter 24, mobile section padding 88. `radius/control` 2.

## 2. Type scale (text styles)

| Style | Family / weight | Size / line height / tracking | Used for |
| --- | --- | --- | --- |
| Display/XL | Cormorant Garamond Light 300 | 72 / 1.10 / -1% | Hero heading (desktop) |
| Display/L | Cormorant Garamond Light 300 | 48 / 1.15 / -0.5% | Hero heading (mobile) |
| Section/Desktop | Cormorant Garamond Light 300 | 58 / 1.08 / -1% | Section headings, role title (overlay), Thank you. |
| Section/Mobile | Cormorant Garamond Light 300 | 40 / 1.08 / -1% | Same, mobile |
| Statement/Desktop | Cormorant Garamond Light 300 | 54 / 1.16 / 0 | Two feelings |
| Statement/Mobile | Cormorant Garamond Light 300 | 32 / 1.16 / 0 | Two feelings, mobile |
| Card title/Desktop | Cormorant Garamond Regular 400 | 32 / 1.2 | Door, role card, partner title |
| Card title/Mobile | Cormorant Garamond Regular 400 | 28 / 1.2 | Partner title, mobile (door and role cards stay 32 on mobile) |
| Subheading | Cormorant Garamond Regular 400 | 24 / 1.25 | "Every member should feel two things." |
| Promise | Cormorant Garamond Italic 400 | 19 / 1.3 | I, II, step numbers 1 2 3 |
| Caption/Serif | Cormorant Garamond Italic 400 | 16 / 1.4 | Footer line |
| Lead | Inter Regular 400 | 19 / 1.6 | Hero and section leads (desktop) |
| Body/Large | Inter Regular 400 | 17 / 1.55 | Body, partner text (desktop), bullets, inputs, steps, leads on mobile |
| Body | Inter Regular 400 | 16 / 1.6 | Partner text (mobile) |
| Small | Inter Regular 400 | 14 / 1.5 | Card text, field labels, nav, checkbox label |
| Small/Strong | Inter Medium 500 | 14 / 1.4 | Hero link, tab labels, drop zone title, "Choose file" |
| Meta | Inter Regular 400 | 13 / 1.5 | Notes, counters, footer links, compliance lines |
| Label | Inter Medium 500 | 11 / 1.4 / +12% (1.32px), uppercase | Every eyebrow and group label |
| Button | Inter Medium 500 | 15 / 1.0 | Buttons |

Colour of text: headings, body on white, input text, button labels on outline buttons, `→` arrows, step text, "That he is known…", partner titles, hero link: **Ink** `#111111`. Every Label, every lead, Small text on cards, field labels, select placeholder, meta, nav links, partner descriptions, bullets, How it is measured text: **Ink Muted** `#5f594f`. No text is Brass.

Exceptions in Figma: the Back the house lead and the "Everything the house does…" paragraph are **Ink**; textarea labels ("Tell us about…", "A member's piece…", "What would you bring…", "Why this house?") are **Ink**; the drop zone title and "Choose file" are **Ink**.

## 3. Surfaces, borders, effects

| Element | Fill | Stroke | Effects | Radius |
| --- | --- | --- | --- | --- |
| Header (desktop 1440×92, mobile 390×84) | `hom/glass` #fff 100% | bottom 1px Ink @ 12% | background blur 24 | 0 |
| Door card, role card (`HoM / Card`) | #fff 100% | 1px **#000 @ 10%** (component master: Ink @ 12%) | background blur 20; drop shadow 0 12 40 0 Ink @ 6% | 12 |
| Card illustration | image, FILL, multiply | none | none | 6 |
| Form panel, desktop (640 wide) | #fff 100% | 1px Ink @ 12% | background blur 24; drop shadow 0 16 48 0 Ink @ 6% | 16 |
| Form panel, mobile (342 wide) | #fff 100% | 1px Ink @ 12% | background blur 24; drop shadow 0 12 32 0 Ink @ 6% | 14 |
| Role overlay panel (760 wide) | #fff 100% | 1px Ink @ 12% | background blur 32; drop shadow 0 24 64 0 Ink @ 16% | 16 |
| Role overlay backdrop | #000 @ 45% | none | background blur 14 | 0 |
| Role sheet, mobile (full screen) | #fff 100% | none | background blur 24 | 0 |
| Role illustration (overlay and sheet) | image, FILL, multiply | none | none | 8 |
| Section top rule (every section after the hero, and the footer) | none | top 1px Ink @ 12% | none | 0 |
| Feeling column | none | top 1px Ink @ 12% | none | 0 |
| Partner row | none | top 1px Ink @ 12%; last row also bottom 1px | none | 0 |
| Step row | none | top 1px Ink @ 12% | none | 0 |
| Role block (What you will do, What you bring, How it is measured) | none | top 1px Ink @ 12% | none | 0 |
| Tab, active | none | bottom **2px Brass** | none | 0 |
| Tab, inactive | none | bottom 1px Ink @ 12% | none | 0 |
| Text input | none | bottom 1px **Ink Muted** `#5f594f` | none | 0 |
| Select | none | bottom 1px **Ink** | none | 0 |
| Textarea box | none | 1px Ink | none | 2 |
| Drop zone | none | 1px Ink, dashed 4 4 (desktop; the mobile instance is drawn solid) | none | 2 |
| Radio, unselected / selected | none | 1px Ink / **6px** Ink (inner stroke, reads as a ring with a white centre) | none | circle |
| Checkbox, unchecked / checked | none / Ink | 1px Ink | none | 2 |
| Bullet dot | Brass | none | none | 5px circle in a 6×5 frame |
| Button, solid | Ink | none | none | 2 |
| Button, outline | none | 1px Ink | none | 2 |

**Colour fields** (ellipses, layer blur, behind content):

| Section | Ellipse | Size and position (from section top left) | Fill | Layer blur |
| --- | --- | --- | --- | --- |
| Hero, desktop | indigo | 640×640 at −160, 760 | Indigo @ 6% | 256 |
| Hero, desktop | brass | 720×720 at 760, 520 | Brass @ 10% | 288 |
| Work in the house, desktop | brass | 560×560 at −120, 420 | Brass @ 10% | 224 |
| Work in the house, desktop | indigo | 680×680 at 820, 260 | Indigo @ 6% | 272 |
| Leave your name, desktop | brass | 760×760 at 700, 200 | Brass @ 10% | 304 |
| Leave your name, desktop | indigo | 700×700 at 300, 1800 | Indigo @ 6% | 280 |
| Hero, mobile | brass | 420×420 at 120, 980 | Brass @ 10% | 168 |
| Hero, mobile | indigo | 380×380 at −160, 1500 | Indigo @ 6% | 152 |
| Work in the house, mobile | indigo | 420×420 at 120, 300 | Indigo @ 6% | 168 |
| Leave your name, mobile | brass | 420×420 at 100, 700 | Brass @ 10% | 168 |
| Leave your name, mobile | indigo | 400×400 at −140, 2200 | Indigo @ 6% | 160 |

Blur radius is always 0.4 × the ellipse size. (Leave your name desktop sizes read from the dump: 760 brass, 700 indigo; blur by the same 0.4 rule.)

**Illustrations**: every illustration is a rectangle with an image fill, scale mode FILL (CSS `object-fit: cover`, centred), layer blend **multiply**. Only the light sources (`169:1107`) are used. Exported uncropped at native size into `design/illustrations-source/` and served as WebP.

| Slot | Image | Desktop size | Mobile size |
| --- | --- | --- | --- |
| Hero | hero (928×1152) | 400×500 | 342×300 |
| Door 01 / 02 / 03 | door1 / door2 / door3 | 311×200, r6 | 292×200, r6 |
| Feeling I / II | mirror / umbrella | 558×360 | 342×228 |
| Role cards | ledger / swatch / camera | 311×200, r6 | 292×200, r6 |
| Role overlay / sheet | ledger / swatch / camera | 646×260, r8 | 342×200, r8 |
| Partners | iron / shuttle / brush / bag | 160×107, r6 | 342×200, r6 |
| Back the house | table (1536×1536) | 420×420 | 342×342 |
| Leave your name | knocker (1600×1207) | slot 420×315 has **no image** on desktop | 342×256 |
| Received | received | 480×320 | 342×228 |

## 4. Layout and spacing

All sections: white, full width, content 1180 wide at 130 gutter (desktop); 342 wide at 24 gutter (mobile). Every section after the hero has a 1px Ink @ 12% top rule.

### Header (fixed)
Desktop: padding 20 130, height 92, brand column gap 8 ("HOUSE OF" Label muted, wordmark 132×18 Ink), nav gap 40 (three links Small muted, then "Leave your name" outline button 172×51). Mobile: padding 16 24, height 84, wordmark 104 wide, only the outline button.

### Hero (`141:3`, 1440×1471)
Padding 240 top, 160 bottom. Content column gap 32. Hero top: row gap 80, items aligned to the bottom; text column 700 wide, gap 32 (Label, Display/XL, Lead muted, link); illustration 400×500. Spacer 56, so doors start 620 below content top (32 + 56 + 32). Doors row gap 24, three cards 377×451, padding 32, gap 16 (image 200 tall, number Label, title, text Small muted, arrow).
Mobile (`144:144`): padding 140 top, 88 bottom, content gap 24, illustration 342×300 after the link, doors column gap 16 with 24 top padding, cards padding 24.

### What the house gives (`141:42`, 1440×1212)
Padding 160 130, gap 64. Label, Subheading, two feelings (gap 64, each 558 wide, top rule, padding-top 32, gap 16: image 558×360, numeral Promise muted, Statement Ink), closing paragraph Body/Large Ink, 680 wide.
Mobile: padding 88 24, gap 40, feeling padding-top 24, gap 12, image 342×228, Statement/Mobile.

### Work in the house (`141:53`, 1440×1177)
Padding 160 130, gap 64. Heading gap 24 (Label, Section 900 wide, Lead muted 680 wide). Roles row gap 24, cards 377×493 (same card as doors; eyebrow "FOUNDING ROLE"). Solid button "Apply for a founding role" 225×49.
Mobile: padding 88 24, gap 40, heading gap 16, cards column gap 16, button full width.

### Work with the house (`141:76`, 1440×1403)
Padding 160 130, gap 64. Heading as above (lead 680 wide). Partner rows: padding 32 0, gap 48, image 160×107 r6, title 360 wide (Card title), text Body/Large muted fills. Rule top on each, bottom on the last. Solid button "Propose a partnership" 207×49.
Mobile: rows are columns, padding 24 0, gap 8, image 342×200, title 28, text Body 16/1.6.

### Back the house (`141:96`, 1440×771)
Padding 160 130. Row gap 80, centred: text column 680 wide, gap 40 (heading block gap 24: Label, Section, Lead **Ink**; outline button 222×51; Meta muted compliance line); illustration 420×420.
Mobile: padding 88 24, gap 40: image 342×342 first, heading gap 16, button full width (51 tall), compliance line.

### Leave your name (`142:45`, 1440×3277)
Padding 160 130. How it works 420 wide (gap 24: Label, Section, Body/Large muted, steps with 16 top padding, each row padding 20 0 gap 20 with top rule; numbers Promise muted 24 wide; empty 420×315 slot). Form panel 640 wide at x 670, padding 48, gap 48.
Form internals: tabs row 54 tall (each tab padding 16 12, label Small/Strong, active Ink + 2px Brass rule, inactive muted + 1px Ink @ 12%); note Meta muted; groups gap 32 (desktop) with Label first; fields gap 8 (label Small muted above; input row padding 12 0, text Body/Large Ink, underline); selects with a 16px chevron, 1.5px Ink stroke; Choice field gap 12, options gap 32, each option padding 12 0, radio 20, gap 12; upload field gap 8 (label, drop zone padding 20, gap 16, 20px upload icon, text column gap 4, "Choose file" Small/Strong Ink, note Meta muted); textarea field gap 8 (label Small **Ink**, box 152 tall r2, meta row Meta muted); Send group gap 24 (checkbox row gap 12, box 20 r2; solid button; Meta muted note).
Mobile (`144:825`): padding 88 24, gap 40, how-it-works gap 16, steps 8 top padding, knocker 342×256. Form panel 342 wide, padding 28 20, gap 40, r14; tabs 300 wide, each 100×74 with padding 16 4 and labels on two lines; groups gap 24.

### Footer (`142:175`, 1440×135)
White, top rule, padding 56 130. Brand row gap 24 (wordmark 132, Caption/Serif muted). Links row gap 32: "menzura.co" Meta Ink, "Privacy" Meta muted, "© 2026 Menzura" Meta muted.
Mobile (`144:955`): padding 48 24, column gap 24, wordmark 104, links gap 24.

### Role overlay (`161:494`, desktop) and sheet (`157:372`, mobile)
Overlay: backdrop over the page; panel 760 wide, 20 from the top, padding 40 56 56 56, gap 32. Top bar (Label "FOUNDING ROLE" muted, 44×44 close button with a 24px icon, 12px cross at 1.5px Ink). Illustration 646×260 r8. Heading gap 16 (Section/Desktop Ink, Lead muted). Blocks: top rule, padding-top 24, gap 14; Label muted; bullets gap 16 (Brass dot, Body/Large muted); measured text Body/Large muted. Apply block padding-top 8, gap 16: solid button "Apply for this role" 175×49, vacancy line Meta muted.
Sheet: full screen 390 wide, white, padding 20 24 24, gap 32, illustration 342×200 r8, title Section/Mobile 40, lead Body/Large 17, button full width.

### Confirmation (`145:458` desktop, `145:463` mobile)
White, padding 160 130 (mobile 88 24), gap 24: illustration 480×320 (mobile 342×228), "RECEIVED" Label muted, "Thank you." Section Ink, Lead muted 680 wide (mobile Body/Large), "You can close this page." Meta muted.

## 5. Copy (every string, exactly)

Header: `HOUSE OF` · `Work in the house` · `Work with the house` · `Back the house` · `Leave your name`

Hero: `FOUNDING ROLES  ·  PARTNERS  ·  A FIRST ROUND` (two spaces either side of each middle dot) · `A house is only as good as the people who keep it.` · `Menzura is a private house of up to 500 founders and executives, each dressed to his own measure every month. We are now choosing the first people who will look after them, work beside us and back the house.` · `See the house members join at menzura.co ↗`

Doors: `01` `Work in the house` `Founding roles for people who look after others for a living.` · `02` `Work with the house` `A small number of tailors, mills, groomers and couriers in each city.` · `03` `Back the house` `A first round, raised privately from a small circle.` · each ends `→`

What the house gives: `WHAT THE HOUSE GIVES` · `Every member should feel two things.` · `I` `That he is known, chosen and seen at his best.` · `II` `And that nothing is left to chance.` · `Everything the house does serves one of those two feelings. If giving people that is the work you are proudest of, you will find your place here. If it is not, this house is not for you.`

Work in the house: `WORK IN THE HOUSE` · `Founding roles, held once.` · `These are founding roles. Each will be held once, by the person who shapes how it is done for everyone who follows.` · cards `FOUNDING ROLE` + `The operator` `Runs the house day to day. Knows where every piece is, and fixes things before anyone notices.` / `The stylist` `Chooses what each member wears and knows him well enough that he rarely has to explain himself. Makes the call when something falls short.` / `The photographer` `Photographs members at their best, once a month, in the cities where they live and work.` · `Apply for a founding role`

Work with the house: `WORK WITH THE HOUSE` · `A small number in each city.` · `The house works with a small number of partners in each city, chosen for their standards and their discretion. Every partner signs a confidentiality agreement, and no partner is ever named.` · `Tailors` `For alterations, pressing and the morning of the occasion.` · `Cloth mills and merchants` `For the finest wools, aso-oke, damask and lace.` · `Groomers` `For the moments members are photographed.` · `Couriers` `For pieces delivered by hand, on time and without a word.` · `Propose a partnership`

Back the house: `BACK THE HOUSE` · `A first round, raised from a small circle.` · `The house is raising its first round from a small circle of people who understand what it is building. If you would like an introduction, leave your name. Every conversation happens in private.` · `Request an introduction` · `This page is not an offer to sell securities. Any investment is made only through private conversation and the documents that follow.`

Leave your name: `LEAVE YOUR NAME` · `How it works.` · `Leave your name and a few lines. Every note is read by a person. If there is a fit, the house will be in touch within a week. If there is not, we will tell you that too.` · `1` `Choose who you are below.` · `2` `Leave your details and a few lines.` · `3` `A person reads it and replies within a week.`

Form: tabs as header · `About four minutes. Every field is needed unless it says optional.` · `ABOUT YOU` `Full name` `Email` `Phone` `City and country` `LinkedIn or website` `Who introduced you? (optional)`
Work in: `THE ROLE` `Role` (placeholder `Operator, stylist or photographer`) `Current role and company` `Years in the field` (`Choose a range`) `Cities you can cover` `Languages you speak` `Earliest start date` (`DD / MM / YYYY`) `Arrangement` (`Full time, part time or contract`) `Are you authorized to work in your country?` `Yes` `No` `Portfolio link (optional for operators)` `Resume` `Drop your resume here` `PDF only, up to 5 MB` `Choose file` `Please leave out your photo, date of birth and home address.` · `IN YOUR WORDS` `Tell us about something you handled so well that nobody noticed.` `Tell us about a time you made someone feel truly recognised.` `Up to 100 words` `0 / 100` · `Send to the house` · `Read by a person within a week. Never shared outside the house.`
Work with: `THE BUSINESS` `Business name` `Category` (`Tailor, cloth, grooming or courier`) `Cities served` `What you offer` `Capacity` (`Pieces, appointments or deliveries a month`) `Years operating` (`Choose a range`) `Portfolio or website` `Contact person and their role` `Are you willing to sign a confidentiality agreement?` · `IN YOUR WORDS` `A member's piece arrives with a fault on the morning of his wedding. What do you do?` · `Send to the house` · `Read by a person within a week. Partners are never named publicly.`
Back: `YOUR INTEREST` `Firm (optional)` `Type` (`Angel, family office or strategic`) `Country of residence` `Are you an accredited investor?` `Typical cheque size` (`Choose a range`) `What would you bring beyond capital? (optional)` `Why this house? (optional)` `Optional, up to 100 words` · `Request an introduction` · securities line.
Consent: `I have read the privacy notice and agree that the house may keep these details to consider my application.`

Role overlay and sheet: `FOUNDING ROLE` · title · lead · `WHAT YOU WILL DO` · `WHAT YOU BRING` · `HOW IT IS MEASURED` · `Apply for this role` · `This is a current vacancy. We use software to organise applications and prepare a short summary of each. A person reads every application and makes every decision.` (Role bodies are in `content/roles/*`, copied from these frames.)

Confirmation: `RECEIVED` · `Thank you.` · `A person from the house will read this. If there is a fit, you will hear from us within a week. If there is not, we will tell you that too.` · `You can close this page.`

Footer: `A house of five hundred men.` · `menzura.co` · `Privacy` · `© 2026 Menzura`

No string in the frames contains an em dash.

## 6. Things in Figma that are ambiguous or cannot be built exactly as drawn

1. **Glass is opaque.** `hom/glass` is #fff at 100% with a background blur, so nothing behind it shows and the blur has no visible effect. Built as drawn (opaque white with the blur declared). If translucent glass was intended, the alpha needs setting in the variable.
2. **Checkbox checked**: the tick is drawn in black (`#000`) on an Ink fill, so it is invisible. Built as drawn would hide the tick; see `docs/fidelity.md` for what was done.
3. **Outline button hover** fills Ink but keeps an Ink label, which would make the label invisible. **Solid button hover** is identical to the default.
4. **Mobile drop zone** is drawn with a solid stroke, and its text column is fixed at 130 wide so "Drop your resume here" is clipped. Desktop is dashed.
5. **Desktop "Leave your name" illustration slot** (420×315) has no image; mobile uses the knocker.
6. **Card stroke** on page instances is `#000 @ 10%`; the component master is Ink @ 12%.
7. **Footer**: the desktop page frame (9342 tall) clips the footer (placed at 9311, 135 tall), so only 31px of it shows in the frame.
8. **Error state** of form fields lives in the shared Form field component on the Components page (Brass Light underline and message), from the dark theme. There is no light-theme error state.
9. Hidden desktop "Work with" and "Back" form frames are mis-sized (133 and 260 wide); the mobile versions and the Work in desktop form are used for their layout.
