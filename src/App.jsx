import React, { useState } from 'react';
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
import { usePos } from './context/PosContext';

function App() {
  const { cart, cartTotal, processWalkInPayment, savePhoneOrder } = usePos();

  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [showDailyClose, setShowDailyClose] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEftpos, setShowEftpos] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  // Seasoning pre-checkout flow
  const [showSeasoningModal, setShowSeasoningModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [selectedSeasoning, setSelectedSeasoning] = useState(null);

  // Print customer invoice from current cart
  const handlePrintInvoice = () => {
    const previewOrder = {
      id: 'INVOICE',
      customerName: null,
      items: [...cart],
      total: cartTotal,
      time: new Date().toISOString(),
      seasoning: null
    };
    setInvoiceOrder(previewOrder);
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
      processWalkInPayment(seasoning);
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
      <div className="pos-container">
        <Header
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
        />
      )}

      {showTransactionsModal && (
        <TransactionsModal
          onClose={() => setShowTransactionsModal(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
        />
      )}

      {showEftpos && (
        <EftposModal
          amount={cartTotal}
          onSuccess={handleWalkInEftposSuccess}
          onCancel={() => setShowEftpos(false)}
        />
      )}
    </>
  );
}

export default App;
