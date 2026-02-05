import React, { useState, useMemo } from 'react';
import { 
  MantineProvider, Container, Title, Card, Table, Badge, Text, Group, Tabs, 
  Modal, Button, TextInput, Grid, Progress, ThemeIcon, Stack, Center 
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconTrophy, IconChartBar, IconUsers, IconSearch, IconX, IconCheck } from '@tabler/icons-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

// Import the JSON data.
import mockData from './data/mockData.json'; 

// --- DATA PROCESSING LOGIC ---
const processCandidates = (data) => {
  if (!data || !data.candidates) return [];

  return data.candidates.map((c) => {
    const ev = data.evaluations.find((e) => e.candidate_id === c.id);
    if (!ev) {
      return { 
        ...c, totalScore: "0.00", 
        crisis_management_score: 0, sustainability_score: 0, team_motivation_score: 0, 
        ai_feedback: "Pending AI Eval" 
      };
    }

    const rawScore = (
      (ev.crisis_management_score || 0) * 0.3 +
      (ev.sustainability_score || 0) * 0.4 +
      (ev.team_motivation_score || 0) * 0.3
    );

    return { ...c, ...ev, totalScore: rawScore.toFixed(2) };
  }).sort((a, b) => b.totalScore - a.totalScore);
};

// --- CANDIDATE DETAIL MODAL ---
const CandidateModal = ({ opened, onClose, candidate }) => {
  return (
    <Modal 
      opened={opened} 
      onClose={onClose}
      // FIX 1: Use Text instead of Title to prevent the "<h3> cannot be child of <h2>" error
      title={candidate ? <Text size="xl" fw={700}>{candidate.name}</Text> : 'Loading...'} 
      size="lg" 
      centered // FIX 2: This forces the modal to the exact center of the screen
      transitionProps={{ transition: 'fade', duration: 200 }}
    >
      {candidate && (
        <Grid>
          <Grid.Col span={12}>
            <Group mb="md">
               <Badge size="lg" color="blue">{candidate.totalScore} Total Score</Badge>
               <Text c="dimmed">{candidate.years_experience} Years Experience</Text>
            </Group>
            
            <Text size="sm" mb="xs" fw={700}>Bio:</Text>
            <Text size="sm" mb="lg" style={{ fontStyle: 'italic' }}>{candidate.bio}</Text>

            <Text size="sm" mb="xs" fw={700}>Score Breakdown:</Text>
            <Stack spacing="xs" mb="lg">
              <Group grow>
                <Text size="xs">Crisis Management</Text>
                <Progress value={candidate.crisis_management_score * 10} color="red" size="lg" label={candidate.crisis_management_score} />
              </Group>
              <Group grow>
                <Text size="xs">Sustainability</Text>
                <Progress value={candidate.sustainability_score * 10} color="green" size="lg" label={candidate.sustainability_score} />
              </Group>
              <Group grow>
                <Text size="xs">Team Motivation</Text>
                <Progress value={candidate.team_motivation_score * 10} color="blue" size="lg" label={candidate.team_motivation_score} />
              </Group>
            </Stack>

            <Card withBorder radius="md" p="md" bg="gray.0">
               <Group mb="xs">
                 <ThemeIcon color="violet" variant="light"><IconCheck size={16}/></ThemeIcon>
                 <Text fw={600} size="sm">AI Feedback</Text>
               </Group>
               <Text size="sm">{candidate.ai_feedback}</Text>
            </Card>
          </Grid.Col>
        </Grid>
      )}
    </Modal>
  );
};

// --- MAIN DASHBOARD ---
const Dashboard = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [search, setSearch] = useState('');

  const allCandidates = useMemo(() => processCandidates(mockData), []);

  const filteredCandidates = useMemo(() => {
    return allCandidates.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      (c.skills && c.skills.some(s => s.toLowerCase().includes(search.toLowerCase())))
    );
  }, [allCandidates, search]);

  const topTen = filteredCandidates.slice(0, 10);

  // FIX 3: Robust handler for the "View" buttons
  const handleViewCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    // Slight delay ensures the state is set before the animation starts
    setTimeout(() => open(), 0);
  };

  return (
    <Container size="xl" py="xl">
      <CandidateModal opened={opened} onClose={close} candidate={selectedCandidate} />

      {/* HEADER & SEARCH */}
      <Stack align="center" mb="xl">
        <Title order={1} align="center">Recycling Manager Hiring Portal</Title>
        <Text c="dimmed" align="center">AI-Powered Ranking System</Text>
        
        <Group justify="center" style={{ width: '100%', maxWidth: '500px' }}>
          <TextInput 
            placeholder="Search by name or skill..." 
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            rightSection={search ? <IconX size={16} style={{cursor: 'pointer'}} onClick={() => setSearch('')}/> : null}
            style={{ flex: 1 }}
          />
          <Badge size="lg" color="green" variant="light">
            {filteredCandidates.length} Found
          </Badge>
        </Group>
      </Stack>

      <Tabs defaultValue="leaderboard">
        <Tabs.List justify="center">
          <Tabs.Tab value="leaderboard" leftSection={<IconTrophy size={14} />}>Leaderboard</Tabs.Tab>
          <Tabs.Tab value="analytics" leftSection={<IconChartBar size={14} />}>Skill Analytics</Tabs.Tab>
          <Tabs.Tab value="all" leftSection={<IconUsers size={14} />}>All Profiles</Tabs.Tab>
        </Tabs.List>

        {/* TAB 1: LEADERBOARD */}
        <Tabs.Panel value="leaderboard" pt="xs">
          <Card shadow="sm" p="lg" radius="md" withBorder mt="md">
            <Title order={3} mb="md">Top Rankings</Title>
            <Table striped highlightOnHover>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Exp (Yrs)</th>
                  <th>Crisis</th>
                  <th>Sustain</th>
                  <th>Motivation</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {topTen.map((candidate, index) => (
                  <tr key={candidate.id} style={{cursor: 'pointer'}} onClick={() => handleViewCandidate(candidate)}>
                    <td><Badge color={index < 3 ? "yellow" : "gray"}>#{index + 1}</Badge></td>
                    <td><Text fw={500}>{candidate.name}</Text></td>
                    <td>{candidate.years_experience}</td>
                    <td>{candidate.crisis_management_score}</td>
                    <td>{candidate.sustainability_score}</td>
                    <td>{candidate.team_motivation_score}</td>
                    <td><Text fw={700} c="blue">{candidate.totalScore}</Text></td>
                    <td>
                        <Button size="xs" variant="light" onClick={(e) => {
                            e.stopPropagation(); 
                            handleViewCandidate(candidate);
                        }}>
                            View
                        </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Tabs.Panel>

        {/* TAB 2: ANALYTICS */}
        <Tabs.Panel value="analytics" pt="xs">
           <Card shadow="sm" p="lg" withBorder mt="md">
             <Title order={4} mb="lg">Skill Breakdown</Title>
             <div style={{ height: 400 }}>
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={topTen} layout="vertical" margin={{ left: 40, right: 20 }}>
                   <CartesianGrid strokeDasharray="3 3" />
                   <XAxis type="number" domain={[0, 10]} />
                   <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 12}} />
                   <Tooltip cursor={{fill: 'transparent'}} />
                   <Legend />
                   <Bar dataKey="crisis_management_score" name="Crisis" stackId="a" fill="#fa5252" radius={[0, 5, 5, 0]} />
                   <Bar dataKey="sustainability_score" name="Sustainability" stackId="a" fill="#40c057" />
                   <Bar dataKey="team_motivation_score" name="Motivation" stackId="a" fill="#228be6" />
                 </BarChart>
               </ResponsiveContainer>
             </div>
           </Card>
        </Tabs.Panel>

        {/* TAB 3: ALL PROFILES */}
        <Tabs.Panel value="all" pt="xs">
          <Grid mt="md">
            {filteredCandidates.map((c) => (
              <Grid.Col span={{ base: 12, sm: 6, lg: 4 }} key={c.id}>
                <Card shadow="sm" p="lg" radius="md" withBorder style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                  <Group justify="space-between" mb="xs">
                    <Text fw={600} truncate>{c.name}</Text>
                    <Badge color="blue" variant="light">{c.totalScore}</Badge>
                  </Group>
                  
                  <Text size="sm" c="dimmed" lineClamp={3} mb="sm" style={{flexGrow: 1}}>
                    {c.bio || "No bio available."}
                  </Text>
                  
                  <Group spacing={4} mb="md">
                    {(c.skills || []).slice(0, 3).map(s => <Badge key={s} size="xs" variant="outline">{s}</Badge>)}
                    {(c.skills?.length > 3) && <Badge size="xs" variant="outline">+{c.skills.length - 3}</Badge>}
                  </Group>

                  <Button fullWidth variant="light" onClick={(e) => {
                      e.stopPropagation();
                      handleViewCandidate(c);
                  }}>
                    View Analysis
                  </Button>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};

export default function App() {
  return (
    <MantineProvider>
      <Dashboard />
    </MantineProvider>
  );
}