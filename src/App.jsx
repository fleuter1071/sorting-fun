import { useEffect, useRef, useState } from "react";

const storageKey = "sorting-fun-board";

const initialRequests = [
  {
    id: "req-1",
    title: "Fix onboarding drop-off for first-time users",
    source: "Growth team",
    priority: null,
    status: "active",
  },
  {
    id: "req-2",
    title: "Review customer escalation on billing confusion",
    source: "Support",
    priority: null,
    status: "active",
  },
  {
    id: "req-3",
    title: "Scope lightweight analytics dashboard refresh",
    source: "Product",
    priority: null,
    status: "active",
  },
  {
    id: "req-4",
    title: "Tidy stale help-center screenshots",
    source: "Marketing",
    priority: null,
    status: "active",
  },
  {
    id: "req-5",
    title: "Plan partner launch checklist for next quarter",
    source: "Partnerships",
    priority: null,
    status: "active",
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

  const activeItems = items.filter((item) => item.status !== "completed");
  const completedItems = items.filter((item) => item.status === "completed");
  const unsorted = activeItems.filter((item) => !item.priority);
  const topCount = activeItems.filter((item) => item.priority === "top").length;
  const highCount = activeItems.filter((item) => item.priority === "high").length;
  const mediumCount = activeItems.filter((item) => item.priority === "medium").length;
  const lowCount = activeItems.filter((item) => item.priority === "low").length;
  const completedCount = completedItems.length;

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
          status: "active",
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

  function completeRequest(itemId) {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status: "completed",
            }
          : item
      )
    );

    if (editingId === itemId) {
      cancelEditing();
    }
  }

  function restoreRequest(itemId) {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status: "active",
            }
          : item
      )
    );
  }

  return (
    <>
      <div className="page-shell">
        <header className="workspace-header">
          <div className="workspace-header-copy">
            <p className="eyebrow">Priority triage prototype</p>
            <h1>Sorting Fun By Doug</h1>
            <p className="workspace-header-text">
              Add a request, then move the note into the pile that best fits urgency
              and impact.
            </p>
          </div>
          <button type="button" className="utility-button" onClick={resetBoard}>
            Reset board
          </button>
        </header>

        <section className="workspace-band" aria-label="Board controls and summary">
          <div className="workspace-band-shell">
            <form className="composer" onSubmit={handleCreateRequest}>
              <div className="composer-head">
                <div className="composer-copy">
                  <p className="composer-kicker">
                    {editingId ? "Editing note" : "Add request"}
                  </p>
                  <p className="composer-title">
                    {editingId
                      ? "Update the request and keep sorting"
                      : "Capture the next piece of work"}
                  </p>
                  <p className="composer-subtle">
                    {editingId
                      ? "Save the update, then place the note back into the right pile."
                      : "Enter the request here. It will appear in the incoming stack ready to sort."}
                  </p>
                </div>
              </div>

              <div className="composer-fields">
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
              </div>

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

            <aside className="summary-panel" aria-label="Board snapshot">
              <div className="summary-panel-head">
                <p className="composer-kicker">Board snapshot</p>
              </div>

              <section className="board-summary" aria-label="Board summary">
                <SummaryCard
                  tone="incoming"
                  label="Waiting to sort"
                  value={unsorted.length}
                  detail="New requests still in the stack"
                />
                <SummaryCard
                  tone="top"
                  label="Top priority"
                  value={topCount}
                  detail="Immediate work"
                />
                <SummaryCard
                  tone="high"
                  label="High priority"
                  value={highCount}
                  detail="Needs attention soon"
                />
                <SummaryCard
                  tone="medium"
                  label="Medium priority"
                  value={mediumCount}
                  detail="Planned work"
                />
                <SummaryCard
                  tone="low"
                  label="Low priority"
                  value={lowCount}
                  detail="Backlog ideas"
                />
                <SummaryCard
                  tone="completed"
                  label="Completed"
                  value={completedCount}
                  detail="Finished work"
                />
              </section>
            </aside>
          </div>
        </section>

        <main className="board" aria-label="Request sorting board">
          <section className="incoming-zone">
            <div className="section-heading">
              <p className="section-label">Incoming stack</p>
              <p className="section-subtle">New requests waiting for triage</p>
            </div>

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
                      "--card-rotate": `${stackTilts[index % stackTilts.length]}deg`,
                    }}
                    onPointerDown={(event) => startDrag(event, item)}
                    onEdit={() => startEditing(item)}
                    onDelete={() => deleteRequest(item.id)}
                    onComplete={() => completeRequest(item.id)}
                    showComplete={false}
                  />
                );
              })}
            </div>
          </section>

          <section className="pile-grid" aria-label="Priority piles">
            {priorities.map((priority) => {
              const pileItems = activeItems.filter(
                (item) => item.priority === priority.key
              );
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
                            "--card-rotate": index % 2 === 0 ? "-1.5deg" : "1deg",
                            zIndex: index + 1,
                          }}
                          onPointerDown={(event) => startDrag(event, item)}
                          onEdit={() => startEditing(item)}
                          onDelete={() => deleteRequest(item.id)}
                          onComplete={() => completeRequest(item.id)}
                        />
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </section>
        </main>

        <section className="completed-zone" aria-label="Completed requests">
          <div className="completed-zone-header">
            <div>
              <p className="section-label">Completed</p>
              <p className="section-subtle">
                Finished work stays here for quick review without crowding the active
                board.
              </p>
            </div>
            <span className="completed-count">{completedCount}</span>
          </div>

          {completedItems.length ? (
            <div className="completed-list">
              {completedItems.map((item, index) => (
                <NoteCard
                  key={item.id}
                  item={item}
                  tone="completed"
                  className="completed-card"
                  style={{
                    "--card-rotate": index % 2 === 0 ? "-0.6deg" : "0.4deg",
                  }}
                  onEdit={() => startEditing(item)}
                  onDelete={() => deleteRequest(item.id)}
                  onRestore={() => restoreRequest(item.id)}
                  showComplete={false}
                  dragEnabled={false}
                  statusLabel={priorityLabel(item.priority)}
                />
              ))}
            </div>
          ) : (
            <div className="completed-empty">
              <p className="completed-empty-title">Nothing completed yet.</p>
              <p className="completed-empty-copy">
                Completed requests will appear here after you finish them from one of
                the active priority piles.
              </p>
            </div>
          )}
        </section>
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
    (item.status === undefined ||
      item.status === "active" ||
      item.status === "completed") &&
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
  onComplete,
  onRestore,
  showActions = true,
  showComplete = true,
  dragEnabled = true,
  statusLabel,
}) {
  return (
    <article
      className={`note-card ${className}`.trim()}
      data-tone={tone}
      style={style}
    >
      <span className="note-pin"></span>
      <button
        type="button"
        className="note-surface"
        onPointerDown={dragEnabled ? onPointerDown : undefined}
        aria-label={dragEnabled ? `Move ${item.title}` : item.title}
      >
        <span className="note-title">{item.title}</span>
        <span className="note-meta">{item.source}</span>
        {statusLabel ? <span className="note-status-label">{statusLabel}</span> : null}
      </button>
      {showActions ? (
        <div className="note-actions" role="group" aria-label={`Actions for ${item.title}`}>
          {showComplete ? (
            <button
              type="button"
              className="note-action-button note-action-button-complete"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                onComplete?.();
              }}
              aria-label={`Complete ${item.title}`}
            >
              Complete
            </button>
          ) : null}
          {onRestore ? (
            <button
              type="button"
              className="note-action-button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                onRestore?.();
              }}
              aria-label={`Restore ${item.title}`}
            >
              Restore
            </button>
          ) : null}
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
        </div>
      ) : null}
    </article>
  );
}

function SummaryCard({ tone, label, value, detail }) {
  return (
    <article className="summary-card" data-tone={tone}>
      <span className="summary-label">{label}</span>
      <strong className="summary-value">{value}</strong>
      <span className="summary-detail">{detail}</span>
    </article>
  );
}

function priorityLabel(priority) {
  if (!priority) {
    return "Completed from incoming";
  }

  const match = priorities.find((item) => item.key === priority);
  return `Completed from ${match?.title ?? priority}`;
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
