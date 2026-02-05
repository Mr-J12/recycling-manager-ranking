import { faker } from '@faker-js/faker';
import fs from 'fs';

const generateData = () => {
  const candidates = [];
  const evaluations = [];

  for (let i = 1; i <= 40; i++) {
    // 1. Generate Candidate
    const candidate = {
      id: i,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      years_experience: faker.number.int({ min: 3, max: 15 }),
      bio: faker.person.bio(),
      skills: faker.helpers.arrayElements(
        ['Six Sigma', 'Lean Mfg', 'OSHA', 'Waste Reduction', 'SCM', 'Team Building'],
        { min: 2, max: 4 }
      )
    };
    candidates.push(candidate);

    // 2. Generate Mock AI Evaluation
    evaluations.push({
      id: i,
      candidate_id: i,
      crisis_management_score: faker.number.int({ min: 5, max: 10 }),
      sustainability_score: faker.number.int({ min: 4, max: 10 }),
      team_motivation_score: faker.number.int({ min: 6, max: 10 }),
      ai_feedback: faker.lorem.sentence()
    });
  }

  // Output as JSON for the Frontend to use immediately
  const dbParams = { candidates, evaluations };
  fs.writeFileSync('../frontend/src/data/mockData.json', JSON.stringify(dbParams, null, 2));
  
  console.log("✅ Generated 40 candidates and saved to frontend/src/data/mockData.json");
};

generateData();