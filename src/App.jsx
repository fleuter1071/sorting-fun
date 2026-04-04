import { useEffect, useRef, useState } from "react";

const storageKey = "sorting-fun-board";

const initialRequests = [
  {
    id: "req-1",
    title: "Fix onboarding drop-off for first-time users",
    source: "Growth team",
    priority: null,
  },
  {
    id: "req-2",
    title: "Review customer escalation on billing confusion",
    source: "Support",
    priority: null,
  },
  {
    id: "req-3",
    title: "Scope lightweight analytics dashboard refresh",
    source: "Product",
    priority: null,
  },
  {
    id: "req-4",
    title: "Tidy stale help-center screenshots",
    source: "Marketing",
    priority: null,
  },
  {
    id: "req-5",
    title: "Plan partner launch checklist for next quarter",
    source: "Partnerships",
    priority: null,
  },
];

const priorities = [
  {
    key: "top",
    title: "Top priority",
    chip: "Do now",
    copy: "Urgent work with outsized product or business impact.",
  },
  {
    key: "high",
    title: "High priority",
    chip: "Next up",
    copy: "Important work that should move soon.",
  },
  {
    key: "medium",
    title: "Medium priority",
    chip: "Plan it",
    copy: "Useful work that can be scheduled intentionally.",
  },
  {
    key: "low",
    title: "Low priority",
    chip: "Backlog",
    copy: "Good ideas, but not worth immediate attention.",
  },
];

const stackTilts = [-5, 4, -2, 3, -4];

function noteTone(priority) {
  return priority ?? "incoming";
}

function App() {
  const [items, setItems] = useState(loadSavedItems);
  const [dragState, setDragState] = useState(null);
  const [activeTarget, setActiveTarget] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({
    title: "",
    source: "",
  });
  const dropzoneRefs = useRef({});

  useEffect(() => {
    if (!dragState) {
      return undefined;
    }

    const handleMove = (event) => {
      const nextTarget = findDropzone(
        { x: event.clientX, y: event.clientY },
        dropzoneRefs.current
      );

      setDragState((current) =>
        current
          ? {
              ...current,
              cursorX: event.clientX,
              cursorY: event.clientY,
            }
          : current
      );
      setActiveTarget(nextTarget);
    };

    const handleUp = (event) => {
      const dropzone = findDropzone(
        { x: event.clientX, y: event.clientY },
        dropzoneRefs.current
      );

      if (dropzone) {
        setItems((current) =>
          current.map((item) =>
            item.id === dragState.item.id
              ? { ...item, priority: dropzone }
              : item
          )
        );
      }

      setDragState(null);
      setActiveTarget(null);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [dragState]);

  useEffect(() => {
    document.body.classList.toggle("dragging", Boolean(dragState));
    return () => document.body.classList.remove("dragging");
  }, [dragState]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items]);

  const unsorted = items.filter((item) => !item.priority);

  function startDrag(event, item) {
    const rect = event.currentTarget.getBoundingClientRect();

    setDragState({
      item,
      cursorX: event.clientX,
      cursorY: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    });
  }

  function resetBoard() {
    setItems(initialRequests);
    setEditingId(null);
    setDraft({
      title: "",
      source: "",
    });
    setDragState(null);
    setActiveTarget(null);
  }

  function handleDraftChange(event) {
    const { name, value } = event.target;

    setDraft((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleCreateRequest(event) {
    event.preventDefault();

    const title = draft.title.trim();
    const source = draft.source.trim();

    if (!title || !source) {
      return;
    }

    if (editingId) {
      setItems((current) =>
        current.map((item) =>
          item.id === editingId
            ? {
                ...item,
                title,
                source,
              }
            : item
        )
      );
      setEditingId(null);
    } else {
      setItems((current) => [
        {
          id: createRequestId(),
          title,
          source,
          priority: null,
        },
        ...current,
      ]);
    }

    setDraft({
      title: "",
      source: "",
    });
  }

  function startEditing(item) {
    setEditingId(item.id);
    setDraft({
      title: item.title,
      source: item.source,
    });
  }

  function cancelEditing() {
    setEditingId(null);
    setDraft({
      title: "",
      source: "",
    });
  }

  function deleteRequest(itemId) {
    setItems((current) => current.filter((item) => item.id !== itemId));

    if (editingId === itemId) {
      cancelEditing();
    }
  }

  return (
    <>
      <div className="page-shell">
        <header className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Priority triage prototype</p>
            <h1>Grab new requests and drop them into the right pile.</h1>
            <p className="hero-text">
              A tactile, visual way to sort incoming work into top, high, medium,
              and low priority. Pick up a note, move it by hand, and place it.
            </p>
          </div>

          <aside className="hero-panel" aria-label="Prototype guidance">
            <div className="hero-panel-row">
              <div>
                <p className="panel-label">How it works</p>
                <ol className="how-list">
                  <li>Pick up a request from the incoming stack.</li>
                  <li>Move it across the desk.</li>
                  <li>Drop it into one of the four priority piles.</li>
                </ol>
              </div>
              <button type="button" className="secondary-button" onClick={resetBoard}>
                Reset board
              </button>
            </div>
          </aside>
        </header>

        <main className="board" aria-label="Request sorting board">
          <section className="incoming-zone">
            <div className="section-heading">
              <p className="section-label">Incoming stack</p>
              <p className="section-subtle">New requests waiting for triage</p>
            </div>

            <form className="composer" onSubmit={handleCreateRequest}>
              <div className="composer-copy">
                <p className="composer-title">
                  {editingId ? "Edit request" : "Add a new request"}
                </p>
                <p className="composer-subtle">
                  {editingId
                    ? "Update the note, then save it back to the board."
                    : "Capture incoming work before you sort it."}
                </p>
              </div>

              <label className="composer-field">
                <span>Request</span>
                <input
                  type="text"
                  name="title"
                  value={draft.title}
                  onChange={handleDraftChange}
                  placeholder="Ex: Investigate spike in churn"
                />
              </label>

              <label className="composer-field">
                <span>Source</span>
                <input
                  type="text"
                  name="source"
                  value={draft.source}
                  onChange={handleDraftChange}
                  placeholder="Ex: Customer success"
                />
              </label>

              <div className="composer-actions">
                <button type="submit" className="primary-button">
                  {editingId ? "Save changes" : "Add request"}
                </button>
                {editingId ? (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={cancelEditing}
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>

            <div className="incoming-stack" aria-live="polite">
              {unsorted.map((item, index) => {
                const isDragging = dragState?.item.id === item.id;

                return (
                  <NoteCard
                    key={item.id}
                    item={item}
                    tone={noteTone(item.priority)}
                    className={isDragging ? "dragging-origin" : ""}
                    style={{
                      top: `${20 + index * 86}px`,
                      transform: `rotate(${stackTilts[index % stackTilts.length]}deg)`,
                    }}
                    onPointerDown={(event) => startDrag(event, item)}
                    onEdit={() => startEditing(item)}
                    onDelete={() => deleteRequest(item.id)}
                  />
                );
              })}
            </div>
          </section>

          <section className="pile-grid" aria-label="Priority piles">
            {priorities.map((priority) => {
              const pileItems = items.filter((item) => item.priority === priority.key);
              const isActive = activeTarget === priority.key;

              return (
                <article
                  key={priority.key}
                  className={`pile ${isActive ? "active-target" : ""}`}
                  data-priority={priority.key}
                >
                  <div className="pile-header">
                    <div>
                      <h2>{priority.title}</h2>
                      <p className="pile-copy">{priority.copy}</p>
                    </div>
                    <div className="pile-meta">
                      <span className={`pile-chip pile-chip-${priority.key}`}>
                        {priority.chip}
                      </span>
                      <span className="pile-count">{pileItems.length}</span>
                    </div>
                  </div>

                  <div
                    className="pile-dropzone"
                    ref={(node) => {
                      dropzoneRefs.current[priority.key] = node;
                    }}
                  >
                    {pileItems.map((item, index) => {
                      const isDragging = dragState?.item.id === item.id;

                      return (
                        <NoteCard
                          key={item.id}
                          item={item}
                          tone={noteTone(priority.key)}
                          className={`in-pile ${isDragging ? "dragging-origin" : ""}`}
                          style={{
                            transform: `rotate(${index % 2 === 0 ? "-1.5deg" : "1deg"})`,
                            zIndex: index + 1,
                          }}
                          onPointerDown={(event) => startDrag(event, item)}
                          onEdit={() => startEditing(item)}
                          onDelete={() => deleteRequest(item.id)}
                        />
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </section>
        </main>
      </div>

      <div
        className={`hand-layer ${dragState ? "visible" : ""}`}
        aria-hidden="true"
        style={
          dragState
            ? {
                left: `${dragState.cursorX}px`,
                top: `${dragState.cursorY}px`,
              }
            : undefined
        }
      >
        <div className="hand">
          <div className="hand-palm"></div>
          <div className="thumb"></div>
          <div className="finger finger-index"></div>
          <div className="finger finger-middle"></div>
          <div className="finger finger-ring"></div>
        </div>

        {dragState ? (
          <div
            className="drag-proxy active"
            style={{
              left: `${14 - dragState.offsetX}px`,
              top: `${26 - dragState.offsetY}px`,
            }}
          >
            <NoteCard
              item={dragState.item}
              tone={noteTone(dragState.item.priority)}
              className="proxy-card"
              showActions={false}
            />
          </div>
        ) : null}
      </div>
    </>
  );
}

function loadSavedItems() {
  if (typeof window === "undefined") {
    return initialRequests;
  }

  try {
    const saved = window.localStorage.getItem(storageKey);

    if (!saved) {
      return initialRequests;
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return initialRequests;
    }

    return parsed.filter(isValidItem);
  } catch {
    return initialRequests;
  }
}

function isValidItem(item) {
  return (
    item &&
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.source === "string" &&
    (item.priority === null ||
      priorities.some((priority) => priority.key === item.priority))
  );
}

function createRequestId() {
  return `req-${crypto.randomUUID()}`;
}

function NoteCard({
  item,
  tone,
  className = "",
  style,
  onPointerDown,
  onEdit,
  onDelete,
  showActions = true,
}) {
  return (
    <button
      type="button"
      className={`note-card ${className}`.trim()}
      data-tone={tone}
      style={style}
      onPointerDown={onPointerDown}
    >
      <span className="note-pin"></span>
      {showActions ? (
        <span className="note-actions">
          <button
            type="button"
            className="note-action-button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onEdit?.();
            }}
            aria-label={`Edit ${item.title}`}
          >
            Edit
          </button>
          <button
            type="button"
            className="note-action-button note-action-button-delete"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onDelete?.();
            }}
            aria-label={`Delete ${item.title}`}
          >
            Delete
          </button>
        </span>
      ) : null}
      <span className="note-title">{item.title}</span>
      <span className="note-meta">{item.source}</span>
    </button>
  );
}

function findDropzone(pointer, refs) {
  return Object.entries(refs).find(([, node]) => {
    if (!node) {
      return false;
    }

    const rect = node.getBoundingClientRect();
    return (
      pointer.x >= rect.left &&
      pointer.x <= rect.right &&
      pointer.y >= rect.top &&
      pointer.y <= rect.bottom
    );
  })?.[0] ?? null;
}

export default App;
