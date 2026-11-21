"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Plus,
  Trash2,
  GripVertical,
  Clock,
  Sparkles,
  Check,
  AlertTriangle,
  Loader2,
  Info,
  Save,
  RotateCcw,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CURRENCY } from "@/lib/currency";
import { revalidateServicesCache } from "@/app/actions/services";

export interface ServiceRow {
  id: string;
  name: string;
  price: number;
  duration_min: number;
  active: boolean;
  position: number;
  isNew?: boolean;
}

interface DeleteDialogState {
  isOpen: boolean;
  service: ServiceRow | null;
  mode: "confirm_delete" | "deactivate_explanation";
  isChecking: boolean;
  isProcessing: boolean;
}

interface ServicesManagerProps {
  initialServices: ServiceRow[];
}

export default function ServicesManager({ initialServices }: ServicesManagerProps) {
  const [services, setServices] = useState<ServiceRow[]>(initialServices);
  const [originalServices, setOriginalServices] = useState<ServiceRow[]>(
    JSON.parse(JSON.stringify(initialServices))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Validation errors map: { [serviceId]: { name?: boolean; price?: boolean; duration?: boolean } }
  const [errors, setErrors] = useState<
    Record<string, { name?: boolean; price?: boolean; duration?: boolean }>
  >({});

  // Delete / Deactivate dialog state
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    isOpen: false,
    service: null,
    mode: "confirm_delete",
    isChecking: false,
    isProcessing: false,
  });

  const showToast = (type: "success" | "error" | "info", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const hasChanges = JSON.stringify(services) !== JSON.stringify(originalServices);

  // ── Handle Field Change ──
  const handleFieldChange = (
    id: string,
    field: keyof ServiceRow,
    value: string | number | boolean
  ) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );

    // Clear error for field if fixed
    setErrors((prev) => {
      const rowErr = { ...(prev[id] || {}) };
      if (field === "name" && String(value).trim().length > 0) rowErr.name = false;
      if (field === "price" && Number(value) >= 0) rowErr.price = false;
      if (field === "duration_min" && Number(value) > 0) rowErr.duration = false;
      return { ...prev, [id]: rowErr };
    });
  };

  // ── Toggle Active Switch ──
  const handleToggleActive = async (id: string, currentVal: boolean) => {
    const newVal = !currentVal;

    // Optimistic local update
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: newVal } : s))
    );

    const target = services.find((s) => s.id === id);
    if (target && !target.isNew) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("services")
          .update({ active: newVal })
          .eq("id", id);

        if (error) throw error;

        await revalidateServicesCache();
        showToast(
          "success",
          `"${target.name || "Service"}" is now ${newVal ? "active" : "hidden"}`
        );
      } catch (err: unknown) {
        console.error("Error updating active status:", err);
        // Rollback
        setServices((prev) =>
          prev.map((s) => (s.id === id ? { ...s, active: currentVal } : s))
        );
        showToast("error", "Failed to update service status.");
      }
    }
  };

  // ── Handle Drag Reorder ──
  const handleReorder = (newOrder: ServiceRow[]) => {
    const reindexed = newOrder.map((item, index) => ({
      ...item,
      position: index,
    }));
    setServices(reindexed);
  };

  // ── Add New Service Row ──
  const handleAddService = () => {
    const newService: ServiceRow = {
      id: crypto.randomUUID(),
      name: "",
      price: 2500,
      duration_min: 60,
      active: true,
      position: services.length,
      isNew: true,
    };
    setServices((prev) => [...prev, newService]);
  };

  // ── Reset to Last Saved State ──
  const handleReset = () => {
    setServices(JSON.parse(JSON.stringify(originalServices)));
    setErrors({});
    showToast("info", "Changes reset to saved values.");
  };

  // ── Validate All Services ──
  const validateServices = (): boolean => {
    const newErrors: Record<
      string,
      { name?: boolean; price?: boolean; duration?: boolean }
    > = {};
    let isValid = true;

    services.forEach((s) => {
      const rowErr: { name?: boolean; price?: boolean; duration?: boolean } = {};
      if (!s.name || s.name.trim().length === 0) {
        rowErr.name = true;
        isValid = false;
      }
      if (s.price == null || isNaN(s.price) || s.price < 0) {
        rowErr.price = true;
        isValid = false;
      }
      if (!s.duration_min || isNaN(s.duration_min) || s.duration_min <= 0) {
        rowErr.duration = true;
        isValid = false;
      }
      if (rowErr.name || rowErr.price || rowErr.duration) {
        newErrors[s.id] = rowErr;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // ── Save All Changes ──
  const handleSaveAll = async () => {
    if (!validateServices()) {
      showToast("error", "Please fix the highlighted errors before saving.");
      return;
    }

    setIsSaving(true);
    const previous = JSON.parse(JSON.stringify(originalServices));

    try {
      const supabase = createClient();

      const payload = services.map((s, index) => ({
        id: s.id,
        name: s.name.trim(),
        price: Math.round(Number(s.price)),
        duration_min: Math.round(Number(s.duration_min)),
        active: Boolean(s.active),
        position: index,
      }));

      const { error } = await supabase.from("services").upsert(payload, {
        onConflict: "id",
      });

      if (error) {
        throw error;
      }

      await revalidateServicesCache();

      setOriginalServices(JSON.parse(JSON.stringify(payload)));
      setServices((prev) => prev.map((s) => ({ ...s, isNew: false })));
      showToast("success", "Services and prices updated successfully!");
    } catch (err: unknown) {
      console.error("Error saving services:", err);
      setServices(previous);
      showToast("error", "Failed to save changes. Reverted to previous state.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete Button Handler with Dependency Check ──
  const handleDeleteClick = async (service: ServiceRow) => {
    if (service.isNew) {
      setServices((prev) => prev.filter((s) => s.id !== service.id));
      return;
    }

    setDeleteDialog({
      isOpen: true,
      service,
      mode: "confirm_delete",
      isChecking: true,
      isProcessing: false,
    });

    try {
      const supabase = createClient();
      const { count, error } = await supabase
        .from("reservations")
        .select("id", { count: "exact", head: true })
        .or(`service_id.eq.${service.id},service.eq.${service.name}`);

      if (error) {
        console.warn("Could not query reservation dependencies:", error.message);
      }

      const hasLinkedReservations = Boolean(count && count > 0);

      setDeleteDialog((prev) => ({
        ...prev,
        isChecking: false,
        mode: hasLinkedReservations ? "deactivate_explanation" : "confirm_delete",
      }));
    } catch (err: unknown) {
      console.error("Check dependency error:", err);
      setDeleteDialog((prev) => ({
        ...prev,
        isChecking: false,
        mode: "confirm_delete",
      }));
    }
  };

  // ── Confirm Delete or Deactivate Action ──
  const handleConfirmDeleteOrDeactivate = async () => {
    const target = deleteDialog.service;
    if (!target) return;

    setDeleteDialog((prev) => ({ ...prev, isProcessing: true }));

    try {
      const supabase = createClient();

      if (deleteDialog.mode === "deactivate_explanation") {
        const { error } = await supabase
          .from("services")
          .update({ active: false })
          .eq("id", target.id);

        if (error) throw error;

        setServices((prev) =>
          prev.map((s) => (s.id === target.id ? { ...s, active: false } : s))
        );
        setOriginalServices((prev) =>
          prev.map((s) => (s.id === target.id ? { ...s, active: false } : s))
        );
        showToast(
          "info",
          `"${target.name}" was deactivated to protect existing reservation history.`
        );
      } else {
        const { error } = await supabase
          .from("services")
          .delete()
          .eq("id", target.id);

        if (error) throw error;

        setServices((prev) => prev.filter((s) => s.id !== target.id));
        setOriginalServices((prev) => prev.filter((s) => s.id !== target.id));
        showToast("success", `"${target.name}" deleted permanently.`);
      }

      await revalidateServicesCache();
      setDeleteDialog({
        isOpen: false,
        service: null,
        mode: "confirm_delete",
        isChecking: false,
        isProcessing: false,
      });
    } catch (err: unknown) {
      console.error("Failed to delete/deactivate service:", err);
      showToast("error", "An error occurred while updating the service.");
      setDeleteDialog((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header & Save Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-rose/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-plum tracking-tight">
            Services &amp; Pricing
          </h1>
          <p className="text-sm text-plum/60 font-normal mt-1 leading-relaxed">
            Configure salon treatments, pricing in {CURRENCY}, durations, and booking form visibility.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {hasChanges && (
            <button
              type="button"
              onClick={handleReset}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold text-plum/70 hover:text-plum hover:bg-rose/10 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleAddService}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/80 dark:bg-surface/80 hover:bg-white text-deep-rose border border-rose/25 text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer hover:shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving || !hasChanges}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-deep-rose hover:bg-plum text-pearl text-xs sm:text-sm font-semibold transition-all shadow-md shadow-deep-rose/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{hasChanges ? "Save Changes" : "Saved"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Main List Container ── */}
      <div className="rounded-3xl bg-white/75 dark:bg-surface-elevated/75 backdrop-blur-xl border border-rose/15 dark:border-rose/20 p-5 sm:p-7 shadow-[0_4px_24px_rgba(184,74,110,0.04)] dark:shadow-[0_0_24px_rgba(243,166,189,0.04)] space-y-4">
        {/* Column Headers */}
        <div className="hidden sm:flex items-center justify-between text-xs font-medium tracking-wide text-plum/50 px-3 pb-2 border-b border-rose/10">
          <div className="flex items-center gap-6 flex-1">
            <span className="w-8 text-center">Order</span>
            <span>Treatment Name</span>
          </div>
          <div className="flex items-center gap-6 justify-end pr-4">
            <span className="w-28 text-right">Price ({CURRENCY})</span>
            <span className="w-22 text-right">Duration</span>
            <span className="w-20 text-center">Status</span>
            <span className="w-8 text-center">Action</span>
          </div>
        </div>

        {/* Services List with Reorder */}
        {services.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose/15 text-deep-rose flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-plum">No services configured yet</p>
            <p className="text-xs text-plum/50">
              Click &ldquo;Add Service&rdquo; above to create your studio&apos;s first treatment.
            </p>
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={services}
            onReorder={handleReorder}
            className="space-y-2.5"
          >
            {services.map((service, index) => {
              const rowError = errors[service.id];

              return (
                <Reorder.Item
                  key={service.id}
                  value={service}
                  className={`rounded-2xl bg-white/80 dark:bg-surface/85 backdrop-blur-md border p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:border-rose/40 transition-all ${
                    rowError
                      ? "border-deep-rose/60 bg-rose/5"
                      : "border-rose/15 dark:border-rose/20"
                  }`}
                >
                  {/* Drag Handle + Order Number + Name Input */}
                  <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
                    <div
                      title="Drag to reorder"
                      className="cursor-grab active:cursor-grabbing text-plum/35 hover:text-deep-rose p-1 transition-colors shrink-0"
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>

                    <span className="text-xs font-semibold tabular-nums text-plum/40 w-4 text-center shrink-0">
                      {index + 1}
                    </span>

                    <div className="flex-1">
                      <input
                        type="text"
                        value={service.name}
                        onChange={(e) =>
                          handleFieldChange(service.id, "name", e.target.value)
                        }
                        placeholder="Treatment name (e.g. Russian Manicure)"
                        className={`w-full px-3 py-2 bg-pearl/80 dark:bg-surface-elevated/80 border rounded-xl text-xs sm:text-sm text-plum placeholder:text-plum/35 focus:outline-none focus:ring-2 focus:ring-rose/30 transition-all ${
                          rowError?.name
                            ? "border-deep-rose bg-rose/10"
                            : "border-rose/20 focus:border-rose"
                        }`}
                      />
                      {rowError?.name && (
                        <p className="text-[10px] text-deep-rose mt-1 font-medium">
                          Service name is required
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price & Duration Inputs */}
                  <div className="flex items-center gap-2.5 pl-7 sm:pl-0">
                    {/* Price Input */}
                    <div className="relative w-28 sm:w-32 shrink-0">
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={service.price}
                        onChange={(e) =>
                          handleFieldChange(
                            service.id,
                            "price",
                            Math.max(0, Number(e.target.value))
                          )
                        }
                        placeholder="Price"
                        className={`w-full pl-3 pr-10 py-2 bg-pearl/80 dark:bg-surface-elevated/80 border rounded-xl text-xs sm:text-sm text-plum font-semibold text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-rose/30 transition-all ${
                          rowError?.price
                            ? "border-deep-rose bg-rose/10"
                            : "border-rose/20 focus:border-rose"
                        }`}
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-deep-rose pointer-events-none tabular-nums">
                        {CURRENCY}
                      </span>
                    </div>

                    {/* Duration Input */}
                    <div className="relative w-22 sm:w-24 shrink-0">
                      <input
                        type="number"
                        min="5"
                        step="5"
                        value={service.duration_min}
                        onChange={(e) =>
                          handleFieldChange(
                            service.id,
                            "duration_min",
                            Math.max(5, Number(e.target.value))
                          )
                        }
                        placeholder="Min"
                        className={`w-full pl-2.5 pr-8 py-2 bg-pearl/80 dark:bg-surface-elevated/80 border rounded-xl text-xs sm:text-sm text-plum text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-rose/30 transition-all ${
                          rowError?.duration
                            ? "border-deep-rose bg-rose/10"
                            : "border-rose/20 focus:border-rose"
                        }`}
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-plum/50 font-medium pointer-events-none tabular-nums">
                        min
                      </span>
                    </div>
                  </div>

                  {/* Active Switch & Delete Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pl-7 sm:pl-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-rose/10">
                    {/* Active / Hidden Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={service.active}
                      onClick={() => handleToggleActive(service.id, service.active)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                        service.active
                          ? "bg-rose/15 text-deep-rose border-rose/30 hover:bg-rose/25"
                          : "bg-plum/10 text-plum/60 border-plum/20 hover:bg-plum/15"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full transition-colors ${
                          service.active ? "bg-deep-rose" : "bg-plum/40"
                        }`}
                      />
                      <span>{service.active ? "Active" : "Hidden"}</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(service)}
                      title="Delete or deactivate service"
                      className="w-8 h-8 rounded-full text-plum/40 hover:text-deep-rose hover:bg-rose/10 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        )}

        {/* Footer info note */}
        <div className="p-4 rounded-2xl bg-pearl/60 dark:bg-surface/60 border border-rose/15 flex items-center gap-2 text-xs text-plum/70 mt-4">
          <Info className="w-4 h-4 text-deep-rose shrink-0" />
          <span>
            The display order in this list matches the booking form order. Past client reservations preserve their historic price snapshot.
          </span>
        </div>
      </div>

      {/* Floating Notification Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className={`fixed bottom-6 right-6 px-4 py-2.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-xl border flex items-center gap-2 z-50 ${
              toastMessage.type === "error"
                ? "bg-rose/15 text-deep-rose border-rose/30"
                : toastMessage.type === "info"
                ? "bg-white/95 dark:bg-surface-elevated/95 text-plum border-rose/25"
                : "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/25"
            }`}
          >
            {toastMessage.type === "error" ? (
              <AlertTriangle className="w-4 h-4 text-deep-rose" />
            ) : (
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sub-dialog: Confirmation or Deactivate Explanation ── */}
      <AnimatePresence>
        {deleteDialog.isOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() =>
                setDeleteDialog((prev) => ({ ...prev, isOpen: false }))
              }
              className="absolute inset-0 bg-plum/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="relative w-full max-w-md rounded-3xl bg-white/95 dark:bg-surface-elevated/95 backdrop-blur-2xl border border-rose/25 p-6 shadow-2xl z-10 text-plum"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose/15 text-deep-rose flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>

              {deleteDialog.isChecking ? (
                <div className="py-6 text-center space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-deep-rose mx-auto" />
                  <p className="text-xs text-plum/70">
                    Checking reservation dependencies...
                  </p>
                </div>
              ) : deleteDialog.mode === "deactivate_explanation" ? (
                <>
                  <h3 className="text-lg sm:text-xl font-semibold text-plum tracking-tight">
                    Service is in active use
                  </h3>
                  <p className="text-xs sm:text-sm text-plum/75 font-normal mt-2 leading-relaxed">
                    <span className="font-semibold text-plum">
                      &ldquo;{deleteDialog.service?.name}&rdquo;
                    </span>{" "}
                    is associated with existing client reservations. To protect booking history and preserved price snapshots, it cannot be permanently removed.
                  </p>
                  <div className="p-3 rounded-2xl bg-rose/10 dark:bg-rose/15 border border-rose/20 text-xs text-deep-rose font-medium mt-3">
                    It will be deactivated instead so it no longer appears as a choice on the public booking form.
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteDialog((prev) => ({ ...prev, isOpen: false }))
                      }
                      className="px-4 py-2 rounded-full text-xs font-semibold text-plum/70 hover:text-plum"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDeleteOrDeactivate}
                      disabled={deleteDialog.isProcessing}
                      className="px-5 py-2.5 rounded-full text-xs font-semibold bg-deep-rose hover:bg-plum text-pearl transition-all cursor-pointer shadow-md shadow-deep-rose/20"
                    >
                      {deleteDialog.isProcessing
                        ? "Deactivating..."
                        : "Deactivate Service"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg sm:text-xl font-semibold text-plum tracking-tight">
                    Delete Service Permanently?
                  </h3>
                  <p className="text-xs sm:text-sm text-plum/75 font-normal mt-2 leading-relaxed">
                    Are you sure you want to permanently delete{" "}
                    <span className="font-semibold text-plum">
                      &ldquo;{deleteDialog.service?.name}&rdquo;
                    </span>
                    ? No past reservations are linked to this service.
                  </p>

                  <div className="flex items-center justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteDialog((prev) => ({ ...prev, isOpen: false }))
                      }
                      className="px-4 py-2 rounded-full text-xs font-semibold text-plum/70 hover:text-plum"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDeleteOrDeactivate}
                      disabled={deleteDialog.isProcessing}
                      className="px-5 py-2.5 rounded-full text-xs font-semibold bg-deep-rose hover:bg-plum text-pearl transition-all cursor-pointer shadow-md shadow-deep-rose/20"
                    >
                      {deleteDialog.isProcessing
                        ? "Deleting..."
                        : "Yes, Delete Service"}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
