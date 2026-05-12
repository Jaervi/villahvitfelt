import { Title, Text, Stack, List, ListItem, ThemeIcon, Paper, Grid, GridCol, Group, Badge, Anchor, Card, Box, Divider, Button } from '@mantine/core';
import { 
  IconKey, 
  IconMapPin, 
  IconDroplet, 
  IconFlame, 
  IconLogout, 
  IconLock,
  IconInfoCircle,
  IconArrowRight
} from '@tabler/icons-react';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import Link from 'next/link';

function LockedSection({ message }: { message: string }) {
  return (
    <Paper withBorder p="xl" radius="md">
      <Stack align="center" gap="sm">
        <IconLock size={40} color="var(--mantine-color-gray-6)" />
        <Text fw={700} size="lg" ta="center">{message}</Text>
        <Text size="sm" c="dimmed" ta="center">Kirjaudu sisään nähdäksesi nämä tiedot.</Text>
        <Link href="/login" style={{ textDecoration: 'none' }}>
          <Anchor fw={700} c="forestGreen">
            Kirjaudu tästä
          </Anchor>
        </Link>
      </Stack>
    </Paper>
  );
}

export default async function ArrivalPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <Stack gap="xl" py="md">
      <Stack gap="xs">
        <Title order={1} size="h1" fw={900}>
          Saapuminen
        </Title>
        <Text size="xl" fw={500} c="dimmed" style={{ maxWidth: 700 }}>
          Tervetuloa Villa Hvitfeltiin. Täältä löydät ohjeet perille pääsemiseksi ja avaimiin.
        </Text>
      </Stack>

      <Stack gap="xl">
        
        {/* OSOITE JA KOORDINAATIT */}
        <Paper withBorder radius="md" p="xl" shadow="sm">
          <Group mb="xl">
            <ThemeIcon size={54} radius="md" color="forestGreen" variant="light">
              <IconMapPin size={32} />
            </ThemeIcon>
            <div>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts="0.05em">Sijainti</Text>
              <Title order={2} size="h2">Osoite ja Koordinaatit</Title>
            </div>
          </Group>

          <Grid gutter="xl">
            <GridCol span={{ base: 12, md: 6 }}>
              <Card withBorder radius="md" p="xl" bg="var(--mantine-color-default-hover)">
                <Stack gap="xs">
                  <Text size="sm" fw={700} c="dimmed">POSTIOSOITE</Text>
                  <Text fw={900} fz="28px" lh={1.2}>Näkinniemenkuja 38</Text>
                  <Text fw={700} fz="20px" c="forestGreen">21650 Lillandet</Text>
                </Stack>
              </Card>
            </GridCol>
            <GridCol span={{ base: 12, md: 6 }}>
              <Card withBorder radius="md" p="xl">
                <Stack gap="xs">
                  <Text size="sm" fw={700} c="dimmed">KOORDINAATIT</Text>
                  <Text fw={800} fz="22px">60°11'48.8"N 22°05'51.8"E</Text>
                  <Anchor 
                    href="https://www.google.com/maps/search/?api=1&query=60.196880,22.097728" 
                    target="_blank" 
                    size="lg" 
                    fw={800}
                    c="forestGreen"
                    mt="xs"
                  >
                    Avaa Google Mapsissa →
                  </Anchor>
                </Stack>
              </Card>
            </GridCol>
          </Grid>
        </Paper>

        {/* AVAIMET */}
        <Paper withBorder radius="md" p="xl" shadow="sm">
          <Group mb="xl">
            <ThemeIcon size={54} radius="md" color="forestGreen" variant="light">
              <IconKey size={32} />
            </ThemeIcon>
            <div>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts="0.05em">Turvallisuus</Text>
              <Title order={2} size="h2">Avaimet</Title>
            </div>
          </Group>

          {session ? (
            <Grid gutter="xl">
              <GridCol span={{ base: 12, sm: 6 }}>
                <Card withBorder radius="md" p="xl">
                  <Title order={3} size="h4" mb="md" fw={800}>Ylämökki ja sauna</Title>
                  <Text size="md" fw={500}>
                    Abloy-avain on sama molempiin vanhoihin mökkeihin. Avaimessa voi olla musta muovimerkki. 
                    Saunalla ovea joutuu vähään nostamaan ja työntämään.
                  </Text>
                </Card>
              </GridCol>
              <GridCol span={{ base: 12, sm: 6 }}>
                <Card withBorder radius="md" p="xl">
                  <Title order={3} size="h4" mb="md" fw={800}>Vierasmaja</Title>
                  <Text size="md" fw={500}>
                    Vierasmajaan on 2 erilaista avainta. Ovet on lukittu ristiin, jotta yhdellä avaimella voi päästä molempiin.
                    Eli metsämakkarin parvekkeesta pääsee samalla avaimella kuin vierasmajan pääovesta.
                  </Text>
                </Card>
              </GridCol>
              <GridCol span={{ base: 12, sm: 6 }}>
                <Card withBorder radius="md" p="xl">
                  <Title order={3} size="h4" mb="md" fw={800}>Vanha puuvaja</Title>
                  <Text size="md" fw={500}>
                    Palloavain työkaluvajaan ja vanhaan huussiin on vierasmajan astiahyllyn kulmassa. 
                    Avaaminen vaatii vähän oven nostamista.
                  </Text>
                </Card>
              </GridCol>
              <GridCol span={{ base: 12, sm: 6 }}>
                <Card withBorder radius="md" p="xl" style={{ borderStyle: 'dashed', borderWidth: '2px' }}>
                  <Group justify="space-between" mb="md">
                    <Title order={3} size="h4" fw={900} c="red">Vara-avain</Title>
                  </Group>
                  <Text size="md" fw={600}>
                    Vara-avain ylämökkiin löytyy trattorian alatolpasta kallion puolelta.
                  </Text>
                </Card>
              </GridCol>
            </Grid>
          ) : (
            <LockedSection message="Avaintiedot vaativat kirjautumisen" />
          )}
        </Paper>

        {/* TEKNIIKKA JA CHECKLIST */}
        <Paper withBorder radius="md" p="xl" shadow="sm">
          <Group mb="xl">
            <ThemeIcon size={54} radius="md" color="forestGreen" variant="light">
              <IconInfoCircle size={32} />
            </ThemeIcon>
            <div>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts="0.05em">Ohjeet</Text>
              <Title order={2} size="h2">Tekniikka ja Muistilista</Title>
            </div>
          </Group>

          <Grid gutter="xl">
            <GridCol span={{ base: 12, md: 6 }}>
              <Stack gap="lg">
                <Box>
                  <Group gap="xs" mb="xs">
                    <IconDroplet size={24} color="var(--mantine-color-blue-6)" />
                    <Text fw={900} fz="xl">Kaivo</Text>
                  </Group>
                  <Text size="md" fw={500}>
                    Kaivoon pitää laittaa sähkö sinisestä johdosta. Kela on yleensä vierasmajan alla. 
                    Myös kaivossa pitää olla pumppu päällä-asennossa. Harmaa nuolivipu I-asennossa.
                  </Text>
                </Box>
                <Box>
                  <Group gap="xs" mb="xs">
                    <IconFlame size={24} color="var(--mantine-color-orange-6)" />
                    <Text fw={900} fz="xl">Lämmin vesi</Text>
                  </Group>
                  <Text size="md" fw={500}>
                    Ylämökissä lämminvesivaraaja menee yleensä päälle laittamalla jatkojohdosta kytkin punaiselle.
                    Saunalla laitetaan pistoke seinään.
                  </Text>
                </Box>
              </Stack>
            </GridCol>
            <GridCol span={{ base: 12, md: 6 }}>
              <Card p="xl" radius="md" withBorder bg="var(--mantine-color-forestGreen-light)" style={{ height: '100%' }}>
                <Group gap="xs" mb="md">
                  <IconLogout size={28} color="var(--mantine-color-forestGreen-9)" />
                  <Text fw={900} fz="24px" c="forestGreen.9">Poislähtö</Text>
                </Group>
                <List
                  spacing="sm"
                  size="md"
                  center
                  styles={{ item: { fontWeight: 600 } }}
                >
                  <ListItem>Sammuta molemmat lämminvesivaraajat</ListItem>
                  <ListItem>Kaivosta sähköt pois</ListItem>
                  <ListItem>Lukitse kaikki ovet ja ikkunat</ListItem>
                  <ListItem>Varmista veneen kiinnitys</ListItem>
                  <ListItem>Vie roskat keräyspisteelle</ListItem>
                </List>
              </Card>
            </GridCol>
          </Grid>
        </Paper>

        {/* CONTINUITY LINK */}
        <Paper withBorder radius="md" p="xl" shadow="sm" bg="var(--mantine-color-forestGreen-light)">
          <Stack align="center" gap="sm">
            <Text fw={800} size="xl" ta="center">Oletko jo asettunut taloksi?</Text>
            <Text size="md" fw={500} ta="center" style={{ maxWidth: 600 }}>
              Kun olet päässyt perille, voit tutustua tarkemmin mökin varusteisiin, veneen käyttöön ja harrastusvälineisiin.
            </Text>
            <Link href="/manual" style={{ textDecoration: 'none' }}>
              <Button 
                size="lg" 
                color="forestGreen" 
                fw={800} 
                variant="filled"
                rightSection={<IconArrowRight size={20} />}
                mt="md"
              >
                Seuraavaksi: Tutustu mökin varusteisiin ja veneeseen
              </Button>
            </Link>
          </Stack>
        </Paper>
      </Stack>
    </Stack>
  );
}
