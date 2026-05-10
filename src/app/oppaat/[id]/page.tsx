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
  Divider,
  ActionIcon,
  TextInput,
  Box,
  LoadingOverlay,
  TypographyStylesProvider,
  Container,
  Breadcrumbs,
  Anchor,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconCheck,
  IconX,
  IconEdit,
  IconTrash,
  IconDeviceFloppy,
  IconBook2,
} from "@tabler/icons-react";
import { RichTextEditor, Link as RichTextLink } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import LinkExtension from "@tiptap/extension-link";
import "@mantine/tiptap/styles.css";
import {
  getGuideById,
  updateGuide,
  deleteGuide,
} from "@/lib/actions/guides";
import { notifications } from "@mantine/notifications";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function GuideDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [guide, setGuide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const isAdmin = session?.user.role === "admin";

  const [editData, setEditData] = useState({
    title: "",
    category: "",
  });

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

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditing);
    }
  }, [editor, isEditing]);

  const fetchData = async () => {
    setLoading(true);
    const guideData = await getGuideById(id);
    if (!guideData) {
      notifications.show({ title: "Virhe", message: "Opasta ei löytynyt.", color: "red" });
      router.push("/oppaat");
      return;
    }
    setGuide(guideData);
    setEditData({
      title: guideData.title,
      category: guideData.category,
    });
    if (editor) {
      editor.commands.setContent(guideData.content);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id, editor]);

  const handleUpdateGuide = async () => {
    if (!editor) return;
    setSaving(true);
    const content = editor.getHTML();
    const res = await updateGuide(id, {
      ...editData,
      content,
    });
    if (res.success) {
      notifications.show({ message: "Opas päivitetty.", color: "green" });
      setIsEditing(false);
      await fetchData();
    } else {
      notifications.show({ title: "Virhe", message: res.error, color: "red" });
    }
    setSaving(false);
  };

  const handleDeleteGuide = async () => {
    if (!confirm("Haluatko varmasti poistaa tämän oppaan?")) return;
    setSaving(true);
    const res = await deleteGuide(id);
    if (res.success) {
      notifications.show({ message: "Opas poistettu.", color: "green" });
      router.push("/oppaat");
    } else {
      notifications.show({ title: "Virhe", message: res.error, color: "red" });
      setSaving(false);
    }
  };

  if (loading) return <Box pos="relative" h="100vh"><LoadingOverlay visible /></Box>;

  return (
    <Container size="lg">
      <Stack gap="xl">
        <Group justify="space-between">
          <Breadcrumbs separator="→" separatorMargin="md">
            <Anchor component={Link} href="/oppaat" fw={700} c="forestGreen">
              Oppaat
            </Anchor>
            <Text fw={700} c="dimmed">{guide.category}</Text>
          </Breadcrumbs>

          {isAdmin && (
            <Group gap="xs">
              {!isEditing ? (
                <>
                  <Button 
                    variant="light" 
                    color="blue" 
                    leftSection={<IconEdit size={18} />}
                    onClick={() => setIsEditing(true)}
                    fw={800}
                  >
                    Muokkaa
                  </Button>
                  <ActionIcon 
                    variant="light" 
                    color="red" 
                    size="lg" 
                    onClick={handleDeleteGuide}
                  >
                    <IconTrash size={20} />
                  </ActionIcon>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    color="gray" 
                    leftSection={<IconX size={18} />}
                    onClick={() => {
                      setIsEditing(false);
                      editor?.commands.setContent(guide.content);
                    }}
                    fw={800}
                  >
                    Peruuta
                  </Button>
                  <Button 
                    color="forestGreen" 
                    leftSection={<IconDeviceFloppy size={18} />}
                    onClick={handleUpdateGuide}
                    loading={saving}
                    fw={800}
                  >
                    Tallenna muutokset
                  </Button>
                </>
              )}
            </Group>
          )}
        </Group>

        <Paper p={isEditing ? "xl" : 0} radius="md" withBorder={isEditing}>
          <Stack gap="lg">
            {isEditing ? (
              <Group grow>
                <TextInput
                  label="Oppaan nimi"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.currentTarget.value })}
                  fw={700}
                  size="lg"
                />
                <TextInput
                  label="Kategoria"
                  value={editData.category}
                  onChange={(e) => setEditData({ ...editData, category: e.currentTarget.value })}
                  fw={700}
                  size="lg"
                />
              </Group>
            ) : (
              <Stack gap="xs">
                <Title order={1} fw={900} size="42px" style={{ letterSpacing: "-0.02em" }}>
                  {guide.title}
                </Title>
                <Text c="dimmed" fw={600}>
                  Päivitetty viimeksi {new Date(guide.updatedAt).toLocaleDateString("fi-FI")}
                </Text>
              </Stack>
            )}

            {!isEditing && <Divider />}

            <Box pos="relative">
              <LoadingOverlay visible={saving} />
              {isEditing ? (
                <RichTextEditor editor={editor} mih={600}>
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
              ) : (
                <TypographyStylesProvider p={0}>
                  <div 
                    className="mantine-RichTextEditor-content"
                    dangerouslySetInnerHTML={{ __html: guide.content }} 
                  />
                </TypographyStylesProvider>
              )}
            </Box>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
