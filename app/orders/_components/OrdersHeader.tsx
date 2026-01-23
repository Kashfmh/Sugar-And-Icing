export default function OrdersHeader() {
    return (
        <div className="mb-8 flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-sai-charcoal font-serif">Order History</h1>
                <p className="text-gray-500 text-sm">Track past and current orders</p>
            </div>
            <div className="px-3 py-1 bg-pink-50 text-sai-pink text-xs font-bold rounded-full border border-pink-100">
                0 Active
            </div>
        </div>
    );
}
