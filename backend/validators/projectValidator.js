
function validateProjectName(name) {
    if (typeof name !== "string" || !name.trim()) {
      return "Project name is required";
    }
  
    if (name.trim().length > 150) {
      return "Project name cannot exceed 150 characters";
    }
  
    return null;
  }
  
  module.exports = validateProjectName;
  