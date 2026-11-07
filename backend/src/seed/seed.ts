import 'dotenv/config';
import mongoose from 'mongoose';
import * as cheerio from 'cheerio';

import { Person, PersonSchema } from '../people/schemas/person.schema';
import { Site, SiteSchema } from '../sites/schemas/site.schema';
import {
  Visit,
  VisitSchema,
  NavigationMethod,
  VisitStatus,
} from '../visits/schemas/visit.schema';

const people = [
  'Alex Morgan',
  'Maya Chen',
  'Noah Patel',
  'Sofia Reyes',
  'Ethan Brooks',
];

const websites = [
  {
    address: 'tidepool.zz',
    title: 'Tidepool Journal',
    author: 'Maya Chen',
    paragraphs: [
      'Oceans cover most of our planet and support an extraordinary range of marine life. Coastal ecosystems provide food, protect shorelines, and help maintain the balance of nature.',
      'Small actions such as reducing plastic waste and supporting conservation projects can make a meaningful difference. Healthy oceans depend on informed communities and responsible choices.',
    ],
    links: ['deepforest.zz', 'riverside.zz', 'foodatlas.zz'],
  },
  {
    address: 'deepforest.zz',
    title: 'The Deep Forest',
    author: 'Alex Morgan',
    paragraphs: [
      'Forests are living networks where trees, fungi, insects, birds, and mammals depend on one another. Every layer of a forest contributes to its wider ecosystem.',
      'Conservation is not only about planting trees. It also means protecting old habitats, restoring damaged land, and allowing wildlife to move safely between natural areas.',
    ],
    links: ['tidepool.zz', 'citygardens.zz', 'historylane.zz'],
  },
  {
    address: 'citygardens.zz',
    title: 'City Gardens',
    author: 'Sofia Reyes',
    paragraphs: [
      'Urban gardens turn unused spaces into productive green areas. They provide fresh vegetables, create habitats for pollinators, and give neighbors opportunities to work together.',
      'A successful community garden begins with healthy soil, suitable plants, regular care, and a shared understanding of how the space will be maintained.',
    ],
    links: ['deepforest.zz', 'foodatlas.zz', 'makershub.zz'],
  },
  {
    address: 'stargazer.zz',
    title: 'The Stargazer',
    author: 'Ethan Brooks',
    paragraphs: [
      'Looking at the night sky reminds us how much there is still to discover. Stars are distant suns, and many of them belong to systems with planets of their own.',
      'Amateur astronomy can begin with nothing more than a clear evening and a map of the constellations. Patience and curiosity are often more important than expensive equipment.',
    ],
    links: ['quietmind.zz', 'openlibrary.zz', 'lostarchive.zz'],
  },
  {
    address: 'quietmind.zz',
    title: 'Quiet Mind',
    author: 'Maya Chen',
    paragraphs: [
      'A calm routine can make demanding days easier to manage. Short breaks, thoughtful planning, and time away from constant notifications can help people regain focus.',
      'Rest is not wasted time. Sleep, supportive relationships, and realistic expectations all contribute to a more sustainable approach to everyday responsibilities.',
    ],
    links: ['stargazer.zz', 'openlibrary.zz', 'moonbase.zz'],
  },
  {
    address: 'openlibrary.zz',
    title: 'Open Library Notes',
    author: 'Noah Patel',
    paragraphs: [
      'Libraries are more than collections of books. They are shared spaces for learning, research, discussion, and the exchange of ideas across generations.',
      'Digital collections make information easier to discover, but thoughtful reading still requires time, comparison, and attention to the quality of sources.',
    ],
    links: ['historylane.zz', 'stargazer.zz', 'quietmind.zz'],
  },
  {
    address: 'riverside.zz',
    title: 'Riverside Research',
    author: 'Noah Patel',
    paragraphs: [
      'Rivers connect landscapes and communities. Their water supports agriculture, wildlife, transportation, and many everyday activities.',
      'Monitoring water quality helps researchers understand pollution and changing environmental conditions. Local participation can support long-term river protection.',
    ],
    links: ['tidepool.zz', 'deepforest.zz', 'historylane.zz'],
  },
  {
    address: 'makershub.zz',
    title: 'Makers Hub',
    author: 'Ethan Brooks',
    paragraphs: [
      'A makerspace is a place where people learn by building, testing, and improving ideas. Shared tools and knowledge make experimentation more accessible.',
      'Projects do not need to be complicated to be valuable. A simple prototype can reveal problems, inspire improvements, and help a team decide what to build next.',
    ],
    links: ['citygardens.zz', 'openlibrary.zz', 'foodatlas.zz'],
  },
  {
    address: 'historylane.zz',
    title: 'History Lane',
    author: 'Sofia Reyes',
    paragraphs: [
      'History is shaped by everyday decisions as well as major events. Letters, buildings, photographs, and oral accounts can reveal how communities changed over time.',
      'Comparing different sources helps us understand that historical accounts may contain different perspectives. Good research asks who created a source and why.',
    ],
    links: ['openlibrary.zz', 'deepforest.zz', 'oldstation.zz'],
  },
  {
    address: 'foodatlas.zz',
    title: 'Food Atlas',
    author: 'Noah Patel',
    paragraphs: [
      'Food traditions carry stories about geography, migration, family, and culture. Ingredients and cooking methods often reflect the environment in which communities developed.',
      'Seasonal food and local markets can help people understand where their meals come from. Cooking is also a practical way to share knowledge and bring people together.',
    ],
    links: ['citygardens.zz', 'tidepool.zz', 'makershub.zz'],
  },
];

type VisitPlan = {
  person: string;
  address: string;
  method: NavigationMethod;
  minute: number;
};

// Fixed timestamps make the seed history deterministic.
const visitPlan: VisitPlan[] = [
  // Alex explores almost every website, with repeated visits.
  { person: 'Alex Morgan', address: 'tidepool.zz', method: NavigationMethod.TYPED, minute: 0 },
  { person: 'Maya Chen', address: 'quietmind.zz', method: NavigationMethod.TYPED, minute: 2 },
  { person: 'Alex Morgan', address: 'deepforest.zz', method: NavigationMethod.LINK, minute: 4 },
  { person: 'Noah Patel', address: 'openlibrary.zz', method: NavigationMethod.TYPED, minute: 5 },
  { person: 'Sofia Reyes', address: 'citygardens.zz', method: NavigationMethod.TYPED, minute: 7 },
  { person: 'Alex Morgan', address: 'citygardens.zz', method: NavigationMethod.LINK, minute: 8 },
  { person: 'Maya Chen', address: 'stargazer.zz', method: NavigationMethod.LINK, minute: 9 },
  { person: 'Ethan Brooks', address: 'makershub.zz', method: NavigationMethod.TYPED, minute: 11 },
  { person: 'Alex Morgan', address: 'stargazer.zz', method: NavigationMethod.TYPED, minute: 12 },
  { person: 'Noah Patel', address: 'historylane.zz', method: NavigationMethod.LINK, minute: 13 },
  { person: 'Maya Chen', address: 'openlibrary.zz', method: NavigationMethod.LINK, minute: 15 },
  { person: 'Alex Morgan', address: 'quietmind.zz', method: NavigationMethod.LINK, minute: 17 },
  { person: 'Sofia Reyes', address: 'foodatlas.zz', method: NavigationMethod.LINK, minute: 18 },
  { person: 'Ethan Brooks', address: 'citygardens.zz', method: NavigationMethod.LINK, minute: 19 },
  { person: 'Noah Patel', address: 'riverside.zz', method: NavigationMethod.TYPED, minute: 20 },
  { person: 'Alex Morgan', address: 'openlibrary.zz', method: NavigationMethod.LINK, minute: 21 },
  { person: 'Maya Chen', address: 'tidepool.zz', method: NavigationMethod.HISTORY, minute: 23 },
  { person: 'Sofia Reyes', address: 'deepforest.zz', method: NavigationMethod.LINK, minute: 25 },
  { person: 'Alex Morgan', address: 'riverside.zz', method: NavigationMethod.LINK, minute: 26 },
  { person: 'Ethan Brooks', address: 'stargazer.zz', method: NavigationMethod.TYPED, minute: 27 },
  { person: 'Noah Patel', address: 'foodatlas.zz', method: NavigationMethod.LINK, minute: 28 },
  { person: 'Maya Chen', address: 'moonbase.zz', method: NavigationMethod.LINK, minute: 30 },
  { person: 'Alex Morgan', address: 'makershub.zz', method: NavigationMethod.LINK, minute: 31 },
  { person: 'Sofia Reyes', address: 'historylane.zz', method: NavigationMethod.LINK, minute: 33 },
  { person: 'Noah Patel', address: 'deepforest.zz', method: NavigationMethod.HISTORY, minute: 35 },
  { person: 'Alex Morgan', address: 'historylane.zz', method: NavigationMethod.LINK, minute: 36 },
  { person: 'Ethan Brooks', address: 'foodatlas.zz', method: NavigationMethod.LINK, minute: 38 },
  { person: 'Maya Chen', address: 'riverside.zz', method: NavigationMethod.TYPED, minute: 39 },
  { person: 'Alex Morgan', address: 'foodatlas.zz', method: NavigationMethod.SEARCH, minute: 42 },
  { person: 'Noah Patel', address: 'lostarchive.zz', method: NavigationMethod.LINK, minute: 44 },
  { person: 'Sofia Reyes', address: 'quietmind.zz', method: NavigationMethod.TYPED, minute: 46 },
  { person: 'Alex Morgan', address: 'tidepool.zz', method: NavigationMethod.BACK, minute: 48 },
  { person: 'Ethan Brooks', address: 'openlibrary.zz', method: NavigationMethod.SEARCH, minute: 50 },
  { person: 'Maya Chen', address: 'deepforest.zz', method: NavigationMethod.SEARCH, minute: 52 },
  { person: 'Alex Morgan', address: 'deepforest.zz', method: NavigationMethod.FORWARD, minute: 55 },
  { person: 'Noah Patel', address: 'tidepool.zz', method: NavigationMethod.LINK, minute: 57 },
  { person: 'Ethan Brooks', address: 'oldstation.zz', method: NavigationMethod.LINK, minute: 58 },
  { person: 'Sofia Reyes', address: 'makershub.zz', method: NavigationMethod.SEARCH, minute: 59 },
  { person: 'Alex Morgan', address: 'moonbase.zz', method: NavigationMethod.TYPED, minute: 60 },
];

async function seed() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is missing. Check your backend/.env file.');
  }

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB.');

  const PersonModel = mongoose.model(Person.name, PersonSchema);
  const SiteModel = mongoose.model(Site.name, SiteSchema);
  const VisitModel = mongoose.model(Visit.name, VisitSchema);

  // Create people if they do not already exist.
  const personIds = new Map<string, mongoose.Types.ObjectId>();

  for (const name of people) {
    const person = await PersonModel.findOneAndUpdate(
      { name },
      { $setOnInsert: { name } },
      { upsert: true, new: true, runValidators: true },
    );

    personIds.set(name, person._id as mongoose.Types.ObjectId);
  }

  console.log(`Prepared ${personIds.size} people.`);

  // Create or update the ten websites.
  const siteIds = new Map<
    string,
    { id: mongoose.Types.ObjectId; title: string }
  >();

  for (const website of websites) {
    const authorId = personIds.get(website.author);

    if (!authorId) {
      throw new Error(`Unknown author: ${website.author}`);
    }

    const linksHtml = website.links
      .map(
        (address) =>
          `<li><a href="http://${address}">${address}</a></li>`,
      )
      .join('');

    const paragraphsHtml = website.paragraphs
      .map((paragraph) => `<p>${paragraph}</p>`)
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${website.title}</title>
        </head>
        <body>
          <main>
            <h1>${website.title}</h1>
            ${paragraphsHtml}
            <h2>Explore related websites</h2>
            <ul>${linksHtml}</ul>
          </main>
        </body>
      </html>
    `;

    const $ = cheerio.load(html);
    $('script, style, noscript, template').remove();

    const searchableText = $('body')
      .text()
      .replace(/\s+/g, ' ')
      .trim();

    const site = await SiteModel.findOneAndUpdate(
      { address: website.address },
      {
        $set: {
          address: website.address,
          title: website.title,
          html,
          searchableText,
          authorId,
        },
      },
      { upsert: true, new: true, runValidators: true },
    );

    siteIds.set(website.address, {
      id: site._id as mongoose.Types.ObjectId,
      title: website.title,
    });
  }

  console.log(`Prepared ${siteIds.size} websites.`);

  // Replace only the generated history for these five seed people.
  const seededPersonIds = Array.from(personIds.values());

  await VisitModel.deleteMany({
    personId: { $in: seededPersonIds },
  });

  // The timeline always covers the same fixed hour.
  const startTime = new Date('2026-10-15T09:00:00.000Z');

  const visits = visitPlan.map((entry) => {
    const site = siteIds.get(entry.address);
    const personId = personIds.get(entry.person);

    if (!personId) {
      throw new Error(`Unknown browsing person: ${entry.person}`);
    }

    return {
      personId,
      address: entry.address,
      siteId: site?.id ?? null,
      title: site?.title,
      method: entry.method,
      status: site ? VisitStatus.FOUND : VisitStatus.NOT_FOUND,
      visitedAt: new Date(
        startTime.getTime() + entry.minute * 60 * 1000,
      ),
    };
  });

  await VisitModel.insertMany(visits);

  console.log(`Inserted ${visits.length} browsing visits.`);
  console.log('Seed completed successfully.');
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  });