import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { Package, ShoppingBag, Users, DollarSign, CloudDownload, Plus, MoreHorizontal, User, Filter, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

import { ExcelExportButton } from "./_components/ExcelExportButton";
import { DashboardCharts } from "./_components/DashboardCharts";

export default async function AdminDashboardPage() {
    const supabase = await createClient();

    // Fetch all Orders for Top Metrics and Charts
    const { data: allOrders } = await supabase
        .from("orders")
        .select("id, total_amount, status, created_at");

    // Fetch Total Products
    const { count: productsCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

    // Fetch Total Customers
    const { count: customersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

    // Perform Metrics Calculations
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let totalSales = 0; // All-time completed revenue
    let currentMonthRevenue = 0;
    let lastMonthRevenue = 0;

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData = months.map(m => ({ name: m, revenue: 0 }));

    if (allOrders) {
        allOrders.forEach(order => {
            const isCompleted = ["completed", "delivered", "paid"].includes(order.status?.toLowerCase() || "");
            if (isCompleted) {
                const amount = order.total_amount || 0;
                totalSales += amount;

                if (order.created_at) {
                    const orderDate = new Date(order.created_at);
                    if (orderDate.getFullYear() === currentYear) {
                        monthlyData[orderDate.getMonth()].revenue += amount;
                        if (orderDate.getMonth() === currentMonth) {
                            currentMonthRevenue += amount;
                        } else if (orderDate.getMonth() === currentMonth - 1 || (currentMonth === 0 && orderDate.getMonth() === 11 && orderDate.getFullYear() === currentYear - 1)) {
                            lastMonthRevenue += amount;
                        }
                    }
                }
            }
        });
    }

    const totalOrderCount = allOrders?.length || 0;

    // Calculate Monthly Revenue Trend
    const revenueGrowth = lastMonthRevenue > 0
        ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : currentMonthRevenue > 0 ? 100 : 0;

    // Top Selling Products Fetch & Map
    const { data: orderItemsData } = await supabase
        .from("order_items")
        .select(`
            quantity,
            price_at_purchase,
            product_id,
            products(name, category_id, image_url),
            orders!inner(status)
        `)
        .in("orders.status", ["paid", "completed", "delivered"]);

    const productSalesMap = new Map();
    if (orderItemsData) {
        orderItemsData.forEach((item: any) => {
            const pid = item.product_id;
            if (!productSalesMap.has(pid)) {
                productSalesMap.set(pid, { ...item.products, quantity: 0, totalAmount: 0 });
            }
            const product = productSalesMap.get(pid);
            product.quantity += (item.quantity || 0);
            product.totalAmount += (item.quantity * item.price_at_purchase) || 0;
        });
    }

    const topSellingProducts = Array.from(productSalesMap.values())
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 5);

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-sai-charcoal">Dashboard Overview</h1>
                    <p className="text-sai-gray mt-1 text-sm font-medium">Welcome back, here&apos;s what&apos;s happening at Sugar and Icing today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <ExcelExportButton
                        data={allOrders?.map(order => ({
                            OrderID: order.id || '',
                            TotalAmount: order.total_amount || 0,
                            Status: order.status || '',
                        })) || []}
                        columns={[
                            { header: "Order ID", key: "OrderID", width: 36, type: "text" },
                            { header: "Total Amount", key: "TotalAmount", width: 15, type: "currency" },
                            { header: "Status", key: "Status", width: 15, type: "text" }
                        ]}
                        filename="Dashboard_Orders_Report"
                        sheetName="Orders"
                    />
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-sai-pink rounded-lg text-sm font-semibold text-white hover:bg-[#e67fa0] transition-colors shadow-sm">
                        <Plus className="w-4 h-4" />
                        New Order
                    </button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Metric Cards */}
                {/* 1. Total Sales */}
                <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm p-6 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[13px] font-semibold text-sai-gray">Total Sales</p>
                        <MoreHorizontal className="w-5 h-5 text-neutral-400" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-serif font-bold text-sai-charcoal mb-2">{formatCurrency(totalSales)}</h3>
                        <div className="flex items-center gap-2 text-xs font-semibold">
                            <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                                <ArrowUpRight className="w-3 h-3" /> 14%
                            </span>
                            <span className="text-sai-gray">in the last month</span>
                        </div>
                    </div>
                </div>

                {/* 2. Total Order */}
                <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm p-6 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[13px] font-semibold text-sai-gray">Total Order</p>
                        <MoreHorizontal className="w-5 h-5 text-neutral-400" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-serif font-bold text-sai-charcoal mb-2">{totalOrderCount}</h3>
                        <div className="flex items-center gap-2 text-xs font-semibold">
                            <span className="flex items-center gap-1 text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">
                                <ArrowDownRight className="w-3 h-3" /> 17%
                            </span>
                            <span className="text-sai-gray">in the last month</span>
                        </div>
                    </div>
                </div>

                {/* 3. Total Revenue */}
                <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm p-6 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[13px] font-semibold text-sai-gray">Total Revenue</p>
                        <MoreHorizontal className="w-5 h-5 text-neutral-400" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-serif font-bold text-sai-charcoal mb-2">{formatCurrency(currentMonthRevenue)}</h3>
                        <div className="flex items-center gap-2 text-xs font-semibold">
                            <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full ${revenueGrowth >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'}`}>
                                {revenueGrowth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {Math.abs(revenueGrowth).toFixed(0)}%
                            </span>
                            <span className="text-sai-gray">in the last month</span>
                        </div>
                    </div>
                </div>

                {/* 4. Total Customers */}
                <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm p-6 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[13px] font-semibold text-sai-gray">Total Customer</p>
                        <MoreHorizontal className="w-5 h-5 text-neutral-400" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-serif font-bold text-sai-charcoal mb-2">{customersCount || 0}</h3>
                        <div className="flex items-center gap-2 text-xs font-semibold">
                            <span className="flex items-center gap-1 text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">
                                <ArrowDownRight className="w-3 h-3" /> 11%
                            </span>
                            <span className="text-sai-gray">in the last month</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recharts - Line Chart & Donut */}
            <DashboardCharts
                monthlyData={monthlyData}
                targetGoal={25000}
                currentRevenue={currentMonthRevenue}
            />

            {/* Top Selling Products Table */}
            <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm mt-6">
                <div className="flex items-center justify-between p-6 border-b border-neutral-100">
                    <h3 className="text-xl font-serif font-bold text-sai-charcoal">Top Selling Products</h3>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 border border-neutral-200 rounded-lg text-sm font-semibold text-sai-charcoal hover:bg-neutral-50 transition-colors">
                            <Filter className="w-4 h-4" /> Filter
                        </button>
                        <button className="px-3 py-1.5 border border-neutral-200 rounded-lg text-sm font-semibold text-sai-charcoal hover:bg-neutral-50 transition-colors">
                            See All
                        </button>
                    </div>
                </div>
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-neutral-100">
                                <th className="py-4 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" className="rounded border-neutral-300 text-sai-pink focus:ring-sai-pink" />
                                        Product Name
                                    </div>
                                </th>
                                <th className="py-4 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap">Price</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap">Category</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap">Quantity</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap">Amount</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topSellingProducts.length === 0 ? (
                                <tr><td colSpan={6} className="py-8 text-center text-sm text-sai-gray">No product data found.</td></tr>
                            ) : (
                                topSellingProducts.map((product, idx) => {
                                    const price = product.quantity > 0 ? product.totalAmount / product.quantity : 0;
                                    return (
                                        <tr key={idx} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 transition-colors">
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <input type="checkbox" className="rounded border-neutral-300 text-sai-pink focus:ring-sai-pink" />
                                                    <div className="w-10 h-10 rounded-lg bg-neutral-100 overflow-hidden flex items-center justify-center shrink-0">
                                                        {product.image_url ? (
                                                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Package className="w-4 h-4 text-neutral-400" />
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-semibold text-sai-charcoal">{product.name || "Unknown Product"}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm font-medium text-sai-charcoal whitespace-nowrap">
                                                {formatCurrency(price)}
                                            </td>
                                            <td className="py-4 px-6 text-sm font-medium text-sai-gray whitespace-nowrap capitalize">
                                                {product.category_id?.replace(/_/g, ' ') || "Uncategorized"}
                                            </td>
                                            <td className="py-4 px-6 text-sm font-semibold text-sai-charcoal whitespace-nowrap">
                                                {product.quantity}
                                            </td>
                                            <td className="py-4 px-6 text-sm font-serif font-bold text-sai-charcoal whitespace-nowrap">
                                                {formatCurrency(product.totalAmount)}
                                            </td>
                                            <td className="py-4 px-6 whitespace-nowrap text-center">
                                                <button className="text-neutral-400 hover:text-sai-charcoal transition-colors">
                                                    <MoreHorizontal className="w-5 h-5 mx-auto" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom Utility Row */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl border border-neutral-100 bg-[#FAF7F7] shadow-sm p-6 flex items-center justify-between col-span-1 lg:col-span-2">
                    <div>
                        <h4 className="text-lg font-serif font-bold text-sai-charcoal mb-0.5">Need Help?</h4>
                        <p className="text-sm font-medium text-sai-gray">Check our documentation or <a href="#" className="text-sai-charcoal underline">contact support</a>.</p>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-neutral-100 flex items-center justify-center text-sai-pink">
                        {/* Placeholder Chat Icon */}
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    </div>
                </div>

                <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm p-6 col-span-1">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-serif font-bold text-sai-charcoal">System Status</h4>
                        <div className="flex flex-col gap-1">
                            <div className="w-6 h-2 bg-neutral-200 rounded-sm"></div>
                            <div className="w-6 h-2 bg-neutral-200 rounded-sm"></div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                        <span className="text-sm font-medium text-sai-gray">All systems operational</span>
                    </div>
                </div>
            </div>

        </div>
    );
}
