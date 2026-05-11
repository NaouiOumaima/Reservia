// app/about/page.tsx

import {
  UsersIcon,
  ServicesIcon,
  LocationIcon,
  StarIcon,
  CalendarIcon,
  TargetIcon,
  ShieldIcon,
  HeadphonesIcon,
  CheckIcon,
  ChevronRightIcon,
} from '@/components/ui/Icons';

// ─────────────────────────────────────────────────────────────
//  DONNÉES DE LA PAGE
// ─────────────────────────────────────────────────────────────

const VALUES = [
  {
    icon: <TargetIcon className="w-8 h-8" />,
    title: 'Gratuité',
    desc: 'Profitez d’une plateforme 100 % gratuite pour toutes vos réservations, sans frais cachés.',
  },
  {
    icon: <UsersIcon className="w-8 h-8" />,
    title: 'Proximité',
    desc: 'Découvrez les meilleurs services locaux partout en Tunisie, avec des avis et notes réels.',
  },
  {
    icon: <ShieldIcon className="w-8 h-8" />,
    title: 'Transparence',
    desc: 'Tarifs clairs, descriptions précises et prestations facilement comparables.',
  },
];

const COMPARISON = [
  { feature: 'Réservation multi-services', reservia: true, others: false },
  { feature: 'Assistant IA vocal/textuel', reservia: true, others: false },
  { feature: 'Carte interactive & itinéraire', reservia: true, others: false },
  { feature: 'Paiement sécurisé', reservia: true, others: true },
  { feature: 'Annulation gratuite', reservia: true, others: false },
  { feature: 'Notifications en temps réel', reservia: true, others: false },
];

const FAQ = [
  {
    q: 'Comment réserver un service ?',
    a: 'Utilisez la barre de recherche, sélectionnez votre catégorie, comparez les options et réservez le créneau qui vous convient.',
  },
  {
    q: 'Puis-je modifier ma réservation ?',
    a: 'Oui, certaines réservations peuvent être modifiées directement depuis votre compte. Vérifiez les conditions du prestataire.',
  },
  {
    q: 'Comment devenir fournisseur ?',
    a: 'Créez un compte fournisseur, ajoutez vos services, définissez vos disponibilités et commencez à recevoir des demandes.',
  },
  {
    q: 'Comment contacter le support ?',
    a: 'Utilisez le formulaire de contact dans l’application ou envoyez-nous un message à support@reservia.com.',
  },
];

// ─────────────────────────────────────────────────────────────
//  COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">

      {/* ══════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden section">
        {/* Décorations */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, rgb(var(--primary)) 0%, transparent 70%)' }}
        />

        <div className="container-app relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(var(--primary),0.1)] border border-[rgba(var(--primary),0.2)] mb-6">
              <span className="w-2 h-2 rounded-full bg-[rgb(var(--primary))] animate-pulse-soft" />
              <span className="text-sm font-medium text-[rgb(var(--primary))]">Notre histoire</span>
            </div>

            {/* Titre */}
            <h1 className="font-display text-[rgb(var(--foreground))] mb-6">
              À propos de <span className="gradient-text">Reservia</span>
            </h1>

            {/* Sous-titre */}
                    <p className="text-lg text-[rgb(var(--foreground-muted))] max-w-2xl mx-auto leading-relaxed">
              Reservia est la première plateforme tunisienne de réservation multi-services, 100 % gratuite. Réservez tous vos
              services locaux depuis un seul espace simple, clair et sans frais cachés.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          NOTRE HISTOIRE
      ══════════════════════════════════════════════ */}
      <section className="section bg-[rgb(var(--surface))]">
        <div className="container-app">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 mb-4">
                  <CalendarIcon className="w-5 h-5 text-[rgb(var(--primary))]" />
                  <span className="text-sm font-medium text-[rgb(var(--primary))]">Depuis 2026</span>
                </div>
                <h2 className="font-display text-2xl md:text-3xl text-[rgb(var(--foreground))] mb-4">
                  La première plateforme tunisienne :<br />
                  <span className="gradient-text">réservation multi-services gratuite</span>
                </h2>
                <p className="text-[rgb(var(--foreground-muted))] mb-4 leading-relaxed">
                  En 2026, Reservia se lance comme la nouveauté tunisienne qui concrétise ce concept : une réservation
                  multi-services moderne, simple et totalement gratuite pour tous les utilisateurs.
                </p>
                <p className="text-[rgb(var(--foreground-muted))] leading-relaxed">
                  Nous connectons les habitants et les visiteurs avec des prestataires locaux de confiance,
                  en offrant une expérience claire, rapide et accessible depuis leur smartphone ou ordinateur.
                </p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--accent))] rounded-2xl blur-2xl opacity-20" />
                <div className="relative bg-[rgb(var(--card))] rounded-2xl p-8 border border-[rgb(var(--border))]">
                  <div className="text-6xl mb-4 text-[rgb(var(--primary))]">💡</div>
                  <p className="text-[rgb(var(--foreground-muted))] italic">
                    "L&apos;objectif est de rendre la résolution de services aussi simple que commander en ligne."
                  </p>
                  <p className="text-[rgb(var(--foreground))] font-semibold mt-4">— L&apos;équipe Reservia</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          NOS VALEURS
      ══════════════════════════════════════════════ */}
      <section className="section">
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className="font-display text-[rgb(var(--foreground))]">Nos valeurs</h2>
            <p className="text-[rgb(var(--foreground-muted))] mt-3 max-w-lg mx-auto">
              Ce qui nous guide au quotidien
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {VALUES.map((value, index) => (
              <div
                key={value.title}
                className="card text-center animate-fadeInUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 rounded-2xl bg-[rgba(var(--primary),0.1)] flex items-center justify-center mx-auto mb-4 text-[rgb(var(--primary))]">
                  {value.icon}
                </div>
                <h3 className="font-semibold text-[rgb(var(--foreground))] mb-2">{value.title}</h3>
                <p className="text-sm text-[rgb(var(--foreground-muted))]">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          POURQUOI RESERVIA ? (Tableau comparatif)
      ══════════════════════════════════════════════ */}
      <section className="section bg-[rgb(var(--surface))]">
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className="font-display text-[rgb(var(--foreground))]">Pourquoi Reservia ?</h2>
            <p className="text-[rgb(var(--foreground-muted))] mt-3">
              La différence avec les plateformes traditionnelles
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl overflow-hidden border border-[rgb(var(--border))]">
              <div className="grid grid-cols-3 bg-[rgba(var(--primary),0.05)] p-4 font-semibold text-[rgb(var(--foreground))]">
                <div>Fonctionnalité</div>
                <div className="text-center">Reservia</div>
                <div className="text-center">Autres plateformes</div>
              </div>
              {COMPARISON.map((item, index) => (
                <div
                  key={item.feature}
                  className={`grid grid-cols-3 p-4 text-sm ${
                    index !== COMPARISON.length - 1 ? 'border-b border-[rgb(var(--border))]' : ''
                  }`}
                >
                  <div className="text-[rgb(var(--foreground))]">{item.feature}</div>
                  <div className="text-center">
                    {item.reservia ? (
                      <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <span className="text-[rgb(var(--foreground-muted))]">—</span>
                    )}
                  </div>
                  <div className="text-center">
                    {item.others ? (
                      <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <span className="text-[rgb(var(--foreground-muted))]">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════════ */}
      <section className="section">
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className="font-display text-[rgb(var(--foreground))]">Questions fréquentes</h2>
            <p className="text-[rgb(var(--foreground-muted))] mt-3">
              Tout ce que vous devez savoir
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {FAQ.map((item, index) => (
              <details
                key={index}
                className="card group animate-fadeInUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <summary className="flex items-center justify-between cursor-pointer list-none p-4 font-semibold text-[rgb(var(--foreground))]">
                  {item.q}
                  <ChevronRightIcon className="w-5 h-5 transition-transform group-open:rotate-90" />
                </summary>
                <div className="px-4 pb-4 text-[rgb(var(--foreground-muted))] border-t border-[rgb(var(--border))] pt-3">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CONTACT
      ══════════════════════════════════════════════ */}
      <section className="section">
        <div className="container-app">
          <div
            className="relative overflow-hidden rounded-[var(--radius-xl)] px-8 py-12 text-center"
            style={{
              background: 'linear-gradient(135deg, rgb(var(--primary)) 0%, rgb(var(--accent)) 100%)',
            }}
          >
            <div className="relative z-10 max-w-2xl mx-auto">
              <HeadphonesIcon className="w-12 h-12 text-white mx-auto mb-4" />
              <h2 className="font-display text-white text-2xl md:text-3xl mb-4">
                Une question ? Besoin d&apos;aide ?
              </h2>
              <p className="text-white/80 mb-6">
                Notre équipe est là pour vous accompagner
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="mailto:support@reservia.com"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[rgb(var(--primary))] rounded-full font-semibold hover:shadow-lg transition-all"
                >
                  support@reservia.com
                </a>
                <a
                  href="tel:+21612345678"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 text-white rounded-full font-semibold hover:bg-white/30 transition-all"
                >
                  +216 28 428 453
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}