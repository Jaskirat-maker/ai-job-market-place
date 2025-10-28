import React, { useState, useEffect } from "react";
import Footer from "./Footer";
import AddItem from "./AddItem";

function App() {
  const [items, setItems] = useState([
    { id: 1, text: "Wake up early", checked: false },
    { id: 2, text: "Study React", checked: false },
    { id: 3, text: "Go for a walk", checked: false },
  ]);

  const [incompleteTasks, setIncompleteTasks] = useState([]);
  const [incompleteCount, setIncompleteCount] = useState(0);
  const [newItem, setNewItem] = useState("");

  // ✅ Update remaining tasks whenever list changes
  useEffect(() => {
    const filtered = items.filter((item) => !item.checked);
    setIncompleteTasks(filtered);
    setIncompleteCount(filtered.length);
  }, [items]);

  // ✅ Add new task
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    const newTask = {
      id: items.length + 1,
      text: newItem,
      checked: false,
    };

    setItems([...items, newTask]);
    setNewItem("");
  };

  // ✅ Toggle completion
  const toggleTask = (id) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  // ✅ Delete task
  const deleteTask = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <div
      className="App"
      style={{
        textAlign: "center",
        marginTop: "30px",
        backgroundColor: "#d6d6d6",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      {/* ✅ Input bar with plus icon */}
      <AddItem newItem={newItem} setNewItem={setNewItem} handleAddItem={handleAddItem} />

      {/* ✅ List of tasks */}
      <ul style={{ listStyleType: "none", padding: 0, marginTop: "30px" }}>
        {items.map((item) => (
          <li
            key={item.id}
            onClick={() => toggleTask(item.id)}
            style={{
              cursor: "pointer",
              textDecoration: item.checked ? "line-through" : "none",
              color: item.checked ? "gray" : "black",
              marginBottom: "10px",
              fontSize: "18px",
            }}
          >
            {item.text}
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteTask(item.id);
              }}
              style={{
                marginLeft: "10px",
                border: "none",
                backgroundColor: "#f44336",
                color: "white",
                borderRadius: "5px",
                cursor: "pointer",
                padding: "3px 6px",
              }}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>

      {/* ✅ Footer showing remaining tasks */}
      <Footer incompleteCount={incompleteCount} incompleteTasks={incompleteTasks} />
    </div>
  );
}

export default App;
