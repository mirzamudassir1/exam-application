import { Fragment, useEffect, useRef } from "react";

export default function MathChemDraftComposer({
  parts,
  onPartsChange,
  cursorIndex,
  onCursorIndexChange,
  onInsert,
  onClear,
  onKeyDown,
  fontFamily,
  fontSize,
  color,
  isBold,
  isItalic,
}) {
  const isEmpty = parts.length === 0;
  const composerInputRef = useRef(null);
  const safeCursorIndex = Math.min(Math.max(cursorIndex, 0), parts.length);

  useEffect(() => {
    if (!isEmpty) {
      composerInputRef.current?.focus();
    }
  }, [isEmpty, parts.length]);

  useEffect(() => {
    if (safeCursorIndex !== cursorIndex) {
      onCursorIndexChange(safeCursorIndex);
    }
  }, [cursorIndex, onCursorIndexChange, safeCursorIndex]);

  const updateTextPart = (id, value) => {
    onPartsChange((current) =>
      current.map((part) => (part.id === id ? { ...part, value } : part))
    );
  };

  const updateSlot = (id, slotIndex, value) => {
    onPartsChange((current) =>
      current.map((part) =>
        part.id === id
          ? {
              ...part,
              slots: part.slots.map((slot, index) =>
                index === slotIndex ? value : slot
              ),
            }
          : part
      )
    );
  };

  const removePartAt = (index) => {
    if (index < 0 || index >= parts.length) return;

    onPartsChange((current) =>
      current.filter((_, partIndex) => partIndex !== index)
    );
    onCursorIndexChange(Math.max(0, index));
  };

  const handleComposerKeyDown = (e) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || isEmpty) return;

    const target = e.target;
    const isInput =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement;

    if (!isInput && e.key === "ArrowLeft") {
      e.preventDefault();
      onCursorIndexChange(Math.max(0, safeCursorIndex - 1));
      return;
    }

    if (!isInput && e.key === "ArrowRight") {
      e.preventDefault();
      onCursorIndexChange(Math.min(parts.length, safeCursorIndex + 1));
      return;
    }

    if (e.key !== "Backspace") return;

    if (isInput) {
      if (target.value !== "") return;
      const partIndex = Number.parseInt(target.dataset.partIndex, 10);
      if (Number.isNaN(partIndex)) return;
      e.preventDefault();
      removePartAt(partIndex);
      return;
    }

    e.preventDefault();
    removePartAt(safeCursorIndex - 1);
  };

  const setCursorFromPartClick = (e, index) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const clickIsAfterCenter = e.clientX >= bounds.left + bounds.width / 2;
    onCursorIndexChange(index + (clickIsAfterCenter ? 1 : 0));
  };

  const renderCaret = (key = "draft-caret") => (
    <span
      key={key}
      aria-hidden="true"
      className="math-chem-draft-caret"
      style={styles.draftCaret}
    />
  );

  return (
    <div style={styles.composer}>
      <div
        ref={composerInputRef}
        style={{
          ...styles.composerInput,
          fontFamily: fontFamily || styles.composerInput.fontFamily,
          fontSize: fontSize || styles.composerInput.fontSize,
          color: color || styles.composerInput.color,
          fontWeight: isBold ? "700" : "400",
          fontStyle: isItalic ? "italic" : "normal",
        }}
        onKeyDown={handleComposerKeyDown}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            onCursorIndexChange(parts.length);
          }
        }}
        tabIndex={0}
      >
        {isEmpty ? (
          <span style={styles.placeholder}>Build here, edit, then insert</span>
        ) : (
          <>
            {parts.map((part, index) => (
              <Fragment key={part.id}>
                {safeCursorIndex === index && renderCaret(`caret-${index}`)}
                {part.kind === "text" ? (
                  <input
                    value={part.value}
                    onChange={(e) => updateTextPart(part.id, e.target.value)}
                    onMouseDown={(e) => setCursorFromPartClick(e, index)}
                    aria-label="Draft text"
                    data-part-id={part.id}
                    data-part-index={index}
                    style={{
                      ...styles.inlineTextInput,
                      fontFamily: fontFamily || styles.inlineTextInput.fontFamily,
                      fontSize: fontSize || styles.inlineTextInput.fontSize,
                      color: color || styles.inlineTextInput.color,
                      fontWeight: isBold ? "700" : "400",
                      fontStyle: isItalic ? "italic" : "normal",
                    }}
                  />
                ) : (
                  <TemplateDraftPart
                    part={part}
                    partIndex={index}
                    onMouseDown={(e) => setCursorFromPartClick(e, index)}
                    onSlotChange={updateSlot}
                    editorStyle={{
                      fontFamily: fontFamily || styles.composerInput.fontFamily,
                      fontSize: fontSize || styles.composerInput.fontSize,
                      color: color || styles.composerInput.color,
                      fontWeight: isBold ? "700" : "400",
                      fontStyle: isItalic ? "italic" : "normal",
                    }}
                  />
                )}
              </Fragment>
            ))}
            {safeCursorIndex === parts.length &&
              renderCaret(`caret-${parts.length}`)}
          </>
        )}
      </div>

      <div style={styles.composerActions}>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onInsert}
          style={styles.insertDraftBtn}
        >
          Insert
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onInsert}
          style={styles.updateDraftBtn}
        >
          Update
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onClear}
          style={styles.clearDraftBtn}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

const styles = {
  composer: {
    display: "grid",
    gridTemplateRows: "1fr auto",
    gap: "6px",
    padding: "8px",
    flex: "1 1 auto",
    minHeight: "126px",
    boxSizing: "border-box",
    background: "#edf3f7",
  },

  composerInput: {
    width: "100%",
    height: "100%",
    minHeight: 0,
    padding: "7px 8px",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    alignContent: "flex-start",
    flexWrap: "wrap",
    gap: "5px",
    overflow: "auto",
    border: "none",
    borderRadius: 0,
    background: "#ffffff",
    color: "#0f172a",
    fontFamily: "Cambria Math, STIX Two Math, serif",
    fontSize: "16px",
    lineHeight: "1.4",
    outline: "none",
    cursor: "text",
  },

  placeholder: {
    color: "#94a3b8",
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: "13px",
  },

  inlineTextInput: {
    minWidth: "34px",
    maxWidth: "180px",
    height: "26px",
    padding: "0 3px",
    border: "none",
    background: "transparent",
    color: "#0f172a",
    fontFamily: "Cambria Math, STIX Two Math, serif",
    fontSize: "16px",
    outline: "none",
  },

  templatePart: {
    position: "relative",
    minHeight: "30px",
    padding: "2px 4px",
    display: "inline-flex",
    alignItems: "center",
    gap: "3px",
    maxWidth: "100%",
    border: "none",
    borderRadius: 0,
    background: "transparent",
    fontFamily: "Cambria Math, STIX Two Math, serif",
    fontSize: "16px",
    lineHeight: 1.2,
  },

  draftCaret: {
    width: "1.5px",
    height: "24px",
    flex: "0 0 auto",
    background: "#0f172a",
  },

  slotInput: {
    width: "34px",
    height: "22px",
    padding: "0 3px",
    boxSizing: "border-box",
    border: "1px solid #15913b",
    borderRadius: "2px",
    background: "#ffffff",
    color: "#0f172a",
    textAlign: "center",
    fontFamily: "Cambria Math, STIX Two Math, serif",
    fontSize: "14px",
    outline: "none",
  },

  scriptDraft: {
    display: "inline-flex",
    alignItems: "center",
    gap: "2px",
    lineHeight: 1,
  },

  scriptSlotStack: {
    display: "inline-flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "1px",
  },

  scriptSlotPlaceholder: {
    width: "28px",
    height: "12px",
  },

  scriptSlotInput: {
    width: "28px",
    height: "14px",
    padding: "0 2px",
    boxSizing: "border-box",
    border: "1px solid #15913b",
    borderRadius: "2px",
    background: "#ffffff",
    color: "#0f172a",
    textAlign: "center",
    fontFamily: "Cambria Math, STIX Two Math, serif",
    fontSize: "11px",
    lineHeight: "12px",
    outline: "none",
  },

  arrowDraft: {
    display: "inline-flex",
    minWidth: "66px",
    width: "max-content",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "1px",
  },

  arrowSlotInput: {
    minWidth: "42px",
    width: "100%",
    maxWidth: "320px",
    height: "20px",
    padding: "0 4px",
    boxSizing: "border-box",
    border: "1px solid #15913b",
    borderRadius: "2px",
    background: "#ffffff",
    color: "#0f172a",
    textAlign: "center",
    fontFamily: "Cambria Math, STIX Two Math, serif",
    fontSize: "13px",
    outline: "none",
  },

  arrowSlotSpacer: {
    height: "20px",
  },

  arrowLine: {
    minWidth: "66px",
    width: "100%",
    height: "18px",
    position: "relative",
    display: "block",
    color: "#334155",
  },

  fractionDraft: {
    display: "inline-flex",
    minWidth: "42px",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "2px",
  },

  fractionLine: {
    borderTop: "1.5px solid #111827",
  },

  arrowLineStem: {
    position: "absolute",
    left: "8px",
    right: "8px",
    top: "8px",
    borderTop: "1.5px solid #334155",
  },

  arrowLineStemLower: {
    top: "12px",
  },

  arrowLineStemUpper: {
    top: "5px",
  },

  arrowHeadRight: {
    position: "absolute",
    right: "3px",
    top: "5px",
    width: "7px",
    height: "7px",
    borderTop: "1.5px solid #334155",
    borderRight: "1.5px solid #334155",
    boxSizing: "border-box",
    transform: "rotate(45deg)",
  },

  arrowHeadLeft: {
    position: "absolute",
    left: "3px",
    top: "5px",
    width: "7px",
    height: "7px",
    borderBottom: "1.5px solid #334155",
    borderLeft: "1.5px solid #334155",
    boxSizing: "border-box",
    transform: "rotate(45deg)",
  },

  removePartBtn: {
    position: "absolute",
    top: "1px",
    right: "2px",
    width: "14px",
    height: "14px",
    padding: 0,
    border: "none",
    background: "transparent",
    color: "#64748b",
    cursor: "pointer",
    fontSize: "12px",
    lineHeight: "14px",
  },

  composerActions: {
    display: "flex",
    flexDirection: "row",
    gap: "6px",
    justifyContent: "flex-end",
    alignItems: "center",
    minHeight: "30px",
  },

  insertDraftBtn: {
    width: "72px",
    height: "28px",
    border: "1px solid #1d4ed8",
    borderRadius: "5px",
    background: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "700",
  },

  clearDraftBtn: {
    width: "72px",
    height: "28px",
    border: "1px solid #cbd5e1",
    borderRadius: "5px",
    background: "#ffffff",
    color: "#334155",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "700",
  },

  updateDraftBtn: {
    width: "72px",
    height: "28px",
    border: "1px solid #64748b",
    borderRadius: "5px",
    background: "#e2e8f0",
    color: "#1f2937",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "700",
  },

  disabledDraftBtn: {
    opacity: 0.55,
    cursor: "not-allowed",
  },
};

function TemplateDraftPart({
  part,
  partIndex,
  onMouseDown,
  onSlotChange,
  editorStyle,
}) {
  const inputStyle = {
    fontFamily: editorStyle.fontFamily,
    color: editorStyle.color,
    fontWeight: editorStyle.fontWeight,
    fontStyle: editorStyle.fontStyle,
  };

  const slot = (index) => (
    <input
      value={part.slots[index] || ""}
      onChange={(e) => onSlotChange(part.id, index, e.target.value)}
      aria-label={`Template value ${index + 1}`}
      data-part-id={part.id}
      data-part-index={partIndex}
      style={{
        ...styles.slotInput,
        ...inputStyle,
      }}
    />
  );
  const scriptSlot = (index) => (
    <input
      value={part.slots[index] || ""}
      onChange={(e) => onSlotChange(part.id, index, e.target.value)}
      aria-label={`Template value ${index + 1}`}
      data-part-id={part.id}
      data-part-index={partIndex}
      style={{
        ...styles.scriptSlotInput,
        ...inputStyle,
      }}
    />
  );
  const arrowSlot = (index) => {
    const value = part.slots[index] || "";

    return (
      <input
        value={value}
        onChange={(e) => onSlotChange(part.id, index, e.target.value)}
        aria-label={`Arrow label ${index + 1}`}
        data-part-id={part.id}
        data-part-index={partIndex}
        style={{
          ...styles.arrowSlotInput,
          ...inputStyle,
          width: `${Math.max(42, value.length * 9 + 18)}px`,
        }}
      />
    );
  };

  return (
    <span
      onMouseDown={onMouseDown}
      style={{
        ...styles.templatePart,
        fontFamily: editorStyle.fontFamily,
        color: editorStyle.color,
        fontWeight: editorStyle.fontWeight,
        fontStyle: editorStyle.fontStyle,
      }}
    >
      {renderTemplatePart(part, slot, arrowSlot, scriptSlot)}
    </span>
  );
}

function renderTemplatePart(part, slot, arrowSlot, scriptSlot) {
  const template = part.template;

  if (template.type === "formula") {
    if (template.display === "□/□") {
      return (
        <span style={styles.fractionDraft}>
          {slot(0)}
          <span style={styles.fractionLine} />
          {slot(1)}
        </span>
      );
    }

    const pieces = template.display.split("□");
    return pieces.flatMap((piece, index) =>
      index < pieces.length - 1
        ? [
            <span key={`piece-${index}`}>{piece}</span>,
            <span key={`slot-${index}`}>{slot(index)}</span>,
          ]
        : [<span key={`piece-${index}`}>{piece}</span>]
    );
  }

  if (template.type === "fraction-template") {
    return (
      <span style={styles.fractionDraft}>
        {slot(0)}
        <span style={styles.fractionLine} />
        {slot(1)}
      </span>
    );
  }

  if (template.type === "script-template") {
    const hasSup = template.variant === "sup" || template.variant === "sub-sup";
    const hasSub = template.variant === "sub" || template.variant === "sub-sup";
    const subIndex = 1;
    const supIndex = template.variant === "sub-sup" ? 2 : 1;

    return (
      <span style={styles.scriptDraft}>
        {slot(0)}
        <span style={styles.scriptSlotStack}>
          {hasSup ? (
            scriptSlot(supIndex)
          ) : (
            <span style={styles.scriptSlotPlaceholder} />
          )}
          {hasSub ? (
            scriptSlot(subIndex)
          ) : (
            <span style={styles.scriptSlotPlaceholder} />
          )}
        </span>
      </span>
    );
  }

  if (template.type === "stacked-operator-template") {
    return (
      <>
        <span>{template.operator}</span>
        {part.slots.map((_, index) => slot(index))}
      </>
    );
  }

  if (template.type === "accent-template") {
    return <>{slot(0)}</>;
  }

  if (template.type === "labeled-arrow") {
    const aboveIndex = template.slots.includes("above") ? 0 : -1;
    const belowIndex = template.slots.includes("below")
      ? template.slots.includes("above")
        ? 1
        : 0
      : -1;

    return (
      <span style={styles.arrowDraft}>
        {aboveIndex >= 0 ? (
          arrowSlot(aboveIndex)
        ) : (
          <span style={styles.arrowSlotSpacer} />
        )}
        <ScalableArrow arrow={template.arrow} />
        {belowIndex >= 0 ? (
          arrowSlot(belowIndex)
        ) : (
          <span style={styles.arrowSlotSpacer} />
        )}
      </span>
    );
  }

  return null;
}

function ScalableArrow({ arrow }) {
  const isLeft = ["←", "⇐"].includes(arrow);
  const isBoth = ["↔", "⇔"].includes(arrow);
  const isEquilibrium = ["⇌", "⇄", "⇆"].includes(arrow);

  if (isEquilibrium) {
    return (
      <span style={styles.arrowLine}>
        <span
          style={{
            ...styles.arrowLineStem,
            ...styles.arrowLineStemUpper,
            left: "5px",
            right: "10px",
          }}
        />
        <span
          style={{
            ...styles.arrowHeadRight,
            top: "2px",
          }}
        />
        <span
          style={{
            ...styles.arrowLineStem,
            ...styles.arrowLineStemLower,
            left: "10px",
            right: "5px",
          }}
        />
        <span
          style={{
            ...styles.arrowHeadLeft,
            top: "9px",
          }}
        />
      </span>
    );
  }

  return (
    <span style={styles.arrowLine}>
      <span style={styles.arrowLineStem} />
      {(isLeft || isBoth) && <span style={styles.arrowHeadLeft} />}
      {(!isLeft || isBoth) && <span style={styles.arrowHeadRight} />}
    </span>
  );
}
