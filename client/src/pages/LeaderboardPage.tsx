import { useEffect, useState } from 'react';
import { Cell, List, Title } from '@telegram-apps/telegram-ui';
import { api, User } from '../api';

export function LeaderboardPage() {
  const [leaders, setLeaders] = useState<User[]>([]);

  useEffect(() => {
    api.leaderboard().then(setLeaders);
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <Title level="2" style={{ marginBottom: 12 }}>Таблица лидеров</Title>
      <List>
        {leaders.map((user, i) => (
          <Cell
            key={user.id}
            before={<span style={{ width: 24, textAlign: 'center', fontWeight: 'bold' }}>{i + 1}</span>}
            after={<span>{user.fdBalance} FD</span>}
          >
            {user.firstName}{user.username ? ` @${user.username}` : ''}
          </Cell>
        ))}
      </List>
    </div>
  );
}
