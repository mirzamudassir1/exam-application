import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Table,
  Trash2,
  Sigma,
  Palette,
  Superscript,
  Subscript,
} from "lucide-react";

import FloatingMathChemTable from "./FloatingMathChemTable";

const FORMULA_SLOT_HTML = `<span data-formula-slot="true" contenteditable="true" style="display:inline-block;min-width:24px;height:24px;margin:0 3px;padding:0 3px;border:1px solid #94a3b8;border-radius:3px;background:#ffffff;box-sizing:border-box;text-align:center;line-height:22px;vertical-align:middle;">&#8203;</span>`;

export default function RichEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);
  const [showMathChem, setShowMathChem] = useState(false);

  const [active, setActive] = useState({
  bold: false,
  italic: false,
  underline: false,
  superscript: false,
  subscript: false,
  left: false,
  center: false,
  right: false,
  ul: false,
  ol: false,
});

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const updateValue = () => {
    if (!editorRef.current) return;

    onChange(editorRef.current.innerHTML);

    setActive({
  bold: document.queryCommandState("bold"),
  italic: document.queryCommandState("italic"),
  underline: document.queryCommandState("underline"),
  superscript: document.queryCommandState("superscript"),
  subscript: document.queryCommandState("subscript"),
  left: document.queryCommandState("justifyLeft"),
  center: document.queryCommandState("justifyCenter"),
  right: document.queryCommandState("justifyRight"),
  ul: document.queryCommandState("insertUnorderedList"),
  ol: document.queryCommandState("insertOrderedList"),
});
  };

  const command = (cmd, val = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    updateValue();
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (!selection?.rangeCount || !editorRef.current) return;

    const range = selection.getRangeAt(0);
    if (editorRef.current.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  };

  const placeCursorAtEditorEnd = () => {
    if (!editorRef.current) return;

    const range = document.createRange();
    range.selectNodeContents(editorRef.current);
    range.collapse(false);

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    savedRangeRef.current = range.cloneRange();
  };

  const restoreSelection = () => {
    editorRef.current?.focus();
    if (
      !savedRangeRef.current ||
      !editorRef.current?.contains(savedRangeRef.current.commonAncestorContainer)
    ) {
      placeCursorAtEditorEnd();
      return;
    }

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(savedRangeRef.current);
  };

  const moveCursorInsideBrackets = () => {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;

    const range = sel.getRangeAt(0);
    range.setStart(range.startContainer, Math.max(0, range.startOffset - 1));
    range.collapse(true);

    sel.removeAllRanges();
    sel.addRange(range);
  };

  const deleteStructuredElementOnKey = (event) => {
    if (!["Backspace", "Delete"].includes(event.key)) return;

    const selection = window.getSelection();
    if (!selection?.rangeCount || !selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const structuredSelector =
      "[data-matrix], [data-labeled-arrow], [data-formula-id]";
    const currentSlot = getSelectionElement()?.closest?.(
      "[data-formula-slot]"
    );
    let structuredElement = null;
    let spacerNode = null;
    let spacerOffset = -1;
    const isBackspace = event.key === "Backspace";

    if (currentSlot) {
      const slotText = currentSlot.textContent
        .replaceAll("\u200b", "")
        .replaceAll("\u00a0", "")
        .trim();

      if (!slotText) {
        structuredElement = currentSlot.closest("[data-formula-id]");
      }
    }

    if (!structuredElement && range.startContainer.nodeType === Node.TEXT_NODE) {
      const textNode = range.startContainer;
      const spacerOffsetCandidate = isBackspace
        ? range.startOffset - 1
        : range.startOffset;
      const spacerCharacter = textNode.data[spacerOffsetCandidate];
      const siblingElement = isBackspace
        ? textNode.previousSibling
        : textNode.nextSibling;

      if (
        spacerCharacter === "\u00a0" &&
        siblingElement?.nodeType === Node.ELEMENT_NODE &&
        siblingElement.matches(structuredSelector)
      ) {
        structuredElement = siblingElement;
        spacerNode = textNode;
        spacerOffset = spacerOffsetCandidate;
      } else if (
        ((isBackspace && range.startOffset === 0) ||
          (!isBackspace && range.startOffset === textNode.data.length)) &&
        siblingElement?.nodeType === Node.ELEMENT_NODE &&
        siblingElement.matches(structuredSelector)
      ) {
        structuredElement = siblingElement;
      }
    } else if (!structuredElement) {
      let targetNode =
        range.startContainer.childNodes[
          isBackspace ? range.startOffset - 1 : range.startOffset
        ] || null;

      if (
        targetNode?.nodeType === Node.TEXT_NODE &&
        ((isBackspace && targetNode.textContent.endsWith("\u00a0")) ||
          (!isBackspace && targetNode.textContent.startsWith("\u00a0")))
      ) {
        spacerNode = targetNode;
        spacerOffset = isBackspace ? targetNode.data.length - 1 : 0;
        targetNode = isBackspace
          ? targetNode.previousSibling
          : targetNode.nextSibling;
      }

      if (
        targetNode?.nodeType === Node.ELEMENT_NODE &&
        targetNode.matches(structuredSelector)
      ) {
        structuredElement = targetNode;
      }
    }

    if (!structuredElement) return;

    event.preventDefault();
    const parent = structuredElement.parentNode;
    const elementIndex = Array.prototype.indexOf.call(
      parent.childNodes,
      structuredElement
    );

    if (spacerNode && spacerOffset >= 0) {
      spacerNode.deleteData(spacerOffset, 1);
      if (!spacerNode.data) spacerNode.remove();
    }
    structuredElement.remove();

    const nextRange = document.createRange();
    nextRange.setStart(parent, Math.min(elementIndex, parent.childNodes.length));
    nextRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(nextRange);

    savedRangeRef.current = nextRange.cloneRange();
    updateValue();
  };

  const escapeHtml = (value) =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");

  const sanitizeStyleValue = (value) =>
    String(value || "").replace(/[;"<>]/g, "");

  const createInlineStyle = (style = {}) => {
    const allowedStyles = {
      fontFamily: "font-family",
      fontSize: "font-size",
      color: "color",
      fontWeight: "font-weight",
      fontStyle: "font-style",
    };

    return Object.entries(allowedStyles)
      .map(([key, cssName]) =>
        style[key] ? `${cssName}:${sanitizeStyleValue(style[key])}` : ""
      )
      .filter(Boolean)
      .join(";");
  };

  const createStyledTextHtml = (symbol) => {
    const inlineStyle = createInlineStyle(symbol.style);

    return `<span style="${inlineStyle}">${escapeHtml(symbol.value || "")}</span>&nbsp;`;
  };

  const createFormulaHtml = (formula, formulaId) => {
    const functionNames =
      /^(sin|cos|tan|cot|sec|csc|log|ln|lim|det|rank|Var|max|min|P|E|Σ|π|e|d|f|x)/;
    const variablePattern =
      /^[A-Za-zα-ωΑ-Ω](?:[\u0300-\u036f₀-₉ᵢₙₘₐₓᵣᶜᵀ⁰-⁹⁻⁺]*)?/u;
    let html = "";
    let remaining = formula;

    while (remaining) {
      if (remaining.startsWith("□")) {
        html += FORMULA_SLOT_HTML;
        remaining = remaining.slice(1);
        continue;
      }

      const functionMatch = remaining.match(functionNames);
      if (functionMatch) {
        html += escapeHtml(functionMatch[0]);
        remaining = remaining.slice(functionMatch[0].length);
        continue;
      }

      const variableMatch = remaining.match(variablePattern);
      if (variableMatch) {
        html += FORMULA_SLOT_HTML;
        remaining = remaining.slice(variableMatch[0].length);
        continue;
      }

      const character = Array.from(remaining)[0];
      html += escapeHtml(character);
      remaining = remaining.slice(character.length);
    }

    return `<span data-formula-id="${formulaId}" style="display:inline-block;white-space:nowrap;margin:0 3px;">${html}</span>&nbsp;`;
  };

  const createFractionHtml = (formulaId) =>
    `<span data-formula-id="${formulaId}" contenteditable="false" style="display:inline-flex;align-items:center;margin:0 5px;vertical-align:middle;"><span style="display:inline-flex;flex-direction:column;align-items:stretch;gap:2px;">${FORMULA_SLOT_HTML}<span style="border-top:1.5px solid #111827;"></span>${FORMULA_SLOT_HTML}</span></span>&nbsp;`;

  const createFilledFractionHtml = (fraction, formulaId) =>
    `<span data-formula-id="${formulaId}" contenteditable="false" style="display:inline-flex;align-items:center;margin:0 5px;vertical-align:middle;${createInlineStyle(
      fraction.style
    )}"><span style="display:inline-flex;flex-direction:column;align-items:stretch;gap:2px;text-align:center;line-height:1.15;"><span style="display:block;padding:0 4px;">${escapeHtml(
      fraction.numerator
    )}</span><span style="border-top:1.5px solid #111827;"></span><span style="display:block;padding:0 4px;">${escapeHtml(
      fraction.denominator
    )}</span></span></span>&nbsp;`;

  const createScriptTemplateHtml = (template, formulaId) => {
    const hasSup = template.variant === "sup" || template.variant === "sub-sup";
    const hasSub = template.variant === "sub" || template.variant === "sub-sup";

    return `<span data-formula-id="${formulaId}" contenteditable="false" style="display:inline-flex;align-items:center;gap:2px;margin:0 5px;vertical-align:middle;">
      ${FORMULA_SLOT_HTML}
      <span style="display:inline-flex;flex-direction:column;align-items:flex-start;gap:1px;">
        ${hasSup ? FORMULA_SLOT_HTML : '<span style="height:12px;"></span>'}
        ${hasSub ? FORMULA_SLOT_HTML : '<span style="height:12px;"></span>'}
      </span>
    </span>&nbsp;`;
  };

  const createStackedOperatorHtml = (template, formulaId) => {
    const operator = escapeHtml(template.operator);
    const isSideScript = ["sup", "sub", "sub-sup"].includes(template.variant);
    const hasSup = ["sup", "sub-sup"].includes(template.variant);
    const hasSub = ["sub", "sub-sup"].includes(template.variant);
    const hasOver = ["over", "under-over"].includes(template.variant);
    const hasUnder = ["under", "under-over"].includes(template.variant);

    if (isSideScript) {
      return `<span data-formula-id="${formulaId}" contenteditable="false" style="display:inline-flex;align-items:center;gap:2px;margin:0 5px;vertical-align:middle;">
        <span style="font-family:Cambria Math,serif;font-size:26px;line-height:1;">${operator}</span>
        <span style="display:inline-flex;flex-direction:column;align-items:flex-start;gap:1px;">
          ${hasSup ? FORMULA_SLOT_HTML : '<span style="height:12px;"></span>'}
          ${hasSub ? FORMULA_SLOT_HTML : '<span style="height:12px;"></span>'}
        </span>
      </span>&nbsp;`;
    }

    return `<span data-formula-id="${formulaId}" contenteditable="false" style="display:inline-flex;align-items:center;gap:4px;margin:0 5px;vertical-align:middle;">
      <span style="display:inline-flex;flex-direction:column;align-items:center;gap:1px;">
        ${hasOver ? FORMULA_SLOT_HTML : '<span style="height:12px;"></span>'}
        <span style="font-family:Cambria Math,serif;font-size:26px;line-height:1;">${operator}</span>
        ${hasUnder ? FORMULA_SLOT_HTML : '<span style="height:12px;"></span>'}
      </span>
    </span>&nbsp;`;
  };

  const createAccentTemplateHtml = (template, formulaId) => {
    const accentMarkup = {
      bar: `<span style="display:block;width:100%;border-top:1.5px solid #334155;box-sizing:border-box;"></span>`,
      underbar: `<span style="display:block;width:100%;border-top:1.5px solid #334155;box-sizing:border-box;"></span>`,
      hat: `<span style="display:block;width:100%;text-align:center;font-family:Cambria Math,serif;font-size:16px;line-height:10px;">ˆ</span>`,
      tilde: `<span style="display:block;width:100%;text-align:center;font-family:Cambria Math,serif;font-size:16px;line-height:10px;">˜</span>`,
      dot: `<span style="display:block;width:100%;text-align:center;font-family:Cambria Math,serif;font-size:16px;line-height:10px;">˙</span>`,
      "double-dot": `<span style="display:block;width:100%;text-align:center;font-family:Cambria Math,serif;font-size:16px;line-height:10px;">¨</span>`,
      "right-arrow": `<span style="position:relative;display:block;width:100%;height:10px;box-sizing:border-box;">
        <span style="position:absolute;left:0;right:6px;top:4px;border-top:1.5px solid #334155;"></span>
        <span style="position:absolute;right:1px;top:1px;width:6px;height:6px;border-top:1.5px solid #334155;border-right:1.5px solid #334155;box-sizing:border-box;transform:rotate(45deg);"></span>
      </span>`,
      "left-arrow": `<span style="position:relative;display:block;width:100%;height:10px;box-sizing:border-box;">
        <span style="position:absolute;left:6px;right:0;top:4px;border-top:1.5px solid #334155;"></span>
        <span style="position:absolute;left:1px;top:1px;width:6px;height:6px;border-bottom:1.5px solid #334155;border-left:1.5px solid #334155;box-sizing:border-box;transform:rotate(45deg);"></span>
      </span>`,
      "double-arrow": `<span style="position:relative;display:block;width:100%;height:12px;box-sizing:border-box;">
        <span style="position:absolute;left:1px;right:6px;top:2px;border-top:1.5px solid #334155;"></span>
        <span style="position:absolute;right:1px;top:0;width:6px;height:6px;border-top:1.5px solid #334155;border-right:1.5px solid #334155;box-sizing:border-box;transform:rotate(45deg);"></span>
        <span style="position:absolute;left:6px;right:1px;top:8px;border-top:1.5px solid #334155;"></span>
        <span style="position:absolute;left:1px;top:5px;width:6px;height:6px;border-bottom:1.5px solid #334155;border-left:1.5px solid #334155;box-sizing:border-box;transform:rotate(45deg);"></span>
      </span>`,
    };

    const enclosureStyles = {
      "left-bar": "border-left:2px solid #334155;padding-left:4px;",
      "right-bar": "border-right:2px solid #334155;padding-right:4px;",
      box: "border:1.5px solid #334155;padding:2px 4px;",
      circle:
        "border:1.5px solid #334155;border-radius:999px;padding:2px 6px;",
      slash:
        "padding:2px 4px;background:linear-gradient(120deg, transparent 46%, #334155 48%, #334155 52%, transparent 54%);",
      cross:
        "padding:2px 4px;background:linear-gradient(120deg, transparent 46%, #334155 48%, #334155 52%, transparent 54%),linear-gradient(60deg, transparent 46%, #334155 48%, #334155 52%, transparent 54%);",
    };

    if (enclosureStyles[template.accent]) {
      return `<span data-formula-id="${formulaId}" contenteditable="false" style="display:inline-flex;align-items:center;justify-content:center;margin:0 5px;vertical-align:middle;line-height:1;${enclosureStyles[template.accent]}">
        ${FORMULA_SLOT_HTML}
      </span>&nbsp;`;
    }

    if (template.accent === "underbar") {
      return `<span data-formula-id="${formulaId}" contenteditable="false" style="display:inline-flex;flex-direction:column;align-items:stretch;min-width:38px;width:max-content;gap:1px;margin:0 5px;vertical-align:middle;line-height:1;">
        <span style="display:flex;justify-content:center;">${FORMULA_SLOT_HTML}</span>
        <span style="display:block;width:100%;min-width:38px;box-sizing:border-box;">
          ${accentMarkup.underbar}
        </span>
      </span>&nbsp;`;
    }

    return `<span data-formula-id="${formulaId}" contenteditable="false" style="display:inline-flex;flex-direction:column;align-items:stretch;min-width:38px;width:max-content;gap:1px;margin:0 5px;vertical-align:middle;line-height:1;">
      <span style="display:block;width:100%;min-width:38px;box-sizing:border-box;">
        ${accentMarkup[template.accent] || accentMarkup.bar}
      </span>
      <span style="display:flex;justify-content:center;">${FORMULA_SLOT_HTML}</span>
    </span>&nbsp;`;
  };

  const getSelectionElement = () => {
    const selection = window.getSelection();
    return (
      selection?.anchorNode?.nodeType === Node.ELEMENT_NODE
        ? selection.anchorNode
        : selection?.anchorNode?.parentElement
    );
  };

  const finishFormulaSlot = (event) => {
    if (!["Enter", "Tab"].includes(event.key)) return;

    const selection = window.getSelection();
    const currentSlot = getSelectionElement()?.closest?.(
      "[data-formula-slot]"
    );
    if (!currentSlot) return;

    const value = currentSlot.textContent.replaceAll("\u200b", "").trim();
    if (!value) return;

    const formula = currentSlot.closest("[data-formula-id]");
    const slots = Array.from(
      formula?.querySelectorAll("[data-formula-slot]") || []
    );
    const currentIndex = slots.indexOf(currentSlot);
    event.preventDefault();

    currentSlot.removeAttribute("data-formula-slot");
    currentSlot.style.minWidth = "auto";
    currentSlot.style.height = "auto";
    currentSlot.style.margin = "0";
    currentSlot.style.padding = "0";
    currentSlot.style.border = "none";
    currentSlot.style.background = "transparent";
    currentSlot.style.lineHeight = "inherit";

    const nextIndex = event.shiftKey ? currentIndex - 1 : currentIndex + 1;
    const nextSlot = slots[nextIndex];
    const range = document.createRange();

    if (nextSlot) {
      range.selectNodeContents(nextSlot);
    } else {
      range.setStartAfter(formula);
      range.collapse(true);
    }

    selection.removeAllRanges();
    selection.addRange(range);
    savedRangeRef.current = range.cloneRange();
    updateValue();
  };

  const focusMatrixCell = (cell) => {
    if (!cell) return;

    editorRef.current?.focus({ preventScroll: true });

    const range = document.createRange();
    range.selectNodeContents(cell);
    range.collapse(false);

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    savedRangeRef.current = range.cloneRange();
  };

  const placeCursorBesideMatrix = (matrix, after = true) => {
    if (!matrix) return;

    const range = document.createRange();
    const boundaryNode =
      after && matrix.nextSibling?.nodeType === Node.TEXT_NODE
        ? matrix.nextSibling
        : matrix;

    if (after) {
      range.setStartAfter(boundaryNode);
    } else {
      range.setStartBefore(matrix);
    }

    range.collapse(true);

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    savedRangeRef.current = range.cloneRange();
  };

  const moveBetweenMatrixCells = (event) => {
    if (event.key !== "Tab") return;

    const selection = window.getSelection();
    const anchor =
      selection?.anchorNode?.nodeType === Node.ELEMENT_NODE
        ? selection.anchorNode
        : selection?.anchorNode?.parentElement;
    const currentCell = anchor?.closest?.("[data-matrix] td");
    if (!currentCell) return;

    const matrix = currentCell.closest("[data-matrix]");
    const cells = Array.from(matrix.querySelectorAll("td"));
    const currentIndex = cells.indexOf(currentCell);
    const nextIndex = event.shiftKey ? currentIndex - 1 : currentIndex + 1;

    event.preventDefault();

    if (cells[nextIndex]) {
      focusMatrixCell(cells[nextIndex]);
      return;
    }

    placeCursorBesideMatrix(matrix, !event.shiftKey);
  };

  const handleEditorKeyDown = (event) => {
    const arrowLabel =
      event.target.closest?.("[data-arrow-label]") ||
      getSelectionElement()?.closest?.("[data-arrow-label]");

    if (event.key === "Enter" && arrowLabel) {
      event.preventDefault();
      const arrow = arrowLabel.closest("[data-labeled-arrow]");
      const labels = Array.from(
        arrow?.querySelectorAll("[data-arrow-label]") || []
      );
      const nextLabel = labels[labels.indexOf(arrowLabel) + 1];

      arrowLabel.removeAttribute("data-arrow-label");
      arrowLabel.removeAttribute("contenteditable");
      arrowLabel.style.borderColor = "transparent";
      arrowLabel.style.background = "transparent";
      arrowLabel.style.outline = "none";
      arrowLabel.style.padding = "0 4px";

      editorRef.current?.focus({ preventScroll: true });

      const range = document.createRange();
      if (nextLabel) {
        range.selectNodeContents(nextLabel);
      } else {
        range.setStartAfter(arrow);
        range.collapse(true);
      }

      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      savedRangeRef.current = range.cloneRange();
      updateValue();
      return;
    }

    finishFormulaSlot(event);
    if (!event.defaultPrevented) {
      moveBetweenMatrixCells(event);
    }
    if (!event.defaultPrevented) {
      deleteStructuredElementOnKey(event);
    }
  };

  const focusFirstFormulaSlot = (formulaId) => {
    const formula = editorRef.current?.querySelector(
      `[data-formula-id="${formulaId}"]`
    );
    const slot = formula?.querySelector("[data-formula-slot]");
    if (!slot) return;

    editorRef.current?.focus({ preventScroll: true });

    const range = document.createRange();
    range.selectNodeContents(slot);

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    savedRangeRef.current = range.cloneRange();
  };

  const focusFirstMatrixCell = (matrixId) => {
    const matrix = editorRef.current?.querySelector(
      `[data-matrix-id="${matrixId}"]`
    );
    focusMatrixCell(matrix?.querySelector("td"));
  };

  const focusArrowLabel = (arrowId) => {
    const label = editorRef.current?.querySelector(
      `[data-labeled-arrow-id="${arrowId}"] [data-arrow-label]`
    );
    if (!label) return;

    label.focus({ preventScroll: true });

    const range = document.createRange();
    range.selectNodeContents(label);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    savedRangeRef.current = range.cloneRange();
  };

  const insertSymbol = (symbol) => {
    restoreSelection();

    if (symbol?.type === "styled-text") {
      document.execCommand("insertHTML", false, createStyledTextHtml(symbol));
      saveSelection();
      updateValue();
      return;
    }

    if (symbol?.type === "labeled-arrow") {
      const arrowId = `arrow-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;
      const label = (position) =>
        symbol.slots.includes(position)
          ? `<span data-arrow-label="true" contenteditable="true" style="display:block;min-width:32px;width:max-content;max-width:320px;min-height:20px;padding:0 3px;border:1px solid #94a3b8;border-radius:3px;background:#ffffff;box-sizing:border-box;color:#111827;font-family:Arial,sans-serif;font-size:13px;line-height:18px;text-align:center;white-space:pre;outline:none;overflow:hidden;">&#8203;</span>`
          : `<span style="display:block;height:20px;"></span>`;
      const arrowLine =
        symbol.arrow === "\u21cc"
          ? `<span style="position:relative;display:block;width:100%;min-width:58px;height:16px;">
              <span style="position:absolute;left:1px;right:6px;top:4px;border-top:1.5px solid #334155;"></span>
              <span style="position:absolute;right:1px;top:1px;width:6px;height:6px;border-top:1.5px solid #334155;border-right:1.5px solid #334155;box-sizing:border-box;transform:rotate(45deg);"></span>
              <span style="position:absolute;left:6px;right:1px;top:11px;border-top:1.5px solid #334155;"></span>
              <span style="position:absolute;left:1px;top:8px;width:6px;height:6px;border-bottom:1.5px solid #334155;border-left:1.5px solid #334155;box-sizing:border-box;transform:rotate(45deg);"></span>
            </span>`
          : `<span style="position:relative;display:block;width:100%;min-width:58px;height:16px;">
              <span style="position:absolute;left:6px;right:6px;top:7px;border-top:1.5px solid #334155;"></span>
              ${
                symbol.arrow === "\u2190"
                  ? `<span style="position:absolute;left:1px;top:4px;width:6px;height:6px;border-bottom:1.5px solid #334155;border-left:1.5px solid #334155;box-sizing:border-box;transform:rotate(45deg);"></span>`
                  : `<span style="position:absolute;right:1px;top:4px;width:6px;height:6px;border-top:1.5px solid #334155;border-right:1.5px solid #334155;box-sizing:border-box;transform:rotate(45deg);"></span>`
              }
            </span>`;
      const html = `
        <span data-labeled-arrow="true" data-labeled-arrow-id="${arrowId}" contenteditable="false" style="display:inline-flex;min-width:58px;width:max-content;flex-direction:column;align-items:stretch;margin:0 4px;vertical-align:middle;line-height:1;">
          ${label("above")}
          ${arrowLine}
          ${label("below")}
        </span>&nbsp;
      `;

      document.execCommand("insertHTML", false, html);
      saveSelection();
      updateValue();
      requestAnimationFrame(() => focusArrowLabel(arrowId));
      return;
    }

    if (symbol?.type === "formula") {
      const formulaId = `formula-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;
      const html = createFormulaHtml(symbol.display, formulaId);

      document.execCommand("insertHTML", false, html);
      saveSelection();
      updateValue();
      requestAnimationFrame(() => focusFirstFormulaSlot(formulaId));
      return;
    }

    if (symbol?.type === "fraction-template") {
      const formulaId = `layout-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;

      document.execCommand("insertHTML", false, createFractionHtml(formulaId));
      saveSelection();
      updateValue();
      requestAnimationFrame(() => focusFirstFormulaSlot(formulaId));
      return;
    }

    if (symbol?.type === "filled-fraction-template") {
      const formulaId = `fraction-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;

      document.execCommand(
        "insertHTML",
        false,
        createFilledFractionHtml(symbol, formulaId)
      );
      saveSelection();
      updateValue();
      return;
    }

    if (symbol?.type === "script-template") {
      const formulaId = `script-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;

      document.execCommand(
        "insertHTML",
        false,
        createScriptTemplateHtml(symbol, formulaId)
      );
      saveSelection();
      updateValue();
      requestAnimationFrame(() => focusFirstFormulaSlot(formulaId));
      return;
    }

    if (symbol?.type === "stacked-operator-template") {
      const formulaId = `operator-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;

      document.execCommand(
        "insertHTML",
        false,
        createStackedOperatorHtml(symbol, formulaId)
      );
      saveSelection();
      updateValue();
      requestAnimationFrame(() => focusFirstFormulaSlot(formulaId));
      return;
    }

    if (symbol?.type === "accent-template") {
      const formulaId = `accent-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;

      document.execCommand(
        "insertHTML",
        false,
        createAccentTemplateHtml(symbol, formulaId)
      );
      saveSelection();
      updateValue();
      requestAnimationFrame(() => focusFirstFormulaSlot(formulaId));
      return;
    }

    if (typeof symbol === "string" && symbol.startsWith("MATRIX:")) {
      const matrixId = `matrix-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;
      const [dimensions, requestedStyle = "square"] = symbol
        .replace("MATRIX:", "")
        .split(":");
      const [rows, cols] = dimensions.split("x").map(Number);
      const bracketHeight = Math.max(30, rows * 27);
      const squareBracketStyle =
        "display:inline-block;align-self:stretch;width:8px;min-height:" +
        `${bracketHeight}px;box-sizing:border-box;`;
      const matrixStyles = {
        square: {
          left: `<span style="${squareBracketStyle}border-left:2px solid #111827;border-top:2px solid #111827;border-bottom:2px solid #111827;"></span>`,
          right: `<span style="${squareBracketStyle}border-right:2px solid #111827;border-top:2px solid #111827;border-bottom:2px solid #111827;"></span>`,
        },
        round: { left: "(", right: ")" },
        curly: { left: "{", right: "}" },
        bars: { left: "|", right: "|" },
        "double-bars": { left: "‖", right: "‖" },
        cases: { left: "{", right: "" },
        none: { left: "", right: "" },
      };
      const matrixStyle = matrixStyles[requestedStyle]
        ? requestedStyle
        : "square";
      const selectedStyle = matrixStyles[matrixStyle];
      const delimiterStyle = `display:inline-flex;align-items:center;height:${bracketHeight}px;font-family:serif;font-size:${bracketHeight}px;font-weight:400;line-height:${bracketHeight}px;`;
      const leftDelimiter =
        matrixStyle === "square"
          ? selectedStyle.left
          : `<span style="${delimiterStyle}">${selectedStyle.left}</span>`;
      const rightDelimiter =
        matrixStyle === "square"
          ? selectedStyle.right
          : `<span style="${delimiterStyle}">${selectedStyle.right}</span>`;

      let matrixHTML = `
        <span data-matrix="true" data-matrix-id="${matrixId}" style="display:inline-flex;align-items:stretch;gap:5px;margin:0 5px;vertical-align:middle;">
          ${leftDelimiter}
          <table style="border-collapse:separate;border-spacing:3px 2px;display:inline-table;width:auto;margin:0;align-self:center;">
            <tbody>
      `;

      for (let r = 0; r < rows; r++) {
        matrixHTML += "<tr>";
        for (let c = 0; c < cols; c++) {
          matrixHTML += `
            <td style="min-width:24px;height:23px;padding:0 3px;border:0;border-bottom:1px dotted #cbd5e1;text-align:center;line-height:23px;"><br></td>
          `;
        }
        matrixHTML += "</tr>";
      }

      matrixHTML += `
            </tbody>
          </table>
          ${rightDelimiter}
        </span>&nbsp;
      `;

      document.execCommand("insertHTML", false, matrixHTML);
      saveSelection();
      updateValue();
      requestAnimationFrame(() => focusFirstMatrixCell(matrixId));
      return;
    }

    editorRef.current?.focus();

    if (["√", "√x"].includes(symbol)) {
    document.execCommand("insertText", false, "√()");
    moveCursorInsideBrackets();
    saveSelection();
    } else if (["∛", "∛x"].includes(symbol)) {
      document.execCommand("insertText", false, "∛()");
      moveCursorInsideBrackets();
      saveSelection();
    } else {
      document.execCommand("insertText", false, symbol);
      saveSelection();
    }

    updateValue();
  };

  const insertTable = () => {
    const rows = parseInt(prompt("Rows?"), 10);
    const cols = parseInt(prompt("Columns?"), 10);

    if (!rows || !cols || rows < 1 || cols < 1) {
      alert("Enter valid rows and columns");
      return;
    }

    let html = `<table style="border-collapse:collapse;width:100%;margin:12px 0;"><tbody>`;

    for (let r = 0; r < rows; r++) {
      html += "<tr>";

      for (let c = 0; c < cols; c++) {
        html += `
          <td style="border:1px solid #cbd5e1;padding:10px;min-width:80px;">
            <br>
          </td>
        `;
      }

      html += "</tr>";
    }

    html += `</tbody></table><p><br></p>`;

    command("insertHTML", html);
  };

  const deleteCurrentTable = () => {
    const sel = window.getSelection();

    if (!sel.rangeCount) {
      alert("Click inside a table first");
      return;
    }

    let node = sel.anchorNode;

    while (node && node !== editorRef.current) {
      if (node.nodeName === "TABLE") {
        node.remove();
        updateValue();
        return;
      }

      node = node.parentNode;
    }

    alert("Click inside the table you want to delete");
  };

  const activeBtn = (isActive) => ({
    ...styles.btn,
    ...(isActive ? styles.activeBtn : {}),
  });

  return (
    <div style={styles.wrapper}>
      <div style={styles.toolbar}>
        <div style={styles.group}>
          <button
            type="button"
            style={activeBtn(active.bold)}
            title="Bold"
            onMouseDown={(e) => {
              e.preventDefault();
              command("bold");
            }}
          >
            <Bold size={16} />
          </button>

          <button
            type="button"
            style={activeBtn(active.italic)}
            title="Italic"
            onMouseDown={(e) => {
              e.preventDefault();
              command("italic");
            }}
          >
            <Italic size={16} />
          </button>

          <button
            type="button"
            style={activeBtn(active.underline)}
            title="Underline"
            onMouseDown={(e) => {
              e.preventDefault();
              command("underline");
            }}
          >
            <Underline size={16} />
          </button>
          <button
  type="button"
  style={activeBtn(active.superscript)}
  title="Superscript"
  onMouseDown={(e) => {
    e.preventDefault();
    command("superscript");
  }}
>
  <Superscript size={16} />
</button>

<button
  type="button"
  style={activeBtn(active.subscript)}
  title="Subscript"
  onMouseDown={(e) => {
    e.preventDefault();
    command("subscript");
  }}
>
  <Subscript size={16} />
</button>
        </div>

        <div style={styles.group}>
          <select
            style={styles.select}
            defaultValue=""
            title="Font Size"
            onChange={(e) => command("fontSize", e.target.value)}
          >
            <option value="" disabled>
              Size
            </option>
            <option value="2">Small</option>
            <option value="3">Normal</option>
            <option value="5">Large</option>
            <option value="7">Huge</option>
          </select>
        </div>

        <div style={styles.group}>
          <button
            type="button"
            style={activeBtn(active.left)}
            title="Align Left"
            onMouseDown={(e) => {
              e.preventDefault();
              command("justifyLeft");
            }}
          >
            <AlignLeft size={16} />
          </button>

          <button
            type="button"
            style={activeBtn(active.center)}
            title="Align Center"
            onMouseDown={(e) => {
              e.preventDefault();
              command("justifyCenter");
            }}
          >
            <AlignCenter size={16} />
          </button>

          <button
            type="button"
            style={activeBtn(active.right)}
            title="Align Right"
            onMouseDown={(e) => {
              e.preventDefault();
              command("justifyRight");
            }}
          >
            <AlignRight size={16} />
          </button>
        </div>

        <div style={styles.group}>
          <button
            type="button"
            style={activeBtn(active.ul)}
            title="Bullet List"
            onMouseDown={(e) => {
              e.preventDefault();
              command("insertUnorderedList");
            }}
          >
            <List size={16} />
          </button>

          <button
            type="button"
            style={activeBtn(active.ol)}
            title="Numbered List"
            onMouseDown={(e) => {
              e.preventDefault();
              command("insertOrderedList");
            }}
          >
            <ListOrdered size={16} />
          </button>
        </div>

        <div style={styles.group}>
          <button
            type="button"
            style={styles.btn}
            title="Insert Table"
            onMouseDown={(e) => {
              e.preventDefault();
              insertTable();
            }}
          >
            <Table size={16} />
          </button>

          <button
            type="button"
            style={styles.btnDanger}
            title="Delete Table"
            onMouseDown={(e) => {
              e.preventDefault();
              deleteCurrentTable();
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>

        <button
          type="button"
          style={styles.mathBtn}
          title="Math & Chemistry"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            saveSelection();
            setShowMathChem(true);
          }}
        >
          <Sigma size={18} />
        </button>

        <div style={styles.colorWrap} title="Text Color">
          <Palette size={16} />
          <input
            type="color"
            style={styles.color}
            onChange={(e) => command("foreColor", e.target.value)}
          />
        </div>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={updateValue}
        onKeyDown={handleEditorKeyDown}
        onKeyUp={() => {
          saveSelection();
        }}
        onMouseUp={() => {
          saveSelection();
        }}
        onFocus={updateValue}
        style={styles.editor}
      />

      {showMathChem && (
        <FloatingMathChemTable
          onInsert={insertSymbol}
          onClose={() => setShowMathChem(false)}
        />
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
  },

  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
    padding: "12px",
    background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
    borderBottom: "1px solid #e5e7eb",
  },

  group: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    paddingRight: "8px",
    borderRight: "1px solid #e5e7eb",
  },

  btn: {
    width: "38px",
    height: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #d1d5db",
    borderRadius: "9px",
    background: "#ffffff",
    color: "#111827",
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },

  activeBtn: {
    background: "#2563eb",
    color: "#ffffff",
    border: "1px solid #2563eb",
  },

  btnDanger: {
    width: "38px",
    height: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #fecaca",
    borderRadius: "9px",
    background: "#fff5f5",
    color: "#dc2626",
    cursor: "pointer",
  },

  mathBtn: {
    width: "42px",
    height: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #1d4ed8",
    borderRadius: "9px",
    background: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(37, 99, 235, 0.22)",
  },

  select: {
    height: "38px",
    border: "1px solid #d1d5db",
    borderRadius: "9px",
    background: "#ffffff",
    color: "#111827",
    padding: "0 10px",
    fontSize: "13px",
    fontWeight: "600",
  },

  colorWrap: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "0 9px",
    height: "38px",
    border: "1px solid #d1d5db",
    borderRadius: "9px",
    background: "#ffffff",
    color: "#111827",
  },

  color: {
    width: "26px",
    height: "24px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: 0,
  },

  editor: {
    minHeight: "240px",
    padding: "18px",
    background: "#ffffff",
    color: "#111827",
    fontSize: "16px",
    lineHeight: "1.7",
    outline: "none",
    direction: "ltr",
    textAlign: "left",
  },
};
