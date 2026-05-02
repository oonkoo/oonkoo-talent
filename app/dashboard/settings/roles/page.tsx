import { getRolesWithCounts } from "./actions";
import { RoleList } from "./role-list";

export default async function RolesPage() {
  const roles = await getRolesWithCounts();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Role Catalogue</h2>
        <p className="text-sm text-muted-foreground">
          Manage employee roles used across companies and rate configs
        </p>
      </div>
      <RoleList initialRoles={roles} />
    </div>
  );
}
