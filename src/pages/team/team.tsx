
import React from 'react';
import { 
  Plus, 
  Search, 
  Download, 
  Upload, 
  Filter
} from 'lucide-react';
import { useTeamManagement } from './hooks/useTeamManagement';
import { TeamTable } from './components/TeamTable';
import { EmployeeDetailDrawer } from './components/EmployeeDetailDrawer';
import { EmployeeFormModal } from './components/EmployeeFormModal';

const Team: React.FC = () => {
  const {
    employees,
    selectedEmployee,
    showAddModal,
    showEditModal,
    showEmployeeDetail,
    searchTerm,
    filterDepartment,
    filterStatus,
    currentPage,
    totalPages,
    totalEmployees,
    departments,
    statuses,
    fileInputRef,
    setSearchTerm,
    setFilterDepartment,
    setFilterStatus,
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
          <p className="text-gray-600">Manage your employees and team members</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Department Filter */}
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          {/* Results Count */}
          <div className="flex items-center text-sm text-gray-600">
            <Filter className="w-4 h-4 mr-2" />
            {totalEmployees} employees found
          </div>
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
        title="Add New Employee"
      />

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployee && (
        <EmployeeFormModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            // Don't clear selectedEmployee here in case detail drawer is still open
          }}
          onSave={handleUpdateEmployee}
          employee={selectedEmployee}
          title="Edit Employee"
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