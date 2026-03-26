import { useMemo } from 'react';
import { useSelector } from 'react-redux';

const normalizeRole = (role = '') =>
  String(role)
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');

const isVhInchargeRole = (role) => {
  const normalized = normalizeRole(role);
  return (
    normalized === 'vhincharge' ||
    normalized === 'visitorhostelincharge' ||
    normalized === 'hostelincharge'
  );
};

const isVhCaretakerRole = (role) => {
  const normalized = normalizeRole(role);
  return (
    normalized === 'vhcaretaker' ||
    normalized === 'visitorhostelcaretaker' ||
    normalized === 'hostelcaretaker' ||
    normalized === 'caretaker'
  );
};

const isStudentRole = (role) => normalizeRole(role) === 'student';

export const getVhAccessFromRole = (role) => {
  const incharge = isVhInchargeRole(role);
  const caretaker = isVhCaretakerRole(role);
  const student = isStudentRole(role);
  const hasAccess = incharge || caretaker || student;

  return {
    role,
    hasAccess,
    isVhIncharge: incharge,
    isVhCaretaker: caretaker,
    isStudent: student,
    canViewDashboard: incharge || caretaker,
    canViewBookings: hasAccess,
    canViewRooms: incharge || caretaker,
    canViewCheckInOut: caretaker,
    canViewMeals: caretaker,
    canViewBilling: incharge || caretaker,
    canViewInventory: incharge || caretaker,
    canViewReports: incharge,
    canCreateBooking: caretaker || student,
    canModifyOwnPendingBooking: student,
    canForwardBooking: caretaker,
    canRejectPendingBooking: caretaker,
    canCancelBooking: student,
    canApproveCancellation: caretaker,
    canApproveBooking: incharge,
    canRejectBooking: incharge,
    canCheckinCheckout: caretaker,
    canSettleBill: caretaker,
    canAddInventoryItem: incharge,
    canManageInventory: incharge || caretaker,
    canRequestInventoryIncrease: caretaker,
    canReviewInventoryIncreaseRequests: incharge,
    canRecordMeals: caretaker,
    canManageRoomStatus: hasAccess,
  };
};

export const useVhAccess = () => {
  const role = useSelector((state) => state.user.role);
  return useMemo(() => getVhAccessFromRole(role), [role]);
};

export const getAllowedSectionTabs = (access) => {
  const allTabs = [
    { key: 'dashboard', title: 'Dashboard', path: '/visitor_hostel', canView: access.canViewDashboard },
    { key: 'bookings', title: 'Bookings', path: '/visitor_hostel/bookings', canView: access.canViewBookings },
    { key: 'rooms', title: 'Rooms', path: '/visitor_hostel/rooms', canView: access.canViewRooms },
    { key: 'checkin', title: 'Check-In / Check-Out', path: '/visitor_hostel/checkin', canView: access.canViewCheckInOut },
    { key: 'billing', title: 'Billing', path: '/visitor_hostel/billing', canView: access.canViewBilling },
    { key: 'meals', title: 'Meals', path: '/visitor_hostel/meals', canView: access.canViewMeals },
    { key: 'inventory', title: 'Inventory', path: '/visitor_hostel/inventory', canView: access.canViewInventory },
    { key: 'reports', title: 'Reports', path: '/visitor_hostel/reports', canView: access.canViewReports },
  ];

  return allTabs.filter((tab) => tab.canView).map(({ canView, ...tab }) => tab);
};
