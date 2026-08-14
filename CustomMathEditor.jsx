import { useCallback, useEffect, useRef, useState } from "react";
import { MathfieldElement } from "mathlive";
import "./CustomMathEditor.css";
import CustomTextEditor from "./CustomTextEditor";
import SpecialCharacterModal from "./SpecialCharacterModal";
import MathRibbon from "./MathRibbon";
import ChemRibbon from "./ChemRibbon";

if (typeof window !== "undefined" && MathfieldElement) {
  MathfieldElement.fontsDirectory = "/mathlive/fonts";
}

const FLIPPED_PAIRED_ARROW_STYLE_ID = "qp-flipped-paired-arrow-style";
const shouldFocusFirstTemplatePlaceholder = (insertText) =>
  typeof insertText === "string" &&
  (
    insertText.includes("\\frac{\\begin{array}{r}") ||
    insertText.includes("\\begin{array}{r@{}l}") ||
    insertText.includes("\\xtofrom") ||
    insertText.includes("\\xrightarrow[#0]{\\phantom{}}") ||
    (
      insertText.includes("\\begin{array}{c}") &&
      (insertText.includes("\\\\[-2px]") || insertText.includes("\\\\[-6pt]")) &&
      (
        insertText.includes("\\xleftarrow") ||
        insertText.includes("\\xrightarrow")
      )
    ) ||
    (
      insertText.includes("\\overset{\\displaystyle") &&
      insertText.includes("\\overline{\\vphantom{1}")
    )
  );

const FLIPPED_PAIRED_ARROW_CSS = `
.qp-flip-paired-arrows svg,
.qp-flip-paired-arrows .ML__stretchy svg,
.qp-flip-paired-arrows.ML__stretchy svg,
.ML__stretchy.qp-flip-paired-arrows svg,
[class~="qp-flip-paired-arrows"] svg {
  transform: scaleX(-1) !important;
  transform-box: fill-box;
  transform-origin: center;
}
.qp-widehat-full {
  display: inline-block !important;
  position: relative !important;
  padding-top: 0.34em !important;
}
.qp-widehat-full > .ML__vlist-t,
.qp-widehat-full .ML__vlist,
.qp-widehat-full .ML__vlist > span {
  width: 100% !important;
  min-width: 100% !important;
}
.qp-widehat-full .ML__center {
  display: block !important;
  margin-left: 0 !important;
  text-align: left !important;
  width: 100% !important;
  min-width: 100% !important;
}
.qp-widehat-full .ML__center > span:not(.ML__pstrut),
.qp-widehat-full .ML__center > span:not(.ML__pstrut) > span {
  display: block !important;
  position: relative !important;
  width: 100% !important;
  min-width: 100% !important;
}
.qp-widehat-full .ML__stretchy {
  left: 0 !important;
  width: 100% !important;
  transform: translateY(-0.3em) !important;
}
.qp-widehat-full .ML__stretchy svg {
  width: 100% !important;
}
.qp-equal-width-arrow {
  display: block !important;
  width: 100% !important;
  min-width: 100% !important;
}
.qp-equal-width-arrow .ML__stretchy,
.qp-equal-width-arrow.ML__stretchy {
  left: 0 !important;
  width: 100% !important;
}
.qp-equal-width-arrow .ML__stretchy svg,
.qp-equal-width-arrow.ML__stretchy svg {
  width: 100% !important;
}
`;

function installFlippedPairedArrowStyle(mathfield) {
  const root = mathfield?.shadowRoot;
  if (!root || root.getElementById(FLIPPED_PAIRED_ARROW_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = FLIPPED_PAIRED_ARROW_STYLE_ID;
  style.textContent = FLIPPED_PAIRED_ARROW_CSS;
  root.appendChild(style);
}

function unwrapChemValue(value = "") {
  const match = String(value).match(/^\\ce\{([\s\S]*)\}$/);
  return match ? match[1] : String(value);
}

function serializeChemValue(value = "") {
  const normalized = unwrapChemValue(value)
    .replace(/\\text\{([^}]*)\}/g, "$1")
    .replace(/\$/g, "")
    .trim();
  return normalized ? `\\ce{${normalized}}` : "";
}

const DOUBLE_STRUCK_CHARS = {
  A: "𝔸", B: "𝔹", C: "ℂ", D: "𝔻", E: "𝔼", F: "𝔽", G: "𝔾",
  H: "ℍ", I: "𝕀", J: "𝕁", K: "𝕂", L: "𝕃", M: "𝕄", N: "ℕ",
  O: "𝕆", P: "ℙ", Q: "ℚ", R: "ℝ", S: "𝕊", T: "𝕋", U: "𝕌",
  V: "𝕍", W: "𝕎", X: "𝕏", Y: "𝕐", Z: "ℤ",
  a: "𝕒", b: "𝕓", c: "𝕔", d: "𝕕", e: "𝕖", f: "𝕗", g: "𝕘",
  h: "𝕙", i: "𝕚", j: "𝕛", k: "𝕜", l: "𝕝", m: "𝕞", n: "𝕟",
  o: "𝕠", p: "𝕡", q: "𝕢", r: "𝕣", s: "𝕤", t: "𝕥", u: "𝕦",
  v: "𝕧", w: "𝕨", x: "𝕩", y: "𝕪", z: "𝕫",
};

const FRAKTUR_CHARS = {
  A: "𝔄", B: "𝔅", C: "ℭ", D: "𝔇", E: "𝔈", F: "𝔉", G: "𝔊",
  H: "ℌ", I: "ℑ", J: "𝔍", K: "𝔎", L: "𝔏", M: "𝔐", N: "𝔑",
  O: "𝔒", P: "𝔓", Q: "𝔔", R: "ℜ", S: "𝔖", T: "𝔗", U: "𝔘",
  V: "𝔙", W: "𝔚", X: "𝔛", Y: "𝔜", Z: "ℨ",
  a: "𝔞", b: "𝔟", c: "𝔠", d: "𝔡", e: "𝔢", f: "𝔣", g: "𝔤",
  h: "𝔥", i: "𝔦", j: "𝔧", k: "𝔨", l: "𝔩", m: "𝔪", n: "𝔫",
  o: "𝔬", p: "𝔭", q: "𝔮", r: "𝔯", s: "𝔰", t: "𝔱", u: "𝔲",
  v: "𝔳", w: "𝔴", x: "𝔵", y: "𝔶", z: "𝔷",
};

function normalizeStyledAlphabetSymbols(value = "") {
  return String(value)
    .replace(/\\mathbb\{([A-Za-z])\}/g, (_, char) => (
      DOUBLE_STRUCK_CHARS[char] ? `\\text{${DOUBLE_STRUCK_CHARS[char]}}` : `\\mathbb{${char}}`
    ))
    .replace(/\\mathfrak\{([A-Za-z])\}/g, (_, char) => (
      FRAKTUR_CHARS[char] ? `\\text{${FRAKTUR_CHARS[char]}}` : `\\mathfrak{${char}}`
    ));
}

function removeTemplatePlaceholders(value = "") {
  return String(value)
    .replace(/\\placeholder(?:\[[^\]]*\])?\{[^{}]*\}/g, "")
    .replace(/#(?:0|\?)/g, "");
}

function preserveEmptyRootVinculum(value = "") {
  // MathLive renders `\\sqrt{}` as just the radical hook because its radicand
  // has no width. Keep a small invisible radicand so an empty root remains a
  // recognizable, fillable template in the text editor.
  return String(value).replace(/\\sqrt\{\}/g, "\\sqrt{\\vphantom{1}\\;}");
}

function normalizeMathForTextEditor(value = "") {
  return preserveEmptyRootVinculum(
    removeTemplatePlaceholders(normalizeStyledAlphabetSymbols(unwrapTextWrappedVerticalStrike(
      String(value).replace(
          /\\raisebox\{(-?[\d.]+(?:px|pt|em|ex|mu|cm|mm|in)?)\}/g,
          "\\raise{$1}"
        )
      )
    ))
  );
}

function unwrapTextWrappedVerticalStrike(value) {
  const marker = "\\text{\\enclose{verticalstrike}";
  let output = "";
  let index = 0;

  while (index < value.length) {
    const start = value.indexOf(marker, index);
    if (start === -1) {
      output += value.slice(index);
      break;
    }

    output += value.slice(index, start);
    let depth = 0;
    let end = -1;
    for (let i = start + "\\text".length; i < value.length; i += 1) {
      const char = value[i];
      if (char === "{") depth += 1;
      if (char === "}") {
        depth -= 1;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }

    if (end === -1) {
      output += value.slice(start);
      break;
    }

    output += value.slice(start + "\\text{".length, end);
    index = end + 1;
  }

  return output;
}


/* ─────────────────────────────────────────────────────────────
   Main Component
   ───────────────────────────────────────────────────────────── */
export default function CustomMathEditor({ value = "", onChange, placeholder = "Enter text here..." }) {
  const [mode, setMode] = useState("math");       // "math" | "chem"
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPopupMinimized, setIsPopupMinimized] = useState(false);
  const [isPopupMaximized, setIsPopupMaximized] = useState(false);
  const [editingMath, setEditingMath] = useState(null);

  const mainTextEditorRef = useRef(null);
  const popupMfRef = useRef(null);

  const [showSpecialChars, setShowSpecialChars] = useState(null); // { x, y } or null

  /* ── Configure popup math-field when mode switches ── */
  useEffect(() => {
    const popupMf = popupMfRef.current;
    if (!popupMf || !isEditorOpen) return;
    installFlippedPairedArrowStyle(popupMf);
    popupMf.defaultMode = mode === "chem" ? "text" : "math";
    popupMf.smartSuperscript = false;
    requestAnimationFrame(() => popupMf.focus());
  }, [mode, isEditorOpen]);

  /* ── Keyboard shortcuts for Popup ── */
  useEffect(() => {
    const popupMf = popupMfRef.current;
    if (!popupMf) return;

    const handleKeyDown = (e) => {
      if (e.key === " ") {
        e.preventDefault();
        if (mode === "chem") {
          popupMf.executeCommand(["insert", "\\, "]);
        } else {
          popupMf.executeCommand(["insert", "\\, "]);
        }
      } else if (e.key === "Enter") {
        if (mode === "chem") return;
        e.preventDefault();
        popupMf.executeCommand(["insert", "\\\\"]);
      }
    };

    popupMf.addEventListener("keydown", handleKeyDown);
    return () => popupMf.removeEventListener("keydown", handleKeyDown);
  }, [isEditorOpen, mode]);

  /* ── Auto-scroll caret into view ── */
  useEffect(() => {
    const popupMf = popupMfRef.current;
    if (!popupMf || !isEditorOpen) return;

    const handleSelectionChange = () => {
      // Small timeout to let MathLive update the DOM caret position first
      setTimeout(() => {
        const shadow = popupMf.shadowRoot;
        if (!shadow) return;
        const caret = shadow.querySelector(".ML__caret") || shadow.querySelector('[class*="caret"]');
        if (caret) {
          caret.scrollIntoView({ behavior: "auto", block: "nearest", inline: "nearest" });
        }
      }, 0);
    };

    popupMf.addEventListener("selection-change", handleSelectionChange);
    popupMf.addEventListener("input", handleSelectionChange);
    popupMf.addEventListener("keydown", handleSelectionChange);

    return () => {
      popupMf.removeEventListener("selection-change", handleSelectionChange);
      popupMf.removeEventListener("input", handleSelectionChange);
      popupMf.removeEventListener("keydown", handleSelectionChange);
    };
  }, [isEditorOpen]);

  /* ── Insert symbol / template into popup math-field ── */
  const setPopupValue = useCallback((nextValue) => {
    const popupMf = popupMfRef.current;
    if (!popupMf) return;
    if (popupMf.setValue) popupMf.setValue(nextValue || "", { silenceNotifications: true });
    else popupMf.value = nextValue || "";
  }, []);

  const insertAtCursor = useCallback((insertText) => {
    const popupMf = popupMfRef.current;
    if (!popupMf) return;
    popupMf.focus();
    if (shouldFocusFirstTemplatePlaceholder(insertText) && popupMf.insert) {
      popupMf.insert(insertText, { selectionMode: "before", focus: true });
      requestAnimationFrame(() => {
        popupMf.executeCommand(["moveToNextPlaceholder"]);
        installFlippedPairedArrowStyle(popupMf);
      });
      return;
    }
    popupMf.executeCommand(["insert", insertText]);
    requestAnimationFrame(() => installFlippedPairedArrowStyle(popupMf));
  }, []);

  useEffect(() => {
    if (!isEditorOpen || !editingMath) return;
    const nextValue = editingMath.isChem
      ? unwrapChemValue(editingMath.latex)
      : editingMath.latex;
    requestAnimationFrame(() => {
      setPopupValue(nextValue);
      popupMfRef.current?.focus();
    });
  }, [editingMath, isEditorOpen, setPopupValue]);

  const handleRibbonCommand = useCallback((command, anchorPosition) => {
    const popupMf = popupMfRef.current;
    if (!popupMf) return;
    popupMf.focus();
    switch (command) {
      case "undo":
        popupMf.executeCommand(["undo"]);
        break;
      case "redo":
        popupMf.executeCommand(["redo"]);
        break;
      case "copy":
        try { document.execCommand("copy"); } catch (_) {}
        break;
      case "cut":
        try { document.execCommand("cut"); } catch (_) {}
        break;
      case "paste":
        try { document.execCommand("paste"); } catch (_) {}
        break;
      case "color":
        // placeholder - color picker not built yet
        break;
      case "special-chars": {
        if (anchorPosition) {
          setShowSpecialChars(anchorPosition);
        } else {
          const rect = popupMf.getBoundingClientRect();
          setShowSpecialChars({ x: rect.right + 4, y: rect.top });
        }
        break;
      }
      default:
        break;
    }
  }, []);

  const toggleEditor = (newMode) => {
    if (isEditorOpen && mode === newMode) {
      setIsEditorOpen(false);
      setEditingMath(null);
      requestAnimationFrame(() => mainTextEditorRef.current?.focus());
      return;
    }
    setEditingMath(null);
    setMode(newMode);
    setIsEditorOpen(true);
    setIsPopupMinimized(false);
  };

  const handleMathEdit = useCallback(({ mf, latex, isChem }) => {
    setEditingMath({ mf, latex, isChem });
    setMode(isChem ? "chem" : "math");
    setIsEditorOpen(true);
  }, []);

  /* ── Insert from popup into main editor ── */
  const handleInsert = () => {
    const popupMf = popupMfRef.current;
    const mainTextEditor = mainTextEditorRef.current;
    if (!popupMf || !mainTextEditor) return;

    let latex = popupMf.getValue ? popupMf.getValue() : popupMf.value;
    if (mode === "chem" && latex) {
      latex = serializeChemValue(latex);
    } else if (latex) {
      latex = normalizeMathForTextEditor(latex);
    }

    if (!latex || latex.trim() === "") {
      if (popupMf.setValue) popupMf.setValue("");
      else popupMf.value = "";
      setIsEditorOpen(false);
      setEditingMath(null);
      return;
    }

    if (editingMath?.mf?.isConnected) {
      mainTextEditor.updateMath(editingMath.mf, latex);
    } else {
      mainTextEditor.insertMath(latex);
    }

    if (popupMf.setValue) popupMf.setValue("");
    else popupMf.value = "";
    setEditingMath(null);

    requestAnimationFrame(() => mainTextEditor.focus());
  };

  const handleClose = () => {
    setIsEditorOpen(false);
    setIsPopupMinimized(false);
    setIsPopupMaximized(false);
    setEditingMath(null);
  };

  const handleMinimize = () => {
    setIsPopupMinimized((current) => !current);
  };

  const handleMaximize = () => {
    setIsPopupMaximized((current) => !current);
    setIsPopupMinimized(false);
  };

  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragStateRef = useRef(null);

  const handleDragMove = useCallback((e) => {
    const drag = dragStateRef.current;
    if (!drag) return;
    setDragOffset({
      x: drag.originX + (e.clientX - drag.startX),
      y: drag.originY + (e.clientY - drag.startY),
    });
  }, []);
  /* ── Sync left-right arrow lengths for xtofrom-style templates ── */
useEffect(() => {
  const popupMf = popupMfRef.current;
  if (!popupMf) return;

  const handleArrowSync = () => {
    const latex = popupMf.getValue();
    const lineBreak = String.raw`(\s*\\\\(?:\[[^\]]*\])?\s*)`;
    const topArg = String.raw`([^{}]*?)(?:\\phantom\{[^{}]*\})?`;
    const bottomArg = String.raw`([^\]{}]*?)(?:\\phantom\{[^{}]*\})?`;
    const setSyncedLatex = (newLatex, nextPosition = null) => {
      if (newLatex === latex) return false;
      const pos = popupMf.position;
      const selection = Array.isArray(popupMf.selection)
        ? [...popupMf.selection]
        : null;
      const restorePosition = () => {
        popupMf.focus();
        if (Number.isFinite(nextPosition)) {
          popupMf.position = nextPosition;
        } else if (selection && popupMf.selection) {
          popupMf.selection = selection;
        } else {
          popupMf.position = pos;
        }
      };

      popupMf.setValue(newLatex, { silenceNotifications: true });
      restorePosition();
      requestAnimationFrame(restorePosition);
      return true;
    };

    // Case: top arrow has real text, bottom arrow is phantom -> mirror top into bottom
    const topReal = new RegExp(String.raw`\\xleftarrow\{${topArg}\}${lineBreak}\\xrightarrow\{\\phantom\{[^{}]*\}\}`);
    let match = latex.match(topReal);
    if (match) {
      const content = match[1];
      const newNeedle = `\\xleftarrow{${content}}${match[2]}\\xrightarrow{\\phantom{${content}}}`;
      const newLatex = latex.replace(
        topReal,
        newNeedle
      );
      setSyncedLatex(newLatex);
      return;
    }

    // Case: bottom arrow has real text, top arrow is phantom -> mirror bottom into top
    const bottomReal = new RegExp(String.raw`\\xleftarrow\{\\phantom\{[^{}]*\}\}${lineBreak}\\xrightarrow\[${bottomArg}\]\{\}`);
    match = latex.match(bottomReal);
    if (match) {
      const content = match[2];
      const newNeedle = `\\xleftarrow{\\phantom{${content}}}${match[1]}\\xrightarrow[${content}]{}`
      const newLatex = latex.replace(
        bottomReal,
        newNeedle
      );
      setSyncedLatex(newLatex);
      return;
    }

    // Case: both arrows have labels -> add each label as the other's hidden width guide
    const bothReal = new RegExp(String.raw`\\xleftarrow\{${topArg}\}${lineBreak}\\xrightarrow\[${bottomArg}\]\{\}`);
    match = latex.match(bothReal);
    if (match) {
      const top = match[1];
      const bottom = match[3];
      const newLatex = latex.replace(
        bothReal,
        `\\xleftarrow{${top}\\phantom{${bottom}}}${match[2]}\\xrightarrow[${bottom}\\phantom{${top}}]{}`
      );
      setSyncedLatex(newLatex);
      return;
    }

    // Swapped paired arrows: top right arrow, bottom left arrow.
    const swappedTopReal = new RegExp(String.raw`\\xrightarrow\{${topArg}\}${lineBreak}\\xleftarrow\{\\phantom\{[^{}]*\}\}`);
    match = latex.match(swappedTopReal);
    if (match) {
      const content = match[1];
      const newLatex = latex.replace(
        swappedTopReal,
        `\\xrightarrow{${content}}${match[2]}\\xleftarrow{\\phantom{${content}}}`
      );
      setSyncedLatex(newLatex);
      return;
    }

    const swappedBottomReal = new RegExp(String.raw`\\xrightarrow\{\\phantom\{[^{}]*\}\}${lineBreak}\\xleftarrow\[${bottomArg}\]\{\}`);
    match = latex.match(swappedBottomReal);
    if (match) {
      const content = match[2];
      const newLatex = latex.replace(
        swappedBottomReal,
        `\\xrightarrow{\\phantom{${content}}}${match[1]}\\xleftarrow[${content}]{}`
      );
      setSyncedLatex(newLatex);
      return;
    }

    const swappedBothReal = new RegExp(String.raw`\\xrightarrow\{${topArg}\}${lineBreak}\\xleftarrow\[${bottomArg}\]\{\}`);
    match = latex.match(swappedBothReal);
    if (match) {
      const top = match[1];
      const bottom = match[3];
      const newLatex = latex.replace(
        swappedBothReal,
        `\\xrightarrow{${top}\\phantom{${bottom}}}${match[2]}\\xleftarrow[${bottom}\\phantom{${top}}]{}`
      );
      setSyncedLatex(newLatex);
      return;
    }

    // Case: single right arrow has real bottom text and hidden top phantom -> mirror width guide
    const underRightArrow = /\\xrightarrow\[([^{}]*)\]\{\\phantom\{[^{}]*\}\}/;
    match = latex.match(underRightArrow);
    if (match) {
      const content = match[1];
      const newLatex = latex.replace(
        underRightArrow,
        `\\xrightarrow[${content}]{\\phantom{${content}}}`
      );
      setSyncedLatex(newLatex);
      return;
    }

  };

  popupMf.addEventListener("input", handleArrowSync);
  return () => popupMf.removeEventListener("input", handleArrowSync);
}, [isEditorOpen]);

  const handleDragEnd = useCallback(() => {
    dragStateRef.current = null;
    window.removeEventListener("mousemove", handleDragMove);
    window.removeEventListener("mouseup", handleDragEnd);
  }, [handleDragMove]);

  const handleDragStart = (e) => {
    if (isPopupMaximized) return;
    dragStateRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: dragOffset.x,
      originY: dragOffset.y,
    };
    window.addEventListener("mousemove", handleDragMove);
    window.addEventListener("mouseup", handleDragEnd);
  };

  return (
    <div className="cme-wrapper">
      <div className="Input-question-box">
        <CustomTextEditor
          ref={mainTextEditorRef}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onMathType={() => toggleEditor("math")}
          onChemType={() => toggleEditor("chem")}
          onMathEdit={handleMathEdit}
          mathTypeActive={isEditorOpen && mode === "math"}
          chemTypeActive={isEditorOpen && mode === "chem"}
        />
      </div>

      {/* ── MathLive Visual Editor Popup ──────────────────── */}
      {isEditorOpen && (
        <div
          className={[
            "cme-editor-popup",
            isPopupMinimized ? "minimized" : "",
            isPopupMaximized ? "maximized" : "",
          ].filter(Boolean).join(" ")}
          style={{
            transform: isPopupMaximized
              ? "none"
              : `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
          }}
        >
          <div
            className="cme-popup-header"
            onMouseDown={handleDragStart}
          >
            <span>{mode === "math" ? "Math Editor " : "Chemistry Editor"}</span>

            <div className="cme-popup-window-controls">
              <button
                type="button"
                className="cme-window-btn"
                title={isPopupMinimized ? "Restore" : "Minimize"}
                aria-label={isPopupMinimized ? "Restore editor" : "Minimize editor"}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={handleMinimize}
              >
                _
              </button>
              <button
                type="button"
                className="cme-window-btn"
                title={isPopupMaximized ? "Restore" : "Maximize"}
                aria-label={isPopupMaximized ? "Restore editor" : "Maximize editor"}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={handleMaximize}
              >
                []
              </button>
              <button
                type="button"
                className="cme-window-btn close"
                title="Close"
                aria-label="Close editor"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={handleClose}
              >
                x
              </button>
            </div>
          </div>

          {!isPopupMinimized && (
            <>
          {/* Symbol / Template Toolbar */}
          {mode === "math" && (
            <MathRibbon onInsert={insertAtCursor} onCommand={handleRibbonCommand} />
          )}

          {mode === "chem" && (
            <ChemRibbon
              onInsert={insertAtCursor}
              onCommand={handleRibbonCommand}
            />
          )}

          <div
            className="cme-mathfield-container"
            onMouseDown={(e) => {
            
              if (e.target === popupMfRef.current ||
                (popupMfRef.current && popupMfRef.current.contains(e.target))) {
                return; // browser handles it
              }
              e.preventDefault();
              requestAnimationFrame(() => {
                try { popupMfRef.current?.focus(); } catch (_) { }
              });
            }}
          >
            <math-field
              ref={popupMfRef}
              class="cme-mathfield"
              tabIndex={0}
              math-virtual-keyboard-policy="manual"
              placeholder={
                mode === "math"
                  ? ""
                  : ""
              }
            />
          </div>

          {/* cancel and insert div */}
          <div className="cme-popup-footer">
            <button type="button" className="cme-insert-btn" onClick={handleInsert}>
              {editingMath ? "Update" : "Insert"}
            </button>
            <button type="button" className="cme-cancel-btn" onClick={handleClose}>
              Cancel
            </button>
          </div>

          {showSpecialChars && (
            <SpecialCharacterModal 
              isOpen={!!showSpecialChars}
              position={showSpecialChars}
              onClose={() => setShowSpecialChars(null)}
              onInsert={(char) => {
                insertAtCursor(char);
                setShowSpecialChars(null);
              }}
            />
          )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
