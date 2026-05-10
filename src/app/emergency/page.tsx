'use client';

import { Title, Text, Stack, Card, Group, ThemeIcon } from '@mantine/core';
import { IconShieldHeart, IconPhone, IconHospital } from '@tabler/icons-react';

export default function EmergencyPage() {
  return (
    <Stack gap="xl">
      <Stack gap="xs">
        <Title order={1} size="h1" c="red.9">
          Hätätilanteet
        </Title>
        <Text size="xl" fw={700} c="red.9" style={{ maxWidth: 700 }}>
          Toimi rauhallisesti hätätilanteessa. Tärkeimmät numerot ja tiedot löydät tästä.
        </Text>
      </Stack>

      <Stack gap="md">
        <Card shadow="md" padding="xl" radius="md" withBorder style={{ borderColor: 'var(--mantine-color-red-filled)' }}>
          <Group gap="lg">
            <ThemeIcon color="red" size={60} radius="xl" variant="filled">
              <IconPhone size={32} />
            </ThemeIcon>
            <div>
              <Text fw={900} fz="32px" c="red.9">112</Text>
              <Text size="md" fw={800} c="red.9">Yleinen hätänumero</Text>
            </div>
          </Group>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="sm">
            <Group gap="sm">
              <IconHospital size={20} color="var(--mantine-color-red-filled)" />
              <Text fw={800}>Lähin sairaala:</Text>
            </Group>
            <Text fw={500} style={{ opacity: 0.9 }}>Saariston keskussairaala, Sairaalantie 1, 00000 Keskuskaupunki</Text>
          </Stack>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="sm">
            <Group gap="sm">
              <IconShieldHeart size={20} color="var(--mantine-color-red-filled)" />
              <Text fw={800}>Mökin koordinaatit pelastuslaitokselle:</Text>
            </Group>
            <Text fz="lg" fw={900}>60.1234° N, 21.5678° E</Text>
          </Stack>
        </Card>
      </Stack>
    </Stack>
  );
}
