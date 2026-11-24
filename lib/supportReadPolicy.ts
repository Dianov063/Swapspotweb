/** Server-side administrator/report reads. Legacy rollback keeps its existing table. */
export function supportMessagesReadTable(backend = process.env.SWAPSPOT_BACKEND) {
  return backend === "appplatform" ? "support_admin_visible_messages" : "support_messages";
}
