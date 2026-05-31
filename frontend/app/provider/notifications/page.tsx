// frontend/app/provider/notifications/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';
import { apiClient } from '@/lib/api/config';
import { advertisementsApi } from '@/lib/api/advertisements';
import { Advertisement } from '@/lib/api/advertisements/types';
import { useSocket } from '@/hooks/useSocket';
import {
  ChevronLeftIcon,
  TagIcon,
  CalendarIcon,
  Loader2Icon,
  UploadIcon,
  MegaphoneIcon,
  CloseIcon,
} from '@/components/ui/Icons';

type ViewMode = 'create' | 'ads' | 'archive';

interface FormData {
  title: string;
  description: string;
  imageUrl: string;
  discountCode: string;
  discountPercentage: string;
  validUntil: string;
}

const ADS_STATUSES = ['active', 'archived'];
const ARCHIVE_STATUSES = ['inactive'];

function statusLabel(status: string) {
  switch (status) {
    case 'active':   return { label: 'Active',   cls: 'text-green-600' };
    case 'archived': return { label: 'Archivée', cls: 'text-foreground' };
    case 'inactive': return { label: 'Expirée',  cls: 'text-amber-600' };
    default:         return { label: status,     cls: 'text-muted' };
  }
}

export default function ProviderCreateNotificationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [adsItems, setAdsItems] = useState<Advertisement[]>([]);
  const [archiveItems, setArchiveItems] = useState<Advertisement[]>([]);

  const [viewMode, setViewMode] = useState<ViewMode>('create');
  const [adsLoading, setAdsLoading] = useState(false);
  const { socket } = useSocket();

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    imageUrl: '',
    discountCode: '',
    discountPercentage: '',
    validUntil: '',
  });

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchAds = useCallback(async () => {
    setAdsLoading(true);
    try {
      const [activeData, archivedData, inactiveData] = await Promise.all([
        advertisementsApi.getMyAdvertisements('active'),
        advertisementsApi.getMyAdvertisements('archived'),
        advertisementsApi.getMyAdvertisements('inactive'),
      ]);
      setAdsItems([...activeData, ...archivedData]);
      setArchiveItems(inactiveData);
    } catch (error) {
      console.error('Erreur récupération des annonces:', error);
      toast.error('Impossible de charger les annonces');
    } finally {
      setAdsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (viewMode === 'ads' || viewMode === 'archive') {
      fetchAds();
    }
  }, [viewMode, fetchAds]);

  // ─── Socket ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleAdvertisementUpdate = (updatedAd: Advertisement) => {
      const inAdsTab     = ADS_STATUSES.includes(updatedAd.status);
      const inArchiveTab = ARCHIVE_STATUSES.includes(updatedAd.status);

      setAdsItems((prev) => {
        const exists = prev.some((ad) => ad._id === updatedAd._id);
        if (inAdsTab) {
          if (exists) return prev.map((ad) => (ad._id === updatedAd._id ? updatedAd : ad));
          return [updatedAd, ...prev];
        }
        return prev.filter((ad) => ad._id !== updatedAd._id);
      });

      setArchiveItems((prev) => {
        const exists = prev.some((ad) => ad._id === updatedAd._id);
        if (inArchiveTab) {
          if (exists) return prev.map((ad) => (ad._id === updatedAd._id ? updatedAd : ad));
          return [updatedAd, ...prev];
        }
        return prev.filter((ad) => ad._id !== updatedAd._id);
      });

      if (updatedAd.status === 'inactive') {
        toast(`⏰ L'annonce "${updatedAd.title}" a expiré`, {
          duration: 4000,
          style: { background: '#fef3c7', color: '#92400e' },
        });
      }
    };

    socket.on('advertisement:update', handleAdvertisementUpdate);
    return () => { socket.off('advertisement:update', handleAdvertisementUpdate); };
  }, [socket]);

  // ─── Actions ──────────────────────────────────────────────────────────────
  const handleArchiveAction = async (id: string, archive: boolean) => {
    try {
      setLoading(true);
      if (archive) {
        await advertisementsApi.archive(id);
        toast.success('Annonce archivée');
      } else {
        await advertisementsApi.unarchive(id);
        toast.success('Annonce restaurée');
      }
      await fetchAds();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  // ─── Upload image ─────────────────────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) { toast.error('Veuillez sélectionner une image'); return; }
    if (file.size > 5 * 1024 * 1024)    { toast.error("L'image ne doit pas dépasser 5MB"); return; }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    setUploadingImage(true);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const response = await apiClient.post('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData((p) => ({ ...p, imageUrl: response.data.url }));
      toast.success('Image téléchargée avec succès');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors du téléchargement');
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  // ─── Soumission ───────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) { toast.error('Veuillez ajouter une image'); return; }
    setLoading(true);
    try {
      await advertisementsApi.create({
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl,
        discountCode: formData.discountCode || undefined,
        discountPercentage: formData.discountPercentage ? Number(formData.discountPercentage) : undefined,
        validUntil: formData.validUntil || undefined,
      });
      toast.success('Annonce créée ! Les clients vont être notifiés');
      setTimeout(() => router.push('/provider/dashboard'), 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  // ─── Helpers UI ───────────────────────────────────────────────────────────
  const tabClass = (mode: ViewMode) =>
    `px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
      viewMode === mode
        ? 'bg-primary text-white border-primary'
        : 'bg-white text-muted border-border hover:bg-surface'
    }`;

  const AdCard = ({ ad, showArchiveBtn }: { ad: Advertisement; showArchiveBtn?: boolean }) => {
    const { label, cls } = statusLabel(ad.status);
    return (
      <div className="border rounded-xl p-4 bg-surface">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold truncate">{ad.title}</h3>
            <p className="text-sm text-muted mt-1 line-clamp-2">{ad.description}</p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-1 text-sm text-muted shrink-0">
            <span>Statut : <strong className={cls}>{label}</strong></span>
            {ad.validUntil && (
              <span>
                {ad.status === 'inactive' ? 'Expiré le' : "Valide jusqu'au"}{' '}
                {new Date(ad.validUntil).toLocaleDateString('fr-FR')}
              </span>
            )}
            <span>Créée le {new Date(ad.createdAt).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {showArchiveBtn && ad.status === 'active' && (
            <button type="button" disabled={loading}
              onClick={() => handleArchiveAction(ad._id, true)}
              className="px-3 py-2 rounded-lg border border-border text-sm text-muted hover:bg-surface transition-colors disabled:opacity-50">
              Archiver
            </button>
          )}
          {(ad.status === 'archived' || ad.status === 'inactive') && (
            <button type="button" disabled={loading}
              onClick={() => handleArchiveAction(ad._id, false)}
              className="px-3 py-2 rounded-lg bg-secondary text-white text-sm hover:bg-secondary/90 transition-colors disabled:opacity-50">
              Restaurer
            </button>
          )}
          <button type="button"
            onClick={() => router.push(`/provider/notifications?view=${ad._id}`)}
            className="px-3 py-2 rounded-lg border border-border text-sm text-muted hover:bg-surface transition-colors">
            Voir
          </button>
        </div>
      </div>
    );
  };

  const EmptyState = ({ msg, sub }: { msg: string; sub: string }) => (
    <div className="text-center py-12 text-muted">
      <p className="text-lg font-medium">{msg}</p>
      <p className="mt-2 text-sm">{sub}</p>
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <Toaster position="top-right" />
      <div className="admin-users-page">
        <div className="admin-users-container" style={{ maxWidth: '768px' }}>

          {/* Header */}
          <div className="admin-users-header space-y-4">
            <div className="flex items-center justify-between">
              {/* Back button removed per request */}
            </div>

            {/* Onglets */}
            <div className="flex flex-wrap gap-2">
              <button type="button" className={tabClass('create')} onClick={() => setViewMode('create')}>
                + Créer une annonce
              </button>
              <button type="button" className={tabClass('ads')} onClick={() => setViewMode('ads')}>
                Mes annonces
              </button>
              <button type="button" className={tabClass('archive')} onClick={() => setViewMode('archive')}>
                Expirées
              </button>
            </div>

            <div>
              <h1 className="admin-users-title">
                {viewMode === 'create'  && 'Créer une annonce publicitaire'}
                {viewMode === 'ads'     && 'Mes annonces'}
                {viewMode === 'archive' && 'Annonces expirées'}
              </h1>
              <p className="admin-users-subtitle">
                {viewMode === 'create'  && 'Créez une affiche qui sera envoyée à tous vos clients'}
                {viewMode === 'ads'     && 'Gérez vos annonces actives et archivées'}
                {viewMode === 'archive' && 'Annonces dont la date de validité est dépassée'}
              </p>
            </div>
          </div>

          {/* ── Création ──────────────────────────────────────────────── */}
          {viewMode === 'create' && (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Image */}
              <div className="card">
                <label className="label block mb-2">Image de l'affiche *</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg border-border hover:border-primary transition-colors">
                  <div className="space-y-1 text-center">
                    {imagePreview ? (
                      <div className="relative inline-block">
                        <Image src={imagePreview} alt="Preview" width={300} height={200} className="rounded-lg object-cover" />
                        <button type="button"
                          onClick={() => { setImagePreview(null); setFormData((p) => ({ ...p, imageUrl: '' })); }}
                          className="absolute -top-2 -right-2 bg-error text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-error/80 transition-colors">
                          <CloseIcon className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <UploadIcon className="mx-auto h-12 w-12 text-muted" />
                        <div className="flex text-sm text-muted">
                          <label htmlFor="image-upload"
                            className="relative cursor-pointer bg-surface-raised rounded-md font-medium text-primary hover:text-primary/80">
                            <span>{uploadingImage ? 'Téléchargement...' : 'Télécharger une image'}</span>
                            <input id="image-upload" name="image-upload" type="file" className="sr-only"
                              accept="image/jpeg,image/png,image/gif,image/webp"
                              onChange={handleImageUpload} disabled={uploadingImage} required={!formData.imageUrl} />
                          </label>
                          <p className="pl-1">ou glisser-déposer</p>
                        </div>
                        <p className="text-xs text-subtle">PNG, JPG, GIF, WEBP jusqu'à 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Titre */}
              <div className="card">
                <label className="label block mb-2">Titre de l'annonce *</label>
                <input type="text" required value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  className="input" placeholder="Ex: -20% sur tous nos services" />
              </div>

              {/* Description */}
              <div className="card">
                <label className="label block mb-2">Description *</label>
                <textarea required rows={4} value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  className="input" placeholder="Détails de votre offre..." />
              </div>

              {/* Réduction */}
              <div className="card">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TagIcon className="w-5 h-5 text-primary" />
                  Offre promotionnelle (optionnel)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label block mb-2">Code promo</label>
                    <input type="text" value={formData.discountCode}
                      onChange={(e) => setFormData((p) => ({ ...p, discountCode: e.target.value.toUpperCase() }))}
                      className="input uppercase" placeholder="PROMO20" />
                  </div>
                  <div>
                    <label className="label block mb-2">Réduction (%)</label>
                    <input type="number" min="0" max="100" value={formData.discountPercentage}
                      onChange={(e) => setFormData((p) => ({ ...p, discountPercentage: e.target.value }))}
                      className="input" placeholder="20" />
                  </div>
                </div>
              </div>

              {/* Date d'expiration */}
              <div className="card">
                <label className="label block mb-2">
                  <span className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    Date d'expiration (optionnel)
                  </span>
                </label>
                <input type="date" value={formData.validUntil}
                  onChange={(e) => setFormData((p) => ({ ...p, validUntil: e.target.value }))}
                  className="input" min={new Date().toISOString().split('T')[0]} />
                <p className="text-xs text-subtle mt-1">Laissez vide pour une durée illimitée</p>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading || uploadingImage} className="btn-primary w-full py-3 text-base">
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2Icon className="w-5 h-5 animate-spin" />
                    <span>Création en cours...</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <MegaphoneIcon className="w-5 h-5" />
                    Publier l'annonce
                  </span>
                )}
              </button>
            </form>
          )}

          {/* ── Mes annonces : active + archived ──────────────────────── */}
          {viewMode === 'ads' && (
            <div className="mt-6">
              <div className="card p-4">
                {adsLoading ? (
                  <div className="text-center py-12">
                    <Loader2Icon className="w-8 h-8 mx-auto animate-spin text-primary" />
                    <p className="mt-4 text-muted">Chargement des annonces...</p>
                  </div>
                ) : adsItems.length === 0 ? (
                  <EmptyState
                    msg="Aucune annonce pour le moment"
                    sub="Créez votre première annonce pour la voir apparaître ici."
                  />
                ) : (
                  <div className="space-y-4">
                    {adsItems.map((ad) => <AdCard key={ad._id} ad={ad} showArchiveBtn />)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Expirées : inactive ────────────────────────────────────── */}
          {viewMode === 'archive' && (
            <div className="mt-6">
              <div className="card p-4">
                {adsLoading ? (
                  <div className="text-center py-12">
                    <Loader2Icon className="w-8 h-8 mx-auto animate-spin text-primary" />
                    <p className="mt-4 text-muted">Chargement des annonces expirées...</p>
                  </div>
                ) : archiveItems.length === 0 ? (
                  <EmptyState
                    msg="Aucune annonce expirée"
                    sub="Les annonces dont la date de validité est dépassée apparaîtront ici automatiquement."
                  />
                ) : (
                  <div className="space-y-4">
                    {archiveItems.map((ad) => <AdCard key={ad._id} ad={ad} />)}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}