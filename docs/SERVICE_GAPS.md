# Service gaps: what the UI cannot fix from here

Things the Tapis services do (or refuse to do) that shape the UI and cannot be
worked around client-side. Each entry says how it was verified, because the
whole value of this list is that nobody re-derives it by guessing.

When a gap is closed upstream, delete its entry. When you find a new one, add
it here rather than leaving the knowledge in a code comment nobody greps for.

---

## Jobs

### Hidden jobs are unreachable by any query

`PUT /jobs/{uuid}/hide` removes a job from `GET /jobs/list` **and** from
`POST /jobs/search`. There is no `showHidden` flag, and a search for
`visible.eq.false` returns nothing rather than the hidden set.

*Verified against the develop tenant with a hidden job on the
account: both endpoints returned it before hiding and neither after.*

**Consequence.** A hidden job is reachable only by its own URL. No listing,
no search, and no nav can offer it back. This is unlike the soft delete on
systems and apps, which have a separate listing (`showDeleted`) that the navs
already ride.

**What the UI does about it.** `JobLifecyclePanel` is the only way to unhide,
its confirm says so before you hide, and `NavSearchScope` repeats it in the
nav while a search is in the box. If the service ever grows a `showHidden`
listing, all three can be simplified and the jobs nav can carry hidden rows
the way the systems nav carries deleted ones.

### There is no delete

The Jobs spec has no `DELETE /jobs/{uuid}` and no undelete. The only delete
verbs in the whole service are for subscriptions and shares. Hide is the
nearest thing, and unlike a soft delete it destroys nothing.

*Verified by reading the spec, not by calling it.*

### Sharing is per-part, and revoke is not

A job is shared in parts (`JOB_OUTPUT`, `JOB_HISTORY`, `JOB_INPUT`,
`JOB_RESUBMIT_REQUEST`) with a single `READ` permission. The service can grant
one part at a time but can only revoke **all** parts for a user.

**Consequence.** The shared `SharingModal` explainer does not apply to jobs at
all: it describes sharing and permissions as two doors, and a job has only the
one. `JobAccessPanel` carries its own per-part hints instead, and says the
revoke asymmetry on the press rather than surprising anyone with it.

---

## Systems

### A deleted system's detail read stops answering

`GET /systems/{id}` will not return a deleted system, so its page renders from
the deleted listing (`useDeletedList`) instead. That is why `DeletedRecordStrip`
exists and why a deleted page shuts most of its doors: they would be refused.

### undelete tells no caches

`useUndeleteSystem` has no `onSuccess` invalidation of its own (unlike
`useEnableSystem` and `useDisableSystem`, which patch the cached record and then
invalidate). Every caller has to invalidate `details`, `list` and `listWindow`
itself, and the ones that forgot left a restored system reading as deleted until
a hard reload. `SystemLifecyclePanel` and the toolbar's `UndeleteSystemModal`
both do it by hand.

**This one is ours to fix**, not the service's: the invalidation belongs in the
hook. Listed here because the asymmetry between the four lifecycle hooks is the
kind of thing that reads as deliberate when it is not.

