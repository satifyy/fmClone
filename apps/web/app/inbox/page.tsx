import { InboxList } from "../../components/inbox-list";
import { SectionTitle } from "../../components/section-title";
import { Shell } from "../../components/shell";
import { defaultSaveId, getInbox, getMentionTargets } from "../../lib/api";

export default async function InboxPage() {
  const [inbox, mentionTargets] = await Promise.all([getInbox(), getMentionTargets()]);

  return (
    <Shell>
      <SectionTitle
        eyebrow="Inbox"
        title="Operational updates"
        detail="Board notes, scouting reports, medical flags, and contract pressure stay in one queue so the next action is explicit."
      />

      <InboxList initialInbox={inbox} saveId={defaultSaveId} mentionTargets={mentionTargets} />
    </Shell>
  );
}
