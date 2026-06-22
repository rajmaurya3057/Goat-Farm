export function getErrorMessage(error, fallback = 'Something went wrong') {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return fallback;
}

export function formatRole(role) {
  if (!role) return '';
  return role.charAt(0) + role.slice(1).toLowerCase();
}
