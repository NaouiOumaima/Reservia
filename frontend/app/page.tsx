'use client';

import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { CATEGORIES } from '@/lib/api/constants/categories.';
import { useEffect, useState } from 'react';
import { dashboardApi, HomePageStats } from '@/lib/api/dash/index';
import {
  SearchIcon, MapIcon, AiIcon, BookingIcon, ReviewIcon,
  NotificationIcon, UsersIcon, ServicesIcon, LocationIcon,
  StarIcon,
} from '@/components/ui/Icons';

type CategoryStat = {
  serviceType: string;
  count: number;
  reservationCount: number;
  completedReservations: number;
  averageRating: number;
  totalRevenue: number;
};

const CATEGORY_ICONS: Record<string, JSX.Element> = Object.fromEntries(
  CATEGORIES.map(cat => [cat.frenchLabel, cat.icon])
);

const FEATURES = [
  { icon: <SearchIcon className="w-8 h-8" />, title: 'Recherche Unifiée', desc: 'Accédez à tous les types de services en un seul endroit.' },
  { icon: <AiIcon className="w-8 h-8" />, title: 'Assistant IA intelligent', desc: 'Chatbot vocal et textuel pour vous guider 24h/24.' },
  { icon: <MapIcon className="w-8 h-8" />, title: 'Géolocalisation précise', desc: 'Trouvez ce qui vous entoure avec carte et itinéraire.' },
  { icon: <BookingIcon className="w-8 h-8" />, title: 'Réservation instantanée', desc: 'Confirmation en temps réel en 30 secondes.' },
  { icon: <ReviewIcon className="w-8 h-8" />, title: 'Avis vérifiés', desc: 'Notes authentiques pour choisir en confiance.' },
  { icon: <NotificationIcon className="w-8 h-8" />, title: 'Notifications intelligentes', desc: 'Rappels et offres personnalisées.' },
];

const STEPS = [
  { n: '1', title: 'Recherchez', desc: "Décrivez votre besoin ou laissez-vous guider par l'IA" },
  { n: '2', title: 'Comparez', desc: 'Notes, avis, prix et disponibilités' },
  { n: '3', title: 'Réservez', desc: 'Choisissez votre créneau en 30 secondes' },
  { n: '4', title: 'Profitez', desc: 'Découvrez et partagez votre expérience' },
];

const TESTIMONIALS = [
  { name: 'Marie D.', initials: 'MD', comment: "Plateforme géniale, j'ai trouvé un coiffeur en 5 minutes !", rating: 5 },
  { name: 'Thomas L.', initials: 'TL', comment: 'Réservation simple et rapide, je recommande vivement !', rating: 5 },
  { name: 'Sophie M.', initials: 'SM', comment: 'Les meilleurs services locaux sont sur Reservia. Très pratique !', rating: 5 },
];

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<HomePageStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setStatsLoading(true);
        setError(null);
        const data = await dashboardApi.getHomeStats();
        setStats(data);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Impossible de charger les statistiques');
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, []);

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'client') router.push('/client/dashboard');
      else if (user.role === 'provider') router.push('/provider/dashboard');
      else if (user.role === 'admin') router.push('/admin/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--background))]">
        <div className="spinner"></div>
      </div>
    );
  }

  const formatNumber = (num: number | undefined | null): string => {
    if (num === undefined || num === null) return '0';
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const formatCurrency = (amount: number | undefined | null): string => {
    return new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(amount ?? 0);
  };

  const categoriesStats: CategoryStat[] = (stats as any)?.satisfactionByService ?? [];

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden section">
        <div className="container-app relative z-10">
          <div className="max-w-3xl mx-auto text-center stagger-children">
            <div className="animate-fadeIn inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-soft border border-primary/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-[rgb(var(--primary))] animate-pulse-soft" />
              <span className="text-sm font-medium text-[rgb(var(--primary))]">La première plateforme multi-services intelligente en Tunisie</span>
            </div>
            <h1 className="animate-fadeIn font-display text-[rgb(var(--foreground))] mb-6">
              Réservez les meilleurs services locaux{' '}
              <span className="gradient-text">en quelques clics</span>
            </h1>
            <p className="animate-fadeIn text-lg text-[rgb(var(--foreground-muted))] mb-10 max-w-xl mx-auto leading-relaxed">
              Découvrez, comparez et réservez restaurants, hôtels, salles de sport, coiffeurs et bien plus encore.
            </p>
            <div className="animate-fadeIn flex flex-wrap items-center justify-center gap-3">
              <Link href="/search" className="btn btn-primary btn-lg shadow-glow">Explorer les services</Link>
              <Link href="/register?role=provider" className="btn btn-ghost btn-lg">Devenir partenaire</Link>
            </div>
          </div>

          {/* STATISTIQUES GLOBALES */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeInUp">
            {statsLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="card text-center py-4">
                  <div className="skeleton h-6 w-12 mx-auto mb-2" />
                  <div className="skeleton h-8 w-20 mx-auto mb-2" />
                  <div className="skeleton h-4 w-24 mx-auto" />
                </div>
              ))
            ) : (
              <>
                <div className="stat-card">
                  <UsersIcon className="w-6 h-6 text-[rgb(var(--primary))] mb-2" />
                  <div className="stat-card-value">{formatNumber(stats?.activeUsers)}+</div>
                  <div className="stat-card-label">Utilisateurs actifs</div>
                </div>
                <div className="stat-card">
                  <ServicesIcon className="w-6 h-6 text-[rgb(var(--primary))] mb-2" />
                  <div className="stat-card-value">{formatNumber(stats?.availableServices)}</div>
                  <div className="stat-card-label">Services disponibles</div>
                </div>
                <div className="stat-card">
                  <LocationIcon className="w-6 h-6 text-[rgb(var(--primary))] mb-2" />
                  <div className="stat-card-value">{stats?.governoratesCovered ?? 0} régions</div>
                  <div className="stat-card-label">Couverture Tunisie</div>
                </div>
                <div className="stat-card">
                  <StarIcon className="w-6 h-6 text-[rgb(var(--primary))] mb-2" />
                  <div className="stat-card-value">{stats?.averageSatisfaction ?? 0} / 5</div>
                  <div className="stat-card-label">Satisfaction client</div>
                </div>
              </>
            )}
          </div>

          {error && <div className="mt-4 text-center text-sm text-error">{error}</div>}
        </div>
      </section>

      {/* CATÉGORIES */}
      <section className="section bg-[rgb(var(--surface))]">
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className="font-display text-[rgb(var(--foreground))]">Tous types de services</h2>
            <p className="text-[rgb(var(--foreground-muted))] mt-3">Découvrez nos catégories avec leurs statistiques</p>
          </div>

          {statsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card p-6">
                  <div className="skeleton w-16 h-16 rounded-full mx-auto mb-4" />
                  <div className="skeleton h-5 w-32 mx-auto mb-3" />
                  <div className="skeleton h-4 w-24 mx-auto" />
                </div>
              ))}
            </div>
          ) : categoriesStats.length === 0 ? (
            <div className="text-center py-12">
              <ServicesIcon className="w-16 h-16 mx-auto text-[rgb(var(--foreground-muted))] opacity-50 mb-4" />
              <p className="text-[rgb(var(--foreground-muted))]">Aucune catégorie disponible pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
              {categoriesStats.map((category, index) => (
                <Link
                  key={`${category.serviceType}-${index}`}
                  href={`/search?category=${encodeURIComponent(category.serviceType)}`}
                  className="card category-card animate-fadeInUp"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-center p-6">
                    <div className="flex justify-center mb-4">
                      <div className="w-20 h-20 rounded-2xl bg-primary-soft flex items-center justify-center text-[rgb(var(--primary))] category-icon-wrapper">
                        {CATEGORY_ICONS[category.serviceType] ?? CATEGORY_ICONS['Autre']}
                      </div>
                    </div>
                    <h3 className="font-display text-xl font-semibold text-[rgb(var(--foreground))] mb-4">
                      {category.serviceType}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center py-1 border-b border-[rgba(var(--border),0.3)]">
                        <span className="text-[rgb(var(--foreground-muted))]">Services</span>
                        <span className="font-semibold text-[rgb(var(--primary))]">{category.count}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-[rgba(var(--border),0.3)]">
                        <span className="text-[rgb(var(--foreground-muted))]">Réservations</span>
                        <span className="font-semibold text-[rgb(var(--accent))]">{formatNumber(category.reservationCount)}</span>
                      </div>
                      {(category.completedReservations ?? 0) > 0 && (
                        <div className="flex justify-between items-center py-1 border-b border-[rgba(var(--border),0.3)]">
                          <span className="text-[rgb(var(--foreground-muted))]">Complétées</span>
                          <span className="font-semibold text-green-600">{formatNumber(category.completedReservations)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center py-1">
                        <span className="text-[rgb(var(--foreground-muted))]">Note</span>
                        <div className="flex items-center gap-1">
                          <StarIcon className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-[rgb(var(--foreground))]">
                            {category.averageRating ? category.averageRating : 'Nouveau'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {(category.totalRevenue ?? 0) > 0 && (
                      <div className="mt-4 pt-3 border-t border-[rgba(var(--border),0.3)]">
                        <p className="text-xs text-[rgb(var(--foreground-subtle))]">Chiffre d'affaires</p>
                        <p className="text-sm font-bold text-[rgb(var(--accent))]">{formatCurrency(category.totalRevenue)}</p>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FONCTIONNALITÉS */}
      <section className="section">
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className="font-display text-[rgb(var(--foreground))]">Pourquoi choisir Reservia ?</h2>
            <p className="text-[rgb(var(--foreground-muted))] mt-3 max-w-lg mx-auto">Des outils pensés pour vous faire gagner du temps.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 stagger-children">
            {FEATURES.map((feature, idx) => (
              <div key={feature.title} className="card feature-card animate-fadeInUp" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="feature-icon w-12 h-12 rounded-xl bg-primary-soft flex items-center justify-center mb-4 text-[rgb(var(--primary))]">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-[rgb(var(--foreground))] mb-2">{feature.title}</h3>
                <p className="text-sm text-[rgb(var(--foreground-muted))] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="section bg-[rgb(var(--surface))]">
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className="font-display text-[rgb(var(--foreground))]">Comment ça marche ?</h2>
            <p className="text-[rgb(var(--foreground-muted))] mt-3">Réservation en 4 étapes simples</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative">
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-[rgb(var(--border))]" />
            {STEPS.map((step, index) => (
              <div key={step.n} className="relative z-10 flex flex-col items-center text-center animate-fadeInUp" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="step-circle w-14 h-14 rounded-full bg-[rgb(var(--primary))] text-white flex items-center justify-center font-display text-xl shadow-glow mb-4">{step.n}</div>
                <h3 className="font-semibold text-[rgb(var(--foreground))] mb-1">{step.title}</h3>
                <p className="text-sm text-[rgb(var(--foreground-muted))]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

           {/* TÉMOIGNAGES */}
      <section className="section">
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className="font-display text-[rgb(var(--foreground))]">Ce que disent nos clients</h2>
            <p className="text-[rgb(var(--foreground-muted))] mt-3">Ils nous font confiance</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 stagger-children">
            {[
              { name: 'Marie D.', initials: 'MD', comment: "Plateforme géniale, j'ai trouvé un coiffeur en 5 minutes !", rating: 5 },
              { name: 'Thomas L.', initials: 'TL', comment: 'Réservation simple et rapide, je recommande vivement !', rating: 5 },
              { name: 'Sophie M.', initials: 'SM', comment: 'Les meilleurs services locaux sont sur Reservia. Très pratique !', rating: 5 },
            ].map((testimonial, index) => (
              <div 
                key={testimonial.name} 
                className="card testimonial-card animate-fadeInUp" 
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="testimonial-avatar">
                    <span>{testimonial.initials}</span>
                  </div>
                  <div>
                    <h4 className="testimonial-name">{testimonial.name}</h4>
                    <div className="testimonial-stars">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <StarIcon key={i} className="testimonial-star" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="testimonial-comment">"{testimonial.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="section">
        <div className="container-app">
          <div className="cta-wrapper">
            <div aria-hidden className="cta-blur-top" />
            <div aria-hidden className="cta-blur-bottom" />
            <div className="cta-content">
              <h2 className="cta-title">Prêt à réserver votre prochain service ?</h2>
              <p className="cta-description">Rejoignez des milliers d'utilisateurs qui font confiance à Reservia</p>
              <Link href="/register" className="cta-button">
                Créer un compte gratuitement
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}