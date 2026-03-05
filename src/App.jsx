import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import MenuGrid from './components/MenuGrid';
import Cart from './components/Cart';
import PhoneOrderModal from './components/PhoneOrderModal';
import PaymentQueueModal from './components/PaymentQueueModal';
import EftposModal from './components/EftposModal';
import KitchenDocket from './components/KitchenDocket';
import TransactionsModal from './components/TransactionsModal';
import SettingsModal from './components/SettingsModal';
import SeasoningModal from './components/SeasoningModal';
import CustomerInvoice from './components/CustomerInvoice';
import DailyCloseModal from './components/DailyCloseModal';
import OrderTypePrompt from './components/OrderTypePrompt';
import CashTenderModal from './components/CashTenderModal';
import { usePos } from './context/PosContext';

function App() {
  const { cart, cartTotal, processWalkInPayment, savePhoneOrder } = usePos();

  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [showDailyClose, setShowDailyClose] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEftpos, setShowEftpos] = useState(false);
  const [showCashModal, setShowCashModal] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showZoomToast, setShowZoomToast] = useState(false);
  const zoomToastTimer = useRef(null);

  const clampZoom = (val) => Math.round(Math.min(Math.max(val, 0.5), 2.0) * 10) / 10;

  const applyZoom = useCallback((newZoom) => {
    setZoomLevel(clampZoom(newZoom));
    setShowZoomToast(true);
    if (zoomToastTimer.current) clearTimeout(zoomToastTimer.current);
    zoomToastTimer.current = setTimeout(() => setShowZoomToast(false), 1500);
  }, []);

  // Chrome-style keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        setZoomLevel(prev => { const next = clampZoom(prev + 0.1); applyZoom(next); return next; });
      } else if (e.key === '-') {
        e.preventDefault();
        setZoomLevel(prev => { const next = clampZoom(prev - 0.1); applyZoom(next); return next; });
      } else if (e.key === '0') {
        e.preventDefault();
        applyZoom(1.0);
      }
    };
    // Chrome-style Ctrl+scroll zoom
    const handleWheel = (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoomLevel(prev => {
        const delta = e.deltaY < 0 ? 0.1 : -0.1;
        const next = clampZoom(prev + delta);
        applyZoom(next);
        return next;
      });
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [applyZoom]);

  // Seasoning pre-checkout flow
  const [showSeasoningModal, setShowSeasoningModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [selectedSeasoning, setSelectedSeasoning] = useState(null);

  // Print customer invoice from current cart
  const handlePrintInvoice = (existingOrder = null) => {
    if (existingOrder && existingOrder.id) {
      setInvoiceOrder(existingOrder);
    } else {
      const previewOrder = {
        id: 'INVOICE',
        customerName: null,
        items: [...cart],
        total: cartTotal,
        time: new Date().toISOString(),
        seasoning: null
      };
      setInvoiceOrder(previewOrder);
    }
    setShowInvoice(true);
  };

  const handlePayEftpos = (method) => {
    setPendingAction(method);
    setShowSeasoningModal(true);
  };

  const handleSavePhoneOrderClick = () => {
    setPendingAction('phone');
    setShowSeasoningModal(true);
  };

  const handleSeasoningSelect = (seasoning) => {
    setSelectedSeasoning(seasoning);
    setShowSeasoningModal(false);

    if (pendingAction === 'cash') {
      setShowCashModal(true);
    } else if (pendingAction === 'eftpos') {
      setShowEftpos(true);
    } else if (pendingAction === 'phone') {
      setShowPhoneModal(true);
    }
    setPendingAction(null);
  };

  const handleSeasoningCancel = () => {
    setShowSeasoningModal(false);
    setPendingAction(null);
  };

  const handleWalkInEftposSuccess = () => {
    setShowEftpos(false);
    processWalkInPayment(selectedSeasoning);
  };

  const handlePhoneOrderSave = (name) => {
    setShowPhoneModal(false);
    savePhoneOrder(name, selectedSeasoning);
    setSelectedSeasoning(null);
  };

  return (
    <>
      <div className="pos-container" style={{
        zoom: zoomLevel,
        width: `${100 / zoomLevel}vw`,
        height: `${100 / zoomLevel}vh`
      }}>
        <Header
          zoomLevel={zoomLevel}
          onZoomIn={() => applyZoom(zoomLevel + 0.1)}
          onZoomOut={() => applyZoom(zoomLevel - 0.1)}
          onZoomReset={() => applyZoom(1.0)}
          openPhoneQueue={() => setShowQueueModal(true)}
          openTransactions={() => setShowTransactionsModal(true)}
          openDailyClose={() => setShowDailyClose(true)}
          openSettings={() => setShowSettings(true)}
        />

        <main className="pos-workspace">
          <MenuGrid />
          <Cart
            onPayEftpos={handlePayEftpos}
            onSavePhoneOrder={handleSavePhoneOrderClick}
            onPrintInvoice={handlePrintInvoice}
          />
        </main>
      </div>

      {/* Chrome-style zoom toast */}
      {showZoomToast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px',
          background: 'rgba(30,30,30,0.92)', color: '#fff',
          padding: '8px 18px', borderRadius: '8px',
          fontSize: '1rem', fontWeight: 'bold',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          zIndex: 99999, pointerEvents: 'none',
          animation: 'fadeInZoom 0.15s ease',
        }}>
          🔍 {Math.round(zoomLevel * 100)}%
        </div>
      )}

      {/* Hidden print specifically styled for thermal ticket */}
      <KitchenDocket />

      {/* Customer Invoice Modal */}
      {showInvoice && invoiceOrder && (
        <CustomerInvoice
          order={invoiceOrder}
          onClose={() => setShowInvoice(false)}
        />
      )}

      {/* Daily Close Modal */}
      {showDailyClose && (
        <DailyCloseModal
          onClose={() => setShowDailyClose(false)}
        />
      )}

      {/* Seasoning Pre-Checkout Modal */}
      {showSeasoningModal && (
        <SeasoningModal
          onSave={handleSeasoningSelect}
          onClose={handleSeasoningCancel}
        />
      )}

      {showPhoneModal && (
        <PhoneOrderModal
          onSave={handlePhoneOrderSave}
          onCancel={() => setShowPhoneModal(false)}
        />
      )}

      {showQueueModal && (
        <PaymentQueueModal
          onClose={() => setShowQueueModal(false)}
          onPrintReceipt={handlePrintInvoice}
        />
      )}

      {showTransactionsModal && (
        <TransactionsModal
          onClose={() => setShowTransactionsModal(false)}
          onPrintReceipt={handlePrintInvoice}
        />
      )}

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
        />
      )}

      {showCashModal && (
        <CashTenderModal
          amountDue={cartTotal}
          onSuccess={(tenderedNumeric, changeDue) => {
            setShowCashModal(false);
            processWalkInPayment(selectedSeasoning);
          }}
          onCancel={() => setShowCashModal(false)}
        />
      )}

      {showEftpos && (
        <EftposModal
          amount={cartTotal}
          onSuccess={handleWalkInEftposSuccess}
          onCancel={() => setShowEftpos(false)}
        />
      )}

      <OrderTypePrompt />
    </>
  );
}

export default App;
