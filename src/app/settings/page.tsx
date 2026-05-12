"use client";

import {
  Title,
  Text,
  Stack,
  Paper,
  Group,
  Button,
  Container,
  Divider,
  PasswordInput,
  SegmentedControl,
  useMantineColorScheme,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconShieldLock, IconPalette, IconArrowLeft, IconSun, IconMoon, IconDeviceDesktop } from "@tabler/icons-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "@mantine/form";

export default function SettingsPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const [savingPassword, setSavingPassword] = useState(false);

  const passwordForm = useForm({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validate: {
      newPassword: (value) => (value.length < 6 ? "Salasanan on oltava vähintään 6 merkkiä" : null),
      confirmPassword: (value, values) => (value !== values.newPassword ? "Salasanat eivät täsmää" : null),
    },
  });

  if (isPending) return null;

  if (!session) {
    router.push("/login");
    return null;
  }

  const handleChangePassword = async (values: typeof passwordForm.values) => {
    setSavingPassword(true);
    const { error } = await authClient.changePassword({
      newPassword: values.newPassword,
      currentPassword: values.currentPassword,
      revokeOtherSessions: true,
    });

    if (error) {
      notifications.show({
        title: "Virhe",
        message: error.message || "Salasanan vaihtaminen epäonnistui",
        color: "red",
      });
    } else {
      notifications.show({
        title: "Onnistui",
        message: "Salasanasi on vaihdettu. Muut istunnot on kirjailtu ulos.",
        color: "green",
      });
      passwordForm.reset();
    }
    setSavingPassword(false);
  };

  return (
    <Container size="sm" py="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <Button
            onClick={() => router.push("/")}
            variant="subtle"
            color="forestGreen"
            leftSection={<IconArrowLeft size={18} />}
            fw={700}
          >
            Palaa etusivulle
          </Button>
          <Title order={2} fw={800} style={{ letterSpacing: "-0.02em" }}>
            Asetukset
          </Title>
        </Group>

        <Paper p="xl" radius="md">
          <Stack gap="xl">
            {/* Appearance Section */}
            <section>
              <Group gap="sm" mb="md">
                <ThemeIconWrapper>
                  <IconPalette size={20} />
                </ThemeIconWrapper>
                <Title order={4} fw={800}>
                  Ulkoasu
                </Title>
              </Group>
              <Text size="sm" mb="md" fw={500} style={{ opacity: 0.85 }}>
                Valitse sovelluksen teema.
              </Text>
              <SegmentedControl
                value={colorScheme}
                onChange={(value) => setColorScheme(value as any)}
                data={[
                  {
                    value: "light",
                    label: (
                      <Center gap="xs">
                        <IconSun size={16} />
                        <span>Vaalea</span>
                      </Center>
                    ),
                  },
                  {
                    value: "dark",
                    label: (
                      <Center gap="xs">
                        <IconMoon size={16} />
                        <span>Tumma</span>
                      </Center>
                    ),
                  },
                  {
                    value: "auto",
                    label: (
                      <Center gap="xs">
                        <IconDeviceDesktop size={16} />
                        <span>Automaattinen</span>
                      </Center>
                    ),
                  },
                ]}
                fullWidth
                color="forestGreen"
              />
            </section>

            <Divider />

            {/* Security Section */}
            <section>
              <Group gap="sm" mb="md">
                <ThemeIconWrapper>
                  <IconShieldLock size={20} />
                </ThemeIconWrapper>
                <Title order={4} fw={800}>
                  Turvallisuus
                </Title>
              </Group>
              <Text size="sm" mb="md" fw={500} style={{ opacity: 0.85 }}>
                Vaihda salasanasi täällä.
              </Text>
              <form onSubmit={passwordForm.onSubmit(handleChangePassword)}>
                <Stack gap="md">
                  <PasswordInput
                    label="Nykyinen salasana"
                    placeholder="Syötä nykyinen salasanasi"
                    required
                    {...passwordForm.getInputProps("currentPassword")}
                  />
                  <PasswordInput
                    label="Uusi salasana"
                    placeholder="Vähintään 6 merkkiä"
                    required
                    {...passwordForm.getInputProps("newPassword")}
                  />
                  <PasswordInput
                    label="Vahvista uusi salasana"
                    placeholder="Toista uusi salasanasi"
                    required
                    {...passwordForm.getInputProps("confirmPassword")}
                  />
                  <Button
                    type="submit"
                    color="forestGreen"
                    loading={savingPassword}
                    fw={700}
                    mt="sm"
                  >
                    Vaihda salasana
                  </Button>
                </Stack>
              </form>
            </section>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}

function Center({ children, gap }: { children: React.ReactNode; gap: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap }}>
      {children}
    </div>
  );
}

function ThemeIconWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: "var(--mantine-color-forestGreen-1)",
        color: "var(--mantine-color-forestGreen-9)",
        width: "36px",
        height: "36px",
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
