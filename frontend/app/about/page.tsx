// app/about/page.tsx

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            À propos de BookingHub
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Votre plateforme intelligente de réservation multi-services en Tunisie
          </p>
        </div>

        {/* Mission */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Notre Mission
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                BookingHub est une plateforme de réservation intelligente qui connecte les clients 
                aux fournisseurs de services divers (hôtels, restaurants, salons, gyms, etc.) à travers 
                toute la Tunisie.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Nous simplifions la recherche et la réservation de services locaux grâce à notre 
                technologie IA et notre carte interactive géolocalisée.
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-8">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Pourquoi BookingHub ?
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>✓ Recherche unifiée multi-catégories</li>
                <li>✓ Recommandations IA personnalisées</li>
                <li>✓ Réservation en temps réel</li>
                <li>✓ Carte interactive avec géolocalisation</li>
                <li>✓ Assistant vocal IA</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Nos Fonctionnalités
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Recherche Intelligente
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Trouvez rapidement le service idéal grâce à notre moteur de recherche 
                intelligent et nos filtres avancés.
              </p>
            </div>
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Assistant IA
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Notre chatbot intelligent avec support vocal vous guide et vous recommande 
                des services adaptés à vos besoins.
              </p>
            </div>
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Carte Interactive
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Visualisez les services autour de vous sur une carte interactive avec 
                itinéraires et informations en temps réel.
              </p>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Catégories de Services
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Hébergement', icon: '🏨', count: '500+' },
              { name: 'Restauration', icon: '🍽️', count: '800+' },
              { name: 'Beauté', icon: '💅', count: '600+' },
              { name: 'Fitness', icon: '💪', count: '300+' },
              { name: 'Santé', icon: '🏥', count: '400+' },
              { name: 'Éducation', icon: '📚', count: '250+' },
              { name: 'Loisirs', icon: '🎮', count: '350+' },
              { name: 'Services', icon: '🔧', count: '700+' },
            ].map((category) => (
              <div 
                key={category.name}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-center hover:border-blue-500 transition-colors"
              >
                <div className="text-3xl mb-2">{category.icon}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.count} fournisseurs</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Vous êtes un fournisseur de services ?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Rejoignez BookingHub et atteignez des milliers de clients en Tunisie
            </p>
            <a
              href="/register?role=provider"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Créer un compte fournisseur
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}