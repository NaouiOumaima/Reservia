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

// Fonction pour compresser l'image
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

// Fonction pour obtenir l'URL de l'image
const getImageUrl = (ad: Advertisement): string | null => {
  const imageValue = ad.imageBase64 || ad.imageUrl;
  
  if (!imageValue) {
    return null;
  }
  
  if (imageValue.startsWith('http://') || imageValue.startsWith('https://')) {
    return imageValue;
  }
  
  if (imageValue.startsWith('data:')) {
    return imageValue;
  }
  
  if (imageValue.startsWith('/uploads/')) {
    return `http://localhost:3001${imageValue}`;
  }
  
  return imageValue;
};

// Composant Carte d'annonce
function AdvertisementCard({ ad, onDelete, onRefresh }: { ad: Advertisement; onDelete: (id: string) => void; onRefresh: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imageUrl = getImageUrl(ad);

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

  const isActive = ad.status === 'active';

  return (
    <div className="card hover:shadow-lg transition-all duration-300 animate-fadeInUp">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Image */}
        <div className="md:w-48 h-32 bg-surface-raised rounded-lg overflow-hidden flex-shrink-0">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={ad.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-surface-overlay gap-1">
              <ImageIcon className="w-8 h-8 text-muted" />
              <span className="text-xs text-muted">Pas d'image</span>
            </div>
          )}
        </div>
        
        {/* Contenu */}
        <div className="flex-1">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-semibold text-foreground text-lg">{ad.title}</h3>
              <p className="text-muted text-sm mt-1 line-clamp-2">{ad.description}</p>
            </div>
            <div className="flex gap-2">
              <span className={`badge ${isActive ? 'badge-success' : 'badge-secondary'}`}>
                {isActive ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </div>
          
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
            {ad.discountCode && (
              <div className="flex items-center gap-1">
                <DiscountIcon className="w-3 h-3" />
                <span>Code: {ad.discountCode}</span>
                {ad.discountPercentage && <span>(-{ad.discountPercentage}%)</span>}
              </div>
            )}
            {ad.validUntil && (
              <div className="flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" />
                <span>Expire le: {new Date(ad.validUntil).toLocaleDateString('fr-FR')}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <EyeIcon className="w-3 h-3" />
              <span>{ad.viewsCount} vues</span>
            </div>
            <div className="flex items-center gap-1">
              <ClockIcon className="w-3 h-3" />
              <span>Créée le: {new Date(ad.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-row md:flex-col gap-2">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn btn-sm bg-error/10 text-error hover:bg-error hover:text-white transition-colors"
          >
            {deleting ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <TrashIcon className="w-4 h-4" />}
            Supprimer
          </button>
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
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    discountCode: '',
    discountPercentage: '',
    validUntil: '',
  });

  // Charger les annonces
  const loadAdvertisements = useCallback(async () => {
    setLoadingAds(true);
    try {
      const timestamp = Date.now();
      const response = await apiClient.get(`/advertisements/provider?t=${timestamp}`);
      console.log('Annonces reçues:', response.data);
      setAdvertisements(response.data);
    } catch (error) {
      console.error('Erreur chargement annonces:', error);
      toast.error('Erreur lors du chargement des annonces');
    } finally {
      setLoadingAds(false);
    }
  }, []);

  // Recharger quand on change d'onglet
  useEffect(() => {
    if (activeTab === 'active' || activeTab === 'archived') {
      loadAdvertisements();
    }
  }, [activeTab, loadAdvertisements]);

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

  // Filtrer les annonces
  const activeAds = advertisements.filter(ad => ad.status === 'active');
  const archivedAds = advertisements.filter(ad => ad.status !== 'active');

  return (
    <>
      <Toaster position="top-right" />

      <div className="admin-users-page">
        <div className="admin-users-container max-w-4xl">

          {/* Header */}
          <div className="admin-users-header animate-fadeIn">
            <button onClick={() => router.back()} className="btn btn-ghost btn-sm mb-4">
              <ChevronLeftIcon className="w-4 h-4" />
              Retour
            </button>
            <h1 className="admin-users-title">Gestion des annonces</h1>
            <p className="admin-users-subtitle">Créez et gérez vos annonces publicitaires</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-[rgb(var(--border))]">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 font-medium transition-all ${
                activeTab === 'create'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <MegaphoneIcon className="w-4 h-4 inline mr-2" />
              Créer
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 font-medium transition-all ${
                activeTab === 'active'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <CheckCircleIcon className="w-4 h-4 inline mr-2" />
              Actives ({activeAds.length})
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`px-4 py-2 font-medium transition-all ${
                activeTab === 'archived'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <ArchiveIcon className="w-4 h-4 inline mr-2" />
              Archives ({archivedAds.length})
            </button>
          </div>

          {/* Onglet Création */}
          {activeTab === 'create' && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Image section */}
              <div className="card animate-fadeInUp">
                <label className="label mb-3 flex items-center gap-2">
                  <UploadIcon className="w-4 h-4" />
                  Image *
                </label>
                <div className="border-2 border-dashed border-[rgb(var(--border))] rounded-lg p-8 text-center transition-all hover:border-primary cursor-pointer">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img src={imagePreview} alt="Aperçu" className="w-80 h-48 object-cover rounded-md shadow-md" />
                      <button type="button" onClick={() => setImagePreview(null)} className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-error text-white flex items-center justify-center hover:scale-110 transition-transform">
                        <CloseIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <UploadIcon className="w-12 h-12 text-subtle mx-auto mb-3" />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <span className="text-primary font-semibold hover:underline">Choisir une image</span>
                        <input id="image-upload" type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleImageSelect} className="hidden" />
                      </label>
                      <p className="text-subtle text-xs mt-3">PNG, JPG, GIF, WEBP — max 5MB</p>
                    </>
                  )}
                </div>
              </div>

              {/* Title */}
              <div className="card animate-fadeInUp">
                <label className="label">Titre *</label>
                <input type="text" required value={formData.title} onChange={set('title')} className="input" placeholder="Ex: -20% sur tous nos services" />
              </div>

              {/* Description */}
              <div className="card animate-fadeInUp">
                <label className="label">Description *</label>
                <textarea required rows={4} value={formData.description} onChange={set('description')} className="input resize-y" placeholder="Détails de votre offre..." />
              </div>

              {/* Promo offer */}
              <div className="card animate-fadeInUp">
                <div className="flex items-center gap-2 mb-4">
                  <TagIcon className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-semibold text-foreground m-0">Offre promotionnelle</h3>
                  <span className="badge badge-primary">Optionnel</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Code promo</label>
                    <input type="text" value={formData.discountCode} onChange={e => setFormData(p => ({ ...p, discountCode: e.target.value.toUpperCase() }))} className="input uppercase tracking-wide font-mono" placeholder="PROMO20" />
                  </div>
                  <div>
                    <label className="label">Réduction (%)</label>
                    <input type="number" min="1" max="100" value={formData.discountPercentage} onChange={set('discountPercentage')} className="input" placeholder="20" />
                  </div>
                </div>
              </div>

              {/* Expiration date */}
              <div className="card animate-fadeInUp">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarIcon className="w-4 h-4 text-muted" />
                  <label className="label m-0">Date d'expiration</label>
                  <span className="badge bg-surface-raised text-foreground-muted">Optionnel</span>
                </div>
                <input type="date" value={formData.validUntil} onChange={set('validUntil')} className="input" min={new Date().toISOString().split('T')[0]} />
                <p className="text-subtle text-xs mt-2">Laissez vide pour une durée illimitée</p>
              </div>

              {/* Information panel */}
              <div className="bg-primary-soft rounded-lg p-4 animate-fadeInUp">
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground m-0">Envoyée à tous les clients actifs</p>
                    <p className="text-foreground-muted text-xs mt-1 m-0">L'annonce sera envoyée uniquement aux clients avec un compte activé et non banni.</p>
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <button type="submit" disabled={loading || !imagePreview} className="btn btn-primary btn-lg w-full animate-fadeInUp">
                {loading ? <><Loader2Icon className="w-5 h-5 animate-spin" /> Création...</> : <><MegaphoneIcon className="w-5 h-5" /> Publier</>}
              </button>
            </form>
          )}

          {/* Onglet Annonces Actives */}
          {activeTab === 'active' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-foreground">Actives ({activeAds.length})</h2>
                <button onClick={loadAdvertisements} className="btn btn-ghost btn-sm"><RefreshIcon className="w-4 h-4" /> Rafraîchir</button>
              </div>
              {loadingAds ? (
                <div className="text-center py-12"><Loader2Icon className="w-8 h-8 animate-spin text-primary mx-auto" /><p className="text-muted mt-2">Chargement...</p></div>
              ) : activeAds.length === 0 ? (
                <div className="text-center py-12 bg-surface rounded-lg border border-border"><MegaphoneIcon className="w-12 h-12 text-muted mx-auto mb-3" /><h3 className="text-lg font-semibold text-foreground">Aucune annonce active</h3></div>
              ) : (
                activeAds.map((ad) => <AdvertisementCard key={ad._id} ad={ad} onDelete={() => loadAdvertisements()} onRefresh={loadAdvertisements} />)
              )}
            </div>
          )}

          {/* Onglet Archives */}
          {activeTab === 'archived' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-foreground">Archives ({archivedAds.length})</h2>
                <button onClick={loadAdvertisements} className="btn btn-ghost btn-sm"><RefreshIcon className="w-4 h-4" /> Rafraîchir</button>
              </div>
              {loadingAds ? (
                <div className="text-center py-12"><Loader2Icon className="w-8 h-8 animate-spin text-primary mx-auto" /><p className="text-muted mt-2">Chargement...</p></div>
              ) : archivedAds.length === 0 ? (
                <div className="text-center py-12 bg-surface rounded-lg border border-border"><ArchiveIcon className="w-12 h-12 text-muted mx-auto mb-3" /><h3 className="text-lg font-semibold text-foreground">Aucune annonce archivée</h3></div>
              ) : (
                archivedAds.map((ad) => <AdvertisementCard key={ad._id} ad={ad} onDelete={() => loadAdvertisements()} onRefresh={loadAdvertisements} />)
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}