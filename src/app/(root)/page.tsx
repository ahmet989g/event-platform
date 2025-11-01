import EventsSection from "@/components/pages/home/EventsSection";
import HomePage from "@/components/pages/home/HomePage";

export const revalidate = 300;
export const fetchCache = 'default-cache';

export default function Home() {
  return (
    <div className="container mx-auto !px-0 py-12">
      <HomePage />
      <EventsSection />
    </div>
  );
}