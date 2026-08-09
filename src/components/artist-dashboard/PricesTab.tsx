"use client";

import { useState } from "react";
import { Plus, Trash2, Save, Loader2, DollarSign, AlertCircle } from "lucide-react";

interface Service {
  id: string;
  name: string;
  price: number;
  description?: string;
  duration?: string;
}

interface PricesTabProps {
  services: Service[];
  showPrices: boolean;
  userId: string;
  onUpdate: (services: Service[]) => void;
  onToggleShowPrices: (show: boolean) => void;
}

// Specialties options - kept in sync with ArtistProfileEditForm and ProfileTab
const expertiseOptions = [
  "Bridal Makeup",
  "Events",
  "Commercial/TV/Film",
  "Class/Workshop",
  "Other",
  "Groom",
  "Hijab",
];

export default function PricesTab({
  services: initialServices,
  showPrices,
  userId,
  onUpdate,
  onToggleShowPrices,
}: PricesTabProps) {
  const [services, setServices] = useState(initialServices);
  const [newService, setNewService] = useState({ name: "", price: "", description: "" });
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ name: "", price: "", description: "" });
  
  const handleSpecialtyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedSpecialty(value);
    setNewService({ ...newService, name: value });
  };

  function applyResult(newList: Service[]) {
    setServices(newList);
    onUpdate(newList);
  }

  async function createService(service: Service) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistId: userId,
          name: service.name,
          price: service.price,
          description: service.description || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add service");
      const saved = data.service;
      applyResult([
        ...services.filter((s) => !s.id.startsWith("temp-")),
        {
          id: String(saved.id),
          name: saved.name,
          price: Number(saved.price) || 0,
          description: saved.description || "",
          duration: saved.duration || "",
        },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add service");
    } finally {
      setSaving(false);
    }
  }

  async function updateService(service: Service) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: service.id,
          name: service.name,
          price: service.price,
          description: service.description || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update service");
      const saved = data.service;
      applyResult(
        services.map((s) =>
          s.id === service.id
            ? {
                id: String(saved.id),
                name: saved.name,
                price: Number(saved.price) || 0,
                description: saved.description || "",
                duration: saved.duration || "",
              }
            : s,
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update service");
    } finally {
      setSaving(false);
    }
  }

  async function deleteService(id: string) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/services?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete service");
      applyResult(services.filter((s) => s.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete service");
    } finally {
      setSaving(false);
    }
  }

  function handleAddService() {
    if (!newService.name.trim() || !newService.price) return;
    createService({
      id: `temp-${Date.now()}`,
      name: newService.name.trim(),
      price: Number(newService.price),
      description: newService.description.trim(),
    });
    setNewService({ name: "", price: "", description: "" });
    setSelectedSpecialty(null);
  }

  function startEdit(service: Service) {
    setEditId(service.id);
    setEditValues({
      name: service.name,
      price: String(service.price),
      description: service.description || "",
    });
  }

  function saveEdit() {
    if (!editId) return;
    updateService({
      id: editId,
      name: editValues.name,
      price: Number(editValues.price),
      description: editValues.description,
    });
    setEditId(null);
  }

  async function handleToggleShowPrices() {
    const newValue = !showPrices;
    onToggleShowPrices(newValue);
    setError("");
    try {
      const res = await fetch("/api/user/artist-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, showPrices: newValue }),
      });
      if (!res.ok) throw new Error("Failed to save price visibility");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save price visibility");
      onToggleShowPrices(!newValue);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Prices</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your services and pricing
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Show prices toggle */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <DollarSign className="w-5 h-5 text-rose-500" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Display prices publicly</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Show service prices on your profile</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleToggleShowPrices}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            showPrices ? "bg-rose-500" : "bg-gray-300 dark:bg-neutral-600"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              showPrices ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Add new service */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-6">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Add Service</h2>
        <div className="space-y-3">
           <div className="grid sm:grid-cols-2 gap-3">
             <select
               value={selectedSpecialty || ""}
               onChange={handleSpecialtyChange}
               className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none appearance-none"
             >
               <option value="">Select a specialty...</option>
               {expertiseOptions.map(option => (
                 <option key={option} value={option}>
                   {option}
                 </option>
               ))}
             </select>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">RM</span>
              <input
                type="number"
                value={newService.price}
                onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                placeholder="0"
                min="0"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
          <input
            type="text"
            value={newService.description}
            onChange={(e) => setNewService({ ...newService, description: e.target.value })}
            placeholder="Short description (optional)"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
          />
          <button
            onClick={handleAddService}
            disabled={!newService.name.trim() || !newService.price || saving}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add Service
          </button>
        </div>
      </div>

      {/* Service list */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">
            Your Services ({services.length})
          </h2>
          {saving && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Loader2 className="w-3 h-3 animate-spin" /> Saving
            </span>
          )}
        </div>

        {services.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No services added yet</p>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="p-4 bg-gray-50 dark:bg-neutral-800 rounded-xl"
              >
                {editId === service.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editValues.name}
                      onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                    />
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">RM</span>
                        <input
                          type="number"
                          value={editValues.price}
                          onChange={(e) => setEditValues({ ...editValues, price: e.target.value })}
                          className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <button
                        onClick={saveEdit}
                        className="px-4 py-2 bg-rose-500 text-white rounded-lg text-xs font-medium hover:bg-rose-600 transition-colors"
                      >
                        <Save className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="px-4 py-2 border border-gray-200 dark:border-neutral-700 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {service.name}
                      </p>
                      {service.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {service.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span className="font-bold text-gray-900 dark:text-white text-sm whitespace-nowrap">
                        RM {Number(service.price).toLocaleString()}
                      </span>
                      <button
                        onClick={() => startEdit(service)}
                        className="text-xs text-gray-400 hover:text-rose-500 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteService(service.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
