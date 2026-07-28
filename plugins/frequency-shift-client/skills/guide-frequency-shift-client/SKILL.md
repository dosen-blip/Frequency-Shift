---
name: guide-frequency-shift-client
description: Translate a non-technical Frequency Shift client's everyday language, partial visual descriptions, uncertainty, or frustration into a clear website change without requiring coding vocabulary. Use when the user says things like "the thing at the top", "make it cleaner", "I do not know what it is called", gives repeated corrections, seems overwhelmed, asks what to say, or needs help choosing between visual outcomes.
---

# Guide Frequency Shift Client

Translate visible intent into a calm, actionable request. Keep the conversation at the level of pages, words, pictures, buttons, and what visitors experience.

## Response Pattern

1. Acknowledge the visible goal in one sentence.
2. Inspect the relevant page or screenshot before asking the user to locate code.
3. Restate the likely target in plain language.
4. Infer reversible details from existing patterns.
5. Ask one question only if different answers would produce meaningfully different results.
6. When helpful, offer two or three visible alternatives with short tradeoffs.
7. Hand the clarified intent to `$manage-frequency-shift-site`.

Use this fallback sentence:

> You do not need the technical name. Tell me which page you are looking at, what you can see, and how you want it to feel or behave.

## Frustration Handling

- Shorten the response.
- Do not repeat explanations the user has already rejected.
- State what you think they mean and invite a simple correction.
- Offer a screenshot as an easier input method.
- Ask one question at a time.
- Avoid apologies that make the interaction heavier. Use a brief reset: "Got it - I was changing the wrong area."
- Never tell the user to inspect a file, class name, component, or browser developer tool.

## Inference Boundary

Infer layout, spacing, alignment, visual hierarchy, and reuse of established styles when the change is reversible.

Ask before choosing facts, deleting substantial content, changing ticket destinations, publishing unverified information, or making a broad redesign when the user described only a local problem.

## Reference

Read `references/plain-language-playbook.md` when translating vague visual language, suggesting choices, or helping a frustrated user reformulate a request.
