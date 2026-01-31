// import-export.js - JSON Import/Export functionality

// Export current bookmarks as JSON file
async function exportBookmarks() {
  const data = await loadData();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `quick-bookmarks-${timestamp}.json`;

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Validate imported data structure
function validateImportData(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid JSON data' };
  }

  if (!data.version || typeof data.version !== 'number') {
    return { valid: false, error: 'Missing or invalid version field' };
  }

  if (!Array.isArray(data.categories)) {
    return { valid: false, error: 'Missing or invalid categories array' };
  }

  // Validate each category
  for (const category of data.categories) {
    if (!category.id || !category.name || typeof category.order !== 'number') {
      return { valid: false, error: 'Invalid category structure' };
    }

    if (!Array.isArray(category.links)) {
      return { valid: false, error: 'Invalid links array in category' };
    }

    // Validate each link
    for (const link of category.links) {
      if (!link.id || !link.title || !link.url || typeof link.order !== 'number') {
        return { valid: false, error: 'Invalid link structure' };
      }
    }
  }

  if (!data.settings || typeof data.settings !== 'object') {
    return { valid: false, error: 'Missing or invalid settings object' };
  }

  return { valid: true };
}

// Import bookmarks from JSON file
async function importBookmarks() {
  const fileInput = document.getElementById('import-file-input');

  return new Promise((resolve, reject) => {
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) {
        resolve(false);
        return;
      }

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        // Validate data
        const validation = validateImportData(data);
        if (!validation.valid) {
          alert(`Import failed: ${validation.error}`);
          resolve(false);
          return;
        }

        // Confirm overwrite
        const confirmed = await showConfirmDialog(
          'This will replace all your current bookmarks. Continue?'
        );

        if (!confirmed) {
          resolve(false);
          return;
        }

        // Save imported data
        await saveData(data);

        // Reload page to show new data
        window.location.reload();
        resolve(true);
      } catch (error) {
        alert(`Import failed: ${error.message}`);
        resolve(false);
      } finally {
        // Reset file input
        fileInput.value = '';
      }
    };

    // Trigger file picker
    fileInput.click();
  });
}
