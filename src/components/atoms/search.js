"use client";
import { useState } from "react";
import { Input, Button, Card } from "@heroui/react";

export default function SearchComponent() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("student");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/search?category=${category}&query=${query}`);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      // ✅ Pastikan hasilnya selalu array
      setResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Card className="p-6 w-full max-w-lg space-y-4">
      <h2 className="text-xl font-semibold text-center">Search Data</h2>

      <div className="flex space-x-2">
        <Input
          placeholder="Enter keyword..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="border p-2 rounded-md"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="subject">Subject</option>
          <option value="class">Class</option>
        </select>
        <Button onPress={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      <div className="mt-4">
        {results.length === 0 ? (
          <p className="text-gray-500 text-center">No results found</p>
        ) : (
          <ul className="list-disc list-inside">
            {results.map((item) => (
              <li key={item.id}>{item.name || item.fullname || item.email}</li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
