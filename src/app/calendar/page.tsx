"use client";

import { useState, useEffect } from "react";
import {
  Title,
  Text,
  Stack,
  Group,
  Button,
  Modal,
  TextInput,
  NumberInput,
  Checkbox,
  Paper,
  Divider,
  ActionIcon,
  Badge,
  Box,
  Indicator,
  SimpleGrid,
} from "@mantine/core";
import { Calendar, DatePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { IconPlus, IconTrash, IconLock, IconUsers, IconCalendarEvent } from "@tabler/icons-react";
import { authClient } from "@/lib/auth-client";
import { getReservations, createReservation, deleteReservation } from "@/lib/actions/reservations";
import dayjs from "dayjs";
import "dayjs/locale/fi";

// Set locale to Finnish
dayjs.locale("fi");

type Reservation = {
  id: string;
  reserveeName: string;
  startDate: string | Date;
  endDate: string | Date;
  attendees: number;
  isRestricted: boolean;
};

export default function CalendarPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: session } = authClient.useSession();

  // Form states
  const [name, setName] = useState("");
  const [attendees, setAttendees] = useState<number | string>(1);
  const [isRestricted, setIsRestricted] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);

  const fetchReservations = async () => {
    const data = await getReservations();
    setReservations(data);
  };

  useEffect(() => {
    setMounted(true);
    const today = new Date();
    setSelectedDate(today);
    setDateRange([today, today]);
    fetchReservations();
  }, []);

  useEffect(() => {
    if (session?.user && !name) {
      setName(session.user.name);
    }
  }, [session, name]);

  const handleCreate = async () => {
    if (!name || !dateRange[0] || !dateRange[1]) {
      notifications.show({ title: "Virhe", message: "Täytä kaikki tiedot.", color: "red" });
      return;
    }

    setLoading(true);
    const result = await createReservation({
      reserveeName: name,
      startDate: dateRange[0],
      endDate: dateRange[1],
      attendees: Number(attendees),
      isRestricted,
    });

    if (result.success) {
      notifications.show({ title: "Onnistui", message: "Varaus lisätty.", color: "green" });
      setModalOpened(false);
      fetchReservations();
      // Reset form partially
      if (!session) setName("");
    } else {
      notifications.show({ title: "Virhe", message: result.error || "Varauksen tekeminen epäonnistui.", color: "red" });
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const result = await deleteReservation(id);
    if (result.success) {
      notifications.show({ title: "Poistettu", message: "Varaus poistettu.", color: "green" });
      fetchReservations();
    } else {
      notifications.show({ title: "Virhe", message: result.error || "Poistaminen epäonnistui.", color: "red" });
    }
  };

  if (!mounted) return null;

  // Get reservations for the specifically clicked day
  const dayReservations = reservations.filter(r => {
    const start = dayjs(r.startDate).startOf('day');
    const end = dayjs(r.endDate).endOf('day');
    const target = dayjs(selectedDate).startOf('day');
    return (target.isSame(start) || target.isAfter(start)) && (target.isSame(end) || target.isBefore(end));
  });

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="flex-end">
        <Stack gap="xs">
          <Title order={1}>Varauskalenteri</Title>
          <Text size="xl" fw={500} style={{ opacity: 0.85 }}>
            Valitse päivä nähdäksesi tiedot tai tee uusi varaus.
          </Text>
        </Stack>
        <Button 
          leftSection={<IconPlus size={18} />} 
          color="forestGreen" 
          onClick={() => {
            setDateRange([selectedDate || new Date(), selectedDate || new Date()]);
            setModalOpened(true);
          }}
        >
          Tee uusi varaus
        </Button>
      </Group>

      {/* Main Calendar Card */}
      <Paper p="xl" radius="md" shadow="sm">
        <Center>
          <Calendar
            size="xl"
            locale="fi"
            getDayProps={(date) => ({
              selected: dayjs(date).isSame(selectedDate, 'day'),
              onClick: () => {
                setSelectedDate(date);
                setDateRange([date, date]);
              },
            })}
            renderDay={(date) => {
              const hasRes = reservations.some(r => {
                const start = dayjs(r.startDate).startOf('day');
                const end = dayjs(r.endDate).endOf('day');
                const d = dayjs(date).startOf('day');
                return (d.isSame(start) || d.isAfter(start)) && (d.isSame(end) || d.isBefore(end));
              });

              return (
                <Indicator 
                  size={6} 
                  color="forestGreen" 
                  offset={-2} 
                  disabled={!hasRes}
                >
                  <div>{date.getDate()}</div>
                </Indicator>
              );
            }}
            styles={{
              day: { 
                fontWeight: 700, 
                fontSize: '16px',
              },
              weekday: { fontWeight: 800, textTransform: 'uppercase', fontSize: '12px' }
            }}
          />
        </Center>
      </Paper>

      {/* Selected Day Details - Below the Calendar */}
      <Stack gap="md">
        <Paper p="md" radius="md" withBorder shadow="sm">
          <Group justify="space-between" mb="xs">
            <Title order={3} fw={800}>
              {dayjs(selectedDate).format("D. MMMM YYYY")}
            </Title>
            <Badge color="forestGreen" variant="filled">
              {dayReservations.length} varausta
            </Badge>
          </Group>
          <Divider mb="md" />
          
          <Stack gap="sm">
            {dayReservations.length > 0 ? (
              <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                {dayReservations.map((r) => (
                  <Paper key={r.id} withBorder p="sm" shadow="xs" bg="var(--mantine-color-default-hover)">
                    <Group justify="space-between" wrap="nowrap">
                      <Group gap="sm" wrap="nowrap">
                        <IconUsers size={20} color="var(--mantine-color-forestGreen-filled)" />
                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Text fw={800} size="sm" truncate>{r.reserveeName}</Text>
                          <Text size="xs" c="dimmed" fw={600}>
                            {r.attendees} henkilöä • {dayjs(r.startDate).format("D.M.")} - {dayjs(r.endDate).format("D.M.")}
                          </Text>
                        </Box>
                        {r.isRestricted && <IconLock size={14} color="var(--mantine-color-red-6)" title="Suojattu varaus" />}
                      </Group>
                      <ActionIcon 
                        variant="subtle" 
                        color="red" 
                        onClick={() => handleDelete(r.id)}
                      >
                        <IconTrash size={18} />
                      </ActionIcon>
                    </Group>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Stack align="center" py="xl" gap="xs">
                <IconCalendarEvent size={40} color="var(--mantine-color-gray-4)" />
                <Text c="dimmed" ta="center" fw={600}>Ei varauksia tälle päivälle.</Text>
                <Button variant="subtle" color="forestGreen" size="xs" onClick={() => setModalOpened(true)}>
                  Varaa tämä päivä
                </Button>
              </Stack>
            )}
          </Stack>
        </Paper>
      </Stack>

      {/* Overview Grid - Full list of upcoming */}
      <Stack gap="sm" mt="xl">
        <Title order={2} fw={800}>Kaikki tulevat varaukset</Title>
        <Divider mb="md" />
        {reservations.filter(r => dayjs(r.endDate).endOf('day').isAfter(dayjs().subtract(1, 'day'))).length > 0 ? (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {reservations
              .filter(r => dayjs(r.endDate).endOf('day').isAfter(dayjs().subtract(1, 'day')))
              .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
              .map((r) => (
              <Paper key={r.id} withBorder p="md" shadow="sm">
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text fw={800} size="lg">{r.reserveeName}</Text>
                    {r.isRestricted && <IconLock size={16} color="var(--mantine-color-red-6)" title="Suojattu varaus" />}
                  </Group>
                  <Group gap="xs">
                    <IconCalendarEvent size={16} color="var(--mantine-color-forestGreen-filled)" />
                    <Text fw={700} size="sm">{dayjs(r.startDate).format("D.M.YYYY")} - {dayjs(r.endDate).format("D.M.YYYY")}</Text>
                  </Group>
                  <Group gap="xs">
                    <IconUsers size={16} color="var(--mantine-color-forestGreen-filled)" />
                    <Text size="sm" fw={700}>{r.attendees} henkilöä</Text>
                  </Group>
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>
        ) : (
          <Text c="dimmed" fs="italic" fw={600}>Ei tulevia varauksia.</Text>
        )}
      </Stack>

      <Modal 
        opened={modalOpened} 
        onClose={() => setModalOpened(false)} 
        title={<Text fw={800} fz="lg">Varaukset: {dayjs(selectedDate).format("D. MMMM YYYY")}</Text>}
        size="lg"
        radius="md"
      >
        <Stack gap="lg">
          {/* List of existing reservations for the day */}
          <Stack gap="sm">
            {dayReservations.length > 0 ? (
              dayReservations.map((r) => (
                <Paper key={r.id} withBorder p="sm" bg="var(--mantine-color-gray-0)">
                  <Group justify="space-between">
                    <Group gap="sm">
                      <IconUsers size={20} color="var(--mantine-color-forestGreen-7)" />
                      <div>
                        <Text fw={800} size="sm">{r.reserveeName}</Text>
                        <Text size="xs" c="dimmed">{r.attendees} henkilöä • {dayjs(r.startDate).format("D.M.")} - {dayjs(r.endDate).format("D.M.")}</Text>
                      </div>
                      {r.isRestricted && <IconLock size={14} color="var(--mantine-color-red-6)" />}
                    </Group>
                    <ActionIcon 
                      variant="subtle" 
                      color="red" 
                      onClick={() => handleDelete(r.id)}
                      title={r.isRestricted ? "Suojattu varaus" : "Poista varaus"}
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Group>
                </Paper>
              ))
            ) : (
              <Text c="dimmed" ta="center" py="md">Ei varauksia tälle päivälle.</Text>
            )}
          </Stack>

          <Divider label="Lisää uusi varaus" labelPosition="center" />

          {/* New Reservation Form */}
          <Stack gap="md">
            <TextInput
              label="Varaajan nimi"
              placeholder="Esim. Meikäläiset"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              required
              fw={700}
            />
            
            <Group grow>
              <DatePicker
                type="range"
                label="Ajankohta"
                value={dateRange}
                onChange={setDateRange}
                minDate={new Date()}
                fw={700}
              />
              <NumberInput
                label="Henkilömäärä"
                value={attendees}
                onChange={setAttendees}
                min={1}
                max={20}
                required
                fw={700}
              />
            </Group>

            {session && (
              <Checkbox
                label="Rajoitettu (vain minä tai ylläpitäjä voi poistaa)"
                checked={isRestricted}
                onChange={(e) => setIsRestricted(e.currentTarget.checked)}
                color="forestGreen"
                fw={600}
              />
            )}

            <Button 
              fullWidth 
              color="forestGreen" 
              onClick={handleCreate} 
              loading={loading}
              size="md"
            >
              Tallenna varaus
            </Button>
          </Stack>
        </Stack>
      </Modal>
    </Stack>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', justifyContent: 'center' }}>{children}</div>;
}
