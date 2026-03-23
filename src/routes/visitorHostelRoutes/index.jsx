import { host } from "../globalRoutes";

export const visitorHostelApiBase = `${host}/api/visitorhostel`;

export const vhGetBookingsRoute = `${visitorHostelApiBase}/bookings/`;
export const vhCreateBookingRoute = `${visitorHostelApiBase}/bookings/`;
export const vhForwardBookingRoute = `${visitorHostelApiBase}/bookings/forward/`;
export const vhConfirmBookingRoute = `${visitorHostelApiBase}/bookings/confirm/`;
export const vhRejectBookingRoute = `${visitorHostelApiBase}/bookings/reject/`;
export const vhCancelBookingRoute = `${visitorHostelApiBase}/bookings/cancel/`;
export const vhCheckinBookingRoute = `${visitorHostelApiBase}/bookings/check-in/`;
export const vhCheckoutBookingRoute = `${visitorHostelApiBase}/bookings/check-out/`;

export const vhGetRoomsRoute = `${visitorHostelApiBase}/rooms/`;
export const vhRoomAvailabilityRoute = `${visitorHostelApiBase}/rooms/availability/`;

export const vhGetBillsRoute = `${visitorHostelApiBase}/bills/`;
export const vhGenerateBillRoute = `${visitorHostelApiBase}/bills/generate/`;
export const vhSettleBillRoute = `${visitorHostelApiBase}/bills/settle/`;

export const vhGetMealsRoute = `${visitorHostelApiBase}/meals/`;
export const vhAddMealRoute = `${visitorHostelApiBase}/meals/`;

export const vhGetInventoryRoute = `${visitorHostelApiBase}/inventory/`;
export const vhAddInventoryRoute = `${visitorHostelApiBase}/inventory/add/`;
export const vhUpdateInventoryRoute = `${visitorHostelApiBase}/inventory/update/`;
export const vhLowStockInventoryRoute = `${visitorHostelApiBase}/inventory/low-stock/`;

export const vhReportRoute = `${visitorHostelApiBase}/reports/`;
export const vhDashboardRoute = `${visitorHostelApiBase}/dashboard/`;