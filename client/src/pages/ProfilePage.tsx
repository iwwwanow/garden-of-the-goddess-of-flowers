import { Card, Text, Title } from '@telegram-apps/telegram-ui';
import { MeResponse } from '../api';

interface Props {
  me: MeResponse | null;
}

export function ProfilePage({ me }: Props) {
  if (!me) return null;
  const { user, seeds } = me;
  const totalSeeds = seeds.reduce((s, x) => s + x.quantity, 0);

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Title level="2">{user.firstName}</Title>
      {user.username && <Text>@{user.username}</Text>}

      <Card style={{ padding: 16 }}>
        <Text weight="2">Баланс: {user.fdBalance} FD</Text>
        <Text>Семян: {totalSeeds}</Text>
      </Card>

      {me.flower?.isDried && (
        <Card style={{ padding: 16 }}>
          <Title level="3">Гербарий</Title>
          <Text>Засохший цветок — день {me.flower.day}</Text>
        </Card>
      )}
    </div>
  );
}
