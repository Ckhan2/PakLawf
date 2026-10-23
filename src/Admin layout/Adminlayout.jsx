import { Outlet, Navigate, Link } from "react-router-dom";
import { Plus } from "lucide-react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const AdminLayout = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex h-screen bg-[#0f172a] overflow-hidden">
      <div className="w-72 hidden lg:block border-r border-gray-800 bg-[#111827]">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b] p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Pak Law Book Admin</h1>
              <p className="text-gray-400 text-sm mt-1">
                Manage books, orders and publications
              </p>
            </div>

            <Link
              to="/admin/add-product"
              className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold px-5 py-3 rounded-2xl transition shadow-lg"
            >
              <Plus size={18} />
              Add New Product
            </Link>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl min-h-[400px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
