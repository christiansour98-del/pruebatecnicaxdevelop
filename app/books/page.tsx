"use client";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

type Book = {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
};

type SearchResponse = {
  docs: Book[];
  numFound: number;
};

async function searchBooks(
  query: string,
  page: number,
  author: string,
  year: string,
): Promise<SearchResponse> {
  const params = new URLSearchParams();
  params.set("q", query || "javascript");
  params.set("page", String(page));
  params.set("limit", "10");
  if (author) params.set("author", author);
  if (year) params.set("first_publish_year", year);

  const res = await fetch(`https://openlibrary.org/search.json?${params}`);
  if (!res.ok) throw new Error("Failed to fetch books");
  return res.json();
}

export default function BooksPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = Number(searchParams.get("page")) || 1;
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [author, setAuthor] = useState(searchParams.get("author") || "");
  const [year, setYear] = useState(searchParams.get("year") || "");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [inputQuery, setInputQuery] = useState(query);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["books", query, page, author, year],
    queryFn: () => searchBooks(query, page, author, year),
    enabled: !!query,
  });

  function handleSearch() {
    setQuery(inputQuery);
    goTo(1, inputQuery, author, year);
  }

  function goTo(p: number, q = query, a = author, y = year) {
    const params = new URLSearchParams();
    params.set("page", String(p));
    if (q) params.set("q", q);
    if (a) params.set("author", a);
    if (y) params.set("year", y);
    router.push(`/books?${params}`);
  }

  function handleAuthorChange(val: string) {
    setAuthor(val);
    goTo(1, query, val, year);
  }

  function handleYearChange(val: string) {
    setYear(val);
    goTo(1, query, author, val);
  }

  const totalPages = data ? Math.ceil(data.numFound / 10) : 1;

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1>Book search</h1>

      {/* Search bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          placeholder="Search books..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          style={{ flex: 1, padding: 8, fontSize: 15 }}
        />
        <button onClick={handleSearch} style={{ padding: "8px 16px" }}>
          Search
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input
          placeholder="Filter by author..."
          value={author}
          onChange={(e) => handleAuthorChange(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        <input
          placeholder="Filter by year..."
          value={year}
          type="number"
          onChange={(e) => handleYearChange(e.target.value)}
          style={{ width: 160, padding: 8 }}
        />
      </div>

      {/* Results */}
      {isLoading && <p>Searching...</p>}
      {isError && <p style={{ color: "red" }}>Error fetching books.</p>}
      {data && (
        <p style={{ color: "#888", marginBottom: 12, fontSize: 13 }}>
          {data.numFound.toLocaleString()} results
        </p>
      )}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {data?.docs.map((book) => (
          <li
            key={book.key}
            onClick={() => setSelectedBook(book)}
            style={{
              display: "flex",
              gap: 16,
              padding: "12px 0",
              borderBottom: "1px solid #eee",
              cursor: "pointer",
            }}
          >
            {/* Cover */}
            {book.cover_i ? (
              <img
                src={`https://covers.openlibrary.org/b/id/${book.cover_i}-S.jpg`}
                alt={book.title}
                style={{ width: 50, height: 70, objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: 50,
                  height: 70,
                  background: "#eee",
                  flexShrink: 0,
                }}
              />
            )}

            {/* Info */}
            <div>
              <strong>{book.title}</strong>
              <p style={{ color: "#666", margin: "4px 0", fontSize: 13 }}>
                {book.author_name?.join(", ")}
              </p>
              {book.first_publish_year && (
                <p style={{ color: "#aaa", fontSize: 12 }}>
                  First published: {book.first_publish_year}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Pagination */}
      {data && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 20,
          }}
        >
          <button onClick={() => goTo(page - 1)} disabled={page === 1}>
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button onClick={() => goTo(page + 1)} disabled={page >= totalPages}>
            Next
          </button>
        </div>
      )}

      {/* Book detail modal */}
      {selectedBook && (
        <div
          onClick={() => setSelectedBook(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 32,
              maxWidth: 500,
              width: "90%",
            }}
          >
            <div style={{ display: "flex", gap: 20 }}>
              {selectedBook.cover_i ? (
                <img
                  src={`https://covers.openlibrary.org/b/id/${selectedBook.cover_i}-M.jpg`}
                  alt={selectedBook.title}
                  style={{
                    width: 100,
                    height: 150,
                    objectFit: "cover",
                    borderRadius: 6,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 100,
                    height: 150,
                    background: "#eee",
                    borderRadius: 6,
                  }}
                />
              )}

              <div>
                <h2 style={{ margin: "0 0 8px" }}>{selectedBook.title}</h2>
                <p style={{ color: "#666" }}>
                  {selectedBook.author_name?.join(", ")}
                </p>
                {selectedBook.first_publish_year && (
                  <p style={{ color: "#aaa", fontSize: 13 }}>
                    First published: {selectedBook.first_publish_year}
                  </p>
                )}

                <a
                  href={`https://openlibrary.org${selectedBook.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    marginTop: 16,
                    color: "#185FA5",
                  }}
                >
                  View on Open Library
                </a>
              </div>
            </div>

            <button
              onClick={() => setSelectedBook(null)}
              style={{ marginTop: 24, padding: "8px 16px", width: "100%" }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
