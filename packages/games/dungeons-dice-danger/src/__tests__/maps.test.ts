import { describe, expect, it } from 'vitest';
import { ALL_MAPS, getMapDefinition } from '../maps';

describe('DungeonsDiceDanger Maps', () => {
  it('loads all 4 official map definitions correctly', () => {
    expect(Object.keys(ALL_MAPS).length).toBe(4);

    const map1 = getMapDefinition('annoyed-animals');
    expect(map1.id).toBe('annoyed-animals');
    expect(map1.startCellIds.length).toBe(11);
    expect(Object.keys(map1.cells).length).toBeGreaterThan(0);

    const cellsList = Object.values(map1.cells);
    // Verify graph integrity: all connectedCellIds must exist
    cellsList.forEach((cell) => {
      cell.connectedCellIds.forEach((targetId) => {
        expect(map1.cells[targetId]).toBeDefined();
      });
    });

    const map2 = getMapDefinition('clumsy-cultists');
    expect(map2.id).toBe('clumsy-cultists');

    const map3 = getMapDefinition('puzzled-pyramid');
    expect(map3.id).toBe('puzzled-pyramid');

    const map4 = getMapDefinition('defiant-dinosaurs');
    expect(map4.id).toBe('defiant-dinosaurs');
  });
});
