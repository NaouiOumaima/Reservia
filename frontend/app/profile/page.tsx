// frontend/app/profile/page.tsx
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { usersApi } from '@/lib/api/users';
import { reviewsApi } from '@/lib/api';
import type { Review } from '@/lib/api/reviews/types';
import { UpdateProfileData, ChangePasswordData, User } from '@/lib/api/users/types';
import StarRatingInput from '@/components/ui/StarRatingInput';

import {
  UserIcon,
  CheckIcon,
  XMarkIcon,
  CameraIcon,
  LockIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  SaveIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  PhoneIcon,
  Loader2Icon,
  StarIcon,
} from '@/components/ui/Icons';

type TabType = 'profile' | 'password' | 'reviews';

const getFullImageUrl = (path: string | undefined | null): string | null => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('data:')) return path;
  if (path.startsWith('/uploads/')) return `http://localhost:3001${path}`;
  return path;
};

export default function ProfilePage() {
  const { user: authUser, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [profile, setProfile] = useState<User | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile form state - SANS EMAIL
  const [profileForm, setProfileForm] = useState<UpdateProfileData>({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
  });
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState<ChangePasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // My reviews state
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');
  const [savingReview, setSavingReview] = useState(false);

  const userRole = authUser?.role || 'client';

  const loadMyReviews = useCallback(async () => {
    try {
      setReviewsLoading(true);
      const data = await reviewsApi.getMyReviews();
      setMyReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Load my reviews error:', err);
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  const startEditReview = (review: Review) => {
    setEditingReviewId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const cancelEditReview = () => {
    setEditingReviewId(null);
    setEditRating(0);
    setEditComment('');
  };

  const saveEditReview = async (id: string) => {
    setSavingReview(true);
    try {
      const updated = await reviewsApi.update(id, {
        rating: editRating,
        comment: editComment.trim(),
      });
      setMyReviews((prev) => prev.map((r) => (r._id === id ? updated : r)));
      cancelEditReview();
    } catch (err) {
      console.error('Update review error:', err);
    } finally {
      setSavingReview(false);
    }
  };

  const removeReview = async (id: string) => {
    if (!confirm('Supprimer cet avis ? Cette action est irréversible.')) return;
    try {
      await reviewsApi.deleteMine(id);
      setMyReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error('Delete review error:', err);
    }
  };

  const [showNewAppReview, setShowNewAppReview] = useState(false);
  const [newAppRating, setNewAppRating] = useState(0);
  const [newAppComment, setNewAppComment] = useState('');

  const submitAppReview = async () => {
    if (newAppRating < 1 || !newAppComment.trim()) return;
    setSavingReview(true);
    try {
      const created = await reviewsApi.create({
        rating: newAppRating,
        comment: newAppComment.trim(),
        type: 'app',
      });
      setMyReviews((prev) => [created, ...prev]);
      setShowNewAppReview(false);
      setNewAppRating(0);
      setNewAppComment('');
    } catch (err) {
      console.error('Create app review error:', err);
    } finally {
      setSavingReview(false);
    }
  };

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const data = await usersApi.getProfile();
      setProfile(data);
      setProfileForm({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || '',
        bio: data.bio || '',
      });
    } catch (err: any) {
      console.error('Load profile error:', err);
      setErrorMessage(err.response?.data?.message || 'Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (activeTab === 'reviews') {
      loadMyReviews();
    }
  }, [activeTab, loadMyReviews]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage('Format non supporté. Utilisez JPG, PNG ou WEBP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('L\'image ne doit pas dépasser 5 Mo.');
      return;
    }

    setUploadingAvatar(true);
    setErrorMessage(null);
    setImageError(false);

    try {
      const result = await usersApi.uploadAvatar(file);
      
      const updatedProfile = { ...profile, profileImage: result.avatarUrl };
      setProfile(updatedProfile as User);
      
      if (updateUser) {
        updateUser(updatedProfile as User);
      }
      
      setSuccessMessage('Photo de profil mise à jour avec succès');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Upload error:', err);
      setErrorMessage(err.response?.data?.message || 'Erreur lors de l\'upload');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      const updated = await usersApi.updateProfile(profileForm);
      setProfile(updated);
      if (updateUser) {
        updateUser(updated);
      }
      setSuccessMessage('Profil mis à jour avec succès');
      setEditMode(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Update error:', err);
      setErrorMessage(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage('Les nouveaux mots de passe ne correspondent pas');
      setSaving(false);
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setErrorMessage('Le mot de passe doit contenir au moins 6 caractères');
      setSaving(false);
      return;
    }
    
    try {
      await usersApi.changePassword(passwordForm);
      setSuccessMessage('Mot de passe modifié avec succès');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Password error:', err);
      setErrorMessage(err.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    if (profile) {
      return `${profile.firstName?.charAt(0) || ''}${profile.lastName?.charAt(0) || ''}`.toUpperCase();
    }
    return '?';
  };

  const getRoleLabel = () => {
    switch (userRole) {
      case 'admin': return 'Administrateur';
      case 'provider': return 'Fournisseur';
      default: return 'Client';
    }
  };

  const getRoleIcon = () => {
    switch (userRole) {
      case 'admin': return <BuildingOfficeIcon className="w-4 h-4" />;
      case 'provider': return <BriefcaseIcon className="w-4 h-4" />;
      default: return <UserIcon className="w-4 h-4" />;
    }
  };

  const avatarUrl = getFullImageUrl(profile?.profileImage);
  const showAvatar = avatarUrl && !imageError;

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-loading-spinner"></div>
        <p className="text-muted">Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          {/* Avatar */}
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar">
              {showAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl!}
                  alt={`${profile?.firstName} ${profile?.lastName}`}
                  className="profile-avatar-img"
                  onError={() => {
                    console.error('Failed to load image:', avatarUrl);
                    setImageError(true);
                  }}
                />
              ) : (
                getInitials()
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="profile-avatar-edit"
              title="Changer l'avatar"
            >
              {uploadingAvatar ? (
                <Loader2Icon className="w-4 h-4 animate-spin" />
              ) : (
                <CameraIcon className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Info */}
          <div className="profile-header-info">
            <h1 className="profile-title">
              {profile?.firstName} {profile?.lastName}
            </h1>
            <div className="profile-badge">
              <span className={`badge-role ${userRole}`}>
                {getRoleIcon()}
                {getRoleLabel()}
              </span>
            </div>
            <p className="profile-subtitle">{profile?.email}</p>
            {profile?.phone && (
              <p className="profile-phone">
                <PhoneIcon className="w-3 h-3" />
                {profile.phone}
              </p>
            )}
          </div>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="alert-modern success">
            <CheckIcon className="w-5 h-5" />
            <p>{successMessage}</p>
            <button onClick={() => setSuccessMessage(null)} className="alert-close">
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {errorMessage && (
          <div className="alert-modern error">
            <XMarkIcon className="w-5 h-5" />
            <p>{errorMessage}</p>
            <button onClick={() => setErrorMessage(null)} className="alert-close">
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            onClick={() => setActiveTab('profile')}
            className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
          >
            <UserIcon className="w-4 h-4" />
            Informations
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`profile-tab ${activeTab === 'password' ? 'active' : ''}`}
          >
            <LockIcon className="w-4 h-4" />
            Sécurité
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`profile-tab ${activeTab === 'reviews' ? 'active' : ''}`}
          >
            <StarIcon className="w-4 h-4" />
            Mes avis
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="profile-content">
            <div className="profile-card">
              <div className="profile-card-header">
                <h2 className="profile-card-title">Informations personnelles</h2>
                {!editMode ? (
                  <button
                    onClick={() => setEditMode(true)}
                    className="edit-btn"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Modifier
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditMode(false);
                      loadProfile();
                    }}
                    className="cancel-btn"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    Annuler
                  </button>
                )}
              </div>

              <form onSubmit={handleProfileSubmit}>
                <div className="profile-form-grid">
                  {/* Prénom */}
                  <div className="form-group">
                    <label className="form-label">Prénom</label>
                    <input
                      type="text"
                      name="firstName"
                      value={profileForm.firstName}
                      onChange={handleProfileChange}
                      disabled={!editMode || saving}
                      className="form-input"
                      placeholder="Votre prénom"
                    />
                  </div>

                  {/* Nom */}
                  <div className="form-group">
                    <label className="form-label">Nom</label>
                    <input
                      type="text"
                      name="lastName"
                      value={profileForm.lastName}
                      onChange={handleProfileChange}
                      disabled={!editMode || saving}
                      className="form-input"
                      placeholder="Votre nom"
                    />
                  </div>

                  {/* Email - EN LECTURE SEULEMENT */}
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="form-input"
                    />
                    <p className="text-subtle text-xs mt-1">
                      ⚠️ L&apos;adresse email ne peut pas être modifiée
                    </p>
                  </div>

                  {/* Téléphone */}
                  <div className="form-group">
                    <label className="form-label">Téléphone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileForm.phone || ''}
                      onChange={handleProfileChange}
                      disabled={!editMode || saving}
                      className="form-input"
                      placeholder="+216 XX XXX XXX"
                    />
                  </div>

                  {/* Bio - Pleine largeur */}
                  <div className="form-group full-width">
                    <label className="form-label">Bio</label>
                    <textarea
                      name="bio"
                      value={profileForm.bio || ''}
                      onChange={handleProfileChange}
                      disabled={!editMode || saving}
                      rows={4}
                      className="form-textarea"
                      placeholder="Parlez-nous de vous..."
                    />
                    <p className="text-subtle text-xs">
                      {profileForm.bio?.length || 0}/500 caractères
                    </p>
                  </div>
                </div>

                {editMode && (
                  <div className="form-actions">
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-primary"
                    >
                      {saving ? (
                        <>
                          <Loader2Icon className="w-4 h-4 animate-spin" />
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <SaveIcon className="w-4 h-4" />
                          Enregistrer les modifications
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="profile-content">
            <div className="profile-card">
              <h2 className="profile-card-title">Changer le mot de passe</h2>
              
              <form onSubmit={handlePasswordSubmit}>
                <div className="space-y-5">
                  {/* Mot de passe actuel */}
                  <div className="form-group">
                    <label className="form-label">Mot de passe actuel</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        disabled={saving}
                        className="form-input"
                        placeholder="Entrez votre mot de passe actuel"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="password-toggle"
                      >
                        {showCurrentPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Nouveau mot de passe */}
                  <div className="form-group">
                    <label className="form-label">Nouveau mot de passe</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        disabled={saving}
                        className="form-input"
                        placeholder="Nouveau mot de passe (min. 6 caractères)"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="password-toggle"
                      >
                        {showNewPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirmer mot de passe */}
                  <div className="form-group">
                    <label className="form-label">Confirmer le mot de passe</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        disabled={saving}
                        className="form-input"
                        placeholder="Confirmez le nouveau mot de passe"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="password-toggle"
                      >
                        {showConfirmPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="password-hint">
                  <LockIcon className="w-3 h-3" />
                  <span>Le mot de passe doit contenir au moins 6 caractères</span>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary"
                  >
                    {saving ? (
                      <>
                        <Loader2Icon className="w-4 h-4 animate-spin" />
                        Modification...
                      </>
                    ) : (
                      <>
                        <LockIcon className="w-4 h-4" />
                        Changer le mot de passe
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="profile-content">
            <div className="profile-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="profile-card-title m-0">Mes avis</h2>
                {!showNewAppReview && (
                  <button
                    onClick={() => setShowNewAppReview(true)}
                    className="btn btn-primary btn-sm"
                  >
                    + Avis sur l&apos;application
                  </button>
                )}
              </div>

              {authUser?.role === 'client' && (
                <Link href="/client/reviews" className="text-sm text-primary hover:underline mb-4 inline-block">
                  Gérer mes avis sur les services réservés →
                </Link>
              )}

              {showNewAppReview && (
                <div className="sp-review-item mb-4">
                  <label className="label">Note</label>
                  <StarRatingInput
                    value={newAppRating}
                    onChange={setNewAppRating}
                    size="w-6 h-6"
                  />
                  <label className="label mt-3">Commentaire</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={newAppComment}
                    onChange={(e) => setNewAppComment(e.target.value)}
                    placeholder="Que pensez-vous de l'application ?"
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={submitAppReview}
                      disabled={savingReview}
                      className="btn btn-primary btn-sm"
                    >
                      Publier
                    </button>
                    <button
                      onClick={() => setShowNewAppReview(false)}
                      className="btn btn-ghost btn-sm"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {reviewsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="spinner" />
                </div>
              ) : myReviews.length === 0 ? (
                <p className="text-muted">
                  Vous n&apos;avez encore publié aucun avis.
                </p>
              ) : (
                <div className="sp-review-list">
                  {myReviews.map((review) => (
                    <div key={review._id} className="sp-review-item">
                      {editingReviewId === review._id ? (
                        <div className="flex flex-col gap-3">
                          <StarRatingInput
                            value={editRating}
                            onChange={setEditRating}
                            size="w-6 h-6"
                          />
                          <textarea
                            className="input"
                            rows={3}
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEditReview(review._id)}
                              disabled={savingReview}
                              className="btn btn-primary btn-sm"
                            >
                              Enregistrer
                            </button>
                            <button
                              onClick={cancelEditReview}
                              className="btn btn-ghost btn-sm"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="sp-review-top">
                            <div className="sp-review-stars">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'fill-yellow-500 text-yellow-500'
                                      : 'text-yellow-500/30'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="badge badge-primary">
                              {review.reviewType === 'service'
                                ? review.serviceName || 'Service'
                                : 'Application'}
                            </span>
                          </div>
                          <p className="sp-review-comment">{review.comment}</p>
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => startEditReview(review)}
                              className="btn btn-ghost btn-sm"
                            >
                              <PencilIcon className="w-3.5 h-3.5" />
                              Modifier
                            </button>
                            <button
                              onClick={() => removeReview(review._id)}
                              className="btn btn-ghost btn-sm text-error"
                            >
                              <XMarkIcon className="w-3.5 h-3.5" />
                              Supprimer
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}