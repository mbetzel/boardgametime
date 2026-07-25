import { DungeonMapDefinition, GameScoringSummary, PlayerScoringBreakdown, PlayerSheetState } from './types';

export function calculatePlayerScoring(
  player: PlayerSheetState,
  mapDef: DungeonMapDefinition,
  allPlayerStates: Record<string, PlayerSheetState>
): PlayerScoringBreakdown {
  // Gems: 3 VP per gem
  const gemsPoints = player.gems * 3;

  // Gold: 2 VP per gold
  const goldPoints = player.gold * 2;

  // Defeated Monsters VP (monsters defeated by this player)
  let monsterPoints = 0;
  player.defeatedMonsterIds.forEach((mId) => {
    const mDef = mapDef.monsters[mId];
    if (mDef && !mDef.isBoss) {
      monsterPoints += mDef.rewardGems * 3;
    }
  });

  // Boss damage scoring (Errata rule: 1 gem / 3 VP per 3 damage dealt if not first to defeat boss or if boss undefeated)
  let bossDamagePoints = 0;
  Object.values(mapDef.monsters).forEach((mDef) => {
    if (mDef.isBoss) {
      const damageDealt = player.damagedMonsterBoxes[mDef.id]?.length || 0;
      const isDefeatedByPlayer = player.defeatedMonsterIds.includes(mDef.id);

      if (isDefeatedByPlayer) {
        bossDamagePoints += mDef.rewardGems * 3;
      } else {
        // 1 gem (3 VP) per 3 damage
        const gemsEarned = Math.floor(damageDealt / 3);
        bossDamagePoints += gemsEarned * 3;
      }
    }
  });

  // Skulls penalty
  const skullPenalties = player.skullsCrossed * 1;

  const totalVP = gemsPoints + goldPoints + monsterPoints + bossDamagePoints - skullPenalties;

  return {
    gemsPoints,
    goldPoints,
    monsterPoints,
    bossDamagePoints,
    skullPenalties,
    totalVP,
  };
}

export function scoreGame(
  playerStates: Record<string, PlayerSheetState>,
  mapDef: DungeonMapDefinition
): GameScoringSummary {
  const breakdown: Record<string, PlayerScoringBreakdown> = {};
  const scores: Record<string, number> = {};
  let highestScore = -Infinity;
  let winnerPlayerId: string | null = null;

  Object.entries(playerStates).forEach(([pid, pState]) => {
    const pBreakdown = calculatePlayerScoring(pState, mapDef, playerStates);
    breakdown[pid] = pBreakdown;
    scores[pid] = pBreakdown.totalVP;

    if (pBreakdown.totalVP > highestScore) {
      highestScore = pBreakdown.totalVP;
      winnerPlayerId = pid;
    }
  });

  return {
    scores,
    breakdown,
    winnerPlayerId,
  };
}
