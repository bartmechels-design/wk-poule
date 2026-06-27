# WK Poule 2026 — Project Guidelines

## Critical: Permission Checks Must Include Collaborators

**This is the #1 lesson learned.** Never use owner-only permission checks for group-based features.

### The Pattern (copy this exactly)

```typescript
// Always fetch with: include: { teachers: true }
const group = await db.group.findUnique({
  where: { id },
  include: { teachers: true }  // ← REQUIRED
});

// Then check BOTH conditions:
const isOwner = group.teacherId === session.user.id;
const isCollaborator = group.teachers.some(t => t.teacherId === session.user.id);

if (!isOwner && !isCollaborator) {
  return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
}
```

### Where This Applies

- **Pages**: All group management pages (`/dashboard/groep/[id]`, etc.)
- **API routes**: All endpoints modifying group data
- **Components**: Any form or action tied to group resources

### Why This Exists

In May 2026, a regression caused collaborators (teachers invited to manage a group) to be completely locked out of the group management page. The page only checked `teacherId === session.user.id`, preventing collaborators from even viewing the form to add students. This must never happen again.

## Deployment

Always deploy with: `npx vercel --prod`

## Skills

Load Papiamento skills before rendering any Papiamento content.
