-- Mirror Clerk's profile picture URL onto the local User row so it can be
-- displayed for any assignee in the UI (not just the currently authenticated
-- user, whose imageUrl is available via Clerk's session). Nullable: existing
-- users get NULL until the next webhook update or auto-provision sync.
ALTER TABLE "User" ADD COLUMN "imageUrl" TEXT;
