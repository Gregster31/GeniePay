import React from 'react';
import { Users, User, Loader2 } from 'lucide-react';
import type { Employee } from '../../models/EmployeeModel';

interface EmployeeTableProps {
  employees: Employee[];
  payingEmployeeId: number | null;
  isSending: boolean;
  onPayEmployee: (employee: Employee) => void;
  onAddEmployee: () => void;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  payingEmployeeId,
  isSending,
  onPayEmployee,
  onAddEmployee
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg">
              <Users className="w-4 h-4" />
              All Employees ({employees.length})
            </button>
            <button 
              onClick={onAddEmployee}
              className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Users className="w-4 h-4" />
              Add Employee
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-left">
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet Address</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Salary (ETH)</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map((employee) => {
              const isPayingThisEmployee = payingEmployeeId === employee.id;
              
              return (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {employee.avatar ? (
                          <img
                            src={employee.avatar}
                            alt={employee.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="font-mono text-xs">
                      {employee.walletAddress}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {employee.salary || '0'} ETH
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => onPayEmployee(employee)}
                      disabled={isPayingThisEmployee || isSending || !employee.walletAddress || !employee.salary}
                      className={`text-blue-600 hover:text-blue-900 mr-4 flex items-center gap-1 ${
                        (isPayingThisEmployee || isSending || !employee.walletAddress || !employee.salary) 
                          ? 'opacity-50 cursor-not-allowed' 
                          : ''
                      }`}
                    >
                      {isPayingThisEmployee ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Paying...
                        </>
                      ) : (
                        'Pay'
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeTable;