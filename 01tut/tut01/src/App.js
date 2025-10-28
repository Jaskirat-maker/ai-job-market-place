import React, { useState, useEffect } from "react";
import Header from "./Header";
import Content from "./Content";
import Footer from "./Footer";
import AddItem from "./AddItem"; // ✅ import your AddItem component

function App() {

  // const API_URL = "https://localhost:5000/api/items";
   // this is the api url for the backend server
  
  const [items, setItems] = useState([
    { id: 1, text: "Task 1", checked: false },
    { id: 2, text: "Task 2", checked: true },
    { id: 3, text: "Task 3", checked: false },
  ]);
  const [incompleteTasks, setIncompleteTasks] = useState([]);
  const [incompleteCount, setIncompleteCount] = useState(0);
  const [newItem, setNewItem] = useState(""); // ✅ to track the input field
  // ✅ Automatically update incomplete tasks whenever items change
  useEffect(() => {
    const filtered = items.filter((item) => !item.checked);
    setIncompleteTasks(filtered);
    setIncompleteCount(filtered.length);
  }, [items]);

  // ✅ Handle adding new task
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    const newTask = {
      id: items.length + 1,
      text: newItem,
      checked: false,
    };

    setItems([...items, newTask]);
    setNewItem(""); // clear input field
  };

  return (
    <div className="App" style={{ textAlign: "center", marginTop: "20px" }}>
      <Header title="Project Management App" />

      {/* ✅ Add Item input box with + button */}
      <AddItem newItem={newItem} setNewItem={setNewItem} handleAddItem={handleAddItem} />

      {/* ✅ Content area to show tasks */}
      <Content items={items} setItems={setItems} />

      {/* ✅ Footer automatically updates with incomplete tasks */}
      <Footer incompleteCount={incompleteCount} incompleteTasks={incompleteTasks} />
    </div>
  );
}

export default App;
