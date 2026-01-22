import { createSeededRandom } from './seededRandom';

export type TypingMode = 'short' | 'medium' | 'long';

// Short paragraphs (1-2 sentences)
export const SHORT_PARAGRAPHS: string[] = [
  "The quick brown fox jumps over the lazy dog.",
  "Practice makes perfect when learning to type fast.",
  "A journey of a thousand miles begins with a single step.",
  "The early bird catches the worm, but the second mouse gets the cheese.",
  "Time flies when you are having fun with friends and family.",
  "Actions speak louder than words in every situation.",
  "Knowledge is power, and learning never stops.",
  "Every cloud has a silver lining waiting to be discovered.",
  "The pen is mightier than the sword in skilled hands.",
  "Where there is a will, there is always a way forward.",
  "Good things come to those who wait patiently.",
  "Life is what happens when you are busy making other plans.",
  "The best time to plant a tree was twenty years ago.",
  "Fortune favors the bold and the prepared mind.",
  "Simplicity is the ultimate form of sophistication.",
  "Change is the only constant in our ever-evolving world.",
  "Creativity takes courage and a willingness to fail.",
  "Success is not final, failure is not fatal.",
  "The only way to do great work is to love what you do.",
  "In the middle of difficulty lies hidden opportunity.",
  "Dream big and dare to fail along the way.",
  "Stay hungry, stay foolish, and keep learning.",
  "Quality is not an act, it is a habit we develop.",
  "The future belongs to those who believe in their dreams.",
  "Happiness depends upon ourselves and our choices.",
  "Be yourself; everyone else is already taken.",
  "What we think, we become over time.",
  "The mind is everything; what you think you become.",
  "Strive not to be a success, but rather to be of value.",
  "It is never too late to be what you might have been."
];

// Medium paragraphs (original - 2-3 sentences)
export const MEDIUM_PARAGRAPHS: string[] = [
  "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet and has been used for typing practice for many years. It remains a classic test of keyboard skills.",
  
  "Technology has transformed the way we live, work, and communicate with each other. From smartphones to artificial intelligence, innovations continue to reshape our daily experiences in ways we could never have imagined.",
  
  "The ocean covers more than seventy percent of the Earth's surface. Beneath the waves lies a vast and mysterious world filled with incredible creatures that scientists are still working to understand and document.",
  
  "Reading books opens doors to new worlds and perspectives. Whether fiction or non-fiction, the written word has the power to educate, inspire, and transport us to places we have never been before.",
  
  "Music has been a fundamental part of human culture for thousands of years. From ancient drums to modern electronic compositions, we continue to find new ways to create and enjoy rhythmic sounds together.",
  
  "The art of cooking brings people together around shared meals and traditions. Every culture has its unique flavors and recipes that tell stories of history, geography, and the people who created them.",
  
  "Exercise is essential for maintaining good physical and mental health. Regular activity helps strengthen our bodies, boost our mood, and improve our overall quality of life in countless ways.",
  
  "Space exploration has revealed countless wonders about our universe. From the first Moon landing to modern Mars rovers, humanity continues to push the boundaries of what we can discover and achieve.",
  
  "Learning a new language opens opportunities for connection and understanding. It challenges our minds and allows us to experience different cultures in ways that translation alone cannot provide.",
  
  "The changing seasons bring beauty and variety to our natural world. Spring flowers give way to summer warmth, autumn colors paint the landscape, and winter snow blankets everything in white.",
  
  "Photography captures moments in time that would otherwise be lost forever. Whether professional or amateur, photographers preserve memories and share perspectives that words alone cannot express.",
  
  "Coffee has become one of the most popular beverages in the world. From its origins in Ethiopia to modern specialty roasters, the drink has a rich history and a devoted following of enthusiasts.",
  
  "Gardens provide spaces for relaxation, beauty, and connection with nature. Whether growing vegetables or flowers, the act of nurturing plants brings satisfaction and peace to many people around the world.",
  
  "Architecture shapes the spaces where we live, work, and play. The design of buildings reflects cultural values, technological capabilities, and artistic visions that leave lasting marks on our communities.",
  
  "Writing helps us organize our thoughts and communicate ideas effectively. From personal journals to professional documents, the skill of putting words on paper is valuable in nearly every aspect of life.",
  
  "Mountains stand as majestic reminders of the powerful forces that have shaped our planet. Climbers and hikers are drawn to their peaks, seeking adventure, challenge, and breathtaking views from above.",
  
  "The history of art reflects the evolution of human thought and expression. From cave paintings to digital creations, artists have always found ways to capture and share their unique visions of the world.",
  
  "Sleep is crucial for our physical health and cognitive function. During rest, our bodies repair themselves and our minds process the experiences and information gathered throughout the waking day.",
  
  "Rivers have served as lifelines for civilizations throughout history. They provide water for drinking and agriculture, routes for transportation, and habitats for countless species of plants and animals.",
  
  "The internet has revolutionized how we access information and connect with others. In just a few decades, it has become an essential part of modern life, changing everything from commerce to communication.",
  
  "Forests are vital ecosystems that support biodiversity and help regulate our climate. Trees produce oxygen, absorb carbon dioxide, and provide habitats for countless species of wildlife.",
  
  "Chess is a game of strategy that has challenged minds for centuries. Players must think several moves ahead, anticipating their opponent's responses while crafting their own path to victory.",
  
  "The human brain is the most complex organ in our bodies. It controls everything from our movements to our emotions, processes information constantly, and enables us to think, dream, and create.",
  
  "Sustainable practices are becoming more important as we face environmental challenges. From renewable energy to recycling, small changes in behavior can add up to make a significant positive impact.",
  
  "Museums preserve and display artifacts from human history and natural science. They serve as educational resources and cultural touchstones, connecting us to our past and inspiring future generations.",
  
  "The craft of pottery dates back thousands of years to ancient civilizations. Working with clay requires patience and skill, transforming simple earth into functional and beautiful objects by hand.",
  
  "Birds migrate thousands of miles each year following seasonal patterns. Their journeys are remarkable feats of endurance and navigation, guided by instincts we are only beginning to understand.",
  
  "Friendship enriches our lives with companionship, support, and shared experiences. Good friends celebrate our successes, comfort us during difficulties, and make ordinary moments more meaningful.",
  
  "Innovation drives progress in every field of human endeavor. From scientific breakthroughs to artistic movements, new ideas and approaches continually push the boundaries of what is possible.",
  
  "The night sky has fascinated humanity since the dawn of civilization. Stars, planets, and galaxies inspire wonder and curiosity, prompting us to ask questions about our place in the universe.",
  
  "Yoga combines physical postures with breathing exercises and meditation. Practitioners report benefits including improved flexibility, reduced stress, and greater awareness of body and mind connection.",
  
  "Teamwork enables groups to accomplish more than individuals working alone. When people collaborate effectively, they combine diverse skills and perspectives to solve problems and achieve shared goals.",
  
  "The written word has been preserved through many forms over centuries. From scrolls to printed books to digital files, each new technology has helped spread knowledge to wider audiences.",
  
  "Climate patterns influence agriculture, wildlife behavior, and human activities. Understanding weather systems helps us prepare for seasonal changes and extreme events that affect our daily lives.",
  
  "Creativity is a fundamental human trait that drives artistic expression and problem solving. Whether painting, writing, or inventing, creative thinking allows us to imagine and build new possibilities.",
  
  "Handwriting remains a valuable skill despite the prevalence of digital communication. The act of writing by hand engages the brain differently than typing, aiding memory and personal expression.",
  
  "Cultural traditions connect us to our heritage and give meaning to celebrations. From holiday rituals to everyday customs, these practices help define our identities and strengthen community bonds.",
  
  "The pursuit of knowledge has driven human advancement throughout history. Scientists, scholars, and curious individuals continue to explore, question, and discover new truths about our world.",
  
  "Public parks provide essential green spaces in urban environments. They offer places for recreation, relaxation, and gathering, improving the quality of life for city residents of all ages.",
  
  "Communication skills are essential for success in personal and professional relationships. Being able to express ideas clearly and listen actively leads to better understanding and collaboration."
];

// Long paragraphs (multiple paragraphs combined)
export const LONG_PARAGRAPHS: string[] = [
  "The history of human civilization is marked by remarkable achievements in science, art, and technology. From the ancient pyramids of Egypt to the modern skyscrapers of today, we have continuously pushed the boundaries of what is possible. Each generation builds upon the knowledge and discoveries of those who came before, creating an ever-growing foundation of understanding. The printing press revolutionized the spread of information, while the internet has connected billions of people across the globe. These innovations have transformed not only how we communicate but also how we learn, work, and interact with one another.\n\nAs we look to the future, new challenges and opportunities await. Climate change demands innovative solutions, while advances in artificial intelligence promise to reshape entire industries. The choices we make today will determine the world we leave for future generations. By learning from our past and embracing the spirit of discovery, we can continue to build a better tomorrow for all of humanity.",

  "The natural world is filled with wonders that continue to amaze scientists and explorers alike. Deep beneath the ocean waves, creatures thrive in conditions that seem impossible for life to exist. In the dense rainforests of the Amazon, new species are still being discovered each year. The delicate balance of ecosystems demonstrates how interconnected all living things truly are. From the smallest microorganisms to the largest whales, every creature plays a role in maintaining the health of our planet.\n\nUnderstanding and protecting biodiversity has become one of the most important challenges of our time. As habitats shrink and species face extinction, conservation efforts work to preserve what remains. National parks and wildlife reserves provide sanctuaries where nature can flourish. Scientists study these environments to learn how we can better coexist with the natural world. Through education and awareness, more people are recognizing the importance of environmental stewardship.",

  "The evolution of transportation has dramatically changed how humans experience the world. In ancient times, travel was slow and dangerous, with most people never venturing far from their birthplace. The domestication of horses and the invention of the wheel marked major advances in mobility. Sailing ships opened up global trade routes, connecting distant civilizations for the first time. The steam engine powered the industrial revolution, enabling trains to cross continents in days rather than months.\n\nThe twentieth century brought even more revolutionary changes with the automobile and airplane. Suddenly, distances that once seemed insurmountable could be covered in hours. Today, we can travel anywhere in the world within a day, and space travel has become a reality. Looking ahead, electric vehicles and sustainable transportation solutions promise to make travel cleaner and more efficient. The way we move continues to evolve, shaping our cities, economies, and daily lives.",

  "Education has always been fundamental to human progress and personal development. In ancient civilizations, knowledge was often passed down through oral traditions and apprenticeships. The establishment of universities in medieval Europe created centers of learning that attracted scholars from around the world. Over centuries, education gradually became more accessible, moving from a privilege of the elite to a right for all citizens. Today, schools and universities exist in nearly every country, providing opportunities for millions to learn and grow.\n\nThe digital age has transformed education in unprecedented ways. Online courses make it possible to learn from the best teachers regardless of geographic location. Interactive technologies create engaging experiences that adapt to individual learning styles. Students can access vast libraries of information with a few clicks. However, challenges remain in ensuring equal access to quality education for all. As we continue to innovate, the goal remains the same: empowering every person to reach their full potential through knowledge and learning.",

  "The art of storytelling is as old as humanity itself, serving as a way to share knowledge, preserve culture, and entertain. Around ancient campfires, our ancestors told tales of great hunts, mythical creatures, and the origins of the world. These stories helped explain natural phenomena and transmit important values from one generation to the next. As civilizations developed, storytelling evolved into epic poems, theatrical performances, and written literature. The invention of the printing press made books available to wider audiences than ever before.\n\nIn the modern era, storytelling has expanded into new mediums including film, television, video games, and social media. Despite these technological changes, the fundamental elements of a good story remain constant: compelling characters, meaningful conflict, and emotional resonance. Stories continue to shape our understanding of the world and our place in it. They allow us to experience lives different from our own and develop empathy for others. Whether told around a fire or streamed on a screen, stories remain central to the human experience.",

  "The science of the human mind has fascinated philosophers and researchers for centuries. Early thinkers pondered questions about consciousness, memory, and emotion without the tools to investigate the brain directly. The development of psychology as a formal discipline in the late nineteenth century marked a turning point in our understanding of mental processes. Sigmund Freud explored the unconscious mind, while behaviorists focused on observable actions. Cognitive psychology later emerged to study how we think, learn, and remember.\n\nModern neuroscience has revealed incredible details about how the brain functions at the cellular and molecular level. Brain imaging technologies allow researchers to observe neural activity in real time. We now know that the brain is remarkably plastic, capable of reorganizing itself throughout life. Mental health awareness has grown significantly, reducing stigma and improving treatment options. As research continues, we are gaining deeper insights into conditions ranging from depression to Alzheimer's disease. Understanding the mind remains one of the greatest frontiers of scientific discovery.",

  "Music has been a universal language throughout human history, transcending cultural and linguistic barriers. Archaeological evidence suggests that humans have been making music for at least forty thousand years. From simple drums and flutes to complex orchestral compositions, musical expression has taken countless forms. Different cultures have developed unique traditions, scales, and instruments that reflect their values and experiences. Music has served many purposes: celebrating victories, mourning losses, expressing love, and bringing communities together.\n\nThe technology of music has undergone revolutionary changes, especially in the last century. The ability to record and reproduce sound transformed music from a live experience to something that could be captured and shared across time and space. Radio and television brought music into homes around the world. Digital technology has democratized music creation, allowing anyone with a computer to produce professional-quality recordings. Streaming services provide instant access to millions of songs from every genre and era. Yet despite all these changes, the power of music to move us emotionally remains as strong as ever.",

  "The exploration of space represents one of humanity's greatest achievements and ongoing aspirations. When the Soviet Union launched Sputnik in 1957, it marked the beginning of the space age. The following decades saw remarkable accomplishments: the first human in space, the Moon landings, and the establishment of space stations orbiting Earth. Probes have visited every planet in our solar system and even ventured into interstellar space. Telescopes like Hubble have revealed the breathtaking beauty and immense scale of the universe.\n\nToday, space exploration is entering a new era with private companies joining government agencies in pushing boundaries. Reusable rockets have dramatically reduced launch costs, making space more accessible than ever. Plans are underway for returning humans to the Moon and eventually sending astronauts to Mars. Satellites provide essential services including navigation, communication, and weather monitoring. The search for life beyond Earth continues through missions to Mars and investigations of ocean moons like Europa. As we look up at the stars, the possibilities seem limitless.",

  "The global economy is a complex interconnected system that affects billions of lives every day. Trade between nations has existed for thousands of years, from ancient silk roads to modern shipping containers crossing oceans. The industrial revolution transformed economies from agricultural to manufacturing bases, creating new forms of wealth and employment. The twentieth century saw the rise of multinational corporations and international financial institutions. Globalization has accelerated the flow of goods, services, and capital across borders.\n\nEconomic systems continue to evolve in response to new challenges and opportunities. The digital economy has created entirely new industries while disrupting traditional ones. Debates continue about how to balance growth with sustainability and how to address inequality within and between nations. Financial crises remind us of the risks inherent in complex systems. Meanwhile, emerging economies are lifting millions out of poverty and changing the global balance of power. Understanding economics helps us make sense of the forces that shape our material lives and the choices available to societies.",

  "The development of medicine has dramatically improved human health and longevity over the centuries. Ancient healers relied on herbs, rituals, and observation to treat ailments. The discovery of germs and the development of antiseptic techniques in the nineteenth century revolutionized surgery and reduced countless deaths from infection. Vaccines have eliminated or controlled diseases that once killed millions. Antibiotics provided powerful tools against bacterial infections, while advances in surgery have made it possible to repair hearts, transplant organs, and remove tumors.\n\nModern medicine continues to advance at an remarkable pace. Genetic research promises personalized treatments tailored to individual patients. New imaging technologies allow doctors to see inside the body with unprecedented detail. Robotic surgery enables procedures with greater precision than human hands alone. Telemedicine expands access to healthcare for people in remote areas. Yet challenges remain, including antibiotic resistance, emerging diseases, and ensuring that medical advances reach all who need them. The quest to understand and heal the human body continues to drive innovation and save lives."
];

// Keep backward compatibility with original name
export const TYPING_PARAGRAPHS = MEDIUM_PARAGRAPHS;

/**
 * Get a random paragraph for the typing test
 * @param seed Optional seed for deterministic selection (for daily challenges)
 * @param mode The length mode: 'short', 'medium', or 'long'
 * @returns A randomly selected paragraph
 */
export function getRandomParagraph(seed?: string, mode: TypingMode = 'medium'): string {
  const paragraphs = mode === 'short' ? SHORT_PARAGRAPHS 
    : mode === 'long' ? LONG_PARAGRAPHS 
    : MEDIUM_PARAGRAPHS;
  
  if (seed) {
    const random = createSeededRandom(seed + '-typing-' + mode);
    const index = Math.floor(random() * paragraphs.length);
    return paragraphs[index];
  }
  const index = Math.floor(Math.random() * paragraphs.length);
  return paragraphs[index];
}

/**
 * Calculate words per minute (WPM)
 * Standard: 5 characters = 1 word
 * @param charactersTyped Number of correctly typed characters
 * @param timeInSeconds Time taken in seconds
 * @returns WPM rounded to nearest integer
 */
export function calculateWPM(charactersTyped: number, timeInSeconds: number): number {
  if (timeInSeconds === 0) return 0;
  const words = charactersTyped / 5;
  const minutes = timeInSeconds / 60;
  return Math.round(words / minutes);
}

/**
 * Calculate typing accuracy
 * @param correctChars Number of correctly typed characters
 * @param totalChars Total characters typed (including mistakes)
 * @returns Accuracy as a percentage (0-100)
 */
export function calculateAccuracy(correctChars: number, totalChars: number): number {
  if (totalChars === 0) return 100;
  return Math.round((correctChars / totalChars) * 100);
}