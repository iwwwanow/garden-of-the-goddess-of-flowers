import { Button, Card, Text, Title } from '@telegram-apps/telegram-ui';
import { MeResponse, api } from '../api';
import { useState } from 'react';

interface Props {
  me: MeResponse | null;
  onRefresh: () => void;
}

export function HomePage({ me, onRefresh }: Props) {
  const [watering, setWatering] = useState(false);

  if (!me?.flower) {
    return (
      <div style={{ padding: 16 }}>
        <Text>У тебя пока нет цветка.</Text>
      </div>
    );
  }

  const { flower } = me;
  const isDried = flower.isDried;
  const imageUrl = `/api/assets/flowers/${flower.flower.imagePath}`;

  async function handleWater() {
    if (!me?.flower || flower.wateredToday || isDried) return;
    setWatering(true);
    try {
      await api.waterFlower(me.flower.id);
      onRefresh();
    } finally {
      setWatering(false);
    }
  }

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
      <Title level="2">Сезон {flower.flower.season}</Title>

      <div style={{ position: 'relative', width: 200, height: 200 }}>
        <img
          src={imageUrl}
          alt="flower"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: 16,
            filter: isDried ? 'grayscale(100%)' : 'none',
          }}
        />
        {isDried && (
          <div style={{
            position: 'absolute', bottom: 8, left: 8,
            background: 'rgba(0,0,0,0.6)', color: '#fff',
            padding: '2px 8px', borderRadius: 8, fontSize: 12,
          }}>
            засох
          </div>
        )}
      </div>

      <Card style={{ width: '100%', padding: 16 }}>
        <Text weight="2">День роста: {flower.day} / 7</Text>
        <Text>Баланс: {me.user.fdBalance} FD</Text>
        <Text>Семян: {me.seeds.reduce((s, x) => s + x.quantity, 0)}</Text>
      </Card>

      {!isDried && (
        <Button
          size="l"
          stretched
          disabled={flower.wateredToday || watering}
          onClick={handleWater}
        >
          {flower.wateredToday ? 'Уже полит сегодня' : watering ? '...' : 'Полить'}
        </Button>
      )}
    </div>
  );
}
