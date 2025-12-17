export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    'Active': 'bg-green-100 text-green-800',
    'Inactive': 'bg-yellow-100 text-yellow-800',
    'Terminated': 'bg-red-100 text-red-800',
    'On Leave': 'bg-gray-100 text-gray-800',
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};