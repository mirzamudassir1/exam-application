import { Fragment, useRef, useState } from "react";

import MathChemDraftComposer from "./MathChemDraftComposer";
import { BASIC_SCREENSHOT_SECTIONS } from "./mathChemSymbols/basicSection";
import {
  ACCENT_TEMPLATES,
  ARROW_TEMPLATES,
  DOT_LAYOUT_TEMPLATES,
  FRACTION_TEMPLATE,
  SCRIPT_TEMPLATES,
  STACKED_OPERATOR_TEMPLATES,
} from "./mathChemSymbols/symbolTemplates";
import {
  LOGIC_SCREENSHOT_ITEMS,
  SETS_SCREENSHOT_ITEMS,
} from "./mathChemSymbols/setsSection";

const MAX_MATRIX_SIZE = 5;
const MAX_TYPED_MATRIX_SIZE = 20;
const PANEL_WIDTH = 980;
const PANEL_HEIGHT = 440;
const FONT_OPTIONS = [
  "Cambria Math",
  "STIX Two Math",
  "Times New Roman",
  "Arial",
];
const SIZE_OPTIONS = ["12", "14", "16", "18", "20", "24"];
const COLOR_OPTIONS = ["#111827", "#dc2626", "#2563eb", "#15913b", "#7d3fb2"];
const HANDWRITING_CANDIDATES = ["∫", "√", "α", "β", "x²", "→", "=", "π"];
const ENCLOSURE_TEMPLATES = ACCENT_TEMPLATES.filter(({ accent }) =>
  ["left-bar", "right-bar", "box", "circle", "slash", "cross"].includes(
    accent
  )
);
const SHAPE_ENCLOSURE_TEMPLATES = ENCLOSURE_TEMPLATES.filter(({ accent }) =>
  ["box", "circle"].includes(accent)
);
const BASIC_LAYOUT_TEMPLATES = [
  FRACTION_TEMPLATE,
  ...SHAPE_ENCLOSURE_TEMPLATES,
  { type: "formula", label: "√□", display: "√□" },
  { type: "formula", label: "ⁿ√□", display: "□√□" },
  { type: "formula", label: "(□)", display: "(□)" },
  { type: "formula", label: "[□]", display: "[□]" },
  { type: "formula", label: "{□}", display: "{□}" },
  { type: "formula", label: "|□|", display: "|□|" },
  { type: "formula", label: "‖□‖", display: "‖□‖" },
  { type: "formula", label: "⟨□⟩", display: "⟨□⟩" },
  { type: "formula", label: "⌈□⌉", display: "⌈□⌉" },
  { type: "formula", label: "⌊□⌋", display: "⌊□⌋" },
  { type: "formula", label: "⌜□⌝", display: "⌜□⌝" },
  { type: "formula", label: "⌞□⌟", display: "⌞□⌟" },
  { type: "formula", label: "▭□", display: "▭□" },
  { type: "formula", label: "▯□", display: "▯□" },
  { type: "formula", label: "▱□", display: "▱□" },
];
const ROOT_LAYOUT_TEMPLATES = BASIC_LAYOUT_TEMPLATES.filter((item) =>
  ["√□", "ⁿ√□"].includes(item.label)
);
const BRACKET_LAYOUT_TEMPLATES = BASIC_LAYOUT_TEMPLATES.filter(
  (item) =>
    item !== FRACTION_TEMPLATE &&
    !["√□", "ⁿ√□"].includes(item.label)
);
const MATRIX_STYLES = [
  { id: "square", label: "Square brackets", preview: "[ ]" },
  { id: "round", label: "Parentheses", preview: "( )" },
  { id: "curly", label: "Curly braces", preview: "{ }" },
  { id: "bars", label: "Vertical bars", preview: "| |" },
  { id: "double-bars", label: "Double vertical bars", preview: "‖ ‖" },
  { id: "cases", label: "Left curly brace", preview: "{ ·" },
  { id: "none", label: "No brackets", preview: "· ·" },
];

const MATRIX_PRESETS = [
  { rows: 2, cols: 2, style: "none", label: "2 by 2 grid" },
  { rows: 3, cols: 3, style: "square", label: "3 by 3 square matrix" },
  { rows: 3, cols: 1, style: "none", label: "3 entry column" },
  { rows: 3, cols: 1, style: "square", label: "3 entry column vector" },
  { rows: 2, cols: 1, style: "round", label: "2 entry round vector" },
  { rows: 3, cols: 2, style: "curly", label: "3 by 2 brace matrix" },
  { rows: 2, cols: 2, style: "bars", label: "2 by 2 determinant" },
  { rows: 2, cols: 2, style: "double-bars", label: "2 by 2 norm matrix" },
  { rows: 1, cols: 3, style: "none", label: "3 entry row" },
  { rows: 1, cols: 3, style: "square", label: "3 entry row vector" },
  { rows: 1, cols: 3, style: "round", label: "3 entry round row vector" },
  { rows: 3, cols: 2, style: "cases", label: "3 row cases" },
];

const PERIODIC_TABLE_ELEMENTS = [
  { n: 1, symbol: "H", name: "Hydrogen", group: 1, period: 1 },
  { n: 2, symbol: "He", name: "Helium", group: 18, period: 1 },
  { n: 3, symbol: "Li", name: "Lithium", group: 1, period: 2 },
  { n: 4, symbol: "Be", name: "Beryllium", group: 2, period: 2 },
  { n: 5, symbol: "B", name: "Boron", group: 13, period: 2 },
  { n: 6, symbol: "C", name: "Carbon", group: 14, period: 2 },
  { n: 7, symbol: "N", name: "Nitrogen", group: 15, period: 2 },
  { n: 8, symbol: "O", name: "Oxygen", group: 16, period: 2 },
  { n: 9, symbol: "F", name: "Fluorine", group: 17, period: 2 },
  { n: 10, symbol: "Ne", name: "Neon", group: 18, period: 2 },
  { n: 11, symbol: "Na", name: "Sodium", group: 1, period: 3 },
  { n: 12, symbol: "Mg", name: "Magnesium", group: 2, period: 3 },
  { n: 13, symbol: "Al", name: "Aluminium", group: 13, period: 3 },
  { n: 14, symbol: "Si", name: "Silicon", group: 14, period: 3 },
  { n: 15, symbol: "P", name: "Phosphorus", group: 15, period: 3 },
  { n: 16, symbol: "S", name: "Sulfur", group: 16, period: 3 },
  { n: 17, symbol: "Cl", name: "Chlorine", group: 17, period: 3 },
  { n: 18, symbol: "Ar", name: "Argon", group: 18, period: 3 },
  { n: 19, symbol: "K", name: "Potassium", group: 1, period: 4 },
  { n: 20, symbol: "Ca", name: "Calcium", group: 2, period: 4 },
  { n: 21, symbol: "Sc", name: "Scandium", group: 3, period: 4 },
  { n: 22, symbol: "Ti", name: "Titanium", group: 4, period: 4 },
  { n: 23, symbol: "V", name: "Vanadium", group: 5, period: 4 },
  { n: 24, symbol: "Cr", name: "Chromium", group: 6, period: 4 },
  { n: 25, symbol: "Mn", name: "Manganese", group: 7, period: 4 },
  { n: 26, symbol: "Fe", name: "Iron", group: 8, period: 4 },
  { n: 27, symbol: "Co", name: "Cobalt", group: 9, period: 4 },
  { n: 28, symbol: "Ni", name: "Nickel", group: 10, period: 4 },
  { n: 29, symbol: "Cu", name: "Copper", group: 11, period: 4 },
  { n: 30, symbol: "Zn", name: "Zinc", group: 12, period: 4 },
  { n: 31, symbol: "Ga", name: "Gallium", group: 13, period: 4 },
  { n: 32, symbol: "Ge", name: "Germanium", group: 14, period: 4 },
  { n: 33, symbol: "As", name: "Arsenic", group: 15, period: 4 },
  { n: 34, symbol: "Se", name: "Selenium", group: 16, period: 4 },
  { n: 35, symbol: "Br", name: "Bromine", group: 17, period: 4 },
  { n: 36, symbol: "Kr", name: "Krypton", group: 18, period: 4 },
  { n: 37, symbol: "Rb", name: "Rubidium", group: 1, period: 5 },
  { n: 38, symbol: "Sr", name: "Strontium", group: 2, period: 5 },
  { n: 39, symbol: "Y", name: "Yttrium", group: 3, period: 5 },
  { n: 40, symbol: "Zr", name: "Zirconium", group: 4, period: 5 },
  { n: 41, symbol: "Nb", name: "Niobium", group: 5, period: 5 },
  { n: 42, symbol: "Mo", name: "Molybdenum", group: 6, period: 5 },
  { n: 43, symbol: "Tc", name: "Technetium", group: 7, period: 5 },
  { n: 44, symbol: "Ru", name: "Ruthenium", group: 8, period: 5 },
  { n: 45, symbol: "Rh", name: "Rhodium", group: 9, period: 5 },
  { n: 46, symbol: "Pd", name: "Palladium", group: 10, period: 5 },
  { n: 47, symbol: "Ag", name: "Silver", group: 11, period: 5 },
  { n: 48, symbol: "Cd", name: "Cadmium", group: 12, period: 5 },
  { n: 49, symbol: "In", name: "Indium", group: 13, period: 5 },
  { n: 50, symbol: "Sn", name: "Tin", group: 14, period: 5 },
  { n: 51, symbol: "Sb", name: "Antimony", group: 15, period: 5 },
  { n: 52, symbol: "Te", name: "Tellurium", group: 16, period: 5 },
  { n: 53, symbol: "I", name: "Iodine", group: 17, period: 5 },
  { n: 54, symbol: "Xe", name: "Xenon", group: 18, period: 5 },
  { n: 55, symbol: "Cs", name: "Caesium", group: 1, period: 6 },
  { n: 56, symbol: "Ba", name: "Barium", group: 2, period: 6 },
  { n: 57, symbol: "La", name: "Lanthanum", group: 3, period: 8 },
  { n: 58, symbol: "Ce", name: "Cerium", group: 4, period: 8 },
  { n: 59, symbol: "Pr", name: "Praseodymium", group: 5, period: 8 },
  { n: 60, symbol: "Nd", name: "Neodymium", group: 6, period: 8 },
  { n: 61, symbol: "Pm", name: "Promethium", group: 7, period: 8 },
  { n: 62, symbol: "Sm", name: "Samarium", group: 8, period: 8 },
  { n: 63, symbol: "Eu", name: "Europium", group: 9, period: 8 },
  { n: 64, symbol: "Gd", name: "Gadolinium", group: 10, period: 8 },
  { n: 65, symbol: "Tb", name: "Terbium", group: 11, period: 8 },
  { n: 66, symbol: "Dy", name: "Dysprosium", group: 12, period: 8 },
  { n: 67, symbol: "Ho", name: "Holmium", group: 13, period: 8 },
  { n: 68, symbol: "Er", name: "Erbium", group: 14, period: 8 },
  { n: 69, symbol: "Tm", name: "Thulium", group: 15, period: 8 },
  { n: 70, symbol: "Yb", name: "Ytterbium", group: 16, period: 8 },
  { n: 71, symbol: "Lu", name: "Lutetium", group: 17, period: 8 },
  { n: 72, symbol: "Hf", name: "Hafnium", group: 4, period: 6 },
  { n: 73, symbol: "Ta", name: "Tantalum", group: 5, period: 6 },
  { n: 74, symbol: "W", name: "Tungsten", group: 6, period: 6 },
  { n: 75, symbol: "Re", name: "Rhenium", group: 7, period: 6 },
  { n: 76, symbol: "Os", name: "Osmium", group: 8, period: 6 },
  { n: 77, symbol: "Ir", name: "Iridium", group: 9, period: 6 },
  { n: 78, symbol: "Pt", name: "Platinum", group: 10, period: 6 },
  { n: 79, symbol: "Au", name: "Gold", group: 11, period: 6 },
  { n: 80, symbol: "Hg", name: "Mercury", group: 12, period: 6 },
  { n: 81, symbol: "Tl", name: "Thallium", group: 13, period: 6 },
  { n: 82, symbol: "Pb", name: "Lead", group: 14, period: 6 },
  { n: 83, symbol: "Bi", name: "Bismuth", group: 15, period: 6 },
  { n: 84, symbol: "Po", name: "Polonium", group: 16, period: 6 },
  { n: 85, symbol: "At", name: "Astatine", group: 17, period: 6 },
  { n: 86, symbol: "Rn", name: "Radon", group: 18, period: 6 },
  { n: 87, symbol: "Fr", name: "Francium", group: 1, period: 7 },
  { n: 88, symbol: "Ra", name: "Radium", group: 2, period: 7 },
  { n: 89, symbol: "Ac", name: "Actinium", group: 3, period: 9 },
  { n: 90, symbol: "Th", name: "Thorium", group: 4, period: 9 },
  { n: 91, symbol: "Pa", name: "Protactinium", group: 5, period: 9 },
  { n: 92, symbol: "U", name: "Uranium", group: 6, period: 9 },
  { n: 93, symbol: "Np", name: "Neptunium", group: 7, period: 9 },
  { n: 94, symbol: "Pu", name: "Plutonium", group: 8, period: 9 },
  { n: 95, symbol: "Am", name: "Americium", group: 9, period: 9 },
  { n: 96, symbol: "Cm", name: "Curium", group: 10, period: 9 },
  { n: 97, symbol: "Bk", name: "Berkelium", group: 11, period: 9 },
  { n: 98, symbol: "Cf", name: "Californium", group: 12, period: 9 },
  { n: 99, symbol: "Es", name: "Einsteinium", group: 13, period: 9 },
  { n: 100, symbol: "Fm", name: "Fermium", group: 14, period: 9 },
  { n: 101, symbol: "Md", name: "Mendelevium", group: 15, period: 9 },
  { n: 102, symbol: "No", name: "Nobelium", group: 16, period: 9 },
  { n: 103, symbol: "Lr", name: "Lawrencium", group: 17, period: 9 },
  { n: 104, symbol: "Rf", name: "Rutherfordium", group: 4, period: 7 },
  { n: 105, symbol: "Db", name: "Dubnium", group: 5, period: 7 },
  { n: 106, symbol: "Sg", name: "Seaborgium", group: 6, period: 7 },
  { n: 107, symbol: "Bh", name: "Bohrium", group: 7, period: 7 },
  { n: 108, symbol: "Hs", name: "Hassium", group: 8, period: 7 },
  { n: 109, symbol: "Mt", name: "Meitnerium", group: 9, period: 7 },
  { n: 110, symbol: "Ds", name: "Darmstadtium", group: 10, period: 7 },
  { n: 111, symbol: "Rg", name: "Roentgenium", group: 11, period: 7 },
  { n: 112, symbol: "Cn", name: "Copernicium", group: 12, period: 7 },
  { n: 113, symbol: "Nh", name: "Nihonium", group: 13, period: 7 },
  { n: 114, symbol: "Fl", name: "Flerovium", group: 14, period: 7 },
  { n: 115, symbol: "Mc", name: "Moscovium", group: 15, period: 7 },
  { n: 116, symbol: "Lv", name: "Livermorium", group: 16, period: 7 },
  { n: 117, symbol: "Ts", name: "Tennessine", group: 17, period: 7 },
  { n: 118, symbol: "Og", name: "Oganesson", group: 18, period: 7 },
];

const getItemLabel = (item) =>
  typeof item === "string"
    ? item
    : item.type === "spacer"
    ? ""
    : item.type === "visual-control"
    ? item.label
    : item.type === "symbol-panel-trigger"
    ? item.label
    : item.type === "palette-trigger"
    ? getItemLabel(item.preview)
    : item.type === "format-control" || item.type === "action-control"
    ? item.label
    : item.label || item.symbol;

const getItemKey = (item) =>
  typeof item === "string"
    ? item
    : item.type === "spacer"
    ? `spacer:${item.id}`
    : item.type === "visual-control"
    ? `visual-control:${item.id}`
    : item.type === "symbol-panel-trigger"
    ? `symbol-panel-trigger:${item.id}`
    : item.type === "palette-trigger"
    ? `palette-trigger:${item.id}`
    : item.type === "format-control"
    ? `format-control:${item.id}`
    : item.type === "action-control"
    ? `action-control:${item.id}`
    : item.n && item.symbol
    ? `element:${item.n}:${item.symbol}`
    : `${item.type}:${item.arrow || item.operator || item.accent || item.display || item.label || ""}:${item.slots?.join("-") || item.variant || ""}`;

const getMergedItems = (groups, groupKeys) => {
  const items = new Map();

  groupKeys.flatMap((key) => groups[key].items).forEach((item) => {
    items.set(getItemKey(item), item);
  });

  return [...items.values()];
};

const getUniqueItems = (items) => {
  const uniqueItems = new Map();

  items.forEach((item) => {
    uniqueItems.set(getItemKey(item), item);
  });

  return [...uniqueItems.values()];
};

const sortItemsByLabel = (items) =>
  [...items].sort((first, second) =>
    getItemLabel(first).localeCompare(getItemLabel(second), undefined, {
      numeric: true,
      sensitivity: "base",
    })
  );

const mathGroups = {
  negatedOperators: {
    icon: "≠",
    name: "Negated Operators",
    items: [
      "¬", "∄", "∉", "∌", "≠", "≁", "≄", "≇", "≉", "≢", "≮", "≯",
      "≰", "≱", "⊄", "⊅", "⊈", "⊉", "⊬", "⊭", "∤", "∦",
    ],
  },
  basics: {
    icon: "√",
    name: "Basics",
    items: getUniqueItems([
      FRACTION_TEMPLATE,
      { type: "formula", label: "□/□", display: "□/□" },
      { type: "formula", label: "√□", display: "√□" },
      { type: "formula", label: "√□", display: "√□" },
      { type: "formula", label: "√□", display: "√□" },
      { type: "formula", label: "□√□", display: "□√□" },
      ...SCRIPT_TEMPLATES,
      { type: "formula", label: "(□)", display: "(□)" },
      { type: "formula", label: "[□]", display: "[□]" },
      { type: "formula", label: "|□|", display: "|□|" },
      { type: "formula", label: "{□}", display: "{□}" },
      "+", "×", "−", "±", "÷", ">", "∈", "∪", "≤", "⊂", "∩", "∞", "π",
      "=", "≠", "<", "≥", "≈", "√", "∛", "∜", "%", "!", "|x|", "e", "i",
      "∓", "∔", "∕", "⁄", "∗", "∙", "⋆", "∧", "∨", "⊻",
      "⌊x⌋", "⌈x⌉", "mod", "div", "rem", "deg", "rad",
      { type: "formula", label: "□", display: "□" },
      { type: "formula", label: "□ + □", display: "□ + □" },
      { type: "formula", label: "□ − □", display: "□ − □" },
      { type: "formula", label: "□ × □", display: "□ × □" },
      { type: "formula", label: "□ / □", display: "□ / □" },
      { type: "formula", label: "□ = □", display: "□ = □" },
    ]),
  },
  relations: {
    icon: "≈",
    name: "Relations",
    items: [
      "=", "≠", "≈", "≅", "≡", "<", ">", "≤", "≥", "∼", "∝", "∥", "⊥",
      "≃", "≄", "≆", "≇", "≉", "≊", "≋", "≌", "≍", "≎", "≏",
      "≐", "≑", "≒", "≓", "≔", "≕", "≖", "≗", "≙", "≚", "≜",
      "≟", "≪", "≫", "≮", "≯", "≰", "≱", "≲", "≳", "≴", "≵",
      "≺", "≻", "≼", "≽", "≾", "≿", "⊂", "⊃", "⊆", "⊇", "⊄",
      "⊅", "⊈", "⊉", "⊊", "⊋", "⋈", "⋍", "⋐", "⋑", "⋘", "⋙",
    ],
  },
  operators: {
    icon: "∑",
    name: "Operators",
    items: getUniqueItems([
      "∑", "∏", "∫", "∬", "∭", "∮", "∂", "∇", "∆", "∇²",
      "⋂", "⋃", "∘", "⋅", "⊕", "⊖", "⊗", "⊙",
      ...STACKED_OPERATOR_TEMPLATES,
      { type: "formula", label: "∑_(□)^□ □", display: "∑_□^□ □" },
      { type: "formula", label: "∏_(□)^□ □", display: "∏_□^□ □" },
      "∐", "∯", "∰", "∱", "∲", "∳", "∴", "∵", "∶", "∷",
      "⊘", "⊚", "⊛", "⊞", "⊟", "⊠", "⊡", "⋄", "⋇", "⋉", "⋊",
      "⋋", "⋌", "⋎", "⋏", "⋒", "⋓", "⋔", "⋕", "⋖", "⋗",
      "⨀", "⨁", "⨂", "⨃", "⨄", "⨅", "⨆", "⨯", "⨿",
    ]),
  },
  calculus: {
    icon: "∫",
    name: "Calculus",
    items: getUniqueItems([
      "d/dx", "dy/dx", "d²/dx²", "∂/∂x", "∂²/∂x²", "∫f(x)dx",
      "∫ₐᵇf(x)dx", "∫₀∞f(x)dx", "lim", "limₓ→a", "limₓ→∞", "Δx",
      "Δy/Δx", "∂f/∂x", "∂²f/∂x²", "∇f", "∇·F", "∇×F", "dx", "dy",
      "dt", "du", "dθ",
      "d³/dx³", "∂³/∂x³", "∫₋∞∞f(x)dx", "∮C F·dr", "∬S f dS",
      "∭V f dV", "grad", "div", "curl", "laplacian", "∇²f",
      "limsup", "liminf", "sup", "inf",
      { type: "formula", label: "∫□ d□", display: "∫□ d□" },
      { type: "formula", label: "∫_□^□ □ d□", display: "∫_□^□ □ d□" },
      { type: "formula", label: "lim_(□→□) □", display: "lim(□→□) □" },
      { type: "formula", label: "d□/d□", display: "d□/d□" },
      { type: "formula", label: "∂□/∂□", display: "∂□/∂□" },
    ]),
  },
  functions: {
    icon: "ƒ",
    name: "Functions",
    items: getUniqueItems([
      "f(x)", "g(x)", "sin", "cos", "tan", "cot", "sec", "csc",
      "sin⁻¹", "cos⁻¹", "tan⁻¹",
      "arcsin", "arccos", "arctan", "log", "ln", "lg", "logₐ", "log₁₀",
      "exp", "max", "min", "det", "gcd", "lcm", "mod",
      "sinh", "cosh", "tanh", "coth", "sech", "csch",
      "arsinh", "arcosh", "artanh", "floor", "ceil", "round",
      "rank", "trace", "sgn", "Re", "Im", "arg", "ker", "dim",
      { type: "formula", label: "sin(□)", display: "sin(□)" },
      { type: "formula", label: "log(□)", display: "log(□)" },
    ]),
  },
  scripts: {
    icon: "xⁿ",
    name: "Scripts",
    items: getUniqueItems([
      ...SCRIPT_TEMPLATES,
      "x²", "x³", "xⁿ", "x⁻¹", "aₙ", "xᵢ", "xᵢⱼ", "ₙCᵣ", "ₙPᵣ",
      { type: "formula", label: "□²", display: "□²" },
      { type: "formula", label: "□^□", display: "□^□" },
      { type: "formula", label: "□_□", display: "□_□" },
      { type: "formula", label: "□_□^□", display: "□_□^□" },
      "⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹", "⁺", "⁻",
      "⁼", "⁽", "⁾", "ⁿ", "₀", "₁", "₂", "₃", "₄", "₅", "₆",
      "₇", "₈", "₉", "₊", "₋", "₌", "₍", "₎",
      "ⁱ", "ʲ", "ᵏ", "ᵐ", "ᵗ", "ᵘ", "ᵛ", "ˣ", "ₐ", "ₑ", "ₕ",
      "ᵢ", "ⱼ", "ₖ", "ₗ", "ₘ", "ₙ", "ₒ", "ₚ", "ᵣ", "ₛ", "ₜ",
      "ᵤ", "ᵥ", "ₓ",
    ]),
  },
  fractions: {
    icon: "½",
    name: "Fractions and Roots",
    items: getUniqueItems([
      FRACTION_TEMPLATE,
      ...ROOT_LAYOUT_TEMPLATES,
      { type: "formula", label: "□/□", display: "□/□" },
      "½", "⅓", "⅔", "¼", "¾", "a/b", "(a+b)/(c+d)", "√x", "√(a+b)", "∛x",
      "∜x", "ⁿ√x", "1/x", "1/x²",
      "⅟", "⅐", "⅑", "⅒", "⅕", "⅖", "⅗", "⅘", "⅙", "⅚",
      "⅛", "⅜", "⅝", "⅞", "√(x²+y²)", "√[n](x)", "x/y/z",
    ]),
  },
  arrows: {
    icon: "→",
    name: "Arrows",
    items: getUniqueItems([
      "←", "→", "↔", "⇌", "↑", "↓", "↕", "↖", "↗", "↘", "↙",
      "⇒", "⇐", "⇔", "⇑", "⇓", "⇕", "⇋", "⇌", "↦", "↩", "↪",
      "↚", "↛", "↜", "↝", "↞", "↟", "↠", "↡", "↢", "↣", "↤",
      "↥", "↧", "↨", "↫", "↬", "↭", "↮", "↯", "↰", "↱", "↲",
      "↳", "↴", "↵", "↶", "↷", "↺", "↻", "↼", "↽", "↾", "↿",
      "⇀", "⇁", "⇂", "⇃", "⇄", "⇅", "⇆", "⇇", "⇈", "⇉", "⇊",
      "⇍", "⇎", "⇏", "⇐", "⇑", "⇒", "⇓", "⇔", "⇖", "⇗", "⇘",
      "⇙", "⇚", "⇛", "⇜", "⇝", "⇠", "⇢", "⇤", "⇥",
      "⇦", "⇧", "⇨", "⇩", "⇪", "⇵", "⇶", "⇷", "⇸", "⇹", "⇺",
      "⇻", "⇼", "⇽", "⇾", "⇿", "⟵", "⟶", "⟷", "⟸", "⟹", "⟺",
      "⟻", "⟼", "⟽", "⟾", "⟿", "⤀", "⤁", "⤂", "⤃", "⤄", "⤅",
      "⤆", "⤇", "⤌", "⤍", "⤎", "⤏", "⤐", "⤑", "⤒", "⤓", "⤔",
      "⤕", "⤖", "⤗", "⤘", "⤙", "⤚", "⤛", "⤜", "⤝", "⤞", "⤟",
      "⤠", "⤡", "⤢", "⤣", "⤤", "⤥", "⤦", "⤧", "⤨", "⤩", "⤪",
      "⤭", "⤮", "⤯", "⤰", "⤱", "⤲", "⤳", "⤴", "⤵", "⤶", "⤷",
      "⤸", "⤹", "⤺", "⤻", "⤼", "⤽", "⤾", "⤿", "⥀", "⥁", "⥂",
      "⥃", "⥄", "⥅", "⥆", "⥇", "⥈", "⥉", "⥊", "⥋", "⥌", "⥍",
      "⥎", "⥏", "⥐", "⥑", "⥒", "⥓", "⥔", "⥕", "⥖", "⥗", "⥘",
      "⥙", "⥚", "⥛", "⥜", "⥝", "⥞", "⥟", "⥠", "⥡", "⥢", "⥣",
      "⥤", "⥥", "⥦", "⥧", "⥨", "⥩", "⥪", "⥫", "⥬", "⥭", "⥮",
      "⥯", "⥰", "⥱", "⥲", "⥳", "⥴", "⥵", "⥶", "⥷", "⥸", "⥹",
      ...DOT_LAYOUT_TEMPLATES,
    ]),
  },
  matrices: {
    icon: "▦",
    name: "Matrices",
    items: [],
  },
  brackets: {
    icon: "( )",
    name: "Brackets",
    items: getUniqueItems([
      ...BRACKET_LAYOUT_TEMPLATES,
      "(", ")", "[", "]", "{", "}", "⟨", "⟩", "⌈", "⌉", "⌊", "⌋",
      "⟦", "⟧", "⟪", "⟫", "|", "‖", "⏞", "⏟", "⏜", "⏝",
      "⌜", "⌝", "⌞", "⌟", "⎡", "⎤", "⎣", "⎦", "⎛", "⎞", "⎝",
      "⎠", "⎧", "⎫", "⎨", "⎬", "⎩", "⎭",
    ]),
  },
  geometry: {
    icon: "△",
    name: "Trig & Geometry",
    items: [
      "∠", "°", "′", "″", "⊥", "∥", "△", "□", "○", "⊙", "⌒",
      "≅", "∼", "⃗", "AB", "A⃗B", "△ABC", "∠ABC", "πr²",
      "2πr", "½bh", "a²+b²=c²",
      "◇", "◆", "◊", "◈", "▢", "▣", "▤", "▥", "▦", "▧", "▨",
      "▩", "▪", "▫", "▬", "▭", "▮", "▯", "▰", "▱", "▲", "▼",
      "◀", "▶", "▴", "▵", "▸", "▹", "►", "▻", "▽", "▾", "▿",
      "◂", "◃", "◄", "◅", "◌", "●", "◐", "◑", "◒", "◓", "◔",
      "◕", "◖", "◗", "◉", "◎", "◍", "◎", "●", "⊕", "⊖", "⊗",
      "⊘", "⊙", "⊚", "⊛", "⊜", "⊝", "⊞", "⊟", "⊠", "⊡",
    ],
  },
  greekLower: {
    icon: "α",
    name: "Greek Lowercase",
    items: [
      "α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "ι", "κ", "λ", "μ",
      "ν", "ξ", "ο", "π", "ρ", "σ", "τ", "υ", "φ", "χ", "ψ", "ω",
    ],
  },
  greekUpper: {
    icon: "Ω",
    name: "Greek Uppercase",
    items: [
      "Α", "Β", "Γ", "Δ", "Ε", "Ζ", "Η", "Θ", "Ι", "Κ", "Λ", "Μ", "Ν",
      "Ξ", "Ο", "Π", "Ρ", "Σ", "Τ", "Υ", "Φ", "Χ", "Ψ", "Ω",
    ],
  },
  sets: {
    icon: "∈",
    name: "Sets",
    items: SETS_SCREENSHOT_ITEMS,
  },
  logic: {
    icon: "∀",
    name: "Logic",
    items: LOGIC_SCREENSHOT_ITEMS,
  },
  statistics: {
    icon: "x̄",
    name: "Probability & Statistics",
    items: getUniqueItems([
      "P(A)", "P(A|B)", "P(A∩B)", "P(A∪B)", "P(Aᶜ)", "E(X)", "Var(X)",
      "Cov(X,Y)", "x̄", "ȳ", "μ", "σ", "σ²", "s", "s²", "Σx", "Σx²",
      "n", "N", "r", "ρ", "z", "χ²", "P", "C", "n!", "ₙCᵣ", "ₙPᵣ",
      { type: "formula", label: "P(□)", display: "P(□)" },
      { type: "formula", label: "E(□)", display: "E(□)" },
    ]),
  },
  accents: {
    icon: "x̂",
    name: "Accents and Decorations",
    items: getUniqueItems([
      ...ACCENT_TEMPLATES,
      "x̄", "x̂", "x̃", "x⃗", "ẋ", "ẍ", "x̆", "x̌", "x́", "x̀", "x̊",
      "x⃐", "x⃑", "x⃖", "x⃡", "A̅", "A⃗", "AB̅", "AB⃗", "A⃗B",
      "|x|", "‖x‖",
    ]),
  },
  misc: {
    icon: "⋯",
    name: "Miscellaneous",
    items: [
      "⋯", "⋮", "⋱", "⋰", "…", "·", "•", "◦", "ℵ", "ℶ", "ℏ", "ℓ",
      "℘", "ℜ", "ℑ", "℧", "℮", "ℯ", "ℱ", "ℒ", "ℳ", "ℵ₀", "♭", "♮",
      "♯", "✓", "✗",
    ],
  },
  punctuation: {
    icon: "¶",
    name: "Punctuation and Marks",
    items: [
      "©", "®", "™", "§", "¶", "†", "‡", "‰", "′", "″", "‹", "›",
      "«", "»", "‘", "’", "“", "”", "–", "—", "¡", "¿", "¬",
    ],
  },
  currency: {
    icon: "₹",
    name: "Currency",
    items: [
      "₹", "$", "€", "£", "¥", "₩", "₽", "₺", "₴", "₦", "₱", "฿",
      "₫", "₪", "₡", "₲", "₵", "₭", "₮", "₨", "¢", "¤",
    ],
  },
  numberForms: {
    icon: "⅟",
    name: "Number Forms",
    items: [
      "⅟", "↉", "⅒", "⅑", "⅛", "⅐", "⅙", "⅕", "¼", "⅓", "⅜", "⅖",
      "½", "⅗", "⅝", "⅔", "¾", "⅘", "⅚", "⅞", "Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ",
      "Ⅴ", "Ⅵ", "Ⅶ", "Ⅷ", "Ⅸ", "Ⅹ", "Ⅺ", "Ⅻ", "Ⅼ", "Ⅽ", "Ⅾ", "Ⅿ",
      "ⅰ", "ⅱ", "ⅲ", "ⅳ", "ⅴ", "ⅵ", "ⅶ", "ⅷ", "ⅸ", "ⅹ",
    ],
  },
  technical: {
    icon: "⌘",
    name: "Technical and Units",
    items: [
      "⌘", "⌥", "⌃", "⇧", "⎋", "⌫", "⌦", "⏎", "␣", "⌧", "⌛", "⌚",
      "⌂", "⌐", "⌑", "⌬", "⌀", "⌁", "⌭", "⌮", "⍟", "⎔", "⏚", "⏛",
      "℃", "℉", "K", "Å", "µ", "Ω", "℧", "Å", "℔", "℥", "℞", "℟",
    ],
  },
  phonetic: {
    icon: "ə",
    name: "Phonetic",
    items: [
      "ɑ", "ɐ", "ɒ", "æ", "ɓ", "β", "ɔ", "ɕ", "ç", "ð", "ɗ", "ɖ",
      "ə", "ɚ", "ɛ", "ɜ", "ɝ", "ɞ", "ɟ", "ʄ", "ɡ", "ɠ", "ɢ", "ʛ",
      "ɦ", "ɧ", "ħ", "ɥ", "ɪ", "ɨ", "ʝ", "ɭ", "ɬ", "ɫ", "ɮ", "ʟ",
      "ɱ", "ɯ", "ɰ", "ŋ", "ɳ", "ɲ", "ɴ", "ø", "ɵ", "œ", "ɸ", "ɹ",
      "ɻ", "ʁ", "ɽ", "ɾ", "ʂ", "ʃ", "ʈ", "θ", "ʊ", "ʉ", "ʌ", "ɣ",
      "ɤ", "ʍ", "χ", "ʎ", "ʏ", "ʒ", "ʔ", "ʕ", "ʘ", "ǀ", "ǁ", "ǂ", "ǃ",
    ],
  },
  rare: {
    icon: "★",
    name: "Rare Symbols",
    items: [
      "∓", "≅", "∝", "‰", "‼", "⌊x⌋", "⌈x⌉",
      "≉", "≃", "≄", "≇", "≢", "≪", "≫", "≮", "≯", "≰", "≱",
      "≁", "∣", "∤", "∦", "⋈", "≺", "≻", "≼", "≽", "⊏", "⊐", "⊑", "⊒",
      "∐", "∯", "∰", "∙", "⋆", "∗", "⊘", "⊚", "⊛", "⊞", "⊟",
      "⊠", "⊡", "†", "‡", "⨯", "⨿", "⨁", "⨂", "⨀", "⨆", "⨉",
      "sinh", "cosh", "tanh", "coth", "sech", "csch", "sup", "inf",
      "sgn", "Re", "Im", "arg",
      "ⁱ", "ₐ", "ₑ", "ₕ", "ᵢ", "ⱼ", "ₖ", "ₗ", "ₘ", "ₙ", "ₒ",
      "ₚ", "ᵣ", "ₛ", "ₜ", "ᵤ", "ᵥ", "ₓ",
      "⅕", "⅖", "⅗", "⅘", "⅙", "⅚", "⅛", "⅜", "⅝", "⅞",
      "↕", "↖", "↗", "↘", "↙", "↤", "↩", "↪", "↫", "↬", "↭",
      "↝", "⇑", "⇓", "⇕", "⇋", "↻", "↺",
      "∡", "∢", "∟", "∦", "▴", "▽", "■", "▱", "▰", "◇", "◆",
      "●", "⌢", "̂", "¯",
      "ϵ", "ϑ", "ϰ", "ϖ", "ϱ", "ς", "ϕ",
      "ℙ", "∋", "∌", "⊊", "⊋", "∆", "ᶜ", "℘",
      "∄", "⊻", "⊢", "⊣", "⊨", "⊭",
    ],
  },
};

const chemGroups = {
  periodicTable: {
    icon: "H",
    name: "Periodic Table",
    items: PERIODIC_TABLE_ELEMENTS,
  },
  common: {
    icon: "⚗",
    name: "Common",
    items: [
      "H₂O", "CO₂", "O₂", "N₂", "H₂", "CH₄", "NH₃", "NaCl", "HCl",
      "NaOH", "H₂SO₄", "HNO₃", "H₃PO₄", "CaCO₃", "KMnO₄", "K₂Cr₂O₇",
      "NaHCO₃", "C₆H₁₂O₆", "C₂H₅OH", "CH₃COOH",
    ],
  },
  reactions: {
    icon: "→",
    name: "Reactions",
    items: [
      "→", "←", "↔", "⇌", "↑", "↓", "Δ", "+", "−", "hν", "heat",
      "light", "cat.", "acid", "base", "electrolysis", "oxidation",
      "reduction", "equilibrium", "yield",
    ],
  },
  ions: {
    icon: "⁺",
    name: "Ions",
    items: [
      "H⁺", "H₃O⁺", "Li⁺", "Na⁺", "K⁺", "Ag⁺", "NH₄⁺", "Mg²⁺",
      "Ca²⁺", "Ba²⁺", "Zn²⁺", "Cu²⁺", "Fe²⁺", "Fe³⁺", "Al³⁺",
      "F⁻", "Cl⁻", "Br⁻", "I⁻", "OH⁻", "NO₃⁻", "NO₂⁻", "HCO₃⁻",
      "HSO₄⁻", "ClO₃⁻", "MnO₄⁻", "O²⁻", "S²⁻", "CO₃²⁻", "SO₄²⁻",
      "SO₃²⁻", "CrO₄²⁻", "Cr₂O₇²⁻", "PO₄³⁻",
    ],
  },
  states: {
    icon: "(aq)",
    name: "States and Conditions",
    items: [
      "(s)", "(l)", "(g)", "(aq)", "STP", "RTP", "Δ", "°C", "K", "atm",
      "Pa", "kPa", "pH", "pOH", "excess", "dilute", "concentrated",
      "saturated",
    ],
  },
  bonds: {
    icon: "≡",
    name: "Bonds and Structures",
    items: [
      "−", "=", "≡", "·", ":", "→", "δ⁺", "δ⁻", "•", "••", "R−OH",
      "R−CHO", "R−CO−R", "R−COOH", "R−NH₂", "R−X", "C=C", "C≡C",
      "O=O", "N≡N",
    ],
  },
  organic: {
    icon: "C",
    name: "Organic Chemistry",
    items: [
      "CH₄", "C₂H₆", "C₃H₈", "C₄H₁₀", "C₂H₄", "C₂H₂", "C₆H₆",
      "CH₃OH", "C₂H₅OH", "CH₃CHO", "CH₃COCH₃", "CH₃COOH", "C₂H₅NH₂",
      "CH₃Cl", "C₂H₅Cl", "−OH", "−CHO", ">C=O", "−COOH", "−NH₂",
    ],
  },
  elements: {
    icon: "Pt",
    name: "Element Symbols",
    items: [
      "H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne", "Na", "Mg",
      "Al", "Si", "P", "S", "Cl", "Ar", "K", "Ca", "Sc", "Ti", "V", "Cr",
      "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Ga", "Ge", "As", "Se", "Br",
      "Kr", "Rb", "Sr", "Ag", "Cd", "Sn", "I", "Xe", "Cs", "Ba", "Pt",
      "Au", "Hg", "Pb", "Rn", "U", "La", "Ce", "Nd", "Th", "Ag", "Cl",
      "Br", "I", "F",
    ],
  },
  terms: {
    icon: "pH",
    name: "Terms",
    items: [
      "pH", "pOH", "mol", "mol·L⁻¹", "M", "N", "mL", "L", "g", "kg",
      "g·mol⁻¹", "atm", "Pa", "kPa", "K", "°C", "STP", "R", "Nₐ",
      "PV=nRT", "n=m/M", "c=n/V", "q=mcΔT", "ΔH", "ΔG", "ΔS", "Kc",
      "Kp", "Ka", "Kb", "Kw",
    ],
  },
};

const mathFamilies = {
  basics: {
    icon: "√",
    name: "Basic Math",
    groups: ["basics"],
  },
  sets: {
    icon: "∈∞",
    name: "Sets & Logic",
    groups: ["sets", "logic"],
  },
  arrows: {
    icon: "→⋯",
    name: "Arrows",
    groups: ["arrows"],
  },
  greek: {
    icon: "α Ω",
    name: "Greek Letters",
    groups: ["greekLower", "greekUpper"],
  },
  matrices: {
    icon: "▦",
    name: "Matrices",
    groups: ["matrices"],
  },
  scripts: {
    icon: "□ⁿ",
    name: "Scripts and Layouts",
    groups: ["scripts", "fractions"],
  },
  decorations: {
    icon: "(□)̂",
    name: "Decorations",
    groups: ["accents"],
  },
  brackets: {
    icon: "(□)□",
    name: "Brackets",
    groups: ["brackets"],
  },
  geometry: {
    icon: "△",
    name: "Geometry",
    groups: ["geometry"],
  },
  operators: {
    icon: "∑∪",
    name: "Operators",
    groups: ["operators"],
  },
  calculus: {
    icon: "∫lim",
    name: "Calculus & Functions",
    groups: ["calculus", "functions"],
  },
  relations: {
    icon: "≈",
    name: "Relations",
    groups: ["relations", "negatedOperators"],
  },
  statistics: {
    icon: "x̄",
    name: "Probability & Statistics",
    groups: ["statistics"],
  },
  special: {
    icon: "★",
    name: "Special Characters",
    groups: [
      "brackets",
      "accents",
      "misc",
      "punctuation",
      "currency",
      "numberForms",
      "technical",
      "phonetic",
      "rare",
    ],
  },
};

const SPECIAL_CHARACTER_CATEGORIES = [
  { id: "symbol", name: "Symbol", groups: ["brackets", "misc", "rare"] },
  { id: "punctuation", name: "Punctuation", groups: ["punctuation"] },
  { id: "letter", name: "Letter", groups: ["greekLower", "greekUpper"] },
  { id: "mark", name: "Mark", groups: ["accents"] },
  { id: "number", name: "Number", groups: ["numberForms", "currency"] },
  { id: "phonetic", name: "Phonetic", groups: ["phonetic"] },
  { id: "other", name: "Other", groups: ["technical"] },
];
const chemFamilies = {
  periodicTable: {
    icon: "H",
    name: "Periodic Table",
    groups: ["periodicTable"],
  },
  common: {
    icon: "⚗",
    name: "Common & Organic",
    groups: ["common", "organic"],
  },
  reactions: {
    icon: "→",
    name: "Reactions & Conditions",
    groups: ["reactions", "states"],
  },
  ions: {
    icon: "⁺",
    name: "Ions",
    groups: ["ions"],
  },
  bonds: {
    icon: "≡",
    name: "Bonds & Structures",
    groups: ["bonds"],
  },
  elements: {
    icon: "Pt",
    name: "Elements",
    groups: ["elements"],
  },
  terms: {
    icon: "pH",
    name: "Terms & Units",
    groups: ["terms"],
  },
};

const modes = {
  math: { groups: mathGroups, families: mathFamilies, firstGroup: "basics" },
  chem: { groups: chemGroups, families: chemFamilies, firstGroup: "periodicTable" },
};

export default function FloatingMathChemTable({ onInsert, onClose }) {
  const popupRef = useRef(null);
  const isWritingHandRef = useRef(false);
  const [matrixHover, setMatrixHover] = useState({ rows: 0, cols: 0 });
  const [matrixSize, setMatrixSize] = useState({ rows: 2, cols: 2 });
  const [matrixInputSize, setMatrixInputSize] = useState({
    rows: "2",
    cols: "2",
  });
  const [matrixStyle, setMatrixStyle] = useState("square");
  
  const [mode, setMode] = useState("math");
  const [activeGroup, setActiveGroup] = useState(modes.math.firstGroup);
  const [specialCategory, setSpecialCategory] = useState("symbol");
  const [symbolPickerCategory, setSymbolPickerCategory] = useState("symbol");
  const [symbolCode, setSymbolCode] = useState("");
  const [showSymbolPicker, setShowSymbolPicker] = useState(false);
  const [showHelpPanel, setShowHelpPanel] = useState(false);
  const [activePalette, setActivePalette] = useState(null);
  const [helpMode, setHelpMode] = useState("classic");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [draftHistory, setDraftHistory] = useState([]);
  const [draftFuture, setDraftFuture] = useState([]);
  const [draftParts, setDraftParts] = useState([]);
  const [draftCursorIndex, setDraftCursorIndex] = useState(0);
  const [draftFontFamily, setDraftFontFamily] = useState(FONT_OPTIONS[0]);
  const [draftFontSize, setDraftFontSize] = useState("16");
  const [draftColor, setDraftColor] = useState(COLOR_OPTIONS[0]);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    text: false,
  });
  const [handwritingStrokes, setHandwritingStrokes] = useState([]);

  const currentGroups = modes[mode].groups;
  const currentFamilies = modes[mode].families;
  const familyKeys = Object.keys(currentFamilies);
  const activeFamily = currentFamilies[activeGroup];
  const shouldShowSpecialCategory = activeGroup === "special";
  const activeSpecialCategory =
    SPECIAL_CHARACTER_CATEGORIES.find(({ id }) => id === specialCategory) ||
    SPECIAL_CHARACTER_CATEGORIES[0];
  const activeSymbolPickerCategory =
    SPECIAL_CHARACTER_CATEGORIES.find(({ id }) => id === symbolPickerCategory) ||
    SPECIAL_CHARACTER_CATEGORIES[0];
  const specialItems = shouldShowSpecialCategory
    ? sortItemsByLabel(
        getMergedItems(currentGroups, activeSpecialCategory.groups)
      )
    : [];
  const symbolPickerItems = sortItemsByLabel(
    getMergedItems(mathGroups, activeSymbolPickerCategory.groups)
  );
  const activeItems = [
    ...(activeGroup === "arrows" ||
    (mode === "chem" && activeGroup === "reactions")
      ? ARROW_TEMPLATES
      : []),
    ...getMergedItems(currentGroups, activeFamily.groups),
  ];
  const activeSymbolSections =
    mode === "math" && activeGroup === "basics"
      ? BASIC_SCREENSHOT_SECTIONS
      : null;
  const previewSize =
    matrixHover.rows && matrixHover.cols ? matrixHover : matrixSize;
  const isMatrixGroup = activeGroup === "matrices";

  const [position, setPosition] = useState({
    x: Math.max(10, window.innerWidth - PANEL_WIDTH - 20),
    y: Math.max(10, window.innerHeight - PANEL_HEIGHT - 20),
  });

  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const switchMode = (newMode) => {
    setMode(newMode);
    setActiveGroup(modes[newMode].firstGroup);
    setShowSymbolPicker(false);
    setShowHelpPanel(false);
    setActivePalette(null);
  };

  const rememberDraftHistory = () => {
    setDraftHistory((current) =>
      [
        ...current,
        {
          parts: draftParts,
          cursorIndex: draftCursorIndex,
        },
      ].slice(-25)
    );
    setDraftFuture([]);
  };

  const restoreDraftSnapshot = (snapshot) => {
    setDraftParts(snapshot.parts);
    setDraftCursorIndex(
      Math.min(snapshot.cursorIndex, snapshot.parts.length)
    );
  };

  const runDraftAction = (actionId) => {
    if (actionId === "undo") {
      if (!draftHistory.length) return;
      const previous = draftHistory[draftHistory.length - 1];
      setDraftFuture((current) =>
        [
          {
            parts: draftParts,
            cursorIndex: draftCursorIndex,
          },
          ...current,
        ].slice(0, 25)
      );
      setDraftHistory((current) => current.slice(0, -1));
      restoreDraftSnapshot(previous);
      return;
    }

    if (actionId === "redo") {
      if (!draftFuture.length) return;
      const next = draftFuture[0];
      setDraftHistory((current) =>
        [
          ...current,
          {
            parts: draftParts,
            cursorIndex: draftCursorIndex,
          },
        ].slice(-25)
      );
      setDraftFuture((current) => current.slice(1));
      restoreDraftSnapshot(next);
      return;
    }

    if (actionId === "clear-draft") {
      if (!draftParts.length) return;
      rememberDraftHistory();
      setDraftParts([]);
      setDraftCursorIndex(0);
      return;
    }

    if (actionId === "backspace" || actionId === "delete") {
      if (!draftParts.length) return;
      const removeIndex =
        actionId === "backspace" ? draftCursorIndex - 1 : draftCursorIndex;
      if (removeIndex < 0 || removeIndex >= draftParts.length) return;

      rememberDraftHistory();
      setDraftParts((current) =>
        current.filter((_, index) => index !== removeIndex)
      );
      setDraftCursorIndex(Math.max(0, removeIndex));
    }
  };

  const runFormatControl = (controlId) => {
    if (controlId === "color") {
      const currentIndex = COLOR_OPTIONS.indexOf(draftColor);
      setDraftColor(COLOR_OPTIONS[(currentIndex + 1) % COLOR_OPTIONS.length]);
      return;
    }

    if (controlId === "math-style") {
      setDraftFontFamily(FONT_OPTIONS[0]);
      setActiveFormats((current) => ({
        ...current,
        text: false,
      }));
      return;
    }

    setActiveFormats((current) => ({
      ...current,
      [controlId]: !current[controlId],
    }));

    if (controlId === "text") {
      setDraftFontFamily((current) =>
        current === "Arial" ? FONT_OPTIONS[0] : "Arial"
      );
    }
  };

  const isFormatControlActive = (controlId) => {
    if (controlId === "color") return draftColor !== COLOR_OPTIONS[0];
    if (controlId === "math-style") return draftFontFamily === FONT_OPTIONS[0];
    return Boolean(activeFormats[controlId]);
  };

  const getHandwritingPoint = (e) => {
    const bounds = e.currentTarget.getBoundingClientRect();

    return {
      x: Math.max(0, Math.min(bounds.width, e.clientX - bounds.left)),
      y: Math.max(0, Math.min(bounds.height, e.clientY - bounds.top)),
    };
  };

  const startHandwritingStroke = (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    isWritingHandRef.current = true;
    const point = getHandwritingPoint(e);
    setHandwritingStrokes((current) => [...current, [point]]);
  };

  const continueHandwritingStroke = (e) => {
    if (!isWritingHandRef.current) return;
    e.preventDefault();
    const point = getHandwritingPoint(e);
    setHandwritingStrokes((current) =>
      current.map((stroke, index) =>
        index === current.length - 1 ? [...stroke, point] : stroke
      )
    );
  };

  const stopHandwritingStroke = () => {
    isWritingHandRef.current = false;
  };

  const startDrag = (e) => {
    if (isMaximized) return;
    e.preventDefault();
    setDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const drag = (e) => {
    if (!dragging) return;

    const panelHeight = popupRef.current?.offsetHeight || 280;

    setPosition({
      x: Math.max(
        10,
        Math.min(
          window.innerWidth -
            Math.min(PANEL_WIDTH, window.innerWidth - 20) -
            10,
          e.clientX - offset.x
        )
      ),
      y: Math.max(
        10,
        Math.min(window.innerHeight - panelHeight - 5, e.clientY - offset.y)
      ),
    });
  };

  const stopDrag = () => setDragging(false);

  const toggleMinimized = () => {
    setIsMinimized((current) => !current);
  };

  const toggleMaximized = () => {
    setIsMaximized((current) => !current);
    setIsMinimized(false);
    setDragging(false);
  };

  const getDraftText = (item) => {
    if (typeof item === "string") return item;
    if (item?.type === "spacer") return "";
    if (item?.type === "visual-control") return "";
    if (item?.type === "format-control") return "";
    if (item?.type === "action-control") return "";
    if (item?.symbol) return item.symbol;
    if (item?.type === "formula") return item.display || item.label || "";
    return "";
  };

  const getExactPaletteText = (item) => {
    const text = getDraftText(item);
    const exactTextMap = {
      mod: "≡",
      rem: "%",
      div: "÷",
      deg: "°",
      rad: "ᶜ",
      floor: "⌊⌋",
      ceil: "⌈⌉",
      round: "○",
      trace: "tr",
      rank: "rk",
    };

    return exactTextMap[text] || text;
  };

  const getTemplateSlotCount = (item) => {
    if (item?.type === "formula") {
      return (item.display.match(/□/g) || []).length;
    }
    if (item?.type === "fraction-template") return 2;
    if (item?.type === "script-template") {
      return item.variant === "sub-sup" ? 3 : 2;
    }
    if (item?.type === "stacked-operator-template") {
      return item.variant === "under-over" || item.variant === "sub-sup"
        ? 2
        : 1;
    }
    if (item?.type === "accent-template") return 1;
    if (item?.type === "labeled-arrow") return item.slots.length;
    return 0;
  };

  const createDraftPart = (item) => ({
    id: `draft-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    kind: "template",
    template: item,
    slots: Array.from({ length: getTemplateSlotCount(item) }, () => ""),
  });

  const insertDraftPartAtCursor = (part) => {
    rememberDraftHistory();
    setDraftParts((current) => {
      const insertIndex = Math.min(
        Math.max(draftCursorIndex, 0),
        current.length
      );

      setDraftCursorIndex(insertIndex + 1);
      return [
        ...current.slice(0, insertIndex),
        part,
        ...current.slice(insertIndex),
      ];
    });
  };

  const appendToDraft = (item) => {
    if (item?.type === "symbol-panel-trigger") {
      setActivePalette(null);
      setShowHelpPanel(false);
      setShowSymbolPicker((current) => !current);
      return;
    }

    if (
      item?.type === "spacer" ||
      item?.type === "visual-control" ||
      item?.type === "format-control" ||
      item?.type === "action-control" ||
      item?.type === "palette-trigger"
    ) {
      if (item?.type === "format-control") runFormatControl(item.id);
      if (item?.type === "action-control") runDraftAction(item.id);
      return;
    }

    setActivePalette(null);

    if (item?.type) {
      insertDraftPartAtCursor(createDraftPart(item));
      return;
    }

    const text = getExactPaletteText(item);

    if (!text) {
      onInsert(item);
      return;
    }

    insertDraftPartAtCursor({
      id: `text-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      kind: "text",
      value: text,
    });
  };

  const serializeDraftPart = (part) => {
    if (part.kind === "text") return part.value;

    const template = part.template;
    const cleanSlot = (index) => part.slots[index] || "□";

    if (template.type === "formula") {
      let slotIndex = 0;
      return template.display.replaceAll("□", () => cleanSlot(slotIndex++));
    }
    if (template.type === "fraction-template") {
      return `${cleanSlot(0)}/${cleanSlot(1)}`;
    }
    if (template.type === "script-template") {
      if (template.variant === "sup") return `${cleanSlot(0)}^${cleanSlot(1)}`;
      if (template.variant === "sub") return `${cleanSlot(0)}_${cleanSlot(1)}`;
      return `${cleanSlot(0)}_${cleanSlot(1)}^${cleanSlot(2)}`;
    }
    if (template.type === "stacked-operator-template") {
      return `${template.operator}${part.slots
        .map((value, index) => (value ? `${index === 0 ? "_" : "^"}${value}` : ""))
        .join("")}`;
    }
    if (template.type === "accent-template") {
      const value = cleanSlot(0);
      if (template.accent === "box") return `□(${value})`;
      if (template.accent === "circle") return `○(${value})`;
      if (template.accent === "bar") return `${value}̄`;
      if (template.accent === "hat") return `${value}̂`;
      if (template.accent === "tilde") return `${value}̃`;
      return value;
    }
    if (template.type === "labeled-arrow") {
      const above = template.slots.includes("above") ? cleanSlot(0) : "";
      const below = template.slots.includes("below")
        ? cleanSlot(template.slots.includes("above") ? 1 : 0)
        : "";
      return `${above}${template.arrow}${below}`;
    }

    return "";
  };

  const getCurrentDraftStyle = () => ({
    fontFamily: draftFontFamily,
    fontSize: `${draftFontSize}px`,
    color: draftColor,
    fontWeight: activeFormats.bold ? "700" : "400",
    fontStyle: activeFormats.italic ? "italic" : "normal",
  });

  const getInsertValueForDraftPart = (part) => {
    if (part.kind === "text") {
      return {
        type: "styled-text",
        value: part.value,
        style: getCurrentDraftStyle(),
      };
    }

    if (
      part.template.type === "fraction-template" ||
      (part.template.type === "formula" && part.template.display === "□/□")
    ) {
      return {
        type: "filled-fraction-template",
        numerator: part.slots[0] || "□",
        denominator: part.slots[1] || "□",
        style: getCurrentDraftStyle(),
      };
    }

    return serializeDraftPart(part);
  };

  const insertDraft = () => {
    if (!draftParts.length) return;
    draftParts.forEach((part) => {
      onInsert(getInsertValueForDraftPart(part));
    });
    setDraftParts([]);
    setDraftCursorIndex(0);
  };

  const insertDraftOnShortcut = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      insertDraft();
    }
  };

  const insertSymbolCode = () => {
    const normalizedCode = symbolCode.trim().replace(/^U\+/i, "");
    const codePoint = Number.parseInt(normalizedCode, 16);

    if (!Number.isFinite(codePoint)) return;

    try {
      appendToDraft(String.fromCodePoint(codePoint));
      setSymbolCode("");
    } catch {
      // Ignore invalid Unicode code points.
    }
  };

  const openPalette = (item, e) => {
    const popupBounds = popupRef.current?.getBoundingClientRect();
    const buttonBounds = e.currentTarget.getBoundingClientRect();
    const popupWidth = popupBounds?.width || PANEL_WIDTH;
    const leftFromPopup = popupBounds
      ? buttonBounds.left - popupBounds.left
      : buttonBounds.left;
    const topFromPopup = popupBounds
      ? buttonBounds.bottom - popupBounds.top + 3
      : buttonBounds.bottom + 3;

    setShowSymbolPicker(false);
    setShowHelpPanel(false);
    setActivePalette((current) =>
      current?.id === item.id
        ? null
        : {
            id: item.id,
            items: item.items,
            left: Math.max(6, Math.min(leftFromPopup, popupWidth - 220)),
            top: topFromPopup,
          }
    );
  };

  const resolveMatrixDimension = (value) => {
    const parsedValue = Number.parseFloat(String(value).replace(",", "."));

    if (!Number.isFinite(parsedValue) || parsedValue < 1) return 1;
    return Math.min(MAX_TYPED_MATRIX_SIZE, Math.floor(parsedValue));
  };

  const syncMatrixSize = (nextSize) => {
    setMatrixSize(nextSize);
    setMatrixInputSize({
      rows: String(nextSize.rows),
      cols: String(nextSize.cols),
    });
  };

  const updateMatrixDimension = (dimension, value) => {
    setMatrixInputSize((current) => ({
      ...current,
      [dimension]: value,
    }));

    setMatrixSize((current) => ({
      ...current,
      [dimension]: resolveMatrixDimension(value),
    }));
  };

  const getResolvedMatrixSize = () => ({
    rows: resolveMatrixDimension(matrixInputSize.rows),
    cols: resolveMatrixDimension(matrixInputSize.cols),
  });

  const insertMatrix = (
    rows = getResolvedMatrixSize().rows,
    cols = getResolvedMatrixSize().cols
  ) => {
    const nextSize = {
      rows: resolveMatrixDimension(rows),
      cols: resolveMatrixDimension(cols),
    };

    setMatrixSize(nextSize);
    setMatrixInputSize({
      rows: String(nextSize.rows),
      cols: String(nextSize.cols),
    });
    onInsert(`MATRIX:${nextSize.rows}x${nextSize.cols}:${matrixStyle}`);
  };

  const insertMatrixPreset = (preset) => {
    syncMatrixSize({ rows: preset.rows, cols: preset.cols });
    setMatrixStyle(preset.style);
    onInsert(`MATRIX:${preset.rows}x${preset.cols}:${preset.style}`);
  };

  const insertMatrixOnEnter = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    insertMatrix();
  };

  const getSymbolSplitIndex = (items) => {
    if (items.length <= 9) return items.length;

    const splitByGroup = {
      basics: 18,
      relations: 9,
      operators: 9,
      calculus: 9,
      scripts: 9,
      arrows: 9,
      geometry: 9,
      greek: 12,
      sets: 10,
      statistics: 9,
      common: 9,
      reactions: 9,
      ions: 9,
      bonds: 9,
      elements: 12,
      terms: 9,
    };

    return Math.min(splitByGroup[activeGroup] || 9, items.length);
  };

  const getRelatedChunkSize = () => {
    const chunkByGroup = {
      basics: 18,
      relations: 9,
      operators: 9,
      calculus: 9,
      scripts: 9,
      arrows: 9,
      geometry: 9,
      greek: 12,
      sets: 9,
      statistics: 9,
      common: 9,
      reactions: 9,
      ions: 9,
      bonds: 9,
      elements: 12,
      terms: 9,
    };

    return chunkByGroup[activeGroup] || 9;
  };

  const getCompactSymbolText = (symbol) => {
    const value = getItemLabel(symbol);
    const compactLabels = {
      "d/dx": "d/dx",
      "dy/dx": "y′",
      "d²/dx²": "d²",
      "d³/dx³": "d³",
      "∂/∂x": "∂/∂x",
      "∂²/∂x²": "∂²",
      "∂³/∂x³": "∂³",
      "∫f(x)dx": "∫",
      "∫ₐᵇf(x)dx": "∫ₐᵇ",
      "∫₀∞f(x)dx": "∫₀∞",
      "∫₋∞∞f(x)dx": "∫∞",
      "∮C F·dr": "∮",
      "∬S f dS": "∬",
      "∭V f dV": "∭",
      "limₓ→a": "lim",
      "limₓ→∞": "lim∞",
      "Δy/Δx": "Δ/Δ",
      "∂f/∂x": "∂f",
      "∂²f/∂x²": "∂²f",
      "∇·F": "∇·",
      "∇×F": "∇×",
      laplacian: "∇²",
      limsup: "lim̅",
      liminf: "lim̲",
      arcsin: "asin",
      arccos: "acos",
      arctan: "atan",
      arsinh: "asinh",
      arcosh: "acosh",
      artanh: "atanh",
      floor: "⌊⌋",
      ceil: "⌈⌉",
      round: "○",
      trace: "tr",
      rank: "rk",
      mod: getExactPaletteText("mod"),
      rem: getExactPaletteText("rem"),
      div: getExactPaletteText("div"),
      deg: getExactPaletteText("deg"),
      rad: getExactPaletteText("rad"),
      "√(x²+y²)": "√□",
      "√[n](x)": "ⁿ√□",
      "(a+b)/(c+d)": "□/□",
      "x/y/z": "x/y",
    };

    if (compactLabels[value]) return compactLabels[value];

    if (symbol?.type === "formula") {
      return value
        .replaceAll(" ", "")
        .replace("lim(□→□)□", "lim")
        .replace("∫_□^□□d□", "∫□")
        .replace("∑_□^□□", "∑□")
        .replace("∏_□^□□", "∏□");
    }

    return value;
  };

  const getSymbolPreviewStyle = (symbol) => {
    const text = getCompactSymbolText(symbol);

    if (text.length <= 3) return styles.symbolPreviewText;
    if (text.length <= 5) {
      return {
        ...styles.symbolPreviewText,
        fontSize: "10px",
      };
    }

    return {
      ...styles.symbolPreviewText,
      fontSize: "8px",
    };
  };

  const renderSymbolPreview = (symbol) =>
    symbol?.type === "spacer" ? (
      <span style={styles.symbolPreviewText} />
    ) : symbol?.type === "visual-control" ? (
      <span style={styles.symbolPreviewText}>{symbol.label}</span>
    ) : symbol?.type === "format-control" ? (
      <span
        style={{
          ...styles.symbolPreviewText,
          ...(symbol.id === "color" ? { color: draftColor } : {}),
          ...(symbol.id === "bold" ? { fontWeight: "800" } : {}),
          ...(symbol.id === "italic" ? { fontStyle: "italic" } : {}),
        }}
      >
        {symbol.label}
      </span>
    ) : symbol?.type === "action-control" ? (
      <span style={styles.symbolPreviewText}>{symbol.label}</span>
    ) : symbol?.type === "symbol-panel-trigger" ? (
      <span style={styles.symbolPreviewText}>{symbol.label}</span>
    ) : symbol?.type === "palette-trigger" ? (
      <>
        {renderSymbolPreview(symbol.preview)}
        <span style={styles.paletteTriggerMarker} />
      </>
    ) : symbol?.type === "labeled-arrow" ? (
      <LabeledArrowPreview template={symbol} />
    ) : symbol?.type === "fraction-template" ? (
      <FractionPreview />
    ) : symbol?.type === "script-template" ? (
      <ScriptTemplatePreview template={symbol} />
    ) : symbol?.type === "stacked-operator-template" ? (
      <StackedOperatorPreview template={symbol} />
    ) : symbol?.type === "accent-template" ? (
      <AccentTemplatePreview template={symbol} />
    ) : (
      <span style={getSymbolPreviewStyle(symbol)}>
        {getCompactSymbolText(symbol)}
      </span>
    );

  const getSymbolButtonStyle = (symbol) => ({
    ...styles.symbolBtn,
    ...(symbol?.type === "visual-control" ? styles.wideSymbolBtn : {}),
    ...(symbol?.type === "spacer" ? styles.symbolSpacerBtn : {}),
    ...(symbol?.type === "format-control"
      ? {
          ...styles.formatControlBtn,
          ...(isFormatControlActive(symbol.id)
            ? styles.activeFormatControlBtn
            : {}),
        }
      : {}),
    ...(symbol?.type === "action-control" ? styles.actionControlBtn : {}),
    ...(symbol?.type === "palette-trigger"
      ? {
          ...styles.paletteTriggerBtn,
          ...(activePalette?.id === symbol.id
            ? styles.activePaletteTriggerBtn
            : {}),
        }
      : {}),
    ...(symbol?.type === "symbol-panel-trigger"
      ? {
          ...styles.symbolPanelTriggerBtn,
          ...(showSymbolPicker ? styles.activeSymbolPanelTriggerBtn : {}),
        }
      : {}),
  });

  const renderSymbolButton = (symbol, index, keyPrefix = "") => {
    if (symbol?.type === "visual-control") {
      const isFontControl = symbol.id === "font";

      return (
        <select
          key={`${keyPrefix}${getItemKey(symbol)}-${index}`}
          title={symbol.label}
          aria-label={symbol.label}
          value={isFontControl ? draftFontFamily : draftFontSize}
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) =>
            isFontControl
              ? setDraftFontFamily(e.target.value)
              : setDraftFontSize(e.target.value)
          }
          style={styles.visualSelect}
        >
          {(isFontControl ? FONT_OPTIONS : SIZE_OPTIONS).map((option) => (
            <option key={option} value={option}>
              {isFontControl ? option : `${option} pt`}
            </option>
          ))}
        </select>
      );
    }

    return (
      <button
        key={`${keyPrefix}${getItemKey(symbol)}-${index}`}
        type="button"
        title={
          typeof symbol === "string"
            ? symbol
            : symbol.title || symbol.label || symbol.symbol || ""
        }
        aria-hidden={symbol?.type === "spacer" ? "true" : undefined}
        tabIndex={symbol?.type === "spacer" ? -1 : undefined}
        onMouseDown={(e) => {
          e.preventDefault();
          if (symbol?.type === "palette-trigger") {
            openPalette(symbol, e);
            return;
          }
          appendToDraft(symbol);
        }}
        style={getSymbolButtonStyle(symbol)}
      >
        {renderSymbolPreview(symbol)}
      </button>
    );
  };

  const renderGroupedSymbols = (items, keyPrefix = "", sectionOverride = null) => {
    const splitIndex = getSymbolSplitIndex(items);
    const basicItems = items.slice(0, splitIndex);
    const frequentItems = items.slice(splitIndex);
    const relatedChunkSize = getRelatedChunkSize();
    const relatedChunks = [];

    for (let start = 0; start < frequentItems.length; start += relatedChunkSize) {
      relatedChunks.push(frequentItems.slice(start, start + relatedChunkSize));
    }

    const renderSeparator = (index) => (
      <span key={`separator-${keyPrefix}-${index}`} style={styles.symbolDivider}>
        <span style={styles.symbolDividerGrip} />
      </span>
    );
    const chunks =
      sectionOverride ||
      [basicItems, ...relatedChunks].filter((chunk) => chunk.length > 0);

    return (
      <>
        {chunks.map((chunk, chunkIndex) => (
          <Fragment key={`${keyPrefix || "default"}-chunk-${chunkIndex}`}>
            {chunkIndex > 0 && renderSeparator(chunkIndex)}
            <div style={styles.symbolSectionGrid}>
              {chunk.map((symbol, index) =>
                renderSymbolButton(
                  symbol,
                  sectionOverride
                    ? index
                    : chunkIndex === 0
                    ? index
                    : splitIndex + (chunkIndex - 1) * relatedChunkSize + index,
                  `${keyPrefix}chunk-${chunkIndex}-`
                )
              )}
            </div>
          </Fragment>
        ))}
      </>
    );
  };

  return (
    <div
      onMouseMove={drag}
      onMouseUp={stopDrag}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <div
        ref={popupRef}
        style={{
          ...styles.popup,
          ...(isMatrixGroup && !isMaximized && !isMinimized
            ? styles.matrixPopup
            : {}),
          ...(isMaximized ? styles.maximizedPopup : {}),
          ...(isMinimized ? styles.minimizedPopup : {}),
          left: isMaximized && !isMinimized ? 10 : position.x,
          top: isMaximized && !isMinimized ? 10 : position.y,
          pointerEvents: "auto",
        }}
      >
        <div
          style={{
            ...styles.header,
            ...(isMaximized ? styles.maximizedHeader : {}),
          }}
          onMouseDown={startDrag}
        >
          <div style={styles.title}>
            <span style={styles.titleMark}>{mode === "math" ? "Sum" : "Chem"}</span>
            <span>{mode === "math" ? "Math" : "Chemistry"} table</span>
          </div>

          <div style={styles.windowControls}>
            <button
              type="button"
              title={isMinimized ? "Restore" : "Minimize"}
              aria-label={
                isMinimized
                  ? "Restore math chemistry table"
                  : "Minimize math chemistry table"
              }
              onMouseDown={(e) => e.stopPropagation()}
              onClick={toggleMinimized}
              style={styles.windowControlBtn}
            >
              _
            </button>

            <button
              type="button"
              title={isMaximized ? "Restore" : "Maximize"}
              aria-label={
                isMaximized
                  ? "Restore math chemistry table"
                  : "Maximize math chemistry table"
              }
              onMouseDown={(e) => e.stopPropagation()}
              onClick={toggleMaximized}
              style={styles.windowControlBtn}
            >
              []
            </button>

            {onClose && (
              <button
                type="button"
                title="Close"
                aria-label="Close math chemistry table"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={onClose}
                style={{
                  ...styles.windowControlBtn,
                  ...styles.closeWindowControlBtn,
                }}
              >
                x
              </button>
            )}
          </div>
        </div>

        {!isMinimized && (
          <div style={styles.body}>
          <div style={styles.sidebar} onMouseDown={startDrag}>
            {familyKeys.map((key) => (
              <button
                key={key}
                type="button"
                title={currentFamilies[key].name}
                aria-label={currentFamilies[key].name}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => {
                  setActiveGroup(key);
                  setShowSymbolPicker(false);
                  setShowHelpPanel(false);
                  setActivePalette(null);
                }}
                style={{
                  ...styles.groupBtn,
                  ...(activeGroup === key ? styles.activeGroupBtn : {}),
                }}
              >
                {currentFamilies[key].icon}
              </button>
            ))}

            <span style={styles.sidebarSpacer} />

            <button
              type="button"
              title="Math mode"
              aria-label="Math mode"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => switchMode("math")}
              style={{
                ...styles.modeMiniBtn,
                ...(mode === "math" ? styles.activeModeMiniBtn : {}),
              }}
            >
              ∑
            </button>

            <button
              type="button"
              title="Chemistry mode"
              aria-label="Chemistry mode"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => switchMode("chem")}
              style={{
                ...styles.modeMiniBtn,
                ...(mode === "chem" ? styles.activeModeMiniBtn : {}),
              }}
            >
              ⚗
            </button>

            <button
              type="button"
              title="Help and handwriting"
              aria-label="Help and handwriting"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => {
                setHelpMode("hand");
                setShowHelpPanel((current) => !(current && helpMode === "hand"));
                setShowSymbolPicker(false);
                setActivePalette(null);
              }}
              style={styles.handwritingBtn}
            >
              ⌁
            </button>

            <button
              type="button"
              title="Help"
              aria-label="Help"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => {
                setHelpMode("classic");
                setShowHelpPanel((current) => !current);
                setShowSymbolPicker(false);
                setActivePalette(null);
              }}
              style={styles.helpBtn}
            >
              ?
            </button>

          </div>

          <div
            key={`${mode}-${activeGroup}-${specialCategory}`}
            style={{
              ...styles.symbolGrid,
              ...(isMatrixGroup ? styles.matrixSymbolGrid : {}),
            }}
          >
            {mode === "chem" && activeGroup === "periodicTable" ? (
              <div style={styles.periodicTableGrid}>
                {PERIODIC_TABLE_ELEMENTS.map((element) => (
                  <button
                    key={element.n}
                    type="button"
                    title={`${element.n} ${element.name}`}
                    aria-label={`Insert ${element.name}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      appendToDraft(element);
                    }}
                    style={{
                      ...styles.periodicElementBtn,
                      gridColumn: element.group,
                      gridRow: element.period,
                    }}
                  >
                    <span style={styles.periodicAtomicNumber}>{element.n}</span>
                    <span style={styles.periodicSymbol}>{element.symbol}</span>
                  </button>
                ))}
              </div>
            ) : activeGroup === "matrices" ? (
              <div
                style={styles.matrixPicker}
                onMouseLeave={() => setMatrixHover({ rows: 0, cols: 0 })}
              >
                <div style={styles.matrixPresets}>
                  {MATRIX_PRESETS.map((preset) => (
                    <button
                      key={`${preset.rows}x${preset.cols}-${preset.style}`}
                      type="button"
                      title={preset.label}
                      aria-label={`Insert ${preset.label}`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        insertMatrixPreset(preset);
                      }}
                      style={styles.matrixPresetBtn}
                    >
                      <span
                        style={{
                          ...styles.matrixPresetPreview,
                          ...(preset.style === "square"
                            ? styles.matrixPresetSquare
                            : {}),
                          ...(preset.style === "round"
                            ? styles.matrixPresetRound
                            : {}),
                          ...(preset.style === "bars"
                            ? styles.matrixPresetBars
                            : {}),
                          ...(preset.style === "double-bars"
                            ? styles.matrixPresetDoubleBars
                            : {}),
                          ...(preset.style === "curly" ||
                          preset.style === "cases"
                            ? styles.matrixPresetLeftBrace
                            : {}),
                        }}
                      >
                        <span
                          style={{
                            ...styles.matrixPresetCells,
                            gridTemplateColumns: `repeat(${preset.cols}, 5px)`,
                            gridTemplateRows: `repeat(${preset.rows}, 5px)`,
                          }}
                        >
                          {Array.from({
                            length: preset.rows * preset.cols,
                          }).map((_, index) => (
                            <span
                              key={index}
                              style={styles.matrixPresetCell}
                            />
                          ))}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>

                <div style={styles.matrixDivider} />

                <div style={styles.matrixGrid}>
                  {Array.from({ length: MAX_MATRIX_SIZE }).map((_, row) =>
                    Array.from({ length: MAX_MATRIX_SIZE }).map((_, col) => {
                      const isActive =
                        row < previewSize.rows && col < previewSize.cols;

                      return (
                        <button
                          key={`${row}-${col}`}
                          type="button"
                          aria-label={`Select ${row + 1} by ${col + 1} matrix`}
                          onMouseEnter={() =>
                            setMatrixHover({
                              rows: row + 1,
                              cols: col + 1,
                            })
                          }
                          onMouseDown={(e) => {
                            e.preventDefault();
                            const rows = row + 1;
                            const cols = col + 1;
                            syncMatrixSize({
                              rows,
                              cols,
                            });
                            insertMatrix(rows, cols);
                          }}
                          style={{
                            ...styles.matrixCell,
                            ...(isActive ? styles.activeMatrixCell : {}),
                            ...(row < matrixSize.rows &&
                            col < matrixSize.cols &&
                            !matrixHover.rows
                              ? styles.selectedMatrixCell
                              : {}),
                          }}
                        />
                      );
                    })
                  )}
                </div>

                <div style={styles.matrixInputs}>
                  <label style={styles.matrixInputLabel}>
                    Rows
                    <input
                      type="text"
                      inputMode="decimal"
                      value={matrixInputSize.rows}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) =>
                        updateMatrixDimension("rows", e.target.value)
                      }
                      onKeyDown={insertMatrixOnEnter}
                      style={styles.matrixInput}
                    />
                  </label>

                  <span style={styles.matrixInputSeparator}>×</span>

                  <label style={styles.matrixInputLabel}>
                    Columns
                    <input
                      type="text"
                      inputMode="decimal"
                      value={matrixInputSize.cols}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) =>
                        updateMatrixDimension("cols", e.target.value)
                      }
                      onKeyDown={insertMatrixOnEnter}
                      style={styles.matrixInput}
                    />
                  </label>
                </div>

                <div style={styles.matrixStyleSection}>
                  <span style={styles.matrixStyleTitle}>Style</span>
                  <div style={styles.matrixStyleGrid}>
                    {MATRIX_STYLES.map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        title={style.label}
                        aria-label={style.label}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setMatrixStyle(style.id)}
                        style={{
                          ...styles.matrixStyleBtn,
                          ...(matrixStyle === style.id
                            ? styles.activeMatrixStyleBtn
                            : {}),
                        }}
                      >
                        {style.preview}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            ) : shouldShowSpecialCategory ? (
              <>
                <div style={styles.specialCategoryBar}>
                  <label style={styles.specialCategoryLabel}>
                    Category
                    <select
                      value={specialCategory}
                      onChange={(e) => setSpecialCategory(e.target.value)}
                      style={styles.specialCategorySelect}
                    >
                      {SPECIAL_CHARACTER_CATEGORIES.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {renderGroupedSymbols(
                  specialItems,
                  `${activeSpecialCategory.id}-`
                )}
              </>
            ) : (
              renderGroupedSymbols(activeItems, "", activeSymbolSections)
            )}
          </div>

          {activePalette && (
            <div
              style={{
                ...styles.paletteFlyout,
                left: activePalette.left,
                top: activePalette.top,
              }}
            >
              <div style={styles.paletteFlyoutGrid}>
                {activePalette.items.map((symbol, index) => (
                  <button
                    key={`palette-${activePalette.id}-${getItemKey(symbol)}-${index}`}
                    type="button"
                    title={getItemLabel(symbol)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      appendToDraft(symbol);
                      setActivePalette(null);
                    }}
                    style={styles.paletteFlyoutBtn}
                  >
                    {renderSymbolPreview(symbol)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showSymbolPicker && (
            <div style={styles.symbolPickerPopup}>
              <div style={styles.symbolPickerControls}>
                <label style={styles.symbolPickerCodeLabel}>
                  Code:
                  <input
                    type="text"
                    value={symbolCode}
                    onChange={(e) => setSymbolCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        insertSymbolCode();
                      }
                    }}
                    style={styles.symbolPickerCodeInput}
                  />
                </label>

                <select
                  value={symbolPickerCategory}
                  onChange={(e) => setSymbolPickerCategory(e.target.value)}
                  style={styles.symbolPickerSelect}
                >
                  {SPECIAL_CHARACTER_CATEGORIES.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.symbolPickerGrid}>
                {symbolPickerItems.map((symbol, index) => (
                  <button
                    key={`symbol-picker-${getItemKey(symbol)}-${index}`}
                    type="button"
                    title={getItemLabel(symbol)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      appendToDraft(symbol);
                      setShowSymbolPicker(false);
                    }}
                    style={styles.symbolPickerItemBtn}
                  >
                    {getCompactSymbolText(symbol)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showHelpPanel && (
            <div style={styles.helpPanel}>
              <div style={styles.helpPanelTabs}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setHelpMode("classic")}
                  style={
                    helpMode === "classic"
                      ? styles.activeHelpModeBtn
                      : styles.helpModeBtn
                  }
                >
                  Classic
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setHelpMode("hand")}
                  style={
                    helpMode === "hand"
                      ? styles.activeHelpModeBtn
                      : styles.helpModeBtn
                  }
                >
                  Hand
                </button>
              </div>
              {helpMode === "hand" ? (
                <>
                  <div
                    style={styles.handwritingPad}
                    onPointerDown={startHandwritingStroke}
                    onPointerMove={continueHandwritingStroke}
                    onPointerUp={stopHandwritingStroke}
                    onPointerLeave={stopHandwritingStroke}
                  >
                    {handwritingStrokes.length === 0 && (
                      <span style={styles.handwritingGlyph}>∫</span>
                    )}
                    <svg
                      width="100%"
                      height="100%"
                      viewBox="0 0 198 96"
                      preserveAspectRatio="none"
                      style={styles.handwritingSvg}
                    >
                      {handwritingStrokes.map((stroke, index) => (
                        <polyline
                          key={index}
                          points={stroke
                            .map((point) => `${point.x},${point.y}`)
                            .join(" ")}
                          fill="none"
                          stroke="#1f2937"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      ))}
                    </svg>
                  </div>
                  <div style={styles.handwritingActions}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setHandwritingStrokes([])}
                      style={styles.handwritingSmallBtn}
                    >
                      Clear
                    </button>
                    <div style={styles.handwritingCandidates}>
                      {HANDWRITING_CANDIDATES.map((candidate) => (
                        <button
                          key={candidate}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => appendToDraft(candidate)}
                          style={styles.handwritingCandidateBtn}
                        >
                          {candidate}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div style={styles.classicPanel}>
                  <label style={styles.classicCodeLabel}>
                    Code
                    <input
                      type="text"
                      value={symbolCode}
                      onChange={(e) => setSymbolCode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          insertSymbolCode();
                        }
                      }}
                      style={styles.classicCodeInput}
                    />
                  </label>
                  <div style={styles.classicQuickGrid}>
                    {symbolPickerItems.slice(0, 24).map((symbol, index) => (
                      <button
                        key={`classic-${getItemKey(symbol)}-${index}`}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          appendToDraft(symbol);
                        }}
                        style={styles.classicQuickBtn}
                      >
                        {getCompactSymbolText(symbol)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <MathChemDraftComposer
            parts={draftParts}
            onPartsChange={setDraftParts}
            cursorIndex={draftCursorIndex}
            onCursorIndexChange={setDraftCursorIndex}
            onInsert={insertDraft}
            onClear={() => {
              if (draftParts.length) rememberDraftHistory();
              setDraftParts([]);
              setDraftCursorIndex(0);
            }}
            onKeyDown={insertDraftOnShortcut}
            fontFamily={draftFontFamily}
            fontSize={`${draftFontSize}px`}
            color={draftColor}
            isBold={activeFormats.bold}
            isItalic={activeFormats.italic}
          />
          </div>
        )}
      </div>
    </div>
  );
}

function LabeledArrowPreview({ template }) {
  const hasAbove = template.slots.includes("above");
  const hasBelow = template.slots.includes("below");

  return (
    <span style={styles.labeledArrowPreview}>
      <span style={styles.labeledArrowPreviewSlot}>
        {hasAbove && <span style={styles.layoutPreviewSlot} />}
      </span>
      <span style={styles.labeledArrowPreviewGlyph}>{template.arrow}</span>
      <span style={styles.labeledArrowPreviewSlot}>
        {hasBelow && <span style={styles.layoutPreviewSlot} />}
      </span>
    </span>
  );
}

function FractionPreview() {
  return (
    <span style={styles.layoutPreviewStack}>
      <span style={styles.layoutPreviewSlot} />
      <span style={styles.layoutPreviewFractionLine} />
      <span style={styles.layoutPreviewSlot} />
    </span>
  );
}

function ScriptTemplatePreview({ template }) {
  const hasSup = template.variant === "sup" || template.variant === "sub-sup";
  const hasSub = template.variant === "sub" || template.variant === "sub-sup";

  return (
    <span style={styles.scriptTemplatePreview}>
      <span style={styles.layoutPreviewSlot} />
      <span style={styles.scriptTemplateSlots}>
        {hasSup && <span style={styles.layoutPreviewSlot} />}
        {hasSub && <span style={styles.layoutPreviewSlot} />}
      </span>
    </span>
  );
}

function StackedOperatorPreview({ template }) {
  const isSideScript = ["sup", "sub", "sub-sup"].includes(template.variant);
  const hasSup = ["sup", "sub-sup"].includes(template.variant);
  const hasSub = ["sub", "sub-sup"].includes(template.variant);
  const hasOver = ["over", "under-over"].includes(template.variant);
  const hasUnder = ["under", "under-over"].includes(template.variant);

  if (isSideScript) {
    return (
      <span style={styles.stackedOperatorSidePreview}>
        <span style={styles.stackedOperatorGlyph}>{template.operator}</span>
        <span style={styles.stackedOperatorSideSlots}>
          {hasSup && <span style={styles.layoutPreviewSlot} />}
          {hasSub && <span style={styles.layoutPreviewSlot} />}
        </span>
      </span>
    );
  }

  return (
    <span style={styles.stackedOperatorPreview}>
      {hasOver && <span style={styles.layoutPreviewSlot} />}
      <span style={styles.stackedOperatorGlyph}>{template.operator}</span>
      {hasUnder && <span style={styles.layoutPreviewSlot} />}
    </span>
  );
}

function AccentTemplatePreview({ template }) {
  return (
    <span style={styles.accentTemplatePreview}>
      {["left-bar", "right-bar", "box", "circle", "slash", "cross"].includes(
        template.accent
      ) ? (
        <span
          style={{
            ...styles.accentEnclosurePreview,
            ...(template.accent === "left-bar"
              ? styles.accentEnclosureLeftBar
              : {}),
            ...(template.accent === "right-bar"
              ? styles.accentEnclosureRightBar
              : {}),
            ...(template.accent === "box" ? styles.accentEnclosureBox : {}),
            ...(template.accent === "circle"
              ? styles.accentEnclosureCircle
              : {}),
          }}
        >
          <span style={styles.layoutPreviewSlot} />
          {template.accent === "slash" && (
            <span style={styles.accentEnclosureSlash} />
          )}
          {template.accent === "cross" && (
            <>
              <span style={styles.accentEnclosureSlash} />
              <span style={styles.accentEnclosureBackslash} />
            </>
          )}
        </span>
      ) : (
        <>
          <span style={styles.accentTemplateMark}>
            {getAccentPreviewMark(template.accent)}
          </span>
          <span style={styles.layoutPreviewSlot} />
          {template.accent === "underbar" && (
            <span style={styles.accentTemplateMark}>_</span>
          )}
        </>
      )}
    </span>
  );
}

function getAccentPreviewMark(accent) {
  const accentMarks = {
    bar: "¯",
    underbar: "",
    hat: "ˆ",
    tilde: "˜",
    dot: "˙",
    "double-dot": "¨",
    "right-arrow": "→",
    "left-arrow": "←",
    "double-arrow": "↔",
  };

  return accentMarks[accent] || "¯";
}

const styles = {
  popup: {
    position: "absolute",
    width: `min(${PANEL_WIDTH}px, calc(100vw - 20px))`,
    display: "grid",
    gridTemplateRows: "28px 1fr",
    height: `min(${PANEL_HEIGHT}px, calc(100vh - 20px))`,
    maxHeight: "calc(100vh - 20px)",
    background: "#f8fafc",
    color: "#20252b",
    border: "1px solid #7f98a6",
    borderRadius: "8px",
    boxShadow: "0 14px 32px rgba(15,23,42,0.22)",
    overflow: "hidden",
    marginBottom: "5px",
  },

  minimizedPopup: {
    width: "340px",
    height: "28px",
    minHeight: "28px",
    gridTemplateRows: "28px",
  },

  maximizedPopup: {
    width: "calc(100vw - 20px)",
    height: "calc(100vh - 20px)",
    maxHeight: "calc(100vh - 20px)",
    borderRadius: "6px",
  },

  matrixPopup: {
    height: "auto",
    maxHeight: "calc(100vh - 20px)",
  },

  header: {
    height: "28px",
    padding: "0 8px 0 10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#7f98a6",
    color: "#ffffff",
    cursor: "move",
    userSelect: "none",
    fontSize: "12px",
    borderBottom: "1px solid #a8b3bf",
  },

  maximizedHeader: {
    cursor: "default",
  },

  title: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    fontWeight: "600",
  },

  titleMark: {
    color: "#ffffff",
    fontFamily: "serif",
    fontSize: "17px",
    fontWeight: "700",
    lineHeight: 1,
  },

  windowControls: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },

  windowControlBtn: {
    width: "24px",
    height: "20px",
    padding: 0,
    border: "1px solid rgba(255,255,255,0.45)",
    borderRadius: "3px",
    background: "rgba(255,255,255,0.18)",
    color: "#ffffff",
    cursor: "pointer",
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: "12px",
    fontWeight: "800",
    lineHeight: "18px",
  },

  closeWindowControlBtn: {
    background: "#c2413f",
    borderColor: "#a63635",
  },

  modeBar: {
    display: "flex",
    alignItems: "center",
    gap: "2px",
    padding: "2px 6px 0",
    borderBottom: "1px solid #8fa4b0",
    background: "#d7e3ea",
  },

  modeBtn: {
    width: "62px",
    height: "26px",
    border: "1px solid #5f7886",
    borderRadius: "5px 5px 0 0",
    background: "linear-gradient(180deg, #7f98a6 0%, #425e6d 100%)",
    color: "#f8fafc",
    cursor: "pointer",
    fontSize: "10px",
    fontWeight: "600",
  },

  activeModeBtn: {
    background: "linear-gradient(180deg, #eef5f8 0%, #cbdce5 100%)",
    color: "#1f3340",
    borderColor: "#8fa4b0",
  },

  body: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    minHeight: 0,
    overflow: "hidden",
    background: "#ffffff",
  },

  sidebar: {
    flex: "0 0 28px",
    minHeight: "28px",
    padding: "1px 4px 0",
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "2px",
    background: "#eef4f7",
    borderBottom: "1px solid #8fa4b0",
    overflow: "hidden",
  },

  groupBtn: {
    width: "52px",
    height: "27px",
    flex: "0 0 52px",
    border: "1px solid #5f7886",
    borderRadius: "5px 5px 0 0",
    background: "linear-gradient(180deg, #7f98a6 0%, #405b68 100%)",
    color: "#f8fafc",
    cursor: "pointer",
    fontFamily: "Cambria Math, STIX Two Math, serif",
    fontSize: "17px",
    fontWeight: "600",
  },

  activeGroupBtn: {
    background: "linear-gradient(180deg, #eef5f8 0%, #cbdce5 100%)",
    color: "#0f172a",
    borderColor: "#8fa4b0",
    boxShadow: "none",
  },

  sidebarSpacer: {
    flex: "1 1 auto",
    minWidth: "8px",
  },

  modeMiniBtn: {
    width: "28px",
    height: "24px",
    flex: "0 0 28px",
    border: "1px solid #8ea6b3",
    borderRadius: "3px",
    background: "linear-gradient(180deg, #eef5f8 0%, #cbdce5 100%)",
    color: "#304957",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "700",
  },

  activeModeMiniBtn: {
    borderColor: "#526b78",
    background: "linear-gradient(180deg, #7f98a6 0%, #405b68 100%)",
    color: "#ffffff",
  },

  helpBtn: {
    width: "22px",
    height: "22px",
    flex: "0 0 22px",
    padding: 0,
    border: "none",
    borderRadius: "50%",
    background: "#2f5363",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "800",
    lineHeight: "22px",
  },

  closeMiniBtn: {
    width: "22px",
    height: "22px",
    flex: "0 0 22px",
    padding: 0,
    border: "1px solid #8ea6b3",
    borderRadius: "3px",
    background: "linear-gradient(180deg, #eef5f8 0%, #cbdce5 100%)",
    color: "#304957",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "800",
    lineHeight: "20px",
  },

  handwritingBtn: {
    width: "44px",
    height: "24px",
    flex: "0 0 44px",
    border: "1px solid #d9a3aa",
    borderRadius: "5px 5px 0 0",
    background: "linear-gradient(180deg, #f6d5d8 0%, #d48b95 100%)",
    color: "#ffffff",
    cursor: "pointer",
    fontFamily: "Cambria Math, STIX Two Math, serif",
    fontSize: "18px",
    fontWeight: "800",
    lineHeight: "20px",
  },

  symbolGrid: {
    flex: "0 0 104px",
    height: "104px",
    minHeight: "104px",
    maxHeight: "104px",
    padding: "7px 8px",
    boxSizing: "border-box",
    display: "flex",
    flexWrap: "nowrap",
    alignItems: "center",
    gap: "6px",
    overflowX: "auto",
    overflowY: "hidden",
    background: "linear-gradient(180deg, #eef5f8 0%, #d7e5ec 100%)",
    borderBottom: "1px solid #b8cad5",
  },

  matrixSymbolGrid: {
    flex: "0 1 auto",
    height: "auto",
    minHeight: 0,
    maxHeight: "170px",
    flexWrap: "wrap",
    overflowX: "hidden",
    overflowY: "auto",
  },

  symbolSectionGrid: {
    flex: "0 0 auto",
    height: "90px",
    display: "grid",
    gridTemplateRows: "repeat(3, 28px)",
    gridAutoColumns: "30px",
    gridAutoFlow: "column",
    gap: "3px",
    alignContent: "start",
    paddingRight: "2px",
  },

  symbolDivider: {
    alignSelf: "center",
    width: "5px",
    height: "88px",
    minHeight: "88px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "-2px",
  },

  symbolDividerGrip: {
    width: "1px",
    height: "100%",
    minHeight: "88px",
    borderLeft: "1px solid #93a7b5",
    borderRight: "1px solid #eaf3f7",
    borderRadius: "3px",
    background: "#b8cad5",
  },

  specialCategoryBar: {
    flex: "0 0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
  },

  specialCategoryLabel: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#475569",
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: "11px",
    fontWeight: "700",
  },

  specialCategorySelect: {
    width: "140px",
    height: "28px",
    border: "1px solid #aab6c2",
    borderRadius: "4px",
    background: "#ffffff",
    color: "#0f172a",
    fontSize: "12px",
    fontWeight: "600",
    outline: "none",
  },

  matrixPicker: {
    flex: "0 0 100%",
    height: "100%",
    overflow: "auto",
    width: "100%",
    padding: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "12px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    background: "#f8fafc",
    boxSizing: "border-box",
  },

  periodicTableGrid: {
    flex: "0 0 auto",
    height: "100%",
    minWidth: "520px",
    display: "grid",
    gridTemplateColumns: "repeat(18, 26px)",
    gridAutoRows: "30px",
    gap: "2px",
    justifyContent: "center",
    overflow: "auto",
  },

  periodicElementBtn: {
    position: "relative",
    width: "26px",
    height: "30px",
    padding: "2px",
    border: "1px solid #9fb3c8",
    borderRadius: "3px",
    background: "linear-gradient(180deg, #ffffff 0%, #edf7f0 100%)",
    color: "#123524",
    cursor: "pointer",
    fontFamily: "Inter, system-ui, sans-serif",
    lineHeight: 1,
    overflow: "hidden",
  },

  periodicAtomicNumber: {
    position: "absolute",
    top: "2px",
    left: "3px",
    color: "#64748b",
    fontSize: "7px",
    fontWeight: "700",
  },

  periodicSymbol: {
    display: "block",
    paddingTop: "9px",
    textAlign: "center",
    fontSize: "11px",
    fontWeight: "800",
  },

  matrixPresets: {
    width: "100%",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "4px",
  },

  matrixPresetBtn: {
    width: "40px",
    height: "40px",
    padding: "3px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #c5d0d9",
    borderRadius: "4px",
    background: "linear-gradient(180deg, #ffffff 0%, #e8eef3 100%)",
    color: "#16833a",
    cursor: "pointer",
  },

  matrixPresetPreview: {
    minWidth: "20px",
    minHeight: "22px",
    padding: "3px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
  },

  matrixPresetSquare: {
    borderLeft: "2px solid #526775",
    borderRight: "2px solid #526775",
    borderRadius: "2px",
  },

  matrixPresetRound: {
    borderLeft: "2px solid #526775",
    borderRight: "2px solid #526775",
    borderRadius: "50%",
  },

  matrixPresetBars: {
    borderLeft: "2px solid #526775",
    borderRight: "2px solid #526775",
  },

  matrixPresetDoubleBars: {
    borderLeft: "4px double #526775",
    borderRight: "4px double #526775",
  },

  matrixPresetLeftBrace: {
    borderLeft: "3px double #526775",
    borderRadius: "45% 0 0 45%",
  },

  matrixPresetCells: {
    display: "grid",
    gap: "2px",
  },

  matrixPresetCell: {
    width: "5px",
    height: "5px",
    border: "1px solid #15913b",
    background: "#ffffff",
    boxSizing: "border-box",
  },

  matrixDivider: {
    width: "100%",
    borderTop: "1px solid #d7e0e7",
  },

  matrixGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 17px)",
    justifyContent: "center",
    gap: "2px",
  },

  matrixInputs: {
    display: "flex",
    alignItems: "flex-end",
    gap: "6px",
  },

  matrixInputLabel: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    color: "#475569",
    fontSize: "11px",
    fontWeight: "700",
  },

  matrixInput: {
    width: "48px",
    height: "26px",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "4px",
    background: "#ffffff",
    color: "#0f172a",
    textAlign: "center",
    fontSize: "12px",
    fontWeight: "700",
    outline: "none",
  },

  matrixInputSeparator: {
    height: "26px",
    display: "flex",
    alignItems: "center",
    color: "#64748b",
    fontWeight: "700",
  },

  matrixStyleSection: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  matrixStyleTitle: {
    color: "#475569",
    fontSize: "11px",
    fontWeight: "700",
  },

  matrixStyleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 42px)",
    gap: "4px",
  },

  matrixStyleBtn: {
    height: "28px",
    padding: "0 4px",
    border: "1px solid #cbd5e1",
    borderRadius: "4px",
    background: "#ffffff",
    color: "#334155",
    cursor: "pointer",
    fontFamily: "serif",
    fontSize: "15px",
    fontWeight: "700",
  },

  activeMatrixStyleBtn: {
    borderColor: "#1d4ed8",
    background: "#dbeafe",
    color: "#1d4ed8",
    boxShadow: "inset 0 0 0 1px #1d4ed8",
  },

  matrixCell: {
    width: "17px",
    height: "17px",
    padding: 0,
    border: "1px solid #cbd5e1",
    borderRadius: "3px",
    background: "#ffffff",
    cursor: "pointer",
  },

  activeMatrixCell: {
    background: "#2563eb",
    borderColor: "#2563eb",
  },

  selectedMatrixCell: {
    background: "#1d4ed8",
    borderColor: "#1d4ed8",
  },

  symbolBtn: {
    width: "30px",
    minWidth: "30px",
    maxWidth: "30px",
    height: "28px",
    minHeight: "28px",
    maxHeight: "28px",
    padding: "1px 2px",
    border: "1px solid #c6d3dc",
    borderRadius: "4px",
    background: "linear-gradient(180deg, #ffffff 0%, #edf4f8 100%)",
    color: "#123524",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Cambria Math, STIX Two Math, serif",
    fontSize: "16px",
    whiteSpace: "nowrap",
    overflow: "visible",
    boxShadow: "0 1px 0 rgba(255,255,255,0.75) inset",
  },

  wideSymbolBtn: {
    width: "96px",
    minWidth: "96px",
    maxWidth: "96px",
    gridColumn: "span 3",
    justifyContent: "flex-start",
    paddingLeft: "6px",
    border: "1px solid #b7c2ca",
    background: "linear-gradient(180deg, #eef3f5 0%, #d9e2e7 100%)",
    color: "#6b7280",
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: "11px",
  },

  symbolSpacerBtn: {
    pointerEvents: "none",
    visibility: "hidden",
  },

  symbolPanelTriggerBtn: {
    border: "1px solid #8ca4b1",
    borderRadius: "3px",
    background: "linear-gradient(180deg, #f8fbfd 0%, #dce8ee 100%)",
    color: "#7d3fb2",
    fontWeight: "800",
  },

  activeSymbolPanelTriggerBtn: {
    borderColor: "#f2c94c",
    boxShadow: "inset 0 0 0 1px #f2c94c",
    background: "#fff8d8",
  },

  formatControlBtn: {
    color: "#1f2937",
    fontFamily: "Cambria Math, STIX Two Math, serif",
    fontWeight: "700",
  },

  activeFormatControlBtn: {
    border: "1px solid #f2c94c",
    borderRadius: "3px",
    background: "#fff8d8",
    boxShadow: "inset 0 0 0 1px #f2c94c",
  },

  actionControlBtn: {
    color: "#405b68",
    fontWeight: "700",
  },

  visualSelect: {
    width: "96px",
    minWidth: "96px",
    maxWidth: "96px",
    height: "28px",
    gridColumn: "span 3",
    padding: "0 18px 0 6px",
    border: "1px solid #b7c2ca",
    borderRadius: 0,
    background: "linear-gradient(180deg, #eef3f5 0%, #d9e2e7 100%)",
    color: "#6b7280",
    cursor: "pointer",
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: "11px",
    fontWeight: "700",
    outline: "none",
  },

  paletteTriggerBtn: {
    position: "relative",
  },

  activePaletteTriggerBtn: {
    background: "rgba(255,255,255,0.55)",
    boxShadow: "inset 0 0 0 1px #7f98a6",
  },

  paletteTriggerMarker: {
    position: "absolute",
    right: "1px",
    bottom: "1px",
    width: 0,
    height: 0,
    borderTop: "4px solid #9aa8b0",
    borderLeft: "4px solid transparent",
  },

  paletteFlyout: {
    position: "absolute",
    zIndex: 6,
    minWidth: "64px",
    maxWidth: "220px",
    padding: "4px",
    border: "1px solid #8ea4b0",
    borderRadius: "4px",
    background: "linear-gradient(180deg, #eef5f8 0%, #cbdde7 100%)",
    boxShadow: "0 8px 18px rgba(15, 23, 42, 0.18)",
  },

  paletteFlyoutGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 30px)",
    gridAutoRows: "30px",
    gap: "2px",
  },

  paletteFlyoutBtn: {
    width: "30px",
    height: "30px",
    padding: "0 1px",
    border: "1px solid #c6d3dc",
    borderRadius: "3px",
    background: "#ffffff",
    color: "#123524",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Cambria Math, STIX Two Math, serif",
    fontSize: "16px",
    overflow: "visible",
  },

  symbolPickerPopup: {
    position: "absolute",
    top: "78px",
    right: "170px",
    width: "280px",
    height: "242px",
    zIndex: 4,
    padding: "10px",
    boxSizing: "border-box",
    border: "1px solid #aab7c1",
    background: "linear-gradient(180deg, #f8fafc 0%, #e4edf2 100%)",
    boxShadow: "0 8px 18px rgba(15, 23, 42, 0.18)",
  },

  helpPanel: {
    position: "absolute",
    top: "116px",
    right: "16px",
    width: "214px",
    height: "170px",
    zIndex: 5,
    padding: "8px",
    boxSizing: "border-box",
    border: "1px solid #aab7c1",
    background: "linear-gradient(180deg, #f8fafc 0%, #e4edf2 100%)",
    boxShadow: "0 8px 18px rgba(15, 23, 42, 0.18)",
  },

  helpPanelTabs: {
    display: "flex",
    gap: "4px",
    marginBottom: "8px",
  },

  helpModeBtn: {
    height: "26px",
    padding: "0 10px",
    border: "1px solid #cbd5e1",
    borderRadius: "4px",
    background: "#ffffff",
    color: "#475569",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "700",
  },

  activeHelpModeBtn: {
    height: "26px",
    padding: "0 10px",
    border: "1px solid #526b78",
    borderRadius: "4px",
    background: "linear-gradient(180deg, #7f98a6 0%, #405b68 100%)",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "700",
  },

  handwritingPad: {
    height: "96px",
    position: "relative",
    border: "1px solid #b7c2ca",
    background:
      "linear-gradient(90deg, rgba(148,163,184,0.15) 1px, transparent 1px), linear-gradient(0deg, rgba(148,163,184,0.15) 1px, transparent 1px), #ffffff",
    backgroundSize: "22px 22px",
    overflow: "hidden",
    touchAction: "none",
  },

  handwritingGlyph: {
    position: "absolute",
    left: "74px",
    top: "26px",
    color: "#7f98a6",
    fontFamily: "Cambria Math, STIX Two Math, serif",
    fontSize: "54px",
    fontStyle: "italic",
    opacity: 0.6,
  },

  handwritingSvg: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  },

  handwritingActions: {
    height: "34px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  handwritingSmallBtn: {
    height: "24px",
    padding: "0 8px",
    border: "1px solid #cbd5e1",
    borderRadius: "3px",
    background: "#ffffff",
    color: "#475569",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "700",
  },

  handwritingCandidates: {
    display: "grid",
    gridTemplateColumns: "repeat(8, 19px)",
    gap: "2px",
  },

  handwritingCandidateBtn: {
    width: "19px",
    height: "22px",
    padding: 0,
    border: "1px solid transparent",
    borderRadius: "2px",
    background: "transparent",
    color: "#123524",
    cursor: "pointer",
    fontFamily: "Cambria Math, STIX Two Math, serif",
    fontSize: "14px",
    lineHeight: "20px",
  },

  classicPanel: {
    height: "130px",
    display: "grid",
    gridTemplateRows: "28px 1fr",
    gap: "6px",
  },

  classicCodeLabel: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    color: "#64748b",
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: "12px",
    fontWeight: "700",
  },

  classicCodeInput: {
    width: "112px",
    height: "22px",
    padding: "0 6px",
    boxSizing: "border-box",
    border: "1px solid #111827",
    borderRadius: "12px",
    background: "#ffffff",
    outline: "none",
  },

  classicQuickGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(8, 22px)",
    gridAutoRows: "20px",
    gap: "0",
    overflow: "hidden",
  },

  classicQuickBtn: {
    width: "22px",
    height: "20px",
    padding: 0,
    border: "none",
    background: "transparent",
    color: "#6f8795",
    cursor: "pointer",
    fontFamily: "Cambria Math, STIX Two Math, serif",
    fontSize: "13px",
    lineHeight: "20px",
    textAlign: "center",
    overflow: "hidden",
  },

  symbolPickerControls: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
  },

  symbolPickerCodeLabel: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#64748b",
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: "12px",
    fontWeight: "700",
  },

  symbolPickerCodeInput: {
    width: "84px",
    height: "23px",
    padding: "0 6px",
    boxSizing: "border-box",
    border: "1px solid #111827",
    borderRadius: "12px",
    background: "#ffffff",
    outline: "none",
  },

  symbolPickerSelect: {
    flex: "1 1 auto",
    height: "30px",
    padding: "0 12px",
    border: "1px solid #111827",
    borderRadius: "12px",
    background: "#ffffff",
    color: "#111827",
    fontSize: "14px",
    fontWeight: "700",
    outline: "none",
  },

  symbolPickerGrid: {
    height: "188px",
    padding: "4px 28px 4px 4px",
    boxSizing: "border-box",
    display: "grid",
    gridTemplateColumns: "repeat(9, 20px)",
    gridAutoRows: "20px",
    gap: "0",
    overflowY: "auto",
    overflowX: "hidden",
    background:
      "linear-gradient(90deg, transparent calc(100% - 24px), #4b5563 calc(100% - 24px), #4b5563 100%)",
  },

  symbolPickerItemBtn: {
    width: "20px",
    height: "20px",
    padding: 0,
    border: "none",
    background: "transparent",
    color: "#6f8795",
    cursor: "pointer",
    fontFamily: "Cambria Math, STIX Two Math, serif",
    fontSize: "14px",
    lineHeight: "20px",
    textAlign: "center",
    overflow: "hidden",
  },

  symbolPreviewText: {
    display: "block",
    width: "100%",
    overflow: "visible",
    textAlign: "center",
    fontSize: "16px",
    lineHeight: "26px",
    whiteSpace: "nowrap",
  },

  labeledArrowPreview: {
    minWidth: "28px",
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
    lineHeight: 1,
  },

  labeledArrowPreviewSlot: {
    height: "7px",
    display: "flex",
    alignItems: "center",
  },

  labeledArrowPreviewGlyph: {
    color: "#64748b",
    fontSize: "22px",
    fontWeight: "400",
    lineHeight: "12px",
    opacity: 0.75,
    transform: "scaleX(1.05)",
  },

  layoutPreviewSlot: {
    display: "inline-block",
    width: "8px",
    height: "8px",
    border: "1.5px solid #15913b",
    background: "#ffffff",
    boxSizing: "border-box",
  },

  layoutPreviewStack: {
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "2px",
  },

  layoutPreviewFractionLine: {
    width: "18px",
    borderTop: "1px solid #334155",
  },

  scriptTemplatePreview: {
    minWidth: "28px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "2px",
    lineHeight: 1,
  },

  scriptTemplateSlots: {
    display: "inline-flex",
    flexDirection: "column",
    gap: "1px",
  },

  stackedOperatorPreview: {
    minWidth: "28px",
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "1px",
    lineHeight: 1,
  },

  stackedOperatorSidePreview: {
    minWidth: "28px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "2px",
    lineHeight: 1,
  },

  stackedOperatorGlyph: {
    fontSize: "20px",
    lineHeight: "16px",
  },

  stackedOperatorSideSlots: {
    display: "inline-flex",
    flexDirection: "column",
    gap: "1px",
  },

  accentTemplatePreview: {
    minWidth: "28px",
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "1px",
    lineHeight: 1,
  },

  accentEnclosurePreview: {
    minWidth: "18px",
    minHeight: "18px",
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1px",
    boxSizing: "border-box",
  },

  accentEnclosureLeftBar: {
    borderLeft: "2px solid #334155",
  },

  accentEnclosureRightBar: {
    borderRight: "2px solid #334155",
  },

  accentEnclosureBox: {
    border: "1.5px solid #334155",
  },

  accentEnclosureCircle: {
    border: "1.5px solid #334155",
    borderRadius: "50%",
  },

  accentEnclosureSlash: {
    position: "absolute",
    inset: "1px 7px 1px 7px",
    borderLeft: "1.5px solid #334155",
    transform: "rotate(30deg)",
    transformOrigin: "center",
  },

  accentEnclosureBackslash: {
    position: "absolute",
    inset: "1px 7px 1px 7px",
    borderLeft: "1.5px solid #334155",
    transform: "rotate(-30deg)",
    transformOrigin: "center",
  },

  accentTemplateMark: {
    height: "8px",
    color: "#334155",
    fontSize: "13px",
    lineHeight: "8px",
  },

};
