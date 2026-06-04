'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CalendarIcon, CheckIcon, SaveIcon, XMarkIcon,
  AlertTriangleIcon, ChevronLeftIcon, ClockIcon,
} from '@/components/ui/Icons';
import { servicesApi } from '@/lib/api/services';
import { Service } from '@/lib/api/services/types';
import Link from 'next/link';

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

const DAYS  = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2,'0')}:00`);

const TEMPLATES = [
  { name: '9h–17h (Pause midi)', slots: [{ startTime:'09:00', endTime:'12:00' },{ startTime:'14:00', endTime:'17:00' }] },
  { name: '8h–20h (Continu)',    slots: [{ startTime:'08:00', endTime:'20:00' }] },
  { name: 'Matin 9h–13h',        slots: [{ startTime:'09:00', endTime:'13:00' }] },
  { name: 'Après-midi 14h–19h',  slots: [{ startTime:'14:00', endTime:'19:00' }] },
];

const hasValidAvail = (s: any) =>
  Array.isArray(s?.availabilitySlots) && s.availabilitySlots.some((sl: TimeSlot) => sl.isAvailable);

const defaultSlots = (): TimeSlot[] => {
  const out: TimeSlot[] = [];
  DAYS.forEach(day => {
    const wknd = day === 'Samedi' || day === 'Dimanche';
    out.push({ day, startTime:'09:00', endTime:'12:00', isAvailable: !wknd || day === 'Samedi' });
    if (day !== 'Samedi')
      out.push({ day, startTime:'14:00', endTime:'17:00', isAvailable: !wknd });
  });
  return out;
};

export default function ProviderAvailabilityPage() {
  const sp = useSearchParams();
  const urlId = sp.get('serviceId');

  const [services,      setServices]      = useState<Service[]>([]);
  const [selectedId,    setSelectedId]    = useState('');
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [isEditing,     setIsEditing]     = useState(false);
  const [slots,         setSlots]         = useState<TimeSlot[]>([]);
  const [originalSlots, setOriginalSlots] = useState<TimeSlot[]>([]);
  const [notice,        setNotice]        = useState<{ type:'success'|'error'; text:string }|null>(null);

  const flash = (type:'success'|'error', text:string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 3500);
  };

  // ── load services ──────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const data = await servicesApi.getByProvider();
        const list = Array.isArray(data) ? data : [];
        setServices(list);
        if (list.length) setSelectedId(urlId || list[0]._id);
      } catch { flash('error','Erreur lors du chargement'); }
      finally  { setLoading(false); }
    })();
  }, [urlId]);

  // ── load slots when selection changes ─────────────────────────
  useEffect(() => { if (selectedId) loadSlots(selectedId); }, [selectedId]);

  const loadSlots = async (id: string) => {
    setLoading(true);
    try {
      const svc = await servicesApi.getById(id);
      const src = svc.availabilitySlots?.length ? svc.availabilitySlots : defaultSlots();
      setSlots(src);
      setOriginalSlots(JSON.parse(JSON.stringify(src)));
    } catch { flash('error','Erreur lors du chargement des disponibilités'); }
    finally  { setLoading(false); }
  };

  const isDirty = () => JSON.stringify(slots) !== JSON.stringify(originalSlots);

  const toggleSlot   = (i: number) =>
    isEditing && setSlots(s => s.map((sl,idx) => idx===i ? {...sl, isAvailable:!sl.isAvailable} : sl));

  const setTime = (i: number, f:'startTime'|'endTime', v:string) =>
    isEditing && setSlots(s => s.map((sl,idx) => idx===i ? {...sl,[f]:v} : sl));

  const toggleDay = (day:string, on:boolean) =>
    isEditing && setSlots(s => s.map(sl => sl.day===day ? {...sl,isAvailable:on} : sl));

  const addSlot = (day:string) =>
    isEditing && setSlots(s => [...s, { day, startTime:'09:00', endTime:'17:00', isAvailable:true }]);

  const removeSlot = (i:number) =>
    isEditing && setSlots(s => s.filter((_,idx) => idx!==i));

  const applyTemplate = (tpl: typeof TEMPLATES[0]) => {
    if (!isEditing) return;
    const next = slots.map(sl => ({ ...sl, isAvailable:false }));
    DAYS.forEach(day => {
      tpl.slots.forEach(ts => {
        const idx = next.findIndex(sl => sl.day===day && sl.startTime===ts.startTime && sl.endTime===ts.endTime);
        if (idx >= 0) next[idx].isAvailable = true;
        else next.push({ day, ...ts, isAvailable:true });
      });
    });
    setSlots(next);
  };

  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      await servicesApi.update(selectedId, { availabilitySlots: slots.filter(sl => sl.isAvailable) });
      flash('success','Disponibilités enregistrées avec succès');
      setOriginalSlots(JSON.parse(JSON.stringify(slots)));
      setIsEditing(false);
    } catch (err: unknown) {
      const e = err as any;
      flash('error', e?.response?.status===403 ? 'Non autorisé' : e?.response?.data?.message ?? "Erreur lors de l'enregistrement");
    } finally { setSaving(false); }
  };

  const handleCancel = () => { setSlots(JSON.parse(JSON.stringify(originalSlots))); setIsEditing(false); };

  // ── loading screen ─────────────────────────────────────────────
  if (loading && !services.length) return (
    <div className="flex justify-center items-center min-h-screen bg-surface">
      <div className="spinner" />
    </div>
  );

  const selectedSvc = services.find(s => s._id === selectedId);

  return (
    <div className="min-h-screen bg-surface">
      <div className="container-app py-8">

        {/* ── Page header ── */}
        <div className="animate-fadeIn mb-8 flex flex-wrap gap-4 items-start justify-between">
          <div>
            <Link
              href="/provider/services"
              className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary transition-colors rounded-pill px-3 py-1 bg-surface-raised border border-border hover-lift mb-3"
            >
              <ChevronLeftIcon className="w-4 h-4" /> Retour aux services
            </Link>

            <h1 className="flex items-center gap-3 mt-1">
              <span className="inline-flex p-2 rounded-app bg-primary-soft text-primary animate-bounce-in">
                <CalendarIcon className="w-6 h-6" />
              </span>
              <span className="font-display text-foreground">Disponibilités</span>
            </h1>
            <p className="text-muted text-sm mt-1 pl-1">Définissez vos horaires et créneaux disponibles</p>
          </div>

          <div className="flex gap-2">
            {isEditing && isDirty() && (
              <button onClick={handleCancel} className="btn btn-ghost animate-fadeIn">
                <XMarkIcon className="w-4 h-4" /> Annuler
              </button>
            )}
            <button
              onClick={() => setIsEditing(e => !e)}
              className={`btn ${isEditing ? 'btn-ghost' : 'btn-primary'}`}
            >
              {isEditing ? '✏️ En modification…' : '✏️ Modifier'}
            </button>
          </div>
        </div>

        {/* ── Notice banner ── */}
        {notice && (
          <div className={`alert animate-slideInRight mb-6 ${notice.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            {notice.type === 'success'
              ? <CheckIcon className="w-5 h-5 flex-shrink-0" />
              : <AlertTriangleIcon className="w-5 h-5 flex-shrink-0" />}
            <span>{notice.text}</span>
          </div>
        )}

        {/* ── Service selector ── */}
        {services.length > 0 && (
          <div className="card mb-6 animate-fadeInUp p-4">
            <label className="label">Service concerné</label>
            <select
              className="input"
              style={{ maxWidth: '28rem' }}
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              disabled={isEditing}
            >
              {services.map(s => (
                <option key={s._id} value={s._id}>
                  {s.name} {hasValidAvail(s) ? '✅' : '⚠️'}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ── No availability warning ── */}
        {!hasValidAvail(selectedSvc) && !isEditing && (
          <div className="alert alert-warning mb-6 animate-fadeIn">
            <AlertTriangleIcon className="w-5 h-5 flex-shrink-0" />
            <span>Aucune disponibilité définie. Cliquez sur <strong>Modifier</strong> pour en ajouter.</span>
          </div>
        )}

        {/* ── Quick templates ── */}
        {isEditing && (
          <div className="card mb-6 p-5 animate-scaleIn">
            <p className="font-display text-foreground flex items-center gap-2 mb-3">
              <ClockIcon className="w-4 h-4 text-primary" /> Modèles rapides
            </p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map(tpl => (
                <button
                  key={tpl.name}
                  onClick={() => applyTemplate(tpl)}
                  className="btn btn-ghost btn-sm"
                >
                  {tpl.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Days grid ── */}
        <div className="card p-0 overflow-hidden animate-fadeInUp stagger-children">
          {DAYS.map((day, di) => {
            const daySlots  = slots.filter(sl => sl.day === day);
            const active    = daySlots.some(sl => sl.isAvailable);

            return (
              <div
                key={day}
                className="border-b border-border last:border-b-0 animate-fadeInUp"
                style={{ animationDelay: `${di * 40}ms` }}
              >
                {/* Day row header */}
                <div className="flex items-center justify-between px-6 py-4 bg-surface-raised">
                  <div className="flex items-center gap-3">
                    <span
                      className={`avatar avatar-sm text-xs font-sans font-bold ${active ? 'bg-primary-soft text-primary' : 'bg-surface-overlay text-muted'}`}
                    >
                      {day.slice(0,2)}
                    </span>
                    <span className="font-sans font-semibold text-foreground">{day}</span>
                    {active && (
                      <span className="badge badge-success animate-fadeIn" style={{ fontSize:'0.65rem' }}>
                        Actif
                      </span>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex items-center gap-4 flex-wrap">
                      <button
                        onClick={() => addSlot(day)}
                        className="text-primary text-sm font-medium hover:underline transition-colors"
                      >
                        + Créneau
                      </button>
                      <label className="flex items-center gap-2 text-sm cursor-pointer text-muted">
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={e => toggleDay(day, e.target.checked)}
                          className="w-4 h-4 accent-[rgb(var(--primary))] rounded"
                        />
                        Activer
                      </label>
                    </div>
                  )}
                </div>

                {/* Slot rows */}
                <div className="px-6 py-3 flex flex-col gap-2">
                  {daySlots.length === 0 && isEditing && (
                    <p className="text-muted text-sm italic py-2">
                      Aucun créneau — cliquez sur &quot;+ Créneau&quot;.
                    </p>
                  )}

                  {daySlots.map((slot, idx) => {
                    const gi = slots.findIndex(
                      sl => sl.day===day && sl.startTime===slot.startTime && sl.endTime===slot.endTime
                    );
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 flex-wrap rounded-app px-3 py-2 transition-colors-smooth ${slot.isAvailable ? 'bg-primary-soft' : 'bg-surface-raised'}`}
                      >
                        {/* Start time */}
                        <select
                          value={slot.startTime}
                          onChange={e => setTime(gi,'startTime',e.target.value)}
                          disabled={!isEditing}
                          className="input"
                          style={{ width:'7rem', padding:'0.35rem 0.6rem' }}
                        >
                          {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>

                        <span className="text-muted font-sans">→</span>

                        {/* End time */}
                        <select
                          value={slot.endTime}
                          onChange={e => setTime(gi,'endTime',e.target.value)}
                          disabled={!isEditing}
                          className="input"
                          style={{ width:'7rem', padding:'0.35rem 0.6rem' }}
                        >
                          {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>

                        {isEditing ? (
                          <>
                            <label className="flex items-center gap-2 cursor-pointer ml-2">
                              <input
                                type="checkbox"
                                checked={slot.isAvailable}
                                onChange={() => toggleSlot(gi)}
                                className="w-4 h-4 accent-[rgb(var(--primary))] rounded"
                              />
                              <span className="text-sm text-muted">Disponible</span>
                            </label>
                            <button
                              onClick={() => removeSlot(gi)}
                              title="Supprimer"
                              className="ml-auto text-muted hover:text-error transition-colors p-1 rounded-app hover:bg-surface-overlay"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <span className={`badge ml-2 ${slot.isAvailable ? 'badge-success' : 'badge-error'}`}>
                            {slot.isAvailable ? '✅ Disponible' : '❌ Indisponible'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* ── Footer actions ── */}
          {isEditing && (
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-border bg-surface-raised animate-fadeIn">
              <button onClick={handleCancel} className="btn btn-ghost">
                <XMarkIcon className="w-4 h-4" /> Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !isDirty()}
                className="btn btn-primary"
              >
                <SaveIcon className="w-4 h-4" />
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          )}
        </div>

        {/* ── Read-only hint ── */}
        {!isEditing && (
          <p className="mt-6 text-center text-sm text-muted animate-fadeIn">
            💡 Cliquez sur <strong className="text-primary">Modifier</strong> pour définir vos disponibilités
          </p>
        )}

      </div>
    </div>
  );
}