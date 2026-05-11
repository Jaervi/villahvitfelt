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
  NumberInput,
  Paper,
  Progress,
  Box,
  Divider,
  ThemeIcon,
  LoadingOverlay,
  Select,
  Textarea,
  Timeline,
  ScrollArea,
  Tooltip,
} from "@mantine/core";
import {
  IconPlus,
  IconCheck,
  IconHistory,
  IconAlertTriangle,
  IconTrash,
  IconEdit,
  IconUser,
  IconRefresh,
} from "@tabler/icons-react";
import {
  getMaintenanceTasksWithProgress,
  createMaintenanceTask,
  updateMaintenanceTask,
  deleteMaintenanceTask,
  logTaskCompletion,
  getMaintenanceHistory,
} from "@/lib/actions/maintenance";
import { notifications } from "@mantine/notifications";
import { authClient } from "@/lib/auth-client";
import { Checkbox } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import "@mantine/dates/styles.css";

export default function MaintenancePage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [logModalOpened, setLogModalOpened] = useState(false);
  const [historyModalOpened, setHistoryModalOpened] = useState(false);
  
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [logNotes, setLogNotes] = useState("");
  const [guestName, setGuestName] = useState("");
  const [customDateEnabled, setCustomDateEnabled] = useState(false);
  const [customDate, setCustomDate] = useState<Date | null>(new Date());

  const { data: session } = authClient.useSession();
  const isAdmin = session?.user.role === "admin";

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    intervalType: "days",
    intervalValue: 30,
    isAutomatic: false,
  });

  const fetchData = async () => {
    setLoading(true);
    const data = await getMaintenanceTasksWithProgress();
    setTasks(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTask = async () => {
    if (!taskForm.title) return;
    setActionLoading(true);
    const res = await createMaintenanceTask(taskForm);
    if (res.success) {
      notifications.show({ title: "Luotu", message: "Huoltotehtävä lisätty", color: "green" });
      setCreateModalOpened(false);
      setTaskForm({ title: "", description: "", intervalType: "days", intervalValue: 30, isAutomatic: false });
      await fetchData();
    } else {
      notifications.show({ title: "Virhe", message: res.error || "Luominen epäonnistui", color: "red" });
    }
    setActionLoading(false);
  };

  const handleUpdateTask = async () => {
    if (!selectedTask || !taskForm.title) return;
    setActionLoading(true);
    const res = await updateMaintenanceTask(selectedTask.id, taskForm);
    if (res.success) {
      notifications.show({ title: "Päivitetty", message: "Huoltotehtävä päivitetty", color: "green" });
      setEditModalOpened(false);
      await fetchData();
    } else {
      notifications.show({ title: "Virhe", message: res.error || "Päivitys epäonnistui", color: "red" });
    }
    setActionLoading(false);
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Poistetaanko tehtävä ja sen historia?")) return;
    setActionLoading(true);
    const res = await deleteMaintenanceTask(id);
    if (res.success) {
      notifications.show({ message: "Poistettu", color: "green" });
      await fetchData();
    }
    setActionLoading(false);
  };

  const handleLogCompletion = async () => {
    if (!selectedTask) return;
    if (!session && !guestName) {
      notifications.show({ message: "Ilmoita nimesi kuitatessasi vierailijana.", color: "orange" });
      return;
    }
    setActionLoading(true);
    const res = await logTaskCompletion(
      selectedTask.id, 
      logNotes, 
      guestName, 
      customDateEnabled ? customDate : null
    );
    if (res.success) {
      notifications.show({ title: "Valmis", message: "Huolto kuitattu tehdyksi", color: "green" });
      setLogModalOpened(false);
      setLogNotes("");
      setGuestName("");
      setCustomDateEnabled(false);
      setCustomDate(new Date());
      await fetchData();
    }
    setActionLoading(false);
  };

  const openEdit = (task: any) => {
    setSelectedTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || "",
      intervalType: task.intervalType,
      intervalValue: task.intervalValue,
      isAutomatic: task.isAutomatic || false,
    });
    setEditModalOpened(true);
  };

  const openHistory = async (task: any) => {
    setSelectedTask(task);
    setHistoryModalOpened(true);
    const data = await getMaintenanceHistory(task.id);
    setHistory(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "automatic": return "blue";
      case "overdue": return "red";
      case "due-soon": return "orange";
      default: return "forestGreen";
    }
  };

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="flex-start">
        <Stack gap="xs">
          <Title order={1} size="h1" style={{ letterSpacing: "-0.02em" }}>
            Huoltokirja
          </Title>
          <Text size="xl" fw={600} style={{ opacity: 0.85 }}>
            Seuraa mökin ylläpitoa ja säännöllisiä huoltotehtäviä.
          </Text>
        </Stack>
        {isAdmin && (
          <Button 
            leftSection={<IconPlus size={18} />} 
            color="forestGreen" 
            onClick={() => {
              setTaskForm({ title: "", description: "", intervalType: "days", intervalValue: 30, isAutomatic: false });
              setCreateModalOpened(true);
            }}
            fw={800}
          >
            Uusi tehtävä
          </Button>
        )}
      </Group>

      {loading && <Box pos="relative" h={200}><LoadingOverlay visible /></Box>}

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {tasks.map((task) => (
          <Card key={task.id} shadow="sm" padding="xl" radius="md" withBorder>
            <Stack gap="md" h="100%">
              <Group justify="space-between" wrap="nowrap">
                <Group gap="xs" wrap="nowrap" style={{ flex: 1 }}>
                  <ThemeIcon variant="light" color={getStatusColor(task.status)} radius="xl">
                    {task.isAutomatic ? <IconRefresh size={18} /> : task.status === "overdue" ? <IconAlertTriangle size={18} /> : <IconCheck size={18} />}
                  </ThemeIcon>
                  <Title order={3} size="h4" fw={800} style={{ flex: 1 }}>{task.title}</Title>
                </Group>
                {isAdmin && (
                  <Group gap={4}>
                    <ActionIcon variant="subtle" color="blue" onClick={() => openEdit(task)}>
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="red" onClick={() => handleDeleteTask(task.id)}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                )}
              </Group>

              <Text size="sm" c="dimmed" fw={500} style={{ flex: 1 }}>{task.description || "Ei kuvausta."}</Text>

              {task.isAutomatic ? (
                <Paper withBorder p="md" radius="md" bg="var(--mantine-color-blue-0)">
                   <Group justify="space-between" mb={8}>
                    <Group gap="xs">
                      <IconRefresh size={14} color="var(--mantine-color-blue-7)" />
                      <Text size="xs" fw={800} tt="uppercase" c="blue.7">Toistuvuus</Text>
                    </Group>
                    <Text size="xs" fw={800} c="blue.8">{Math.round(task.progress)}%</Text>
                  </Group>
                  <Progress 
                    value={Math.min(100, task.progress)} 
                    color="blue" 
                    size="xl" 
                    radius="xl" 
                    striped
                    animated
                  />
                  <Divider my="xs" />
                  <Group justify="space-between">
                    <Text size="xs" fw={700}>Väli: {task.intervalValue} pv</Text>
                    <Text size="xs" fw={800} c="blue.9">
                      Seuraava: {task.nextDate ? new Date(task.nextDate).toLocaleDateString("fi-FI") : "-"}
                    </Text>
                  </Group>
                </Paper>
              ) : (
                <Paper withBorder p="md" radius="md" bg="var(--mantine-color-gray-0)">
                  <Group justify="space-between" mb={8}>
                    <Text size="xs" fw={800} tt="uppercase" c="dimmed">
                      {task.intervalType === "days" ? "Aika" : "Käyttö"}
                    </Text>
                    <Text size="xs" fw={800} c={getStatusColor(task.status)}>
                      {Math.round(task.progress)}%
                    </Text>
                  </Group>
                  <Progress 
                    value={Math.min(100, task.progress)} 
                    color={getStatusColor(task.status)} 
                    size="xl" 
                    radius="xl" 
                    striped={task.progress >= 100}
                    animated={task.progress >= 100}
                  />
                  <Group justify="space-between" mt={8}>
                     <Text size="xs" fw={700}>
                      {task.currentVal} / {task.intervalValue} {task.intervalType === "days" ? "pv" : "hlö-pv"}
                     </Text>
                     <Text size="xs" fw={700} c="dimmed">
                      Viimeksi: {task.lastLog ? new Date(task.lastLog.completedAt).toLocaleDateString("fi-FI") : "-"}
                     </Text>
                  </Group>
                </Paper>
              )}

              <Group grow>
                <Button 
                  variant="filled" 
                  color={task.isAutomatic ? "blue" : "forestGreen"} 
                  leftSection={task.isAutomatic ? <IconRefresh size={18} /> : <IconCheck size={18} />}
                  onClick={() => {
                    setSelectedTask(task);
                    setLogModalOpened(true);
                  }}
                  fw={800}
                >
                  {task.isAutomatic ? "Synkronoi" : "Kuittaa"}
                </Button>
                <Button 
                  variant="light" 
                  color="gray" 
                  leftSection={<IconHistory size={18} />}
                  onClick={() => openHistory(task)}
                  fw={800}
                >
                  Historia
                </Button>
              </Group>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>

      {/* CREATE MODAL */}
      <Modal opened={createModalOpened} onClose={() => setCreateModalOpened(false)} title={<Text fw={800} size="lg">Luo huoltotehtävä</Text>} radius="md">
        <Stack gap="md">
          <TextInput label="Tehtävän nimi" placeholder="Esim. Kompostin tyhjennys" required value={taskForm.title} onChange={(e) => setTaskForm({...taskForm, title: e.currentTarget.value})} fw={700} />
          <Textarea label="Kuvaus" placeholder="Mitä tarkalleen pitää tehdä?" value={taskForm.description} onChange={(e) => setTaskForm({...taskForm, description: e.currentTarget.value})} fw={700} />
          <Group grow>
            <Select 
              label="Kriteeri"
              data={[{ value: 'days', label: 'Päivät' }, { value: 'person-days', label: 'Henkilövuorokaudet' }]}
              value={taskForm.intervalType}
              onChange={(val) => setTaskForm({...taskForm, intervalType: val || 'days'})}
              fw={700}
            />
            <NumberInput 
              label="Väli"
              min={1}
              value={taskForm.intervalValue}
              onChange={(val) => setTaskForm({...taskForm, intervalValue: Number(val)})}
              fw={700}
            />
          </Group>
          <Checkbox 
            label="Automaattinen toistuva tapahtuma (esim. jäteastia)" 
            checked={taskForm.isAutomatic} 
            onChange={(e) => setTaskForm({...taskForm, isAutomatic: e.currentTarget.checked})}
            fw={600}
          />
          <Button fullWidth color="forestGreen" onClick={handleCreateTask} loading={actionLoading} fw={800} mt="md">Luo tehtävä</Button>
        </Stack>
      </Modal>

      {/* EDIT MODAL */}
      <Modal opened={editModalOpened} onClose={() => setEditModalOpened(false)} title={<Text fw={800} size="lg">Muokkaa huoltotehtävää</Text>} radius="md">
        <Stack gap="md">
          <TextInput label="Tehtävän nimi" placeholder="Esim. Kompostin tyhjennys" required value={taskForm.title} onChange={(e) => setTaskForm({...taskForm, title: e.currentTarget.value})} fw={700} />
          <Textarea label="Kuvaus" placeholder="Mitä tarkalleen pitää tehdä?" value={taskForm.description} onChange={(e) => setTaskForm({...taskForm, description: e.currentTarget.value})} fw={700} />
          <Group grow>
            <Select 
              label="Kriteeri"
              data={[{ value: 'days', label: 'Päivät' }, { value: 'person-days', label: 'Henkilövuorokaudet' }]}
              value={taskForm.intervalType}
              onChange={(val) => setTaskForm({...taskForm, intervalType: val || 'days'})}
              fw={700}
            />
            <NumberInput 
              label="Väli"
              min={1}
              value={taskForm.intervalValue}
              onChange={(val) => setTaskForm({...taskForm, intervalValue: Number(val)})}
              fw={700}
            />
          </Group>
          <Checkbox 
            label="Automaattinen toistuva tapahtuma (esim. jäteastia)" 
            checked={taskForm.isAutomatic} 
            onChange={(e) => setTaskForm({...taskForm, isAutomatic: e.currentTarget.checked})}
            fw={600}
          />
          <Button fullWidth color="forestGreen" onClick={handleUpdateTask} loading={actionLoading} fw={800} mt="md">Tallenna muutokset</Button>
        </Stack>
      </Modal>

      {/* LOG MODAL */}
      <Modal opened={logModalOpened} onClose={() => setLogModalOpened(false)} title={<Text fw={800} size="lg">Merkitse tehdyksi: {selectedTask?.title}</Text>} radius="md">
        <Stack gap="md">
          {session ? (
            <Group gap="xs">
              <ThemeIcon variant="light" color="forestGreen" radius="xl" size="sm"><IconUser size={12} /></ThemeIcon>
              <Text fw={700} size="sm">Kirjautuneena: <Text component="span" c="forestGreen">{session.user.name}</Text></Text>
            </Group>
          ) : (
            <TextInput 
              label="Nimesi" 
              placeholder="Kuka suoritti huollon?" 
              required 
              value={guestName} 
              onChange={(e) => setGuestName(e.currentTarget.value)} 
              fw={700} 
            />
          )}
          
          <Paper withBorder p="sm" radius="md" bg="var(--mantine-color-gray-0)">
            <Checkbox 
              label="Valitse eri aika (oletuksena nyt)" 
              checked={customDateEnabled} 
              onChange={(e) => setCustomDateEnabled(e.currentTarget.checked)}
              fw={600}
              mb={customDateEnabled ? "sm" : 0}
            />
            {customDateEnabled && (
              <DateTimePicker 
                label="Suoritusajankohta"
                placeholder="Valitse päivä ja kellonaika"
                value={customDate}
                onChange={setCustomDate}
                fw={700}
              />
            )}
          </Paper>

          <Textarea label="Huomioita (valinnainen)" placeholder="Esim. Kaikki näytti olevan kunnossa." value={logNotes} onChange={(e) => setLogNotes(e.currentTarget.value)} fw={700} minRows={3} />
          <Button 
            fullWidth 
            color="forestGreen" 
            onClick={handleLogCompletion} 
            loading={actionLoading} 
            fw={800}
          >
            {selectedTask?.isAutomatic ? "Synkronoi ja nollaa mittari" : "Tallenna ja nollaa mittari"}
          </Button>
        </Stack>
      </Modal>

      {/* HISTORY MODAL */}
      <Modal opened={historyModalOpened} onClose={() => setHistoryModalOpened(false)} title={<Text fw={800} size="lg">Huoltohistoria: {selectedTask?.title}</Text>} radius="md" size="lg">
        <ScrollArea h={400} offsetScrollbars>
          <Timeline active={-1} bulletSize={24} lineWidth={2}>
            {history.map((item) => (
              <Timeline.Item key={item.id} bullet={<IconCheck size={12} />} title={<Text fw={800}>{item.userName || item.guestName}</Text>}>
                <Text size="sm" fw={600}>{new Date(item.completedAt).toLocaleString("fi-FI")}</Text>
                {item.notes && <Text size="sm" mt={4} fs="italic" c="dimmed">{item.notes}</Text>}
              </Timeline.Item>
            ))}
            {history.length === 0 && <Text fw={600} ta="center" py="xl" c="dimmed">Ei aikaisempia merkintöjä.</Text>}
          </Timeline>
        </ScrollArea>
      </Modal>
    </Stack>
  );
}
