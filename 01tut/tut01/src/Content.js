import Header from "./Header";
import Content from "./Content";
import React, { useState } from "react";

function TodoList() {
  const [tasks, setTasks] = useState([
    { text: "Wake up early", completed: false },
    { text: "Study React", completed: false },
    { text: "Go for a walk", completed: false }
  ]);

  const [newTask, setNewTask] = useState("");
  // Add new task
  const addTask = () => {
    if (newTask.trim() === "") return;
    setTasks([...tasks, { text: newTask, completed: false }]);
    setNewTask("");
  };

  // Toggle task completion (strike-through)
  const toggleTask = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].completed = !updatedTasks[index].completed;
    setTasks(updatedTasks);
  };

  // Delete task
  const deleteTask = (index) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "30px" }}>
      <h1>📝 Daily To-Do List</h1>

      <input
        type="text"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="Add your task..."
      />
      <button onClick={addTask}>Add Task</button>

      <ul style={{ listStyleType: "none", padding: 0 }}>
        {tasks.map((task, index) => (
          <li
            key={index}
            onClick={() => toggleTask(index)}
            style={{
              cursor: "pointer",
              textDecoration: task.completed ? "line-through" : "none",
              color: task.completed ? "gray" : "black",
              marginTop: "10px"
            }}
          >
            {task.text}
            <button
              onClick={(e) => {
                e.stopPropagation(); // stops toggle when deleting
                deleteTask(index);
              }}
              style={{ marginLeft: "10px" }}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default TodoList;
