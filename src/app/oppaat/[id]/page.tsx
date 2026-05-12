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
  FileButton,
  Image,
  SimpleGrid,
  Card,
  ThemeIcon,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconCheck,
  IconX,
  IconEdit,
  IconTrash,
  IconDeviceFloppy,
  IconBook2,
  IconUpload,
  IconPhoto,
  IconPlus,
} from "@tabler/icons-react";
import { RichTextEditor, Link as RichTextLink } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import "@mantine/tiptap/styles.css";
import {
  getGuideById,
  updateGuide,
  deleteGuide,
} from "@/lib/actions/guides";
import { deleteMedia, getGuideMedia } from "@/lib/actions/media";
import { notifications } from "@mantine/notifications";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function GuideDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [guide, setGuide] = useState<any>(null);
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
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
      ImageExtension,
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
    const [guideData, mediaData] = await Promise.all([
      getGuideById(id),
      getGuideMedia(id)
    ]);

    if (!guideData) {
      notifications.show({ title: "Virhe", message: "Opasta ei löytynyt.", color: "red" });
      router.push("/oppaat");
      return;
    }
    setGuide(guideData);
    setMedia(mediaData);
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

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("relatedType", "guide");
    formData.append("relatedId", id);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        notifications.show({ title: "Kuva ladattu", message: "Tiedosto on tallennettu onnistuneesti.", color: "green" });
        await fetchData();
      } else {
        const data = await res.json();
        notifications.show({ title: "Virhe", message: data.error || "Lataus epäonnistui.", color: "red" });
      }
    } catch (error) {
      notifications.show({ title: "Virhe", message: "Yhteysvirhe.", color: "red" });
    }
    setUploading(false);
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm("Haluatko varmasti poistaa tämän tiedoston?")) return;
    setSaving(true);
    const res = await deleteMedia(mediaId, "guide", id);
    if (res.success) {
      notifications.show({ message: "Tiedosto poistettu.", color: "green" });
      await fetchData();
    } else {
      notifications.show({ title: "Virhe", message: res.error, color: "red" });
    }
    setSaving(false);
  };

  const insertImage = (url: string) => {
    if (editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
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
            <Link href="/oppaat" style={{ textDecoration: 'none' }}>
              <Anchor fw={700} c="forestGreen">
                Oppaat
              </Anchor>
            </Link>
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

        {/* MEDIA SECTION */}
        <Paper p="xl" radius="md" withBorder shadow="sm">
          <Stack gap="lg">
            <Group justify="space-between">
              <Group gap="sm">
                <ThemeIcon size={44} radius="md" color="forestGreen" variant="light">
                  <IconPhoto size={26} />
                </ThemeIcon>
                <div>
                  <Title order={2} size="h4" fw={800}>Oppaan kuvat</Title>
                  <Text size="xs" c="dimmed" fw={700} tt="uppercase">Liitteet ja upotukset</Text>
                </div>
              </Group>
              {isAdmin && (
                <FileButton onChange={handleUpload} accept="image/png,image/jpeg,image/webp">
                  {(props) => (
                    <Button {...props} leftSection={<IconUpload size={18} />} loading={uploading} color="forestGreen" variant="light" fw={800}>
                      Lataa kuva
                    </Button>
                  )}
                </FileButton>
              )}
            </Group>

            {media.length === 0 ? (
              <Stack align="center" py="xl" gap="sm">
                <IconPhoto size={48} color="var(--mantine-color-gray-4)" />
                <Text size="sm" c="dimmed" fw={600}>Ei vielä ladattuja kuvia.</Text>
              </Stack>
            ) : (
              <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
                {media.map((m) => (
                  <Card key={m.id} p={0} radius="md" withBorder shadow="sm" style={{ overflow: 'visible' }}>
                    <Card.Section>
                      <Image 
                        src={m.filePath} 
                        height={140} 
                        style={{ objectFit: 'cover', cursor: 'pointer', borderRadius: '8px 8px 0 0' }}
                        onClick={() => window.open(m.filePath, '_blank')}
                      />
                    </Card.Section>
                    <Stack gap={4} p="xs">
                      {isEditing && (
                        <Button 
                          size="compact-xs" 
                          variant="light" 
                          color="blue" 
                          leftSection={<IconPlus size={12} />}
                          onClick={() => insertImage(m.filePath)}
                          fw={700}
                        >
                          Upota tekstiin
                        </Button>
                      )}
                      {isAdmin && (
                        <ActionIcon 
                          color="red" 
                          variant="filled" 
                          size="sm" 
                          onClick={() => handleDeleteMedia(m.id)}
                          style={{ position: 'absolute', top: -8, right: -8, zIndex: 10, borderRadius: '50%' }}
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      )}
                    </Stack>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
