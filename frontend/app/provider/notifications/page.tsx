// frontend/app/provider/notifications/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';
import { apiClient } from '@/lib/api/config';
import { advertisementsApi } from '@/lib/api/advertisements';
import {
  ChevronLeftIcon,
  TagIcon,
  CalendarIcon,
  TargetIcon,
  Loader2Icon,
  UploadIcon,
  MegaphoneIcon,
  CloseIcon,
} from '@/components/ui/Icons';

interface FormData {
  title: string;
  description: string;
  imageUrl: string;
  discountCode: string;
  discountPercentage: string;
  validUntil: string;
  targetAudience: string;
  targetCategory: string;
  targetCity: string;
}

export default function ProviderCreateNotificationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    imageUrl: '',
    discountCode: '',
    discountPercentage: '',
    validUntil: '',
    targetAudience: 'all',
    targetCategory: '',
    targetCity: '',
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5MB');
      return;
    }

    // Preview locale
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload vers le serveur
    setUploadingImage(true);
    const formDataFile = new FormData();
    formDataFile.append('image', file);

    try {
      const response = await apiClient.post('/upload', formDataFile, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData((prev: FormData) => ({ ...prev, imageUrl: response.data.url }));
      toast.success('Image téléchargée avec succès');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Erreur lors du téléchargement');
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.imageUrl) {
      toast.error('Veuillez ajouter une image');
      return;
    }
    
    setLoading(true);

    try {
      await advertisementsApi.create({
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl,
        discountCode: formData.discountCode || undefined,
        discountPercentage: formData.discountPercentage ? Number(formData.discountPercentage) : undefined,
        validUntil: formData.validUntil || undefined,
        targetAudience: formData.targetAudience,
        targetCategory: formData.targetCategory || undefined,
        targetCity: formData.targetCity || undefined,
      });

      toast.success('Annonce créée avec succès ! Les clients vont être notifiés');
      
      setTimeout(() => {
        router.push('/provider/dashboard');
      }, 2000);
    } catch (error: any) {
      console.error('Error creating advertisement:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      
      <div className="admin-users-page">
        <div className="admin-users-container" style={{ maxWidth: '768px' }}>
          {/* Header */}
          <div className="admin-users-header">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-4"
            >
              <ChevronLeftIcon className="w-5 h-5" />
              Retour
            </button>
            <div>
              <h1 className="admin-users-title">
                Créer une annonce publicitaire
              </h1>
              <p className="admin-users-subtitle">
                Créez une affiche qui sera envoyée à vos clients
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image */}
            <div className="card">
              <label className="label block mb-2">
                Image de l'affiche *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg border-border hover:border-primary transition-colors">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={300}
                        height={200}
                        className="rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData((prev: FormData) => ({ ...prev, imageUrl: '' }));
                        }}
                        className="absolute -top-2 -right-2 bg-error text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-error/80 transition-colors"
                      >
                        <CloseIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <UploadIcon className="mx-auto h-12 w-12 text-muted" />
                      <div className="flex text-sm text-muted">
                        <label htmlFor="image-upload" className="relative cursor-pointer bg-surface-raised rounded-md font-medium text-primary hover:text-primary/80">
                          <span>{uploadingImage ? 'Téléchargement...' : 'Télécharger une image'}</span>
                          <input
                            id="image-upload"
                            name="image-upload"
                            type="file"
                            className="sr-only"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                            required={!formData.imageUrl}
                          />
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
              <label className="label block mb-2">
                Titre de l'annonce *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData((prev: FormData) => ({ ...prev, title: e.target.value }))}
                className="input"
                placeholder="Ex: -20% sur tous nos services"
              />
            </div>

            {/* Description */}
            <div className="card">
              <label className="label block mb-2">
                Description *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData((prev: FormData) => ({ ...prev, description: e.target.value }))}
                className="input"
                placeholder="Détails de votre offre..."
              />
            </div>

            {/* Options de réduction */}
            <div className="card">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <TagIcon className="w-5 h-5 text-primary" />
                Offre promotionnelle
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label block mb-2">
                    Code promo
                  </label>
                  <input
                    type="text"
                    value={formData.discountCode}
                    onChange={(e) => setFormData((prev: FormData) => ({ ...prev, discountCode: e.target.value.toUpperCase() }))}
                    className="input uppercase"
                    placeholder="PROMO20"
                  />
                </div>
                <div>
                  <label className="label block mb-2">
                    Réduction (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discountPercentage}
                    onChange={(e) => setFormData((prev: FormData) => ({ ...prev, discountPercentage: e.target.value }))}
                    className="input"
                    placeholder="20"
                  />
                </div>
              </div>
            </div>

            {/* Date d'expiration */}
            <div className="card">
              <label className="label block mb-2">
                <span className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Date d'expiration
                </span>
              </label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData((prev: FormData) => ({ ...prev, validUntil: e.target.value }))}
                className="input"
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-subtle mt-1">Optionnel. Laissez vide pour une durée illimitée</p>
            </div>

            {/* Ciblage */}
            <div className="card">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <TargetIcon className="w-5 h-5 text-primary" />
                Cibler une audience
              </h3>
              <div>
                <label className="label block mb-2">
                  Audience cible
                </label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData((prev: FormData) => ({ ...prev, targetAudience: e.target.value }))}
                  className="input"
                >
                  <option value="all">👥 Tous les clients</option>
                  <option value="loyal">⭐ Clients fidèles (+5 réservations)</option>
                  <option value="new">🆕 Nouveaux clients (&lt;30 jours)</option>
                  <option value="inactive">😴 Clients inactifs (+30 jours)</option>
                  <option value="category">📂 Par catégorie de service</option>
                  <option value="location">📍 Par ville</option>
                </select>
              </div>

              {formData.targetAudience === 'category' && (
                <div className="mt-4">
                  <label className="label block mb-2">
                    Catégorie
                  </label>
                  <select
                    value={formData.targetCategory}
                    onChange={(e) => setFormData((prev: FormData) => ({ ...prev, targetCategory: e.target.value }))}
                    className="input"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    <option value="restaurant">🍕 Restauration</option>
                    <option value="beauty">💄 Beauté & Bien-être</option>
                    <option value="fitness">💪 Sport & Fitness</option>
                    <option value="medical">🏥 Santé & Médical</option>
                    <option value="education">📚 Éducation</option>
                    <option value="transport">🚗 Transport</option>
                  </select>
                </div>
              )}

              {formData.targetAudience === 'location' && (
                <div className="mt-4">
                  <label className="label block mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={formData.targetCity}
                    onChange={(e) => setFormData((prev: FormData) => ({ ...prev, targetCity: e.target.value }))}
                    className="input"
                    placeholder="Ex: Tunis, Sousse, Sfax..."
                  />
                </div>
              )}
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="btn-primary w-full py-3 text-base"
            >
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
        </div>
      </div>
    </>
  );
}