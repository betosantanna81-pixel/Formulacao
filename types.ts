export interface ChemicalComponents {
  B: number;
  Cu: number;
  Mn: number;
  Zn: number;
  Fe: number;
  Mo: number;
  S: number;
}

export interface RawMaterialRow {
  id: string;
  materialName: string;
  supplier: string;
  percentage: number; // The user input percentage
  components: ChemicalComponents;
}

export type ComponentKey = keyof ChemicalComponents;