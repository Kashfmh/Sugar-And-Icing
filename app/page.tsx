import ProductCard from './components/ProductCard';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-gray-50">
      <h1 className="text-5xl font-bold text-gray-900 mb-4 font-serif">Sugar And Icing</h1>
      <p className="text-lg text-gray-600 mb-12">Handmade with love in KL Sentral</p>
      
      {/* Testing our new component */}
      <ProductCard 
        name="Christmas Fruit Cake" 
        price={65.00} 
        description="Rich, traditional holiday cake packed with premium dried fruits and nuts."
        category="Seasonal"
      />
    </main>
  );
}