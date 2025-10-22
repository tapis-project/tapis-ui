import React, { useState, useEffect, useMemo } from "react";
import { Button } from "reactstrap";
import {
  InputLabel,
  TextField,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import styles from "./SearchBar.module.scss";

type SearchProps = {
  models: Array<{ [key: string]: any }>;
  onFilter: (filteredModels: Array<{ [key: string]: any }>) => void;
};

const SearchBar: React.FC<SearchProps> = ({ models, onFilter }) => {
  const [idSearch, setIdSearch] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<string>("");

  // Extract unique tasks from models
  const availableTasks = useMemo(() => {
    const tasks = new Set<string>();
    models.forEach((model) => {
      if (model.pipeline_tag) {
        tasks.add(model.pipeline_tag);
      }
    });
    return Array.from(tasks).sort();
  }, [models]);

  // Apply filters whenever inputs change
  useEffect(() => {
    const filtered = models.filter((model) => {
      // Filter by ID (contains search)
      if (idSearch) {
        const modelId = model.id?.toString().toLowerCase() || "";
        if (!modelId.includes(idSearch.toLowerCase())) {
          return false;
        }
      }

      // Filter by Task
      if (selectedTask) {
        if (model.pipeline_tag !== selectedTask) {
          return false;
        }
      }

      return true;
    });

    onFilter(filtered);
  }, [idSearch, selectedTask, models, onFilter]);

  const handleClear = () => {
    setIdSearch("");
    setSelectedTask("");
  };

  return (
    <div className={`${styles["searchBar"]} mb-3`}>
      <TextField
        label="ID"
        name="idSearch"
        placeholder="Search by ID (contains)"
        value={idSearch}
        onChange={(e) => setIdSearch(e.target.value)}
        size="small"
        margin="normal"
        sx={{ minWidth: 250 }}
      />

      <FormControl variant="outlined" margin="normal" sx={{ minWidth: 250 }}>
        <InputLabel size="small" id="task-label">
          Task
        </InputLabel>
        <Select
          label="Task"
          labelId="task-label"
          size="small"
          name="task"
          value={selectedTask}
          onChange={(e) => setSelectedTask(e.target.value as string)}
        >
          {availableTasks.map((task) => (
            <MenuItem key={task} value={task}>
              {task}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <div className={styles["button-container"]}>
        <Button
          color="secondary"
          size="sm"
          onClick={handleClear}
          disabled={!idSearch && !selectedTask}
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
