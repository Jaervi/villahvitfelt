"use client";

import { useState, useEffect } from "react";
import {
  Title,
  Text,
  Stack,
  Group,
  Button,
  SimpleGrid,
  Card,
  Badge,
  ActionIcon,
  Modal,
  TextInput,
  Paper,
  Box,
  Divider,
  ThemeIcon,
  LoadingOverlay,
} from "@mantine/core";
import {
  IconPlus,
  IconBook2,
  IconChevronRight,
  IconCategory,
  IconInfoCircle,
} from "@tabler/icons-react";
import { getGuides, createGuide } from "@/lib/actions/guides";
import { notifications } from "@mantine/notifications";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

interface Guide {
  id: string;
  title: string;
  category: string;
  content: string;
  createdAt: Date;
}

export default function GuidesHubPage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const { data: session } = authClient.useSession();
  const isAdmin = session?.user.role === "admin";

  const [newGuide, setNewGuide] = useState({
    title: "",
    category: "Yleistä",
  });

  const fetchGuides = async () => {
    setLoading(true);
    const data = await getGuides();
    setGuides(data as any);
    setLoading(false);
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  const handleCreateGuide = async () => {
    if (!newGuide.title) return;
    setLoading(true);
    const res = await createGuide({
      ...newGuide,
      content: "<h1>Uusi opas</h1><p>Kirjoita tähän oppaan sisältö...</p>",
    });
    if (res.success) {
      notifications.show({ title: "Opas luotu", message: "Uusi opas on lisätty. Voit nyt muokata sen sisältöä.", color: "green" });
      setCreateModalOpened(false);
      setNewGuide({ title: "", category: "Yleistä" });
      await fetchGuides();
    } else {
      notifications.show({ title: "Virhe", message: res.error, color: "red" });
    }
    setLoading(false);
  };

  const categories = Array.from(new Set(guides.map((g) => g.category)));

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="flex-end">
        <Stack gap="xs">
          <Title order={1} size="h1" style={{ letterSpacing: "-0.02em" }}>
            Oppaat ja ohjeet
          </Title>
          <Text size="xl" fw={600} style={{ opacity: 0.85 }}>
            Kaikki tarvittava tieto mökillä oleskeluun.
          </Text>
        </Stack>
        {isAdmin && (
          <Button 
            leftSection={<IconPlus size={18} />} 
            color="forestGreen" 
            onClick={() => setCreateModalOpened(true)}
            fw={800}
          >
            Luo uusi opas
          </Button>
        )}
      </Group>

      {loading && <Box pos="relative" h={200}><LoadingOverlay visible /></Box>}

      {!loading && guides.length === 0 && (
        <Paper withBorder p="xl" radius="md" bg="var(--mantine-color-gray-0)" style={{ textAlign: "center" }}>
          <Stack align="center" gap="md">
            <IconInfoCircle size={40} color="var(--mantine-color-gray-4)" />
            <Text fw={700} c="dimmed">Ei vielä luotuja oppaita.</Text>
          </Stack>
        </Paper>
      )}

      {categories.map((category) => (
        <Stack key={category} gap="md">
          <Group gap="xs">
            <ThemeIcon variant="light" color="forestGreen" radius="md">
              <IconCategory size={18} />
            </ThemeIcon>
            <Title order={2} size="h3" fw={800}>{category}</Title>
          </Group>
          <Divider />
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            {guides
              .filter((g) => g.category === category)
              .map((guide) => (
                <Card 
                  key={guide.id} 
                  shadow="sm" 
                  padding="xl" 
                  radius="md" 
                  withBorder 
                  component={Link}
                  href={`/oppaat/${guide.id}`}
                  style={{ 
                    transition: "transform 0.1s ease, box-shadow 0.1s ease",
                    cursor: "pointer",
                    textDecoration: "none",
                    color: "inherit"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "var(--mantine-shadow-md)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "var(--mantine-shadow-sm)";
                  }}
                >
                  <Stack h="100%">
                    <Group justify="space-between">
                      <Title order={3} size="h4" fw={800}>{guide.title}</Title>
                      <IconChevronRight size={20} color="var(--mantine-color-forestGreen-6)" />
                    </Group>
                    <Text size="sm" c="dimmed" fw={500} mt="auto">
                      Päivitetty {new Date(guide.createdAt).toLocaleDateString("fi-FI")}
                    </Text>
                  </Stack>
                </Card>
              ))}
          </SimpleGrid>
        </Stack>
      ))}

      <Modal 
        opened={createModalOpened} 
        onClose={() => setCreateModalOpened(false)} 
        title={<Text fw={800} size="lg">Luo uusi opas</Text>}
        radius="md"
      >
        <Stack gap="md">
          <TextInput
            label="Oppaan nimi"
            placeholder="Esim. Saunan lämmitysohje"
            required
            value={newGuide.title}
            onChange={(e) => setNewGuide({ ...newGuide, title: e.currentTarget.value })}
            fw={700}
          />
          <TextInput
            label="Kategoria"
            placeholder="Esim. Sauna, Piha, Veneily"
            value={newGuide.category}
            onChange={(e) => setNewGuide({ ...newGuide, category: e.currentTarget.value })}
            fw={700}
          />
          <Button 
            fullWidth 
            color="forestGreen" 
            mt="md" 
            onClick={handleCreateGuide}
            loading={loading}
            fw={800}
          >
            Luo opas
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
