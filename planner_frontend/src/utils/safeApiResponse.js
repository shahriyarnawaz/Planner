export const parseApiResponse = async (response) => {
  const rawText = await response.text();

  if (!rawText) {
    return { data: null, rawText: '' };
  }

  try {
    return { data: JSON.parse(rawText), rawText };
  } catch (error) {
    return { data: null, rawText };
  }
};

export const extractApiErrorMessage = (response, data, fallbackMessage) => {
  if (data && typeof data === 'object') {
    if (data.error) return data.error;
    if (data.detail) return data.detail;

    const firstKey = Object.keys(data)[0];
    if (firstKey) {
      const value = data[firstKey];
      if (Array.isArray(value) && value.length > 0) return String(value[0]);
      if (value !== undefined && value !== null) return String(value);
    }
  }

  if (!response.ok && response.status === 401) {
    return 'Your session has expired. Please log in again.';
  }

  return fallbackMessage;
};
