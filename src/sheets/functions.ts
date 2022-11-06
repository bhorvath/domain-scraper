export const FORMULA = (formula: string) => `=${formula}`;

export const TODAY = () => "TODAY()";

export const DATEDIF = (startDate: string, endDate: string) =>
  `DATEDIF(${startDate},${endDate},"D")`;

export const IF = (logic: string, logicTrue: string, logicFalse: string) =>
  `IF(${logic},${logicTrue},${logicFalse})`;

export const NOT = (logic: string) => `NOT(${logic})`;

export const AND = (logic1: string, logic2: string) =>
  `AND(${logic1},${logic2})`;

export const ISBLANK = (value: string) => `ISBLANK(${value})`;

export const ISNUMBER = (value: string) => `ISNUMBER(${value})`;

export const VALUE = (text: string) => `VALUE(${text})`;
