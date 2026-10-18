/** Public display metadata only. No owner, customer, request, or credential data. */
export type PublicMenuControl = { id: string; available: boolean; order: number; version: number };
export function menuControlAttributes(control?: PublicMenuControl) {
  return control ? {
    "data-menu-control-id": control.id,
    "data-menu-available": String(control.available),
    "data-menu-order": control.order,
    "data-menu-version": control.version,
  } : {};
}
export type MenuReadbackAttributes = { source: string; mode: string; manifest: string; version?: number; deploymentCommit?: string };
