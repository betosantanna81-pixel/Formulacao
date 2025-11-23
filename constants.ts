import { ComponentKey, RawMaterialRow } from './types';

export const COMPONENT_KEYS: ComponentKey[] = ['B', 'Cu', 'Mn', 'Zn', 'Fe', 'Mo', 'S'];

export const INITIAL_ROWS: RawMaterialRow[] = [
  {
    id: '1',
    materialName: '',
    supplier: '',
    percentage: 0,
    components: { B: 0, Cu: 0, Mn: 0, Zn: 0, Fe: 0, Mo: 0, S: 0 },
  },
];

export const INITIAL_TARGETS = {
  B: 0,
  Cu: 0,
  Mn: 0,
  Zn: 0,
  Fe: 0,
  Mo: 0,
  S: 0,
};