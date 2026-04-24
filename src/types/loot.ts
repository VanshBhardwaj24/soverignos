export interface LootModifier {
  type: 'streak_shield' | 'xp_boost_next' | 'xp_booster_2h' | 'quest_skip';
  boostStatId?: string;
  label: string;
}

export interface LootDrop {
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  gc: number;
  modifiers: LootModifier[];
}
