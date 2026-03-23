import { Route, Routes } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Layout from "./components/layout/Layout";
import DashboardPage from "./pages/Dashboard";
import BookingsPage from "./pages/Bookings";
import RoomsPage from "./pages/Rooms";
import CheckInOutPage from "./pages/CheckInOut";
import BillingPage from "./pages/Billing";
import MealsPage from "./pages/Meals";
import InventoryPage from "./pages/Inventory";
import ReportsPage from "./pages/Reports";
import "./index.css";

export default function VisitorHostelModule() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="rooms" element={<RoomsPage />} />
          <Route path="checkin" element={<CheckInOutPage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="meals" element={<MealsPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>
      </Routes>
    </AppProvider>
  );
}