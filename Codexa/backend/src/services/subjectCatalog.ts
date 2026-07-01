import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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

// IMPORTANT: anchor dataset discovery to the backend folder.
// Using process.cwd() breaks depending on where the server is launched from.
const datasetDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../dataset');

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
      .map((file) => {
        try {
          return parseWorkbook(path.join(datasetDir, file));
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('[dataset] Failed to parse', { file, datasetDir, err });
          return null;
        }
      })
      .filter((x): x is SubjectCatalog => x !== null)
  : [];



type CatalogIndex = {
  byPrimaryKey: Map<string, SubjectCatalog>;
  byAnyKey: Map<string, SubjectCatalog>;
};

function filenameToToken(sourceFile: string) {
  // Example: Codexa_DBMS_Detailed_Dataset.xlsx => DBMS
  const token = sourceFile
    .replace(/^Codexa_/, '')
    .replace(/_Detailed_Dataset\.xlsx$/i, '');
  return token;
}

function tokenToPrimaryKey(token: string) {
  // Prefer titleMap-derived display title, but always fall back to the raw token.
  const displayTitle = titleMap[token] ?? token.split('_').join(' ');
  return slugify(displayTitle);
}

function tokenToRouteLikeKeys(token: string) {
  // Generate a robust set of route-compatible keys.
  // We must support multiple slug styles coming from the frontend:
  // - full dataset display title slug
  // - raw token slug (DBMS, OS, CN)
  // - transformed token slug (underscores -> dashes, &/+ handling)
  // - token with common suffixes stripped (e.g. Rust_Programming => rust)

  const displayTitle = titleMap[token] ?? token;

  const primary = slugify(displayTitle);

  // Raw token: Rust_Programming, Go_Programming, DSA, etc.
  const rawTokenSlug = slugify(token);

  // A variant that removes common suffix patterns.
  const tokenWithoutProgramming = token.replace(/_(Programming|Programming_Detailed)$/i, '');
  const tokenWithoutCommonSuffixes = tokenWithoutProgramming
    .replace(/_(Detailed)$/i, '')
    .replace(/_Detailed$/i, '');

  const shortTokenSlug = slugify(titleMap[tokenWithoutCommonSuffixes] ?? tokenWithoutCommonSuffixes);

  // Also try transforming common patterns:
  // - Computer_Networks => computer-networks-cn
  // - Cyber_Security => cyber-security
  const normalizedToken = token
    .replace(/&/g, 'and')
    .replace(/\+/g, 'plus');
  const normalizedTokenSlug = slugify(normalizedToken.replace(/_/g, '-'));

  return Array.from(
    new Set([
      primary,
      rawTokenSlug,
      normalizedTokenSlug,
      shortTokenSlug,
      // If the route uses only the first segment (e.g. Rust from Rust_Programming)
      slugify(normalizedToken.split('_')[0] ?? normalizedToken),
      // If route uses dashes instead of underscores
      slugify(normalizedToken.replace(/_/g, '-'))
    ])
  );
}


function buildCatalogIndex(subjects: SubjectCatalog[]): CatalogIndex {
  const byPrimaryKey = new Map<string, SubjectCatalog>();
  const byAnyKey = new Map<string, SubjectCatalog>();

  for (const subject of subjects) {
    byPrimaryKey.set(subject.key, subject);

    const token = filenameToToken(subject.sourceFile);
    const candidateKeys = tokenToRouteLikeKeys(token);

    for (const candidateKey of candidateKeys) {
      if (!byAnyKey.has(candidateKey)) byAnyKey.set(candidateKey, subject);
    }

    // Also include whatever key the subject currently computed as.
    byAnyKey.set(subject.key, subject);
  }

  return { byPrimaryKey, byAnyKey };
}

const catalogIndex = buildCatalogIndex(catalog);

export function listSubjectCatalog() {
  return catalog;
}

export function getSubjectCatalog(subjectKey: string) {
  const direct = catalogIndex.byPrimaryKey.get(subjectKey);
  if (direct) return direct;

  const resolved = catalogIndex.byAnyKey.get(subjectKey);
  if (resolved) return resolved;

  // Logging for debugging missing datasets
  // eslint-disable-next-line no-console
  console.error('[dataset] Subject dataset not found', {
    requested: subjectKey,
    availableKeysSample: catalog.slice(0, 5).map((s) => s.key)
  });

  return null;
}

