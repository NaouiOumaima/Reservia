import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Your Smart Multi-Service Booking Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Find, compare, and book services in your area with intelligent recommendations. 
            One platform for restaurants, hotels, gyms, salons, and more.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/search"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg"
            >
              Start Searching
            </Link>
            <Link
              href="/register?role=provider"
              className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold text-lg"
            >
              List Your Service
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose BookingHub?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Unified Search</h3>
              <p className="text-gray-600">Search across all service categories in one place. No more switching between platforms.</p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI Assistant</h3>
              <p className="text-gray-600">Get personalized recommendations and use our AI chatbot with voice support for instant help.</p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Location-Based</h3>
              <p className="text-gray-600">Find services near you with interactive maps, directions, and distance estimates.</p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Instant Booking</h3>
              <p className="text-gray-600">Reserve services in seconds with real-time availability and automatic confirmations.</p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Trusted Reviews</h3>
              <p className="text-gray-600">Read verified reviews and ratings to make informed decisions about services.</p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="text-4xl mb-4">🔔</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Notifications</h3>
              <p className="text-gray-600">Get reminders, confirmations, and personalized offers via email, SMS, or in-app.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="font-bold text-gray-900 mb-2">Search</h3>
              <p className="text-gray-600 text-sm">Find services by keyword, category, location, or price</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="font-bold text-gray-900 mb-2">Compare</h3>
              <p className="text-gray-600 text-sm">View ratings, reviews, prices, and availability</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="font-bold text-gray-900 mb-2">Book</h3>
              <p className="text-gray-600 text-sm">Reserve your preferred time slot instantly</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">4</div>
              <h3 className="font-bold text-gray-900 mb-2">Enjoy</h3>
              <p className="text-gray-600 text-sm">Visit the service and leave a review</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-xl text-blue-100 mb-8">Join thousands of users finding their perfect services</p>
          <Link
            href="/search"
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold text-lg"
          >
            Explore Services Now
          </Link>
        </div>
      </section>
    </div>
  );
}