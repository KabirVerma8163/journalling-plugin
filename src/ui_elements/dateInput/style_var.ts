export let date_range_picker_style = `
.date-range-picker {
  position: absolute;
  z-index: 1000;
  background: var(--background-primary);
  border: 1px solid var(--background-modifier-border);
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: none;
  padding: 12px;
  width: 280px;
}

.date-range-picker.visible {
  display: block;
}

.date-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.month-year {
  font-size: 1.1em;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 5px;
  position: relative;
}

.month-year-dropdown {
  background: var(--background-primary);
  border: 1px solid var(--background-modifier-border);
  color: var(--text-normal);
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;

  position: absolute;
  z-index: 100000000; /* Ensure it stays on top */
}

.month-year-dropdown:focus-within {
  outline: 1px solid var(--interactive-accent);
}

.nav-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
  color: var(--text-normal);
  padding: 5px 10px;
  border-radius: 4px;
}

.nav-btn:hover {
  color: var(--interactive-accent);
  background: var(--background-modifier-hover);
}

.calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  text-align: center;
}

.day-header {
  font-weight: bold;
  padding: 5px 0;
  color: var(--text-muted);
  font-size: 0.85em;
  text-transform: uppercase;
}

.day {
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 0.9em;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20px;
  width: 20px;
  margin: 2px auto;
}

.day:hover {
  background-color: var(--background-modifier-hover);
}

.day.selected-start {
  background-color: var(--interactive-accent);
  color: var(--text-on-accent);
}

.day.selected-end {
  background-color: var(--interactive-accent);
  color: var(--text-on-accent);
}

.day.in-range {
  background-color: var(--interactive-accent-hover);
}

.day.different-month {
  color: var(--text-faint);
}

.day.today {
  border: 1px solid var(--interactive-accent);
}

.button-container {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
}

.toggle-inputs {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.date-toggle {
  padding: 6px 12px;
  cursor: pointer;
  border-radius: 4px;
  flex: 1;
  text-align: center;
  color: var(--text-normal);
  border: 1px solid var(--background-modifier-border);
}

.date-toggle.active {
  background-color: var(--interactive-accent);
  color: var(--text-on-accent);
}
`