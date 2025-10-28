import React from "react";

function Footer({ incompleteCount, incompleteTasks }) {
  const year = new Date().getFullYear();

  return (
    <footer style={{ marginTop: "40px", textAlign: "center" }}>
      <p>Tasks remaining: {incompleteCount}</p>

      {incompleteCount > 0 ? (
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {incompleteTasks.map((task) => (
            <li key={task.id}>{task.text}</li>
          ))}
        </ul>
      ) : (
        <p>All tasks completed 🎉</p>
      )}

      <p>&copy; {year}</p>
    </footer>
  );
}

export default Footer;
