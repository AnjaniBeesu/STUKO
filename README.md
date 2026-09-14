# STUKO

**Study, but make it yours.**

STUKO is an interest-first, all-in-one study workspace. The first milestone is a polished laptop-first dashboard + public profile system, intentionally shipped in black and white before themes are introduced.

## Current milestone
- Laptop-first ChatGPT-style left sidebar
- Dashboard landing page
- Personal profile card and study statistics
- Activity heatmap and streak tracking UI
- Interest-based study analytics
- Library status overview
- Recently studied list
- Dynamic public profile route at `/u/[username]`
- Responsive mobile fallback

## Product direction
The differentiator is **catering to interests**. Instead of treating studying as a generic productivity task, STUKO will eventually adapt the workspace, recommendations, organization and visual identity around what each learner actually loves.

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Next build phases
1. Google authentication + account persistence
2. Real user/profile database
3. Public profile privacy controls + wall moderation
4. Collections and study-library CRUD
5. Planner, goals and study sessions
6. Interest onboarding engine
7. Theme system
8. AI-assisted study tools and recommendation layer
