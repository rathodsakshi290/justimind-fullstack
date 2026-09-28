# Extra: marketing landing page

`justimind-landing.jsx` is the public marketing page (hero, features, pricing).
It's intentionally separate from `../frontend/` because a marketing page
doesn't need a backend or auth — it's meant to link out to `/login` on the
real app.

To use it: copy it into a separate small Vite project (or the same one, as
an additional unauthenticated route) with `lucide-react` installed. It uses
sample copy/stats, not real backend data — that's expected for a marketing
page.
