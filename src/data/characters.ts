import type { CharacterInfo, DanceTier } from '../types';

export const CHARACTERS: readonly [string, string, string][] = [
  ['🐭', 'Mickey Mouse', 'Mickey Mouse'], ['🎀', 'Minnie Mouse', 'Mickey Mouse'], ['🦆', 'Donald Duck', 'Donald Duck'], ['🐶', 'Goofy', 'Mickey Mouse'], ['🐿️', 'Chip', "Chip 'n' Dale"],
  ['🐿️', 'Dale', "Chip 'n' Dale"], ['🦁', 'Simba', 'The Lion King'], ['🦁', 'Nala', 'The Lion King'], ['🧞', 'Genie', 'Aladdin'], ['🧜‍♀️', 'Ariel', 'The Little Mermaid'],
  ['🐱', 'Tom', 'Tom and Jerry'], ['🐭', 'Jerry', 'Tom and Jerry'], ['🐰', 'Bugs Bunny', 'Looney Tunes'], ['🦆', 'Daffy Duck', 'Looney Tunes'], ['🐤', 'Tweety', 'Looney Tunes'],
  ['🐱', 'Sylvester', 'Looney Tunes'], ['🐆', 'Pink Panther', 'The Pink Panther'], ['🐶', 'Scooby-Doo', 'Scooby-Doo'], ['🧑', 'Shaggy', 'Scooby-Doo'], ['🐻', 'Yogi Bear', 'Yogi Bear'],
  ['🤖', 'Doraemon', 'Doraemon'], ['👦', 'Nobita', 'Doraemon'], ['👧', 'Shizuka', 'Doraemon'], ['👦', 'Gian', 'Doraemon'], ['👦', 'Suneo', 'Doraemon'],
  ['😜', 'Shinchan', 'Crayon Shin-chan'], ['🐶', 'Shiro', 'Crayon Shin-chan'], ['⚡', 'Pikachu', 'Pokémon'], ['👦', 'Ash Ketchum', 'Pokémon'], ['🐲', 'Goku', 'Dragon Ball'],
  ['👦', 'Ben Tennyson', 'Ben 10'], ['👧', 'Gwen Tennyson', 'Ben 10'], ['👽', 'Four Arms', 'Ben 10'], ['👧', 'Blossom', 'The Powerpuff Girls'], ['🫧', 'Bubbles', 'The Powerpuff Girls'],
  ['💚', 'Buttercup', 'The Powerpuff Girls'], ['🧪', 'Dexter', "Dexter's Laboratory"], ['🐕', 'Courage', 'Courage the Cowardly Dog'], ['🐱', 'Gumball', 'The Amazing World of Gumball'], ['🐟', 'Darwin', 'The Amazing World of Gumball'],
  ['🐶', 'Bluey', 'Bluey'], ['🐶', 'Bingo', 'Bluey'], ['🧽', 'SpongeBob', 'SpongeBob SquarePants'], ['⭐', 'Patrick Star', 'SpongeBob SquarePants'], ['🦑', 'Squidward', 'SpongeBob SquarePants'],
  ['🦀', 'Mr. Krabs', 'SpongeBob SquarePants'], ['🐷', 'Peppa Pig', 'Peppa Pig'], ['🐷', 'George Pig', 'Peppa Pig'], ['👦', 'Phineas', 'Phineas and Ferb'], ['👦', 'Ferb', 'Phineas and Ferb'],
  ['💪', 'Chhota Bheem', 'Chhota Bheem'], ['👦', 'Raju', 'Chhota Bheem'], ['🐒', 'Jaggu', 'Chhota Bheem'], ['👦', 'Kalia', 'Chhota Bheem'], ['👦', 'Dholu', 'Chhota Bheem'],
  ['👦', 'Bholu', 'Chhota Bheem'], ['🥋', 'Motu', 'Motu Patlu'], ['👓', 'Patlu', 'Motu Patlu'], ['🐶', 'Ghasitaram', 'Motu Patlu'], ['👮', 'Inspector Chingum', 'Motu Patlu'],
  ['🐱', 'Oggy', 'Oggy and the Cockroaches'], ['🪳', 'Joey', 'Oggy and the Cockroaches'], ['🪳', 'Marky', 'Oggy and the Cockroaches'], ['🪳', 'Dee Dee', 'Oggy and the Cockroaches'], ['👦', 'Little Singham', 'Little Singham'],
  ['🦸', 'Mighty Raju', 'Mighty Raju'], ['🐒', 'Rudra', 'Rudra'], ['👦', 'Gattu', 'Gattu Battu'], ['👦', 'Battu', 'Gattu Battu'], ['🐘', 'Appu', 'Appu'],
  ['🦇', 'Batman', 'Batman'], ['🕷️', 'Spider-Man', 'Spider-Man'], ['🦸', 'Superman', 'Superman'], ['🛡️', 'Captain America', 'Marvel Animated Series'], ['🤖', 'Iron Man', 'Iron Man'],
  ['🐢', 'Leonardo', 'Teenage Mutant Ninja Turtles'], ['🐢', 'Michelangelo', 'Teenage Mutant Ninja Turtles'], ['🐢', 'Raphael', 'Teenage Mutant Ninja Turtles'], ['🐢', 'Donatello', 'Teenage Mutant Ninja Turtles'], ['🥷', 'Naruto', 'Naruto'],
  ['❄️', 'Elsa', 'Frozen'], ['👸', 'Anna', 'Frozen'], ['⛄', 'Olaf', 'Frozen'], ['🧸', 'Winnie the Pooh', 'Winnie the Pooh'], ['🐷', 'Piglet', 'Winnie the Pooh'],
  ['👹', 'Shrek', 'Shrek'], ['🫏', 'Donkey', 'Shrek'], ['🐉', 'Toothless', 'How to Train Your Dragon'], ['🤖', 'WALL-E', 'WALL-E'], ['👨‍🚀', 'Buzz Lightyear', 'Toy Story'],
  ['🤠', 'Woody', 'Toy Story'], ['👨‍🚀', 'Baymax', 'Big Hero 6'], ['🐱', 'Garfield', 'Garfield'], ['🐶', 'Snoopy', 'Peanuts'], ['⚓', 'Popeye', 'Popeye'],
  ['🐻', 'Baloo', 'The Jungle Book'], ['🐻', 'Balu', 'The Jungle Book'], ['🐦', 'Woody Woodpecker', 'Woody Woodpecker'], ['🐰', 'Judy Hopps', 'Zootopia'], ['🦊', 'Nick Wilde', 'Zootopia'],
  ['🐼', 'Po', 'Kung Fu Panda'], ['🟡', 'Minion', 'Despicable Me'], ['👓', 'Kevin', 'Minions'], ['🎸', 'Stuart', 'Minions'], ['🐶', 'Spike', 'Tom and Jerry'],
  ['🐶', 'Tyke', 'Tom and Jerry'], ['🐦', 'Road Runner', 'Looney Tunes'], ['🐺', 'Wile E. Coyote', 'Looney Tunes'], ['🪨', 'Fred Flintstone', 'The Flintstones'], ['🧔', 'Barney Rubble', 'The Flintstones'],
  ['🚀', 'George Jetson', 'The Jetsons'], ['😎', 'Johnny Bravo', 'Johnny Bravo'], ['⚔️', 'Samurai Jack', 'Samurai Jack'], ['🌪️', 'Aang', 'Avatar: The Last Airbender'], ['🦚', 'Krishna', 'Little Krishna'],
  ['🏹', 'Arjun', 'Mahabharat'], ['🙏', 'Hanuman', 'Hanuman'], ['📜', 'Tenali Raman', 'Tenali Raman'], ['👑', 'Akbar', 'Akbar Birbal'], ['🧠', 'Birbal', 'Akbar Birbal'],
  ['😅', 'Suppandi', 'Suppandi'], ['🦸‍♂️', 'Shaktimaan', 'Shaktimaan'], ['🐸', 'Kermit', 'The Muppets'], ['🐷', 'Miss Piggy', 'The Muppets'],
];

export const AV_GRADS: readonly [string, string][] = [
  ['#ff5c7a', '#ff9f43'], ['#f7b731', '#fc4a1a'], ['#2ed573', '#1abc9c'], ['#54a0ff', '#7d5ba6'], ['#a55eea', '#ff6b81'],
  ['#00b8c4', '#54a0ff'], ['#ff6b81', '#a55eea'], ['#ffa502', '#ff6348'], ['#1dd1a1', '#10ac84'], ['#5f27cd', '#341f97'],
  ['#ff9ff3', '#f368e0'], ['#48dbfb', '#0abde3'], ['#feca57', '#ff9f43'], ['#ff6b6b', '#ee5253'], ['#1abc9c', '#16a085'],
  ['#e056fd', '#686de0'], ['#7ed6df', '#3dc1d3'], ['#e77f67', '#cf6a87'], ['#786fa6', '#574b90'], ['#f8a5c2', '#f78fb3'],
];

export function charFor(adno: number | string): CharacterInfo {
  const n = Math.abs(parseInt(String(adno), 10) || 0);
  const ci = n % CHARACTERS.length;
  const gi = Math.floor(n / CHARACTERS.length) % AV_GRADS.length;
  const c = CHARACTERS[ci];
  return {
    emoji: c[0],
    name: c[1],
    cartoon: c[2],
    grad: AV_GRADS[gi],
    num: ci + 1,
  };
}

export function avatarDesc(adno: number | string): string {
  const c = charFor(adno);
  return `${c.name} — ${c.cartoon} (character #${c.num} of ${CHARACTERS.length})`;
}

export function danceTier(pct: number): DanceTier {
  if (pct < 10) return 'cry';
  if (pct < 50) return 'regret';
  if (pct < 90) return 'smile';
  return 'mega';
}
