import React from 'react';
import { 
  Plus, 
  Search, 
  Download, 
  Upload, 
  Filter,
  AlertCircle
} from 'lucide-react';
import { useTeamManagement } from './hooks/useTeamManagement';
import { TeamTable } from './components/TeamTable';
import { EmployeeDetailDrawer } from './components/EmployeeDetailDrawer';
import { EmployeeFormModal } from './components/EmployeeFormModal';

const Team: React.FC = () => {
  const {
    employees,
    allEmployees,
    selectedEmployee,
    showAddModal,
    showEditModal,
    showEmployeeDetail,
    searchTerm,
    filterDepartment,
    filterEmploymentType,
    currentPage,
    totalPages,
    totalEmployees,
    departments,
    employmentTypes,
    fileInputRef,
    isLoading,
    isAddingEmployee,
    isUpdatingEmployee,
    isDeletingEmployee,
    error,
    setSearchTerm,
    setFilterDepartment,
    setFilterEmploymentType,
    setCurrentPage,
    handleAddEmployee,
    handleUpdateEmployee,
    handleDeleteEmployee,
    handleViewEmployee,
    handleEditEmployee,
    handleCloseDetail,
    handleSort,
    handleExportCSV,
    handleImportCSV,
    setShowAddModal,
    setShowEditModal,
    sortBy,
    sortOrder,
  } = useTeamManagement();

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600">Manage your employees and contractors</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          
          <button
            onClick={handleExportCSV}
            disabled={isLoading || allEmployees.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          
          <button
            onClick={() => setShowAddModal(true)}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Error Loading Team Data</span>
          </div>
          <p className="text-red-700 mt-1">{error.message}</p>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Employees
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map((department: string) => (
                <option key={department} value={department}>{department}</option>
              ))}
            </select>
          </div>

          {/* Employment Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employment Type
            </label>
            <select
              value={filterEmploymentType}
              onChange={(e) => setFilterEmploymentType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              {employmentTypes.map((type: string) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <Filter className="w-4 h-4 mr-2" />
            {totalEmployees} team member{totalEmployees !== 1 ? 's' : ''} found
          </div>
          
          {(searchTerm || filterDepartment || filterEmploymentType) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterDepartment('');
                setFilterEmploymentType('');
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Team Table */}
      <TeamTable
        employees={employees}
        onViewEmployee={handleViewEmployee}
        onEditEmployee={handleEditEmployee}
        onDeleteEmployee={handleDeleteEmployee}
        onSort={handleSort}
        sortBy={sortBy}
        sortOrder={sortOrder}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        isLoading={isLoading}
        isDeleting={isDeletingEmployee}
        error={error}
      />

      {/* Employee Detail Drawer */}
      {showEmployeeDetail && selectedEmployee && (
        <EmployeeDetailDrawer
          employee={selectedEmployee}
          onClose={handleCloseDetail}
          onEdit={() => handleEditEmployee(selectedEmployee)}
          onDelete={() => handleDeleteEmployee(selectedEmployee.id)}
        />
      )}

      {/* Add Employee Modal */}
      <EmployeeFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddEmployee}
        title="Add New Team Member"
        isLoading={isAddingEmployee}
      />

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployee && (
        <EmployeeFormModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
          }}
          onSave={handleUpdateEmployee}
          employee={selectedEmployee}
          title="Edit Team Member"
          isLoading={isUpdatingEmployee}
        />
      )}

      {/* Hidden file input for CSV import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleImportCSV}
        className="hidden"
      />
    </div>
  );
};

export default Team;