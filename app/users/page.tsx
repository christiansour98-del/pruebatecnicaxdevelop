"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  ColumnFiltersState,
} from "@tanstack/react-table";
import Link from "next/link";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

function UsersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = Number(searchParams.get("page")) || 1;
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(1);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    fetch(`/api/users?page=${page}`)
      .then((r) => r.json())
      .then((json) => {
        setUsers(json.data);
        setTotal(json.totalPages);
      });
  }, [page]);

  const columnHelper = createColumnHelper<User>();

  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("name", {
      header: "Name",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("email", {
      header: "Email",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("role", {
      header: "Role",
      filterFn: "equals",
      cell: (info) => {
        const user = info.row.original;

        async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
          const newRole = e.target.value;

          await fetch("/api/users", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: user.id, role: newRole }),
          });

          setUsers((prev) =>
            prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)),
          );
        }

        return (
          <select
            value={info.getValue()}
            onChange={handleChange}
            style={{ padding: 4 }}
          >
            <option value="admin">admin</option>
            <option value="user">user</option>
          </select>
        );
      },
    }),
    columnHelper.display({
      id: "posts",
      header: "Posts",
      cell: (info) => (
        <Link href={`/users/${info.row.original.id}/posts`}>View posts</Link>
      ),
    }),
  ];

  const table = useReactTable({
    data: users,
    columns,
    state: { columnFilters, globalFilter },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  function goTo(p: number) {
    router.push(`/users?page=${p}`);
  }

  const roles = ["all", ...Array.from(new Set(users.map((u) => u.role)))];

  function filterByRole(role: string) {
    if (role === "all") {
      setColumnFilters([]);
    } else {
      setColumnFilters([{ id: "role", value: role }]);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          placeholder="Search..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          style={{ padding: 6, flex: 1 }}
        />
        <select
          onChange={(e) => filterByRole(e.target.value)}
          style={{ padding: 6 }}
        >
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={{
                    borderBottom: "2px solid #ccc",
                    padding: "8px",
                    textAlign: "left",
                  }}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  style={{ borderBottom: "1px solid #eee", padding: "8px" }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ fontSize: 12, color: "#888" }}>
        {table.getFilteredRowModel().rows.length} of {users.length} users
      </p>

      <div>
        <button onClick={() => goTo(page - 1)} disabled={page === 1}>
          Previous
        </button>
        <span>
          {" "}
          Page {page} of {total}{" "}
        </span>
        <button onClick={() => goTo(page + 1)} disabled={page === total}>
          Next
        </button>
      </div>
    </div>
  );
}

export default function UsersPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <UsersContent />
    </Suspense>
  );
}
