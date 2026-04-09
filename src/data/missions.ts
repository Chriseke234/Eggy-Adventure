export interface Mission {
  id: string;
  name: string;
  context: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Legendary';
  intro: string;
  state: string;
  category: 'History' | 'Geography' | 'Art' | 'Culture' | 'Civics' | 'Innovation';
}

export const MISSIONS: Mission[] = [
  // RIVERS
  {
    id: 'rivers_01',
    state: 'Rivers',
    category: 'Culture',
    name: 'Hatch a Kalabari Masquerade',
    context: 'The Kalabari people of the Niger Delta have beautiful water-spirit masquerades with colorful textiles and wooden masks.',
    difficulty: 'Intermediate',
    intro: 'Eggy says: Ready to dive into the Niger Delta? Let’s bring a water spirit to life!'
  },
  {
    id: 'rivers_02',
    state: 'Rivers',
    category: 'Innovation',
    name: "Design Eggy's Fishing Boat",
    context: 'Many people in Rivers State travel in boats. These canoes are symbols of life and work in the creeks.',
    difficulty: 'Beginner',
    intro: 'Eggy says: Hop in! We need a sturdy boat for our adventure in the Delta creeks!'
  },
  
  // LAGOS
  {
    id: 'lagos_01',
    state: 'Lagos',
    category: 'History',
    name: 'Paint the Eyo Festival',
    context: 'The Eyo Festival (Adamun Orisha Play) features masquerades in white robes and wide-brimmed hats called Agogoro.',
    difficulty: 'Advanced',
    intro: 'Eggy says: Listen to the bells! The Eyo are coming. Let’s capture the magic of Lagos.'
  },
  {
    id: 'lagos_02',
    state: 'Lagos',
    category: 'Innovation',
    name: 'Build a Danfo Bus',
    context: 'Danfo buses are yellow with black stripes. They are the heart and soul of transportation in busy Lagos streets.',
    difficulty: 'Intermediate',
    intro: 'Eggy says: Owa o! Let’s build the most colorful Danfo Lagos has ever seen!'
  },

  // KANO
  {
    id: 'kano_01',
    state: 'Kano',
    category: 'History',
    name: 'Decorate the Emir’s Palace',
    context: 'Kano is famous for its ancient walls and the beautiful Palace of the Emir, decorated with traditional Hausa architecture.',
    difficulty: 'Intermediate',
    intro: 'Eggy says: Welcome to the ancient city! Let’s help decorate the Emir’s magnificent palace.'
  },
  {
    id: 'kano_02',
    state: 'Kano',
    category: 'Art',
    name: 'Dye a Royal Robe',
    context: 'The Kofar Mata Dye Pits are over 500 years old! They use natural indigo to create stunning patterns on fabric.',
    difficulty: 'Beginner',
    intro: 'Eggy says: Let’s get messy! We’re going to dye some royal robes in the famous indigo pits.'
  },

  // ENUGU
  {
    id: 'enugu_01',
    state: 'Enugu',
    category: 'Geography',
    name: 'Explore the Nike Lake',
    context: 'Enugu, the Coal City, has beautiful landscapes like Nike Lake, a peaceful water body surrounded by green hills.',
    difficulty: 'Beginner',
    intro: 'Eggy says: The air is so fresh here! Let’s take a walk around the serene Nike Lake.'
  },
  {
    id: 'enugu_02',
    state: 'Enugu',
    category: 'Art',
    name: 'Carve a Coal Statue',
    context: 'Enugu was built on coal mining. Artisans often carve beautiful figures out of this "black gold".',
    difficulty: 'Intermediate',
    intro: 'Eggy says: Let’s celebrate the Coal City! We’re going to carve a special statue from coal.'
  },

  // ABUJA
  {
    id: 'abuja_01',
    state: 'Abuja',
    category: 'Geography',
    name: 'Snap Zuma Rock',
    context: 'Zuma Rock is a massive natural monolith that stands like a giant gateway to Abuja, Nigeria’s capital.',
    difficulty: 'Beginner',
    intro: 'Eggy says: Look at the size of that! Zuma Rock is watching over us. Let’s take its picture!'
  },
  {
    id: 'abuja_02',
    state: 'Abuja',
    category: 'Civics',
    name: 'Design the National Mosque',
    context: 'The National Mosque is a stunning landmark with its golden domes and minarets that shine in the sun.',
    difficulty: 'Advanced',
    intro: 'Eggy says: So much gold! Let’s help design a beautiful new tile pattern for the mosque.'
  }
];
