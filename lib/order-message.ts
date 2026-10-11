import type { OrderDTO } from "@/types/order";
import { translations } from "./i18n/translations";

export function orderWhatsAppMessage(order: OrderDTO, locale: "en" | "ar") {
  const text = translations[locale];
  const status = { pending: text.orders.statusPending, contacted: text.orders.statusContacted, fulfilled: text.orders.statusFulfilled, cancelled: text.orders.statusCancelled }[order.status];
  return [
    `*${text.nav.brand} — ${text.orders.shareTitle}*`, "",
    `*${text.orders.customerName}:* ${order.customerName}`,
    `*${text.orders.customerPhone}:* ${order.customerPhone}`,
    `*${text.orders.wants}:* ${text.filters[order.requestedCategory]}${order.requestedListingType ? ` · ${order.requestedListingType === "sale" ? text.filters.forSale : text.filters.forRent}` : ""}`,
    `*${text.orders.status}:* ${status}`,
    ...(order.notes?.trim() ? ["", `*${text.orders.notes}*`, order.notes.trim()] : []),
    ...(order.loggedBy?.name ? ["", `${text.orders.loggedBy}: ${order.loggedBy.name}`] : []),
  ].join("\n");
}
