import HomeBackground from './_components/HomeBackground';
import HomeHero from './_components/HomeHero';
import HomeSocials from './_components/HomeSocials';

export default async function Home() {
  return (
    <main className="min-h-screen overflow-hidden relative">
      <HomeBackground />
      <HomeHero />
      <HomeSocials />
    </main>
  );
}
