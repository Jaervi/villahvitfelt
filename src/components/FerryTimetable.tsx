"use client";

import { useState, useEffect } from "react";
import {
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Badge,
  SimpleGrid,
  ThemeIcon,
  Box,
  Divider,
  Skeleton,
  Button,
  Anchor,
} from "@mantine/core";
import {
  IconShip,
  IconArrowRight,
  IconClock,
  IconCircleCheck,
  IconAlertCircle,
  IconExternalLink,
} from "@tabler/icons-react";
import { getFerrySchedule, type FullSchedule, type Timetable } from "@/lib/actions/ferry";

export function FerryTimetable() {
  const [schedule, setSchedule] = useState<FullSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const externalUrl = "https://www.finferries.fi/lauttaliikenne/lauttapaikat-ja-aikataulut/parainen-nauvo.html";

  useEffect(() => {
    const fetchSchedules = async () => {
      const data = await getFerrySchedule();
      setSchedule(data);
      setLoading(false);
    };
    fetchSchedules();

    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getActiveTimetable = (): Timetable | null => {
    if (!schedule) return null;
    const day = currentTime.getDay();
    if (day === 0) return schedule.sunday;
    if (day === 6) return schedule.saturday;
    return schedule.weekday;
  };

  const getNextFerries = (times: string[], count = 4) => {
    // Force HH:MM format with colon for comparison (en-GB uses colon, fi-FI often uses dot)
    const nowInFinland = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Europe/Helsinki",
    }).format(currentTime);

    // Handle wrap-around
    const upcoming = times.filter((t) => t > nowInFinland);
    
    // If we have fewer than count upcoming, add the first ones from tomorrow
    if (upcoming.length < count) {
      upcoming.push(...times.slice(0, count - upcoming.length));
    }

    return upcoming.slice(0, count);
  };

  const activeTimetable = getActiveTimetable();
  const parainenNext = activeTimetable ? getNextFerries(activeTimetable.parainen) : [];
  const nauvoNext = activeTimetable ? getNextFerries(activeTimetable.nauvo) : [];

  if (loading) return <Skeleton height={200} radius="md" />;
  
  if (!schedule || (parainenNext.length === 0 && nauvoNext.length === 0)) {
    return (
      <Paper withBorder radius="md" p="xl" bg="var(--mantine-color-gray-0)">
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <IconAlertCircle color="var(--mantine-color-gray-5)" />
            <Text fw={700} c="dimmed">Lautta-aikatauluja ei voitu ladata.</Text>
          </Group>
          <Button 
            component="a" 
            href={externalUrl} 
            target="_blank" 
            variant="light" 
            color="blue" 
            size="xs" 
            fw={700}
            leftSection={<IconExternalLink size={14} />}
          >
            Katso Finferries.fi
          </Button>
        </Group>
      </Paper>
    );
  }

  return (
    <Paper withBorder radius="md" p="xl" shadow="sm">
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="xs">
            <ThemeIcon color="blue" variant="light" size="lg" radius="md">
              <IconShip size={20} />
            </ThemeIcon>
            <Title order={3} fw={800} size="h3">Lautta-aikataulut</Title>
          </Group>
          <Badge variant="dot" color="blue" size="lg">Parainen - Nauvo</Badge>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
          {/* Parainen -> Nauvo */}
          <Stack gap="sm">
            <Group gap="xs">
              <Text fw={800} size="sm" c="dimmed" tt="uppercase">Lähtö: Parainen</Text>
              <IconArrowRight size={14} color="var(--mantine-color-gray-5)" />
            </Group>
            <Stack gap={6}>
              {parainenNext.map((time, index) => (
                <Paper 
                  key={`p-${time}-${index}`} 
                  p="xs" 
                  radius="md" 
                  withBorder={index === 0}
                  bg={index === 0 ? "var(--mantine-color-blue-0)" : "transparent"}
                  style={{ 
                    border: index === 0 ? "2px solid var(--mantine-color-blue-4)" : "1px solid var(--mantine-color-gray-2)",
                    transform: index === 0 ? "scale(1.02)" : "none",
                  }}
                >
                  <Group justify="space-between">
                    <Group gap="sm">
                      <IconClock size={16} color={index === 0 ? "var(--mantine-color-blue-7)" : "var(--mantine-color-gray-5)"} />
                      <Text fw={index === 0 ? 900 : 600} size={index === 0 ? "lg" : "md"}>
                        {time}
                      </Text>
                    </Group>
                    {index === 0 && (
                      <Badge color="blue" variant="filled" size="sm">Seuraava</Badge>
                    )}
                  </Group>
                </Paper>
              ))}
              {parainenNext.length === 0 && (
                <Text size="sm" c="dimmed" fs="italic">Ei aikatauluja.</Text>
              )}
            </Stack>
          </Stack>

          {/* Nauvo -> Parainen */}
          <Stack gap="sm">
            <Group gap="xs">
              <Text fw={800} size="sm" c="dimmed" tt="uppercase">Lähtö: Nauvo</Text>
              <IconArrowRight size={14} color="var(--mantine-color-gray-5)" />
            </Group>
            <Stack gap={6}>
              {nauvoNext.map((time, index) => (
                <Paper 
                  key={`n-${time}-${index}`} 
                  p="xs" 
                  radius="md" 
                  withBorder={index === 0}
                  bg={index === 0 ? "var(--mantine-color-forestGreen-0)" : "transparent"}
                  style={{ 
                    border: index === 0 ? "2px solid var(--mantine-color-forestGreen-4)" : "1px solid var(--mantine-color-gray-2)",
                    transform: index === 0 ? "scale(1.02)" : "none",
                  }}
                >
                  <Group justify="space-between">
                    <Group gap="sm">
                      <IconClock size={16} color={index === 0 ? "var(--mantine-color-forestGreen-7)" : "var(--mantine-color-gray-5)"} />
                      <Text fw={index === 0 ? 900 : 600} size={index === 0 ? "lg" : "md"}>
                        {time}
                      </Text>
                    </Group>
                    {index === 0 && (
                      <Badge color="forestGreen" variant="filled" size="sm">Seuraava</Badge>
                    )}
                  </Group>
                </Paper>
              ))}
              {nauvoNext.length === 0 && (
                <Text size="sm" c="dimmed" fs="italic">Ei aikatauluja.</Text>
              )}
            </Stack>
          </Stack>
        </SimpleGrid>

        <Divider />
        
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <IconCircleCheck size={14} color="var(--mantine-color-gray-5)" />
            <Text size="xs" c="dimmed" fw={600}>
              Päivitetty: {currentTime.toLocaleTimeString("fi-FI")}
            </Text>
          </Group>
          <Anchor href={externalUrl} target="_blank" size="xs" fw={700} c="blue">
            <Group gap={4}>
              Täydellinen aikataulu (Finferries.fi)
              <IconExternalLink size={12} />
            </Group>
          </Anchor>
        </Group>
      </Stack>
    </Paper>
  );
}
