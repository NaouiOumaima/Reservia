'use client';

import { useEffect, useState } from 'react';
import { reviewsApi } from '@/lib/api/reviews/reviews.api';
import { useAuth } from '@/providers/AuthProvider';
import { Review } from '@/lib/api/reviews/types';
import {
  ReviewIcon,
  FlagIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  UserIcon,
  ServicesIcon,
  EnvelopeIcon,
  AlertTriangleIcon,
  EyeIcon,
  TrashIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from '@/components/ui/Icons';

type FilterType = 'all' | 'reported' | 'approved' | 'pending';

const filterConfig = [
  { value: 'all' as FilterType, label: 'Tous les avis', icon: ReviewIcon },
  { value: 'reported' as FilterType, label: 'Signalés', icon: FlagIcon },
  { value: 'approved' as FilterType, label: 'Approuvés', icon: CheckCircleIcon },
  { value: 'pending' as FilterType, label: 'En attente', icon: ClockIcon },
];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [stats, setStats] = useState<any>({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    loadReviews();
  }, [filter, page]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reviewsApi.getAllReviewsForAdmin(page, 10, filter);
      setReviews(data.reviews);
      setTotal(data.total);
      setStats(data.stats);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des avis');
    } finally {
      setLoading(false);
    }
  };

  const approveReview = async (reviewId: string) => {
    if (!confirm('Confirmez-vous que cet avis est conforme ?')) return;
    
    try {
      setActionLoading(reviewId);
      await reviewsApi.approveReview(reviewId);
      await loadReviews();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de l\'approbation');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement cet avis ?')) return;
    
    try {
      setActionLoading(reviewId);
      await reviewsApi.deleteReview(reviewId);
      await loadReviews();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setActionLoading(null);
    }
  };

  const getUserName = (review: Review): string => {
    if (typeof review.userId === 'object' && review.userId !== null) {
      return `${review.userId.firstName || ''} ${review.userId.lastName || ''}`.trim() || review.userId.email || review.userName;
    }
    return review.userName || 'Utilisateur';
  };

  const getServiceName = (review: Review): string => {
    if (typeof review.serviceId === 'object' && review.serviceId !== null) {
      return review.serviceId.name;
    }
    return review.serviceName || 'Service';
  };

  const getStatusBadge = (review: Review) => {
    if (review.isReported) {
      return { variant: 'error', label: 'Signalé', icon: FlagIcon };
    }
    if (!review.isApproved) {
      return { variant: 'warning', label: 'En attente', icon: ClockIcon };
    }
    return { variant: 'success', label: 'Approuvé', icon: CheckCircleIcon };
  };

  const renderStars = (rating: number) => {
    return (
      <div className="review-stars">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            className={`review-star ${i < rating ? 'filled' : 'empty'}`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="admin-reviews-loading">
        <div className="admin-reviews-loading-spinner"></div>
        <p className="admin-reviews-loading-text">Chargement des avis...</p>
      </div>
    );
  }

  return (
    <div className="admin-reviews-page">
      <div className="admin-reviews-container">
        {/* Header */}
        <div className="admin-reviews-header">
          <div className="admin-reviews-header-icon">
            <ReviewIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="admin-reviews-title">Gestion des avis</h1>
            <p className="admin-reviews-subtitle">Modérez l'ensemble des avis de la plateforme</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="admin-reviews-stats">
          <div className="stat-card-modern">
            <div className="stat-card-modern-icon primary">
              <ReviewIcon className="w-5 h-5" />
            </div>
            <div className="stat-card-modern-value">{stats.total || 0}</div>
            <div className="stat-card-modern-label">Total avis</div>
          </div>
          <div className="stat-card-modern">
            <div className="stat-card-modern-icon error">
              <FlagIcon className="w-5 h-5" />
            </div>
            <div className="stat-card-modern-value">{stats.reported || 0}</div>
            <div className="stat-card-modern-label">Signalés</div>
          </div>
          <div className="stat-card-modern">
            <div className="stat-card-modern-icon success">
              <CheckCircleIcon className="w-5 h-5" />
            </div>
            <div className="stat-card-modern-value">{stats.approved || 0}</div>
            <div className="stat-card-modern-label">Approuvés</div>
          </div>
          <div className="stat-card-modern">
            <div className="stat-card-modern-icon warning">
              <ClockIcon className="w-5 h-5" />
            </div>
            <div className="stat-card-modern-value">{stats.pending || 0}</div>
            <div className="stat-card-modern-label">En attente</div>
          </div>
          <div className="stat-card-modern">
            <div className="stat-card-modern-icon accent">
              <StarIcon className="w-5 h-5" />
            </div>
            <div className="stat-card-modern-value">{stats.averageRating?.toFixed(1) || 0}</div>
            <div className="stat-card-modern-label">Note moyenne</div>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-reviews-filters">
          <div className="admin-reviews-filter-group">
            {filterConfig.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`filter-chip ${filter === f.value ? 'active' : ''}`}
              >
                <f.icon className="w-4 h-4" />
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert-modern error">
            <AlertTriangleIcon className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
            <button onClick={loadReviews} className="alert-modern-btn">
              Réessayer
            </button>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="admin-reviews-empty">
            <div className="admin-reviews-empty-icon">
              <ReviewIcon className="w-12 h-12" />
            </div>
            <h3 className="admin-reviews-empty-title">Aucun avis</h3>
            <p className="admin-reviews-empty-text">Aucun avis ne correspond à ce filtre</p>
          </div>
        ) : (
          <>
            <div className="admin-reviews-list">
              {reviews.map((review) => {
                const status = getStatusBadge(review);
                const StatusIcon = status.icon;
                return (
                  <div key={review._id} className="review-card-modern">
                    {/* Header */}
                    <div className="review-card-header">
                      <div className="review-card-status">
                        <span className={`badge-modern ${status.variant}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                        {renderStars(review.rating)}
                      </div>
                      <span className="review-card-date">
                        {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Comment */}
                    <p className="review-card-comment">“{review.comment}”</p>

                    {/* Meta Info */}
                    <div className="review-card-meta">
                      <div className="review-card-meta-item">
                        <UserIcon className="w-4 h-4" />
                        <span>{getUserName(review)}</span>
                      </div>
                      <div className="review-card-meta-item">
                        <ServicesIcon className="w-4 h-4" />
                        <span>{getServiceName(review)}</span>
                      </div>
                      <div className="review-card-meta-item">
                        <EnvelopeIcon className="w-4 h-4" />
                        <span>{review.userEmail}</span>
                      </div>
                    </div>

                    {/* Report Reason */}
                    {review.isReported && review.reportReason && (
                      <div className="review-card-report">
                        <div className="review-card-report-header">
                          <FlagIcon className="w-3.5 h-3.5" />
                          <span>Motif du signalement: {review.reportReason}</span>
                        </div>
                        {review.reportDetails && (
                          <p className="review-card-report-details">{review.reportDetails}</p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="review-card-actions">
                      {review.isReported && (
                        <button
                          onClick={() => approveReview(review._id)}
                          disabled={actionLoading === review._id}
                          className="action-btn success"
                        >
                          <CheckIcon className="w-4 h-4" />
                          Approuver
                        </button>
                      )}
                      <button
                        onClick={() => deleteReview(review._id)}
                        disabled={actionLoading === review._id}
                        className="action-btn danger"
                      >
                        <TrashIcon className="w-4 h-4" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {total > 10 && (
              <div className="admin-reviews-pagination">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="pagination-btn"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                  Précédent
                </button>
                <span className="pagination-info">
                  Page {page} / {Math.ceil(total / 10)}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= Math.ceil(total / 10)}
                  className="pagination-btn"
                >
                  Suivant
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}