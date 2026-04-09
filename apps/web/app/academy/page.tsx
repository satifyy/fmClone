import { Shell } from "../../components/shell";
import { YouthWorkspace } from "../../components/youth-workspace";
import { defaultSaveId, getYouthAcademy } from "../../lib/api";

export default async function AcademyPage() {
  const academy = await getYouthAcademy(defaultSaveId);

  if (!academy) {
    return (
      <Shell>
        <p className="text-sm text-ember">Academy data unavailable. Make sure the API is running.</p>
      </Shell>
    );
  }

  return (
    <Shell>
      <YouthWorkspace initialData={academy} saveId={defaultSaveId} />
    </Shell>
  );
}
