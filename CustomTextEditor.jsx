/**
 * CustomTextEditor — contenteditable rich text with inline math/chemistry chips.
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { MathfieldElement } from "mathlive";
import "./CustomTextEditor.css";

if (typeof window !== "undefined" && MathfieldElement) {
  MathfieldElement.fontsDirectory = "/mathlive/fonts";
}

const MATHFIELD_CUSTOM_STYLE_ID = "qp-custom-math-style";
const MATHFIELD_CUSTOM_CSS = `
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
`;

const MATH_OPEN = "§MATH§";
const MATH_CLOSE = "§END§";
const MATH_REGEX = new RegExp(
  `${escapeRegex(MATH_OPEN)}([\\s\\S]*?)${escapeRegex(MATH_CLOSE)}`,
  "g"
);
const ALLOWED_HTML_TAGS = new Set([
  "B", "STRONG", "I", "EM", "U", "BR", "DIV", "P", "SPAN",
  "UL", "OL", "LI",
]);

/* ── Icons (reference-style toolbar) ───────────────────── */

const IconUndo = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 7H5v10h4" />
    <path d="M9 12c1.5-3 4.5-5 8-5 4 0 7 3 7 7s-3 7-7 7c-3 0-5.5-1.5-7-4" />
  </svg>
);

const IconRedo = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 7h4v10h-4" />
    <path d="M15 12c-1.5-3-4.5-5-8-5-4 0-7 3-7 7s3 7 7 7c3 0 5.5-1.5 7-4" />
  </svg>
);

const IconNumberList = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <text x="2" y="8" fontSize="7" fontWeight="700">1</text>
    <text x="2" y="15" fontSize="7" fontWeight="700">2</text>
    <rect x="10" y="4" width="12" height="2" rx="1" />
    <rect x="10" y="11" width="12" height="2" rx="1" />
    <rect x="10" y="18" width="12" height="2" rx="1" />
  </svg>
);

const IconBulletList = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <circle cx="5" cy="6" r="2" />
    <circle cx="5" cy="12" r="2" />
    <circle cx="5" cy="18" r="2" />
    <rect x="10" y="4" width="12" height="2" rx="1" />
    <rect x="10" y="11" width="12" height="2" rx="1" />
    <rect x="10" y="18" width="12" height="2" rx="1" />
  </svg>
);

const IconEraser = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 20H8L4 16l10-10 6 6-10 10z" />
    <path d="M14 6l4 4" />
  </svg>
);

const IconMathType = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 19V5l4 7 4-7v14" />
    <path d="M16 19h6" />
  </svg>
);

const IconChemType = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M12 2L4 8v8l8 6 8-6V8L12 2zm0 3.2L17 9v5.3l-5 3.75L7 14.3V9l5-3.8z" />
    <text x="12" y="14" textAnchor="middle" fontSize="7" fontWeight="700" fill="#fff">C</text>
  </svg>
);

/* ── Serialization ─────────────────────────────────────── */

function getMathLatex(mf) {
  if (!mf) return "";
  return mf.getValue ? mf.getValue() : mf.value || "";
}

function serializeEditor(container) {
  if (!container) return "";

  const serializeChildren = (parent) =>
    Array.from(parent.childNodes).map(walk).join("");

  const walk = (node) => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    if (node.nodeName === "MATH-FIELD") {
      return MATH_OPEN + getMathLatex(node) + MATH_CLOSE;
    }
    if (node.nodeName === "BR") return "<br>";
    if (node.nodeName === "B" || node.nodeName === "STRONG") {
      return `<b>${serializeChildren(node)}</b>`;
    }
    if (node.nodeName === "I" || node.nodeName === "EM") {
      return `<i>${serializeChildren(node)}</i>`;
    }
    if (node.nodeName === "U") return `<u>${serializeChildren(node)}</u>`;
    if (node.nodeName === "UL") return `<ul>${serializeChildren(node)}</ul>`;
    if (node.nodeName === "OL") return `<ol>${serializeChildren(node)}</ol>`;
    if (node.nodeName === "LI") return `<li>${serializeChildren(node)}</li>`;
    if (node.nodeName === "DIV" || node.nodeName === "P") {
      const inner = serializeChildren(node);
      return inner ? `<div>${inner}</div>` : "";
    }
    if (node.nodeName === "SPAN" && node.childNodes.length) {
      return serializeChildren(node);
    }
    return node.textContent || "";
  };

  return serializeChildren(container);
}

function appendHtmlFragment(parent, html) {
  if (!html) return;
  const tmp = document.createElement("div");
  tmp.innerHTML = sanitizeHtml(html);
  while (tmp.firstChild) parent.appendChild(tmp.firstChild);
}

function sanitizeHtml(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  const clean = document.createElement("div");
  const copyAllowed = (src, dest) => {
    Array.from(src.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        dest.appendChild(document.createTextNode(node.textContent));
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = node.nodeName;
        if (tag === "BR") {
          dest.appendChild(document.createElement("br"));
        } else if (ALLOWED_HTML_TAGS.has(tag)) {
          const map = { STRONG: "b", EM: "i" };
          const el = document.createElement(map[tag] || tag.toLowerCase());
          copyAllowed(node, el);
          dest.appendChild(el);
        } else {
          copyAllowed(node, dest);
        }
      }
    });
  };
  copyAllowed(tmp, clean);
  return clean.innerHTML;
}

function deserializeToFragment(serialized) {
  const frag = document.createDocumentFragment();
  if (!serialized) return frag;

  let lastIndex = 0;
  const regex = new RegExp(MATH_REGEX.source, "g");
  let match;

  while ((match = regex.exec(serialized)) !== null) {
    if (match.index > lastIndex) {
      appendHtmlFragment(frag, serialized.slice(lastIndex, match.index));
    }
    frag.appendChild(createMathFieldNode(match[1]));
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < serialized.length) {
    appendHtmlFragment(frag, serialized.slice(lastIndex));
  }

  return frag;
}

function createMathFieldNode(latex) {
  const mf = document.createElement("math-field");
  mf.setAttribute("class", "cte-inline-mathfield");
  mf.setAttribute("read-only", "");
  mf.setAttribute("math-virtual-keyboard-policy", "manual");
  mf.setAttribute("tabindex", "-1");

  const setLatex = () => {
    const root = mf.shadowRoot;
    if (root && !root.getElementById(MATHFIELD_CUSTOM_STYLE_ID)) {
      const style = document.createElement("style");
      style.id = MATHFIELD_CUSTOM_STYLE_ID;
      style.textContent = MATHFIELD_CUSTOM_CSS;
      root.appendChild(style);
    }
    if (mf.setValue) mf.setValue(latex, { silenceNotifications: true });
    else mf.value = latex;
  };

  if (customElements.get("math-field")) setLatex();
  else customElements.whenDefined("math-field").then(setLatex);

  return mf;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* ── Selection helpers ─────────────────────────────────── */

function saveSelection(container) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  if (!container.contains(range.commonAncestorContainer)) return null;
  return range.cloneRange();
}

function restoreSelection(range) {
  if (!range) return;
  const sel = window.getSelection();
  if (!sel) return;
  sel.removeAllRanges();
  sel.addRange(range);
}

function moveCursorToEnd(el) {
  const sel = window.getSelection();
  if (!sel) return;
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
}

function getListItem(node, root) {
  let n = node;
  while (n && n !== root) {
    if (n.nodeName === "LI") return n;
    n = n.parentNode;
  }
  return null;
}

function insertNodeAtSelection(container, node) {
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    if (container.contains(range.commonAncestorContainer)) {
      range.deleteContents();
      range.insertNode(node);
      const spacer = document.createTextNode("\u200B");
      range.setStartAfter(node);
      range.insertNode(spacer);
      range.setStartAfter(spacer);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      return;
    }
  }
  container.appendChild(node);
  container.appendChild(document.createTextNode("\u200B"));
  moveCursorToEnd(container);
}

function isEditorEmpty(el) {
  if (!el) return true;
  const text = (el.textContent || "").replace(/\u200B/g, "").trim();
  if (text) return false;
  return !el.querySelector("math-field, ul, ol, img");
}

/* ── Component ───────────────────────────────────────────── */

const CustomTextEditor = forwardRef(function CustomTextEditor(
  {
    value = "",
    onChange,
    placeholder = "Enter text here...",
    onMathType,
    onChemType,
    onMathEdit,
    mathTypeActive = false,
    chemTypeActive = false,
  },
  ref
) {
  const editorRef = useRef(null);
  const isInternalUpdate = useRef(false);
  const savedRangeRef = useRef(null);
  const historyRef = useRef([value]);
  const historyIdxRef = useRef(0);
  const mountedRef = useRef(false);

  const [showPlaceholder, setShowPlaceholder] = useState(!value);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    unorderedList: false,
    orderedList: false,
  });

  const syncActiveFormats = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const focused =
      document.activeElement === el || el.contains(document.activeElement);
    if (!focused) return;

    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      unorderedList: document.queryCommandState("insertUnorderedList"),
      orderedList: document.queryCommandState("insertOrderedList"),
    });
  }, []);

  const rebuildDom = useCallback((serialized, attachListeners) => {
    const el = editorRef.current;
    if (!el) return;
    el.innerHTML = "";
    el.appendChild(deserializeToFragment(serialized));
    if (attachListeners) {
      el.querySelectorAll("math-field.cte-inline-mathfield").forEach(attachListeners);
    }
    setShowPlaceholder(isEditorEmpty(el));
  }, []);

  const emitChange = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;

    const serialized = serializeEditor(el);
    setShowPlaceholder(isEditorEmpty(el));
    isInternalUpdate.current = true;
    onChange?.(serialized);

    const history = historyRef.current;
    const idx = historyIdxRef.current;
    if (history[idx] !== serialized) {
      const next = history.slice(0, idx + 1);
      next.push(serialized);
      if (next.length > 100) next.shift();
      historyRef.current = next;
      historyIdxRef.current = next.length - 1;
    }

    requestAnimationFrame(() => {
      isInternalUpdate.current = false;
      syncActiveFormats();
    });
  }, [onChange, syncActiveFormats]);

  const attachMfListener = useCallback(
    (mf) => {
      if (mf._cteListenerAttached) return;
      mf._cteListenerAttached = true;
      mf.addEventListener("input", emitChange);
      mf.addEventListener("mousedown", (e) => {
        if (e.button === 0) {
          e.preventDefault();
        }
      });
      mf.addEventListener("dblclick", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const latex = getMathLatex(mf);
        const isChem = /^\\ce\{/.test(latex);
        if (onMathEdit) {
          onMathEdit({ mf, latex, isChem });
        } else {
          editorRef.current?.focus();
        }
      });
      mf.addEventListener("focus", (e) => {
        e.preventDefault();
        mf.blur();
        editorRef.current?.focus();
      });
    },
    [emitChange, onMathEdit]
  );

  const applyValue = useCallback(
    (val, moveToEnd = true) => {
      const el = editorRef.current;
      if (!el) return;
      isInternalUpdate.current = true;
      rebuildDom(val, attachMfListener);
      if (moveToEnd) moveCursorToEnd(el);
      requestAnimationFrame(() => {
        isInternalUpdate.current = false;
        syncActiveFormats();
      });
    },
    [rebuildDom, attachMfListener, syncActiveFormats]
  );

  const performUndo = useCallback(() => {
    if (historyIdxRef.current <= 0) return;
    historyIdxRef.current -= 1;
    const prev = historyRef.current[historyIdxRef.current] ?? "";
    applyValue(prev);
    isInternalUpdate.current = true;
    onChange?.(prev);
    requestAnimationFrame(() => {
      isInternalUpdate.current = false;
    });
  }, [applyValue, onChange]);

  const performRedo = useCallback(() => {
    if (historyIdxRef.current >= historyRef.current.length - 1) return;
    historyIdxRef.current += 1;
    const next = historyRef.current[historyIdxRef.current] ?? "";
    applyValue(next);
    isInternalUpdate.current = true;
    onChange?.(next);
    requestAnimationFrame(() => {
      isInternalUpdate.current = false;
    });
  }, [applyValue, onChange]);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    historyRef.current = [value];
    historyIdxRef.current = 0;
    if (value) applyValue(value, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = editorRef.current;
    if (!el || isInternalUpdate.current) return;
    const current = serializeEditor(el);
    if (current === value) return;
    applyValue(value, false);
  }, [value, applyValue]);

  useEffect(() => {
    document.addEventListener("selectionchange", syncActiveFormats);
    return () => document.removeEventListener("selectionchange", syncActiveFormats);
  }, [syncActiveFormats]);

  const handleInput = useCallback(() => {
    emitChange();
  }, [emitChange]);

  const execFormat = useCallback(
    (command, valueArg = null) => {
      const el = editorRef.current;
      if (!el) return;
      el.focus();
      restoreSelection(savedRangeRef.current);
      try {
        document.execCommand("styleWithCSS", false, true);
      } catch {
        /* unsupported */
      }
      document.execCommand(command, false, valueArg);
      savedRangeRef.current = saveSelection(el);
      syncActiveFormats();
      emitChange();
    },
    [emitChange, syncActiveFormats]
  );

  const handleKeyDown = useCallback(
    (e) => {
      const el = editorRef.current;
      if (!el) return;

      // Handle Backspace/Delete when caret is adjacent to an inline math-field node.
      // If selection is collapsed and the caret is immediately before/after a math-field
      // remove the math-field and emit change so Backspace/Delete works intuitively.
      const handleDeleteNearMath = () => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return false;
        const range = sel.getRangeAt(0);
        if (!range.collapsed) return false;

        let { startContainer, startOffset } = range;

        const previousNode = (n) => {
          if (!n) return null;
          if (n.previousSibling) {
            n = n.previousSibling;
            while (n && n.lastChild) n = n.lastChild;
            return n;
          }
          return n.parentNode;
        };

        const nextNode = (n) => {
          if (!n) return null;
          if (n.nextSibling) {
            n = n.nextSibling;
            while (n && n.firstChild) n = n.firstChild;
            return n;
          }
          return null;
        };

        // Normalize starting point: if inside a text node but caret not at boundary,
        // don't intercept — let browser handle normal text deletion.
        if (startContainer.nodeType === Node.TEXT_NODE) {
          const txt = startContainer;
          // If caret is inside a non-zero-width text chunk, ignore
          if (e.key === "Backspace") {
            if (!(startOffset === 0 || (txt.textContent === "\u200B" && startOffset === 1))) {
              return false;
            }
          }
          if (e.key === "Delete") {
            if (!(startOffset === txt.textContent.length)) {
              return false;
            }
          }
        } else if (startContainer.nodeType === Node.ELEMENT_NODE) {
          // element node: offset refers to child index. We'll use that index.
          // For Backspace, if offset > 0 and previous child is math-field, intercept.
          if (e.key === "Backspace") {
            if (startOffset > 0) {
              const candidate = startContainer.childNodes[startOffset - 1];
              if (candidate && candidate.nodeName === "MATH-FIELD") {
                candidate.remove();
                e.preventDefault();
                emitChange();
                return true;
              }
            }
            return false;
          }
          if (e.key === "Delete") {
            const candidate = startContainer.childNodes[startOffset];
            if (candidate && candidate.nodeName === "MATH-FIELD") {
              candidate.remove();
              e.preventDefault();
              emitChange();
              return true;
            }
            return false;
          }
        }

        // For text nodes where caret is at a boundary, walk to adjacent node
        let pivot = startContainer;
        if (pivot.nodeType === Node.TEXT_NODE) {
          // use the text node itself as pivot
        }

        if (e.key === "Backspace") {
          const prev = previousNode(pivot);
          if (prev && prev.nodeName === "MATH-FIELD") {
            prev.remove();
            e.preventDefault();
            emitChange();
            return true;
          }
        }

        if (e.key === "Delete") {
          const next = nextNode(pivot);
          if (next && next.nodeName === "MATH-FIELD") {
            next.remove();
            e.preventDefault();
            emitChange();
            return true;
          }
        }

        return false;
      };

      if (e.key === "Backspace" || e.key === "Delete") {
        if (handleDeleteNearMath()) return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        performUndo();
        return;
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        performRedo();
        return;
      }

      if (e.key === "Enter" && !e.shiftKey) {
        const li = getListItem(window.getSelection()?.anchorNode, el);
        if (li) {
          // Browser handles new list item + auto numbering / bullets
          requestAnimationFrame(() => emitChange());
          return;
        }
        e.preventDefault();
        document.execCommand("insertParagraph");
        emitChange();
      }
    },
    [emitChange, performUndo, performRedo]
  );

  const runAction = useCallback(
    (actionId) => {
      const el = editorRef.current;
      if (!el) return;

      switch (actionId) {
        case "undo":
          performUndo();
          break;
        case "redo":
          performRedo();
          break;
        case "bullets":
          execFormat("insertUnorderedList");
          break;
        case "number":
          execFormat("insertOrderedList");
          break;
        case "bold":
          execFormat("bold");
          break;
        case "italic":
          execFormat("italic");
          break;
        case "underline":
          execFormat("underline");
          break;
        case "clear":
          execFormat("removeFormat");
          execFormat("unlink");
          break;
        default:
          break;
      }
    },
    [performUndo, performRedo, execFormat]
  );
  const handleEditorMouseUp = useCallback(() => {
    savedRangeRef.current = saveSelection(editorRef.current);
    syncActiveFormats();
  }, [syncActiveFormats]);

  const handleContentMouseDown = useCallback((e) => {
    // Do NOT call e.preventDefault() here — that suppresses native caret
    // rendering. The browser places the caret natively on mousedown; we just
    // save the selection immediately afterward (no RAF delay).
    if (e.target && e.target.closest && e.target.closest("math-field")) return;
    const el = editorRef.current;
    if (!el) return;
    // Save selection synchronously after browser has handled mousedown
    savedRangeRef.current = saveSelection(el);
    syncActiveFormats();
  }, [syncActiveFormats]);

  const handleContentPointerDown = useCallback((e) => {
    // Do NOT call e.preventDefault() — that suppresses native caret rendering.
    // Let the browser focus + place caret natively.
    if (e.target && e.target.closest && e.target.closest("math-field")) return;
  }, []);

  const handleEditorKeyUp = useCallback(() => {
    savedRangeRef.current = saveSelection(editorRef.current);
    syncActiveFormats();
  }, [syncActiveFormats]);

  const handleEditorFocus = useCallback(() => {
    syncActiveFormats();
  }, [syncActiveFormats]);

  const handleContentClick = useCallback((e) => {
    if (e.target && e.target.closest && e.target.closest("math-field")) return;
    const el = editorRef.current;
    if (!el) return;
    // Click fires after the browser has already focused the element and placed
    // the caret, so we just need to save the range and sync toolbar state.
    el.focus();
    savedRangeRef.current = saveSelection(el);
    syncActiveFormats();
  }, [syncActiveFormats]);

  const handleAreaMouseDown = useCallback((e) => {
    if (e.target.closest("math-field")) return;
    const el = editorRef.current;
    if (!el) return;
    // Only intercept clicks on the padding area *outside* the content div.
    // We must preventDefault here only in that case so that clicking the
    // wrapper padding still focuses the editor. Clicks directly on the
    // contenteditable content div are handled natively by the browser.
    if (!e.target.closest(".cte-content")) {
      e.preventDefault();
      el.focus();
      moveCursorToEnd(el);
    }
  }, []);

  const handleAreaClick = useCallback((e) => {
    if (e.target.closest("math-field")) return;
    const el = editorRef.current;
    if (!el) return;
    // Clicking empty space in editor area (below text) should focus editor.
    if (!e.target.closest(".cte-content")) {
      el.focus();
      moveCursorToEnd(el);
      savedRangeRef.current = saveSelection(el);
      syncActiveFormats();
    }
  }, [syncActiveFormats]);

  useImperativeHandle(
    ref,
    () => ({
      focus() {
        const el = editorRef.current;
        if (!el) return;
        el.focus();
        moveCursorToEnd(el);
      },
      insertMath(latex) {
        const el = editorRef.current;
        if (!el || !latex?.trim()) return;
        el.focus();
        restoreSelection(savedRangeRef.current);
        const mf = createMathFieldNode(latex.trim());
        insertNodeAtSelection(el, mf);
        requestAnimationFrame(() => {
          attachMfListener(mf);
          savedRangeRef.current = saveSelection(el);
          emitChange();
        });
      },
      updateMath(mf, newLatex) {
        if (mf.setValue) mf.setValue(newLatex, { silenceNotifications: true });
        else mf.value = newLatex;
        emitChange();
      },
      getValue() {
        return serializeEditor(editorRef.current);
      },
    }),
    [attachMfListener, emitChange]
  );

  const toolbarBtn = (id, title, icon, isActive = false, onClick) => (
    <button
      key={id}
      type="button"
      className={`cte-toolbar-btn${isActive ? " active" : ""}`}
      title={title}
      aria-label={title}
      aria-pressed={isActive}
      onMouseDown={(e) => {
        e.preventDefault();
        if (onClick) onClick();
        else runAction(id);
      }}
    >
      {icon}
    </button>
  );

  return (
    <div className="cte-wrapper">
      <div className="cte-toolbar" role="toolbar" aria-label="Text editor controls">
        {toolbarBtn("undo", "Undo (Ctrl+Z)", <IconUndo />)}
        {toolbarBtn("redo", "Redo (Ctrl+Y)", <IconRedo />)}
        <span className="cte-toolbar-divider" aria-hidden="true" />
        {toolbarBtn(
          "number",
          "Numbered list",
          <IconNumberList />,
          activeFormats.orderedList
        )}
        {toolbarBtn(
          "bullets",
          "Bullet list",
          <IconBulletList />,
          activeFormats.unorderedList
        )}
        <span className="cte-toolbar-divider" aria-hidden="true" />
        {toolbarBtn("bold", "Bold", <strong>B</strong>, activeFormats.bold)}
        {toolbarBtn("italic", "Italic", <em>I</em>, activeFormats.italic)}
        {toolbarBtn(
          "underline",
          "Underline",
          <span className="cte-u">U</span>,
          activeFormats.underline
        )}
        {toolbarBtn("clear", "Clear formatting", <IconEraser />)}
        <span className="cte-toolbar-divider" aria-hidden="true" />
        {toolbarBtn(
          "mathtype",
          "MathType",
          <IconMathType />,
          mathTypeActive,
          onMathType
        )}
        {toolbarBtn(
          "chemtype",
          "ChemType",
          <IconChemType />,
          chemTypeActive,
          onChemType
        )}
      </div>

      <div className="cte-editor-area" onMouseDown={handleAreaMouseDown} onClick={handleAreaClick}>
        {showPlaceholder && (
          <span className="cte-placeholder" aria-hidden="true">
            {placeholder}
          </span>
        )}
        <div
          ref={editorRef}
          className="cte-content"
          contentEditable
          suppressContentEditableWarning
          spellCheck
          onPointerDown={handleContentPointerDown}
          onMouseDown={handleContentMouseDown}
          onClick={handleContentClick}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onMouseUp={handleEditorMouseUp}
          onKeyUp={handleEditorKeyUp}
          onFocus={handleEditorFocus}
          aria-label="Question text editor"
          aria-multiline="true"
          role="textbox"
        />
      </div>
    </div>
  );
});

export default CustomTextEditor;
