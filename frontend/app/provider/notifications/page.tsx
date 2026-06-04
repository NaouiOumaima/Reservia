'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { apiClient } from '@/lib/api/config';
import {
  ChevronLeftIcon,
  TagIcon,
  CalendarIcon,
  Loader2Icon,
  UploadIcon,
  MegaphoneIcon,
  CloseIcon,
  CheckCircleIcon,
  EyeIcon,
  TrashIcon,
  ArchiveIcon,
  RefreshIcon,
  DiscountIcon,
  ClockIcon,
  ImageIcon,
} from '@/components/ui/Icons';

interface FormData {
  title: string;
  description: string;
  discountCode: string;
  discountPercentage: string;
  validUntil: string;
}

interface Advertisement {
  _id: string;
  title: string;
  description: string;
  imageBase64?: string;
  imageUrl?: string;
  providerId: string;
  providerName: string;
  discountCode?: string;
  discountPercentage?: number;
  validUntil?: string;
  status: string;
  viewsCount: number;
  clicksCount: number;
  createdAt: string;
  updatedAt: string;
}

type TabType = 'create' | 'active' | 'archived';

const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

const getImageUrl = (ad: Advertisement): string | null => {
  const imageValue = ad.imageBase64 || ad.imageUrl;
  if (!imageValue) return null;
  if (imageValue.startsWith('http://') || imageValue.startsWith('https://')) return imageValue;
  if (imageValue.startsWith('data:')) return imageValue;
  if (imageValue.startsWith('/uploads/')) return `http://localhost:3001${imageValue}`;
  return imageValue;
};

function AdvertisementCard({ ad, onDelete, onRefresh }: { ad: Advertisement; onDelete: (id: string) => void; onRefresh: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imageUrl = getImageUrl(ad);
  const isActive = ad.status === 'active';

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/advertisements/${ad._id}`);
      toast.success('Annonce supprimée');
      onRefresh();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="ad-card">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-48 flex-shrink-0">
          {imageUrl && !imageError ? (
            <img src={imageUrl} alt={ad.title} className="ad-card-image" onError={() => setImageError(true)} />
          ) : (
            <div className="ad-card-image-placeholder">
              <ImageIcon className="w-8 h-8" />
              <span className="text-xs text-subtle">Pas d'image</span>
            </div>
          )}
        </div>
        
        <div className="ad-card-content flex-1">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <h3 className="ad-card-title">{ad.title}</h3>
              <p className="ad-card-description">{ad.description}</p>
            </div>
            <span className={`badge ${isActive ? 'badge-success' : 'badge-secondary'}`}>
              {isActive ? 'Actif' : 'Inactif'}
            </span>
          </div>
          
          <div className="ad-card-meta">
            {ad.discountCode && (
              <div className="ad-card-meta-item">
                <DiscountIcon className="w-3 h-3" />
                <span>Code: {ad.discountCode}</span>
                {ad.discountPercentage && <span>(-{ad.discountPercentage}%)</span>}
              </div>
            )}
            {ad.validUntil && (
              <div className="ad-card-meta-item">
                <CalendarIcon className="w-3 h-3" />
                <span>Expire: {new Date(ad.validUntil).toLocaleDateString('fr-FR')}</span>
              </div>
            )}
            <div className="ad-card-meta-item">
              <EyeIcon className="w-3 h-3" />
              <span>{ad.viewsCount} vues</span>
            </div>
            <div className="ad-card-meta-item">
              <ClockIcon className="w-3 h-3" />
              <span>Créée: {new Date(ad.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
          
          <div className="ad-card-actions">
            <button onClick={handleDelete} disabled={deleting} className="btn btn-sm bg-error/10 text-error hover:bg-error hover:text-white">
              {deleting ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <TrashIcon className="w-4 h-4" />}
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProviderNotificationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('create');
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loadingAds, setLoadingAds] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    discountCode: '',
    discountPercentage: '',
    validUntil: '',
  });

  const loadAdvertisements = useCallback(async () => {
    setLoadingAds(true);
    try {
      const timestamp = Date.now();
      const response = await apiClient.get(`/advertisements/provider?t=${timestamp}`);
      setAdvertisements(response.data);
    } catch (error) {
      console.error('Erreur chargement annonces:', error);
      toast.error('Erreur lors du chargement des annonces');
    } finally {
      setLoadingAds(false);
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdvertisements();
  }, [loadAdvertisements]);

  const activeAds = advertisements.filter(ad => ad.status === 'active');
  const archivedAds = advertisements.filter(ad => ad.status !== 'active');

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5MB");
      return;
    }

    toast.loading('Compression de l\'image...', { id: 'compress' });
    
    try {
      const compressedImage = await compressImage(file, 800, 0.7);
      setImagePreview(compressedImage);
      toast.success('Image prête !', { id: 'compress' });
    } catch (error) {
      console.error('Erreur compression:', error);
      toast.error('Erreur lors de la compression', { id: 'compress' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview) {
      toast.error('Veuillez ajouter une image');
      return;
    }
    
    setLoading(true);
    try {
      await apiClient.post('/advertisements', {
        title: formData.title,
        description: formData.description,
        imageBase64: imagePreview,
        discountCode: formData.discountCode || undefined,
        discountPercentage: formData.discountPercentage ? Number(formData.discountPercentage) : undefined,
        validUntil: formData.validUntil || undefined,
      });
      toast.success('Annonce créée !');
      
      setFormData({
        title: '',
        description: '',
        discountCode: '',
        discountPercentage: '',
        validUntil: '',
      });
      setImagePreview(null);
      loadAdvertisements();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const set = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setFormData(p => ({ ...p, [key]: e.target.value }));

  return (
    <>
      <Toaster position="top-right" />

      <div className="provider-notifications-page">
        <div className="notifications-container">

          {/* Header */}
          <div className="notifications-header">
            <button onClick={() => router.back()} className="btn btn-ghost btn-sm mb-4">
              <ChevronLeftIcon className="w-4 h-4" />
              Retour
            </button>
            <h1>Gestion des annonces</h1>
            <p className="notifications-subtitle">Créez et gérez vos annonces publicitaires</p>
          </div>

          {/* Stats Row */}
          <div className="stats-row animate-fadeInUp">
            <div className="stat-card-mini">
              <div className="stat-card-mini-value">{activeAds.length}</div>
              <div className="stat-card-mini-label">Actives</div>
            </div>
            <div className="stat-card-mini">
              <div className="stat-card-mini-value">{archivedAds.length}</div>
              <div className="stat-card-mini-label">Archivées</div>
            </div>
            <div className="stat-card-mini">
              <div className="stat-card-mini-value">{advertisements.length}</div>
              <div className="stat-card-mini-label">Total</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="notifications-tabs">
            <button
              onClick={() => setActiveTab('create')}
              className={`notifications-tab ${activeTab === 'create' ? 'active' : ''}`}
            >
              <MegaphoneIcon className="w-4 h-4" />
              Créer
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`notifications-tab ${activeTab === 'active' ? 'active' : ''}`}
            >
              <CheckCircleIcon className="w-4 h-4" />
              Actives
              {!initialLoading && (
                <span className="notifications-tab-badge">{activeAds.length}</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`notifications-tab ${activeTab === 'archived' ? 'active' : ''}`}
            >
              <ArchiveIcon className="w-4 h-4" />
              Archives
              {!initialLoading && (
                <span className="notifications-tab-badge">{archivedAds.length}</span>
              )}
            </button>
          </div>

          {/* Loading State */}
          {initialLoading && (
            <div className="loading-spinner">
              <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted">Chargement de vos annonces...</p>
            </div>
          )}

          {/* Onglet Création */}
          {!initialLoading && activeTab === 'create' && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Image Upload */}
              <div className="form-section">
                <div className="form-section-title">
                  <UploadIcon className="w-5 h-5 text-primary" />
                  Image
                  <span className="badge badge-primary ml-2">Obligatoire</span>
                </div>
                <div className="image-upload-zone" onClick={() => document.getElementById('image-upload')?.click()}>
                  {imagePreview ? (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Aperçu" className="image-preview-img" />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setImagePreview(null); }}
                        className="image-preview-remove"
                      >
                        <CloseIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <UploadIcon className="image-upload-icon" />
                      <p className="text-muted mb-2">Cliquez ou glissez une image</p>
                      <input id="image-upload" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageSelect} className="hidden" />
                      <p className="text-subtle text-xs">PNG, JPG, WEBP — max 5MB</p>
                    </>
                  )}
                </div>
              </div>

              {/* Title */}
              <div className="form-section">
                <label className="label">Titre</label>
                <input type="text" required value={formData.title} onChange={set('title')} className="input" placeholder="Ex: -20% sur tous nos services" />
              </div>

              {/* Description */}
              <div className="form-section">
                <label className="label">Description</label>
                <textarea required rows={4} value={formData.description} onChange={set('description')} className="input resize-y" placeholder="Détails de votre offre..." />
              </div>

              {/* Promo Offer */}
              <div className="form-section">
                <div className="form-section-title">
                  <TagIcon className="w-5 h-5 text-primary" />
                  Offre promotionnelle
                  <span className="badge badge-primary ml-2">Optionnel</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Code promo</label>
                    <input
                      type="text"
                      value={formData.discountCode}
                      onChange={e => setFormData(p => ({ ...p, discountCode: e.target.value.toUpperCase() }))}
                      className="input uppercase tracking-wide font-mono"
                      placeholder="PROMO20"
                    />
                  </div>
                  <div>
                    <label className="label">Réduction (%)</label>
                    <input type="number" min="1" max="100" value={formData.discountPercentage} onChange={set('discountPercentage')} className="input" placeholder="20" />
                  </div>
                </div>
              </div>

              {/* Expiration Date */}
              <div className="form-section">
                <div className="form-section-title">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  Date d'expiration
                  <span className="badge badge-primary ml-2">Optionnel</span>
                </div>
                <input type="date" value={formData.validUntil} onChange={set('validUntil')} className="input" min={new Date().toISOString().split('T')[0]} />
                <p className="text-subtle text-xs mt-2">Laissez vide pour une durée illimitée</p>
              </div>

              {/* Info Panel */}
              <div className="info-panel">
                <div className="info-panel-content">
                  <CheckCircleIcon className="info-panel-icon w-5 h-5" />
                  <div>
                    <p className="info-panel-title">Envoyée à tous les clients actifs</p>
                    <p className="info-panel-text">L'annonce sera envoyée uniquement aux clients avec un compte activé et non banni.</p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button type="submit" disabled={loading || !imagePreview} className="btn btn-primary btn-lg w-full">
                {loading ? (
                  <><Loader2Icon className="w-5 h-5 animate-spin" /> Création...</>
                ) : (
                  <><MegaphoneIcon className="w-5 h-5" /> Publier l'annonce</>
                )}
              </button>
            </form>
          )}

          {/* Onglet Annonces Actives */}
          {!initialLoading && activeTab === 'active' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-foreground">Actives ({activeAds.length})</h2>
                <button onClick={loadAdvertisements} className="btn btn-ghost btn-sm" disabled={loadingAds}>
                  {loadingAds ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <RefreshIcon className="w-4 h-4" />}
                  Rafraîchir
                </button>
              </div>

              {loadingAds ? (
                <div className="loading-spinner">
                  <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-muted">Chargement...</p>
                </div>
              ) : activeAds.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <MegaphoneIcon className="w-8 h-8" />
                  </div>
                  <h3 className="empty-state-title">Aucune annonce active</h3>
                  <p className="empty-state-text">Créez votre première annonce dans l'onglet "Créer"</p>
                </div>
              ) : (
                activeAds.map((ad) => (
                  <AdvertisementCard key={ad._id} ad={ad} onDelete={() => loadAdvertisements()} onRefresh={loadAdvertisements} />
                ))
              )}
            </div>
          )}

          {/* Onglet Archives */}
          {!initialLoading && activeTab === 'archived' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-foreground">Archives ({archivedAds.length})</h2>
                <button onClick={loadAdvertisements} className="btn btn-ghost btn-sm" disabled={loadingAds}>
                  {loadingAds ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <RefreshIcon className="w-4 h-4" />}
                  Rafraîchir
                </button>
              </div>

              {loadingAds ? (
                <div className="loading-spinner">
                  <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-muted">Chargement...</p>
                </div>
              ) : archivedAds.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <ArchiveIcon className="w-8 h-8" />
                  </div>
                  <h3 className="empty-state-title">Aucune annonce archivée</h3>
                  <p className="empty-state-text">Les annonces expirées apparaîtront ici</p>
                </div>
              ) : (
                archivedAds.map((ad) => (
                  <AdvertisementCard key={ad._id} ad={ad} onDelete={() => loadAdvertisements()} onRefresh={loadAdvertisements} />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}