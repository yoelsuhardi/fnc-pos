import React, { useEffect } from 'react';
import { usePos } from '../context/PosContext';

const isElectron = typeof window !== 'undefined' && window.process?.type === 'renderer';

export default function CustomerInvoice({ order, onClose }) {
    const { isPreviewEnabled, selectedPrinter } = usePos();

    const triggerInvoicePrint = () => {
        document.body.classList.add('printing-invoice');
        if (isElectron) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.send('silent-print', { isPreview: isPreviewEnabled, printerName: selectedPrinter });
            setTimeout(() => document.body.classList.remove('printing-invoice'), 2000);
        } else {
            window.print();
            document.body.classList.remove('printing-invoice');
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            triggerInvoicePrint();
        }, isPreviewEnabled ? 900 : 300);
        return () => clearTimeout(timer);
    }, []);

    if (!order) return null;

    const time = new Date(order.time || order.paidTime);
    const dateStr = time.toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = time.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });

    // Build invoice line items — expand complex items into subitems
    const lineItems = [];
    order.items.forEach(item => {
        if (item.subItems && item.subItems.length > 0) {
            lineItems.push({ label: item.name, price: item.price, isHeader: true });
            item.subItems.forEach(sub => {
                lineItems.push({ label: `  · ${sub.qty > 1 ? sub.qty + 'x ' : ''}${sub.name}`, price: null });
            });
        } else {
            let label = item.label || item.name;
            if (item.modifier) label = `${item.name} (${item.modifier.name})`;
            lineItems.push({ label, price: item.price });
        }
    });

    return (
        <>
            {/* ── Screen overlay with close button ── */}
            <div className="modal-overlay" style={{ zIndex: 9999 }}>
                <div style={{
                    background: 'white',
                    color: '#000',
                    padding: '32px',
                    borderRadius: '12px',
                    width: '360px',
                    fontFamily: "'Courier New', Courier, monospace",
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    position: 'relative'
                }}>
                    {/* Close — screen only */}
                    <button
                        onClick={onClose}
                        className="no-print"
                        style={{
                            position: 'absolute', top: '12px', right: '12px',
                            background: 'none', border: 'none', fontSize: '1.4rem',
                            cursor: 'pointer', color: '#333', zIndex: 1
                        }}
                    >✕</button>

                    {/* Invoice content — this is what gets printed */}
                    <div id="customer-invoice-content">
                        {/* Header */}
                        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', letterSpacing: '2px' }}>FNC POS</div>
                            <div style={{ fontSize: '0.85rem', color: '#555' }}>PERTH</div>
                            <div style={{ borderTop: '1px dashed #999', margin: '10px 0' }} />
                            {order.id !== 'INVOICE' && (
                                <div style={{ fontSize: '0.85rem' }}>Order #{order.id}</div>
                            )}
                            <div style={{ fontSize: '0.85rem' }}>{dateStr}  {timeStr}</div>
                            {order.customerName && order.customerName !== 'Walk-in' && (
                                <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Name: {order.customerName}</div>
                            )}
                            {order.seasoning && (
                                <div style={{ fontSize: '0.85rem' }}>Seasoning: {order.seasoning.name}</div>
                            )}
                            <div style={{ borderTop: '1px dashed #999', margin: '10px 0' }} />
                        </div>

                        {/* Line items */}
                        <div style={{ fontSize: '0.9rem', marginBottom: '12px' }}>
                            {lineItems.map((line, idx) => (
                                <div key={idx} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '4px',
                                    fontWeight: line.isHeader ? 'bold' : 'normal',
                                }}>
                                    <span style={{ flex: 1, paddingRight: '8px' }}>{line.label}</span>
                                    <span>{line.price != null ? `$${line.price.toFixed(2)}` : ''}</span>
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div style={{ borderTop: '2px solid #000', paddingTop: '10px', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                            <span>TOTAL</span>
                            <span>${order.total?.toFixed(2)}</span>
                        </div>

                        {/* Footer */}
                        <div style={{ borderTop: '1px dashed #999', marginTop: '16px', paddingTop: '10px', textAlign: 'center', fontSize: '0.8rem', color: '#555' }}>
                            <div>Thank you for your visit!</div>
                            <div>Please come again 🐟</div>
                        </div>
                    </div>

                    {/* Reprint button — screen only */}
                    <button
                        onClick={triggerInvoicePrint}
                        className="no-print"
                        style={{
                            marginTop: '20px',
                            width: '100%',
                            padding: '12px',
                            background: '#222',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            cursor: 'pointer'
                        }}
                    >
                        🖨️ Reprint Invoice
                    </button>
                </div>
            </div>
        </>
    );
}
