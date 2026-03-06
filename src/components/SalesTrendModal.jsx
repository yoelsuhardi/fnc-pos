import React, { useState, useMemo } from 'react';
import { usePos } from '../context/PosContext';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function SalesTrendModal({ onClose }) {
    const { historicalSales, dailyStats } = usePos();
    const [timeframe, setTimeframe] = useState('week'); // 'week' | 'month'

    // Compute charting data by merging historical with today's live stats
    const chartData = useMemo(() => {
        // Prepare today's data as a temporary node
        const todayStr = new Date().toISOString().slice(0, 10);
        let liveArchive = [...historicalSales];

        // If today is not in historical sales yet, append current daily stats
        if (!liveArchive.some(r => r.date.startsWith(todayStr))) {
            liveArchive.push({
                date: new Date().toISOString(),
                totalRevenue: dailyStats.totalRevenue,
                totalOrders: dailyStats.totalOrders,
                cashTotal: dailyStats.cashTotal,
                eftposTotal: dailyStats.eftposTotal
            });
        }

        // Sort chronologically
        liveArchive.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Filter based on timeframe
        const cutoffDate = new Date();
        if (timeframe === 'week') {
            cutoffDate.setDate(cutoffDate.getDate() - 7);
        } else {
            cutoffDate.setDate(cutoffDate.getDate() - 30);
        }

        const filtered = liveArchive.filter(record => new Date(record.date) >= cutoffDate);

        // Map for Recharts
        return filtered.map(r => {
            const d = new Date(r.date);
            const label = d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
            return {
                ...r,
                name: label,
                Revenue: r.totalRevenue
            };
        });
    }, [historicalSales, dailyStats, timeframe]);

    const aggregates = useMemo(() => {
        let totalRev = 0;
        let totalCash = 0;
        let totalEftpos = 0;
        let totalOrders = 0;

        chartData.forEach(d => {
            totalRev += d.Revenue;
            totalCash += d.cashTotal;
            totalEftpos += d.eftposTotal;
            totalOrders += d.totalOrders;
        });

        const avgOrder = totalOrders > 0 ? (totalRev / totalOrders) : 0;
        const cashPerc = totalRev > 0 ? ((totalCash / totalRev) * 100).toFixed(1) : 0;
        const eftposPerc = totalRev > 0 ? ((totalEftpos / totalRev) * 100).toFixed(1) : 0;

        return { totalRev, totalOrders, avgOrder, cashPerc, eftposPerc, totalCash, totalEftpos };
    }, [chartData]);

    return (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
            <div className="modal-content" style={{ maxWidth: '900px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--panel-border)', paddingBottom: '16px', marginBottom: '20px' }}>
                    <h2 className="modal-title" style={{ margin: 0 }}>📈 Sales Trend Report</h2>
                    <div style={{ display: 'flex', background: 'var(--panel-border)', borderRadius: '8px', padding: '4px' }}>
                        <button
                            onClick={() => setTimeframe('week')}
                            style={{
                                padding: '8px 16px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer',
                                background: timeframe === 'week' ? 'white' : 'transparent',
                                color: timeframe === 'week' ? 'var(--text-main)' : 'var(--text-muted)',
                                boxShadow: timeframe === 'week' ? 'var(--shadow-sm)' : 'none'
                            }}
                        >
                            Last 7 Days
                        </button>
                        <button
                            onClick={() => setTimeframe('month')}
                            style={{
                                padding: '8px 16px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer',
                                background: timeframe === 'month' ? 'white' : 'transparent',
                                color: timeframe === 'month' ? 'var(--text-main)' : 'var(--text-muted)',
                                boxShadow: timeframe === 'month' ? 'var(--shadow-sm)' : 'none'
                            }}
                        >
                            Last 30 Days
                        </button>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {/* KPI Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.9rem', color: '#166534', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gross Revenue</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#15803d', marginTop: '8px' }}>${aggregates.totalRev.toFixed(2)}</div>
                        </div>

                        <div style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Orders</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-main)', marginTop: '8px' }}>{aggregates.totalOrders}</div>
                        </div>

                        <div style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avg Order Value</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-main)', marginTop: '8px' }}>${aggregates.avgOrder.toFixed(2)}</div>
                        </div>

                        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.9rem', color: '#1e40af', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cash vs EFTPOS</div>
                            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '1rem', fontWeight: 'bold', color: '#1d4ed8' }}>
                                <div>C: {aggregates.cashPerc}%</div>
                                <div>E: {aggregates.eftposPerc}%</div>
                            </div>
                        </div>
                    </div>

                    {/* Chart Container */}
                    <div style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: '12px', padding: '24px', height: '400px' }}>
                        <h3 style={{ margin: '0 0 24px 0', color: 'var(--text-main)', fontSize: '1.1rem' }}>Revenue Trend</h3>

                        {chartData.length === 0 ? (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                No data available for the selected timeframe.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="85%">
                                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        tickFormatter={(value) => `$${value}`}
                                        tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        formatter={(value) => [`$${value}`, 'Revenue']}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="Revenue"
                                        stroke="var(--color-primary)"
                                        strokeWidth={3}
                                        dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, fill: '#1d4ed8' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}

                        {chartData.length === 1 && (
                            <div style={{ textAlign: 'center', color: '#f59e0b', fontSize: '0.85rem', marginTop: '12px', fontStyle: 'italic' }}>
                                Only showing today's progress. The chart will plot a line curve once multiple days are closed in Daily Close.
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-actions" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn-secondary" onClick={onClose} style={{ padding: '12px 32px', fontSize: '1.1rem' }}>Close</button>
                </div>
            </div>
        </div>
    );
}
