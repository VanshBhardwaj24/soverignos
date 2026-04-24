import type { LootDrop, LootModifier } from '../types/loot';

export function rollLootDrop(): LootDrop {
  const roll = Math.random() * 100;
  let rarity: LootDrop['rarity'] = 'common';
  let gc = 0;
  let modifiers: LootModifier[] = [];

  const stats = ['code', 'wealth', 'body', 'mind', 'brand', 'network'];
  const randomStat = stats[Math.floor(Math.random() * stats.length)];

  if (roll < 1) { // 1%
    rarity = 'legendary';
    gc = Math.floor(Math.random() * 401) + 400; // 400-800
    modifiers = [
      { type: 'streak_shield', label: 'Streak Shield (1-day miss protection)' },
      { type: 'xp_boost_next', boostStatId: randomStat, label: `+2× XP on next ${randomStat.toUpperCase()} session` },
      { type: 'xp_booster_2h', label: '+3× XP for 2h (Booster)' },
      { type: 'quest_skip', label: '+1 Free Quest Skip' }
    ];
  } else if (roll < 7) { // 6%
    rarity = 'epic';
    gc = Math.floor(Math.random() * 251) + 250; // 250-500
    modifiers = [
      { type: 'xp_booster_2h', label: '+3× XP for 2h (Booster)' }
    ];
  } else if (roll < 22) { // 15%
    rarity = 'rare';
    gc = Math.floor(Math.random() * 151) + 150; // 150-300
    modifiers = [
      { type: 'xp_boost_next', boostStatId: randomStat, label: `+2× XP on next ${randomStat.toUpperCase()} session` }
    ];
  } else if (roll < 50) { // 28%
    rarity = 'uncommon';
    gc = Math.floor(Math.random() * 101) + 100; // 100-200
    modifiers = [
      { type: 'streak_shield', label: 'Streak Shield (1-day miss protection)' }
    ];
  } else { // 50%
    rarity = 'common';
    gc = Math.floor(Math.random() * 51) + 50; // 50-100
  }

  return { rarity, gc, modifiers };
}
