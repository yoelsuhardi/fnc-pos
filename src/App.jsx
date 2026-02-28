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
import { usePos } from './context/PosContext';

function App() {
  const { cartTotal, processWalkInPayment, savePhoneOrder } = usePos();

  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEftpos, setShowEftpos] = useState(false);

  // Seasoning pre-checkout flow
  const [showSeasoningModal, setShowSeasoningModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'cash' | 'eftpos' | 'phone'
  const [selectedSeasoning, setSelectedSeasoning] = useState(null);

  // Called when CASH/EFTPOS/Phone buttons clicked — show seasoning first
  const handlePayEftpos = (method) => {
    setPendingAction(method);
    setShowSeasoningModal(true);
  };

  const handleSavePhoneOrderClick = () => {
    setPendingAction('phone');
    setShowSeasoningModal(true);
  };

  // After seasoning is chosen, continue with the original action
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

  // Eftpos modal callbacks
  const handleWalkInEftposSuccess = () => {
    setShowEftpos(false);
    processWalkInPayment(selectedSeasoning);
  };

  // Phone modal callback
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
          openSettings={() => setShowSettings(true)}
        />

        <main className="pos-workspace">
          <MenuGrid />
          <Cart
            onPayEftpos={handlePayEftpos}
            onSavePhoneOrder={handleSavePhoneOrderClick}
          />
        </main>
      </div>

      {/* Hidden print specifically styled for thermal ticket */}
      <KitchenDocket />

      {/* Seasoning Pre-Checkout Modal */}
      {showSeasoningModal && (
        <SeasoningModal
          onSave={handleSeasoningSelect}
          onClose={handleSeasoningCancel}
        />
      )}

      {/* Modals */}
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
