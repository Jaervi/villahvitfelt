'use client';

import { useState, useEffect } from 'react';
import { AppShell, NavLink, Stack, Box, Tooltip, ActionIcon, Avatar, Text, Group, Menu, UnstyledButton, Button, SegmentedControl, useMantineColorScheme, Center, Alert, Burger, ScrollArea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconMap, IconBook2, IconRipple, IconShieldHeart, IconChevronRight, IconChevronLeft, IconLogout, IconUser, IconSettings, IconLogin, IconSun, IconShip, IconMoon, IconDeviceDesktop, IconCalendar, IconChartBar, IconLayoutKanban, IconInfoCircle } from '@tabler/icons-react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { useRouter, usePathname } from 'next/navigation';

export function Shell({ children }: { children: React.ReactNode }) {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile drawer when route changes
  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

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
    { label: 'Tilastot', icon: IconChartBar, href: '/stats' },
  ];

  return (
    <AppShell
      header={{ height: { base: 60, sm: 0 } }}
      navbar={{
        width: { base: 280, sm: desktopOpened ? 280 : 80 },
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened },
      }}
      padding="xl"
    >
      <AppShell.Header hiddenFrom="sm" style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
        <Group h="100%" px="md" justify="space-between">
          <Burger opened={mobileOpened} onClick={toggleMobile} size="sm" color="var(--mantine-color-forestGreen-filled)" />
          <Text fw={800} size="lg" style={{ letterSpacing: '-0.02em', cursor: 'pointer', color: 'var(--mantine-color-text)' }} onClick={() => router.push('/')}>
            Villa Hvitfelt
          </Text>
          <Box w={24}>
             {session && (
               <Avatar src={session.user.image || undefined} radius="xl" color="forestGreen" size="sm" onClick={() => router.push('/profile')} style={{ cursor: 'pointer' }}>
                  {session.user.name?.charAt(0)}
               </Avatar>
             )}
          </Box>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p={desktopOpened || mobileOpened ? "md" : "xs"} style={{ borderRight: '1px solid var(--mantine-color-default-border)' }}>
        <Stack gap="xl" style={{ height: '100%' }}>
          {/* Desktop Collapse Toggle */}
          <Box visibleFrom="sm" px={desktopOpened ? 'sm' : 0} style={{ display: 'flex', justifyContent: desktopOpened ? 'space-between' : 'center', alignItems: 'center' }}>
            {desktopOpened && (
              <Box fw={800} fz="xl" style={{ letterSpacing: '-0.02em', cursor: 'pointer', color: 'var(--mantine-color-text)' }} onClick={() => router.push('/')}>
                Villa Hvitfelt
              </Box>
            )}
            <ActionIcon 
              variant="filled" 
              color="forestGreen" 
              onClick={toggleDesktop} 
              size="lg"
            >
              {desktopOpened ? <IconChevronLeft size={20} /> : <IconChevronRight size={20} />}
            </ActionIcon>
          </Box>

          {/* Mobile specific top logo inside drawer */}
          <Box hiddenFrom="sm" px="sm" style={{ display: 'flex', alignItems: 'center' }}>
            <Text fw={800} fz="xl" style={{ letterSpacing: '-0.02em', color: 'var(--mantine-color-text)' }}>
              Valikko
            </Text>
          </Box>

          <ScrollArea style={{ flex: 1 }} scrollbarSize={4} offsetScrollbars>
            <Stack gap="xs">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isExpanded = mobileOpened || desktopOpened;

                return isExpanded ? (
                  <NavLink
                    key={link.label}
                    component={Link}
                    href={link.href}
                    label={link.label}
                    leftSection={<Icon size={22} strokeWidth={2.5} />}
                    variant="filled"
                    active={pathname.startsWith(link.href)}
                    color="forestGreen"
                    py="md"
                    styles={{
                      label: { fontWeight: 800, fontSize: '16px' }
                    }}
                  />
                ) : (
                  <Tooltip key={link.label} label={link.label} position="right" withArrow transitionProps={{ duration: 0 }} disabled={mobileOpened}>
                    <ActionIcon
                      component={Link}
                      href={link.href}
                      variant={pathname.startsWith(link.href) ? "filled" : "subtle"}
                      color="forestGreen"
                      size="44px"
                      mx="auto"
                    >
                      <Icon size={24} strokeWidth={2.5} />
                    </ActionIcon>
                  </Tooltip>
                );
              })}
            </Stack>
          </ScrollArea>

          <Box pt="md" style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
            {(mobileOpened || desktopOpened) && mounted && (
              <Box mb="md" px={mobileOpened ? "sm" : 0}>
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
              (mobileOpened || desktopOpened) ? (
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
              (mobileOpened || desktopOpened) ? (
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
