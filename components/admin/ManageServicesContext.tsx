"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { SlidersHorizontal } from "lucide-react";

interface ManageServicesContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const ManageServicesContext = createContext<ManageServicesContextType>({
  isOpen: false,
  openModal: () => {},
  closeModal: () => {},
});

export function ManageServicesProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <ManageServicesContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </ManageServicesContext.Provider>
  );
}

export function useManageServicesModal() {
  const context = useContext(ManageServicesContext);
  if (!context) {
    throw new Error(
      "useManageServicesModal must be used within a ManageServicesProvider"
    );
  }
  return context;
}

export function ManageServicesTrigger() {
  const { openModal } = useManageServicesModal();

  return (
    <button
      type="button"
      onClick={openModal}
      title="Open services and pricing management modal"
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/80 hover:bg-white text-deep-rose border border-rose/25 text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer hover:shadow-sm"
    >
      <SlidersHorizontal className="w-3.5 h-3.5" />
      <span>Manage Services</span>
    </button>
  );
}
