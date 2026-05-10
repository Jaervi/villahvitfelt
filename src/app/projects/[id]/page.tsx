"use client";

import { useState, useEffect, use } from "react";
import {
  Title,
  Text,
  Stack,
  Group,
  Button,
  Paper,
  Badge,
  Tabs,
  Divider,
  ActionIcon,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  Progress,
  Checkbox,
  SimpleGrid,
  Box,
  LoadingOverlay,
  Anchor,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconCheck,
  IconX,
  IconEdit,
  IconTrash,
  IconPlus,
  IconUsers,
  IconPackage,
  IconPhoto,
  IconInfoCircle,
  IconMessageDots,
  IconExternalLink,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { RichTextEditor, Link as RichTextLink } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import LinkExtension from "@tiptap/extension-link";
import "@mantine/tiptap/styles.css";
import {
  getProjectById,
  updateProject,
  deleteProject,
  updateProjectNotes,
  createProjectTask,
  toggleProjectTask,
  deleteProjectTask,
  createProjectItem,
  toggleProjectItemProcured,
  deleteProjectItem,
} from "@/lib/actions/projects";
import { notifications } from "@mantine/notifications";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState("");
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const isAdmin = session?.user.role === "admin";

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      LinkExtension.configure({
        openOnClick: false,
      }),
    ],
    content: "",
    immediatelyRender: false,
  });

  // Form states
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemCost, setNewItemCost] = useState(0);
  const [newItemLink, setNewItemLink] = useState("");

  const [editData, setEditData] = useState({
    title: "",
    description: "",
    status: "",
    priority: "",
    budget: 0,
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(isAdmin);
    }
  }, [editor, isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    const projectData = await getProjectById(id);
    if (!projectData) {
      notifications.show({ title: "Virhe", message: "Projektia ei löytynyt.", color: "red" });
      router.push("/projects");
      return;
    }
    setProject(projectData);
    if (editor && projectData.notes) {
      editor.commands.setContent(projectData.notes);
    } else if (editor) {
      editor.commands.setContent("");
    }
    setEditData({
      title: projectData.title,
      description: projectData.description,
      status: projectData.status,
      priority: projectData.priority,
      budget: projectData.budget,
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleUpdateProject = async () => {
    setSaving(true);
    const res = await updateProject(id, editData);
    if (res.success) {
      notifications.show({ message: "Projektin tiedot päivitetty.", color: "green" });
      setIsEditing(false);
      await fetchData();
    } else {
      notifications.show({ title: "Virhe", message: res.error, color: "red" });
    }
    setSaving(false);
  };

  const handleToggleTask = async (taskId: string, isCompleted: boolean) => {
    if (!project) return;
    
    // Optimistic update
    const updatedTasks = project.tasks.map((t: any) => 
      t.id === taskId ? { ...t, isCompleted } : t
    );
    setProject({ ...project, tasks: updatedTasks });

    const res = await toggleProjectTask(taskId, id, isCompleted);
    if (!res.success) {
      notifications.show({ title: "Virhe", message: "Tehtävän päivittäminen epäonnistui.", color: "red" });
      await fetchData(); // Revert on failure
    }
  };

  const handleToggleItem = async (itemId: string, isProcured: boolean) => {
    if (!project) return;

    // Optimistic update
    const updatedItems = project.items.map((i: any) =>
      i.id === itemId ? { ...i, isProcured } : i
    );
    setProject({ ...project, items: updatedItems });

    const res = await toggleProjectItemProcured(itemId, id, isProcured);
    if (!res.success) {
      notifications.show({ title: "Virhe", message: "Hankinnan päivittäminen epäonnistui.", color: "red" });
      await fetchData(); // Revert on failure
    }
  };

  const handleSaveNotes = async () => {
    if (!editor) return;
    setSaving(true);
    const content = editor.getHTML();
    const res = await updateProjectNotes(id, content);
    if (res.success) {
      notifications.show({ message: "Muistiinpanot tallennettu.", color: "green" });
      await fetchData();
    } else {
      notifications.show({ title: "Virhe", message: res.error, color: "red" });
    }
    setSaving(false);
  };

  const handleAddTask = async () => {
    if (!newTaskTitle) return;
    setSaving(true);
    const res = await createProjectTask({
      projectId: id,
      title: newTaskTitle,
      assigneeName: newTaskAssignee,
    });
    if (res.success) {
      setNewTaskTitle("");
      setNewTaskAssignee("");
      await fetchData();
    }
    setSaving(false);
  };

  const handleAddItem = async () => {
    if (!newItemName) return;
    setSaving(true);
    const res = await createProjectItem({
      projectId: id,
      name: newItemName,
      estimatedCost: newItemCost,
      link: newItemLink,
    });
    if (res.success) {
      setNewItemName("");
      setNewItemCost(0);
      setNewItemLink("");
      await fetchData();
    }
    setSaving(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "red";
      case "medium": return "orange";
      case "low": return "blue";
      default: return "gray";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "idea": return "Idea";
      case "planned": return "Suunnitteilla";
      case "in-progress": return "Työn alla";
      case "completed": return "Valmis";
      default: return status;
    }
  };

  if (loading) return <Box pos="relative" h="100vh"><LoadingOverlay visible /></Box>;

  const completedTasks = project.tasks.filter((t: any) => t.isCompleted).length;
  const progress = project.tasks.length > 0 ? (completedTasks / project.tasks.length) * 100 : 0;
  const totalItemCost = project.items.reduce((sum: number, item: any) => sum + item.estimatedCost, 0);

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <Button
          component={Link}
          href="/projects"
          variant="subtle"
          color="forestGreen"
          leftSection={<IconArrowLeft size={18} />}
          fw={700}
        >
          Palaa projekteihin
        </Button>
        {isAdmin && (
          <ActionIcon 
            variant="light" 
            color="blue" 
            size="lg" 
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <IconX size={20} /> : <IconEdit size={20} />}
          </ActionIcon>
        )}
      </Group>

      <Paper p="xl" radius="md" withBorder shadow="sm">
        {isEditing ? (
          <Stack gap="md">
            <TextInput
              label="Projektin nimi"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.currentTarget.value })}
              fw={700}
              size="lg"
            />
            <Textarea
              label="Kuvaus"
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.currentTarget.value })}
              fw={700}
              minRows={3}
            />
            <Group grow>
              <Select
                label="Tila"
                data={[
                  { value: "idea", label: "Idea" },
                  { value: "planned", label: "Suunnitteilla" },
                  { value: "in-progress", label: "Työn alla" },
                  { value: "completed", label: "Valmis" },
                ]}
                value={editData.status}
                onChange={(val) => setEditData({ ...editData, status: val || "" })}
                fw={700}
              />
              <Select
                label="Prioriteetti"
                data={[
                  { value: "low", label: "Matala" },
                  { value: "medium", label: "Normaali" },
                  { value: "high", label: "Kiireinen" },
                ]}
                value={editData.priority}
                onChange={(val) => setEditData({ ...editData, priority: val || "" })}
                fw={700}
              />
            </Group>
            <NumberInput
              label="Budjettiarvio (€)"
              value={editData.budget}
              onChange={(val) => setEditData({ ...editData, budget: Number(val) })}
              fw={700}
            />
            <Button color="forestGreen" onClick={handleUpdateProject} loading={saving} fw={800} mt="md">
              Tallenna muutokset
            </Button>
          </Stack>
        ) : (
          <Stack gap="lg">
            <Group justify="space-between" align="flex-start">
              <Stack gap={4}>
                <Title order={1} fw={800} style={{ letterSpacing: "-0.02em" }}>{project.title}</Title>
                <Text fw={500} size="lg" c="dimmed">{project.description}</Text>
              </Stack>
              <Stack align="flex-end" gap="xs">
                <Badge size="xl" variant="filled" color={getPriorityColor(project.priority)}>
                  {project.priority === "high" ? "KIIREINEN" : project.priority === "medium" ? "NORMAALI" : "MATALA"}
                </Badge>
                <Badge size="lg" variant="outline" color="gray">
                  {getStatusLabel(project.status)}
                </Badge>
              </Stack>
            </Group>

            <Divider />

            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl">
              <Paper withBorder p="md" radius="md" bg="var(--mantine-color-gray-0)">
                <Text size="xs" fw={800} c="dimmed" tt="uppercase">Edistyminen</Text>
                <Group justify="space-between" mt={4} mb={8}>
                  <Text fw={900} size="xl">{Math.round(progress)}%</Text>
                  <Text size="sm" fw={700}>{completedTasks}/{project.tasks.length} tehtävää</Text>
                </Group>
                <Progress value={progress} color="forestGreen" size="lg" radius="xl" striped animated />
              </Paper>

              <Paper withBorder p="md" radius="md" bg="var(--mantine-color-gray-0)">
                <Text size="xs" fw={800} c="dimmed" tt="uppercase">Budjetti</Text>
                <Group justify="space-between" mt={4}>
                  <Text fw={900} size="xl">{project.budget} €</Text>
                  <Text size="sm" fw={700} c={totalItemCost > project.budget ? "red" : "dimmed"}>
                    Käytetty: {totalItemCost} €
                  </Text>
                </Group>
              </Paper>

              <Paper withBorder p="md" radius="md" bg="var(--mantine-color-gray-0)">
                <Text size="xs" fw={800} c="dimmed" tt="uppercase">Tarvikkeet</Text>
                <Group justify="space-between" mt={4}>
                  <Text fw={900} size="xl">{project.items.length}</Text>
                  <Text size="sm" fw={700}>
                    Hankittu: {project.items.filter((i: any) => i.isProcured).length}
                  </Text>
                </Group>
              </Paper>
            </SimpleGrid>
          </Stack>
        )}
      </Paper>

      <Tabs defaultValue="overview" color="forestGreen" variant="pills" radius="md">
        <Tabs.List mb="lg">
          <Tabs.Tab value="overview" leftSection={<IconInfoCircle size={18} />}>Yleiskatsaus</Tabs.Tab>
          <Tabs.Tab value="tasks" leftSection={<IconCheck size={18} />}>Tehtävät ({project.tasks.length})</Tabs.Tab>
          <Tabs.Tab value="items" leftSection={<IconPackage size={18} />}>Tarvikkeet ({project.items.length})</Tabs.Tab>
          <Tabs.Tab value="media" leftSection={<IconPhoto size={18} />}>Media ({project.media.length})</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            <Stack gap="lg">
              <Paper p="xl" radius="md" withBorder>
                <Group justify="space-between" mb="md">
                  <Group gap="sm">
                    <IconMessageDots size={24} color="var(--mantine-color-forestGreen-filled)" />
                    <Title order={3} fw={800}>Muistiinpanot ja ideat</Title>
                  </Group>
                  {isAdmin && (
                    <Button 
                      variant="light" 
                      color="forestGreen" 
                      size="xs" 
                      leftSection={<IconDeviceFloppy size={16} />}
                      onClick={handleSaveNotes}
                      loading={saving}
                      fw={800}
                    >
                      Tallenna muistiinpanot
                    </Button>
                  )}
                </Group>
                <RichTextEditor editor={editor} mih={400}>
                  <RichTextEditor.Toolbar sticky stickyOffset={60}>
                    <RichTextEditor.ControlsGroup>
                      <RichTextEditor.Bold />
                      <RichTextEditor.Italic />
                      <RichTextEditor.Underline />
                      <RichTextEditor.Strikethrough />
                      <RichTextEditor.ClearFormatting />
                      <RichTextEditor.Code />
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                      <RichTextEditor.H1 />
                      <RichTextEditor.H2 />
                      <RichTextEditor.H3 />
                      <RichTextEditor.H4 />
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                      <RichTextEditor.Blockquote />
                      <RichTextEditor.Hr />
                      <RichTextEditor.BulletList />
                      <RichTextEditor.OrderedList />
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                      <RichTextEditor.Link />
                      <RichTextEditor.Unlink />
                    </RichTextEditor.ControlsGroup>
                  </RichTextEditor.Toolbar>

                  <RichTextEditor.Content />
                </RichTextEditor>
              </Paper>
            </Stack>

            <Stack gap="lg">
              <Paper p="xl" radius="md" withBorder>
                <Title order={3} fw={800} mb="lg">Projektin tila</Title>
                <Stack gap="md">
                  <Group justify="space-between">
                    <Text fw={700}>Vaihe</Text>
                    <Badge size="lg" variant="filled" color="forestGreen">{getStatusLabel(project.status)}</Badge>
                  </Group>
                  <Group justify="space-between">
                    <Text fw={700}>Tehtävät valmiina</Text>
                    <Text fw={800}>{completedTasks} / {project.tasks.length}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text fw={700}>Hankinnat tehty</Text>
                    <Text fw={800}>{project.items.filter((i: any) => i.isProcured).length} / {project.items.length}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text fw={700}>Budjetti käytetty</Text>
                    <Text fw={800} c={totalItemCost > project.budget ? "red" : "inherit"}>
                      {totalItemCost} € / {project.budget} €
                    </Text>
                  </Group>
                </Stack>
              </Paper>
            </Stack>
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="tasks">
          <Paper p="xl" radius="md" withBorder>
            <Stack gap="xl">
              <Group justify="space-between">
                <Title order={3} fw={800}>Projektin tehtävälista</Title>
                <Badge size="lg" color="forestGreen">{completedTasks}/{project.tasks.length} valmiina</Badge>
              </Group>

              <Stack gap="md">
                {project.tasks.map((task: any) => (
                  <Paper 
                    key={task.id} 
                    withBorder 
                    p="md" 
                    radius="md" 
                    bg={task.isCompleted ? "var(--mantine-color-gray-0)" : "white"}
                    onClick={() => handleToggleTask(task.id, !task.isCompleted)}
                    style={{ cursor: "pointer", transition: "background-color 0.1s ease" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--mantine-color-gray-1)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = task.isCompleted ? "var(--mantine-color-gray-0)" : "white"}
                  >
                    <Group justify="space-between">
                      <Group gap="lg">
                        <Checkbox
                          checked={task.isCompleted}
                          onChange={() => {}} // Handled by parent div
                          size="md"
                          color="forestGreen"
                        />
                        <Stack gap={2}>
                          <Text 
                            fw={800} 
                            td={task.isCompleted ? "line-through" : "none"}
                            c={task.isCompleted ? "dimmed" : "inherit"}
                          >
                            {task.title}
                          </Text>
                          {task.assigneeName && (
                            <Group gap={4}>
                              <IconUsers size={14} c="dimmed" />
                              <Text size="xs" fw={700} c="dimmed">
                                Vastuu: {task.assigneeName}
                              </Text>
                            </Group>
                          )}
                        </Stack>
                      </Group>
                      {isAdmin && (
                        <ActionIcon 
                          variant="subtle" 
                          color="red" 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteProjectTask(task.id, id);
                          }}
                        >
                          <IconTrash size={18} />
                        </ActionIcon>
                      )}
                    </Group>
                  </Paper>
                ))}

                {isAdmin && (
                  <Paper withBorder p="md" radius="md" bg="var(--mantine-color-forestGreen-0)">
                    <Group align="flex-end">
                      <TextInput
                        label="Uusi tehtävä"
                        placeholder="Mitä pitää tehdä?"
                        style={{ flex: 1 }}
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.currentTarget.value)}
                        fw={700}
                      />
                      <TextInput
                        label="Vastuuhenkilö"
                        placeholder="Nimi..."
                        value={newTaskAssignee}
                        onChange={(e) => setNewTaskAssignee(e.currentTarget.value)}
                        fw={700}
                        style={{ width: "200px" }}
                      />
                      <Button color="forestGreen" leftSection={<IconPlus size={18} />} onClick={handleAddTask} loading={saving} fw={800}>
                        Lisää
                      </Button>
                    </Group>
                  </Paper>
                )}
              </Stack>
            </Stack>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="items">
          <Paper p="xl" radius="md" withBorder>
            <Stack gap="xl">
              <Group justify="space-between">
                <Title order={3} fw={800}>Tarvikkeet ja hankinnat</Title>
                <Text fw={800} c={totalItemCost > project.budget ? "red" : "forestGreen"}>
                  Yhteensä: {totalItemCost} € / {project.budget} €
                </Text>
              </Group>

              <Stack gap="md">
                {project.items.map((item: any) => (
                  <Paper 
                    key={item.id} 
                    withBorder 
                    p="md" 
                    radius="md" 
                    bg={item.isProcured ? "var(--mantine-color-gray-0)" : "white"}
                    onClick={() => handleToggleItem(item.id, !item.isProcured)}
                    style={{ cursor: "pointer", transition: "background-color 0.1s ease" }}
                  >
                    <Group justify="space-between">
                      <Group gap="lg">
                        <Checkbox
                          checked={item.isProcured}
                          onChange={() => {}} // Handled by parent div
                          size="md"
                          color="forestGreen"
                        />
                        <Stack gap={2}>
                          <Text 
                            fw={800} 
                            td={item.isProcured ? "line-through" : "none"}
                            c={item.isProcured ? "dimmed" : "inherit"}
                          >
                            {item.name}
                          </Text>
                          <Group gap="lg">
                            <Text size="sm" fw={700} fz="15px" c="forestGreen">
                              Hinta-arvio: {item.estimatedCost} €
                            </Text>
                            {item.link && (
                              <Anchor href={item.link} target="_blank" size="sm" fw={700}>
                                <Group gap={4}>
                                  <IconExternalLink size={14} />
                                  Linkki tarvikkeeseen
                                </Group>
                              </Anchor>
                            )}
                          </Group>
                        </Stack>
                      </Group>
                      {isAdmin && (
                        <ActionIcon variant="subtle" color="red" onClick={() => deleteProjectItem(item.id, id)}>
                          <IconTrash size={18} />
                        </ActionIcon>
                      )}
                    </Group>
                  </Paper>
                ))}

                {isAdmin && (
                  <Paper withBorder p="md" radius="md" bg="var(--mantine-color-blue-0)">
                    <Stack gap="md">
                      <Group align="flex-end" grow>
                        <TextInput
                          label="Uusi tarvike"
                          placeholder="Esim. Terassiruuvit 5kg"
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.currentTarget.value)}
                          fw={700}
                        />
                        <NumberInput
                          label="Hinta-arvio (€)"
                          min={0}
                          value={newItemCost}
                          onChange={(val) => setNewItemCost(Number(val))}
                          fw={700}
                        />
                      </Group>
                      <Group align="flex-end">
                        <TextInput
                          label="Linkki (valinnainen)"
                          placeholder="https://..."
                          style={{ flex: 1 }}
                          value={newItemLink}
                          onChange={(e) => setNewItemLink(e.currentTarget.value)}
                          fw={700}
                        />
                        <Button color="blue" leftSection={<IconPlus size={18} />} onClick={handleAddItem} loading={saving} fw={800}>
                          Lisää tarvike
                        </Button>
                      </Group>
                    </Stack>
                  </Paper>
                )}
              </Stack>
            </Stack>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="media">
          <Paper p="xl" radius="md" withBorder>
            <Stack align="center" py="xl" gap="md">
              <IconPhoto size={60} color="var(--mantine-color-gray-4)" />
              <Title order={3} fw={800} c="dimmed">Mediahallinta tulossa</Title>
              <Text c="dimmed" ta="center" fw={600}>
                Tiedostojen ja valokuvien hallinta toteutetaan myöhemmässä vaiheessa.
              </Text>
            </Stack>
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
