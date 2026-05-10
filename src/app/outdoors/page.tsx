'use client';

import { Title, Text, Stack, List, ThemeIcon } from '@mantine/core';
import { IconFlame, IconRipple, IconTree } from '@tabler/icons-react';
import { AuthBlock } from '../../components/AuthBlock';

export default function OutdoorsPage() {
  return (
    <Stack gap="xl">
      <Stack gap="xs">
        <Title order={1} size="h1">
          Sauna & Ulkoilu
        </Title>
        <Text size="xl" fw={500} style={{ maxWidth: 700, opacity: 0.85 }}>
          Nauti saaristoluonnosta ja rentoudu saunassa.
        </Text>
      </Stack>

      <AuthBlock 
        title="Saunaohjeet vaativat kirjautumisen"
        description="Kirjaudu sisään lukeaksesi saunan lämmitysohjeet ja löytääksesi parhaat ulkoilureitit."
      >
        <Stack gap="md">
          <List
            spacing="md"
            size="sm"
            center
          >
            <List.Item 
              icon={
                <ThemeIcon color="forestGreen" size={24} radius="xl">
                  <IconFlame size={16} />
                </ThemeIcon>
              }
            >
              <Text fw={800}>Puusauna:</Text>
              <Text fw={500} style={{ opacity: 0.9 }}>Käytä vain kuivia puita. Tyhjennä tuhkat ennen sytytystä.</Text>
            </List.Item>
            <List.Item
              icon={
                <ThemeIcon color="forestGreen" size={24} radius="xl">
                  <IconRipple size={16} />
                </ThemeIcon>
              }
            >
              <Text fw={800}>Veneet:</Text>
              <Text fw={500} style={{ opacity: 0.9 }}>Soutuvene on vapaasti käytettävissä. Muista aina pelastusliivit!</Text>
            </List.Item>
            <List.Item
              icon={
                <ThemeIcon color="forestGreen" size={24} radius="xl">
                  <IconTree size={16} />
                </ThemeIcon>
              }
            >
              <Text fw={800}>Luontopolut:</Text>
              <Text fw={500} style={{ opacity: 0.9 }}>Mökin takaa lähtee sinisellä merkitty polku, joka kiertää niemen ympäri.</Text>
            </List.Item>
          </List>
        </Stack>
      </AuthBlock>
    </Stack>
  );
}
