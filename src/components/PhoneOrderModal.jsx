import React, { useState } from 'react';
import { usePos } from '../context/PosContext';

export default function PhoneOrderModal({ onSave, onCancel }) {
    const [name, setName] = useState('');
    const { cartTotal } = usePos();

    const handleSave = () => {
        if (name.trim()) {
            onSave(name.trim());
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="modal-title">Save Phone Order</h2>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Customer Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        style={{
                            width: '100%',
                            padding: '16px',
                            fontSize: '1.2rem',
                            borderRadius: '8px',
                            border: '1px solid var(--panel-border)',
                            background: 'var(--bg-color)',
                            color: 'var(--text-main)'
                        }}
                        placeholder="Enter name..."
                        autoFocus
                    />
                </div>

                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center' }}>
                    Total to Pay Later: ${cartTotal.toFixed(2)}
                </div>

                <div className="modal-actions">
                    <button className="btn-secondary" onClick={onCancel}>Cancel</button>
                    <button
                        className="btn-primary"
                        onClick={handleSave}
                        disabled={!name.trim()}
                    >
                        Save Order & Print
                    </button>
                </div>
            </div>
        </div>
    );
}
