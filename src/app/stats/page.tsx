"use client";

import { useState, useEffect } from "react";
import {
  Title,
  Text,
  Stack,
  Group,
  Paper,
  SimpleGrid,
  RingProgress,
  ThemeIcon,
  Box,
  Divider,
} from "@mantine/core";
import { IconUsers, IconCalendarStats, IconMoon, IconChartBar } from "@tabler/icons-react";
import { getStats } from "@/lib/actions/reservations";

export default function StatsPage() {
  const [stats, setStats] = useState({ totalReservations: 0, totalAttendees: 0, totalDays: 0 });
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function fetchData() {
      const data = await getStats();
      setStats(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (!mounted) return null;

  return (
    <Stack gap="xl">
      <Stack gap="xs">
        <Title order={1}>Käyttötilastot</Title>
        <Text size="xl" fw={500} style={{ opacity: 0.85 }}>
          Villa Hvitfeltin käyttö lukuina.
        </Text>
      </Stack>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
        <StatsCard 
          title="Varaukset yhteensä" 
          value={stats.totalReservations} 
          icon={IconCalendarStats} 
          color="blue"
        />
        <StatsCard 
          title="Kävijöitä yhteensä" 
          value={stats.totalAttendees} 
          icon={IconUsers} 
          color="forestGreen"
        />
        <StatsCard 
          title="Yöpymisiä yhteensä" 
          value={stats.totalDays} 
          icon={IconMoon} 
          color="orange"
        />
      </SimpleGrid>

      <Paper p="xl" radius="md">
        <Stack gap="md">
          <Group>
            <ThemeIcon color="forestGreen" size="xl" radius="md" variant="light">
              <IconChartBar size={24} />
            </ThemeIcon>
            <Title order={3}>Käyttöasteen yleiskatsaus</Title>
          </Group>
          <Divider />
          <Text fw={500}>
            Tilastot päivittyvät reaaliajassa jokaisen uuden varauksen myötä. 
            Tavoitteenamme on pitää mökki elävänä ja saaristoluonto saavutettavana.
          </Text>
          
          <Group gap="xl" mt="md">
             <RingProgress
                size={120}
                roundCaps
                thickness={12}
                sections={[{ value: Math.min(stats.totalReservations * 5, 100), color: 'forestGreen' }]}
                label={
                  <Center>
                    <Text fw={800} ta="center" size="sm">Aktiivisuus</Text>
                  </Center>
                }
              />
              <Box style={{ flex: 1 }}>
                <Text fw={800} size="lg" mb={5}>Suosio kasvaa</Text>
                <Text size="sm" c="dimmed">
                  Mitä enemmän varauksia, sitä paremmin pystymme koordinoimaan yhteisiä huolto- ja parannusprojekteja.
                </Text>
              </Box>
          </Group>
        </Stack>
      </Paper>
    </Stack>
  );
}

function StatsCard({ title, value, icon: Icon, color }: any) {
  return (
    <Paper p="xl" radius="md" withBorder>
      <Group justify="space-between">
        <Stack gap={0}>
          <Text size="xs" c="dimmed" fw={700} tt="uppercase">{title}</Text>
          <Text fw={900} fz="32px">{value}</Text>
        </Stack>
        <ThemeIcon color={color} size={54} radius="md" variant="light">
          <Icon size={32} stroke={1.5} />
        </ThemeIcon>
      </Group>
    </Paper>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>{children}</div>;
}
