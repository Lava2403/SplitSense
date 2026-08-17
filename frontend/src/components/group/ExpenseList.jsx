import { useEffect, useState } from "react";
import ExpenseCard from "./ExpenseCard";

function ExpenseList({ expenses, onEdit, onDelete }) {
  const [expenseList, setExpenseList] = useState(expenses || []);

  useEffect(() => {
    setExpenseList(expenses || []);
  }, [expenses]);

  const handleDelete = async (id) => {
    if (onDelete) {
      await onDelete(id);
      return;
    }

    setExpenseList(expenseList.filter((expense) => expense.id !== id));
  };

  const handleEdit = (expense) => {
    if (onEdit) {
      onEdit(expense);
      return;
    }

    const newTitle = prompt("Edit Expense Name", expense.title);

    if (!newTitle) return;

    setExpenseList(
      expenseList.map((item) =>
        item.id === expense.id
          ? {
              ...item,
              title: newTitle,
            }
          : item
      )
    );
  };

  return (
    <div className="space-y-4">
      {expenseList.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
          No expenses added yet.
        </div>
      ) : (
        expenseList.map((expense) => (
          <ExpenseCard
            key={expense.id}
            expense={expense}
            onEdit={() => handleEdit(expense)}
            onDelete={() => handleDelete(expense.id)}
          />
        ))
      )}
    </div>
  );
}

export default ExpenseList;
