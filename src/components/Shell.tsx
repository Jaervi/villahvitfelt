'use client';

import { useState, useEffect } from 'react';
import { AppShell, NavLink, Stack, Box, Tooltip, ActionIcon, Avatar, Text, Group, Menu, UnstyledButton, Button, SegmentedControl, useMantineColorScheme, Center, Alert } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconMap, IconBook2, IconRipple, IconShieldHeart, IconChevronRight, IconChevronLeft, IconLogout, IconUser, IconSettings, IconLogin, IconSun, IconShip, IconMoon, IconDeviceDesktop, IconCalendar, IconChartBar, IconLayoutKanban, IconInfoCircle } from '@tabler/icons-react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export function Shell({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure(true);
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await authClient.signOut();
    router.refresh();
  };

  const handleStopImpersonating = async () => {
    await authClient.admin.stopImpersonating();
    window.location.href = "/admin";
  };

  const navLinks = [
    { label: 'Kalenteri', icon: IconCalendar, href: '/calendar' },
    { label: 'Huoltokirja', icon: IconSettings, href: '/huolto' },
    { label: 'Projektit', icon: IconLayoutKanban, href: '/projects' },
    { label: 'Oppaat', icon: IconBook2, href: '/oppaat' },
    { label: 'Saapuminen', icon: IconMap, href: '/arrival' },
    { label: 'Mökin ohjeet', icon: IconBook2, href: '/manual' },
    { label: 'Sauna & Ulkoilu', icon: IconRipple, href: '/outdoors' },
    { label: 'Hätätilanteet', icon: IconShieldHeart, href: '/emergency' },
    { label: 'Tilastot', icon: IconChartBar, href: '/stats' },
  ];

  return (
    <AppShell
      navbar={{
        width: opened ? 280 : 80,
        breakpoint: 'sm',
      }}
      padding="xl"
    >
      <AppShell.Navbar p="md" style={{ borderRight: '1px solid var(--mantine-color-default-border)' }}>
        <Stack gap="xl" style={{ height: '100%' }}>
          <Box px={opened ? 'sm' : 0} style={{ display: 'flex', justifyContent: opened ? 'space-between' : 'center', alignItems: 'center' }}>
            {opened && (
              <Box fw={800} fz="xl" style={{ letterSpacing: '-0.02em', cursor: 'pointer', color: 'var(--mantine-color-text)' }} onClick={() => router.push('/')}>
                Villa Hvitfelt
              </Box>
            )}
            <ActionIcon 
              variant="filled" 
              color="forestGreen" 
              onClick={toggle} 
              size="lg"
            >
              {opened ? <IconChevronLeft size={20} /> : <IconChevronRight size={20} />}
            </ActionIcon>
          </Box>

          <Stack gap="xs" style={{ flex: 1 }}>
            {navLinks.map((link) => {
              const Icon = link.icon;
              return opened ? (
                <NavLink
                  key={link.label}
                  component={Link}
                  href={link.href}
                  label={link.label}
                  leftSection={<Icon size={22} strokeWidth={2.5} />}
                  variant="filled"
                  color="forestGreen"
                  py="md"
                  styles={{
                    label: { fontWeight: 800, fontSize: '16px' }
                  }}
                />
              ) : (
                <Tooltip key={link.label} label={link.label} position="right" withArrow transitionProps={{ duration: 0 }}>
                  <ActionIcon
                    component={Link}
                    href={link.href}
                    variant="subtle"
                    color="forestGreen"
                    size="54px"
                    mx="auto"
                  >
                    <Icon size={26} strokeWidth={2.5} />
                  </ActionIcon>
                </Tooltip>
              );
            })}
          </Stack>

          <Box pt="md" style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
            {opened && mounted && (
              <Box mb="md">
                <SegmentedControl
                  value={colorScheme}
                  onChange={(value) => setColorScheme(value as any)}
                  data={[
                    { value: 'light', label: <Center><IconSun size={16} /></Center> },
                    { value: 'dark', label: <Center><IconMoon size={16} /></Center> },
                    { value: 'auto', label: <Center><IconDeviceDesktop size={16} /></Center> },
                  ]}
                  fullWidth
                  size="sm"
                  color="forestGreen"
                />
              </Box>
            )}
            {session ? (
              opened ? (
                <Menu position="right-end" withArrow shadow="md">
                  <Menu.Target>
                    <UnstyledButton p="sm" style={{ width: '100%', borderRadius: '8px' }}>
                      <Group gap="sm">
                        <Avatar src={session.user.image || undefined} radius="xl" color="forestGreen">
                          {session.user.name?.charAt(0)}
                        </Avatar>
                        <div style={{ flex: 1 }}>
                          <Text size="sm" fw={700} fz="14px">{session.user.name}</Text>
                          <Text size="xs" c="dimmed" truncate>{session.user.email}</Text>
                        </div>
                      </Group>
                    </UnstyledButton>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item component={Link} href="/profile" leftSection={<IconUser size={16} />}>Profiili</Menu.Item>
                    <Menu.Item component={Link} href="/settings" leftSection={<IconSettings size={16} />}>Asetukset</Menu.Item>
                    <Menu.Divider />
                    <Menu.Item color="red" leftSection={<IconLogout size={16} />} onClick={handleLogout}>Kirjaudu ulos</Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              ) : (
                <Tooltip label={session.user.name} position="right" withArrow>
                  <Avatar 
                    src={session.user.image || undefined} 
                    radius="xl" 
                    color="forestGreen" 
                    mx="auto" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => router.push('/profile')}
                  >
                    {session.user.name?.charAt(0)}
                  </Avatar>
                </Tooltip>
              )
            ) : (
              opened ? (
                <Button 
                  component={Link} 
                  href="/login" 
                  variant="filled" 
                  color="forestGreen" 
                  fullWidth 
                  leftSection={<IconLogin size={18} />}
                  fw={700}
                >
                  Kirjaudu sisään
                </Button>
              ) : (
                <Tooltip label="Kirjaudu sisään" position="right" withArrow>
                  <ActionIcon 
                    component={Link} 
                    href="/login" 
                    variant="filled" 
                    color="forestGreen" 
                    size="54px" 
                    mx="auto"
                  >
                    <IconLogin size={26} />
                  </ActionIcon>
                </Tooltip>
              )
            )}
          </Box>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        {session?.session.impersonatedBy && (
          <Alert 
            variant="filled" 
            color="blue" 
            title="Impersonointi käynnissä" 
            icon={<IconInfoCircle size={18} />}
            mb="md"
            radius="md"
          >
            <Group justify="space-between">
              <Text fw={600} size="sm">Olet kirjautuneena käyttäjänä: {session.user.name} ({session.user.email})</Text>
              <Button size="xs" variant="white" color="blue" onClick={handleStopImpersonating} fw={800}>
                Lopeta impersonointi
              </Button>
            </Group>
          </Alert>
        )}
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
