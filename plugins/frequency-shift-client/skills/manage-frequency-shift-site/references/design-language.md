# Design Translation

## Existing Identity

Frequency Shift uses a dark editorial nightlife system with black surfaces, light text, neon pink-magenta signal colour, cyan accents, restrained borders, sharp hierarchy, and purposeful motion. Preserve this identity unless the user explicitly requests a broader redesign.

## Translate the Goal

| Plain-English goal | Likely implementation checks |
| --- | --- |
| More breathing room | Local section gap, card padding, line height, content width, breakpoint crowding |
| Less boxy | Remove unnecessary panel fills or borders, simplify repeated containers, soften grouping through spacing |
| More dramatic | Scale hierarchy, stronger crop, controlled contrast, quieter surrounding elements |
| Cleaner | Reduce competition, align edges, consolidate repeated labels, clarify order |
| Easier to digest | Shorter line length, stronger headings, grouped facts, fewer simultaneous accents |
| Make the button obvious | Position in reading order, contrast, label clarity, touch size |
| Too much empty space | Check section minimum heights, margins, missing media, and phone-specific rules |
| Too crowded on phone | Stack deliberately, reduce nonessential repetition, adjust type and gaps, keep touch targets |
| Photo is cut off | Inspect `object-fit`, `object-position`, container ratio, responsive sources, focal point |
| Match another section | Reuse its component or token pattern rather than copying declarations |

## Internal Decision Order

1. Confirm the visible target.
2. Inspect the existing component and CSS rules.
3. Decide whether the problem is content density, hierarchy, spacing, layout, or crop.
4. Prefer a local reusable rule.
5. Test content extremes and both screen sizes.
6. Confirm keyboard focus and reduced motion.

## Avoid Brittle Fixes

- Do not use absolute positioning for normal page flow.
- Do not use negative margins to compensate for an unidentified spacing source.
- Do not add arbitrary one-off colours when a token exists.
- Do not shrink important text to make a flawed layout fit.
- Do not hide required content on phones as the first solution.
- Do not stretch images.
- Do not clone a component when a prop or shared pattern can express the variation cleanly.

## Visual Verification

Check at approximately:

- 390px wide for a common phone
- 768px wide for the transition range
- 1440px wide for a computer

Inspect the full route, not only the edited crop. Look for overflow, awkward wrapping, lost hierarchy, accidental blank space, hover-only meaning, and motion that obscures content.
