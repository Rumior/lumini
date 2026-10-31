import { deriveHome } from '../hooks/useHomePageData';
import type { HomePageData } from '../types/home';
import {
  KpiStrip,
  MentorCard,
  Businesses,
  RecentProjects,
  TodayFocus,
  QuickActions,
  MiniCalendar,
  RecentActivity,
} from '../components/home/HomeSections';
import './HomePage.css';

export default function HomePage({ data }: { data: HomePageData }) {
  const d = deriveHome(data);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const date = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="lh-home" aria-busy={data.loading}>
      <div className="lh-main">
        <header className="lh-hero">
          <div className="lh-hero__text">
            <p className="lh-eyebrow">
              {greeting}{data.userName ? `, ${data.userName}` : ''}
            </p>
            <h1>Your businesses, one powerful OS.</h1>
            <p className="lh-hero__lead">
              Manage your businesses, projects and team, all in one place.
            </p>
          </div>

          <div className="lh-hero__side">
            <p className="lh-hero__date">{date}</p>
            <MentorCard data={data} />
          </div>
        </header>

        <KpiStrip data={data} d={d} />
        <Businesses data={data} />

        <div className="lh-split">
          <RecentProjects data={data} />
          <TodayFocus data={data} d={d} />
        </div>
      </div>

      <aside className="lh-aside" aria-label="Utilities">
        <QuickActions data={data} />
        <MiniCalendar data={data} d={d} />
        <RecentActivity data={data} />
      </aside>

      <footer className="lh-foot">
        <span>
          Everything on this page is read from your workspace. Nothing is sent anywhere.
        </span>
        {data.error && (
          <span className="lh-foot__err" role="alert">{data.error}</span>
        )}
        {data.isDemo && (
          <span role="status">Demo data. These records are not yours.</span>
        )}
      </footer>
    </div>
  );
}
