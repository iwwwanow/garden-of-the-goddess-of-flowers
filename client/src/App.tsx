import { useEffect, useState } from 'react';
import { AppRoot, Tabbar } from '@telegram-apps/telegram-ui';
import { HomePage } from './pages/HomePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { api, setToken, MeResponse } from './api';

type Tab = 'home' | 'leaderboard' | 'profile';

export function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;
    tg.ready();

    api.auth(tg.initData)
      .then(({ token }) => {
        setToken(token);
        return api.me();
      })
      .then(setMe)
      .finally(() => setLoading(false));
  }, []);

  const refresh = () => api.me().then(setMe);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>...</div>;

  return (
    <AppRoot>
      {tab === 'home' && <HomePage me={me} onRefresh={refresh} />}
      {tab === 'leaderboard' && <LeaderboardPage />}
      {tab === 'profile' && <ProfilePage me={me} />}
      <Tabbar>
        <Tabbar.Item
          text="Цветок"
          selected={tab === 'home'}
          onClick={() => setTab('home')}
        />
        <Tabbar.Item
          text="Лидеры"
          selected={tab === 'leaderboard'}
          onClick={() => setTab('leaderboard')}
        />
        <Tabbar.Item
          text="Профиль"
          selected={tab === 'profile'}
          onClick={() => setTab('profile')}
        />
      </Tabbar>
    </AppRoot>
  );
}
