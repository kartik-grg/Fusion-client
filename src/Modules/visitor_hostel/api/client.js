import { visitorHostelApiBase } from '../../../routes/visitorHostelRoutes';

const BASE_URL =
  import.meta.env.VITE_VISITOR_HOSTEL_API_URL ||
  import.meta.env.REACT_APP_VISITOR_HOSTEL_API_URL ||
  visitorHostelApiBase;

const buildHeaders = () => {
  const token = localStorage.getItem('authToken');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Token ${token}`;
  return headers;
};

const request = async (path, options = {}) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...buildHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body?.error || body?.detail || JSON.stringify(body);
    } catch {
      // Keep fallback message when response is not JSON.
    }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
};

const get = (path) => request(path, { method: 'GET' });
const post = (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) });
const patch = (path, data) => request(path, { method: 'PATCH', body: JSON.stringify(data) });

export const api = {
  // Bookings
  getBookings:       ()       => get('/bookings/'),
  getAllBookings:    ()       => get('/bookings/all/'),
  getBooking:        (id)     => get(`/bookings/${id}/`),
  createBooking:     (data)   => post('/bookings/', data),
  forwardBooking:    (data)   => post('/bookings/forward/', data),
  confirmBooking:    (data)   => post('/bookings/confirm/', data),
  rejectBooking:     (data)   => post('/bookings/reject/', data),
  cancelBooking:     (data)   => post('/bookings/cancel/', data),
  checkinBooking:    (data)   => post('/bookings/check-in/', data),
  checkoutBooking:   (data)   => post('/bookings/check-out/', data),

  // Rooms
  getRooms:          ()       => get('/rooms/'),
  checkAvailability: (params) => get(`/rooms/availability/?check_in_date=${params.checkin}&check_out_date=${params.checkout}`),

  // Billing
  getBills:          ()       => get('/bills/'),
  generateBill:      (data)   => post('/bills/generate/', data),
  settleBill:        (data)   => post('/bills/settle/', data),

  // Meals
  getMeals:          (bookingId) => get(`/meals/?booking_id=${bookingId}`),
  addMeal:           (data)   => post('/meals/', data),

  // Inventory
  getInventory:      ()       => get('/inventory/'),
  addInventory:      (data)   => post('/inventory/add/', data),
  updateInventory:   (data)   => patch('/inventory/update/', data),
  getLowStock:       ()       => get('/inventory/low-stock/'),

  // Notifications
  getNotifications:  ()       => get('/notifications/'),
  markNotificationRead: (id)  => patch(`/notifications/${id}/`, {}),
  markAllNotificationsRead: () => patch('/notifications/', {}),

  // Reports
  getReport:         (params) => get(`/reports/?start_date=${params.from}&end_date=${params.to}`),

  // Dashboard
  getDashboard:      ()       => get('/dashboard/'),
};
