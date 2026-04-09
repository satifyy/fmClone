import { InboxList } from "../../components/inbox-list";
import { SectionTitle } from "../../components/section-title";
import { Shell } from "../../components/shell";
import { defaultSaveId, getInbox } from "../../lib/api";

export default async function InboxPage() {
  const inbox = await getInbox();

  return (
    <Shell>
      <SectionTitle
        eyebrow="Inbox"
        title="Operational updates"
        detail="Board notes, scouting reports, medical flags, and contract pressure stay in one queue so the next action is explicit."
      />

      <InboxList initialInbox={inbox} saveId={defaultSaveId} />
    </Shell>
  );
}
