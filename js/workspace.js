(function () {
  window.RevistaDigital = window.RevistaDigital || {};
  const workspace = window.RevistaDigital.workspace || {};

  workspace.render = function () {
    if (typeof window.renderWorkspace === "function") {
      return window.renderWorkspace();
    }
    return null;
  };

  workspace.renderCards = function () {
    if (typeof window.renderWorkspaceCards === "function") {
      return window.renderWorkspaceCards();
    }
    return null;
  };

  workspace.edit = function (id) {
    if (typeof window.editWorkspace === "function") {
      return window.editWorkspace(id);
    }
    return null;
  };

  workspace.delete = function (id) {
    if (typeof window.deleteWorkspace === "function") {
      return window.deleteWorkspace(id);
    }
    return null;
  };

  workspace.resetForm = function () {
    if (typeof window.resetWorkspaceForm === "function") {
      return window.resetWorkspaceForm();
    }
    return null;
  };

  workspace.wire = function () {
    if (typeof window.wireWorkspace === "function") {
      return window.wireWorkspace();
    }
    return null;
  };

  workspace.getHotelNames = function () {
    if (typeof window.getHotelNames === "function") {
      return window.getHotelNames();
    }
    return [];
  };

  workspace.fileToDataURL = function (file) {
    if (typeof window.fileToDataURL === "function") {
      return window.fileToDataURL(file);
    }
    return null;
  };

  workspace.supabaseClient = function () {
    return window.supabaseClient || null;
  };

  if (typeof window.renderWorkspace !== "function") {
    window.renderWorkspace = workspace.render;
  }

  if (typeof window.renderWorkspaceCards !== "function") {
    window.renderWorkspaceCards = workspace.renderCards;
  }

  if (typeof window.editWorkspace !== "function") {
    window.editWorkspace = workspace.edit;
  }

  if (typeof window.deleteWorkspace !== "function") {
    window.deleteWorkspace = workspace.delete;
  }

  if (typeof window.resetWorkspaceForm !== "function") {
    window.resetWorkspaceForm = workspace.resetForm;
  }

  if (typeof window.wireWorkspace !== "function") {
    window.wireWorkspace = workspace.wire;
  }

  window.RevistaDigital.workspace = workspace;
})();
