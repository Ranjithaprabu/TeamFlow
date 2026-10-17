import axios from "axios";

const API_URL = "http://localhost:5000/api/projects";

export const getProjects = async () => {
  const response = await axios.get(API_URL);
  return response.data.data;
};

export const createProject = async (projectData) => {
  const response = await axios.post(API_URL, projectData);
  return response.data.data;
};

export const updateProject = async (id, projectData) => {
  const response = await axios.put(`${API_URL}/${id}`, projectData);

  return response.data.data;
};

export const deleteProject = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
