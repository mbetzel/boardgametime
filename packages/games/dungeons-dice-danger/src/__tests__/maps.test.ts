import { describe, expect, it } from 'vitest';
import { ALL_MAPS, getMapDefinition } from '../maps';

describe('DungeonsDiceDanger Maps', () => {
  it('loads all 4 official map definitions correctly', () => {
    expect(Object.keys(ALL_MAPS).length).toBe(4);

    const map1 = getMapDefinition('annoyed-animals');
    expect(map1.id).toBe('annoyed-animals');
    expect(map1.startCellIds.length).toBeGreaterThan(0);

    const map2 = getMapDefinition('clumsy-cultists');
    expect(map2.id).toBe('clumsy-cultists');

    const map3 = getMapDefinition('puzzled-pyramid');
    expect(map3.id).toBe('puzzled-pyramid');

    const map4 = getMapDefinition('defiant-dinosaurs');
    expect(map4.id).toBe('defiant-dinosaurs');
  });
});
