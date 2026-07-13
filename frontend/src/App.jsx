import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Login from "./pages/Login";
// import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import GroupPage from "./pages/GroupPage";
import ExpensesPage from "./pages/ExpensesPage";
import TestApi from "./pages/TestApi";
import GroupsPage from "./pages/GroupsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} /> */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/group/:id" element={<GroupPage />} />
        <Route path="/expenses"element={<ExpensesPage />}/>
        <Route path="/test-api" element={<TestApi />} />
        <Route path="/groups" element={<GroupsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;