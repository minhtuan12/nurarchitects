# AGENTS.md

## Working Rules

- Preserve all existing functionality that is unrelated to the requested change.
- Keep changes focused on the smallest code surface that satisfies the request.
- Prefer reusing existing models, API routes, components, and styling patterns before adding new abstractions.
- When a homepage or shared UI surface changes, verify the related public routes still render correctly.
- Use ASCII for new documentation and code unless an existing file clearly depends on other characters.

## Project Notes

- Public data should come from the existing API routes under `src/app/api/`.
- Homepage content is sourced from the `homepage`, `projects`, `news`, and `contact` API endpoints.
- Keep the architecture and editorial tone consistent with the rest of the site.

