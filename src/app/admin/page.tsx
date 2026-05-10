"use client";

import { useState, useEffect } from "react";
import {
  Title,
  Text,
  Stack,
  TextInput,
  Button,
  Table,
  Badge,
  Group,
  Paper,
  ActionIcon,
  Tabs,
  Avatar,
  ScrollArea,
  Divider,
  Menu,
  Modal,
  NumberInput,
  Checkbox,
  Tooltip,
  Box,
  LoadingOverlay,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import {
  IconPlus,
  IconRefresh,
  IconCheck,
  IconX,
  IconUsers,
  IconTicket,
  IconServer,
  IconMail,
  IconShield,
  IconDotsVertical,
  IconTrash,
  IconEdit,
  IconCalendar,
  IconUserCircle,
  IconChevronRight,
  IconBan,
  IconUserSearch,
  IconGhost,
  IconWand,
  IconLock,
} from "@tabler/icons-react";
import { createInvite, getInvites, checkDbConnection } from "@/lib/actions/invites";
import { getReservations, updateReservation, deleteReservation } from "@/lib/actions/reservations";
import { notifications } from "@mantine/notifications";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface InviteData {
  id: string;
  email: string;
  code: string;
  role: "admin" | "user";
  expiresAt: Date;
  createdAt: Date;
  claimedAt: Date | null;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  image?: string | null;
  banned?: boolean | null;
}

interface ReservationData {
  id: string;
  reserveeName: string;
  startDate: Date;
  endDate: Date;
  attendees: number;
  isRestricted: boolean;
  userId: string | null;
  createdAt: Date;
}

export default function AdminPage() {
  const [invites, setInvites] = useState<InviteData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [reservations, setReservations] = useState<ReservationData[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>("users");
  const router = useRouter();

  // Password Change Modal State
  const [passwordModalOpened, setPasswordModalOpened] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [newPassword, setNewPassword] = useState("");

  // Reservation Edit Modal State
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [editingReservation, setEditingReservation] = useState<ReservationData | null>(null);
  const [editData, setEditData] = useState({
    reserveeName: "",
    dates: [null, null] as [Date | null, Date | null],
    attendees: 1,
    isRestricted: false,
  });

  const fetchData = async () => {
    setLoading(true);
    const [invitesData, usersResponse, connected, reservationsData] = await Promise.all([
      getInvites(),
      authClient.admin.listUsers({ query: { limit: 100 } }),
      checkDbConnection(),
      getReservations(),
    ]);

    setInvites(invitesData as any);
    setUsers((usersResponse?.data?.users || []) as any);
    setDbConnected(connected);
    setReservations(reservationsData as any);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateInvite = async () => {
    if (!email) return;
    setLoading(true);
    const res = await createInvite(email);
    if (res.success) {
      notifications.show({ title: "Kutsu luotu", message: `Kutsuavain ${res.code} lähetetty kohteeseen ${email}`, color: "green" });
      setEmail("");
      await fetchData();
    } else {
      notifications.show({ title: "Virhe", message: res.error, color: "red" });
    }
    setLoading(false);
  };

  const handleUpdateRole = async (userId: string, role: string) => {
    setLoading(true);
    const { error } = await authClient.admin.setRole({ userId, role: role as any });
    if (!error) {
      notifications.show({ message: "Käyttäjän rooli päivitetty", color: "green" });
      await fetchData();
    } else {
      notifications.show({ title: "Virhe", message: error.message || "Roolin päivitys epäonnistui", color: "red" });
    }
    setLoading(false);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Haluatko varmasti poistaa tämän käyttäjän? Tämä toiminto on lopullinen.")) return;
    setLoading(true);
    const { error } = await authClient.admin.removeUser({ userId });
    if (!error) {
      notifications.show({ message: "Käyttäjä poistettu", color: "green" });
      await fetchData();
    } else {
      notifications.show({ title: "Virhe", message: error.message || "Käyttäjän poisto epäonnistui", color: "red" });
    }
    setLoading(false);
  };

  const handleBanUser = async (userId: string) => {
    setLoading(true);
    const { error } = await authClient.admin.banUser({ userId });
    if (!error) {
      notifications.show({ message: "Käyttäjä estetty", color: "orange" });
      await fetchData();
    } else {
      notifications.show({ title: "Virhe", message: error.message || "Esto epäonnistui", color: "red" });
    }
    setLoading(false);
  };

  const handleUnbanUser = async (userId: string) => {
    setLoading(true);
    const { error } = await authClient.admin.unbanUser({ userId });
    if (!error) {
      notifications.show({ message: "Käyttäjän esto poistettu", color: "green" });
      await fetchData();
    } else {
      notifications.show({ title: "Virhe", message: error.message || "Eston poisto epäonnistui", color: "red" });
    }
    setLoading(false);
  };

  const handleImpersonate = async (userId: string) => {
    setLoading(true);
    const { error } = await authClient.admin.impersonateUser({ userId });
    if (!error) {
      notifications.show({ title: "Impersonointi aloitettu", message: "Olet nyt kirjautuneena toisena käyttäjänä.", color: "blue" });
      window.location.href = "/";
    } else {
      notifications.show({ title: "Virhe", message: error.message || "Impersonointi epäonnistui", color: "red" });
    }
    setLoading(false);
  };

  const handleChangePassword = async () => {
    if (!selectedUser || !newPassword) return;
    setLoading(true);
    const { error } = await authClient.admin.setUserPassword({
      userId: selectedUser.id,
      newPassword: newPassword,
    });
    if (!error) {
      notifications.show({ message: `Käyttäjän ${selectedUser.name} salasana vaihdettu`, color: "green" });
      setPasswordModalOpened(false);
      setNewPassword("");
    } else {
      notifications.show({ title: "Virhe", message: error.message || "Salasanan vaihto epäonnistui", color: "red" });
    }
    setLoading(false);
  };

  const handleSendMagicLink = async (email: string) => {
    setLoading(true);
    const { error } = await authClient.signIn.magicLink({ email, callbackURL: "/" });
    if (!error) {
      notifications.show({ title: "Kirjautumislinkki lähetetty", message: `Linkki on lähetetty osoitteeseen ${email}. Tarkista palvelimen loki!`, color: "blue" });
    } else {
      notifications.show({ title: "Virhe", message: error.message || "Linkin lähetys epäonnistui", color: "red" });
    }
    setLoading(false);
  };

  const handleDeleteReservation = async (id: string) => {
    if (!confirm("Haluatko varmasti poistaa tämän varauksen?")) return;
    setLoading(true);
    const res = await deleteReservation(id);
    if (res.success) {
      notifications.show({ message: "Varaus poistettu", color: "green" });
      await fetchData();
    } else {
      notifications.show({ title: "Virhe", message: res.error, color: "red" });
    }
    setLoading(false);
  };

  const openEditModal = (res: ReservationData) => {
    setEditingReservation(res);
    setEditData({
      reserveeName: res.reserveeName,
      dates: [new Date(res.startDate), new Date(res.endDate)],
      attendees: res.attendees,
      isRestricted: res.isRestricted,
    });
    setEditModalOpened(true);
  };

  const handleUpdateReservation = async () => {
    if (!editingReservation || !editData.dates[0] || !editData.dates[1]) return;
    setLoading(true);
    const res = await updateReservation(editingReservation.id, {
      reserveeName: editData.reserveeName,
      startDate: editData.dates[0],
      endDate: editData.dates[1],
      attendees: editData.attendees,
      isRestricted: editData.isRestricted,
    });
    if (res.success) {
      notifications.show({ message: "Varaus päivitetty", color: "green" });
      setEditModalOpened(false);
      await fetchData();
    } else {
      notifications.show({ title: "Virhe", message: res.error, color: "red" });
    }
    setLoading(false);
  };

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="flex-start">
        <Stack gap="xs">
          <Title order={1} size="h1" style={{ letterSpacing: "-0.02em" }}>
            Hallintapaneeli
          </Title>
          <Text size="xl" fw={600} style={{ opacity: 0.85 }}>
            Järjestelmän hallinta ja käyttäjäoikeudet.
          </Text>
        </Stack>

        <Group>
          <Badge
            size="lg"
            variant="filled"
            color={dbConnected === true ? "green" : dbConnected === false ? "red" : "gray"}
            leftSection={dbConnected === true ? <IconCheck size={14} /> : dbConnected === false ? <IconX size={14} /> : <IconRefresh size={14} />}
          >
            {dbConnected === true ? "Tietokanta: OK" : dbConnected === false ? "Tietokanta: Virhe" : "Tietokanta: ?"}
          </Badge>
          <ActionIcon variant="filled" color="forestGreen" onClick={fetchData} loading={loading} size="lg">
            <IconRefresh size={20} />
          </ActionIcon>
        </Group>
      </Group>

      <Tabs 
        value={activeTab} 
        onChange={setActiveTab} 
        color="forestGreen" 
        variant="outline" 
        radius="md"
        styles={{
          tab: {
            fontWeight: 700,
            fontSize: '15px',
            borderBottom: '3px solid transparent',
            transition: 'all 0.2s ease',
            padding: '12px 20px',
            '&[data-active]': {
              fontWeight: 800,
              backgroundColor: 'transparent',
            },
          }
        }}
      >
        <Tabs.List mb="xl">
          <Tabs.Tab value="users" leftSection={<IconUsers size={18} strokeWidth={2.5} />}>
            Käyttäjät
          </Tabs.Tab>
          <Tabs.Tab value="reservations" leftSection={<IconCalendar size={18} strokeWidth={2.5} />}>
            Varaukset
          </Tabs.Tab>
          <Tabs.Tab value="invites" leftSection={<IconTicket size={18} strokeWidth={2.5} />}>
            Kutsuavaimet
          </Tabs.Tab>
          <Tabs.Tab value="system" leftSection={<IconServer size={18} strokeWidth={2.5} />}>
            Järjestelmä
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="users" pos="relative">
          <LoadingOverlay visible={loading} overlayProps={{ blur: 1 }} />
          <Paper withBorder radius="md" style={{ overflow: "hidden" }} shadow="sm">
            <ScrollArea>
              <Table verticalSpacing="md" highlightOnHover striped>
                <Table.Thead bg="var(--mantine-color-gray-2)">
                  <Table.Tr>
                    <Table.Th fw={800}>Käyttäjä</Table.Th>
                    <Table.Th fw={800}>Sähköposti</Table.Th>
                    <Table.Th fw={800}>Rooli</Table.Th>
                    <Table.Th fw={800}>Tila</Table.Th>
                    <Table.Th fw={800}>Toiminnot</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {users.map((u) => (
                    <Table.Tr key={u.id}>
                      <Table.Td>
                        <Group gap="sm">
                          <Avatar src={u.image} radius="xl" size="sm" color="forestGreen">
                            {u.name.charAt(0)}
                          </Avatar>
                          <Text size="sm" fw={800}>{u.name}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Group gap={4}>
                          <IconMail size={14} color="gray" />
                          <Text size="sm" fw={600}>{u.email}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={u.role === "admin" ? "red" : "forestGreen"} variant="filled">
                          {u.role === "admin" ? "Ylläpitäjä" : "Käyttäjä"}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        {u.banned ? (
                          <Badge color="red" variant="outline" leftSection={<IconBan size={12} />}>Estetty</Badge>
                        ) : (
                          <Badge color="green" variant="outline" leftSection={<IconCheck size={12} />}>Aktiivinen</Badge>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Menu shadow="md" width={220}>
                          <Menu.Target>
                            <ActionIcon variant="subtle" color="gray">
                              <IconDotsVertical size={16} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Label>Käyttäjähallinta</Menu.Label>
                            
                            <Menu.Item 
                              leftSection={<IconGhost size={14} />} 
                              onClick={() => handleImpersonate(u.id)}
                            >
                              Impersonoi (Kirjaudu sisään)
                            </Menu.Item>

                            <Menu.Item 
                              leftSection={<IconLock size={14} />} 
                              onClick={() => {
                                setSelectedUser(u);
                                setPasswordModalOpened(true);
                              }}
                            >
                              Vaihda salasana
                            </Menu.Item>

                            <Menu.Item 
                              leftSection={<IconWand size={14} />} 
                              onClick={() => handleSendMagicLink(u.email)}
                            >
                              Lähetä kirjautumislinkki
                            </Menu.Item>

                            <Menu.Divider />

                            {u.role === "admin" ? (
                              <Menu.Item 
                                leftSection={<IconUserCircle size={14} />} 
                                onClick={() => handleUpdateRole(u.id, "user")}
                              >
                                Muuta käyttäjäksi
                              </Menu.Item>
                            ) : (
                              <Menu.Item 
                                leftSection={<IconShield size={14} />} 
                                onClick={() => handleUpdateRole(u.id, "admin")}
                              >
                                Muuta ylläpitäjäksi
                              </Menu.Item>
                            )}

                            {u.banned ? (
                              <Menu.Item 
                                color="green"
                                leftSection={<IconCheck size={14} />} 
                                onClick={() => handleUnbanUser(u.id)}
                              >
                                Poista esto
                              </Menu.Item>
                            ) : (
                              <Menu.Item 
                                color="orange"
                                leftSection={<IconBan size={14} />} 
                                onClick={() => handleBanUser(u.id)}
                              >
                                Estä käyttäjä
                              </Menu.Item>
                            )}

                            <Menu.Divider />
                            <Menu.Item 
                              color="red" 
                              leftSection={<IconTrash size={14} />}
                              onClick={() => handleDeleteUser(u.id)}
                            >
                              Poista käyttäjätili
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                  {users.length === 0 && (
                    <Table.Tr>
                      <Table.Td colSpan={5} style={{ textAlign: "center" }} py="xl">
                        <Text fw={600}>Ei rekisteröityjä käyttäjiä.</Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="reservations">
          <Paper withBorder radius="md" style={{ overflow: "hidden" }} shadow="sm">
            <ScrollArea>
              <Table verticalSpacing="md" highlightOnHover striped>
                <Table.Thead bg="var(--mantine-color-gray-2)">
                  <Table.Tr>
                    <Table.Th fw={800}>Varaaja</Table.Th>
                    <Table.Th fw={800}>Alkaa</Table.Th>
                    <Table.Th fw={800}>Päättyy</Table.Th>
                    <Table.Th fw={800}>Henkilöitä</Table.Th>
                    <Table.Th fw={800}>Tila</Table.Th>
                    <Table.Th fw={800}>Toiminnot</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {reservations.map((res) => (
                    <Table.Tr key={res.id}>
                      <Table.Td fw={700}>{res.reserveeName}</Table.Td>
                      <Table.Td fw={600}>{new Date(res.startDate).toLocaleDateString("fi-FI")}</Table.Td>
                      <Table.Td fw={600}>{new Date(res.endDate).toLocaleDateString("fi-FI")}</Table.Td>
                      <Table.Td fw={800} style={{ textAlign: "center" }}>{res.attendees}</Table.Td>
                      <Table.Td>
                        {res.isRestricted ? (
                          <Badge color="orange" variant="light">Suojattu</Badge>
                        ) : (
                          <Badge color="gray" variant="light">Avoin</Badge>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <Tooltip label="Muokkaa varausta">
                            <ActionIcon variant="light" color="blue" onClick={() => openEditModal(res)}>
                              <IconEdit size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Poista varaus">
                            <ActionIcon variant="light" color="red" onClick={() => handleDeleteReservation(res.id)}>
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                  {reservations.length === 0 && (
                    <Table.Tr>
                      <Table.Td colSpan={6} style={{ textAlign: "center" }} py="xl">
                        <Text fw={600}>Ei löytyneitä varauksia.</Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="invites">
          <Stack gap="lg">
            <Paper withBorder p="xl" radius="md" shadow="xs">
              <Stack gap="md">
                <Title order={3} fw={800}>Luo uusi kutsu</Title>
                <Group align="flex-end">
                  <TextInput
                    label={<Text fw={700} size="sm">Sähköposti</Text>}
                    placeholder="vastaanottaja@email.fi"
                    style={{ flex: 1 }}
                    value={email}
                    onChange={(e) => setEmail(e.currentTarget.value)}
                    styles={{ input: { fontWeight: 600 } }}
                  />
                  <Button
                    color="forestGreen"
                    leftSection={<IconPlus size={18} />}
                    onClick={handleCreateInvite}
                    loading={loading}
                    fw={800}
                  >
                    Luo kutsuavain
                  </Button>
                </Group>
              </Stack>
            </Paper>

            <Paper withBorder radius="md" style={{ overflow: "hidden" }} shadow="xs">
              <Table verticalSpacing="md" highlightOnHover striped>
                <Table.Thead bg="var(--mantine-color-gray-2)">
                  <Table.Tr>
                    <Table.Th fw={800}>Sähköposti</Table.Th>
                    <Table.Th fw={800}>Kutsuavain</Table.Th>
                    <Table.Th fw={800}>Tila</Table.Th>
                    <Table.Th fw={800}>Luotu</Table.Th>
                    <Table.Th fw={800}>Käytetty</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {invites.map((inv) => (
                    <Table.Tr key={inv.id}>
                      <Table.Td fw={700}>{inv.email}</Table.Td>
                      <Table.Td>
                        <Badge variant="outline" color="forestGreen" size="lg" style={{ fontFamily: "monospace", fontWeight: 800 }}>
                          {inv.code}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        {inv.claimedAt ? (
                          <Badge color="gray" variant="filled">Käytetty</Badge>
                        ) : new Date(inv.expiresAt) < new Date() ? (
                          <Badge color="red" variant="filled">Vanhentunut</Badge>
                        ) : (
                          <Badge color="green" variant="filled">Aktiivinen</Badge>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" fw={600}>
                          {new Date(inv.createdAt).toLocaleDateString("fi-FI")}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" fw={600}>
                          {inv.claimedAt ? new Date(inv.claimedAt).toLocaleDateString("fi-FI") : "-"}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                  {invites.length === 0 && (
                    <Table.Tr>
                      <Table.Td colSpan={5} style={{ textAlign: "center" }} py="xl">
                        <Text fw={600}>Ei löytyneitä kutsuja.</Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </Paper>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="system">
          <Paper withBorder p="xl" radius="md">
            <Stack gap="md">
              <Group>
                <IconShield size={24} color="var(--mantine-color-forestGreen-filled)" />
                <Title order={3} fw={800}>Järjestelmän tila</Title>
              </Group>
              <Divider />
              <Group justify="space-between">
                <Text fw={700}>Tietokantayhteys</Text>
                <Badge size="lg" color={dbConnected ? "green" : "red"} variant="filled">{dbConnected ? "Aktiivinen" : "Virhe"}</Badge>
              </Group>
              <Group justify="space-between">
                <Text fw={700}>Käyttäjiä yhteensä</Text>
                <Text fw={900} fz="xl">{users.length}</Text>
              </Group>
              <Group justify="space-between">
                <Text fw={700}>Kutsuja yhteensä</Text>
                <Text fw={900} fz="xl">{invites.length}</Text>
              </Group>
              <Group justify="space-between">
                <Text fw={700}>Varauksia yhteensä</Text>
                <Text fw={900} fz="xl">{reservations.length}</Text>
              </Group>
            </Stack>
          </Paper>
        </Tabs.Panel>
      </Tabs>

      <Modal 
        opened={passwordModalOpened} 
        onClose={() => setPasswordModalOpened(false)} 
        title={<Text fw={800} size="lg">Vaihda käyttäjän salasana</Text>}
        radius="md"
      >
        <Stack gap="md">
          <Text size="sm" fw={600}>Käyttäjä: <Text component="span" c="forestGreen" fw={800}>{selectedUser?.name}</Text></Text>
          <TextInput
            type="password"
            label="Uusi salasana"
            placeholder="Vähintään 6 merkkiä"
            value={newPassword}
            onChange={(e) => setNewPassword(e.currentTarget.value)}
            fw={700}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="outline" color="gray" onClick={() => setPasswordModalOpened(false)} fw={800}>Peruuta</Button>
            <Button color="forestGreen" onClick={handleChangePassword} loading={loading} fw={800}>Vaihda salasana</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal 
        opened={editModalOpened} 
        onClose={() => setEditModalOpened(false)} 
        title={<Text fw={800} size="lg">Muokkaa varausta</Text>}
        radius="md"
        size="lg"
      >
        <Stack gap="md">
          <TextInput
            label="Varaajan nimi"
            placeholder="Nimi"
            value={editData.reserveeName}
            onChange={(e) => setEditData({ ...editData, reserveeName: e.currentTarget.value })}
            fw={700}
          />
          <DatePickerInput
            type="range"
            label="Varauksen ajankohta"
            placeholder="Valitse päivät"
            value={editData.dates}
            onChange={(dates) => setEditData({ ...editData, dates })}
            fw={700}
            clearable
          />
          <NumberInput
            label="Henkilömäärä"
            min={1}
            max={20}
            value={editData.attendees}
            onChange={(val) => setEditData({ ...editData, attendees: Number(val) })}
            fw={700}
          />
          <Checkbox
            label="Suojattu varaus (vain ylläpitäjä tai tekijä voi poistaa)"
            checked={editData.isRestricted}
            onChange={(e) => setEditData({ ...editData, isRestricted: e.currentTarget.checked })}
            fw={700}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="outline" color="gray" onClick={() => setEditModalOpened(false)} fw={800}>Peruuta</Button>
            <Button color="forestGreen" onClick={handleUpdateReservation} loading={loading} fw={800}>Tallenna muutokset</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
