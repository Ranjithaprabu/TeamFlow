import "./App.css";
import { useEffect, useState } from "react";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "./api/projects";
import { getTasks, createTask, updateTask, deleteTask } from "./api/tasks";
function App() {
  const [taskProjectFilter, setTaskProjectFilter] = useState("All");
  const [taskStatusFilter, setTaskStatusFilter] = useState("All");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskProjectId, setTaskProjectId] = useState("");
  const [taskStatus, setTaskStatus] = useState("Todo");
  const [taskFormError, setTaskFormError] = useState("");
  const [taskSaving, setTaskSaving] = useState(false);

  useEffect(() => {
    const loadTasks = async () => {
      setTasksLoading(true);
      setTasksError("");

      try {
        const data = await getTasks();
        setTasks(data);
      } catch (err) {
        setTasksError(
          "Failed to load tasks. Check whether the backend is running."
        );
      } finally {
        setTasksLoading(false);
      }
    };

    loadTasks();
  }, []);
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (err) {
        setError(
          "Failed to load projects. Check whether the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects
    .filter((project) =>
      project.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name-asc") {
        return a.name.localeCompare(b.name);
      }

      if (sortBy === "name-desc") {
        return b.name.localeCompare(a.name);
      }

      return new Date(b.created_at) - new Date(a.created_at);
    });
  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      taskStatusFilter === "All" || task.status === taskStatusFilter;

    const matchesProject =
      taskProjectFilter === "All" ||
      String(task.project_id) === taskProjectFilter;

    return matchesStatus && matchesProject;
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");

    try {
      if (editingId !== null) {
        const updatedProject = await updateProject(editingId, {
          name,
          description,
        });

        setProjects((currentProjects) =>
          currentProjects.map((project) =>
            project.id === updatedProject.id ? updatedProject : project
          )
        );
      } else {
        const newProject = await createProject({
          name,
          description,
        });

        setProjects((currentProjects) => [...currentProjects, newProject]);
      }

      setName("");
      setDescription("");
      setEditingId(null);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save project.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (project) => {
    setEditingId(project.id);
    setName(project.name);
    setDescription(project.description || "");
    setFormError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setFormError("");
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) return;

    setFormError("");

    try {
      await deleteProject(id);

      setProjects((currentProjects) =>
        currentProjects.filter((project) => project.id !== id)
      );

      if (editingId === id) {
        handleCancelEdit();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to delete project.");
    }
  };

  const handleTaskSubmit = async (event) => {
    event.preventDefault();
    setTaskSaving(true);
    setTaskFormError("");

    try {
      const newTask = await createTask({
        project_id: Number(taskProjectId),
        title: taskTitle,
        description: taskDescription,
        status: taskStatus,
      });

      setTasks((currentTasks) => [...currentTasks, newTask]);

      setTaskTitle("");
      setTaskDescription("");
      setTaskProjectId("");
      setTaskStatus("Todo");
    } catch (err) {
      setTaskFormError(err.response?.data?.message || "Failed to create task.");
    } finally {
      setTaskSaving(false);
    }
  };

  const handleTaskStatusChange = async (task, newStatus) => {
    setTaskFormError("");

    try {
      const updatedTask = await updateTask(task.id, {
        project_id: task.project_id,
        title: task.title,
        description: task.description || "",
        status: newStatus,
      });

      setTasks((currentTasks) =>
        currentTasks.map((item) =>
          item.id === updatedTask.id ? updatedTask : item
        )
      );
    } catch (err) {
      setTaskFormError(
        err.response?.data?.message || "Failed to update task status."
      );
    }
  };

  const handleTaskDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    try {
      await deleteTask(id);

      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
    } catch (err) {
      setTaskFormError(err.response?.data?.message || "Failed to delete task.");
    }
  };

  if (loading) {
    return (
      <main className="dashboard">
        <p>Loading projects...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard">
        <p className="error-message">{error}</p>
      </main>
    );
  }

  const totalProjects = projects.length;
  const totalTasks = tasks.length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const completedTasks = tasks.filter((task) => task.status === "Done").length;
  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <h1>TeamFlow</h1>
        <p>Organize your work. Manage your projects. Stay on track.</p>
      </header>

      {/* Dashboard summary cards */}
      <section className="dashboard-stats">
        <article className="stat-card">
          <h3>Total Projects</h3>
          <p>{totalProjects}</p>
        </article>

        <article className="stat-card">
          <h3>Total Tasks</h3>
          <p>{totalTasks}</p>
        </article>

        <article className="stat-card">
          <h3>In Progress</h3>
          <p>{inProgressTasks}</p>
        </article>

        <article className="stat-card">
          <h3>Completed</h3>
          <p>{completedTasks}</p>
        </article>
      </section>

      <section className="project-form">
        <h2>{editingId !== null ? "Edit Project" : "Create a Project"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="project-name">Project name</label>
            <input
              id="project-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter project name"
              required
              maxLength={150}
            />
          </div>

          <div className="form-field">
            <label htmlFor="project-description">Description</label>
            <textarea
              id="project-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe your project"
            />
          </div>

          {formError && (
            <p className="error-message" role="alert">
              {formError}
            </p>
          )}

          <div className="button-group">
            <button className="primary-button" type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId !== null
                ? "Update project"
                : "Create project"}
            </button>

            {editingId !== null && (
              <button
                className="edit-button"
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="projects-section">
        <section className="project-form">
          <h2>Create a Task</h2>

          <form onSubmit={handleTaskSubmit}>
            <div className="form-field">
              <label htmlFor="task-title">Task title</label>
              <input
                id="task-title"
                type="text"
                value={taskTitle}
                onChange={(event) => setTaskTitle(event.target.value)}
                placeholder="Enter task title"
                required
                maxLength={150}
              />
            </div>

            <div className="form-field">
              <label htmlFor="task-description">Description</label>
              <textarea
                id="task-description"
                value={taskDescription}
                onChange={(event) => setTaskDescription(event.target.value)}
                placeholder="Describe the task"
              />
            </div>

            <div className="form-field">
              <label htmlFor="task-project">Project</label>
              <select
                id="task-project"
                value={taskProjectId}
                onChange={(event) => setTaskProjectId(event.target.value)}
                required
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="task-status">Status</label>
              <select
                id="task-status"
                value={taskStatus}
                onChange={(event) => setTaskStatus(event.target.value)}
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            {taskFormError && (
              <p className="error-message" role="alert">
                {taskFormError}
              </p>
            )}

            <button
              className="primary-button"
              type="submit"
              disabled={taskSaving || projects.length === 0}
            >
              {taskSaving ? "Saving..." : "Create task"}
            </button>

            {projects.length === 0 && (
              <p>Create a project first before adding tasks.</p>
            )}
          </form>
        </section>

        <h2 className="projects-heading">Your Projects ({projects.length})</h2>

        <div className="form-field">
          <label htmlFor="project-search">Search projects</label>
          <input
            id="project-search"
            type="search"
            placeholder="Search by project name..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <div className="form-field">
            <label htmlFor="project-sort">Sort projects</label>
            <select
              id="project-sort"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="newest">Newest first</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="empty-state">
            <h3>
              {projects.length === 0
                ? "No projects yet"
                : "No matching projects"}
            </h3>

            <p>
              {projects.length === 0
                ? "Create your first project using the form above."
                : "Try another search term."}
            </p>
          </div>
        ) : (
          <div className="project-list">
            {filteredProjects.map((project) => (
              <article key={project.id} className="project-card">
                <h3>{project.name}</h3>

                <p>{project.description || "No description provided."}</p>

                <div className="button-group">
                  <button
                    className="edit-button"
                    type="button"
                    onClick={() => handleEdit(project)}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-button"
                    type="button"
                    onClick={() => handleDelete(project.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="projects-section">
        <h2 className="projects-heading">Your Tasks ({tasks.length})</h2>
        <div className="form-field">
          <label htmlFor="task-status-filter">Filter by status</label>
          <div className="form-field">
            <label htmlFor="task-project-filter">Filter by project</label>

            <select
              id="task-project-filter"
              value={taskProjectFilter}
              onChange={(event) => setTaskProjectFilter(event.target.value)}
            >
              <option value="All">All projects</option>

              {projects.map((project) => (
                <option key={project.id} value={String(project.id)}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <select
            id="task-status-filter"
            value={taskStatusFilter}
            onChange={(event) => setTaskStatusFilter(event.target.value)}
          >
            <option value="All">All tasks</option>
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>

        {tasksLoading ? (
          <p>Loading tasks...</p>
        ) : tasksError ? (
          <div className="error-state">
            <p className="error-message">{tasksError}</p>
            <button type="button" onClick={loadTasks}>
              Retry
            </button>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-state">
            <h3>
              {tasks.length === 0
                ? "No tasks yet"
                : "No tasks match this status"}
            </h3>
          </div>
        ) : (
          <div className="project-list">
            {filteredTasks.map((task) => (
              <article key={task.id} className="project-card">
                <h3>{task.title}</h3>

                <p>{task.description || "No description provided."}</p>

                <p>
                  <strong>Project:</strong>{" "}
                  {task.project_name || `Project #${task.project_id}`}
                </p>

                <div className="form-field">
                  <label htmlFor={`task-status-${task.id}`}>Status</label>

                  <select
                    id={`task-status-${task.id}`}
                    value={task.status}
                    onChange={(event) =>
                      handleTaskStatusChange(task, event.target.value)
                    }
                  >
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>

                <div className="button-group">
                  <button
                    className="delete-button"
                    type="button"
                    onClick={() => handleTaskDelete(task.id)}
                  >
                    Delete task
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
