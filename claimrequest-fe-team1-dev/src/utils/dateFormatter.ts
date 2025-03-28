export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-GB");
};

export const formatDateToYYYYMMDD = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}-${month}-${day}`;
};
