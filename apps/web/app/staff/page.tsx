import { Shell } from "../../components/shell";
import { StaffWorkspace } from "../../components/staff-workspace";
import { defaultSaveId, getStaffDepartment } from "../../lib/api";

export default async function StaffPage() {
  const dept = await getStaffDepartment(defaultSaveId);

  if (!dept) {
    return (
      <Shell>
        <p className="text-sm text-ember">Staff data unavailable. Make sure the API is running.</p>
      </Shell>
    );
  }

  return (
    <Shell>
      <StaffWorkspace initialData={dept} saveId={defaultSaveId} />
    </Shell>
  );
}
