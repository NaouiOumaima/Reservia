'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { usersApi } from '@/lib/api/users/users.api';
import { UpdateProfileData, ChangePasswordData, User } from '@/lib/api/users/types';

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
} from '@/components/ui/Icons';

type TabType = 'profile' | 'password';

// ✅ Fonction utilitaire pour obtenir l'URL complète de l'image
const getFullImageUrl = (path: string | undefined | null): string | null => {
  if (!path) return null;
  
  // Si c'est déjà une URL absolue
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Si c'est une data URL (base64)
  if (path.startsWith('data:')) {
    return path;
  }
  
  // Si c'est une URL relative du backend
  if (path.startsWith('/uploads/')) {
    return `http://localhost:3001${path}`;
  }
  
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
  
  // Profile form state
  const [profileForm, setProfileForm] = useState<UpdateProfileData>({
    firstName: '',
    lastName: '',
    email: '',
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

  const userRole = authUser?.role || 'client';

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const data = await usersApi.getProfile();
      setProfile(data);
      setProfileForm({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        bio: data.bio || '',
      });
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Fonction pour gérer l'upload d'avatar
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation du fichier
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
      
      // Mettre à jour le profil localement
      const updatedProfile = { ...profile, profileImage: result.avatarUrl };
      setProfile(updatedProfile as User);
      
      // Mettre à jour le contexte auth
      if (updateUser) {
        updateUser(updatedProfile as User);
      }
      
      setSuccessMessage('Photo de profil mise à jour avec succès');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
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
      case 'provider': return 'Fourniseur';
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
        <p>Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-avatar-wrapper">
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
              <div className="profile-avatar">
                {getInitials()}
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              onChange={handleAvatarUpload}
              className="hidden-file-input"
              style={{ display: 'none' }}
            />
            
            <button 
              className="profile-avatar-edit" 
              title="Changer l'avatar"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? (
                <Loader2Icon className="w-4 h-4 animate-spin" />
              ) : (
                <CameraIcon className="w-4 h-4" />
              )}
            </button>
          </div>
          
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

        {/* Tabs - Seulement Informations et Sécurité */}
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
        </div>

        {/* Tab Content */}
        <div className="profile-content">
          {/* Profile Tab - Commun à tous */}
          {activeTab === 'profile' && (
            <div className="profile-card">
              <div className="profile-card-header">
                <h2 className="profile-card-title">Informations personnelles</h2>
                {!editMode ? (
                  <button onClick={() => setEditMode(true)} className="edit-btn">
                    <PencilIcon className="w-4 h-4" />
                    Modifier
                  </button>
                ) : (
                  <button onClick={() => {
                    setEditMode(false);
                    loadProfile();
                  }} className="cancel-btn">
                    <XMarkIcon className="w-4 h-4" />
                    Annuler
                  </button>
                )}
              </div>

              <form onSubmit={handleProfileSubmit}>
                <div className="profile-form-grid">
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

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      disabled={!editMode || saving}
                      className="form-input"
                      placeholder="email@exemple.com"
                    />
                  </div>

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

                  <div className="form-group full-width">
                    <label className="form-label">Bio</label>
                    <textarea
                      name="bio"
                      value={profileForm.bio || ''}
                      onChange={handleProfileChange}
                      disabled={!editMode || saving}
                      className="form-textarea"
                      rows={4}
                      placeholder="Parlez-nous de vous..."
                    />
                  </div>
                </div>

                {editMode && (
                  <div className="form-actions">
                    <button type="submit" disabled={saving} className="btn-primary">
                      {saving ? (
                        <>
                          <div className="spinner-small"></div>
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
          )}

          {/* Password Tab - Commun à tous */}
          {activeTab === 'password' && (
            <div className="profile-card">
              <h2 className="profile-card-title">Changer le mot de passe</h2>
              
              <form onSubmit={handlePasswordSubmit}>
                <div className="profile-form-grid">
                  <div className="form-group full-width">
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

                  <div className="form-group full-width">
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

                  <div className="form-group full-width">
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
                  <LockIcon className="w-4 h-4" />
                  <span>Le mot de passe doit contenir au moins 6 caractères</span>
                </div>

                <div className="form-actions">
                  <button type="submit" disabled={saving} className="btn-primary">
                    {saving ? (
                      <>
                        <div className="spinner-small"></div>
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
          )}
        </div>
      </div>
    </div>
  );
}