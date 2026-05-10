"use client";

import { useState, useEffect } from "react";
import {
  Title,
  Text,
  Stack,
  Group,
  Button,
  Card,
  Badge,
  ActionIcon,
  Modal,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  Paper,
  ScrollArea,
  Tooltip,
} from "@mantine/core";
import {
  IconPlus,
  IconEdit,
  IconCalendar,
  IconArrowRight,
  IconGripVertical,
} from "@tabler/icons-react";
import { getProjects, createProject, updateProject, updateProjectStatus } from "@/lib/actions/projects";
import { notifications } from "@mantine/notifications";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  budget: number;
  createdAt: Date;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  const { data: session } = authClient.useSession();
  const isAdmin = session?.user.role === "admin";

  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    status: "planned",
    priority: "medium",
    budget: 0,
  });

  const fetchProjects = async () => {
    setLoading(true);
    const data = await getProjects();
    setProjects(data as any);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async () => {
    if (!formValues.title) return;
    setLoading(true);
    const res = await createProject(formValues);
    if (res.success) {
      notifications.show({ title: "Projekti luotu", message: "Uusi projekti on lisätty onnistuneesti.", color: "green" });
      setCreateModalOpened(false);
      setFormValues({ title: "", description: "", status: "planned", priority: "medium", budget: 0 });
      await fetchProjects();
    } else {
      notifications.show({ title: "Virhe", message: res.error, color: "red" });
    }
    setLoading(false);
  };

  const handleUpdateProject = async () => {
    if (!editingProject || !formValues.title) return;
    setLoading(true);
    const res = await updateProject(editingProject.id, formValues);
    if (res.success) {
      notifications.show({ message: "Projekti päivitetty.", color: "green" });
      setEditModalOpened(false);
      await fetchProjects();
    } else {
      notifications.show({ title: "Virhe", message: res.error, color: "red" });
    }
    setLoading(false);
  };

  const openEditModal = (e: React.MouseEvent, p: Project) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingProject(p);
    setFormValues({
      title: p.title,
      description: p.description,
      status: p.status,
      priority: p.priority,
      budget: p.budget,
    });
    setEditModalOpened(true);
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Optimistic UI update
    const updatedProjects = Array.from(projects);
    const projectIndex = updatedProjects.findIndex(p => p.id === draggableId);
    if (projectIndex !== -1) {
      updatedProjects[projectIndex].status = destination.droppableId;
      setProjects(updatedProjects);
    }

    const res = await updateProjectStatus(draggableId, destination.droppableId as any);
    if (!res.success) {
      notifications.show({ title: "Virhe", message: res.error, color: "red" });
      await fetchProjects(); // Revert on failure
    }
  };

  const columns = [
    { id: "idea", label: "Idea", color: "gray" },
    { id: "planned", label: "Suunnitteilla", color: "blue" },
    { id: "in-progress", label: "Työn alla", color: "orange" },
    { id: "completed", label: "Valmis", color: "green" },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "red";
      case "medium": return "orange";
      case "low": return "blue";
      default: return "gray";
    }
  };

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="flex-end">
        <Stack gap="xs">
          <Title order={1} size="h1" style={{ letterSpacing: "-0.02em" }}>
            Projektit
          </Title>
          <Text size="xl" fw={600} style={{ opacity: 0.85 }}>
            Vedä ja pudota järjestääksesi • Klikkaa korttia nähdäksesi tiedot.
          </Text>
        </Stack>
        {isAdmin && (
          <Button 
            leftSection={<IconPlus size={18} />} 
            color="forestGreen" 
            onClick={() => {
              setFormValues({ title: "", description: "", status: "planned", priority: "medium", budget: 0 });
              setCreateModalOpened(true);
            }}
            fw={800}
          >
            Uusi projekti
          </Button>
        )}
      </Group>

      <DragDropContext onDragEnd={onDragEnd}>
        <ScrollArea pb="xl">
          <Group align="flex-start" wrap="nowrap" gap="md" style={{ minWidth: "1000px" }}>
            {columns.map((col) => (
              <Droppable key={col.id} droppableId={col.id}>
                {(provided) => (
                  <Paper 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    p="md" 
                    radius="md" 
                    bg="var(--mantine-color-gray-1)" 
                    style={{ width: "300px", minHeight: "600px" }}
                    withBorder
                  >
                    <Stack gap="md">
                      <Group justify="space-between" mb="xs">
                        <Badge color={col.color} variant="filled" size="lg" radius="sm">
                          {col.label}
                        </Badge>
                        <Text size="sm" fw={800} c="dimmed">
                          {projects.filter(p => p.status === col.id).length}
                        </Text>
                      </Group>

                      <Stack gap="sm">
                        {projects.filter(p => p.status === col.id).map((p, index) => (
                          <Draggable key={p.id} draggableId={p.id} index={index} isDragDisabled={!isAdmin}>
                            {(provided) => (
                              <Card 
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                ref={provided.innerRef}
                                shadow="sm" 
                                padding="md" 
                                radius="md" 
                                withBorder 
                                component={Link} 
                                href={`/projects/${p.id}`}
                                style={{ 
                                  ...provided.draggableProps.style,
                                  transition: "transform 0.1s ease, box-shadow 0.1s ease",
                                  cursor: "pointer",
                                  textDecoration: "none",
                                  color: "inherit"
                                }}
                              >
                                <Stack gap="xs">
                                  <Group justify="space-between" wrap="nowrap" align="flex-start">
                                    <Text fw={800} size="md" lineClamp={2} style={{ flex: 1 }}>{p.title}</Text>
                                    <Group gap={4}>
                                      {isAdmin && (
                                        <ActionIcon 
                                          variant="subtle" 
                                          color="forestGreen" 
                                          onClick={(e) => openEditModal(e, p)}
                                          size="sm"
                                        >
                                          <IconEdit size={16} />
                                        </ActionIcon>
                                      )}
                                      <IconGripVertical size={16} color="var(--mantine-color-gray-4)" />
                                    </Group>
                                  </Group>
                                  
                                  <Group gap={6}>
                                    <Badge color={getPriorityColor(p.priority)} variant="light" size="xs">
                                      {p.priority === "high" ? "Kiireinen" : p.priority === "medium" ? "Normaali" : "Matala"}
                                    </Badge>
                                    <Text size="xs" fw={700} c="dimmed">
                                      {new Date(p.createdAt).toLocaleDateString("fi-FI")}
                                    </Text>
                                  </Group>

                                  <Text size="sm" c="dimmed" lineClamp={2} fw={500}>
                                    {p.description}
                                  </Text>
                                </Stack>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </Stack>
                    </Stack>
                  </Paper>
                )}
              </Droppable>
            ))}
          </Group>
        </ScrollArea>
      </DragDropContext>

      {/* Create Modal */}
      <Modal 
        opened={createModalOpened} 
        onClose={() => setCreateModalOpened(false)} 
        title={<Text fw={800} size="lg">Luo uusi projekti</Text>}
        radius="md"
      >
        <ProjectForm 
          values={formValues} 
          onChange={(values) => setFormValues(values)} 
          onSubmit={handleCreateProject}
          loading={loading}
          buttonText="Luo projekti"
        />
      </Modal>

      {/* Edit Modal */}
      <Modal 
        opened={editModalOpened} 
        onClose={() => setEditModalOpened(false)} 
        title={<Text fw={800} size="lg">Muokkaa projektia</Text>}
        radius="md"
      >
        <ProjectForm 
          values={formValues} 
          onChange={(values) => setFormValues(values)} 
          onSubmit={handleUpdateProject}
          loading={loading}
          buttonText="Tallenna muutokset"
        />
      </Modal>
    </Stack>
  );
}

interface ProjectFormValues {
  title: string;
  description: string;
  status: string;
  priority: string;
  budget: number;
}

function ProjectForm({ 
  values, 
  onChange, 
  onSubmit, 
  loading, 
  buttonText 
}: { 
  values: ProjectFormValues; 
  onChange: (values: ProjectFormValues) => void; 
  onSubmit: () => void; 
  loading: boolean; 
  buttonText: string; 
}) {
  return (
    <Stack gap="md">
      <TextInput
        label="Projektin nimi"
        placeholder="Esim. Saunan lauteiden uusinta"
        required
        value={values.title}
        onChange={(e) => onChange({ ...values, title: e.currentTarget.value })}
        fw={700}
      />
      <Textarea
        label="Kuvaus"
        placeholder="Mitä projektissa tehdään?"
        minRows={3}
        value={values.description}
        onChange={(e) => onChange({ ...values, description: e.currentTarget.value })}
        fw={700}
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
          value={values.status}
          onChange={(val) => onChange({ ...values, status: val || "planned" })}
          fw={700}
        />
        <Select
          label="Prioriteetti"
          data={[
            { value: "low", label: "Matala" },
            { value: "medium", label: "Normaali" },
            { value: "high", label: "Kiireinen" },
          ]}
          value={values.priority}
          onChange={(val) => onChange({ ...values, priority: val || "medium" })}
          fw={700}
        />
      </Group>
      <NumberInput
        label="Budjettiarvio (€)"
        min={0}
        value={values.budget}
        onChange={(val) => onChange({ ...values, budget: Number(val) })}
        fw={700}
      />
      <Button 
        fullWidth 
        color="forestGreen" 
        mt="md" 
        onClick={onSubmit}
        loading={loading}
        fw={800}
      >
        {buttonText}
      </Button>
    </Stack>
  );
}
