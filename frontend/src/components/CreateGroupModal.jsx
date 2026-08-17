import { useState } from "react";

function CreateGroupModal({
  isOpen,
  onClose,
  onCreate,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const memberArray = members
      .split(",")
      .map((m) => m.trim())
      .filter((m) => m !== "");

    setSaving(true);

    try {
      await onCreate({
        name,
        description,
        members: memberArray,
      });

      setName("");
      setDescription("");
      setMembers("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create group");
    } finally {
      setSaving(false);
    }
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
              Description
            </label>

            <input
              className="w-full border rounded-lg p-3 mt-2"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="Optional"
            />

          </div>

          <div>

            <label className="font-medium">
              Members
            </label>

            <textarea
              rows="4"
              className="w-full border rounded-lg p-3 mt-2"
              placeholder="Emails or names of people who already have accounts"
              value={members}
              onChange={(e) =>
                setMembers(e.target.value)
              }
            />

          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

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
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-70"
            >
              {saving ? "Creating..." : "Create Group"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default CreateGroupModal;
