'use client';

import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/common/Footer';
import NavBar from '@/components/common/NavBar';
import { TypewriterEffectSmooth } from '@/components/ui/typewriter-effect';
const Home = () => {
  const words = [
    { text: 'Welcome' },
    { text: 'to' },
    { text: 'SciCommons.', className: 'sci-accent' },
  ];

  const stats = [
    { num: '12K+', label: 'Articles Published' },
    { num: '3.4K', label: 'Active Reviewers' },
    { num: '180+', label: 'Communities' },
    { num: '98%',  label: 'Open Access' },
  ];

  return (
    <>
      <div className="sci-root">
        <div className="sci-bg" aria-hidden="true" />

        <div className="sci-nav">
          <NavBar />
        </div>
        <section className="sci-hero">
          <div className="liquid sci-badge">
            <span className="sci-pip" />
            Open Science Platform
          </div>

          <div className="sci-heading">
            <TypewriterEffectSmooth words={words} />
          </div>

          <p className="sci-sub">
            Be part of the change. Join our open platform to review, rate, and
            access research freely — improving quality through community-driven peer review.
          </p>

          <div className="sci-ctas">
            <Link href="/articles"    className="sci-btn sci-btn-primary">Explore Articles</Link>
            <Link href="/communities" className="sci-btn sci-btn-secondary">Visit Communities</Link>
          </div>
          <div className="sci-stats">
            {stats.map((s) => (
              <div key={s.label} className="liquid sci-stat">
                <div className="sci-stat-num">{s.num}</div>
                <div className="sci-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>
        <section className="sci-supporters">
          <div className="sci-divider" />
          <p className="sci-label">Our Supporters</p>
          <div className="sci-logos">
            <div className="glass sci-logo-pill">
              <Image width={160} height={40} src="/images/KCDHA-White.png" alt="KCDHA" className="hidden dark:block" />
              <Image width={160} height={40} src="/images/KCDHA-Black.png" alt="KCDHA" className="block dark:hidden" />
            </div>
            <div className="glass sci-logo-pill">
              <Image width={280} height={40} src="/images/GSoC-White.png" alt="GSoC" className="hidden dark:block" />
              <Image width={280} height={40} src="/images/GSoC-Black.png" alt="GSoC" className="block dark:hidden" />
            </div>
          </div>
        </section>
        <section className="sci-video-section">
          <p className="sci-label">Watch &amp; Learn</p>
          <h2 className="sci-video-title">Featured Video</h2>
          <div className="liquid sci-video-wrap">
            <div className="sci-video-ratio">
              <iframe
                src="https://www.youtube.com/embed/kzZ4-7w4vhk"
                title="SciCommons Introduction"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Home;
