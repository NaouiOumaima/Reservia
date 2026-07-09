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
    <div className="card p-0 overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-48 flex-shrink-0">
          {imageUrl && !imageError ? (
            <img src={imageUrl} alt={ad.title} className="w-full h-32 object-cover" onError={() => setImageError(true)} />
          ) : (
            <div className="w-full h-32 flex flex-col items-center justify-center bg-surface-raised text-muted">
              <ImageIcon className="w-8 h-8" />
              <span className="text-xs">Pas d&apos;image</span>
            </div>
          )}
        </div>
        
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-semibold text-foreground">{ad.title}</h3>
              <p className="text-sm text-muted line-clamp-2">{ad.description}</p>
            </div>
            <span className={`badge ${isActive ? 'badge-success' : 'badge-secondary'}`}>
              {isActive ? 'Actif' : 'Inactif'}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-4 text-xs text-muted mt-2">
            {ad.discountCode && (
              <span className="flex items-center gap-1">
                <DiscountIcon className="w-3 h-3" />
                Code: {ad.discountCode} {ad.discountPercentage && `(-${ad.discountPercentage}%)`}
              </span>
            )}
            {ad.validUntil && (
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" />
                Expire: {new Date(ad.validUntil).toLocaleDateString('fr-FR')}
              </span>
            )}
            <span className="flex items-center gap-1">
              <EyeIcon className="w-3 h-3" />
              {ad.viewsCount} vues
            </span>
            <span className="flex items-center gap-1">
              <ClockIcon className="w-3 h-3" />
              Créée: {new Date(ad.createdAt).toLocaleDateString('fr-FR')}
            </span>
          </div>
          
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="btn btn-ghost btn-sm text-error hover:bg-error/10"
            >
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

      <div className="bg-background min-h-screen py-8">
        <div className="container-app">

          <div className="mb-8">
            <button onClick={() => router.back()} className="btn btn-ghost btn-sm mb-4">
              <ChevronLeftIcon className="w-4 h-4" />
              Retour
            </button>
            <h1 className="text-2xl font-bold gradient-text">Gestion des annonces</h1>
            <p className="text-muted mt-1">Créez et gérez vos annonces publicitaires</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6 animate-fadeInUp">
            <div className="card text-center py-3">
              <div className="text-2xl font-bold text-primary">{activeAds.length}</div>
              <div className="text-sm text-muted">Actives</div>
            </div>
            <div className="card text-center py-3">
              <div className="text-2xl font-bold text-foreground">{archivedAds.length}</div>
              <div className="text-sm text-muted">Archivées</div>
            </div>
            <div className="card text-center py-3">
              <div className="text-2xl font-bold text-foreground">{advertisements.length}</div>
              <div className="text-sm text-muted">Total</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6 border-b border-border pb-2">
            <button
              onClick={() => setActiveTab('create')}
              className={`btn ${activeTab === 'create' ? 'btn-primary' : 'btn-ghost'}`}
            >
              <MegaphoneIcon className="w-4 h-4" />
              Créer
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`btn ${activeTab === 'active' ? 'btn-primary' : 'btn-ghost'}`}
            >
              <CheckCircleIcon className="w-4 h-4" />
              Actives
              {!initialLoading && (
                <span className="badge badge-primary ml-1">{activeAds.length}</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`btn ${activeTab === 'archived' ? 'btn-primary' : 'btn-ghost'}`}
            >
              <ArchiveIcon className="w-4 h-4" />
              Archives
              {!initialLoading && (
                <span className="badge badge-primary ml-1">{archivedAds.length}</span>
              )}
            </button>
          </div>

          {initialLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted">Chargement de vos annonces...</p>
            </div>
          )}

          {!initialLoading && activeTab === 'create' && (
            <form onSubmit={handleSubmit} className="space-y-6">

              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <UploadIcon className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">Image</span>
                  <span className="badge badge-primary">Obligatoire</span>
                </div>
                <div
                  className="border-2 border-dashed border-border rounded-app p-6 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img src={imagePreview} alt="Aperçu" className="max-w-xs max-h-48 rounded-app shadow-md" />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setImagePreview(null); }}
                        className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-error text-white flex items-center justify-center border-2 border-surface"
                      >
                        <CloseIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <UploadIcon className="w-12 h-12 mx-auto text-muted mb-4" />
                      <p className="text-muted mb-2">Cliquez ou glissez une image</p>
                      <input id="image-upload" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageSelect} className="hidden" />
                      <p className="text-xs text-subtle">PNG, JPG, WEBP — max 5MB</p>
                    </>
                  )}
                </div>
              </div>

              <div className="card">
                <label className="label">Titre</label>
                <input type="text" required value={formData.title} onChange={set('title')} className="input" placeholder="Ex: -20% sur tous nos services" />
              </div>

              <div className="card">
                <label className="label">Description</label>
                <textarea required rows={4} value={formData.description} onChange={set('description')} className="input resize-y" placeholder="Détails de votre offre..." />
              </div>

              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <TagIcon className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">Offre promotionnelle</span>
                  <span className="badge badge-primary">Optionnel</span>
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

              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">Date d&apos;expiration</span>
                  <span className="badge badge-primary">Optionnel</span>
                </div>
                <input type="date" value={formData.validUntil} onChange={set('validUntil')} className="input" min={new Date().toISOString().split('T')[0]} />
                <p className="text-xs text-subtle mt-2">Laissez vide pour une durée illimitée</p>
              </div>

              <div className="alert alert-success">
                <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Envoyée à tous les clients actifs</p>
                  <p className="text-sm text-muted">L&apos;annonce sera envoyée uniquement aux clients avec un compte activé et non banni.</p>
                </div>
              </div>

              <button type="submit" disabled={loading || !imagePreview} className="btn btn-primary btn-lg w-full">
                {loading ? (
                  <><Loader2Icon className="w-5 h-5 animate-spin" /> Création...</>
                ) : (
                  <><MegaphoneIcon className="w-5 h-5" /> Publier l&apos;annonce</>
                )}
              </button>
            </form>
          )}

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
                <div className="flex flex-col items-center py-12 gap-4">
                  <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-muted">Chargement...</p>
                </div>
              ) : activeAds.length === 0 ? (
                <div className="card text-center py-12">
                  <div className="avatar avatar-xl bg-primary-soft text-primary mx-auto mb-4">
                    <MegaphoneIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Aucune annonce active</h3>
                  <p className="text-muted">Créez votre première annonce dans l&apos;onglet &quot;Créer&quot;</p>
                </div>
              ) : (
                activeAds.map((ad) => (
                  <AdvertisementCard key={ad._id} ad={ad} onDelete={() => loadAdvertisements()} onRefresh={loadAdvertisements} />
                ))
              )}
            </div>
          )}

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
                <div className="flex flex-col items-center py-12 gap-4">
                  <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-muted">Chargement...</p>
                </div>
              ) : archivedAds.length === 0 ? (
                <div className="card text-center py-12">
                  <div className="avatar avatar-xl bg-primary-soft text-primary mx-auto mb-4">
                    <ArchiveIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Aucune annonce archivée</h3>
                  <p className="text-muted">Les annonces expirées apparaîtront ici</p>
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