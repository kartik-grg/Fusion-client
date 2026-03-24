import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { api } from '../api/client';
import { getVhAccessFromRole } from '../utils/roleAccess';

const categoryApiToUi = {
  IIIT_Faculty: 'IIIT Faculty',
  IIIT_Staff: 'IIIT Staff',
  IIIT_Student: 'IIIT Student',
  Guest_Speaker: 'Guest Speaker',
  Examiner: 'External Examiner',
  Official: 'Official Visitor',
  Personal: 'Personal Guest',
  Other: 'Other',
};

const categoryUiToApi = Object.entries(categoryApiToUi).reduce((acc, [k, v]) => {
  acc[v] = k;
  return acc;
}, {});

const purposeUiToApi = {
  Academic: 'Academic',
  'Conference / Seminar': 'Conference',
  'Official Work': 'Official',
  Recruitment: 'Recruitment',
  Personal: 'Personal',
  Other: 'Other',
  Conference: 'Conference',
  Official: 'Official',
};

const billedToUiToApi = {
  Intender: 'Intender',
  Department: 'Department',
  'Project Account': 'Project',
  'Guest (Self)': 'Guest',
  Institute: 'Institute',
  Project: 'Project',
  Guest: 'Guest',
};

const billedToApiToUi = {
  Intender: 'Intender',
  Department: 'Department',
  Project: 'Project Account',
  Guest: 'Guest (Self)',
  Institute: 'Institute',
};

const paymentModeUiToApi = {
  Cash: 'Cash',
  Cheque: 'Cheque',
  'Online Transfer': 'Online',
  Online: 'Online',
  'Demand Draft': 'DD',
  DD: 'DD',
};

const paymentModeApiToUi = {
  Cash: 'Cash',
  Cheque: 'Cheque',
  Online: 'Online Transfer',
  DD: 'Demand Draft',
};

const mealTypeUiToApi = {
  Breakfast: 'Breakfast',
  Lunch: 'Lunch',
  Dinner: 'Dinner',
  'High Tea': 'High_Tea',
  High_Tea: 'High_Tea',
};

const mealTypeApiToUi = {
  Breakfast: 'Breakfast',
  Lunch: 'Lunch',
  Dinner: 'Dinner',
  High_Tea: 'High Tea',
};

const toNum = (val) => Number(val || 0);

const toUIBooking = (booking) => ({
  id: booking.booking_number || `VH-${booking.id}`,
  backendId: booking.id,
  visitor: booking.visitor_name || '',
  org: booking.visitor_organization || '',
  category: categoryApiToUi[booking.visitor_category] || booking.visitor_category || 'Other',
  checkin: booking.check_in_date,
  checkout: booking.check_out_date,
  rooms: booking.number_of_rooms || 0,
  guests: booking.number_of_guests || 0,
  purpose: booking.purpose || '',
  phone: booking.visitor_phone || '',
  email: booking.visitor_email || '',
  intender: booking.intender_name || '',
  billedTo: billedToApiToUi[booking.bill_to_be_settled_by] || booking.bill_to_be_settled_by || '',
  status: booking.status,
  remark: booking.remark || '',
  rejectionReason: booking.rejection_reason || '',
  roomAllocations: booking.room_allocations || [],
});

const toUIRoom = (room) => ({
  id: room.id,
  num: room.room_number,
  type: room.room_type,
  floor: room.floor,
  block: room.building_code || room.building_name || 'A',
  status: room.status,
  tariff: toNum(room.tariff_per_day),
  ac: Boolean(room.has_ac),
  bath: Boolean(room.has_attached_bathroom),
});

const toUIInventory = (item) => ({
  id: item.id,
  name: item.name,
  category: item.category,
  qty: toNum(item.quantity),
  usable: toNum(item.usable_quantity ?? item.quantity),
  threshold: toNum(item.threshold_quantity),
  unitCost: toNum(item.unit_cost),
  billNo: item.purchase_bill_number || '',
  purchaseDate: item.purchase_date || '',
  description: item.description || '',
});

const toUIBill = (bill) => ({
  id: bill.id,
  invoiceNo: bill.invoice_number,
  bookingId: bill.booking_number || `VH-${bill.booking}`,
  bookingBackendId: bill.booking,
  visitor: bill.visitor_name || '',
  roomCharges: toNum(bill.room_charges),
  mealCharges: toNum(bill.meal_charges),
  extraCharges: toNum(bill.extra_charges),
  discount: toNum(bill.discount),
  total: toNum(bill.total_amount),
  paid: toNum(bill.amount_paid),
  balance: toNum(bill.balance_due),
  paymentMode: paymentModeApiToUi[bill.payment_mode] || bill.payment_mode || '',
  paymentRef: bill.payment_reference || '',
  status: bill.status,
  date: bill.invoice_date || bill.created_at?.split('T')?.[0] || '',
});

const toUIMeal = (meal, bookingsById = {}) => ({
  id: meal.id,
  bookingId: bookingsById[meal.booking]?.id || `VH-${meal.booking}`,
  bookingBackendId: meal.booking,
  visitor: bookingsById[meal.booking]?.visitor || '',
  date: meal.meal_date,
  type: mealTypeApiToUi[meal.meal_type] || meal.meal_type,
  persons: toNum(meal.number_of_persons),
  rate: toNum(meal.rate_per_person),
  total: toNum(meal.total_amount),
  veg: Boolean(meal.vegetarian),
});

const toUINotification = (notif) => {
  const msg = notif.message || '';
  let type = 'info';
  if (/reject|cancel|expired|failed/i.test(msg)) type = 'danger';
  else if (/pending|forward|due|low stock/i.test(msg)) type = 'warn';
  else if (/paid|settled|success|confirmed|checked in/i.test(msg)) type = 'success';

  return {
    id: notif.id,
    type,
    message: msg,
    time: notif.created_at ? new Date(notif.created_at).toLocaleString() : '',
    read: Boolean(notif.is_read),
  };
};

// ── STATE ──────────────────────────────────────────────────────────────────
const initialState = {
  bookings:      [],
  rooms:         [],
  inventory:     [],
  bills:         [],
  meals:         [],
  notifications: [],
  loading:       true,
  error:         '',
  toasts:        [],
};

// ── REDUCER ────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {

    // BOOKINGS
    case 'ADD_BOOKING':
      return { ...state, bookings: [action.payload, ...state.bookings] };
    case 'UPDATE_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map(b => b.id === action.id ? { ...b, ...action.payload } : b),
      };
    case 'FORWARD_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map(b => b.id === action.id ? { ...b, status: 'Forwarded' } : b),
      };
    case 'CONFIRM_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map(b => b.id === action.id ? { ...b, status: 'Confirmed' } : b),
        rooms: state.rooms.map(r =>
          action.roomIds.includes(r.id) ? { ...r, status: 'Occupied' } : r
        ),
      };
    case 'REJECT_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map(b =>
          b.id === action.id ? { ...b, status: 'Rejected', rejectionReason: action.reason } : b
        ),
      };
    case 'CANCEL_BOOKING': {
      // Free rooms & create zero bill (VH-BR-015, VH-BR-016)
      const booking = state.bookings.find(b => b.id === action.id);
      const newBill = booking && !state.bills.find(bi => bi.bookingId === action.id) ? [{
        id: Date.now(),
        invoiceNo: `INV${Date.now()}`,
        bookingId: action.id,
        visitor: booking.visitor,
        roomCharges: 0, mealCharges: 0, extraCharges: 0, discount: 0,
        total: 0, paid: 0, balance: 0,
        paymentMode: '', paymentRef: '', status: 'Cancelled',
        date: new Date().toISOString().split('T')[0],
      }] : [];
      return {
        ...state,
        bookings: state.bookings.map(b =>
          b.id === action.id ? { ...b, status: 'Cancelled', rejectionReason: action.reason } : b
        ),
        rooms: state.rooms.map(r => ({ ...r, status: r.status === 'Occupied' ? 'Available' : r.status })),
        bills: [...state.bills, ...newBill],
      };
    }
    case 'CHECKIN_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map(b =>
          b.id === action.id ? { ...b, status: 'CheckedIn', actualCheckin: new Date().toISOString() } : b
        ),
      };
    case 'CHECKOUT_BOOKING': {
      // Free rooms
      return {
        ...state,
        bookings: state.bookings.map(b =>
          b.id === action.id ? { ...b, status: 'CheckedOut', actualCheckout: new Date().toISOString() } : b
        ),
        rooms: state.rooms.map(r => ({ ...r, status: r.status === 'Occupied' ? 'Available' : r.status })),
        bills: [...state.bills, action.bill],
      };
    }

    // ROOMS
    case 'UPDATE_ROOM_STATUS':
      return {
        ...state,
        rooms: state.rooms.map(r => r.id === action.id ? { ...r, status: action.status } : r),
      };

    // INVENTORY
    case 'ADD_INVENTORY_ITEM':
      return { ...state, inventory: [...state.inventory, action.payload] };
    case 'UPDATE_INVENTORY_ITEM': {
      const updated = state.inventory.map(i => i.id === action.id ? { ...i, ...action.payload } : i);
      // VH-BR-020: delete if qty === 0
      const filtered = updated.filter(i => i.qty > 0);
      return { ...state, inventory: filtered };
    }
    case 'DELETE_INVENTORY_ITEM':
      return { ...state, inventory: state.inventory.filter(i => i.id !== action.id) };

    // BILLS
    case 'ADD_BILL':
      return { ...state, bills: [...state.bills, action.payload] };
    case 'SETTLE_BILL':
      return {
        ...state,
        bills: state.bills.map(b =>
          b.id === action.id ? {
            ...b,
            paid: b.paid + action.amount,
            balance: Math.max(0, b.balance - action.amount),
            paymentMode: action.paymentMode,
            paymentRef: action.paymentRef,
            status: (b.paid + action.amount) >= b.total ? 'Paid' : 'Pending',
          } : b
        ),
      };

    // MEALS
    case 'ADD_MEAL':
      return { ...state, meals: [...state.meals, action.payload] };

    // NOTIFICATIONS
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.id ? { ...n, read: true } : n
        ),
      };
    case 'MARK_ALL_READ':
      return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) };

    // TOASTS
    case 'SHOW_TOAST':
      return { ...state, toasts: [...state.toasts, { id: Date.now(), ...action.payload }] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.id) };

    case 'SET_SERVER_DATA':
      return {
        ...state,
        bookings: action.payload.bookings,
        rooms: action.payload.rooms,
        inventory: action.payload.inventory,
        bills: action.payload.bills,
        meals: action.payload.meals,
        notifications: action.payload.notifications,
        loading: false,
        error: '',
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, loading: false, error: action.payload || 'Unable to load Visitor Hostel data.' };

    default:
      return state;
  }
}

// ── CONTEXT ────────────────────────────────────────────────────────────────
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const role = useSelector((state) => state.user.role);
  const access = getVhAccessFromRole(role);
  const [state, baseDispatch] = useReducer(reducer, initialState);

  const toast = useCallback((message, type = 'success') => {
    const id = Date.now();
    baseDispatch({ type: 'SHOW_TOAST', payload: { message, toastType: type, id } });
    setTimeout(() => baseDispatch({ type: 'REMOVE_TOAST', id }), 3500);
  }, []);

  const loadServerData = useCallback(async () => {
    baseDispatch({ type: 'SET_LOADING', payload: true });
    try {
      const canLoadOperationalData = access.isVhIncharge || access.isVhCaretaker;

      const [bookingsRaw, roomsRaw, billsRaw, inventoryRaw, notificationsRaw] = await Promise.all([
        canLoadOperationalData ? api.getAllBookings() : api.getBookings(),
        canLoadOperationalData ? api.getRooms() : Promise.resolve([]),
        canLoadOperationalData ? api.getBills() : Promise.resolve([]),
        canLoadOperationalData ? api.getInventory() : Promise.resolve([]),
        canLoadOperationalData ? api.getNotifications() : Promise.resolve([]),
      ]);

      const bookings = (bookingsRaw || []).map(toUIBooking);
      const bookingsByBackendId = bookings.reduce((acc, item) => {
        acc[item.backendId] = item;
        return acc;
      }, {});

      const meals = canLoadOperationalData
        ? (await Promise.all(
            bookings.map((booking) => api.getMeals(booking.backendId).catch(() => []))
          ))
            .flat()
            .map((meal) => toUIMeal(meal, bookingsByBackendId))
            .reduce((acc, meal) => {
              if (!acc.some((m) => m.id === meal.id)) acc.push(meal);
              return acc;
            }, [])
        : [];

      baseDispatch({
        type: 'SET_SERVER_DATA',
        payload: {
          bookings,
          rooms: (roomsRaw || []).map(toUIRoom),
          inventory: (inventoryRaw || []).map(toUIInventory),
          bills: (billsRaw || []).map(toUIBill),
          meals,
          notifications: (notificationsRaw || []).map(toUINotification),
        },
      });
    } catch (err) {
      baseDispatch({ type: 'SET_ERROR', payload: err.message });
      toast(err.message || 'Failed to load Visitor Hostel data.', 'danger');
    }
  }, [access.isVhCaretaker, access.isVhIncharge, toast]);

  useEffect(() => {
    loadServerData();
  }, [loadServerData]);

  const getBackendBookingId = useCallback((id) => {
    const booking = state.bookings.find((item) => item.id === id || item.backendId === id);
    return booking?.backendId || id;
  }, [state.bookings]);

  const dispatch = useCallback(async (action) => {
    try {
      switch (action.type) {
        case 'ADD_BOOKING': {
          const payload = action.payload || {};
          await api.createBooking({
            visitor_name: payload.visitor || '',
            visitor_category: categoryUiToApi[payload.category] || 'Other',
            visitor_phone: payload.phone || '',
            visitor_email: payload.email || '',
            visitor_organization: payload.org || '',
            check_in_date: payload.checkin,
            check_out_date: payload.checkout,
            number_of_guests: Number(payload.guests || 1),
            number_of_rooms: Number(payload.rooms || 1),
            purpose: purposeUiToApi[payload.purpose] || 'Other',
            bill_to_be_settled_by: billedToUiToApi[payload.billedTo] || 'Intender',
            preferred_room_type: payload.roomType || '',
            purpose_details: payload.remark || '',
            id_proof_type: payload.idType || '',
            id_proof_number: payload.idNo || '',
            project_number: payload.projectNo || '',
            remark: payload.remark || '',
          });
          await loadServerData();
          return;
        }

        case 'FORWARD_BOOKING':
          await api.forwardBooking({ booking_id: getBackendBookingId(action.id) });
          await loadServerData();
          return;

        case 'CONFIRM_BOOKING':
          await api.confirmBooking({
            booking_id: getBackendBookingId(action.id),
            room_ids: action.roomIds || [],
            remarks: action.remark || '',
          });
          await loadServerData();
          return;

        case 'REJECT_BOOKING':
          await api.rejectBooking({
            booking_id: getBackendBookingId(action.id),
            reason: action.reason || 'Rejected by user action.',
          });
          await loadServerData();
          return;

        case 'CANCEL_BOOKING':
          await api.cancelBooking({
            booking_id: getBackendBookingId(action.id),
            reason: action.reason || 'Cancelled by user action.',
          });
          await loadServerData();
          return;

        case 'CHECKIN_BOOKING': {
          const details = action.visitorDetails || {};
          await api.checkinBooking({
            booking_id: getBackendBookingId(action.id),
            visitor_details: [{
              full_name: details.name || '',
              phone: details.phone || '',
              id_proof_type: details.idType || '',
              id_proof_number: details.idNo || '',
              relationship_to_intender: details.relation || '',
            }],
          });
          await loadServerData();
          return;
        }

        case 'CHECKOUT_BOOKING':
          await api.checkoutBooking({
            booking_id: getBackendBookingId(action.id),
            extra_charges: Number(action.bill?.extraCharges || 0),
            discount: Number(action.bill?.discount || 0),
            inventory_usage: [],
          });
          await loadServerData();
          return;

        case 'ADD_INVENTORY_ITEM': {
          const payload = action.payload || {};
          await api.addInventory({
            name: payload.name,
            category: payload.category,
            quantity: Number(payload.qty || 0),
            usable_quantity: Number(payload.usable ?? payload.qty ?? 0),
            unit: payload.unit || 'piece',
            purchase_bill_number: payload.billNo || '',
            unit_cost: Number(payload.unitCost || 0),
            threshold_quantity: Number(payload.threshold || 0),
            description: payload.description || '',
            purchase_date: payload.purchaseDate || undefined,
          });
          await loadServerData();
          return;
        }

        case 'UPDATE_INVENTORY_ITEM': {
          const current = state.inventory.find((item) => item.id === action.id);
          if (!current) return;
          const nextQty = Number(action.payload?.qty ?? current.qty);
          const delta = nextQty - current.qty;
          if (delta === 0) return;
          await api.updateInventory({ item_id: action.id, quantity_delta: delta });
          await loadServerData();
          return;
        }

        case 'SETTLE_BILL':
          await api.settleBill({
            bill_id: action.id,
            amount: Number(action.amount || 0),
            payment_mode: paymentModeUiToApi[action.paymentMode] || 'Cash',
            reference_number: action.paymentRef || '',
            remarks: action.remarks || '',
          });
          await loadServerData();
          return;

        case 'ADD_MEAL': {
          const payload = action.payload || {};
          const bookingId = getBackendBookingId(payload.bookingId);
          await api.addMeal({
            booking: bookingId,
            meal_date: payload.date,
            meal_type: mealTypeUiToApi[payload.type] || 'Breakfast',
            number_of_persons: Number(payload.persons || 1),
            rate_per_person: Number(payload.rate || 0),
            vegetarian: Boolean(payload.veg),
            special_requirements: payload.special_requirements || '',
          });
          await loadServerData();
          return;
        }

        case 'MARK_NOTIFICATION_READ':
          await api.markNotificationRead(action.id);
          baseDispatch(action);
          return;

        case 'MARK_ALL_READ':
          await api.markAllNotificationsRead();
          baseDispatch(action);
          return;

        default:
          baseDispatch(action);
      }
    } catch (err) {
      toast(err.message || 'Action failed.', 'danger');
    }
  }, [getBackendBookingId, loadServerData, state.inventory, toast]);

  // Derived stats
  const stats = {
    totalBookings:    state.bookings.length,
    pendingCount:     state.bookings.filter(b => b.status === 'Pending').length,
    forwardedCount:   state.bookings.filter(b => b.status === 'Forwarded').length,
    confirmedCount:   state.bookings.filter(b => b.status === 'Confirmed').length,
    checkedInCount:   state.bookings.filter(b => b.status === 'CheckedIn').length,
    availableRooms:   state.rooms.filter(r => r.status === 'Available').length,
    occupiedRooms:    state.rooms.filter(r => r.status === 'Occupied').length,
    lowStockCount:    state.inventory.filter(i => i.qty < i.threshold).length,
    unreadNotifs:     state.notifications.filter(n => !n.read).length,
    pendingBills:     state.bills.filter(b => b.status === 'Pending' || b.status === 'Generated').length,
    monthlyRevenue:   state.bills.filter(b => b.status === 'Paid' || b.status === 'Locked')
                         .reduce((sum, b) => sum + b.total, 0),
  };

  return (
    <AppContext.Provider value={{ state, dispatch, toast, stats }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
