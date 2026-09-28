import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Message from "@/components/Message";
import Challenges from "@/components/Challenges";
import Business from "@/components/Business";
import Strengths from "@/components/Strengths";
import Works from "@/components/WorksTop";
import News from "@/components/News";
import ContactCta from "@/components/ContactCta";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header transparent />
      <main id="main" className="flex flex-1 flex-col">
        <Hero />
        <Message />
        <Challenges />
        <Business />
        <Strengths />
        <Works />
        <News />
        <ContactCta />
      </main>
      <Footer />
    </>
  );
}
