import { useEffect, useState } from "react";
import { getExpenses } from "../api/expenseApi";

function TestApi() {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    async function loadExpenses() {
      const res = await getExpenses();
      setExpenses(res.data);
    }

    loadExpenses();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-5">
        Backend Test
      </h1>

      {expenses.map((expense) => (
        <div
          key={expense.id}
          className="border rounded-lg p-4 mb-4"
        >
          <h2>{expense.title}</h2>

          <p>₹{expense.amount}</p>

          <p>{expense.group}</p>
        </div>
      ))}
    </div>
  );
}

export default TestApi;