'use client';

import { useEffect, useState } from 'react';
import { servicesApi } from '@/lib/api/services';
import {
  ServicesIcon, RestaurantIcon, HotelIcon, SpaIcon,
  DumbbellIcon, LipstickIcon, MapPinIcon, CalendarIcon,
  AlertTriangleIcon, XMarkIcon, CheckIcon, CheckCircleIcon,
  XCircleIcon, ClockIcon, BanIcon, RefreshIcon, TrashIcon,
  PencilIcon,
} from '@/components/ui/Icons';
import { CreateServiceData, Service, ServiceStatus } from '@/lib/api/services/types';
import Link from 'next/link';

const CAT_ICON: Record<string, JSX.Element> = {
  restaurant: <RestaurantIcon className="w-4 h-4" />,
  hotel:      <HotelIcon      className="w-4 h-4" />,
  spa:        <SpaIcon        className="w-4 h-4" />,
  gym:        <DumbbellIcon   className="w-4 h-4" />,
  salon:      <LipstickIcon   className="w-4 h-4" />,
};

const CAT_LABEL: Record<string, string> = {
  restaurant: 'Restaurant', hotel: 'Hôtel', spa: 'Spa', gym: 'Sport', salon: 'Salon',
};

const STATUS_META: Record<ServiceStatus, { label: string; badge: string; icon: JSX.Element }> = {
  active: { label: 'Actif', badge: 'badge-success', icon: <CheckCircleIcon className="w-3 h-3 mr-0.5" /> },
  pending_approval: { label: 'En attente', badge: 'badge-warning', icon: <ClockIcon className="w-3 h-3 mr-0.5" /> },
  disabled: { label: 'Désactivé', badge: 'badge-error', icon: <XCircleIcon className="w-3 h-3 mr-0.5" /> },
  banned: { label: 'Banni', badge: 'badge-error', icon: <BanIcon className="w-3 h-3 mr-0.5" /> },
};

const EMPTY: CreateServiceData = {
  name:'', category:'restaurant', description:'', duration:60,
  location:{ coordinates:[10.1815,36.8065], address:'', city:'', governorate:'' },
};

const locOk   = (s: Service) => !!(s.location?.address?.trim() && s.location?.city?.trim() && s.location?.governorate?.trim());
const availOk = (s: Service) => !!s.availabilitySlots?.some((sl) => sl.isAvailable);

export default function ProviderServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState<Service | null>(null);
  const [form,     setForm]     = useState<CreateServiceData>(EMPTY);
  const [notice,   setNotice]   = useState<{type:'success'|'error';text:string}|null>(null);
  const [deleting, setDeleting] = useState<string|null>(null);

  const flash = (type:'success'|'error', text:string) => {
    setNotice({type,text});
    setTimeout(()=>setNotice(null),3500);
  };

  const load = async () => {
    try { const d = await servicesApi.getByProvider(); setServices(Array.isArray(d)?d:[]); }
    catch { flash('error','Erreur lors du chargement'); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };
  const openEdit   = (s: Service) => {
    setEditing(s);
    setForm({ name:s.name, category:s.category, description:s.description, duration:s.duration, location:s.location||EMPTY.location });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      editing ? await servicesApi.update(editing._id,form) : await servicesApi.create(form);
      flash('success', editing ? 'Service modifié' : 'Service créé');
      closeForm(); load();
    } catch { flash('error',"Erreur lors de l'enregistrement"); }
  };

  const toggle = async (s: Service) => {
    try {
      await servicesApi.toggleActive(s._id);
      flash('success', s.status === 'active' ? 'Service désactivé' : 'Service réactivé');
      load();
    }
    catch { flash('error','Erreur lors du changement de statut'); }
  };

  const del = async (id:string) => {
    if (!confirm('Supprimer ce service ? Action irréversible.')) return;
    setDeleting(id);
    try { await servicesApi.delete(id); flash('success','Service supprimé'); load(); }
    catch { flash('error','Erreur suppression'); }
    finally { setDeleting(null); }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-surface">
      <div className="spinner" />
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      <div className="container-app py-8">

        {/* ── Header ── */}
        <div className="animate-fadeIn mb-8 flex flex-wrap gap-4 items-center justify-between">
          <div>
            <h1 className="font-display text-foreground">Mes Services</h1>
            <p className="text-muted text-sm mt-1">Gérez vos services et leurs informations</p>
          </div>
          <button onClick={openCreate} className="btn btn-primary">
            + Nouveau service
          </button>
        </div>

        {/* ── Notice ── */}
        {notice && (
          <div className={`alert animate-slideInRight mb-6 ${notice.type==='success'?'alert-success':'alert-error'}`}>
            {notice.type==='success'
              ? <CheckIcon         className="w-5 h-5 flex-shrink-0"/>
              : <AlertTriangleIcon className="w-5 h-5 flex-shrink-0"/>}
            <span>{notice.text}</span>
          </div>
        )}

        {/* ── Form card ── */}
        {showForm && (
          <div className="card mb-8 p-6 animate-scaleIn">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-foreground" style={{fontSize:'1.25rem'}}>
                {editing ? 'Modifier le service' : 'Nouveau service'}
              </h2>
              <button onClick={closeForm} className="text-muted hover:text-error transition-colors p-1 rounded-app hover:bg-surface-raised">
                <XMarkIcon className="w-5 h-5"/>
              </button>
            </div>

            <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label">Nom du service *</label>
                <input type="text" required className="input" placeholder="Ex : Restaurant El Maa"
                  value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
              </div>

              <div>
                <label className="label">Catégorie *</label>
                <select required className="input" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                  {Object.entries(CAT_LABEL).map(([k,v])=>(
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Durée (minutes) *</label>
                <input type="number" min="1" required className="input" placeholder="60"
                  value={form.duration} onChange={e=>setForm({...form,duration:+e.target.value})} />
              </div>

              <div className="md:col-span-2">
                <label className="label">Description *</label>
                <textarea required rows={3} className="input" placeholder="Décrivez votre service…"
                  value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-border">
                <button type="button" onClick={closeForm} className="btn btn-ghost">Annuler</button>
                <button type="submit" className="btn btn-primary">
                  {editing ? 'Mettre à jour' : 'Créer le service'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Empty state ── */}
        {!services.length ? (
          <div className="card text-center py-20 animate-fadeInUp">
            <div className="avatar avatar-xl bg-primary-soft text-primary mx-auto mb-5">
              <ServicesIcon className="w-8 h-8"/>
            </div>
            <h2 className="font-display text-foreground mb-2" style={{fontSize:'1.25rem'}}>Aucun service</h2>
            <p className="text-muted mb-6 text-sm">Commencez par ajouter votre premier service</p>
            <button onClick={openCreate} className="btn btn-primary mx-auto">+ Ajouter un service</button>
          </div>
        ) : (
          /* ── Grid ── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {services.map((svc, i) => {
              const hasLoc   = locOk(svc);
              const hasAvail = availOk(svc);
              const complete = hasLoc && hasAvail;
              const status = STATUS_META[svc.status];
              const canToggle = svc.status === 'active' || svc.status === 'disabled';

              return (
                <div
                  key={svc._id}
                  className={`card p-0 overflow-hidden hover-lift animate-fadeInUp ${deleting===svc._id?'opacity-50 pointer-events-none':''}`}
                  style={{ animationDelay:`${i*60}ms` }}
                >
                  {/* Image area */}
                  <div
                    className="relative bg-primary-soft"
                    style={{ height:'9rem' }}
                  >
                    {svc.images?.[0]
                      ? <img src={svc.images[0]} alt={svc.name} className="w-full h-full object-cover"/>
                      : (
                        <div className="w-full h-full flex items-center justify-center opacity-40">
                          {CAT_ICON[svc.category]
                            ? <span className="scale-[3]">{CAT_ICON[svc.category]}</span>
                            : <ServicesIcon className="w-10 h-10" />}
                        </div>
                      )
                    }

                    {/* Overlay badges */}
                    <div className="absolute top-2 left-2 flex gap-1.5">
                      <span className={`badge ${status.badge}`}>
                        {status.icon}{status.label}
                      </span>
                      {!complete && svc.status === 'active' && (
                        <span className="badge badge-warning">
                          <AlertTriangleIcon className="w-3 h-3 mr-0.5"/>Incomplet
                        </span>
                      )}
                    </div>

                    {/* Quick actions */}
                    <div className="absolute top-2 right-2 flex gap-1.5">
                      {canToggle && (
                        <button
                          onClick={()=>toggle(svc)}
                          title={svc.status === 'active' ? 'Désactiver' : 'Réactiver'}
                          className="w-7 h-7 rounded-pill bg-black/50 hover:bg-black/70 text-white text-xs flex items-center justify-center transition-colors"
                        >
                          {svc.status === 'active'
                            ? <XCircleIcon className="w-4 h-4" />
                            : <RefreshIcon className="w-4 h-4" />}
                        </button>
                      )}
                      <button
                        onClick={()=>del(svc._id)}
                        title="Supprimer"
                        className="w-7 h-7 rounded-pill bg-black/50 hover:bg-error text-white text-xs flex items-center justify-center transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 flex flex-col gap-2">
                    {/* Category badge */}
                    <div className="flex items-center gap-1.5">
                      <span className="badge badge-primary">
                        {CAT_ICON[svc.category]??<ServicesIcon className="w-3 h-3"/>}
                        <span className="ml-1 text-xs">{CAT_LABEL[svc.category] || svc.category}</span>
                      </span>
                    </div>

                    <h3 className="font-sans font-semibold text-foreground text-base leading-tight">{svc.name}</h3>
                    <p className="text-muted text-sm truncate-2">{svc.description}</p>

                    {svc.status === 'banned' && svc.banReason && (
                      <p className="text-error text-xs">Motif du bannissement : {svc.banReason}</p>
                    )}
                    {svc.status === 'disabled' && svc.rejectionReason && (
                      <p className="text-error text-xs">Motif du refus : {svc.rejectionReason}</p>
                    )}

                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="badge badge-success">Gratuit</span>
                      <span className="text-muted">{svc.duration} min</span>
                    </div>

                    <div className="divider" style={{margin:'0.25rem 0'}}/>

                    {/* Location link */}
                    <Link
                      href={`/provider/location?serviceId=${svc._id}`}
                      className={`flex items-center gap-2 text-sm px-3 py-2 rounded-app transition-colors-smooth ${
                        hasLoc ? 'text-success hover:bg-surface-raised' : 'text-error bg-surface-raised hover:bg-surface-overlay'
                      }`}
                    >
                      <MapPinIcon className="w-4 h-4 flex-shrink-0"/>
                      <span className="flex-1 truncate">{hasLoc ? svc.location.city : 'Localisation non définie'}</span>
                      {hasLoc
                        ? <CheckIcon className="w-3.5 h-3.5 flex-shrink-0"/>
                        : <AlertTriangleIcon className="w-3.5 h-3.5 flex-shrink-0"/>}
                    </Link>

                    {/* Availability link */}
                    <Link
                      href={`/provider/availability?serviceId=${svc._id}`}
                      className={`flex items-center gap-2 text-sm px-3 py-2 rounded-app transition-colors-smooth ${
                        hasAvail ? 'text-success hover:bg-surface-raised' : 'text-error bg-surface-raised hover:bg-surface-overlay'
                      }`}
                    >
                      <CalendarIcon className="w-4 h-4 flex-shrink-0"/>
                      <span className="flex-1">{hasAvail?'Disponibilités définies':'Disponibilités non définies'}</span>
                      {hasAvail
                        ? <CheckIcon className="w-3.5 h-3.5 flex-shrink-0"/>
                        : <AlertTriangleIcon className="w-3.5 h-3.5 flex-shrink-0"/>}
                    </Link>

                    {/* Edit info */}
                    <button
                      onClick={()=>openEdit(svc)}
                      className="btn btn-ghost btn-sm w-full mt-1"
                    >
                      <PencilIcon className="w-3.5 h-3.5" /> Modifier les informations
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
