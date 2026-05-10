'use client';

import { Title, Text, Stack, List, ThemeIcon } from '@mantine/core';
import { IconBook } from '@tabler/icons-react';
import { AuthBlock } from '@/components/AuthBlock';

export default function ManualPage() {
  return (
    <Stack gap="xl">
      <Stack gap="xs">
        <Title order={1} size="h1">
          Mökin ohjeet
        </Title>
        <Text size="xl" fw={500} style={{ maxWidth: 700, opacity: 0.85 }}>
          Täältä löydät kaikki tarvittavat tiedot mökin käytöstä ja ylläpidosta.
        </Text>
      </Stack>

      <AuthBlock>
        <Stack gap="md">
          <List
            spacing="md"
            size="sm"
            center
            icon={
              <ThemeIcon color="forestGreen" size={24} radius="xl">
                <IconBook size={16} />
              </ThemeIcon>
            }
          >
            <List.Item>
              <Text fw={800}>Wifi:</Text>
              <Text fw={500} style={{ opacity: 0.9 }}>Verkon nimi: Villahvitfelt_Guest, Salasana: Metsärauha2024</Text>
            </List.Item>
            <List.Item>
              <Text fw={800}>Jätehuolto:</Text>
              <Text fw={500} style={{ opacity: 0.9 }}>Lajittele jätteet: biojäte, muovi, lasi/metalli ja sekajäte. Astiat löytyvät autokatoksen takaa.</Text>
            </List.Item>
            <List.Item>
              <Text fw={800}>Vesipumppu:</Text>
              <Text fw={500} style={{ opacity: 0.9 }}>Vesi tulee omasta kaivosta. Säästä vettä varsinkin kuivina kausina.</Text>
            </List.Item>
          </List>
        </Stack>
      </AuthBlock>
    </Stack>
  );
}
