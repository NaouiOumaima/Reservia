// app/page.tsx

import Link from 'next/link';
import {
  HotelIcon,
  RestaurantIcon,
  BeautyIcon,
  FitnessIcon,
  HealthIcon,
  EducationIcon,
  EntertainmentIcon,
  TransportIcon,
  SearchIcon,
  MapIcon,
  AiIcon,
  BookingIcon,
  ReviewIcon,
  NotificationIcon,
  UsersIcon,
  ServicesIcon,
  LocationIcon,
  StarIcon,
} from '@/components/ui/Icons';

// ─────────────────────────────────────────────────────────────
//  DONNÉES DE LA PAGE
// ─────────────────────────────────────────────────────────────

const CATEGORIES = [
  { icon: <HotelIcon className="w-8 h-8" />, label: 'Hébergement', count: '500+' },
  { icon: <RestaurantIcon className="w-8 h-8" />, label: 'Restauration', count: '800+' },
  { icon: <BeautyIcon className="w-8 h-8" />, label: 'Beauté & Bien-être', count: '600+' },
  { icon: <FitnessIcon className="w-8 h-8" />, label: 'Fitness', count: '300+' },
  { icon: <HealthIcon className="w-8 h-8" />, label: 'Santé', count: '400+' },
  { icon: <EducationIcon className="w-8 h-8" />, label: 'Éducation', count: '250+' },
  { icon: <EntertainmentIcon className="w-8 h-8" />, label: 'Loisirs', count: '350+' },
  { icon: <TransportIcon className="w-8 h-8" />, label: 'Transport', count: '200+' },
];

const FEATURES = [
  {
    icon: <SearchIcon className="w-8 h-8" />,
    title: 'Recherche Unifiée',
    desc: 'Accédez à tous les types de services en un seul endroit. Fini les allers-retours entre plateformes.',
  },
  {
    icon: <AiIcon className="w-8 h-8" />,
    title: 'Assistant IA intelligent',
    desc: 'Chatbot vocal et textuel qui vous guide, vous recommande et vous assiste 24h/24.',
  },
  {
    icon: <MapIcon className="w-8 h-8" />,
    title: 'Géolocalisation précise',
    desc: 'Trouvez ce qui vous entoure grâce à la carte interactive, avec itinéraire et distance calculée.',
  },
  {
    icon: <BookingIcon className="w-8 h-8" />,
    title: 'Réservation instantanée',
    desc: 'Confirmation en temps réel, créneaux disponibles et annulation facile jusqu\'à la dernière minute.',
  },
  {
    icon: <ReviewIcon className="w-8 h-8" />,
    title: 'Avis vérifiés',
    desc: 'Notes authentiques et commentaires détaillés pour choisir en toute confiance.',
  },
  {
    icon: <NotificationIcon className="w-8 h-8" />,
    title: 'Notifications intelligentes',
    desc: 'Rappels de rendez-vous, offres personnalisées et alertes de confirmation par SMS/e-mail.',
  },
];

const STEPS = [
  { n: '1', title: 'Recherchez', desc: 'Décrivez votre besoin ou laissez-vous guider par l\'IA' },
  { n: '2', title: 'Comparez', desc: 'Notes, avis, prix et disponibilités en un coup d\'œil' },
  { n: '3', title: 'Réservez', desc: 'Choisissez votre créneau et validez en 30 secondes' },
  { n: '4', title: 'Profitez', desc: 'Découvrez le service et partagez votre expérience' },
];

const STATS = [
  { icon: <UsersIcon className="w-5 h-5" />, value: '15 000+', label: 'Utilisateurs actifs' },
  { icon: <ServicesIcon className="w-5 h-5" />, value: '4 500+', label: 'Services disponibles' },
  { icon: <LocationIcon className="w-5 h-5" />, value: '30 villes', label: 'Couverture Tunisie' },
  { icon: <StarIcon className="w-5 h-5" />, value: '4.9 / 5', label: 'Satisfaction client' },
];

// ─────────────────────────────────────────────────────────────
//  COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">

      {/* ══════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden section">
        {/* Décorations de fond */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, rgb(var(--primary)) 0%, transparent 70%)' }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, rgb(var(--accent)) 0%, transparent 70%)' }}
        />

        <div className="container-app relative z-10">
          <div className="max-w-3xl mx-auto text-center stagger-children">

            {/* Badge */}
            <div className="animate-fadeIn inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(var(--primary),0.1)] border border-[rgba(var(--primary),0.2)] mb-6">
              <span className="w-2 h-2 rounded-full bg-[rgb(var(--primary))] animate-pulse-soft" />
              <span className="text-sm font-medium text-[rgb(var(--primary))]">
                La première plateforme multi-services intelligente en Tunisie
              </span>
            </div>

            {/* Titre */}
            <h1 className="animate-fadeIn font-display text-[rgb(var(--foreground))] mb-6">
              Réservez les meilleurs services locaux{' '}
              <span className="gradient-text">en quelques clics</span>
            </h1>

            {/* Sous-titre */}
            <p className="animate-fadeIn text-lg text-[rgb(var(--foreground-muted))] mb-10 max-w-xl mx-auto leading-relaxed">
              Découvrez, comparez et réservez restaurants, hôtels, salles de sport, coiffeurs et bien plus encore.
              Une seule plateforme, des milliers de possibilités.
            </p>

            {/* Boutons CTA */}
            <div className="animate-fadeIn flex flex-wrap items-center justify-center gap-3">
              <Link href="/search" className="btn btn-primary btn-lg shadow-glow">
                Explorer les services
              </Link>
              <Link href="/register?role=provider" className="btn btn-ghost btn-lg">
                Devenir partenaire
              </Link>
            </div>
          </div>

          {/* Chiffres clés */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeInUp">
            {STATS.map((stat) => (
              <div key={stat.label} className="card text-center py-4">
                <div className="flex justify-center text-[rgb(var(--primary))] mb-2">
                  {stat.icon}
                </div>
                <p className="font-display text-2xl text-[rgb(var(--primary))]">{stat.value}</p>
                <p className="text-sm text-[rgb(var(--foreground-subtle))] mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CATÉGORIES
      ══════════════════════════════════════════════ */}
      <section className="section bg-[rgb(var(--surface))]">
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className="font-display text-[rgb(var(--foreground))]">Tous types de services</h2>
            <p className="text-[rgb(var(--foreground-muted))] mt-3">
              Une seule plateforme pour toutes vos réservations
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger-children">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                href={`/search?category=${encodeURIComponent(cat.label)}`}
                className="card hover-lift flex flex-col items-center gap-2 py-5 text-center group animate-scaleIn"
              >
                <div className="text-[rgb(var(--primary))] group-hover:scale-110 transition-transform duration-200">
                  {cat.icon}
                </div>
                <span className="font-semibold text-sm text-[rgb(var(--foreground))]">{cat.label}</span>
                <span className="badge badge-primary text-xs">{cat.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FONCTIONNALITÉS
      ══════════════════════════════════════════════ */}
      <section className="section">
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className="font-display text-[rgb(var(--foreground))]">Pourquoi choisir Reservia ?</h2>
            <p className="text-[rgb(var(--foreground-muted))] mt-3 max-w-lg mx-auto">
              Des outils pensés pour vous faire gagner du temps et trouver le meilleur service.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 stagger-children">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="card card-raised animate-fadeInUp group">
                <div className="w-12 h-12 rounded-xl bg-[rgba(var(--primary),0.1)] flex items-center justify-center mb-4 text-[rgb(var(--primary))] group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-[rgb(var(--foreground))] mb-2">{feature.title}</h3>
                <p className="text-sm text-[rgb(var(--foreground-muted))] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          COMMENT ÇA MARCHE
      ══════════════════════════════════════════════ */}
      <section className="section bg-[rgb(var(--surface))]">
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className="font-display text-[rgb(var(--foreground))]">Comment ça marche ?</h2>
            <p className="text-[rgb(var(--foreground-muted))] mt-3">
              Réservation en 4 étapes simples et rapides
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative">
            {/* Ligne de connexion (desktop) */}
            <div
              aria-hidden
              className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-[rgb(var(--border))]"
              style={{ zIndex: 0 }}
            />
            {STEPS.map((step, index) => (
              <div
                key={step.n}
                className="relative z-10 flex flex-col items-center text-center animate-fadeInUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-full bg-[rgb(var(--primary))] text-white flex items-center justify-center font-display text-xl shadow-glow mb-4">
                  {step.n}
                </div>
                <h3 className="font-semibold text-[rgb(var(--foreground))] mb-1">{step.title}</h3>
                <p className="text-sm text-[rgb(var(--foreground-muted))]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TÉMOIGNAGES
      ══════════════════════════════════════════════ */}
      <section className="section">
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className="font-display text-[rgb(var(--foreground))]">Ce que disent nos clients</h2>
            <p className="text-[rgb(var(--foreground-muted))] mt-3">
              Ils nous font confiance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card animate-fadeInUp" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[rgba(var(--primary),0.15)] flex items-center justify-center">
                    <span className="text-[rgb(var(--primary))] font-semibold">{testimonial.initials}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[rgb(var(--foreground))]">{testimonial.name}</h4>
                    <div className="flex gap-0.5 mt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-[rgb(var(--foreground-muted))] italic leading-relaxed">
                  "{testimonial.comment}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════════════ */}
      <section className="section">
        <div className="container-app">
          <div
            className="relative overflow-hidden rounded-[var(--radius-xl)] px-8 py-16 text-center"
            style={{
              background: 'linear-gradient(135deg, rgb(var(--primary)) 0%, rgb(var(--accent)) 100%)',
            }}
          >
            {/* Cercles décoratifs */}
            <div aria-hidden className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
            <div aria-hidden className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 max-w-xl mx-auto">
              <h2 className="font-display text-white text-3xl md:text-4xl mb-4">
                Prêt à réserver votre prochain service ?
              </h2>
              <p className="text-white/80 text-lg mb-8">
                Rejoignez des milliers d'utilisateurs qui font confiance à Reservia chaque jour.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-[rgb(var(--primary))] rounded-full font-semibold text-lg hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                Créer un compte gratuitement
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

// ─────────────────────────────────────────────────────────────
//  DONNÉES STATIQUES (Témoignages)
// ─────────────────────────────────────────────────────────────

const testimonials = [
  {
    name: 'Marie D.',
    initials: 'MD',
    comment: 'Plateforme géniale, j\'ai trouvé un coiffeur en 5 minutes !',
  },
  {
    name: 'Thomas L.',
    initials: 'TL',
    comment: 'Réservation simple et rapide, je recommande vivement !',
  },
  {
    name: 'Sophie M.',
    initials: 'SM',
    comment: 'Les meilleurs services locaux sont sur Reservia. Très pratique !',
  },
];