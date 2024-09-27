"use client";

import {
  useState,
  useEffect,
  AwaitedReactNode,
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
} from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AddFormModal } from "./AddFormModal";
import { getExpenses, createExpense } from "@/lib/api/expenseClient"; // API Funktionen
import { useSession } from "next-auth/react";

interface ExpensesTableProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  debouncedSearchTerm: string;
  handleAddNewClick: () => void;
  handleViewDetails: (item: any) => void;
  handleViewBills: (item: any) => void;
}

export default function ExpensesTable({
  searchTerm,
  setSearchTerm,
  debouncedSearchTerm,
  handleAddNewClick,
  handleViewDetails,
  handleViewBills,
}: ExpensesTableProps) {
  const [filteredReimbursements, setFilteredReimbursements] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { data: session } = useSession();

  // Abrufen der Daten aus der API
  useEffect(() => {
    const fetchExpenses = async () => {
      setIsLoading(true);
      try {
        const expensesData = await getExpenses();

        const reimbursementExpenses = expensesData.filter(
          (item: any) => item.category === "reimbursement"
        );

        setFilteredReimbursements(reimbursementExpenses);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  // Filtern der Daten basierend auf der Suche
  const filteredResults = filteredReimbursements.filter(
    (item: any) =>
      item.description
        .toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase()) ||
      item.project.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  // Handler für das Erstellen einer neuen Auslage
  const handleFormSubmit = async (formData: any) => {
    try {
      const newExpense = await createExpense(formData);
      setFilteredReimbursements((prevExpenses: any) => [
        ...prevExpenses,
        newExpense,
      ]);
    } catch (error) {
      console.error("Error creating expense:", error);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <Input
          placeholder="Suchen nach Auslagen oder Projekten..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-background"
        />
        <AddFormModal
          activeTab="expenses"
          setShowAddForm={handleAddNewClick}
          handleFormSubmit={handleFormSubmit}
        />
      </div>

      {isLoading ? (
        <p>Lade Auslagen...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Betrag</TableHead>
              <TableHead>Projekt</TableHead>
              <TableHead>
                <span className="sr-only">Aktionen</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResults.map(
              (item: {
                id: Key | null | undefined;
                description:
                  | string
                  | number
                  | bigint
                  | boolean
                  | ReactElement<any, string | JSXElementConstructor<any>>
                  | Iterable<ReactNode>
                  | ReactPortal
                  | Promise<AwaitedReactNode>
                  | null
                  | undefined;
                status:
                  | string
                  | number
                  | bigint
                  | boolean
                  | ReactElement<any, string | JSXElementConstructor<any>>
                  | Iterable<ReactNode>
                  | Promise<AwaitedReactNode>
                  | null
                  | undefined;
                createdAt: string | number | Date;
                amount: {
                  toLocaleString: () =>
                    | string
                    | number
                    | bigint
                    | boolean
                    | ReactElement<any, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | ReactPortal
                    | Promise<AwaitedReactNode>
                    | null
                    | undefined;
                };
                project: {
                  name:
                    | string
                    | number
                    | bigint
                    | boolean
                    | ReactElement<any, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | ReactPortal
                    | Promise<AwaitedReactNode>
                    | null
                    | undefined;
                };
              }) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>
                    <Badge
                      className={`${
                        item.status === "Approved"
                          ? "bg-green-100 text-green-800"
                          : item.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      } text-xs`}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(item.createdAt).toLocaleDateString("de-DE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell>{item.amount.toLocaleString()} €</TableCell>
                  <TableCell>{item.project.name}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(item)}
                      >
                        Ansehen
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewBills(item)}
                      >
                        Rechnungen
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
