"use client";

import { Title, Text, Stack, SimpleGrid, Badge, Box } from '@mantine/core';
import { IconMap, IconBook2, IconRipple } from '@tabler/icons-react';
import { FerryTimetable } from '@/components/FerryTimetable';
import { ParallaxBanner } from '@/components/ParallaxBanner';
import { ImageCard } from '@/components/ImageCard';
import { imageConfig } from '@/config/images';

import { HeroCarousel } from '@/components/HeroCarousel';

export default function Home() {
  return (
    <Stack gap="xl">
      {/* Hero Carousel */}
      <HeroCarousel images={imageConfig.home.hero} height={450}>
        <Stack gap="xs">
          <Title order={1} size="h1" fz="48px" style={{ letterSpacing: '-0.02em', color: '#fff' }}>
            Tervetuloa turvapaikkaasi saaristossa.
          </Title>
          <Text size="xl" fw={600} style={{ maxWidth: 700, color: '#fff', opacity: 0.9 }}>
            Hengitä raikasta ilmaa ja jätä melu taaksesi. Villa Hvitfelt tarjoaa sinulle mielenrauhan ja luonnon kauneuden rentoutua.
          </Text>
        </Stack>
      </HeroCarousel>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
        <ImageCard
          title="Saapumisohje"
          description="Ajo-ohjeet, pysäköinti ja avainten nouto sujuvaan asettumiseen."
          image={imageConfig.sections.arrival}
          href="/arrival"
          buttonText="Katso ohje"
          icon={<IconMap size={32} color="#fff" strokeWidth={2} />}
          badge={<Badge color="forestGreen" variant="filled">Tärkeää</Badge>}
        />

        <ImageCard
          title="Mökin opas"
          description="Kaikki mitä sinun tulee tietää mökistä, aina wifistä jätehuoltoon."
          image={imageConfig.sections.guides}
          href="/oppaat"
          buttonText="Lue opas"
          icon={<IconBook2 size={32} color="#fff" strokeWidth={2} />}
        />

        <ImageCard
          title="Sauna & Ulkoilu"
          description="Saunan käyttö, polkujen löytäminen ja saaristosta nauttiminen."
          image={imageConfig.sections.outdoors}
          href="/outdoors"
          buttonText="Tutustu"
          icon={<IconRipple size={32} color="#fff" strokeWidth={2} />}
        />
      </SimpleGrid>

      <FerryTimetable />

      {/* Footer Banner */}
      <ParallaxBanner src={imageConfig.home.footer} height={300}>
        <Box ta="center">
          <Title order={2} style={{ color: '#fff' }}>Pysähdy ja nauti hetkestä.</Title>
          <Text fw={500} style={{ color: '#fff', opacity: 0.8 }}>Villa Hvitfelt — Sinun kotisi saaristossa.</Text>
        </Box>
      </ParallaxBanner>
    </Stack>
  );
}
