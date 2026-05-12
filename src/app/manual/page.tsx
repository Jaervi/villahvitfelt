import { Title, Text, Stack, ThemeIcon, Paper, Grid, GridCol, Group, Badge, Anchor, Card, Box, Divider, List } from '@mantine/core';
import { 
  IconShip, 
  IconInfoCircle, 
  IconMap, 
  IconLock,
  IconRipple,
  IconToolsKitchen2,
  IconKayak,
  IconTent,
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

export default async function ManualPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <Stack gap="xl" py="md">
      <Stack gap="xs">
        <Title order={1} size="h1" fw={900}>
          Mökillä
        </Title>
        <Text size="xl" fw={500} c="dimmed" style={{ maxWidth: 700 }}>
          Veneen käyttö ja vapaa-ajan varusteet Villahvitfeltissä.
        </Text>
      </Stack>

      <Stack gap="xl">
        
        {/* VENE SECTION */}
        <Paper withBorder radius="md" p="xl" shadow="sm">
          <Group mb="xl">
            <ThemeIcon size={54} radius="md" color="forestGreen" variant="light">
              <IconShip size={32} />
            </ThemeIcon>
            <div>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts="0.05em">Vesillä</Text>
              <Title order={2} size="h2">Vene</Title>
            </div>
          </Group>

          <Stack gap="xl">
             {/* PROTECTED KEY INFO */}
             <Box>
                <Title order={3} size="h4" mb="md" fw={800}>Avain ja Turvallisuus</Title>
                {session ? (
                  <Card withBorder radius="md" p="xl" bg="var(--mantine-color-default-hover)">
                    <Text size="lg" fw={600} lh={1.6}>
                      Veneen avain on yleensä saunalla seinässä oven pielessä. 
                      Kun avain kytketään, pitää laittaa myös pieni punainen nipsu paikalleen.
                    </Text>
                  </Card>
                ) : (
                  <LockedSection message="Veneen avaintiedot vaativat kirjautumisen" />
                )}
             </Box>

             <Divider />

             <Grid gutter="xl">
                <GridCol span={{ base: 12, md: 4 }}>
                  <Card withBorder p="xl" radius="md" style={{ height: '100%' }}>
                    <Text fw={900} fz="xl" mb="md" c="blue.6">Bensa</Text>
                    <Text size="md" fw={500}>
                      Veneeseen käytetään 98 oktaanista bensaa. Varakanisterit ovat keltainen ja vihreä. 
                      Kanisterista ei voi kaataa bensaa, vaan tulee käyttää käsipumppua. 
                      Bensaa roiskuu helposti, joten käytä muovipussia suojana.
                    </Text>
                  </Card>
                </GridCol>
                <GridCol span={{ base: 12, md: 4 }}>
                  <Card withBorder p="xl" radius="md" style={{ height: '100%' }}>
                    <Text fw={900} fz="xl" mb="md" c="orange.6">Käynnistys</Text>
                    <Text size="md" fw={500}>
                      Avain paikoilleen ja punainen nipsu myös omaan paikkaansa. 
                      Takaistuimen alta sähköt päälle ja bensatankista ilmaruuvi hieman auki. 
                      Sitten kone alas nuolimerkistä, ja avaimesta käyntiin.
                    </Text>
                  </Card>
                </GridCol>
                <GridCol span={{ base: 12, md: 4 }}>
                  <Card withBorder p="xl" radius="md" style={{ height: '100%' }}>
                    <Text fw={900} fz="xl" mb="md" c="forestGreen.6">Kiinnitys</Text>
                    <Text size="md" fw={500}>
                      Poijuun kiinnitys on 'karabiinilla'. Lisäksi köysikiinnitys laituriin ja metsään. 
                      Vene kannattaa jättää hieman kauaksi laiturista.
                    </Text>
                  </Card>
                </GridCol>
             </Grid>
          </Stack>
        </Paper>

        {/* HUVIT JA VARUSTEET SECTION */}
        <Paper withBorder radius="md" p="xl" shadow="sm">
          <Group mb="xl">
            <ThemeIcon size={54} radius="md" color="forestGreen" variant="light">
              <IconRipple size={32} />
            </ThemeIcon>
            <div>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts="0.05em">Vapaa-aika</Text>
              <Title order={2} size="h2">Huvit ja Varusteet</Title>
            </div>
          </Group>

          <Grid gutter="xl">
            <GridCol span={{ base: 12, sm: 6 }}>
              <Card withBorder p="xl" radius="md">
                <Group wrap="nowrap" align="flex-start" mb="md">
                  <IconKayak size={32} color="var(--mantine-color-forestGreen-6)" />
                  <Title order={3} size="h3" fw={900}>Kajakki</Title>
                </Group>
                <Text size="lg" fw={500}>Varusteet löytyvät saunalta. Muista käyttää liivejä.</Text>
              </Card>
            </GridCol>
            <GridCol span={{ base: 12, sm: 6 }}>
              <Card withBorder p="xl" radius="md">
                <Group wrap="nowrap" align="flex-start" mb="md">
                  <IconRipple size={32} color="var(--mantine-color-blue-6)" />
                  <Title order={3} size="h3" fw={900}>Suppilauta</Title>
                </Group>
                <Text size="lg" fw={500}>
                  Suppilautan musta mela on saunan terassin alla. Liiveinä parhaimmat on keltaiset tai siniset. 
                  Nilkkarengas löytyy saunan laatikosta kuten myös keskiköli.
                </Text>
              </Card>
            </GridCol>
            <GridCol span={{ base: 12, sm: 6 }}>
              <Card withBorder p="xl" radius="md">
                <Group wrap="nowrap" align="flex-start" mb="md">
                  <IconTent size={32} color="var(--mantine-color-orange-6)" />
                  <Title order={3} size="h3" fw={900}>Riippumatot</Title>
                </Group>
                <Text size="lg" fw={500}>
                  Kiinnitysköydet saattavat olla valmiina puissa. Riippumatot ovat vierasmajan eteisessä. 
                  Alustat löytyvät metsämakkarista.
                </Text>
              </Card>
            </GridCol>
            <GridCol span={{ base: 12, sm: 6 }}>
              <Card withBorder p="xl" radius="md">
                <Group wrap="nowrap" align="flex-start" mb="md">
                  <IconShip size={32} color="var(--mantine-color-blue-6)" />
                  <Title order={3} size="h3" fw={900}>Vesihiihtolauta</Title>
                </Group>
                <Text size="lg" fw={500}>
                  Punainen laudan lisäksi tarvitaan vihreä köysi jossa on kahva. 
                  Kahva laitetaan laudassa olevaan mustaan pidikkeeseen.
                </Text>
              </Card>
            </GridCol>
          </Grid>
        </Paper>

      </Stack>
    </Stack>
  );
}
