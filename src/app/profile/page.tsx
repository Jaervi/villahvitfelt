"use client";

import { useState } from "react";
import {
  Title,
  Text,
  Stack,
  Avatar,
  Paper,
  Group,
  Button,
  Container,
  Divider,
  Badge,
  TextInput,
  ActionIcon,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconUser, IconMail, IconShield, IconArrowLeft, IconLogout, IconEdit, IconCheck, IconX } from "@tabler/icons-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ExtendedUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  role?: string;
}

export default function ProfilePage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  if (isPending) return null;

  if (!session) {
    router.push("/login");
    return null;
  }

  const user = session.user as ExtendedUser;

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  const startEditing = () => {
    setNewName(user.name);
    setIsEditing(true);
  };

  const handleUpdateName = async () => {
    if (!newName || newName === user.name) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    const { error } = await authClient.updateUser({
      name: newName,
    });

    if (error) {
      notifications.show({
        title: "Virhe",
        message: error.message || "Nimen päivittäminen epäonnistui",
        color: "red",
      });
    } else {
      notifications.show({
        title: "Onnistui",
        message: "Nimesi on päivitetty",
        color: "green",
      });
      setIsEditing(false);
      router.refresh();
    }
    setSaving(false);
  };

  return (
    <Container size="sm" py="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <Button
            component={Link}
            href="/"
            variant="subtle"
            color="forestGreen"
            leftSection={<IconArrowLeft size={18} />}
            fw={700}
          >
            Palaa etusivulle
          </Button>
          <Button
            variant="outline"
            color="red"
            leftSection={<IconLogout size={18} />}
            onClick={handleLogout}
            fw={700}
          >
            Kirjaudu ulos
          </Button>
        </Group>

        <Paper p="xl" radius="md">
          <Stack align="center" gap="md">
            <Avatar
              src={user.image}
              size={120}
              radius="xl"
              color="forestGreen"
              style={{ border: "4px solid var(--mantine-color-default-border)" }}
            >
              {user.name?.charAt(0)}
            </Avatar>
            <Stack gap={5} align="center">
              {isEditing ? (
                <Group gap="xs">
                  <TextInput
                    value={newName}
                    onChange={(e) => setNewName(e.currentTarget.value)}
                    size="md"
                    styles={{
                      input: { fontWeight: 800, fontSize: "20px", textAlign: "center" }
                    }}
                    autoFocus
                  />
                  <ActionIcon color="green" variant="light" size="lg" onClick={handleUpdateName} loading={saving}>
                    <IconCheck size={20} />
                  </ActionIcon>
                  <ActionIcon color="red" variant="light" size="lg" onClick={() => setIsEditing(false)} disabled={saving}>
                    <IconX size={20} />
                  </ActionIcon>
                </Group>
              ) : (
                <Group gap="xs">
                  <Title order={2} fw={800}>
                    {user.name}
                  </Title>
                  <ActionIcon variant="subtle" color="forestGreen" onClick={startEditing} size="sm">
                    <IconEdit size={16} />
                  </ActionIcon>
                </Group>
              )}
              <Badge color="forestGreen" variant="filled" size="lg">
                {user.role === "admin" ? "Ylläpitäjä" : "Käyttäjä"}
              </Badge>
            </Stack>
          </Stack>

          <Divider my="xl" />

          <Stack gap="lg">
            <Group>
              <ThemeIconWrapper>
                <IconMail size={20} />
              </ThemeIconWrapper>
              <div>
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  Sähköposti
                </Text>
                <Text fw={600}>
                  {user.email}
                </Text>
              </div>
            </Group>

            <Group>
              <ThemeIconWrapper>
                <IconShield size={20} />
              </ThemeIconWrapper>
              <div>
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  Rooli
                </Text>
                <Text fw={600}>
                  {user.role === "admin" ? "Järjestelmän ylläpitäjä" : "Mökin vieras"}
                </Text>
              </div>
            </Group>

            <Group>
              <ThemeIconWrapper>
                <IconUser size={20} />
              </ThemeIconWrapper>
              <div>
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  Käyttäjä-ID
                </Text>
                <Text fw={500} size="sm" style={{ fontFamily: "monospace" }}>
                  {user.id}
                </Text>
              </div>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}

function ThemeIconWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: "var(--mantine-color-forestGreen-1)",
        color: "var(--mantine-color-forestGreen-9)",
        width: "40px",
        height: "40px",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </div>
  );
}
