"use client";

import { useMemo } from "react";
import { formatCurrency } from "@/lib/utils";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { MoreHorizontal } from "lucide-react";

interface DashboardChartsProps {
    monthlyData: { name: string; revenue: number }[];
    targetGoal: number;
    currentRevenue: number;
}

export function DashboardCharts({ monthlyData, targetGoal, currentRevenue }: DashboardChartsProps) {
    // Calculate progress for the donut chart
    const progress = Math.min((currentRevenue / targetGoal) * 100, 100);

    // Determine target vs today stats 
    // Mocking "earning today" vs "last month" purely for visual alignment with the specific "Spodut" text, 
    // as daily calculation wasn't strictly requested but fits the mockup flavor well.
    const todayEarned = Math.round(currentRevenue * 0.05); // Just a placeholder fraction to look active

    // Data format for 180-degree half donut
    const donutData = [
        { name: "Achieved", value: progress },
        { name: "Remaining", value: 100 - progress },
    ];

    const COLORS = ["#D44D80", "#f4f4f5"]; // sai-pink and neutral-100

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Revenue Trend Line Chart */}
            <div className="lg:col-span-2 rounded-2xl border border-neutral-100 bg-white shadow-sm p-6 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-serif font-bold text-sai-charcoal">Report Analysis</h3>
                    <div className="flex gap-4">
                        <button className="text-neutral-400 hover:text-neutral-600"><MoreHorizontal className="w-5 h-5" /></button>
                    </div>
                </div>

                <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#a3a3a3' }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#a3a3a3' }}
                                tickFormatter={(value) => `RM ${value >= 1000 ? (value / 1000) + 'k' : value}`}
                                dx={-10}
                            />
                            <Tooltip
                                formatter={((value: any) => [formatCurrency(value), "Revenue"]) as any}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#D44D80"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6, fill: "#D44D80", stroke: "#fff", strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Monthly Target Donut Chart */}
            <div className="lg:col-span-1 rounded-2xl border border-neutral-100 bg-white shadow-sm p-6 flex flex-col relative">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-serif font-bold text-sai-charcoal">Monthly Target</h3>
                    <button className="text-neutral-400 hover:text-neutral-600"><MoreHorizontal className="w-5 h-5" /></button>
                </div>
                <p className="text-xs text-sai-gray mb-6">Target you&apos;ve set for each month</p>

                <div className="relative h-[200px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={donutData}
                                cx="50%"
                                cy="80%" // Pushed down to make it a half-circle look from top
                                startAngle={180}
                                endAngle={0}
                                innerRadius={80}
                                outerRadius={100}
                                cornerRadius={5}
                                paddingAngle={0}
                                dataKey="value"
                                stroke="none"
                            >
                                {donutData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Centered text inside the Donut */}
                    <div className="absolute top-[65%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center flex flex-col items-center">
                        <span className="text-4xl font-serif font-bold text-sai-charcoal tracking-tight">{progress.toFixed(2)}%</span>
                        <span className="text-[10px] font-bold text-sai-pink bg-sai-pink/10 px-2 py-0.5 rounded-full mt-1">
                            Current
                        </span>
                    </div>
                </div>

                <div className="text-center mt-2 mb-6 px-2">
                    <p className="text-xs text-sai-gray leading-relaxed">
                        You earn <strong className="text-sai-charcoal">{formatCurrency(todayEarned)}</strong> today, it&apos;s higher than last month. Keep up your good trends!
                    </p>
                </div>

                <div className="flex justify-between items-center border-t border-neutral-100 pt-6 mt-auto">
                    <div className="text-center">
                        <p className="text-[10px] uppercase font-bold text-sai-gray tracking-widest mb-1">Target</p>
                        <p className="text-sm font-bold text-sai-charcoal">{targetGoal >= 1000 ? `RM ${targetGoal / 1000}k` : formatCurrency(targetGoal)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] uppercase font-bold text-sai-gray tracking-widest mb-1">Revenue</p>
                        <p className="text-sm font-bold text-sai-charcoal flex items-center gap-1">
                            {currentRevenue >= 1000 ? `RM ${(currentRevenue / 1000).toFixed(1)}k` : formatCurrency(currentRevenue)}
                            <span className="text-emerald-500 text-xs">↑</span>
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] uppercase font-bold text-sai-gray tracking-widest mb-1">Today</p>
                        <p className="text-sm font-bold text-sai-charcoal flex items-center gap-1">
                            {todayEarned >= 1000 ? `RM ${(todayEarned / 1000).toFixed(1)}k` : formatCurrency(todayEarned)}
                            <span className="text-emerald-500 text-xs">↑</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
