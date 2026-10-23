import { useGetOrdersQuery } from "../store/hooks";

const formatAddress = (address) => {
  if (!address) return "";
  if (typeof address === "string") return address;

  return [
    address.street,
    address.city,
    address.state,
    address.zipcode,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
};

const normalizeOrder = (order) => {
  const address = order.address || {};
  const customerName =
    order.customerName ||
    [address.firstName, address.lastName].filter(Boolean).join(" ") ||
    order.user?.name ||
    "Customer";

  return {
    id: order._id || order.id || order.date || order.createdAt,
    createdAt: order.date || order.createdAt || new Date().toISOString(),
    customerName,
    email: order.email || address.email || order.user?.email || "",
    phone: order.phone || address.phone || "",
    productName:
      order.productName ||
      order.items?.map((item) => item.name || item.title).join(", ") ||
      "Order items",
    quantity:
      order.quantity ||
      order.items?.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0) ||
      1,
    address: formatAddress(address) || order.deliveryAddress || "",
    total: order.amount ?? order.total ?? 0,
    paymentMethod: order.payment ? "Paid" : order.paymentMethod || "Cash on Delivery",
    status: order.status || "pending",
  };
};

const Orderlist = () => {
  const { data: apiOrders = [], isLoading, isError, refetch, isFetching } = useGetOrdersQuery();
  const orders = apiOrders.map(normalizeOrder);

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Order List</h2>
          <p className="text-sm text-gray-400 mt-1">
            Loaded from <code>/api/order/list</code> · {orders.length} orders
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm"
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {isLoading && <p className="text-gray-500 mt-2">Loading orders from API...</p>}

      {isError && (
        <p className="text-red-400 mt-2 text-sm">
          Failed to load orders from API. Check that the backend is running.
        </p>
      )}

      {!isLoading && orders.length === 0 ? (
        <p className="text-gray-600 mt-2">No orders available yet.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-gray-700 rounded-2xl p-4 bg-slate-950">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-400">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <h3 className="text-lg font-semibold text-white">{order.customerName}</h3>
                  <p className="text-sm text-gray-300">
                    {order.email} · {order.phone}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">
                    Total: Rs. {Number(order.total || 0).toLocaleString("en-IN")}
                  </p>
                  <p className="text-sm text-green-400">{order.paymentMethod}</p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-300">
                <p>
                  <span className="font-semibold">Product:</span> {order.productName}
                </p>
                <p>
                  <span className="font-semibold">Qty:</span> {order.quantity}
                </p>
                <p className="sm:col-span-2">
                  <span className="font-semibold">Address:</span> {order.address}
                </p>
              </div>

              <div className="mt-4">
                <span
                  className={`text-xs font-semibold uppercase px-3 py-1 rounded-full ${
                    order.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orderlist;
