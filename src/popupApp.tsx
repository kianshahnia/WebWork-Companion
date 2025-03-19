import React, { useEffect, useState } from "react";
import "./Popup.css";

/* --- Types --- */
interface Question {
  id: string;
  note: string;
  difficulty: number;
}

interface Assignment {
  id: string;
  name: string;
  questions: Question[];
}

/* --- Main PopupApp Component --- */
const PopupApp: React.FC = () => {
  const [autoClear, setAutoClear] = useState(false);
  const [currentPage, setCurrentPage] = useState<"main" | "page1" | "page2">("main");

  // Retrieve stored autoClear setting on mount
  useEffect(() => {
    chrome.storage.sync.get("autoClear", (data) => {
      if (typeof data.autoClear === "boolean") {
        setAutoClear(data.autoClear);
      }
    });
  }, []);

  const handleToggleAutoClear = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setAutoClear(newValue);
    chrome.storage.sync.set({ autoClear: newValue });
  };

  const clearAllWebWorkInputs = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.id || !tab.url) return;
      if (!tab.url.includes("webwork")) {
        console.log("Not on a WebWork page. No inputs were cleared.");
        return;
      }
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: () => {
            const webWorkInputs = document.querySelectorAll('input[id*="AnSwEr"]');
            webWorkInputs.forEach((input) => {
              (input as HTMLInputElement).value = "";
            });
          },
        },
        () => console.log("Cleared all WebWork answer fields!")
      );
    });
  };

  const clearTextAreas = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.id || !tab.url) return;
      if (!tab.url.includes("webwork")) {
        console.log("Not on a WebWork page. No inputs were cleared.");
        return;
      }
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: () => {
            const webWorkTextAreas = document.querySelectorAll('textarea[id*="AnSwEr"]');
            webWorkTextAreas.forEach((textarea) => {
              (textarea as HTMLInputElement).value = "";
            });
          },
        },
        () => console.log("Cleared all WebWork text area fields!")
      );
    });
  };

  const resetAllWebWorkSelects = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.id || !tab.url) return;
      if (!tab.url.includes("webwork")) {
        console.log("Not on a WebWork page. No select fields were reset.");
        return;
      }
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: () => {
            const webWorkSelects = document.querySelectorAll('select[id^="AnSwEr"]');
            webWorkSelects.forEach((select) => {
              (select as HTMLSelectElement).selectedIndex = 0;
            });
          },
        },
        () => console.log("Reset all WebWork select fields!")
      );
    });
  };

  const unselectAllWebWorkRadiosAndCheckboxes = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.id || !tab.url) return;
      if (!tab.url.includes("webwork")) {
        console.log("Not on a WebWork page. No radio/checkbox inputs were unselected.");
        return;
      }
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: () => {
            const radios = document.querySelectorAll('input[type="radio"][id*="AnSwEr"]');
            radios.forEach((radio) => {
              (radio as HTMLInputElement).checked = false;
            });
            const checkboxes = document.querySelectorAll('input[type="checkbox"][id*="AnSwEr"]');
            checkboxes.forEach((checkbox) => {
              (checkbox as HTMLInputElement).checked = false;
            });
          },
        },
        () => console.log("All WebWork radio and checkbox inputs are now unselected!")
      );
    });
  };

  const handleClearBoth = () => {
    clearAllWebWorkInputs();
    resetAllWebWorkSelects();
    unselectAllWebWorkRadiosAndCheckboxes();
    clearTextAreas();
  };

  return (
    <div className={`popupContainer ${currentPage !== "main" ? "subpage" : ""}`}>
      {currentPage === "main" ? (
        <>
          <h1 className="title">WebWork Companion</h1>
          <p className="switch-text">Auto-Clear</p>
          <label className="cl-switch">
            <input
              checked={autoClear}
              onChange={handleToggleAutoClear}
              type="checkbox"
            />
            <span></span>
          </label>
          <button onClick={handleClearBoth} className="button-4" role="button">
            Clear Answers
          </button>
        </>
      ) : (
        <div className="page-content">
          {currentPage === "page1" ? (
            <RecordPage />
          ) : (
            <>
              <h2 className="title">Notes</h2>
              <p>This is the content for Page 2.</p>
            </>
          )}
        </div>
      )}
      {/* Bottom Navigation */}
      <div className="bottom-nav">
        {currentPage === "main" ? (
          <>
            <a href="#" className="nav-link" onClick={() => setCurrentPage("page1")}>
              Record
            </a>
            <span className="nav-divider" />
            <a href="#" className="nav-link" onClick={() => setCurrentPage("page2")}>
              Notes
            </a>
          </>
        ) : (
          <a href="#" className="nav-link" onClick={() => setCurrentPage("main")}>
            ← Back
          </a>
        )}
      </div>
    </div>
  );
};

export default PopupApp;

/* --- RecordPage Component --- */
const RecordPage: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("");

  // Load assignments on mount
  useEffect(() => {
    chrome.storage.local.get(["assignments"], (result) => {
      const stored = result.assignments || [];
      setAssignments(stored);
      if (stored.length > 0 && !selectedAssignmentId) {
        setSelectedAssignmentId(stored[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (assignments.length > 0 && !assignments.find((a) => a.id === selectedAssignmentId)) {
      setSelectedAssignmentId(assignments[0].id);
    }
  }, [assignments, selectedAssignmentId]);

  const addAssignment = (name: string, questionCount: number) => {
    if (!name.trim()) return;
    const newAssignment: Assignment = {
      id: Date.now().toString(),
      name,
      questions: Array.from({ length: questionCount }, (_, i) => ({
        id: `q${i + 1}`,
        note: "",
        difficulty: 0,
      })),
    };
    const updated = [...assignments, newAssignment];
    setAssignments(updated);
    chrome.storage.local.set({ assignments: updated });
    setSelectedAssignmentId(newAssignment.id);
  };

  const removeAssignment = (assignmentId: string) => {
    const updated = assignments.filter((a) => a.id !== assignmentId);
    setAssignments(updated);
    chrome.storage.local.set({ assignments: updated });
    if (selectedAssignmentId === assignmentId) {
      setSelectedAssignmentId(updated.length > 0 ? updated[0].id : "");
    }
  };

  const selectedAssignment = assignments.find((a) => a.id === selectedAssignmentId);

  return (
    <div>
      <h2 className="title">Record</h2>
      <AddAssignmentForm addAssignment={addAssignment} />
      <div className="assignmentSelector">
        <select
          value={selectedAssignmentId}
          onChange={(e) => setSelectedAssignmentId(e.target.value)}
        >
          {assignments.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        {selectedAssignmentId && (
          <button onClick={() => removeAssignment(selectedAssignmentId)} className="removeBtn">
            Remove
          </button>
        )}
      </div>
      {selectedAssignment ? (
        <AssignmentItem assignment={selectedAssignment} setAssignments={setAssignments} />
      ) : (
        <p className="emptyList">No assignment selected.</p>
      )}
    </div>
  );
};

/* --- Form Component for Adding an Assignment --- */
const AddAssignmentForm: React.FC<{ addAssignment: (name: string, questionCount: number) => void }> = ({ addAssignment }) => {
  const [name, setName] = useState("");
  const [questionCount, setQuestionCount] = useState(1);

  const handleAdd = () => {
    addAssignment(name, questionCount);
    setName("");
    setQuestionCount(1);
  };

  return (
    <div className="addAssignmentForm">
      <input
        type="text"
        placeholder="Assignment Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      &nbsp;
      <input
        type="number"
        min="1"
        value={questionCount}
        onChange={(e) => setQuestionCount(parseInt(e.target.value) || 1)}
      />
      &nbsp;
      <button onClick={handleAdd}>Add</button>
    </div>
  );
};

/* --- Component to Render an Assignment --- */
const AssignmentItem: React.FC<{
  assignment: Assignment;
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
}> = ({ assignment, setAssignments }) => {
  return (
    <div className="assignmentItem">
      <h3>{assignment.name}</h3>
      {assignment.questions.map((q, index) => (
        <QuestionItem 
          key={q.id} 
          question={q} 
          questionNumber={index + 1}
          assignmentId={assignment.id} 
          setAssignments={setAssignments} 
        />
      ))}
    </div>
  );
};

/* --- Component to Render a Single Question --- */
const QuestionItem: React.FC<{
  question: Question;
  questionNumber: number;
  assignmentId: string;
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
}> = ({ question, questionNumber, assignmentId, setAssignments }) => {
  const [note, setNote] = useState(question.note);
  const [difficulty, setDifficulty] = useState(question.difficulty);

  const saveChanges = () => {
    chrome.storage.local.get(["assignments"], (result) => {
      const all = (result.assignments || []) as Assignment[];
      const updated = all.map((a) => {
        if (a.id === assignmentId) {
          const updatedQuestions = a.questions.map((q) => {
            if (q.id === question.id) {
              return { ...q, note, difficulty };
            }
            return q;
          });
          return { ...a, questions: updatedQuestions };
        }
        return a;
      });
      chrome.storage.local.set({ assignments: updated }, () => {
        setAssignments(updated);
      });
    });
  };

  // Handler for star rating
  const handleStarClick = (rating: number) => {
    setDifficulty(rating);
    setTimeout(saveChanges, 100); // Save after state update
  };

  return (
    <div className="questionItem">
      <p>Q{questionNumber}</p>
      <input
        type="text"
        placeholder="Notes"
        className="inputNote"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onBlur={saveChanges}
      />
      <div className="star-rating">
        {[1, 2, 3, 4].map((star) => (
          <span
            key={star}
            className={star <= difficulty ? "filled" : ""}
            onClick={() => handleStarClick(star)}
          >
            ★
          </span>
        ))}
      </div>
    </div>
  );
};
