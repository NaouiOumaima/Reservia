// app/provider/services/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { servicesApi } from '@/lib/api/services';
import { CreateServiceData, Service } from '@/lib/api/services/types';
import { getImageUrl } from '@/lib/utils/imageUtils';
import Link from 'next/link';
import { uploadApi } from '@/lib/api/upload';
import { CATEGORIES, CategoryKey, getCategoryByKey } from '@/lib/api/constants/categories';
import {
  PlusIcon,
  ClockIcon,
  CameraIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ServicesIcon,
  Loader2Icon,
  XMarkIcon,
  SaveIcon,
} from '@/components/ui/Icons';

export default function ProviderServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formulaire : seulement les champs de base (sans location ni slots)
  const [form, setForm] = useState<Omit<CreateServiceData, 'location' | 'slots' | 'openingHours' | 'cancellationPolicy'>>({
    name: '',
    category: CategoryKey.RESTAURANT,
    description: '',
    duration: 60,
    images: [],
  });

  const showAlert = (type: 'success' | 'error', text: string) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 3500);
  };

  const loadServices = async () => {
    try {
      const data = await servicesApi.getByProvider();
      setServices(data);
    } catch {
      showAlert('error', 'Erreur lors du chargement des services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadServices(); }, []);

  const resetForm = () => {
    setForm({
      name: '',
      category: CategoryKey.RESTAURANT,
      description: '',
      duration: 60,
      images: [],
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingImages(true);
    setUploadProgress(0);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const result = await uploadApi.uploadImage(files[i]);
        urls.push(result.url);
        setUploadProgress(((i + 1) / files.length) * 100);
      }
      setForm(prev => ({ ...prev, images: [...(prev.images || []), ...urls] }));
    } catch {
      showAlert('error', "Erreur lors de l'upload des images");
    } finally {
      setUploadingImages(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (idx: number) => {
    setForm(prev => ({ ...prev, images: prev.images?.filter((_, i) => i !== idx) || [] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim()) {
      showAlert('error', 'Veuillez remplir tous les champs obligatoires');
      return;
    }
    try {
      if (editing) {
        // Mise à jour : uniquement les champs de base
        await servicesApi.update(editing._id, {
          name: form.name,
          category: form.category,
          description: form.description,
          duration: form.duration,
          images: form.images,
        });
        showAlert('success', 'Service modifié avec succès');
      } else {
        // Création : sans location (à renseigner plus tard)
        await servicesApi.create({
          name: form.name,
          category: form.category,
          description: form.description,
          duration: form.duration,
          images: form.images,
        } as CreateServiceData);
        showAlert('success', 'Service créé ! Ajoutez maintenant sa localisation et ses disponibilités.');
      }
      setShowForm(false);
      setEditing(null);
      resetForm();
      loadServices();
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || 'Une erreur est survenue');
    }
  };

  const toggleActive = async (service: Service) => {
    try {
      await servicesApi.toggleActive(service._id);
      loadServices();
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || 'Erreur');
    }
  };

  const deleteService = async (id: string) => {
    if (!confirm('Supprimer ce service ?')) return;
    try {
      await servicesApi.delete(id);
      loadServices();
      showAlert('success', 'Service supprimé');
    } catch {
      showAlert('error', 'Erreur lors de la suppression');
    }
  };

  const openEditForm = (service: Service) => {
    setEditing(service);
    setForm({
      name: service.name,
      category: service.category,
      description: service.description,
      duration: service.duration,
      images: service.images || [],
    });
    setShowForm(true);
  };

  // ✅ Nouvelle fonction : naviguer vers la page de localisation avec le serviceId
  const goToLocation = (serviceId: string) => {
    router.push(`/provider/location?serviceId=${serviceId}`);
  };

  // ✅ Nouvelle fonction : naviguer vers la page de disponibilités avec le serviceId
  const goToAvailability = (serviceId: string) => {
    router.push(`/provider/availability?serviceId=${serviceId}`);
  };

  if (loading) {
    return (
      <div className="prov-services-loading">
        <div className="spinner" />
        <p className="text-muted" style={{ fontSize: '0.875rem' }}>Chargement des services…</p>
      </div>
    );
  }

  return (
    <div className="prov-services-page">
      <div className="prov-services-container">

        {/* ── Header ── */}
        <div className="prov-services-header">
          <div>
            <h1 className="prov-services-title">
              <ServicesIcon className="w-7 h-7" />
              Mes Services
            </h1>
            <p className="prov-services-subtitle">Gérez les services proposés à vos clients</p>
          </div>

          {!showForm && (
            <button
              className="prov-services-add-btn"
              onClick={() => { setShowForm(true); setEditing(null); resetForm(); }}
            >
              <PlusIcon className="w-4 h-4" />
              Ajouter un service
            </button>
          )}
        </div>

        {/* ── Alert ── */}
        {alertMsg && (
          <div className={`prov-services-alert ${alertMsg.type}`}>
            {alertMsg.type === 'success'
              ? <CheckCircleIcon className="w-4 h-4" />
              : <XCircleIcon className="w-4 h-4" />}
            {alertMsg.text}
          </div>
        )}

        {/* ── Form Panel ── */}
        {showForm && (
          <div className="prov-services-form-panel">
            <h3 className="prov-services-form-title">
              {editing
                ? <><PencilIcon className="w-5 h-5" /> Modifier le service</>
                : <><PlusIcon className="w-5 h-5" /> Nouveau service</>}
            </h3>

            {/* Info : localisation à faire séparément */}
            {!editing && (
              <div className="prov-services-info-banner">
                ℹ️ Après la création, vous pourrez ajouter la <strong>localisation</strong> et les <strong>disponibilités</strong> depuis la liste des services.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="prov-services-form-grid">

                {/* Nom */}
                <div className="prov-services-field">
                  <label className="prov-services-label">Nom du service *</label>
                  <input
                    type="text"
                    className="prov-services-input"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Ex : Coupe + Brushing"
                    required
                  />
                </div>

                {/* Catégorie */}
                <div className="prov-services-field">
                  <label className="prov-services-label">Catégorie *</label>
                  <select
                    className="prov-services-select"
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value as CategoryKey })}
                    required
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.key} value={cat.key}>{cat.frenchLabel}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="prov-services-field prov-services-form-full">
                  <label className="prov-services-label">Description *</label>
                  <textarea
                    className="prov-services-textarea"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Décrivez votre service en détail…"
                    rows={4}
                    required
                  />
                </div>

                {/* Durée */}
                <div className="prov-services-field">
                  <label className="prov-services-label">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <ClockIcon className="w-3 h-3" /> Durée (minutes)
                    </span>
                  </label>
                  <input
                    type="number"
                    className="prov-services-input"
                    value={form.duration}
                    onChange={e => setForm({ ...form, duration: +e.target.value })}
                    min={15}
                    step={15}
                  />
                </div>

                {/* Photos */}
                <div className="prov-services-field prov-services-form-full">
                  <label className="prov-services-label">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CameraIcon className="w-3 h-3" /> Photos du service
                    </span>
                  </label>
                  <div className="prov-services-images-grid">
                    {form.images?.map((img, idx) => (
                      <div key={idx} className="prov-services-img-thumb">
                        <img src={getImageUrl(img) || ''} alt="" />
                        <button
                          type="button"
                          className="prov-services-img-remove"
                          onClick={() => removeImage(idx)}
                          aria-label="Supprimer l'image"
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="prov-services-img-add"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <CameraIcon className="w-5 h-5" />
                      <span>Ajouter</span>
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  {uploadingImages && (
                    <div className="prov-services-upload-progress">
                      <Loader2Icon className="w-3 h-3 animate-spin" />
                      Upload en cours… {Math.round(uploadProgress)}%
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="prov-services-form-actions">
                  <button
                    type="button"
                    className="prov-services-cancel-btn"
                    onClick={() => { setShowForm(false); setEditing(null); resetForm(); }}
                  >
                    <XMarkIcon className="w-4 h-4" /> Annuler
                  </button>
                  <button type="submit" className="prov-services-submit-btn">
                    <SaveIcon className="w-4 h-4" />
                    {editing ? 'Mettre à jour' : 'Créer le service'}
                  </button>
                </div>

              </div>
            </form>
          </div>
        )}

        {/* ── Empty State ── */}
        {services.length === 0 && !showForm && (
          <div className="prov-services-empty">
            <div className="prov-services-empty-icon">
              <ServicesIcon className="w-8 h-8" />
            </div>
            <h3 className="prov-services-empty-title">Aucun service pour le moment</h3>
            <p className="prov-services-empty-text">
              Ajoutez votre premier service pour commencer à recevoir des réservations.
            </p>
            <button className="prov-services-add-btn" onClick={() => setShowForm(true)}>
              <PlusIcon className="w-4 h-4" /> Ajouter un service
            </button>
          </div>
        )}

        {/* ── Services Grid ── */}
        {services.length > 0 && !showForm && (
          <div className="prov-services-grid">
            {services.map(service => {
              const categoryInfo = getCategoryByKey(service.category);
              const firstImage = service.images?.[0] ? getImageUrl(service.images[0]) : null;
              const hasLocation =
                service.location?.coordinates &&
                service.location.coordinates[0] !== 0 &&
                service.location.coordinates[1] !== 0 &&
                !!service.location.address;

              return (
                <div key={service._id} className="prov-service-card">

                  {/* Image */}
                  <div className="prov-service-card-image">
                    {firstImage ? (
                      <img src={firstImage} alt={service.name} />
                    ) : (
                      <div className="prov-service-card-placeholder">
                        {categoryInfo
                          ? <categoryInfo.IconComponent className="w-10 h-10" />
                          : <ServicesIcon className="w-10 h-10" />}
                      </div>
                    )}

                    <span className={`prov-service-card-badge ${service.isActive ? 'active' : 'inactive'}`}>
                      {service.isActive ? 'Actif' : 'Inactif'}
                    </span>

                    {service.isPendingApproval && (
                      <span className="prov-service-card-pending">
                        <ClockIcon className="w-3 h-3" /> En attente
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="prov-service-card-body">
                    <h3 className="prov-service-card-name">{service.name}</h3>
                    <p className="prov-service-card-desc">{service.description}</p>
                    <div className="prov-service-card-meta">
                      <ClockIcon className="w-3 h-3" />
                      {service.duration} min
                    </div>
                    {/* Indicateurs d'état */}
                    <div className="prov-service-card-status-row">
                      <button
                        onClick={() => goToLocation(service._id)}
                        className={`prov-service-status-tag ${hasLocation ? 'done' : 'missing'} clickable`}
                      >
                        <MapPinIcon className="w-3 h-3" />
                        {hasLocation ? 'Position définie' : 'Position manquante'}
                      </button>
                      <button
                        onClick={() => goToAvailability(service._id)}
                        className={`prov-service-status-tag ${service.slots?.length ? 'done' : 'missing'} clickable`}
                      >
                        <CalendarIcon className="w-3 h-3" />
                        {service.slots?.length ? `${service.slots.length} créneaux` : 'Pas de créneaux'}
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="prov-service-card-actions">
                    {/* ✅ Bouton Localisation - navigue vers /provider/location avec serviceId */}
                    <button
                      onClick={() => goToLocation(service._id)}
                      className={`prov-service-action-link ${hasLocation ? 'has-location' : 'no-location'}`}
                    >
                      <MapPinIcon className="w-3 h-3" />
                      {hasLocation ? 'Localisation' : 'Ajouter position'}
                    </button>

                    {/* ✅ Bouton Disponibilités - navigue vers /provider/availability avec serviceId */}
                    <button
                      onClick={() => goToAvailability(service._id)}
                      className="prov-service-action-link availability"
                    >
                      <CalendarIcon className="w-3 h-3" />
                      Disponibilités
                    </button>

                    <button
                      className="prov-service-action-btn toggle"
                      onClick={() => toggleActive(service)}
                      disabled={service.isPendingApproval}
                      title={service.isPendingApproval ? 'En attente d\'approbation admin' : ''}
                    >
                      {service.isActive ? 'Désactiver' : 'Activer'}
                    </button>

                    <button
                      className="prov-service-action-btn edit"
                      onClick={() => openEditForm(service)}
                    >
                      <PencilIcon className="w-3 h-3" />
                      Modifier
                    </button>

                    <button
                      className="prov-service-action-btn delete"
                      onClick={() => deleteService(service._id)}
                    >
                      <TrashIcon className="w-3 h-3" />
                      Supprimer
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