import fs from 'node:fs';
import path from 'node:path';
import XLSX from 'xlsx';

export type CatalogSubtopic = {
  title: string;
  difficulty: string;
  practiceResource: string;
  interviewResource: string;
};

export type CatalogTopic = {
  title: string;
  difficulty: string;
  practiceResource: string;
  interviewResource: string;
  subtopics: CatalogSubtopic[];
};

export type CatalogModule = {
  title: string;
  topics: CatalogTopic[];
};

export type SubjectCatalog = {
  key: string;
  title: string;
  sourceFile: string;
  modules: CatalogModule[];
  rows: Array<{
    module: string;
    topic: string;
    subtopic: string;
    difficulty: string;
    practiceResource: string;
    interviewResource: string;
  }>;
  counts: {
    modules: number;
    topics: number;
    subtopics: number;
  };
};

const datasetDir = path.resolve(process.cwd(), 'dataset');

const titleMap: Record<string, string> = {
  'API_Development': 'API Development',
  'AWS': 'Amazon Web Services (AWS)',
  'AI': 'Artificial Intelligence (AI)',
  'AR_VR_Development': 'AR/VR Development',
  'Azure': 'Microsoft Azure',
  'Backend_Development': 'Backend Development',
  'Big_Data_Analytics': 'Big Data Analytics',
  'Blockchain': 'Blockchain Technology',
  'CN': 'Computer Networks (CN)',
  'CI_CD_Pipelines': 'CI/CD Pipelines',
  'Cloud_Computing': 'Cloud Computing',
  'COA': 'Computer Organization & Architecture (COA)',
  'C_Programming': 'C Programming',
  'CPP_Programming': 'C++ Programming',
  'Computer_Graphics': 'Computer Graphics',
  'Compiler_Design': 'Compiler Design',
  'DAA': 'Design & Analysis of Algorithms (DAA)',
  'DBMS': 'Database Management Systems (DBMS)',
  'Data_Mining': 'Data Mining',
  'Deep_Learning': 'Deep Learning',
  'DLD': 'Digital Logic Design (DLD)',
  'DSA': 'Data Structures & Algorithms (DSA)',
  'Distributed_Systems': 'Distributed Systems',
  'DevOps': 'DevOps',
  'Edge_Computing': 'Edge Computing',
  'Frontend_Development': 'Frontend Development',
  'Full_Stack_Development': 'Full Stack Development',
  'Game_Development': 'Game Development',
  'GCP': 'Google Cloud Platform (GCP)',
  'Generative_AI': 'Generative AI',
  'HCI': 'Human Computer Interaction (HCI)',
  'HPC': 'High Performance Computing (HPC)',
  'IoT': 'Internet of Things (IoT)',
  'Infrastructure_as_Code': 'Infrastructure as Code',
  'Java_Programming': 'Java Programming',
  'JavaScript_Programming': 'JavaScript Programming',
  'Kubernetes': 'Kubernetes',
  'Linux_Administration': 'Linux Administration',
  'ML': 'Machine Learning (ML)',
  'MERN_Stack': 'MERN Stack',
  'MEAN_Stack': 'MEAN Stack',
  'MATLAB': 'MATLAB',
  'Microprocessors_Microcontrollers': 'Microprocessors & Microcontrollers',
  'Mobile_App_Development': 'Mobile App Development',
  'MLOps': 'MLOps',
  'NLP': 'Natural Language Processing (NLP)',
  'OOPS': 'Object Oriented Programming (OOPS)',
  'OS': 'Operating Systems (OS)',
  'Parallel_Computing': 'Parallel Computing',
  'PHP_Programming': 'PHP Programming',
  'Python_Programming': 'Python Programming',
  'Quantum_Computing': 'Quantum Computing',
  'R_Programming': 'R Programming',
  'Reinforcement_Learning': 'Reinforcement Learning',
  'Robotics': 'Robotics',
  'Rust_Programming': 'Rust Programming',
  'Software_Engineering': 'Software Engineering',
  'Software_Testing': 'Software Testing',
  'System_Design': 'System Design',
  'TOC': 'Theory of Computation (TOC)',
  'TypeScript_Programming': 'TypeScript Programming',
  'UI_UX_Design': 'UI/UX Design',
  'Web_Technologies': 'Web Technologies',
  'Wireless_Sensor_Networks': 'Wireless Sensor Networks'
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\+/g, 'plus')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function displayTitleFromFile(fileName: string) {
  const token = fileName.replace(/^Codexa_/, '').replace(/_Detailed_Dataset\.xlsx$/i, '');
  if (titleMap[token]) return titleMap[token];
  return token
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function splitCell(value: string) {
  return value
    .split(/,|;|\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeCell(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function parseWorkbook(filePath: string): SubjectCatalog {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
  const sourceFile = path.basename(filePath);
  const title = displayTitleFromFile(sourceFile);
  const key = slugify(title);

  const rowList = rows.map((row) => ({
    module: normalizeCell(row.Module),
    topic: normalizeCell(row.Topic),
    subtopic: normalizeCell(row.Subtopic),
    difficulty: normalizeCell(row.Difficulty) || 'Beginner',
    practiceResource: normalizeCell(row['Practice Resource']),
    interviewResource: normalizeCell(row['Interview Resource'])
  })).filter((row) => row.module || row.topic || row.subtopic);

  const moduleMap = new Map<string, CatalogModule>();
  const topicSet = new Set<string>();
  const subtopicSet = new Set<string>();

  for (const row of rowList) {
    const moduleName = row.module || 'General';
    const topicName = row.topic || row.subtopic || 'Overview';
    const subtopics = splitCell(row.subtopic).map((subtopic) => ({
      title: subtopic,
      difficulty: row.difficulty,
      practiceResource: row.practiceResource,
      interviewResource: row.interviewResource
    }));

    if (!moduleMap.has(moduleName)) {
      moduleMap.set(moduleName, { title: moduleName, topics: [] });
    }

    const moduleEntry = moduleMap.get(moduleName)!;
    let topicEntry = moduleEntry.topics.find((item) => item.title === topicName);

    if (!topicEntry) {
      topicEntry = {
        title: topicName,
        difficulty: row.difficulty,
        practiceResource: row.practiceResource,
        interviewResource: row.interviewResource,
        subtopics: []
      };
      moduleEntry.topics.push(topicEntry);
    }

    if (subtopics.length) {
      topicEntry.subtopics.push(...subtopics);
      subtopics.forEach((subtopic) => subtopicSet.add(`${topicName}::${subtopic.title}`));
    }

    topicSet.add(`${moduleName}::${topicName}`);
  }

  return {
    key,
    title,
    sourceFile,
    modules: Array.from(moduleMap.values()),
    rows: rowList,
    counts: {
      modules: moduleMap.size,
      topics: topicSet.size,
      subtopics: subtopicSet.size
    }
  };
}

const catalog = fs.existsSync(datasetDir)
  ? fs.readdirSync(datasetDir)
      .filter((file) => file.endsWith('.xlsx'))
      .map((file) => parseWorkbook(path.join(datasetDir, file)))
  : [];

const catalogByKey = new Map(catalog.map((subject) => [subject.key, subject]));

export function listSubjectCatalog() {
  return catalog;
}

export function getSubjectCatalog(subjectKey: string) {
  return catalogByKey.get(subjectKey) ?? null;
}
