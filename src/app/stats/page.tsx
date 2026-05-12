"use client";

import { useState, useEffect } from "react";
import {
  Title,
  Text,
  Stack,
  Group,
  Paper,
  SimpleGrid,
  ThemeIcon,
  Badge,
  Box,
  Divider,
  Anchor,
  Progress,
} from "@mantine/core";
import { 
  IconUsers, 
  IconCalendarStats, 
  IconMoon, 
  IconLayoutKanban, 
  IconSettings,
  IconArrowRight
} from "@tabler/icons-react";
import { getStats } from "@/lib/actions/reservations";
import { getProjects } from "@/lib/actions/projects";
import { getMaintenanceTasksWithProgress } from "@/lib/actions/maintenance";
import Link from "next/link";

export default function StatsPage() {
  const [stats, setStats] = useState({ totalReservations: 0, totalAttendees: 0, totalDays: 0 });
  const [projects, setProjects] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function fetchData() {
      const [statsData, projectsData, maintenanceData] = await Promise.all([
        getStats(),
        getProjects(),
        getMaintenanceTasksWithProgress()
      ]);
      setStats(statsData);
      setProjects(projectsData);
      setMaintenance(maintenanceData);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (!mounted) return null;

  const projectCounts = {
    planned: projects.filter(p => p.status === 'planned').length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
  };

  return (
    <Stack gap="xl" py="md">
      <Stack gap="xs">
        <Title order={1} size="h1" fw={900}>
          Käyttötilastot
        </Title>
        <Text size="xl" fw={500} c="dimmed" style={{ maxWidth: 700 }}>
          Villa Hvitfeltin käyttö ja ylläpito lukuina.
        </Text>
      </Stack>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
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

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="xl">
        {/* PROJECTS PREVIEW */}
        <Paper p="xl" radius="md" withBorder shadow="sm">
          <Stack gap="lg">
            <Group justify="space-between">
              <Group gap="sm">
                <ThemeIcon size={44} radius="md" color="forestGreen" variant="light">
                  <IconLayoutKanban size={26} />
                </ThemeIcon>
                <div>
                  <Title order={3} size="h4" fw={800}>Projektit</Title>
                  <Text size="xs" c="dimmed" fw={700} tt="uppercase">Kanban-tilanne</Text>
                </div>
              </Group>
              <Link href="/projects" style={{ textDecoration: 'none' }}>
              <Anchor fw={700} c="forestGreen" size="sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                Avaa projektit <IconArrowRight size={14} />
              </Anchor>
            </Link>
          </Group>

          <SimpleGrid cols={3} spacing="md">
              <Box>
                <Text size="xs" fw={800} c="dimmed" mb={4}>SUUNNITTEILLA</Text>
                <Text fw={900} fz="24px">{projectCounts.planned}</Text>
              </Box>
              <Box>
                <Text size="xs" fw={800} c="blue" mb={4}>KÄYNNISSÄ</Text>
                <Text fw={900} fz="24px" c="blue">{projectCounts.active}</Text>
              </Box>
              <Box>
                <Text size="xs" fw={800} c="forestGreen" mb={4}>VALMIS</Text>
                <Text fw={900} fz="24px" c="forestGreen">{projectCounts.completed}</Text>
              </Box>
            </SimpleGrid>

            <Divider />

            <Stack gap="xs">
              <Text size="sm" fw={700}>Uusimmat projektit:</Text>
              {projects.slice(0, 3).map(p => (
                <Group key={p.id} justify="space-between" wrap="nowrap">
                  <Text size="sm" fw={600} truncate>{p.title}</Text>
                  <Badge 
                    size="sm" 
                    variant="dot" 
                    color={p.status === 'active' ? 'blue' : p.status === 'completed' ? 'forestGreen' : 'gray'}
                  >
                    {p.status}
                  </Badge>
                </Group>
              ))}
            </Stack>
          </Stack>
        </Paper>

        {/* MAINTENANCE PREVIEW */}
        <Paper p="xl" radius="md" withBorder shadow="sm">
          <Stack gap="lg">
            <Group justify="space-between">
              <Group gap="sm">
                <ThemeIcon size={44} radius="md" color="orange" variant="light">
                  <IconSettings size={26} />
                </ThemeIcon>
                <div>
                  <Title order={3} size="h4" fw={800}>Huolto</Title>
                  <Text size="xs" c="dimmed" fw={700} tt="uppercase">Tehtävien tila</Text>
                </div>
              </Group>
              <Link href="/huolto" style={{ textDecoration: 'none' }}>
                <Anchor fw={700} c="orange" size="sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  Avaa huoltokirja <IconArrowRight size={14} />
                </Anchor>
              </Link>
            </Group>

            <Stack gap="md">
              {maintenance.slice(0, 3).map(task => (
                <Box key={task.id}>
                  <Group justify="space-between" mb={4}>
                    <Text size="sm" fw={700}>{task.title}</Text>
                    <Text size="xs" fw={700} c={task.status === 'overdue' ? 'red' : 'dimmed'}>
                      {Math.round(task.progress)}%
                    </Text>
                  </Group>
                  <Progress 
                    value={Math.min(task.progress, 100)} 
                    size="sm" 
                    radius="xl" 
                    color={task.status === 'overdue' ? 'red' : task.status === 'due-soon' ? 'orange' : 'forestGreen'} 
                  />
                </Box>
              ))}
              {maintenance.length === 0 && (
                <Text size="sm" c="dimmed" style={{ fontStyle: 'italic' }}>Ei huoltotehtäviä määriteltynä.</Text>
              )}
            </Stack>

            <Divider />

            <Group gap="xl">
               <Box>
                 <Text size="xs" fw={800} c="red" mb={2}>RÄSTISSÄ</Text>
                 <Text fw={900} fz="xl" c="red">{maintenance.filter(t => t.status === 'overdue').length}</Text>
               </Box>
               <Box>
                 <Text size="xs" fw={800} c="orange" mb={2}>LÄHELLÄ</Text>
                 <Text fw={900} fz="xl" c="orange">{maintenance.filter(t => t.status === 'due-soon').length}</Text>
               </Box>
               <Box>
                 <Text size="xs" fw={800} c="forestGreen" mb={2}>KUNNOSSA</Text>
                 <Text fw={900} fz="xl" c="forestGreen">{maintenance.filter(t => t.status === 'good' || t.status === 'automatic').length}</Text>
               </Box>
            </Group>
          </Stack>
        </Paper>
      </SimpleGrid>
    </Stack>
  );
}

function StatsCard({ title, value, icon: Icon, color }: any) {
  return (
    <Paper p="xl" radius="md" withBorder shadow="sm">
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Text size="sm" c="dimmed" fw={700} tt="uppercase" lts="0.05em">{title}</Text>
          <Text fw={900} fz="42px" lh={1}>{value}</Text>
        </Stack>
        <ThemeIcon color={color} size={64} radius="md" variant="light">
          <Icon size={38} stroke={1.5} />
        </ThemeIcon>
      </Group>
    </Paper>
  );
}
