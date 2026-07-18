import { useState } from "react";

function CreateGroupModal({
  isOpen,
  onClose,
  onCreate,
}) {
  const [name, setName] = useState("");
  const [members, setMembers] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const memberArray = members
      .split(",")
      .map((m) => m.trim())
      .filter((m) => m !== "");

    onCreate({
      name,
      members: memberArray,
    });

    setName("");
    setMembers("");

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl p-8 w-[450px] shadow-xl">

        <h2 className="text-2xl font-bold mb-6">
          Create Group
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <div>

            <label className="font-medium">
              Group Name
            </label>

            <input
              className="w-full border rounded-lg p-3 mt-2"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
            />

          </div>

          <div>

            <label className="font-medium">
              Members
            </label>

            <textarea
              rows="4"
              className="w-full border rounded-lg p-3 mt-2"
              placeholder="Lavanya, Ayush, Rahul"
              value={members}
              onChange={(e) =>
                setMembers(e.target.value)
              }
            />

          </div>

          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-gray-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-emerald-600 text-white"
            >
              Create Group
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default CreateGroupModal;