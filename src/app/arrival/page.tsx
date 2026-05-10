'use client';

import { Title, Text, Stack, Container, List, ThemeIcon } from '@mantine/core';
import { IconMapPin, IconParkingCircle, IconKey } from '@tabler/icons-react';

export default function ArrivalPage() {
  return (
    <Stack gap="xl">
      <Stack gap="xs">
        <Title order={1} size="h1" style={{ letterSpacing: '-0.02em' }}>
          Saapuminen
        </Title>
        <Text size="xl" fw={500} style={{ maxWidth: 700, opacity: 0.85 }}>
          Tervetuloa Villa Hvitfeltiin. Täältä löydät ohjeet perille pääsemiseksi.
        </Text>
      </Stack>

      <Container size="md" p={0} ml={0}>
        <List
          spacing="md"
          size="md"
          center
        >
          <List.Item 
            icon={
              <ThemeIcon color="forestGreen" size={24} radius="xl">
                <IconMapPin size={16} />
              </ThemeIcon>
            }
          >
            <Text fw={800} fz="18px">Osoite:</Text>
            <Text fw={500}>Hvitfelttie 123, 00000 Saaristokunta</Text>
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="forestGreen" size={24} radius="xl">
                <IconParkingCircle size={16} />
              </ThemeIcon>
            }
          >
            <Text fw={800} fz="18px">Pysäköinti:</Text>
            <Text fw={500}>Pääportin vieressä on tilaa kahdelle autolle. Muista jättää pelastustie vapaaksi.</Text>
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="forestGreen" size={24} radius="xl">
                <IconKey size={16} />
              </ThemeIcon>
            }
          >
            <Text fw={800} fz="18px">Avain:</Text>
            <Text fw={500}>Avain löytyy numerolukollisesta avainkaapista pääoven vierestä. Koodi lähetetään erikseen.</Text>
          </List.Item>
        </List>
      </Container>
    </Stack>
  );
}
